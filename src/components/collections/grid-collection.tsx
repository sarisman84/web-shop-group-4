import React from "react";
import GridCollectionPagination, {
  GridCollectionPaginationProps,
} from "./grid-collection-pagination";

interface GridCollectionProps<Item> {
  items: Item[];
  itemsPerPage?: number;
  currentPage?: number;
  totalPages?: number;
  renderItem: (item: Item, index: number) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  customGridClassName?: string;
  cols?: number;
  rows?: number;
  /** Props to forward to Pagination (labels, className, etc.) */
  paginationProps?: Omit<
    GridCollectionPaginationProps,
    "currentPage" | "totalPages"
  >;
}

/**
 * Helper that turns `itemsPerPage` into Tailwind grid classes.
 * Example: itemsPerPage = 20 → "grid-cols-5 grid-rows-4"
 */
function computeGridClasses(
  itemsPerPage: number,
  cols?: number,
  rows?: number,
): string {
  const resultCol = cols ?? Math.ceil(Math.sqrt(itemsPerPage));
  const resultRow = rows ?? Math.ceil(itemsPerPage / resultCol);
  return `grid-cols-${resultCol} grid-rows-${resultRow}`;
}

export default function GridCollection<Item>({
  items,
  itemsPerPage = 20,
  currentPage = 1,
  totalPages,
  renderItem,
  ariaLabel,
  className = "",
  customGridClassName,
  paginationProps,
  rows,
  cols,
}: GridCollectionProps<Item>) {
  const dynamicGridClass =
    customGridClassName ?? computeGridClasses(itemsPerPage, cols, rows);
  const finalGridClass = `grid gap-4 ${dynamicGridClass}`;

  return (
    <section className={className}>
      <div role="grid" aria-label={ariaLabel} className={finalGridClass}>
        {items.map((item, index) => (
          <div key={index} role="gridcell">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      <GridCollectionPagination
        currentPage={currentPage}
        totalPages={totalPages ?? 1}
        {...paginationProps}
      />
    </section>
  );
}
