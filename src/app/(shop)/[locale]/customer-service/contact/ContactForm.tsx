"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  contactMessagesAction,
  type ContactActionState,
  type ContactFieldErrorKey,
} from "@/app/(shop)/actions/contact-actions";

// ---------------------------------------------------------------------------
// The contact form (T115, issue #193).
//
// Field values live in the DOM (no per-field state): the server action is
// the source of truth for what was stored, and its result is kept in this
// component's state, so it disappears with the form. On success the form is
// reset and the confirmation banner stays; on failure the failing fields get
// their translated error under the field.
//
// All user-facing text comes from the "contactPage" messages, so the same
// component renders in both /sv and /en.
// ---------------------------------------------------------------------------

export default function ContactForm() {
  const t = useTranslations("contactPage");
  const [result, setResult] = useState<ContactActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const fieldErrors = result?.fieldErrors ?? {};

  const errorText = (key: ContactFieldErrorKey) => t(`errors.${key}`);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const state = await contactMessagesAction(null, formData);

      if (state.success) {
        form.reset();
      }
      setResult(state);
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {result?.success && (
        <div
          role="status"
          className="rounded-md bg-emerald-500/15 p-3 text-sm font-medium text-emerald-700"
        >
          {t("success")}
        </div>
      )}

      {result?.submitFailed && (
        <div
          role="alert"
          className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive"
        >
          {t("submitFailed")}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="contact-name">{t("nameLabel")}</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name && (
          <p className="text-sm text-destructive">{errorText(fieldErrors.name)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("emailLabel")}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{errorText(fieldErrors.email)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("messageLabel")}</Label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={Boolean(fieldErrors.message)}
          className="w-full min-h-28 min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        />
        {fieldErrors.message && (
          <p className="text-sm text-destructive">{errorText(fieldErrors.message)}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("sending") : t("send")}
        </Button>
      </div>
    </form>
  );
}
