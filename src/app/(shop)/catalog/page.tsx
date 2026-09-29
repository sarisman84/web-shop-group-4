import Filter from "@/components/aside/filter";
import GridCollection from "@/components/collections/grid-collection";
import Hero from "@/components/header/hero";

export default async function CatalogPage() {
  return (
    <main>
      <Hero />
      <div>
        <Filter />
        <GridCollection />
      </div>
    </main>
  );
}
