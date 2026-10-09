// ---------------------------------------------------------------------------
// nav-groups — the four storefront groups shown in the navbar and on the
// landing page. Each group bundles several `categories` rows, referenced by
// their `slug` (the stable key; names can be renamed in the database).
//
// Titles, descriptions and images mirror the tiles in
// src/components/catalog/featured-grid.tsx. Slugs were read from the
// Supabase `categories` table.
// ---------------------------------------------------------------------------

export interface NavGroup {
  /** URL-safe identifier for the group itself (e.g. /products?group=<slug>). */
  slug: string;
  title: string;
  description: string;
  image: string;
  /** Slugs of the `categories` rows that belong to this group. */
  categorySlugs: readonly string[];
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    slug: "teknik-elektronik",
    title: "Teknik & Elektronik",
    description: "Smartphones, datorer och smarta prylar",
    image: "https://picsum.photos/seed/teknik/400/300",
    categorySlugs: ["laptops", "smart-phones", "tablets", "motorcycle", "motos"],
  },
  {
    slug: "mode-accessoarer",
    title: "Mode & Accessoarer",
    description: "Kläder, väskor och detaljer som gör looken",
    image: "https://picsum.photos/seed/mode/400/300",
    categorySlugs: [
      "mens-shirts",
      "mens-shoes",
      "mens-watches",
      "womens-bags",
      "womens-dresses",
      "womens-jewellery",
      "womens-shoes",
      "womens-watches",
      "tops",
      "sunglasses",
      "sports-accessories",
      "travel-accessories",
    ],
  },
  {
    slug: "hem-kok",
    title: "Hem & Kök",
    description: "Inredning och praktiska saker till hemmet",
    image: "https://picsum.photos/seed/hem/400/300",
    categorySlugs: [
      "furniture",
      "home-decoration",
      "kitchen-accessories",
      "groceries",
    ],
  },
  {
    slug: "skonhet-halsa",
    title: "Skönhet & Hälsa",
    description: "Hudvård, dofter och egenvård",
    image: "https://picsum.photos/seed/skonhet/400/300",
    categorySlugs: ["beauty", "fragrances", "skin-care"],
  },
];

/** Keys under "categories" in src/messages/*.json for each group's title. */
export const GROUP_MESSAGE_KEYS: Record<string, string> = {
  "teknik-elektronik": "teknik",
  "mode-accessoarer": "mode",
  "hem-kok": "hem",
  "skonhet-halsa": "skönhet",
};
