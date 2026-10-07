import { randomUUID } from "node:crypto";
import { getSupabase } from "./_client";
import { WriteRejectedError } from "./products";
import type { AddressRow } from "@/types/database";

// ---------------------------------------------------------------------------
// addresses — the single entry point for every read from and write to the
// Supabase `addresses` table (T98, PRD §5.3 Child US5: saved delivery
// addresses that checkout will reuse).
//
// Server-only: every function below runs on the server with the shared
// cookie-aware client from `./_client` (see `src/lib/supabase/server.ts`),
// so the owner-only RLS policies on `addresses` always see the caller's real
// session. Pages, server actions and components must import these functions
// instead of building `supabase.from("addresses")` queries of their own.
//
// Writes require a session (checked up front), and are read back afterwards:
// Supabase reports a write that RLS silently drops as "no error, zero rows",
// so trusting the absence of an error would report success while nothing was
// saved. A mismatch throws `WriteRejectedError`, which server actions turn
// into a form error.
// ---------------------------------------------------------------------------

/** The client type of the shared data-layer client, spelled without importing
 * `@supabase/supabase-js` into this module's public API. */
type SupabaseClient = Awaited<ReturnType<typeof getSupabase>>;

/** One saved delivery address of the signed-in user, camelCase (the table
 * stores snake_case — see `toAddress`). */
export interface Address {
  id: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  /** The address checkout should preselect. At most one row per user holds
   * it; the first saved address becomes the default. */
  isDefault: boolean;
  createdAt: string;
}

/** Input for {@link createAddress} and {@link updateAddress}. All four text
 * fields are required; `isDefault` defaults to false (but see the note in
 * {@link createAddress} about a user's first address). */
export interface AddressInput {
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Converts one raw `addresses` row (snake_case) into the camelCase `Address`
 * type used by the app.
 */
function toAddress(row: AddressRow): Address {
  return {
    id: row.id,
    street: row.street,
    postalCode: row.postal_code,
    city: row.city,
    country: row.country,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

/**
 * The signed-in user's id. Every write in this module calls it first, so an
 * anonymous caller fails with a clear error instead of relying on RLS alone
 * to reject the statement.
 *
 * Throws when there is no session.
 */
async function requireUserId(supabase: SupabaseClient): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage delivery addresses.");
  }

  return user.id;
}

/** Trims the four required fields and rejects an empty one, so callers
 * cannot persist whitespace-only values (the zod schema in
 * `src/app/(shop)/lib/validation.ts` does the same for form input). */
function normalize(input: AddressInput): AddressInput {
  const street = input.street.trim();
  const postalCode = input.postalCode.trim();
  const city = input.city.trim();
  const country = input.country.trim();

  if (!street || !postalCode || !city || !country) {
    throw new Error("An address needs a street, postal code, city and country.");
  }

  return { street, postalCode, city, country, isDefault: Boolean(input.isDefault) };
}

/** One row by id, or `null` when it does not exist or the caller may not see
 * it (so an RLS-rejected write reads back as `null`).
 *
 * Throws on database errors. */
async function readAddress(
  supabase: SupabaseClient,
  addressId: string,
): Promise<Address | null> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read address ${addressId}: ${error.message}`);
  }

  return data ? toAddress(data) : null;
}

/**
 * The signed-in caller's saved delivery addresses, the default one first and
 * the rest oldest first. Returns an empty array when there is nothing to
 * show (the RLS select policy only grants rows to the owner).
 *
 * Throws on database errors.
 *
 * @example
 * ```tsx
 * // src/app/(shop)/account/addresses/page.tsx (server component)
 * import { getAddresses } from "@/lib/data";
 *
 * const addresses = await getAddresses();
 * ```
 */
export async function getAddresses(): Promise<Address[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Unable to load addresses: ${error.message}`);

  return (data ?? []).map(toAddress);
}

/**
 * Saves a new delivery address for the signed-in user and returns it.
 *
 * A user's very first address becomes the default even when `isDefault` was
 * not asked for, so checkout always has one address to preselect. When the
 * saved address is the default, every other default flag is cleared in the
 * same call, so at most one row per user carries it.
 *
 * @throws Error when there is no session, the input is incomplete, or the
 * database rejected the insert.
 * @throws WriteRejectedError when the row is not visible to the caller after
 * the insert (it never should be — the insert would have been rejected
 * first).
 *
 * @example
 * ```ts
 * // src/app/(shop)/actions/address-actions.ts (server action)
 * import { createAddress } from "@/lib/data";
 *
 * await createAddress({ street, postalCode, city, country, isDefault });
 * ```
 */
