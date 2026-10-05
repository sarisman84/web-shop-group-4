import Link from "next/link";
import type { Category } from "@/app/admin/types";

interface FilterProps {
  /** Categories to list; defaults to an empty list (only "Alla produkter" shows). */
  categories?: Category[];
  /** Name of the currently selected category (the ?category= param). */
  activeCategory?: string;
}

// Category list for the catalogue sidebar. Mirrors the header's category
// links (?category=<name>) and highlights the active one; "Alla produkter"
// clears the category filter.
export default function Filter({ categories = [], activeCategory }: FilterProps) {
  return (
    <aside
      className="w-48 shrink-0 bg-white border border-gray-200 rounded-lg p-4 self-start"
      aria-label="Filtrera på kategori"
    >
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Kategorier</h2>
      <nav className="flex flex-col gap-1">
        <Link
          href="/products"
          aria-current={activeCategory ? undefined : "true"}
          className={`rounded-md px-2 py-1 text-sm transition-colors ${
            activeCategory
              ? "text-gray-700 hover:bg-gray-100 hover:text-[#0d5c56]"
              : "bg-gray-100 font-medium text-[#0d5c56]"
          }`}
        >
          Alla produkter
        </Link>
        {categories.map((cat) => {
          const isActive = cat.name === activeCategory;
          return (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              aria-current={isActive ? "true" : undefined}
              className={`rounded-md px-2 py-1 text-sm transition-colors ${
                isActive
                  ? "bg-gray-100 font-medium text-[#0d5c56]"
                  : "text-gray-700 hover:bg-gray-100 hover:text-[#0d5c56]"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
