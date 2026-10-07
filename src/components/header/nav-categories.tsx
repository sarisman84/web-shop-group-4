import Link from "next/link";
import { NAV_GROUPS } from "@/lib/nav-groups";

// Quick-link row of the shop header: the four category groups plus "Rea".
// Links carry ?group=<group slug> / ?sale=true; the products page does not
// read these params yet.
export default function NavCategories() {
  return (
    <nav
      className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 overflow-x-auto"
      aria-label="Kategorier"
    >
      {NAV_GROUPS.map((group) => (
        <Link
          key={group.slug}
          href={`/products?group=${encodeURIComponent(group.slug)}`}
          className="hover:text-[#0d5c56] transition-colors whitespace-nowrap"
        >
          {group.title}
        </Link>
      ))}
      <Link
        href="/products?sale=true"
        className="hover:text-[#0d5c56] transition-colors whitespace-nowrap"
      >
        Rea
      </Link>
    </nav>
  );
}