export async function createAddress(input: AddressInput): Promise<Address> {
  const supabase = await getSupabase();
  const userId = await requireUserId(supabase);
  const values = normalize(input);

  const { count, error: countError } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Unable to count your addresses: ${countError.message}`);
  }

  const addressId = randomUUID();
  const isDefault = values.isDefault || (count ?? 0) === 0;

  const { error } = await supabase.from("addresses").insert({
    id: addressId,
    user_id: userId,
    street: values.street,
    postal_code: values.postalCode,
    city: values.city,
    country: values.country,
    is_default: isDefault,
  });

  if (error) {
    throw new Error(`Unable to add the address: ${error.message}`);
  }

  if (isDefault) {
    // The row just written wins; the others lose the flag. RLS keeps this
    // update on the caller's own rows.
    const { error: clearError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("is_default", true)
      .neq("id", addressId);

    if (clearError) {
      throw new Error(`Unable to set the default address: ${clearError.message}`);
    }
  }

  const created = await readAddress(supabase, addressId);
  if (!created) {
    throw new WriteRejectedError(
      `Address ${addressId} was created but is not visible to this user (RLS)`,
    );
  }

  return created;
}

/**
 * Updates one of the caller's addresses from the edit form.
 *
 * Runs on the cookie-aware client, so RLS decides whether the row may be
 * changed, and reads the row back afterwards: an update that RLS rejects (or
 * that targets another user's id) affects zero rows without an error, so
 * trusting the absence of an error would report success while the old values
 * stay in the database. Setting `isDefault` also clears the flag on every
 * other default row of the caller.
 *
 * Throws on database errors and on rejected writes ({@link WriteRejectedError}).
 *
 * @example
 * ```ts
 * // src/app/(shop)/actions/address-actions.ts (server action)
 * import { updateAddress } from "@/lib/data";
 *
 * await updateAddress(addressId, { street, postalCode, city, country, isDefault });
 * ```
 */
export async function updateAddress(
  addressId: string,
  input: AddressInput,
): Promise<Address> {
  if (!addressId) {
    throw new Error("An address id is required.");
  }

  const supabase = await getSupabase();
  await requireUserId(supabase);
  const values = normalize(input);

  const { error } = await supabase
    .from("addresses")
    .update({
      street: values.street,
      postal_code: values.postalCode,
      city: values.city,
      country: values.country,
      is_default: values.isDefault,
    })
    .eq("id", addressId);

  if (error) {
    throw new Error(`Unable to update the address: ${error.message}`);
  }

  const saved = await readAddress(supabase, addressId);
  if (
    !saved ||
    saved.street !== values.street ||
    saved.postalCode !== values.postalCode ||
    saved.city !== values.city ||
    saved.country !== values.country ||
    saved.isDefault !== values.isDefault
  ) {
    throw new WriteRejectedError(
      `Update to address ${addressId} was rejected (missing address, or an RLS policy that does not allow this user to update it)`,
    );
  }

  if (saved.isDefault) {
    const { error: clearError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("is_default", true)
      .neq("id", addressId);

    if (clearError) {
      throw new Error(`Unable to set the default address: ${clearError.message}`);
    }
  }

  return saved;
}

/**
 * Deletes one of the caller's addresses.
 *
 * Runs on the cookie-aware client and verifies the row is actually gone: a
 * delete that RLS rejects (or that targets another user's id) returns no
 * error, so the row is read back afterwards.
 *
 * The `is_default` flag lives on the row itself, so deleting the default
 * address takes the flag with it — no other row is left pointing at a
 * deleted address, and the next address saved becomes the default again
 * (see {@link createAddress}).
 *
 * @throws Error on database errors.
 * @throws WriteRejectedError when the row still exists after the delete
 * (missing address, or an RLS policy that does not allow this user to delete
 * it) — callers can use this to show a specific "not allowed" message.
 *
 * @example
 * ```ts
 * // src/app/(shop)/actions/address-actions.ts (server action)
 * import { deleteAddress, WriteRejectedError } from "@/lib/data";
 *
 * await deleteAddress(addressId);
 * ```
 */
export async function deleteAddress(addressId: string): Promise<void> {
  if (!addressId) {
    throw new Error("An address id is required.");
  }

  const supabase = await getSupabase();
  await requireUserId(supabase);

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);

  if (error) {
    throw new Error(`Unable to delete the address: ${error.message}`);
  }

  const stillThere = await readAddress(supabase, addressId);
  if (stillThere) {
    throw new WriteRejectedError(
      `Address ${addressId} could not be deleted (missing address, or an RLS policy that does not allow this user to delete it)`,
    );
  }
}
