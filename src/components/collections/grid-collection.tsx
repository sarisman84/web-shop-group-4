import React from 'react';

interface GridCollectionProps<Item> {
  items: Item[];
  rows?: number;
  cols?: number;
  gap?: string;
  renderItem: (item: Item, index: number) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

export default function GridCollection<Item>(
  {
    items,
    rows = 3,
    cols = 3,
    gap = '1rem',
    renderItem,
    ariaLabel,
    className = ''
  }: GridCollectionProps<Item>) {
  const maxItems = rows * cols;
  const visibleItems = items.slice(0, maxItems);

  return (
    <div
      role="grid"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, auto)`,
        gap
      }}
    >
      {visibleItems.map((item, index) => (
        <div key={index} role="gridcell">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
