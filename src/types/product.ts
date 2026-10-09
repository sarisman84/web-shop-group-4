export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  currency: string;
  image: string;
  review_count: number;
  review_sum: number;
  discountPercentage?: number | null;
  // Needed by the card's buy button; undefined means unknown (treated as available).
  stock?: number;
  minimumOrderQuantity?: number;
}
