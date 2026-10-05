"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [isPending, startTransition] = useTransition();

  // Keep the input in sync when the URL's search param changes without a
  // remount (e.g. navigating between filtered catalogue views). Adjusting
  // state during render (instead of in an effect) is React's recommended
  // pattern for mirroring an external value into local state.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchQuery.trim();

    // Results live on the catalogue page; carry over any other active params
    // (e.g. category) so searching from a category view narrows within it,
    // and always reset to the first page.
    const params = new URLSearchParams(searchParams.toString());
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
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sök produkter..."
          disabled={isPending}
          className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-[#0d5c56] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d5c56] disabled:opacity-60"
          aria-label="Sök produkter"
        />
      </div>
    </form>
  );
}
