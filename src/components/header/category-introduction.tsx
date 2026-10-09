import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";

export interface CategoryIntroductionCategory {
  name: string;
  description?: string | null;
  image?: string | null;
}

export interface CategoryIntroductionProps {
  /** Matched category row — wins over the group when present. */
  category?: CategoryIntroductionCategory;
  /** Active nav group slug (see NAV_GROUPS). */
  groupSlug?: string;
}

// Background shown when no category is selected, or when the selected
// category has no image of its own (T100, issue #149).
export const CATEGORY_INTRO_FALLBACK_IMAGE = "https://picsum.photos/1920/500";

export default async function CategoryIntroduction({
  category,
  groupSlug,
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

  const title =
    category?.name ??
    (groupKey ? tCategories(groupKey) : group?.title) ??
    tProducts("allProducts");
  const subtitle =
    category?.description?.trim() ||
    (groupKey ? tDescriptions(groupKey) : group?.description) ||
    tProducts("defaultDescription");
  const background =
    category?.image?.trim() || group?.image || CATEGORY_INTRO_FALLBACK_IMAGE;

  return (
    <section className="category-intro">
      <Image
        src={background}
        alt={title}
        fill
        quality={100}
        priority
        className="object-cover"
      />
      <div className="category-intro-overlay" />

      <div className="relative z-10 w-full px-16">
        <div className="category-intro-container mx-auto w-full max-w-content">
          <h2
            className="category-intro-title"
            style={{ maxWidth: "840px" }}
          >
            {title}
          </h2>
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
