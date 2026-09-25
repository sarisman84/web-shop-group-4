import AddProductForm from "@/app/components/AddProductform";
import { getCategories } from "@/app/lib/api";
import type { Category } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getNextId() {
  // Låt denna stå kvar tills ni tar er an nästa ticket för ID/POST-logik
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products || data.data || [];
      if (list.length > 0) {
        const ids = list
          .map((p: { id: unknown }) => parseInt(String(p.id), 10))
          .filter((id: number) => !isNaN(id));
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
      }
    }
  } catch (err) {
    console.error("Failed to fetch next ID:", err);
  }
  return 1;
}

export default async function AddProductPage() {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch (err) {
    console.error("Failed to load categories in AddProductPage:", err);
  }

  const nextId = await getNextId();

  return (
    <main>
      <AddProductForm categories={categories} nextId={nextId} />
    </main>
  );
}