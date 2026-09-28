import AddProductForm from "@/app/components/AddProductform";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/app/types";

export default async function AddProductPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, image")
    .order("name");

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return (
    <main>
      <AddProductForm categories={(categories ?? []) as Category[]} />
    </main>
  );
}