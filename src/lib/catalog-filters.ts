import type { GetProductsParams, ProductSort } from "@/lib/data/products";

// ---------------------------------------------------------------------------
// catalog-filters — the catalogue's filter state as it lives in the URL.
//
// parseFilters turns search params into a typed CatalogFilters with safe
// defaults, and toGetProductsParams turns that into the parameters of
// getProducts. Pure functions, no I/O, safe to import from client code.
//
// URL params (a list can be repeated, comma-separated, or both):
//   group=<group slug>        category=<category slug>   brand=<brand name>
//   minPrice=<kr>  maxPrice=<kr>  minRating=<0-5>
//   inStock=true   sale=true      sort=newest|discount_percentage|rating
// ---------------------------------------------------------------------------

export interface CatalogFilters {
  /** Slug of a nav group (see nav-groups.ts), or null. */
  group: string | null;
  /** Category slugs. */
  categories: string[];
  /** Whole kronor on the price the card shows; undefined when not set. */
  minPrice: number | undefined;
  maxPrice: number | undefined;
  /** 0-5; undefined when not set. */
  minRating: number | undefined;
  brands: string[];
  inStock: boolean;
  sale: boolean;
  sort: ProductSort;
}

export type SearchParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

const SORT_VALUES: readonly ProductSort[] = ["newest", "discount_percentage", "rating"];

// Upper bound on list params, so a crafted URL cannot build a huge query.
const MAX_LIST_ITEMS = 50;

export const DEFAULT_FILTERS: CatalogFilters = {
  group: null,
  categories: [],
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  brands: [],
  inStock: false,
  sale: false,
  sort: "newest",
};

function getAll(params: SearchParamsInput, key: string): string[] {
  const raw =
    params instanceof URLSearchParams
      ? params.getAll(key)
      : ([] as string[]).concat(params[key] ?? []);
  return raw;
}

function getFirst(params: SearchParamsInput, key: string): string | undefined {
  return getAll(params, key)[0];
}

function getList(params: SearchParamsInput, key: string): string[] {
  const items = getAll(params, key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set(items)].slice(0, MAX_LIST_ITEMS);
}

// A finite number >= 0, or undefined. "", "abc", "-5" and "1e999" are ignored.
function parseNumber(value: string | undefined): number | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function parseFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

/**
 * Reads the catalogue filters from URL params. Never throws: anything that
 * is missing or invalid falls back to the default (no filter, `newest`).
 * Prices are rounded to whole kronor, ratings above 5 are ignored, and a
 * min price above the max price is swapped rather than matching nothing.
 */
export function parseFilters(searchParams: SearchParamsInput): CatalogFilters {
  let minPrice = parseNumber(getFirst(searchParams, "minPrice"));
  let maxPrice = parseNumber(getFirst(searchParams, "maxPrice"));
  if (minPrice !== undefined) minPrice = Math.round(minPrice);
  if (maxPrice !== undefined) maxPrice = Math.round(maxPrice);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const rating = parseNumber(getFirst(searchParams, "minRating"));
  const sort = getFirst(searchParams, "sort");

  return {
    group: getFirst(searchParams, "group")?.trim() || null,
    categories: getList(searchParams, "category"),
    minPrice,
    maxPrice,
    minRating: rating !== undefined && rating <= 5 ? rating : undefined,
    brands: getList(searchParams, "brand"),
    inStock: parseFlag(getFirst(searchParams, "inStock")),
    sale: parseFlag(getFirst(searchParams, "sale")),
    sort: SORT_VALUES.find((value) => value === sort) ?? DEFAULT_FILTERS.sort,
  };
}

export interface ToGetProductsParamsOptions {
  /** Category rows, used to turn the slugs in the filters into ids. */
  categories: { id: number; slug: string }[];
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Converts CatalogFilters into getProducts parameters. Category slugs that do
 * not match any row in `options.categories` are ignored, so an unknown slug
 * behaves like no category filter instead of an empty page.
 *
 * `filters.group` is not resolved yet: it needs NAV_GROUPS from
 * src/lib/nav-groups.ts, which is not on this branch. Once it is, map the
 * group's categorySlugs to ids here and merge them into `categoryIds`.
 */
export function toGetProductsParams(
  filters: CatalogFilters,
  options: ToGetProductsParamsOptions,
): GetProductsParams {
  const idBySlug = new Map(options.categories.map((c) => [c.slug, c.id]));
  const categoryIds = filters.categories
    .map((slug) => idBySlug.get(slug))
    .filter((id): id is number => id !== undefined);

  return {
    page: options.page,
    limit: options.limit,
    search: options.search,
    sort: filters.sort,
    categoryIds: categoryIds.length ? categoryIds : undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    brands: filters.brands.length ? filters.brands : undefined,
    inStock: filters.inStock || undefined,
    sale: filters.sale || undefined,
  };
}
