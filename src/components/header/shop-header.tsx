"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Heart, ShoppingBag, Truck, Clock, ShieldCheck, Menu, ChevronDown, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/header/search-bar";
import { NAV_GROUPS } from "@/lib/nav-groups";
import { signOutAction } from "@/app/auth/actions";

interface Category {
  id: number | string;
  name: string;
  slug?: string;
}

interface ShopHeaderProps {
  categories?: Category[];
  cartCount?: number;
  isAuthenticated?: boolean; // Added to handle sign in / sign up state
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

export default function ShopHeader({
  categories = [],
  cartCount = 0,
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

  // Categories grouped under the nav groups; anything not in a group goes
  // under "Övrigt" so it stays reachable.
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <Logo />
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>
          
          {/* Navigation Actions */}
          <nav className="flex items-center gap-3" aria-label="Konto och varukorg">
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
                    <h2 className="font-semibold text-gray-900">My Account</h2>
                    {userEmail && (
                      <p className="mt-2 break-all text-sm text-gray-600">
                        Welcome {userEmail}!
                      </p>
                    )}
                    <div className="mt-4 border-t border-gray-100 pt-3">
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        My Account
                      </Link>
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="outline" className="text-sm font-medium gap-2 border-gray-300 rounded-full hover:bg-gray-50">
                  <LogIn className="h-4 w-4 text-gray-700" />
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
            <IconButton href="/wishlist" icon={Heart} label="Önskelista" badge={2} />
            <IconButton href="/cart" icon={ShoppingBag} label="Varukorg" badge={cartCount} />
          </nav>
        </div>

        {/* Category Navigation Bar */}
        <div className="border-t border-gray-100 px-6 py-2.5 relative">
          <div className="mx-auto flex max-w-7xl items-center gap-6">
            
            {/* Amazon-style All Categories Button with Dropdown Trigger */}
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

              {/* 3-Column Dropdown Mega Menu */}
              {isDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-[600px] bg-white border border-gray-200 rounded-xl shadow-2xl p-6 z-50">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-base">Alla produktkategorier</h3>
                    <Link
                      href="/products"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-xs font-semibold text-[#0d5c56] hover:underline"
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

            {/* Quick-links row next to the button */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700 overflow-x-auto">
              {NAV_GROUPS.map((group) => (
                <Link
                  key={group.slug}
                  href={`/products?group=${encodeURIComponent(group.slug)}`}
                  className="hover:text-[#0d5c56] transition-colors whitespace-nowrap"
                >
                  {group.title}
                </Link>
              ))}
              <Link
                href="/products?sale=true"
                className="rounded-full bg-red-600 px-4 py-1.5 font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Rea
              </Link>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}