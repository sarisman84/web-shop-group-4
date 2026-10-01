"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  function handleSearch(formData: FormData) {
    const q = formData.get("q") as string;
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <form action={handleSearch} className="relative flex-1 max-w-xl">
      <Input
        name="q"
        type="search"
        placeholder="Sök..."
        defaultValue={query}
        className="h-10 rounded-full bg-gray-50 pr-12 text-sm placeholder:text-gray-400 focus-visible:ring-[#0d5c56]/30"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        type="submit"
        aria-label="Sök"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-gray-500 hover:text-[#0d5c56]"
      >
        <Search />
      </Button>
    </form>
  );
}
