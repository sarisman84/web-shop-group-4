import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { GROUP_MESSAGE_KEYS, NAV_GROUPS } from "@/lib/nav-groups";

export default function ShopFooter() {
  const t = useTranslations("footer");
  const tHeader = useTranslations("header");
  const tCategories = useTranslations("categories");

  return (
    <footer className="mt-20 bg-gray-100 text-gray-700 border-t border-gray-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Column (Left - spans 4 columns) */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"  aria-label={tHeader("homeAria")}  >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden bg-[#e0ede9] border border-gray-200" aria-hidden="true">
             <Image src="/shop-logo.png" alt="Group 4 Logo" fill   sizes="44px"  className="object-cover"  priority />
             </div>
            <span className="text-xl font-bold tracking-wider text-gray-900">
                GROUP 4
            </span>
    </Link>

            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mt-1">
              {t("tagline")}
            </p>
          </div>

          {/* Navigation Columns (Right - spans 8 columns total) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Handla */}
            <div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                {t("shop")}
              </h2>
              <ul className="space-y-3 text-sm">
                {NAV_GROUPS.map((group) => (
                  <li key={group.slug}>
                    <Link
                      href={`/products?group=${encodeURIComponent(group.slug)}`}
                      className="hover:underline transition-colors"
                    >
                      {GROUP_MESSAGE_KEYS[group.slug] ? tCategories(GROUP_MESSAGE_KEYS[group.slug]) : group.title}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/products?sale=true" className="hover:underline transition-colors">
                    {t("sale")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Kundservice */}
            <div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                <Link href="/kundservice" className="hover:underline transition-colors">
                  {t("customerService")}
                </Link>
              </h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/kundservice#kontakta-kundtjanst" className="hover:underline transition-colors">
                    {t("kontakt")}
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#leverans-sparning" className="hover:underline transition-colors">
                    {t("leveransSpårning")}
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#retur-reklamation" className="hover:underline transition-colors">
                    {t("returReklamation")}
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#kopvillkor-integritet" className="hover:underline transition-colors">
                    {t("kopvillkor")}
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#vanliga-fragor-faq" className="hover:underline transition-colors">
                    {t("faq")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Om Group 4 */}
            <div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                {t("about")}
              </h2>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/om-oss" className="hover:underline transition-colors">
                    {t("filosofi")}
                  </Link>
                </li>
                <li>
                  <Link href="/hallbarhet" className="hover:underline transition-colors">
                    {t("hallbarhet")}
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:underline transition-colors">
                    {t("press")}
                  </Link>
                </li>
                <li>
                  <Link href="/karriar" className="hover:underline transition-colors">
                    {t("karriar")}
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="hover:underline transition-colors">
                    {t("partner")}
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Divider and Legal Links */}
        <div className="mt-16 pt-8 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
          <p>{t("rights")}</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/integritet" className="hover:text-gray-900 transition-colors">
              {t("integritet")}
            </Link>
            <Link href="/cookies" className="hover:text-gray-900 transition-colors">
              {t("cookies")}
            </Link>
            <Link href="/tillganglighet" className="hover:text-gray-900 transition-colors">
              {t("tillganglighet")}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}