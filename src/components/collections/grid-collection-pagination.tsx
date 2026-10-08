import Link from "next/link";
import { ReactNode } from "react";

type CustomPageRender = (page: number, isActive: boolean) => ReactNode;
export type PaginationSearchParams = Record<
  string,
  string | string[] | undefined
>;

export interface GridCollectionPaginationProps {
  /** Current page index (1‑based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Base path that page links point to (e.g. "/products"). */
  basePath?: string;
  /** Current URL search params, preserved when building page links. */
  searchParams?: PaginationSearchParams;
  /** Optional label for "Previous" button. */
  previousLabel?: string;
  /** Optional label for "Next" button. */
  nextLabel?: string;
  /** Optional CSS class to apply to the container. */
  className?: string;
  /** Optional custom render function for page numbers. */
  renderPage?: CustomPageRender;
  /** Maximum number of page options to display. Defaults to 3. */
  maxPages?: number;
}

function buildPageHref(
  page: number,
  basePath: string,
  searchParams: PaginationSearchParams,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

const baseClass = "px-3 py-1 rounded";
const activeClass = "bg-slate-800 text-white";
const inactiveClass = "text-gray-600 hover:bg-gray-200";
const disabledClass = "opacity-50 cursor-not-allowed";

export default function GridCollectionPagination({
  totalPages,
  className,
  currentPage,
  basePath = "",
  searchParams = {},
  previousLabel = "Prev",
  nextLabel = "Next",
  renderPage,
  maxPages = 3,
}: GridCollectionPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages, maxPages);

  const prevDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className} py-10`}
    >
      {prevDisabled ? (
        <span
          className={`${baseClass} ${disabledClass}`}
          aria-disabled="true"
        >
          {previousLabel}
        </span>
      ) : (
        <Link
          href={buildPageHref(currentPage - 1, basePath, searchParams)}
          className={`${baseClass} ${inactiveClass}`}
          aria-label="Previous page"
        >
          {previousLabel}
        </Link>
      )}
      {visiblePages.map((page) =>
        typeof page === "number"
          ? renderPageItem(page, currentPage, basePath, searchParams, renderPage)
          : <span key={`${page}-${page}`} className={`${baseClass} text-gray-400`}>{page}</span>,
      )}
      {nextDisabled ? (
        <span
          className={`${baseClass} ${disabledClass}`}
          aria-disabled="true"
        >
          {nextLabel}
        </span>
      ) : (
        <Link
          href={buildPageHref(currentPage + 1, basePath, searchParams)}
          className={`${baseClass} ${inactiveClass}`}
          aria-label="Next page"
        >
          {nextLabel}
        </Link>
      )}
    </nav>
  );
}

function getVisiblePages(currentPage: number, totalPages: number, maxPages: number): (number | "...")[] {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  let pages: number[] = [];

  if (currentPage <= 2) {
    pages = [1, 2, 3];
  } else if (currentPage >= totalPages - 1) {
    pages = [totalPages - 2, totalPages - 1, totalPages];
  } else {
    pages = [currentPage - 1, currentPage, currentPage + 1];
  }

  const result: (number | "...")[] = [];

  if (pages[0]! > 1) {
    result.push(1);
    if (pages[0]! > 2) result.push("...");
  }

  result.push(...pages);

  if (pages[pages.length - 1]! < totalPages) {
    if (pages[pages.length - 1]! < totalPages - 1) result.push("...");
    result.push(totalPages);
  }

  return result;
}

function renderPageItem(
  page: number,
  currentPage: number,
  basePath: string,
  searchParams: PaginationSearchParams,
  renderPage: CustomPageRender | undefined,
): ReactNode {
  const isActive = page === currentPage;
  const content = renderPage ? renderPage(page, isActive) : page;
  const classes = `${baseClass} ${isActive ? activeClass : inactiveClass}`;

  if (isActive) {
    return (
      <span key={page} className={classes} aria-current="page">
        {content}
      </span>
    );
  }
  return (
    <Link
      key={page}
      href={buildPageHref(page, basePath, searchParams)}
      className={classes}
    >
      {content}
    </Link>
  );
}
