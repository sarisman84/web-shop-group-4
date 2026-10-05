import Link from "next/link";

const customerServiceData = [
  {
    id: "kundservice",
    label: "Kundservice",
    href: "/kundservice",
    paragraph:
      "Vårt kundservice-team finns alltid här för att hjälpa dig. Oavsett om du har frågor om en beställning, behöver hjälp med att hitta en produkt eller vill få svar på andra frågor — vi finns tillgängliga för att stödja dig hela vägen. Du kan enkelt nå oss via både chatt och e-post under våra öppettider, och vi strävar alltid efter att ge dig ett snabbt och trevligt bemötande.",
  },
  {
    id: "kontakta-kundtjanst",
    label: "Kontakta kundtjänst",
    href: "/kundservice/kontakt",
    paragraph:
      "Kontakta gärna vår kundtjänst om du behöver personlig hjälp. Du når oss via e-post, telefon eller vårt smidiga kontaktformulär. Vi strävar efter att svara på alla förfrågningar inom 24 timmar på vardagar. Våra erfarna medarbetare sitter redo att lösa eventuella problem, så tveka inte att höra av dig – ingen fråga är för liten eller för stor.",
  },
  {
    id: "leverans-sparning",
    label: "Leverans & Spårning",
    href: "/kundservice/leverans",
    paragraph:
      "Vi erbjuder snabb och flexibel leverans till hela Sverige. När du har gjort ett köp får du en bekräftelse via e-post tillsammans med ett spårningsnummer så att du enkelt kan följa din paketleverans från vårt lager till din dörr. Vi samarbetar med trygga och ledande fraktbolag för att säkerställa att din beställning kommer fram säkert och i tid.",
  },
  {
    id: "retur-reklamation",
    label: "Retur & Reklamation",
    href: "/kundservice/retur",
    paragraph:
      "Vi har enkel och fri retur inom 14 dagar. Om du ångrar dig eller om något är fel med din beställning kan du smidigt skicka tillbaka varan med den medföljande retursedeln. Vi hjälper dig gärna med både byten och reklamationer för att säkerställa att du känner dig helt nöjd med ditt köp hos oss.",
  },
  {
    id: "kopvillkor-integritet",
    label: "Köpvillkor & Integritet",
    href: "/kundservice/kopvillkor",
    paragraph:
      "Läs mer om våra köpvillkor, integritetspolicy och hur vi hanterar dina personuppgifter. Vi värnar om din personliga integritet och säkerställer att all information hanteras på ett säkert, konfidentiellt och transparent sätt i enlighet med gällande lagstiftning och GDPR. Våra villkor är utformade för att ge dig en trygg och rättvis handel.",
  },
  {
    id: "vanliga-fragor-faq",
    label: "Vanliga frågor (FAQ)",
    href: "/kundservice/faq",
    paragraph:
      "Hitta svar på de vanligaste frågorna om allt från beställningar och betalningar till leveranser och returer. Vår FAQ-sida uppdateras regelbundet baserat på vad våra kunder oftast undrar över, vilket hjälper dig att snabbt hitta svar direkt på skärmen utan att behöva vänta på supporten.",
  },
];

export default function KundservicePage() {
  return (
    <div className="min-h-screen bg-white">
      <main id="main-content" className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Kundservice
        </h1>

        <div className="space-y-8">
          {customerServiceData.map((section) => (
            <section key={section.label} id={section.id}>
              <Link
                href={section.href}
                className="text-xl font-semibold text-black hover:underline"
              >
                {section.label}
              </Link>
              <p className="mt-2 text-gray-600 max-w-2xl">
                {section.paragraph}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}