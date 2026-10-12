import { getSupabase } from "./_client";

// ---------------------------------------------------------------------------
// contact_messages — the single entry point for writes to the Supabase
// `contact_messages` table (T115, issue #193: the contact page form).
//
// Server-only: the function below runs on the shared cookie-aware client from
// `./_client` (see `src/lib/supabase/server.ts`), so the RLS policies on
// `contact_messages` always see the caller's real role (anon or
// authenticated) — both may insert, neither may read anything back.
//
// Unlike the other write modules there is no read-back: the table is
// inbox-only (no select grant, no select policy), so a row can never be
// fetched again through the Data API. That is safe here because the insert
// policy is `with check (true)` — RLS cannot silently reject a row based on
// its contents, so the absence of an error means the row was stored.
// ---------------------------------------------------------------------------

/** The contact form's values, ready to store (snake_case mapping is trivial:
 * the columns are already single words). */
export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Stores one contact message from the contact page form.
 *
 * Works for anonymous visitors and signed-in users alike — the insert policy
 * admits both roles. The message content is never returned or logged; the
 * caller only learns whether the store succeeded.
 *
 * @throws Error when the input is empty or the database rejected the insert.
 *
 * @example
 * ```ts
 * // src/app/(shop)/actions/contact-actions.ts (server action)
 * import { createContactMessage } from "@/lib/data";
 *
 * await createContactMessage({ name, email, message });
 * ```
 */
export async function createContactMessage(input: ContactMessageInput): Promise<void> {
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();

  if (!name || !email || !message) {
    throw new Error("A contact message needs a name, an e-mail and a message.");
  }

  const supabase = await getSupabase();

  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message });

  if (error) {
    throw new Error(`Unable to send the contact message: ${error.message}`);
  }
}
