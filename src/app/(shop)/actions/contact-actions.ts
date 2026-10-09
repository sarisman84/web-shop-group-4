"use server";

import type { ZodIssue } from "zod";
import { createContactMessage } from "@/lib/data";
import {
  contactMessageSchema,
  type ContactMessageFormField,
} from "@/app/(shop)/lib/validation";

// ---------------------------------------------------------------------------
// Contact form server action (T115, issue #193).
//
// Validates the form with the zod schema from
// `src/app/(shop)/lib/validation.ts`, then stores the message through the
// data layer (`src/lib/data/contact-messages.ts`), which uses the cookie-aware
// SSR client from `src/lib/supabase/server.ts` — so the insert-only RLS
// policy on `contact_messages` decides what may be stored. Nothing about the
// caller is trusted from the browser.
//
// The state returned to the form reports WHICH fields failed, not message
// text: the page is localized (sv/en), so the client component translates
// the error keys through the "contactPage.errors" messages. The message
// content is never echoed back in an error.
// ---------------------------------------------------------------------------

/** The stable keys a failing field can be reported with. The client
 * translates them through `contactPage.errors.<key>`. */
export type ContactFieldErrorKey =
  | "required"
  | "tooShort"
  | "tooLong"
  | "invalidEmail";

/** What the contact action reports back to the form that called it. */
export interface ContactActionState {
  success: boolean;
  /** The fields that failed validation, mapped to a translatable error key. */
  fieldErrors: Partial<Record<ContactMessageFormField, ContactFieldErrorKey>>;
  /** Set when the message could not be stored (not a validation problem). */
  submitFailed: boolean;
}

/** Maps one zod issue to the error key the form shows under the field. */
function toFieldErrorKey(issue: ZodIssue): ContactFieldErrorKey {
  switch (issue.code) {
    case "too_small":
      // min(1) means "the field is empty"; a larger minimum is a length rule.
      return issue.minimum === 1 ? "required" : "tooShort";
    case "too_big":
      return "tooLong";
    case "invalid_format":
      return "invalidEmail";
    default:
      return "required";
  }
}

/**
 * Stores the contact message from the form.
 *
 * Signature matches the `useActionState` pattern used across the app: the
 * previous state is ignored, the fresh one is returned.
 */
export async function contactMessagesAction(
  _previousState: ContactActionState | null,
  formData: FormData,
): Promise<ContactActionState> {
  const raw = Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  );

  const result = contactMessageSchema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: ContactActionState["fieldErrors"] = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        !fieldErrors[field as ContactMessageFormField]
      ) {
        fieldErrors[field as ContactMessageFormField] = toFieldErrorKey(issue);
      }
    }
    return { success: false, fieldErrors, submitFailed: false };
  }

  try {
    await createContactMessage(result.data);
  } catch (error) {
    // The message content is never logged or returned — only that it failed.
    console.error("Failed to store the contact message:", error);
    return { success: false, fieldErrors: {}, submitFailed: true };
  }

  return { success: true, fieldErrors: {}, submitFailed: false };
}
