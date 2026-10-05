import Link from "next/link";
import Image from "next/image";

export default function ShopFooter() {
  return (
    <footer className="bg-[#f7f6f2] text-gray-700 border-t border-gray-200" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Column (Left - spans 4 columns) */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"  aria-label="Group 4 — till startsidan"  >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden bg-[#e0ede9] border border-gray-200" aria-hidden="true">
             <Image src="/shop-logo.png" alt="Group 4 Logo" fill   sizes="44px"  className="object-cover"  priority />
              </div>
            <span className="text-xl font-bold tracking-wider text-gray-900">
                GROUP 4
            </span>
    </Link>

            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mt-1">
              Nordens destination för noggrant utvald design, elektronik och heminredning. Skandinavisk estetik möter funktion och hållbarhet.
            </p>
          </div>

          {/* Navigation Columns (Right - spans 8 columns total) */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Handla */}
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                Handla
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/category/hem-inredning" className="hover:underline transition-colors">
                    Hem & Inredning
                  </Link>
                </li>
                <li>
                  <Link href="/category/elektronik" className="hover:underline transition-colors">
                    Elektronik & Smarta Hem
                  </Link>
                </li>
                <li>
                  <Link href="/category/kok-gastronomi" className="hover:underline transition-colors">
                    Kök & Gastronomi
                  </Link>
                </li>
                <li>
                  <Link href="/category/belysning" className="hover:underline transition-colors">
                    Belysning & Design
                  </Link>
                </li>
                <li>
                  <Link href="/category/kampanjer" className="hover:underline transition-colors">
                    Kampanjer & Rabatter
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Kundservice */}
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                <Link href="/kundservice" className="hover:underline transition-colors">
                  Kundservice
                </Link>
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/kundservice#kontakta-kundtjanst" className="hover:underline transition-colors">
                    Kontakta kundtjänst
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#leverans-sparning" className="hover:underline transition-colors">
                    Leverans & Spårning
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#retur-reklamation" className="hover:underline transition-colors">
                    Retur & Reklamation
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#kopvillkor-integritet" className="hover:underline transition-colors">
                    Köpvillkor & Integritet
                  </Link>
                </li>
                <li>
                  <Link href="/kundservice#vanliga-fragor-faq" className="hover:underline transition-colors">
                    Vanliga frågor (FAQ)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Om Group 4 */}
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-gray-900 mb-4">
                Om Group 4
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/om-oss" className="hover:underline transition-colors">
                    Vår filosofi & Lagom
                  </Link>
                </li>
                <li>
                  <Link href="/hallbarhet" className="hover:underline transition-colors">
                    Hållbarhetsinitiativ
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="hover:underline transition-colors">
                    Press & Media
                  </Link>
                </li>
                <li>
                  <Link href="/karriar" className="hover:underline transition-colors">
                    Karriär
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="hover:underline transition-colors">
                    Bli partnerbutik
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Divider and Legal Links */}
        <div className="mt-16 pt-8 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 Group 4 Swedish Commerce. Alla rättigheter förbehållna.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/integritet" className="hover:text-gray-900 transition-colors">
              Integritet
            </Link>
            <Link href="/cookies" className="hover:text-gray-900 transition-colors">
              Cookies
            </Link>
            <Link href="/tillganglighet" className="hover:text-gray-900 transition-colors">
              Tillgänglighet
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}