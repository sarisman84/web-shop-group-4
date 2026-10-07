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
//   search.ts      searchProducts (client-safe: takes the caller's browser
//                  client, used by the header search bar)
//   orders.ts      createOrder, getOrders, getOrder (server-only; order
//                  creation after payment, order history)
//
// Client rules:
//   - Server components and server actions just call the functions; the
//     layer uses ONE shared cookie-aware client per request
//     (`src/lib/supabase/server.ts`, deduped in `./_client` with
//     `React.cache`), so RLS policies always see the caller's session.
//   - Client components never import the server-only modules. The one
//     client-side query (`searchProducts`) receives the browser client from
//     `src/lib/supabase/client.ts` as a parameter. Client components must
//     import it from `@/lib/data/search` directly — importing this barrel
//     from a client component would pull the server-only modules (and
//     next/headers) into the client bundle.
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
export { searchProducts, type SearchHit } from "./search";
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
