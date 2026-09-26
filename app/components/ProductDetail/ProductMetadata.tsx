import { QRCodeSVG } from "qrcode.react";
import type { Product } from "@/app/types";

// Returns undefined for a missing stamp so DetailRow drops the row instead of
// showing a placeholder: products created in-app have no meta object at all.
function formatDate(date?: string) {
  if (!date) return undefined;
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsedDate);
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="py-3.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 break-all text-sm font-medium text-slate-900">
        {value}
      </dd>
    </div>
  );
}

export default function ProductMetadata({ product }: { product: Product }) {
  // The imported catalog has a qrCode URL for most products; anything added
  // through the app only has a barcode, so fall back to that.
  const qrValue = product.meta.qrCode ?? product.meta.barcode;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-slate-950">Metadata</h2>
        <p className="mt-1 text-sm text-slate-500">
          System and catalog metadata.
        </p>
      </div>
      <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 sm:px-6">
          <dl>
            <DetailRow
              label="Created"
              value={formatDate(product.meta.createdAt)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(product.meta.updatedAt)}
            />
            <DetailRow label="Product ID" value={product.id} />
          </dl>
        </div>
        <div className="px-5 sm:px-6">
          <dl>
            <DetailRow label="Barcode" value={product.meta.barcode || "—"} />
            <div className="border-t border-slate-100 py-5">
              <dt className="text-sm font-medium text-slate-500">QR Code</dt>
              {qrValue ? (
                <dd className="mt-3">
                  <div className="inline-flex rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <QRCodeSVG
                      value={qrValue}
                      size={180}
                      level="M"
                      includeMargin
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      aria-label={`QR code for ${product.title}`}
                    />
                  </div>
                  <p className="mt-3 max-w-full break-all text-xs leading-5 text-slate-500">
                    {qrValue}
                  </p>
                </dd>
              ) : (
                <dd className="mt-2 text-sm italic text-slate-400">
                  No QR code available.
                </dd>
              )}
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
