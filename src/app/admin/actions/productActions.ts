"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  WriteRejectedError,
  // Aliased: the server action below keeps the public name `deleteProduct`
  deleteProduct as removeProduct,
} from "@/lib/data";
import { productSchema } from "@/app/admin/lib/validation";

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

  try {
    const createdId = await createProduct({
      title,
      // brand,
      price,
      stock,
      // sku,
      categoryId,
      // warrantyInformation,
      // description,
      // // Safely check if tags exist before splitting
      // tags: tags
      //   ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      //   : [],
      thumbnail,
      ...(weight === undefined ? {} : { weight }),
      ...(rating === undefined ? {} : { rating }),
    });

    revalidatePath("/");
    revalidatePath("/product/add");

    return { success: true, error: null, createdId };
  } catch (error) {
    console.error("Failed to add product to Supabase:", error);
    return {
      success: false,
      error: "The product could not be added. Please try again.",
    };
  }
}

export async function deleteProduct(
  _previousState: DeleteProductState | null,
  formData: FormData,
): Promise<DeleteProductState> {
  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, error: "The product could not be deleted." };
  }

  try {
    await removeProduct(productId);

    revalidatePath("/");
    revalidatePath(`/product/${productId}`);

    return { success: true, error: null };
  } catch (error) {
    console.error(`Failed to delete product ${productId} in Supabase:`, error);
    // The data layer throws WriteRejectedError when the row still exists
    // after the delete (RLS rejection or missing product); the user gets a
    // specific message in that case.
    if (error instanceof WriteRejectedError) {
      return {
        success: false,
        error: "The product could not be deleted. You are not allowed to delete it.",
      };
    }
    return {
      success: false,
      error: "The product could not be deleted. Please try again.",
    };
  }
}
