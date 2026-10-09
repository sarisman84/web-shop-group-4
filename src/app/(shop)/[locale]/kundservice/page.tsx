import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

// Ids double as anchors for the footer links; the texts live in the
// "kundservicePage" messages under the same key.
const sections = [
  { id: "kundservice", key: "kundservice", href: "/kundservice" },
  { id: "kontakta-kundtjanst", key: "kontakta", href: "/kundservice/kontakt" },
  { id: "leverans-sparning", key: "leverans", href: "/kundservice/leverans" },
  { id: "retur-reklamation", key: "retur", href: "/kundservice/retur" },
  { id: "kopvillkor-integritet", key: "kopvillkor", href: "/kundservice/kopvillkor" },
  { id: "vanliga-fragor-faq", key: "faq", href: "/kundservice/faq" },
] as const;

export default function KundservicePage() {
  const t = useTranslations("kundservicePage");

  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          {t("title")}
        </h1>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <Link
                href={section.href}
                className="text-xl font-semibold text-black hover:underline"
              >
                {t(`sections.${section.key}.label`)}
              </Link>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {t(`sections.${section.key}.paragraph`)}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}