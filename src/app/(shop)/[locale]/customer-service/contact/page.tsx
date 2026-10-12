import { useTranslations } from "next-intl";
import ContactForm from "./ContactForm";

// The contact page (T115, issue #193): the target of the footer "Kontakt"
// link and the kundservice "Kontakta kundtjänst" section. The form is a
// client component (it calls the server action); everything else is static
// and translated through the "contactPage" messages.
export default function KontaktPage() {
  const t = useTranslations("contactPage");

  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
          {t("title")}
        </h1>
        <p className="mt-2 mb-8 max-w-2xl text-gray-600">{t("intro")}</p>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <section
            aria-labelledby="contact-form-title"
            className="lg:col-span-2"
          >
            <h2
              id="contact-form-title"
              className="mb-4 text-xl font-semibold text-black"
            >
              {t("formTitle")}
            </h2>
            <ContactForm />
          </section>

          <aside aria-labelledby="contact-details-title">
            <h2
              id="contact-details-title"
              className="mb-4 text-xl font-semibold text-black"
            >
              {t("detailsTitle")}
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-gray-900">
                  {t("detailsEmailLabel")}
                </dt>
                <dd className="mt-1 text-gray-600">
                  <a
                    href={`mailto:${t("detailsEmail")}`}
                    className="hover:underline"
                  >
                    {t("detailsEmail")}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">
                  {t("detailsHoursLabel")}
                </dt>
                <dd className="mt-1 text-gray-600">{t("detailsHours")}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-gray-600">{t("responseTime")}</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
