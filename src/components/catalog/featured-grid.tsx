import Link from "next/link";
import { NAV_GROUPS } from "@/lib/nav-groups";

export default function FeaturedGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-label="Utvalda kategorier">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="flex flex-col justify-center rounded-2xl bg-[#1a1a1a] p-10 text-white">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Välkommen till Group 4
          </h2>
          <p className="text-gray-300 mb-8 max-w-md">
            Noggrant utvalda produkter inom teknik, mode, hem och skönhet. Snabb leverans och enkel retur.
          </p>
          <div>
            <Link
              href="/products"
              className="inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              Utforska sortimentet
            </Link>
          </div>
        </div>

        {/* Right grid */}
        <div className="grid grid-cols-2 gap-4">
          {NAV_GROUPS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?group=${encodeURIComponent(cat.slug)}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-semibold">{cat.title}</h3>
                <p className="text-sm text-gray-200">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
