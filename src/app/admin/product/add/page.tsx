import AddProductForm from "@/app/admin/components/AddProductform";
import { getCategories } from "@/lib/data";

export default async function AddProductPage() {
  // Categories for the form's category select come from the data layer;
  // a failure throws and surfaces as the page's error state. The form has
  // always shown them alphabetically, so keep that order.
  const categories = (await getCategories()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <main>
      <AddProductForm categories={categories} />
    </main>
  );
}
