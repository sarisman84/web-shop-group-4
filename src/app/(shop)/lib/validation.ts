import { z } from "zod";

// ---------------------------------------------------------------------------
// Form schemas for the shop (T98: delivery addresses). Same pattern as
// `src/app/admin/lib/validation.ts`: one zod object per form, every field
// trimmed and required, and the message is what the form shows under the
// field. Server actions in `src/app/(shop)/actions/` parse FormData with
// these schemas and return the field errors to the client.
// ---------------------------------------------------------------------------

/** The saved delivery address form: street, postal code, city and country,
 * all required (PRD §5.3 Child US5 — "fyller i alla obligatoriska fält").
 * The "set as default" checkbox is not part of the schema: an unchecked
 * checkbox is simply absent from FormData. */
export const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(1, "Gatuadress krävs.")
    .max(200, "Gatuadress får vara som högst 200 tecken."),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postnummer krävs.")
    .max(20, "Postnummer får vara som högst 20 tecken."),
  city: z
    .string()
    .trim()
    .min(1, "Stad krävs.")
    .max(100, "Stad får vara som högst 100 tecken."),
  country: z
    .string()
    .trim()
    .min(1, "Land krävs.")
    .max(100, "Land får vara som högst 100 tecken."),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

/** One key of the address form, used as the key of the field-error map. */
export type AddressFormField = keyof AddressFormValues;

// ---------------------------------------------------------------------------
// Contact form (T115, issue #193): name, e-mail and message. The e-mail must
// be a valid address and the message has a minimum length, so a stray "test"
// is never stored. The messages below are the Swedish fallback; the contact
// page shows its own translated strings (the action reports the failing
// field, not the message).
// ---------------------------------------------------------------------------

export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Namn krävs.")
    .max(100, "Namnet får vara som högst 100 tecken."),
  email: z
    .string()
    .trim()
    .min(1, "E-post krävs.")
    .max(200, "E-postadressen får vara som högst 200 tecken.")
    .email("Ange en giltig e-postadress."),
  message: z
    .string()
    .trim()
    .min(10, "Meddelandet måste vara minst 10 tecken långt.")
    .max(5000, "Meddelandet får vara som högst 5000 tecken."),
});

export type ContactMessageFormValues = z.infer<typeof contactMessageSchema>;

/** One key of the contact form, used as the key of the field-error map. */
export type ContactMessageFormField = keyof ContactMessageFormValues;
