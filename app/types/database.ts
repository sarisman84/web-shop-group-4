// Supabase table types, written by hand from the live tables (snake_case,
// exactly as stored). These are only used by app/lib/supabase.ts and the
// row -> app type mapping in app/lib/api.ts; the rest of the app uses the
// camelCase types in ./index.ts.
//
// Can be replaced by generated types later:
//   npx supabase gen types typescript --project-id <id> > app/types/database.ts

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
  barcode: string | null;
  qr_code: string | null;
  images: string[] | null;
  thumbnail: string | null;
  meta_created_at: string;
  meta_updated_at: string;
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
        Insert: Omit<ProductRow, "id" | "meta_created_at" | "meta_updated_at"> &
          Partial<Pick<ProductRow, "id" | "meta_created_at" | "meta_updated_at">>;
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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
