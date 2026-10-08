"use server";

import { revalidatePath } from "next/cache";
import {
  createAddress,
  deleteAddress,
  updateAddress,
  WriteRejectedError,
} from "@/lib/data";
import {
  addressSchema,
  type AddressFormField,
  type AddressFormValues,
} from "@/app/(shop)/lib/validation";

// ---------------------------------------------------------------------------
// Delivery address server actions (T98, PRD §5.3 Child US5: add, edit and
// delete saved addresses from the account page).
//
// Every action validates its FormData with the zod schema, then writes
// through the data layer (`src/lib/data/addresses.ts`), which uses the
// cookie-aware SSR client from `src/lib/supabase/server.ts` — so the caller's
// session is sent and the owner-only RLS policies on `addresses` decide what
// may be read or written. Nothing about the row (ownership included) is
// trusted from the browser.
//
// All three revalidate `/account/addresses`, so Next.js re-renders the page
// with the fresh list in the same response as the action's return value.
// ---------------------------------------------------------------------------

/** Per-field validation messages, keyed by the address form field. */
export type AddressFieldErrors = Partial<Record<AddressFormField, string>>;

/** What an address action reports back to the form that called it. */
export interface AddressActionState {
  success: boolean;
  /** Swedish confirmation shown after a successful mutation. */
  message: string | null;
  /** Swedish error shown when validation or the write failed. */
  error: string | null;
  fieldErrors: AddressFieldErrors;
}

/** Parses the address form and turns zod issues into per-field messages, so
 * the first error is both a form-level message and a hint under its field. */
function parseAddressForm(
  formData: FormData,
):
  | { values: AddressFormValues; fieldErrors: AddressFieldErrors; error: null }
  | { values: null; fieldErrors: AddressFieldErrors; error: string } {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );

  const result = addressSchema.safeParse(raw);
  if (result.success) {
    return { values: result.data, fieldErrors: {}, error: null };
  }

  const fieldErrors: AddressFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field as AddressFormField]) {
      fieldErrors[field as AddressFormField] = issue.message;
    }
  }

  const firstError = Object.values(fieldErrors).find(Boolean);
  return {
    values: null,
    fieldErrors,
    error: firstError ?? "Kontrollera adressuppgifterna.",
  };
}

function readAddressId(formData: FormData): string {
  const raw = formData.get("addressId");
  return typeof raw === "string" ? raw.trim() : "";
}

/** The message to show for a failed write: RLS rejections get their own
 * sentence, everything else a retry hint (the real reason is logged). */
function failureMessage(error: unknown, fallback: string): string {
  if (error instanceof WriteRejectedError) {
    return "Du har inte behörighet att hantera den adressen.";
  }
  return fallback;
}

const REQUIRED_FIELDS: AddressFieldErrors = {};

/**
 * Adds the address in the form to the signed-in user's saved addresses.
 *
 * Signature matches the `useActionState` pattern used across the app: the
 * previous state is ignored, the fresh one is returned.
 */
export async function addAddressAction(
  _previousState: AddressActionState | null,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = parseAddressForm(formData);
  if (!parsed.values) {
    return {
      success: false,
      message: null,
      error: parsed.error,
      fieldErrors: parsed.fieldErrors,
    };
  }

  try {
    await createAddress({
      ...parsed.values,
      isDefault: formData.get("isDefault") !== null,
    });
  } catch (error) {
    console.error("Failed to add the delivery address:", error);
    return {
      success: false,
      message: null,
      error: failureMessage(error, "Adressen kunde inte sparas. Försök igen."),
      fieldErrors: REQUIRED_FIELDS,
    };
  }

  revalidatePath("/account/addresses");

  return {
    success: true,
    message: "Adressen har lagts till.",
    error: null,
    fieldErrors: {},
  };
}

/**
 * Updates one of the caller's addresses with the values in the form. The id
 * comes from a hidden field; RLS still limits the update to the caller's own
 * rows.
 */
export async function updateAddressAction(
  _previousState: AddressActionState | null,
  formData: FormData,
): Promise<AddressActionState> {
  const addressId = readAddressId(formData);
  if (!addressId) {
    return {
      success: false,
      message: null,
      error: "Adressen kunde inte uppdateras. Ladda om sidan och försök igen.",
      fieldErrors: REQUIRED_FIELDS,
    };
  }

  const parsed = parseAddressForm(formData);
  if (!parsed.values) {
    return {
      success: false,
      message: null,
      error: parsed.error,
      fieldErrors: parsed.fieldErrors,
    };
  }

  try {
    await updateAddress(addressId, {
      ...parsed.values,
      isDefault: formData.get("isDefault") !== null,
    });
  } catch (error) {
    console.error(`Failed to update delivery address ${addressId}:`, error);
    return {
      success: false,
      message: null,
      error: failureMessage(error, "Adressen kunde inte uppdateras. Försök igen."),
      fieldErrors: REQUIRED_FIELDS,
    };
  }

  revalidatePath("/account/addresses");

  return {
    success: true,
    message: "Adressen har uppdaterats.",
    error: null,
    fieldErrors: {},
  };
}

/**
 * Deletes one of the caller's addresses after the client asked for
 * confirmation. The id comes from a hidden field; RLS still limits the
 * delete to the caller's own rows, and the data layer verifies the row is
 * actually gone.
 */
export async function deleteAddressAction(
  _previousState: AddressActionState | null,
  formData: FormData,
): Promise<AddressActionState> {
  const addressId = readAddressId(formData);
  if (!addressId) {
    return {
      success: false,
      message: null,
      error: "Adressen kunde inte tas bort. Ladda om sidan och försök igen.",
      fieldErrors: REQUIRED_FIELDS,
    };
  }

  try {
    await deleteAddress(addressId);
  } catch (error) {
    console.error(`Failed to delete delivery address ${addressId}:`, error);
    return {
      success: false,
      message: null,
      error: failureMessage(error, "Adressen kunde inte tas bort. Försök igen."),
      fieldErrors: REQUIRED_FIELDS,
    };
  }

  revalidatePath("/account/addresses");

  return {
    success: true,
    message: "Adressen har tagits bort.",
    error: null,
    fieldErrors: {},
  };
}
