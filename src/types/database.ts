// Supabase table types, written by hand from the live tables (snake_case,
// exactly as stored in Postgres). Used by the shared client factories in
// src/lib/supabase/ and by the row -> app type mapping in src/lib/data/;
// the rest of the app uses the camelCase domain types (src/app/admin/types,
// src/types/product.ts).
//
// Insert/Update mirror the real column defaults (identity ids, default
// ''/0/'{}' columns) so the typed clients accept the same payloads the
// untyped client did.
//
// Can be replaced by generated types later:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export type ProductRow = {
  id: number;
  title: string;
  description: string | null;
  category_id: number;
  price: number;
  discount_percentage: number | null;
  rating: number | null;
  stock: number | null;
  tags: string[] | null;
  brand: string | null;
  sku: string | null;
  weight: number | null;
  dimensions: { width: number; height: number; depth: number } | null;
  warranty_information: string | null;
  shipping_information: string | null;
  availability_status: string | null;
  return_policy: string | null;
  minimum_order_quantity: number | null;
  images: string[] | null;
  thumbnail: string | null;
  // Same four keys as the old JSON file. Kept as jsonb rather than split into
  // columns: nothing filters, sorts or searches on them, they are only shown in
  // ProductMetadata. updatedAt/createdAt are stamped by the products_touch_meta
  // trigger, not by the app.
  meta: {
    createdAt?: string;
    updatedAt?: string;
    barcode?: string;
    qrCode?: string;
  } | null;
};

export type ProductInsert = {
  // id is a Postgres identity column (BY DEFAULT)
  id?: number;
  title: string;
  // description/price/meta have database defaults ('', 0, '{}')
  description?: string | null;
  category_id: number;
  price?: number | null;
  discount_percentage?: number | null;
  rating?: number | null;
  stock?: number | null;
  tags?: string[] | null;
  brand?: string | null;
  sku?: string | null;
  weight?: number | null;
  dimensions?: { width: number; height: number; depth: number } | null;
  warranty_information?: string | null;
  shipping_information?: string | null;
  availability_status?: string | null;
  return_policy?: string | null;
  minimum_order_quantity?: number | null;
  images?: string[] | null;
  thumbnail: string;
  meta?: {
    createdAt?: string;
    updatedAt?: string;
    barcode?: string;
    qrCode?: string;
  } | null;
};

export type ReviewRow = {
  id: number;
  product_id: number;
  date: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  reviewer_email: string;
};

/** A `public.profiles` row: one per auth user, created by the
 * `handle_new_user` trigger (T92). Email is not here — it lives on
 * `auth.users`, which is a different schema and is read through
 * `supabase.auth.getUser()` instead. */
export type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  // No default: the row belongs to an existing auth user, so the caller must
  // name it. The app normally lets the handle_new_user trigger do this.
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
};

/** An `public.addresses` row: a saved delivery address of one user (T92). */
export type AddressRow = {
  id: string;
  user_id: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  is_default: boolean;
  created_at: string;
};

export type AddressInsert = {
  // id has a database default (gen_random_uuid()), but the data layer may
  // generate it so the insert needs no read-back.
  id?: string;
  user_id: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  is_default?: boolean;
  created_at?: string;
};

/** Matches the `public.order_status` enum in the orders migration. */
export type OrderStatus = "pending" | "paid" | "shipped" | "delivered";

export type OrderRow = {
  id: string;
  /** Null for guest checkout. */
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  stripe_session_id: string | null;
  created_at: string;
};

export type OrderItemRow = {
  id: number;
  order_id: string;
  /** Null if the product was deleted after the order (snapshot name/price stay). */
  product_id: number | null;
  name: string;
  price: number;
  quantity: number;
};

export type OrderInsert = {
  // id is a uuid with a database default, but the data layer generates it so
  // the insert needs no read-back (RLS can hide a fresh guest order).
  id?: string;
  user_id?: string | null;
  customer_email: string;
  customer_name: string;
  total?: number;
  status?: OrderStatus;
  stripe_session_id?: string | null;
  created_at?: string;
};

export type OrderItemInsert = {
  // id is a Postgres identity column (GENERATED ALWAYS), so it is never sent.
  order_id: string;
  product_id?: number | null;
  name: string;
  price: number;
  quantity: number;
};

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: CategoryRow;
        Insert: Omit<CategoryRow, "id"> & { id?: number };
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductRow>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Omit<ReviewRow, "id"> & { id?: number };
        Update: Partial<ReviewRow>;
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemRow>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileRow>;
        // The id foreign key points at auth.users (auth schema), so — like
        // orders.user_id — it has no Relationships entry here.
        Relationships: [];
      };
      addresses: {
        Row: AddressRow;
        Insert: AddressInsert;
        Update: Partial<AddressRow>;
        // user_id references auth.users (auth schema), not a public table.
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
