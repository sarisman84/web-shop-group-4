"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Heart, ShoppingBag, Truck, Clock, ShieldCheck, Menu, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/header/search-bar";

interface Category {
  id: number | string;
  name: string;
  slug?: string;
}

interface ShopHeaderProps {
  categories?: Category[];
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

export default function ShopHeader({ categories = [] }: ShopHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <TopBar />
      <header className="border-b border-gray-200 bg-white relative" role="banner">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <Logo />
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>
          <nav className="flex items-center gap-2" aria-label="Konto och varukorg">
            <IconButton href="/account" icon={User} label="Konto" />
            <IconButton href="/wishlist" icon={Heart} label="Önskelista" badge={2} />
            <IconButton href="/cart" icon={ShoppingBag} label="Varukorg" badge={3} />
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
                      href="/"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-xs font-semibold text-[#0d5c56] hover:underline"
                    >
                      Visa alla produkter
                    </Link>
                  </div>

                  {categories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/?category=${encodeURIComponent(cat.name)}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-[#0d5c56] transition-colors truncate"
                        >
                          {cat.name}
                        </Link>
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
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${encodeURIComponent(cat.name)}`}
                  className="hover:text-[#0d5c56] transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </header>
    </>
  );
}