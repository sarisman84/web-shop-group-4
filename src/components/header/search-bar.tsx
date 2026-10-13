"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";

// How long to wait after the last keystroke before the live search hits the
// catalogue, so a word is fetched once instead of per character.
const LIVE_SEARCH_DELAY_MS = 300;

export default function SearchBar() {
  const t = useTranslations("header");
  const router = useRouter();
  const searchParams = useSearchParams();
  // A debounced callback can outlive the render that scheduled it (e.g. a
  // filter click lands while a keystroke is still pending), so the params are
  // read through a ref that is refreshed after every render.
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  });
  // Trim so the input mirrors the value the catalogue actually queries with
  // (the page trims ?search= before filtering); a raw URL with surrounding
  // spaces would otherwise show padded text in the box.
  const urlSearch = (searchParams.get("search") || "").trim();
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the URL's search param changes without a
  // remount (e.g. navigating between filtered catalogue views). Adjusting
  // state during render (instead of in an effect) is React's recommended
  // pattern for mirroring an external value into local state.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  // The search is always added on top of the active filters (category,
  // brand, price, ...): every other param is carried over and only the page
  // resets, so the catalogue applies the same filtering logic the filter
  // bar and shop header use.
  function applySearch(term: string) {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    params.delete("page");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/products?${query}` : "/products");
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applySearch(searchQuery.trim());
  };

  // Live search: each keystroke re-arms the debounce, and the last one
  // navigates. The Enter key (form submit) skips the wait.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applySearch(value.trim());
    }, LIVE_SEARCH_DELAY_MS);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder={t("search")}
          aria-busy={isPending}
          className={`w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-[#0d5c56] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d5c56] ${isPending ? "opacity-60" : ""}`}
          aria-label={t("search")}
        />
      </div>
    </form>
  );
}
