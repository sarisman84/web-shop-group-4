import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";

export default function FeaturedGrid() {
  const t = useTranslations("hero");
  const tCategories = useTranslations("categories");
  const tDescriptions = useTranslations("groupDescriptions");

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-label={t("featuredAria")}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="flex flex-col justify-center rounded-2xl bg-[#1a1a1a] p-10 text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            {t("title")}
          </h2>
          <p className="text-gray-300 mb-8 max-w-md">
            {t("description")}
          </p>
          <div>
            <Link
              href="/products"
              className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              {t("cta")}
            </Link>
          </div>
        </div>

        {/* Right grid */}
        <div className="grid grid-cols-2 gap-4">
          {NAV_GROUPS.map((cat) => {
            const key = GROUP_MESSAGE_KEYS[cat.slug];
            const title = key ? tCategories(key) : cat.title;
            const description = key ? tDescriptions(key) : cat.description;
            return (
            <Link
              key={cat.slug}
              href={`/products?group=${encodeURIComponent(cat.slug)}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              {/* The text sits on its own dark layer: checkers cannot measure contrast against a photo or a gradient, and this layer also keeps the copy readable on bright images. It covers the lower half of the card (min-h so longer text can still grow it) and the text starts at its top-left, so every card reads from the same place. */}
              <div className="absolute inset-x-0 bottom-0 min-h-1/2 bg-black/65 p-4 text-white backdrop-blur-[2px]">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-gray-100">{description}</p>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
