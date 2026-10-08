// ---------------------------------------------------------------------------
// Data access layer (T89) — the single entry point for every read from and
// write to the Supabase backend.
//
// One module per table, re-exported here:
//
//   products.ts    getProducts, getStockSummary, getProduct, createProduct,
//                  updateProduct, updateProductStock, deleteProduct,
//                  getPromoProducts
//                  (server-only; getProducts takes an optional `sort` so the
//                  landing page rows can rank by discount or rating, and
//                  getPromoProducts returns a narrow image-only slice for the
//                  landing page promo collage)
//   categories.ts  getCategories (server-only)
//   orders.ts      createOrder, getOrders, getOrder (server-only; order
//                  creation after payment, order history)
//   addresses.ts   getAddresses, createAddress, updateAddress, deleteAddress
//                  (server-only; saved delivery addresses on the account
//                  page, T98)
//
// Client rules:
//   - Server components and server actions just call the functions; the
//     layer uses ONE shared cookie-aware client per request
//     (`src/lib/supabase/server.ts`, deduped in `./_client` with
//     `React.cache`), so RLS policies always see the caller's session.
//   - Client components never import the server-only modules. If a client
//     component needs a Supabase client, it should import
//     `createClient()` from `src/lib/supabase/client.ts` directly —
//     importing this barrel from a client component would pull the
//     server-only modules (and next/headers) into the client bundle. A
//     client component that only needs a row *type* may `import type` it
//     from the owning module (`@/lib/data/addresses`): type-only imports
//     are erased at build time.
//   - No `supabase.from(...)` anywhere outside `src/lib/data/` and the
//     client factories in `src/lib/supabase/`.
//
// Error policy: functions throw on database errors. Write functions
// (create/update/delete) additionally read the row back afterwards, because
// Supabase reports an RLS-rejected write as "no error, zero rows" — a
// rejection throws `WriteRejectedError` instead of reporting success.
// Server actions translate throws into form errors.
// ---------------------------------------------------------------------------

export {
  WriteRejectedError,
  ProductsFetchError,
  PGRST_RANGE_NOT_SATISFIABLE,
  createProduct,
  deleteProduct,
  getCatalogFacets,
  getProduct,
  getProducts,
  getPromoProducts,
  getStockSummary,
  updateProduct,
  updateProductStock,
  type CatalogFacets,
  type CreateProductPayload,
  type GetProductsParams,
  type GetPromoProductsParams,
  type ProductSort,
  type PromoProduct,
  type StockFilter,
  type StockSummary,
  type UpdateProductPayload,
} from "./products";
export { getCategories } from "./categories";
export {
  createOrder,
  getOrder,
  getOrders,
  type CreateOrderInput,
  type CreateOrderResult,
  type Order,
  type OrderLine,
  type OrderStatus,
} from "./orders";
export {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  type Address,
  type AddressInput,
} from "./addresses";
