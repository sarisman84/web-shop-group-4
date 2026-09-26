"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/app/lib/validation";

export interface AddProductState {
  success: boolean;
  error: string | null;
  createdId?: number;
}

export interface DeleteProductState {
  success: boolean;
  error: string | null;
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

export async function deleteProduct(
  _previousState: DeleteProductState | null,
  formData: FormData,
): Promise<DeleteProductState> {
  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "The product could not be deleted." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error(`Failed to delete product ${productId} in Supabase:`, error);
    return {
      success: false,
      error: "The product could not be deleted. Please try again.",
    };
  }

  // A delete rejected by RLS also returns no error, so confirm the row is gone
  // instead of telling the user it was deleted when it still is.
  const { data: stillThere } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (stillThere) {
    return {
      success: false,
      error: "The product could not be deleted. You are not allowed to delete it.",
    };
  }

  revalidatePath("/");
  revalidatePath(`/product/${productId}`);

  return { success: true, error: null };
}