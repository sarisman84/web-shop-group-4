"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Address } from "@/lib/data/addresses";
import {
  addAddressAction,
  deleteAddressAction,
  updateAddressAction,
  type AddressActionState,
} from "@/app/(shop)/actions/address-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Delivery addresses on the account page (T98, PRD §5.3 Child US5).
//
// The list is rendered from the server component's props: every server action
// revalidates `/account/addresses`, and the client additionally refreshes the
// route after a successful mutation, so the cards always show what the
// database holds.
//
// Results are handled where the action is dispatched (inside the transition),
// not in an effect — see AddressForm below, whose own result state dies with
// the form, so a reopened form never shows an earlier attempt's errors.
// ---------------------------------------------------------------------------

interface AddressesClientProps {
  initialAddresses: Address[];
}

type Notice = { kind: "success" | "error"; text: string };

export default function AddressesClient({ initialAddresses }: AddressesClientProps) {
  const router = useRouter();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [mode, setMode] = useState<"closed" | "add" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  const editingAddress =
    mode === "edit"
      ? (initialAddresses.find((address) => address.id === editingId) ?? null)
      : null;

  // Stable identity: AddressForm holds this in a transition callback, and a
  // fresh function on every render is not worth reasoning about.
  const handleSaved = useCallback(
    (message: string | null) => {
      setNotice({ kind: "success", text: message ?? "Adressen har sparats." });
      setMode("closed");
      setEditingId(null);
      router.refresh();
    },
    [router],
  );

  const closeForm = () => {
    setMode("closed");
    setEditingId(null);
  };

  const openAdd = () => {
    setNotice(null);
    setEditingId(null);
    setMode("add");
  };

  const openEdit = (address: Address) => {
    setNotice(null);
    setEditingId(address.id);
    setMode("edit");
  };

  // The confirm dialog's submit handler: the id travels in a hidden field and
  // RLS still limits the delete to the caller's own rows. A rejected delete
  // closes the dialog as well, so its message is never left behind for the
  // next address the user tries to remove.
  const handleDelete = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startDeleteTransition(async () => {
      const result = await deleteAddressAction(null, formData);

      if (result.success) {
        setNotice({ kind: "success", text: result.message ?? "Adressen har tagits bort." });
        setDeleteTarget(null);
        router.refresh();
      } else if (result.error) {
        setNotice({ kind: "error", text: result.error });
        setDeleteTarget(null);
      }
    });
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Leveransadresser
          </h1>
          <p className="mt-1 text-muted-foreground">
            Spara dina leveransadresser och använd dem snabbt i kassan.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/account" className={buttonVariants({ variant: "outline" })}>
            ← Mitt konto
          </Link>
          {mode === "closed" && (
            <Button type="button" onClick={openAdd}>
              Lägg till adress
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={
            notice.kind === "success"
              ? "rounded-md bg-emerald-500/15 p-3 text-sm font-medium text-emerald-700"
              : "rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive"
          }
        >
          {notice.text}
        </div>
      )}

      {mode !== "closed" && (
        <AddressForm
          key={mode === "edit" ? (editingAddress?.id ?? "missing") : "add"}
          address={editingAddress}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      )}

      {initialAddresses.length === 0 ? (
        <Card>
          <CardContent className="text-sm text-muted-foreground">
            Du har inga sparade adresser ännu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {initialAddresses.map((address) => (
            <Card key={address.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="text-base break-words">
                    {address.street}
                  </CardTitle>
                  <CardDescription>
                    {address.postalCode} {address.city}
                  </CardDescription>
                </div>
                {address.isDefault && <Badge className="shrink-0">Standard</Badge>}
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">{address.country}</span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(address)}
                  >
                    Redigera
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setNotice(null);
                      setDeleteTarget(address);
                    }}
                  >
                    Ta bort
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort adress?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.street}, ${deleteTarget.postalCode} ${deleteTarget.city} tas bort permanent. Detta går inte att ångra.`
                : "Adressen tas bort permanent."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <form
              onSubmit={handleDelete}
              className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"
            >
              <input type="hidden" name="addressId" value={deleteTarget?.id ?? ""} />
              <Button
                type="button"
                variant="outline"
                disabled={deletePending}
                onClick={() => setDeleteTarget(null)}
              >
                Avbryt
              </Button>
              <Button type="submit" variant="destructive" disabled={deletePending}>
                {deletePending ? "Tar bort..." : "Ta bort"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The add / edit form. `address` is null when adding; the same fields are
// prefilled from the row when editing (PRD Child US5: edit from the list).
//
// The action's result is kept in this component's state, so it disappears
// with the form: reopening it starts from a clean slate instead of repeating
// an earlier validation error.
// ---------------------------------------------------------------------------

interface AddressFormProps {
  /** The row being edited, or null when adding a new address. */
  address: Address | null;
  /** Called once the corresponding server action succeeded, so the parent
   * can show the confirmation, close the form and refresh the list. */
  onSaved: (message: string | null) => void;
  /** Closes the form without saving. */
  onCancel: () => void;
}

function AddressForm({ address, onSaved, onCancel }: AddressFormProps) {
  const isEditing = address !== null;
  const [result, setResult] = useState<AddressActionState | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const state = isEditing
        ? await updateAddressAction(null, formData)
        : await addAddressAction(null, formData);

      if (state.success) {
        onSaved(state.message);
        return;
      }

      setResult(state);
    });
  };

  const fieldErrors = result?.fieldErrors ?? {};
  // The form-level message is the first field error, so it is only repeated
  // above the fields when it has no field of its own to sit under.
  const showFormError = Boolean(result?.error) && Object.keys(fieldErrors).length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Redigera adress" : "Lägg till adress"}</CardTitle>
        <CardDescription>
          {isEditing ? "Uppdatera de sparade adressuppgifterna." : "Alla fält måste fyllas i."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditing && <input type="hidden" name="addressId" value={address.id} />}

          {showFormError && (
            <div
              role="alert"
              className="rounded-md bg-destructive/15 p-3 text-sm font-medium text-destructive"
            >
              {result?.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="street">Gatuadress</Label>
            <Input
              id="street"
              name="street"
              defaultValue={address?.street}
              required
              aria-invalid={Boolean(fieldErrors.street)}
            />
            {fieldErrors.street && (
              <p className="text-sm text-destructive">{fieldErrors.street}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postnummer</Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={address?.postalCode}
                required
                aria-invalid={Boolean(fieldErrors.postalCode)}
              />
              {fieldErrors.postalCode && (
                <p className="text-sm text-destructive">{fieldErrors.postalCode}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Stad</Label>
              <Input
                id="city"
                name="city"
                defaultValue={address?.city}
                required
                aria-invalid={Boolean(fieldErrors.city)}
              />
              {fieldErrors.city && (
                <p className="text-sm text-destructive">{fieldErrors.city}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Land</Label>
            <Input
              id="country"
              name="country"
              defaultValue={address?.country}
              required
              aria-invalid={Boolean(fieldErrors.country)}
            />
            {fieldErrors.country && (
              <p className="text-sm text-destructive">{fieldErrors.country}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              defaultChecked={address?.isDefault ?? false}
              className="size-4 rounded border-input accent-primary"
            />
            <Label htmlFor="isDefault" className="font-normal">
              Ange som standardadress
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
              Avbryt
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Sparar..." : "Spara"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
