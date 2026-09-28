"use client";

import { useActionState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { addProduct, type AddProductState } from "@/app/actions/productActions";
import type { Category } from "@/app/types";

interface AddProductFormProps {
  categories: Category[];
}

export default function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const [state, formAction] = useActionState(
    async (prevState: AddProductState | null, formData: FormData) => {
      const result = await addProduct(prevState, formData);
      if (result.success) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 my-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Add New Product</h1>

      <form
        ref={formRef}
        action={(formData) => {
          startTransition(() => {
            formAction(formData);
          });
        }}
        className="space-y-4"
      >
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium text-sm">
            ❌ {state.error}
          </div>
        )}

        {state?.success && state?.createdId && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium">
            ✅ Product <strong>#{state.createdId}</strong> was added successfully!
          </div>
        )}

        <div>
          <label htmlFor="title" className="mb-1 block font-medium text-gray-700">
            Product Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Eyeshadow Palette with Mirror"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div>
          <label htmlFor="brand" className="mb-1 block font-medium text-gray-700">
            Brand
          </label>
          <input
            id="brand"
            name="brand"
            type="text"
            placeholder="e.g. Glamour Beauty"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label htmlFor="sku" className="mb-1 block font-medium text-gray-700">
            SKU
          </label>
          <input
            id="sku"
            name="sku"
            type="text"
            placeholder="e.g. BEAUTY-EYESHADOW-001"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="mb-1 block font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="19.99"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label htmlFor="stock" className="mb-1 block font-medium text-gray-700">
              Stock *
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              placeholder="34"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="weight" className="mb-1 block font-medium text-gray-700">
              Weight (g)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              placeholder="9"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label htmlFor="rating" className="mb-1 block font-medium text-gray-700">
              Rating (0-5)
            </label>
            <input
              id="rating"
              name="rating"
              type="number"
              step="0.01"
              min="0"
              max="5"
              placeholder="2.86"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label htmlFor="categoryId" className="mb-1 block font-medium text-gray-700">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={categories[0]?.id}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.id} - {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div> 

        <div>
          <label
            htmlFor="warrantyInformation"
            className="mb-1 block font-medium text-gray-700"
          >
            Warranty Information
          </label>
          <select
            id="warrantyInformation"
            name="warrantyInformation"
            defaultValue="1 week warranty"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="3 days warranty">3 days warranty</option>
            <option value="1 week warranty">1 week warranty</option>
            <option value="1 month warranty">1 month warranty</option>
            <option value="1 year warranty">1 year warranty</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="mb-1 block font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="beauty, eyeshadow"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div>
          <label htmlFor="thumbnail" className="mb-1 block font-medium text-gray-700">
            Image URL
          </label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="url"
            placeholder="https://example.com/product-image.webp"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div> 

        <div>
          <label htmlFor="description" className="mb-1 block font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the product"
            className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-1/2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-center"
          >
            Cancel / Back
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="w-1/2 rounded-lg bg-violet-600 px-5 py-2.5 text-white hover:bg-violet-700 disabled:opacity-50 font-medium transition-colors"
          >
            {isPending ? "Saving..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}