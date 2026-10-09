# ADR-006: Val av Internationalisering (next-intl)

* **Status:** Beslutad
* **Datum:** 2026-10-09
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #185 (T111)

---

## 1. Kontext & Problemställning

Webbutiken ska vara tillgänglig på både svenska och engelska. All användarvänt text – navigation, katalog- och produktsidor, varukorg, kassa, konto, felmeddelanden – måste kunna översättas utan att koden ändras. Applikationen är byggd med Next.js App Router och använder både serverkomponenter och klientkomponenter, så lösningen måste fungera i båda renderingskontexterna. Vi behöver dessutom URL:er med lokalsuffix (`/sv/...`, `/en/...`), en språkväxlare, en rimlig standardlokal, och möjlighet att översätta även datadrivna strängar (t.ex. navigationsgruppens titlar och beskrivningar som ligger i koden/databasen).

---

## 2. Övervägda Alternativ

### Alternativ A: next-intl
* **Fördelar:** Byggd specifikt för Next.js App Router. Förstaklassstöd för serverkomponenter (`getTranslations`) och klientkomponenter (`useTranslations`). Inbyggd routing, middleware och lokal-negociering. Meddelandekataloger som vanliga JSON-filer. ICU-formatering för plural och interpolation.
* **Nackdelar:** Ett till beroende och ett build-plugin (`next.config.ts`). Kräver disciplin för att hålla alla strängar i katalogerna.

### Alternativ B: react-intl
* **Fördelar:** Mogen och välkänd React-i18n-bibliotek med stort community.
* **Nackdelar:** Designad kring React context/providers, vilket kräver mer manuell anpassning för App Routers serverkomponenter och routing. Inget inbyggt stöd för Next.js middleware/routing.

### Alternativ C: i18next + react-i18next
* **Fördelar:** Mycket kraftfullt och framework-oberoende med stort ekosystem.
* **Nackdelar:** Tyngre. Kräver mer manuell integration med Next.js SSR (caching, lokal-detektering, server-side rendering). Oproportionerligt för två lokaler.

### Alternativ D: Egennytt lösning (React Context + JSON-filer)
* **Fördelar:** Full kontroll, inga externa beroenden.
* **Nackdelar:** Vi skulle själva behöva bygga routing, middleware, lokal-negociering, pluralisering och SSR-hantering. Högt underhållsbehov och felkänsligt.

---

## 3. Beslut

Vi beslutar att använda **Alternativ A: next-intl**.

next-intl är de facto-standarden för internationalisering i Next.js App Router. Den fungerar naturnaturalt med både server- och klientkomponenter, hanterar routing och lokal-negociering ur lådan, och håller översättningarna i enkla JSON-kataloger. Det låter oss fokusera på butikens kärnfunktioner istället för att bygga egen i18n-infrastruktur.

---

## 4. Konsekvenser

### Positiva konsekvenser
* URL:er med lokalsuffix (`/sv`, `/en`) och en språkväxlare levereras av ramverkets routing + middleware.
* Serverkomponenter använder `getTranslations`, klientkomponenter `useTranslations` – en konsekvent API.
* All UI-text ligger i `src/messages/{sv,en}.json`, så en ny lokal läggs till genom att lägga till en JSON-fil.
* ICU-formatering hanterar plural och interpolation (t.ex. "{count} products found").
* Datadrivna strängar (navigationsgrupper) översätts via en stabil slug → meddelandenyckel-mappning (`GROUP_MESSAGE_KEYS`), vilket separerar databas-innehåll från UI-text.

### Negativa konsekvenser / Risker
* All användarvänt text måste gå via katalogerna – detta kräver disciplin, och hårdkodade strängar kan smyga in (t.ex. från feature-branchar).
* En ny lokal kräver en ny JSON-fil och en uppdatering av routing-konfigurationen.
* next-intl lägger till ett beroende och ett build-plugin i `next.config.ts`.

---

## 5. Hur vi verifierar beslutet

* [ ] Alla butikssidor renderas korrekt på både `/sv` och `/en`.
* [ ] Språkväxlaren fungerar och valet bevaras.
* [ ] Inga hårdkodade användarvänta strängar återstår på butikssidorna.
* [ ] Dynamiska strängar (antal, sökterm) formateras korrekt på båda lokalerna.
* [ ] Standardlokalen omdirigeras korrekt (t.ex. `/` → `/sv`).
