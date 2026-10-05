import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Which column the image card sits in on wide screens. */
export type PromoImageSide = "left" | "right";

export interface PromoSectionProps {
  /** Short kicker above the headline, e.g. "PRODUCT". */
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
  imageAlt: string;
  /** Defaults to "right": text left, image right. */
  imageSide?: PromoImageSide;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function PromoSection({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imageSide = "right",
  ctaLabel = "Shoppa nu",
  ctaHref = "/products",
}: PromoSectionProps) {
  return (
    <section
      className="flex flex-col gap-6 rounded-landing-card bg-landing-surface p-6 text-landing-ink lg:flex-row lg:items-center lg:gap-12 lg:p-10"
      aria-label={title}
    >
      <div
        className={cn(
          "flex flex-1 flex-col gap-4",
          imageSide === "left" && "lg:order-2",
        )}
      >
        <p className="text-sm font-semibold tracking-widest text-landing-accent uppercase">
          {eyebrow}
        </p>

        <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
          {title}
        </h2>

        {description ? (
          <p className="max-w-md text-base text-landing-ink/80">{description}</p>
        ) : null}

        <Link
          href={ctaHref}
          className="inline-flex w-fit flex-row items-center self-start rounded-landing-card bg-landing-accent px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      </div>

      <div
        className={cn(
          "relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-landing-card",
          imageSide === "left" && "lg:order-1",
        )}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}