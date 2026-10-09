import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";

// Quick-link row of the shop header: the four category groups plus "Rea".
// Links carry ?group=<group slug> / ?sale=true; the products page does not
// read these params yet.
export default function NavCategories() {
  const t = useTranslations("header");
  const tCategories = useTranslations("categories");
  return (
    <nav
      className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 overflow-x-auto"
      aria-label={t("categoriesNav")}
    >
      {NAV_GROUPS.map((group) => (
        <Link
          key={group.slug}
          href={`/products?group=${encodeURIComponent(group.slug)}`}
          className="hover:text-[#0d5c56] transition-colors whitespace-nowrap"
        >
          {GROUP_MESSAGE_KEYS[group.slug] ? tCategories(GROUP_MESSAGE_KEYS[group.slug]) : group.title}
        </Link>
      ))}
      <Link
        href="/products?sale=true"
        className="text-red-600 hover:text-[#0d5c56] transition-colors whitespace-nowrap"
      >
        {t("sale")}
      </Link>
    </nav>
  );
}
