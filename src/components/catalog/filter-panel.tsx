"use client";

import { useId, useState } from "react";
import { ChevronUp, SlidersHorizontal, Truck } from "lucide-react";

// ---------------------------------------------------------------------------
// FilterPanel — the catalogue's left filter sidebar.
//
// Presentational only: every selected value and every list comes in through
// props and every change goes out through an onChange callback. The only
// state kept here is UI state (open/closed sections, "show more" brands and
// the text being typed into a price field). No data fetching, no URL logic.
// ---------------------------------------------------------------------------

/** A category group heading and the category slugs listed under it. */
export type NavGroupProp = { title: string; categorySlugs: string[] };

export interface FilterCategory {
  slug: string;
  name: string;
  /** Number of matching products, shown to the right of the name. */
  count?: number;
}

export interface FilterBrand {
  name: string;
  /** Number of matching products, shown to the right of the name. */
  count?: number;
}

export interface PriceBounds {
  min: number;
  max: number;
}

export interface FilterPanelProps {
  /** Group headings for the category section (see NavGroupProp). */
  groups: NavGroupProp[];
  categories: FilterCategory[];
  brands: FilterBrand[];

  selectedCategorySlugs: string[];
  onCategoriesChange: (slugs: string[]) => void;

  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;

  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;

  onSale: boolean;
  onOnSaleChange: (value: boolean) => void;

  /** Lowest and highest price the sliders can reach. */
  priceBounds: PriceBounds;
  priceMin: number;
  priceMax: number;
  onPriceChange: (min: number, max: number) => void;

  /** Minimum rating chosen, or null for no rating filter. */
  minRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  /** Rating chips to offer. Defaults to 4.5 and 4.8. */
  ratingOptions?: number[];

  /** Called by the "Återställ" button; the parent clears all filters. */
  onReset: () => void;

  /** Brands shown before "Visa fler +" is pressed. Defaults to 6. */
  initialBrandCount?: number;
  className?: string;
}

const DEFAULT_RATING_OPTIONS = [4.5, 4.8];
const DEFAULT_INITIAL_BRAND_COUNT = 6;

