import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";

export interface CategoryIntroductionCategory {
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface CategoryIntroductionProps {
  /** Matched category row — shown only when the category has no nav group of
   * its own; a category inside a group shows the group's intro instead. */
  category?: CategoryIntroductionCategory;
  /** Active nav group slug (see NAV_GROUPS). */
  groupSlug?: string;
  /** The selection spans several categories (from different groups): show
   * the generic "products found" intro with the fallback background. */
  multiCategory?: boolean;
}

// Background shown when no category is selected, or when the selected
// category has no image of its own (T100, issue #149).
export const CATEGORY_INTRO_FALLBACK_IMAGE = "https://picsum.photos/1920/500";

export default async function CategoryIntroduction({
  category,
  groupSlug,
  multiCategory = false,
}: CategoryIntroductionProps) {
  const [tProducts, tCategories, tDescriptions] = await Promise.all([
    getTranslations("products"),
    getTranslations("categories"),
    getTranslations("groupDescriptions"),
  ]);

  const group = NAV_GROUPS.find((g) => g.slug === groupSlug);
  // Group titles and descriptions live in the message catalogs (same keys
  // as the landing page's FeaturedGrid); NAV_GROUPS values are the fallback
  // for groups without a message key.
  const groupKey = group ? GROUP_MESSAGE_KEYS[group.slug] : undefined;

  // A selection spanning several categories has no single name, description
  // or image of its own, so it shows the generic "products found" intro with
  // the fallback background. A single category shows its parent group's intro
  // (title, description and image) — the category itself stays in the
  // breadcrumb trail; only a category outside every nav group falls back to
  // its own row (T100, issue #149 / #200).
  const groupTitle = groupKey ? tCategories(groupKey) : group?.title;
  const groupDescription = groupKey ? tDescriptions(groupKey) : group?.description;
  const title = multiCategory
    ? tProducts("productsFound")
    : groupTitle ?? category?.name ?? tProducts("allProducts");
  const subtitle = multiCategory
    ? tProducts("productsFoundDescription")
    : groupDescription || category?.description?.trim() || tProducts("defaultDescription");
  const background = multiCategory
    ? CATEGORY_INTRO_FALLBACK_IMAGE
    : group?.image || category?.image?.trim() || CATEGORY_INTRO_FALLBACK_IMAGE;

  return (
    <section className="category-intro">
      <Image
        src={background}
        alt=""
        fill
        quality={100}
        priority
        className="object-cover"
      />
      <div className="category-intro-overlay" />

      <div className="relative z-10 w-full px-16">
        <div className="category-intro-container mx-auto w-full max-w-content">
          <h1
            className="category-intro-title"
            style={{ maxWidth: "840px" }}
          >
            {title}
          </h1>
          <p
            className="category-intro-body"
            style={{ maxWidth: "760px" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
