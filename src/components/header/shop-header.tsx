"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { User, Heart, ShoppingBag, Truck, Clock, ShieldCheck, Menu, ChevronDown, X, LogIn, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/header/search-bar";
import NavCategories from "@/components/header/nav-categories";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { signOutAction } from "@/app/(shop)/auth/actions";
import { routing } from "@/i18n/routing";
import { Link, getPathname, usePathname } from "@/i18n/routing";

interface Category {
  id: number | string;
  name: string;
  slug?: string;
}

interface ShopHeaderProps {
  categories?: Category[];
  cartCount?: number;
  wishlistCount?: number;
  isAuthenticated?: boolean;
  userEmail?: string;
}

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"
      aria-label="Group 4 — till startsidan"
    >
      <div className="relative flex h-11 w-11 items-center justify-center rounded-full overflow-hidden bg-[#e0ede9] border border-gray-200" aria-hidden="true">
        <Image
          src="/shop-logo.png"
          alt="Group 4 Logo"
          fill
          sizes="44px"
          className="object-cover"
          priority
        />
      </div>
      <span className="text-xl font-bold tracking-wider text-gray-900">
        GROUP 4
      </span>
    </Link>
  );
}

function TopBar() {
  const items = [
    { icon: Truck, text: "Fri frakt över 499 kr" },
    { icon: Clock, text: "1-3 dagars leverans" },
    { icon: ShieldCheck, text: "Trygg betalning med Klarna" },
  ];

  return (
    <div className="bg-[#1a1a1a] text-white" role="region" aria-label="Information">
      <div className="mx-auto flex items-center justify-center gap-8 px-4 py-2 text-xs font-medium tracking-wide">
        {items.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-gray-300" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

function IconButton({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"
    >
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
        <Icon className="h-5 w-5 text-gray-700" aria-hidden="true" />
      </Button>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="default"
          className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-gray-900 px-1 text-[10px] text-white hover:bg-gray-900"
          aria-label={`${badge} objekt`}
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
}

function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();

  // Full page load on purpose: the intl provider lives in the root layout,
  // above [locale], and is not re-rendered by a client-side navigation. A soft
  // switch would leave useLocale(), usePathname() and Link on the old locale
  // (the next click then ended up on /sv/en or /en/en).
  const switchLocale = (newLocale: string) => {
    const target = getPathname({ href: pathname, locale: newLocale });
    window.location.assign(`${target}${window.location.search}`);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 p-1">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
            locale === loc
              ? "bg-[#0d5c56] text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-label={`Byt språk till ${loc === "sv" ? "Svenska" : "English"}`}
          aria-pressed={locale === loc}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function ShopHeader({
  categories = [],
  cartCount = 0,
  wishlistCount = 0,
  isAuthenticated = false,
  userEmail,
}: ShopHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const groupedSlugs = new Set(NAV_GROUPS.flatMap((g) => g.categorySlugs));
  const menuSections = [
    ...NAV_GROUPS.map((group) => ({
      key: group.slug,
      title: group.title,
      href: `/products?group=${encodeURIComponent(group.slug)}`,
      items: group.categorySlugs
        .map((slug) => bySlug.get(slug))
        .filter((c): c is Category => c !== undefined),
    })),
    {
      key: "other",
      title: "Övrigt",
      href: undefined,
      items: categories.filter((c) => !c.slug || !groupedSlugs.has(c.slug)),
    },
  ].filter((section) => section.items.length > 0);

  return (
    <>
      <TopBar />
      <header className="border-b border-gray-200 bg-white relative" role="banner">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 md:px-6 lg:py-4">
          <Logo />
          {/* Below lg the search drops to its own full-width row */}
          <div className="order-last w-full lg:order-0 lg:w-auto lg:flex-1 lg:max-w-2xl">
            <SearchBar />
          </div>
          
          {/* Navigeringsåtgärder */}
          <nav className="flex items-center gap-3" aria-label="Konto och varukorg">
            <LanguageSelector />
            {isAuthenticated ? (
              <div className="relative" ref={accountMenuRef}>
                <Button
                  id="account-menu-trigger"
                  type="button"
                  variant="ghost"
                  aria-label="Konto"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="true"
                  aria-controls="account-menu"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <User className="h-5 w-5 text-gray-700" aria-hidden="true" />
                  <ChevronDown
                    className={`h-4 w-4 text-gray-700 transition-transform ${isAccountMenuOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </Button>
                {isAccountMenuOpen && (
                  <div
                    id="account-menu"
                    aria-labelledby="account-menu-trigger"
                    className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl"
                  >
                    <h2 className="font-semibold text-gray-900">Mitt konto</h2>
                    {userEmail && (
                      <p className="mt-2 break-all text-sm text-gray-600">
                        {userEmail}!
                      </p>
                    )}
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mitt konto
                      </Link>
                      <Link
                        href="/account/addresses"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Leveransadresser
                      </Link>
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logga ut
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" aria-label="Logga in / Skapa konto">
                <Button variant="outline" className="text-sm font-medium gap-2 border-gray-300 rounded-full hover:bg-gray-50 max-md:h-9 max-md:w-9 max-md:p-0">
                  <LogIn className="h-4 w-4 text-gray-700" aria-hidden="true" />
                  <span className="hidden md:inline">Logga in / Skapa konto</span>
                </Button>
              </Link>
            )}
            <IconButton href="/wishlist" icon={Heart} label="Önskelista" badge={wishlistCount} />
            <IconButton href="/cart" icon={ShoppingBag} label="Varukorg" badge={cartCount} />
          </nav>
        </div>

        {/* Kategorimeny */}
        <div className="border-t border-gray-100 px-6 py-2.5 relative">
          <div className="mx-auto flex max-w-7xl items-center gap-6">
            
            {/* "Alla kategorier"-knapp med rullgardinsmeny */}
            <div className="relative">
              <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                variant="default"
                className="bg-[#222222] text-white hover:bg-black rounded-lg gap-2 text-sm font-medium px-4 h-9"
              >
                {isDropdownOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                Alla kategorier
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </Button>

              {/* Megameny */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-150 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 z-50">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-base">Alla produktkategorier</h3>
                    <Link
                      href="/products"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-xs font-semibold text-black hover:underline"
                    >
                      Visa alla produkter
                    </Link>
                  </div>

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      {menuSections.map((section) => (
                        <div key={section.key}>
                          {section.href ? (
                            <Link
                              href={section.href}
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-3 pb-1 text-sm font-bold text-gray-900 hover:text-[#0d5c56]"
                            >
                              {section.title}
                            </Link>
                          ) : (
                            <p className="px-3 pb-1 text-sm font-bold text-gray-900">
                              {section.title}
                            </p>
                          )}
                          {section.items.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products?category=${encodeURIComponent(cat.slug ?? "")}`}
                              onClick={() => setIsDropdownOpen(false)}
                              className="block truncate px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0d5c56] transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm py-4 text-center">Inga kategorier hittades</p>
                  )}
                </div>
              )}
            </div>

            {/* Snabblänkar bredvid knappen */}
            <NavCategories />

          </div>
        </div>
      </header>
    </>
  );
}