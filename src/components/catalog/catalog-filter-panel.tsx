import { getCatalogFacets } from "@/lib/data";
import CatalogFilter from "@/components/catalog/catalog-filter";
import type {
  FilterBrand,
  FilterCategory,
  PriceBounds,
} from "@/components/catalog/filter-panel";

interface CatalogFilterPanelProps {
  categories: FilterCategory[];
  /** Reports the active-filter count to the mobile sheet's chip. */
  onActiveCountChange?: (count: number) => void;
}

// The desktop filter sidebar, behind its own Suspense boundary. It fetches the
// catalogue facets (brands + price bounds) itself, so the products page does
// not suspend on that query — the grid's Suspense boundary can show its
// skeleton while getProducts resolves, and the panel streams in right after.
export default async function CatalogFilterPanel({
  categories,
  onActiveCountChange,
}: CatalogFilterPanelProps) {
  const facets = await getCatalogFacets();
  return (
    <CatalogFilter
      categories={categories}
      brands={facets.brands as FilterBrand[]}
      priceBounds={facets.priceBounds as PriceBounds}
      onActiveCountChange={onActiveCountChange}
    />
  );
}
