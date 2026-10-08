import { Link } from "@/i18n/routing";
import { ShoppingBag, Truck, CreditCard, RotateCw } from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "Beställ enkelt",
    description: "Handla som gäst, ingen registrering krävs",
  },
  {
    icon: Truck,
    title: "Flexibel leverans",
    description: "Hemleverans eller hämtas hos ombud",
  },
  {
    icon: CreditCard,
    title: "Smidig betalning",
    description: "Klarna, Swish och kort",
  },
  {
    icon: RotateCw,
    title: "Enkel retur",
    description: "14 dagars ångerrätt",
  },
];

export default function Kundservice() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12" aria-label="Kundservice">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
          Alltid hos Group 4
        </h2>
        <Link
          href="/kundservice"
          className="text-sm font-medium text-black hover:no-underline underline"
        >
          Så fungerar det →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center">
            <Icon className="h-8 w-8 text-gray-700 mb-4" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
