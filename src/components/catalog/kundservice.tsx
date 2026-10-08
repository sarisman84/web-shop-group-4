import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ShoppingBag, Truck, CreditCard, RotateCw } from "lucide-react";

const features = [
  { icon: ShoppingBag, key: "beställ" },
  { icon: Truck, key: "leverans" },
  { icon: CreditCard, key: "betalning" },
  { icon: RotateCw, key: "retur" },
] as const;

export default function Kundservice() {
  const t = useTranslations("kundservice");
  const tFooter = useTranslations("footer");

  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-label={tFooter("customerService")}>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <Link
          href="/kundservice"
          className="text-sm font-medium text-black hover:no-underline underline"
        >
          {t("howItWorks")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon: Icon, key }) => (
          <div key={key} className="flex flex-col items-center text-center">
            <Icon className="h-8 w-8 text-gray-700 mb-4" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900">{t(key)}</h3>
            <p className="mt-1 text-sm text-gray-500">{t(`${key}Desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
