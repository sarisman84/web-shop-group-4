"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/app/lib/validation";

export interface AddProductState {
  success: boolean;
  error: string | null;
  createdId?: number;
}

export async function addProduct(
  _previousState: AddProductState | null,
  formData: FormData,
): Promise<AddProductState> {
  const values = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );
  const result = productSchema.safeParse(values);

  if (!result.success) {
    const firstError = Object.values(result.error.flatten().fieldErrors)
      .flat()
      .find(Boolean);
    return {
      success: false,
      error: firstError ?? "Please check the product details.",
    };
  }

  const {
    title,
    // brand,
    price,
    stock,
    // sku,
    categoryId,
    // warrantyInformation,
    // description,
    // tags,
    thumbnail,
    weight,
    rating,
  } = result.data;

 const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      // brand,
      price,
      stock,
      // sku,
      category_id: categoryId,                 // Map to snake_case
      // warranty_information: warrantyInformation, // Map to snake_case
      // description,
      // // Safely check if tags exist before splitting
      // tags: tags
      //   ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      //   : [],
      thumbnail,
      ...(weight === undefined ? {} : { weight }),
      ...(rating === undefined ? {} : { rating }),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to add product to Supabase:", error);
    return {
      success: false,
      error: "The product could not be added. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/product/add");

  return { success: true, error: null, createdId: data.id };
}

export async function deleteProduct(productId: number) {
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("Invalid product ID");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(`Unable to delete product ${productId}: ${error.message}`);
  }

  revalidatePath("/");
}