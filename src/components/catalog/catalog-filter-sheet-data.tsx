import { getCatalogFacets } from "@/lib/data";
import CatalogFilterSheet from "@/components/catalog/catalog-filter-sheet";
import type { FilterCategory } from "@/components/catalog/filter-panel";

interface CatalogFilterSheetDataProps {
  categories: FilterCategory[];
}

// The mobile "Filter (N)" chip + sheet, behind its own Suspense boundary. It
// fetches the catalogue facets (brands + price bounds) itself — deduped with
// the desktop sidebar via React.cache — so the products page does not suspend
// on that query and the grid's skeleton can show while getProducts resolves.
export default async function CatalogFilterSheetData({
  categories,
}: CatalogFilterSheetDataProps) {
  const facets = await getCatalogFacets();
  return (
    <CatalogFilterSheet
      categories={categories}
      brands={facets.brands}
      priceBounds={facets.priceBounds}
    />
  );
}
