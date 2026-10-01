"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, Heart, ShoppingBag, Truck, Clock, ShieldCheck, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetLink } from "@/components/ui/sheet";
import SearchBar from "@/components/header/search-bar";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d5c56]"
      aria-label="Group 4 — till startsidan"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b8e6e1]" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-[#0d5c56]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-extrabold tracking-tight text-[#0d5c56]">
          GROUP <span className="font-light">4</span>
        </span>
        <span className="text-[10px] font-semibold tracking-[0.18em] text-[#0d5c56] mt-1">
          SWEDISH COMMERCE
        </span>
      </span>
    </Link>
  );
}

function TopBar() {
  const items = [
    { icon: Truck, text: "Fri frakt över 499 kr" },
    { icon: Clock, text: "1-3 dagars leverans" },
    { icon: ShieldCheck, text: "Trygg betalning" },
  ];

  return (
    <div className="text-black" role="region" aria-label="Information">
      <div className="mx-auto flex items-center justify-center gap-6 px-4 py-2 text-sm font-medium">
        {items.map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
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
      <Button variant="ghost" size="icon" className="rounded-full">
        <Icon aria-hidden="true" />
      </Button>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant="default"
          className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-[#0d5c56] px-1 text-[10px] text-white hover:bg-[#0d5c56]"
          aria-label={`${badge} objekt`}
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
}

interface ShopHeaderProps {
  cartCount?: number;
}

export default function ShopHeader({ cartCount = 0 }: ShopHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetCloseRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { href: "/", label: "Start" },
    { href: "/catalog", label: "Katalog" },
  ];

  const categories = [
    "Beauty",
    "Fragrances",
    "Laptops",
    "Furniture",
    "Smartphones",
    "Tillbehör",
    "Klockor",
    "Väskor",
    "Kök & Mat",
  ];

  useEffect(() => {
    if (mobileMenuOpen) {
      sheetCloseRef.current?.focus();
    } else {
      menuButtonRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-[#0d5c56] focus:font-medium"
      >
        Hoppa till innehåll
      </a>
      <TopBar />
      <header className="border-b border-gray-100 bg-white" role="banner">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
          <Logo />
          <div className="hidden md:block flex-1 max-w-xl">
            <SearchBar />
          </div>
          <nav className="hidden md:flex items-center gap-1" aria-label="Konto och varukorg">
            <IconButton href="/account" icon={User} label="Konto" />
            <IconButton href="/wishlist" icon={Heart} label="Önskelista" badge={1} />
            <IconButton href="/cart" icon={ShoppingBag} label="Varukorg" badge={cartCount} />
          </nav>
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className="md:hidden ml-auto"
            aria-label="Öppna meny"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu aria-hidden="true" />
          </Button>
        </div>
        <div className="md:hidden px-4 pb-4">
          <SearchBar />
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400" role="heading" aria-level={2}>
          Navigation
        </p>
        {navLinks.map((link) => (
          <SheetLink
            key={link.href}
            href={link.href}
            onNavigate={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </SheetLink>
        ))}
        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400" role="heading" aria-level={2}>
          Kategorier
        </p>
        {categories.map((cat) => (
          <SheetLink
            key={cat}
            href={`/catalog?category=${encodeURIComponent(cat)}`}
            onNavigate={() => setMobileMenuOpen(false)}
          >
            {cat}
          </SheetLink>
        ))}
        <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400" role="heading" aria-level={2}>
          Konto
        </p>
        <SheetLink href="/account" onNavigate={() => setMobileMenuOpen(false)}>
          Konto
        </SheetLink>
        <SheetLink href="/wishlist" onNavigate={() => setMobileMenuOpen(false)}>
          Önskelista
        </SheetLink>
        <SheetLink href="/cart" onNavigate={() => setMobileMenuOpen(false)}>
          Varukorg
          {cartCount > 0 && (
            <Badge aria-label={`${cartCount} objekt`} className="ml-2">
              {cartCount}
            </Badge>
          )}
        </SheetLink>
      </Sheet>
    </>
  );
}
