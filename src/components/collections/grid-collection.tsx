import React from "react";
import GridCollectionPagination, {
  GridCollectionPaginationProps,
} from "./grid-collection-pagination";

interface GridCollectionProps<Item> {
  items: Item[];
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  gap?: string;
  renderItem: (item: Item, index: number) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  customGridClassName?: string;
  /** Props to forward to Pagination (labels, className, etc.) */
  paginationProps?: Omit<
    GridCollectionPaginationProps,
    "currentPage" | "totalPages" | "onPageChange"
  >;
}

/**
 * Helper that turns `itemsPerPage` into Tailwind grid classes.
 * Example: itemsPerPage = 20 → "grid-cols-5 grid-rows-4"
 */
function computeGridClasses(itemsPerPage: number): string {
  const cols = Math.ceil(Math.sqrt(itemsPerPage));
  const rows = Math.ceil(itemsPerPage / cols);
  return `grid-cols-${cols} grid-rows-${rows}`;
}

export default function GridCollection<Item>({
  items,
  itemsPerPage = 20,
  currentPage = 1,
  totalPages,
  gap = "1rem",
  renderItem,
  ariaLabel,
  className = "",
  customGridClassName,
  paginationProps,
}: GridCollectionProps<Item>) {
  const startIndx = (currentPage - 1) * itemsPerPage;
  const endInx = startIndx + itemsPerPage;
  const pageSlice = items.slice(startIndx, endInx);

  const calculatedTotalPages = Math.ceil(items.length / itemsPerPage);

  const dynamicGridClass =
    customGridClassName ?? computeGridClasses(itemsPerPage);
  const finalGridClass = `grid ${gap} ${dynamicGridClass} ${className}`;

  return (
    <section>
      <div role="grid" aria-label={ariaLabel} className={finalGridClass}>
        {pageSlice.map((item, index) => (
          <div key={index} role="gridcell">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      <GridCollectionPagination
        currentPage={currentPage}
        totalPages={totalPages ?? calculatedTotalPages}
        onPageChange={() => {}} // no-op for server component
        {...paginationProps}
      />
    </section>
  );
}
