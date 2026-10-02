"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
// Import the client-safe module directly (not the @/lib/data barrel): the
// barrel also re-exports the server-only modules, which pull next/headers
// into the client bundle.
import { searchProducts } from "@/lib/data/search";

// One browser client for this component; the query itself lives in the data
// layer (src/lib/data/search.ts), so no supabase.from() in components.
const supabase = createClient();

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      router.push("/");
      return;
    }

    startTransition(async () => {
      try {
        await searchProducts(query, supabase);
      } catch (error) {
        console.error("Search error:", error);
      }

      const params = new URLSearchParams();
      params.set("search", query);
      router.push(`/?${params.toString()}`);
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
          className="w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-[#0d5c56] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0d5c56]"
          aria-label="Sök produkter"
        />
      </div>
    </form>
  );
}