// Groups thousands with a plain space: 150000 -> "150 000".
function formatNumber(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function formatPrice(value: number): string {
  return `${formatNumber(value)} kr`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function FilterPanel({
  groups,
  categories,
  brands,
  selectedCategorySlugs,
  onCategoriesChange,
  selectedBrands,
  onBrandsChange,
  inStockOnly,
  onInStockOnlyChange,
  onSale,
  onOnSaleChange,
  priceBounds,
  priceMin,
  priceMax,
  onPriceChange,
  minRating,
  onMinRatingChange,
  ratingOptions = DEFAULT_RATING_OPTIONS,
  onReset,
  initialBrandCount = DEFAULT_INITIAL_BRAND_COUNT,
  className = "",
}: FilterPanelProps) {
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Categories grouped under the group headings. Anything not listed in a
  // group is collected under "Övrigt" so it stays selectable.
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const groupedSlugs = new Set(groups.flatMap((g) => g.categorySlugs));
  const categorySections = [
    ...groups.map((group) => ({
      key: group.title,
      title: group.title,
      items: group.categorySlugs
        .map((slug) => bySlug.get(slug))
        .filter((c): c is FilterCategory => c !== undefined),
    })),
    {
      key: "other",
      title: "Övrigt",
      items: categories.filter((c) => !groupedSlugs.has(c.slug)),
    },
  ].filter((section) => section.items.length > 0);

  const visibleBrands = showAllBrands ? brands : brands.slice(0, initialBrandCount);

  return (
    <aside
      aria-label="Filter"
      className={`w-64 shrink-0 self-start rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 ${className}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-medium">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filter
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-gray-900 hover:underline"
        >
          Återställ
        </button>
      </div>

      {/* Quick toggles */}
      <div className="mt-4 flex flex-col gap-2">
        <ToggleRow
          label="Endast i lager"
          description="Skickas omgående"
          checked={inStockOnly}
          onChange={onInStockOnlyChange}
        />
        <ToggleRow label="Rea" checked={onSale} onChange={onOnSaleChange} />
      </div>

      {/* Kategori */}
      <Section title="Kategori">
        <div className="flex flex-col gap-3">
          {categorySections.map((section) => (
            <div key={section.key}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {section.title}
              </p>
              <ul className="flex flex-col gap-1.5">
                {section.items.map((category) => (
                  <li key={category.slug}>
                    <CheckboxRow
                      label={category.name}
                      count={category.count}
                      checked={selectedCategorySlugs.includes(category.slug)}
                      onChange={() =>
                        onCategoriesChange(toggleValue(selectedCategorySlugs, category.slug))
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Pris */}
      <Section title="Pris">
        <PriceRange
          bounds={priceBounds}
          min={priceMin}
          max={priceMax}
          onChange={onPriceChange}
        />
      </Section>

      {/* Lägsta kundbetyg */}
      <Section title="Lägsta kundbetyg">
        <div className="flex flex-wrap gap-2">
          {ratingOptions.map((rating) => {
            const active = minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                aria-pressed={active}
                onClick={() => onMinRatingChange(active ? null : rating)}
                className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  active
                    ? "border-gray-900 bg-gray-100 text-gray-900"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {rating.toFixed(1)}+ ★
              </button>
            );
          })}
        </div>
      </Section>

      {/* Varumärke */}
      <Section title="Varumärke">
        <ul className="flex flex-col gap-1.5">
          {visibleBrands.map((brand) => (
            <li key={brand.name}>
              <CheckboxRow
                label={brand.name}
                count={brand.count}
                checked={selectedBrands.includes(brand.name)}
                onChange={() => onBrandsChange(toggleValue(selectedBrands, brand.name))}
              />
            </li>
          ))}
        </ul>
        {brands.length > initialBrandCount && (
          <button
            type="button"
            onClick={() => setShowAllBrands((open) => !open)}
            className="mt-2 text-xs font-semibold text-gray-900 hover:underline"
          >
            {showAllBrands ? "Visa färre −" : "Visa fler +"}
          </button>
        )}
      </Section>

      {/* Info box */}
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Beställ innan 16:00 för leverans redan nästa vardag.</p>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

// Collapsible section with a divider above it. Open by default.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  return (
    <section className="mt-4 border-t border-gray-200 pt-4">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between text-left text-xs font-semibold text-gray-900"
        >
          {title}
          <ChevronUp
            className={`h-4 w-4 text-gray-500 transition-transform ${open ? "" : "rotate-180"}`}
            aria-hidden="true"
          />
        </button>
      </h3>
      <div id={panelId} hidden={!open} className="mt-3">
        {children}
      </div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const labelId = useId();

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-100 px-3 py-2.5">
      <div>
        <p id={labelId} className="text-xs font-medium text-gray-900">
          {label}
        </p>
        {description && <p className="text-[10px] text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
          checked ? "bg-gray-900" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </button>
    </div>
  );
}

function CheckboxRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 shrink-0 accent-gray-900"
      />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-[10px] text-gray-400">{count}</span>}
    </label>
  );
}

// Two text fields plus a dual-handle slider made of two native range inputs
// stacked on top of each other. The inputs ignore pointer events except on
// their thumbs, so both handles stay draggable.
function PriceRange({
  bounds,
  min,
  max,
  onChange,
}: {
  bounds: PriceBounds;
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  // While a field has focus it shows what is being typed; otherwise it shows
  // the formatted value ("100 kr").
  const [draftMin, setDraftMin] = useState<string | null>(null);
  const [draftMax, setDraftMax] = useState<string | null>(null);

  const span = Math.max(1, bounds.max - bounds.min);
  const left = ((clamp(min, bounds.min, bounds.max) - bounds.min) / span) * 100;
  const right = ((clamp(max, bounds.min, bounds.max) - bounds.min) / span) * 100;

  const commitMin = (value: number) =>
    onChange(clamp(value, bounds.min, max), max);
  const commitMax = (value: number) =>
    onChange(min, clamp(value, min, bounds.max));

  function parse(text: string, fallback: number): number {
    const digits = text.replace(/\D/g, "");
    return digits === "" ? fallback : Number.parseInt(digits, 10);
  }

  const fieldClass =
    "w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700";

  // Thumb styling; the track itself is drawn by the divs below.
  const thumbClass =
    "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-3.5 " +
    "[&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border " +
    "[&::-webkit-slider-thumb]:border-gray-900 [&::-webkit-slider-thumb]:bg-white " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 " +
    "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-gray-900 " +
    "[&::-moz-range-thumb]:bg-white";

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          aria-label="Lägsta pris"
          className={fieldClass}
          value={draftMin ?? formatPrice(min)}
          onFocus={() => setDraftMin(String(min))}
          onChange={(e) => setDraftMin(e.target.value)}
          onBlur={() => {
            commitMin(parse(draftMin ?? "", min));
            setDraftMin(null);
          }}
        />
        <input
          type="text"
          inputMode="numeric"
          aria-label="Högsta pris"
          className={fieldClass}
          value={draftMax ?? formatPrice(max)}
          onFocus={() => setDraftMax(String(max))}
          onChange={(e) => setDraftMax(e.target.value)}
          onBlur={() => {
            commitMax(parse(draftMax ?? "", max));
            setDraftMax(null);
          }}
        />
      </div>

      <div className="relative mt-4 h-5">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-gray-200" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-gray-900"
          style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
        />
        <input
          type="range"
          aria-label="Lägsta pris"
          min={bounds.min}
          max={bounds.max}
          value={clamp(min, bounds.min, bounds.max)}
          onChange={(e) => commitMin(Number(e.target.value))}
          className={thumbClass}
        />
        <input
          type="range"
          aria-label="Högsta pris"
          min={bounds.min}
          max={bounds.max}
          value={clamp(max, bounds.min, bounds.max)}
          onChange={(e) => commitMax(Number(e.target.value))}
          className={thumbClass}
        />
      </div>
    </div>
  );
}
