"use client"
import { ReactNode } from "react";

type CustomPageRender = (page: number, isActive: boolean) => ReactNode;
type PageChangeEvent = (page: number) => void;

export interface GridCollectionPaginationProps {
  /** Current page index (1‑based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Called when the user selects a page. */
  onPageChange: PageChangeEvent;
  /** Optional label for “Previous” button. */
  previousLabel?: string;
  /** Optional label for “Next” button. */
  nextLabel?: string;
  /** Optional CSS class to apply to the container. */
  className?: string;
  /** Optional custom render function for page numbers. */
  renderPage?: CustomPageRender;
}

export default function GridCollectionPagination({
  totalPages,
  className,
  currentPage,
  onPageChange,
  previousLabel,
  nextLabel,
  renderPage,
}: GridCollectionPaginationProps) {
  // Helper to create page items
  const pageItems = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        {previousLabel}
      </button>
      {pageItems.map((page) =>
        renderPageItem(page, currentPage, renderPage, onPageChange),
      )}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        {nextLabel}
      </button>
    </nav>
  );
}

function renderPageItem(
  page: number,
  currentPage: number,
  renderPage: CustomPageRender | undefined,
  onPageChange: PageChangeEvent,
): ReactNode {
  const isActive = page === currentPage;
  if (renderPage) {
    return (
      <span key={page} onClick={() => onPageChange(page)}>
        {renderPage(page, isActive)}
      </span>
    );
  }
  return (
    <button
      key={page}
      type="button"
      onClick={() => onPageChange(page)}
      className={`px-3 py-1 rounded ${
        isActive
          ? "bg-indigo-600 text-white"
          : "text-gray-600 hover:bg-gray-200"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      {page}
    </button>
  );
}
