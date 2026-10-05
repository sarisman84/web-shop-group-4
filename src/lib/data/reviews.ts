import { getSupabase } from "./_client";

export interface Review {
  id: number;
  product_id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  date: string;
}

/**
 * Fetches all reviews from Supabase, sorted by rating (highest first).
 * Throws on database errors.
 */
export async function getReviews(): Promise<Review[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("rating", { ascending: false });

  if (error) {
    throw new Error(`Unable to load reviews: ${error.message}`);
  }

  return data ?? [];
}
