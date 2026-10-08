import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
}

// Semantic, accessible breadcrumb: every segment except the last is a link,
// the last segment is plain text marking the current page.
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Brödsmula" className="breadcrumbs">
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="breadcrumbs-item">
              {index > 0 && (
                <span aria-hidden="true" className="breadcrumbs-separator">
                  /
                </span>
              )}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="breadcrumbs-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
