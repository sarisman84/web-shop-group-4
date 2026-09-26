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
// No Supabase tables exist for these yet (only products, categories, reviews).
// Shapes follow the PRD: cart (FR-5, ADR-005), order history and user account
// with delivery addresses. Adjust once the tables are created.

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

export interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface Order {
  id: number;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
}

export interface User {
  // Supabase Auth user ids are UUID strings
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses?: Address[];
  createdAt: string;
}
