export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  category?: Category;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  // Optional because products.meta is a jsonb object and the 5 products added
  // through the app have none of these keys; ProductMetadata hides what is empty.
  meta: {
    createdAt?: string;
    updatedAt?: string;
    barcode?: string;
    qrCode?: string;
  };
  images: string[];
  thumbnail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}

// --- Webshop types (T41) ---
// The row shapes below mirror the Supabase tables they map to (camelCase,
// exactly as the app sees them): `profiles` and `addresses` from the T92
// migration (supabase/migrations/20261007000000_create_profiles_and_addresses.sql),
// `orders`/`order_items` from T53. Convert to the snake_case row types in
// src/types/database.ts at the data-layer boundary, as src/lib/data/orders.ts
// does for orders.
//
// Shapes follow the PRD: cart (FR-5, ADR-005), order history and user account
// with delivery addresses (§5.3).

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: number;
  title: string;
  // Price at time of purchase, so later price changes don't rewrite history
  price: number;
  quantity: number;
}

/** The four delivery fields, shared by a saved address and by the snapshot
 *  an order keeps for itself (T109 added the shipping_* columns to `orders`). */
export interface AddressDetails {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

/** A saved delivery address: one `addresses` row, owned by `userId`. */
export interface Address extends AddressDetails {
  // Supabase Auth user ids are UUID strings
  id: string;
  userId: string;
  // The single address checkout pre-selects (addresses.is_default)
  isDefault: boolean;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: AddressDetails;
  createdAt: string;
}

/** The signed-in user: their `profiles` row plus the email, which lives on
 *  auth.users and is not part of the table (read via supabase.auth). */
export interface User {
  // profiles.id and auth.users.id are the same uuid
  id: string;
  email: string;
  // Nullable columns on profiles: the row starts empty at sign-up
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  // Only present when the caller loaded them; otherwise query the data layer
  addresses?: Address[];
  createdAt: string;
  // Maintained by the profiles_touch_updated_at trigger
  updatedAt: string;
}
