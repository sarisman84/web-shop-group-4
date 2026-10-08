import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { getDiscountPercentage } from "@/components/catalog/product-card";
import {
  getPromoProducts,
  type ProductSort,
  type PromoProduct,
} from "@/lib/data";

/** 2x2 collage, the tile count `getPromoProducts` defaults to. */
const COLLAGE_TILES = 4;

export interface PromoSectionProps {
  /** Small uppercase kicker above the headline, e.g. "Produkt". */
  eyebrow: string;
  /**
   * Promo headline. `{max}` is replaced with the largest discount among the
   * collage tiles, so the claim always matches the badges beside it. The
   * headline is dropped when no tile is discounted.
   */
  title: string;
  description: string;
  /** Ranking the collage follows, so the tiles back up the headline. */
  sort: ProductSort;
  /** Products already shown in the landing page rows, so the collage promotes
   * different products instead of repeating them. */
  excludeIds?: number[];
  /** Which side the collage sits on. Text takes the other side. */
  imageSide: "left" | "right";
  ctaLabel?: string;
  ctaHref?: string;
  /** Set only when the collage is near the top of the page, so its images are
   * LCP candidates. Below the fold they stay lazy-loaded. */
  eager?: boolean;
}

export default async function PromoSection({
  eyebrow,
  title,
  description,
  sort,
  excludeIds,
  imageSide,
  ctaLabel = "Shoppa nu",
  ctaHref = "/products",
  eager = false,
}: PromoSectionProps) {
  const tiles = await getPromoProducts({
    limit: COLLAGE_TILES,
    sort,
    excludeIds,
  });

  if (tiles.length === 0) return null;

  // The headline claims a discount, so it is computed from exactly the products
  // shown next to it rather than hardcoded. `getDiscountPercentage` is the same
  // rounding the tile badges use, which keeps "up to N%" and "-N%" in sync.
  const discounts = tiles.map((tile) =>
    getDiscountPercentage(tile.discountPercentage),
  );
  const maxDiscount = Math.max(0, ...discounts.filter((d) => d !== null));

  return (
    <section
      className="mx-auto max-w-7xl px-6 py-12"
      aria-label={title.replace("{max}", String(maxDiscount))}
    >
      {/* imageSide drives the DOM order on desktop only: the visual order flips
          at lg, while mobile keeps image-then-text on both variants so the
          reading order matches what is on screen. */}
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {imageSide === "left" && <Collage tiles={tiles} discounts={discounts} eager={eager} />}

        <div className={imageSide === "right" ? "lg:pr-8" : "lg:pl-8"}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {maxDiscount > 0 ? title.replace("{max}", String(maxDiscount)) : title}
          </h2>
          <p className="mt-4 max-w-md text-base text-gray-600">{description}</p>
          <Link
            href={ctaHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4a45]"
          >
            {ctaLabel}
            <ArrowRight size="1rem" aria-hidden="true" />
          </Link>
        </div>

        {imageSide === "right" && <Collage tiles={tiles} discounts={discounts} eager={eager} />}
      </div>
    </section>
  );
}

/**
 * The promo's image card: real product thumbnails in a rounded tile grid
 * instead of a static marketing photo, so the collage always shows current
 * products and the discount badges stay truthful.
 */
function Collage({
  tiles,
  discounts,
  eager,
}: {
  tiles: PromoProduct[];
  /** Pre-rounded discount per tile, aligned by index. */
  discounts: (number | null)[];
  eager: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl bg-white">
      {tiles.map((tile, index) => {
        const discount = discounts[index];

        return (
          <li key={tile.id} className="relative">
            <Link
              href={`/products/${tile.id}`}
              className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"
            >
              <div className="card-thumbnail">
                <Image
                  src={tile.thumbnail}
                  // Decorative beside the headline copy, but the link needs a
                  // name, so the product title is the accessible label.
                  alt={tile.title}
                  width={800}
                  height={800}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  loading={eager ? "eager" : undefined}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                />
              </div>
              {discount !== null && (
                <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                  -{discount}%
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
