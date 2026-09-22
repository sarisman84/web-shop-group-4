# ADR-002: Val av Databas och Autentisering (Supabase)

* **Status:** Beslutad
* **Datum:** 2026-09-22
* **Deltagare:** Utvecklingsteamet
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Fas 1 använde en lokal JSON-server som datakälla, vilket inte är lämpligt för en produktionsmiljö. Vi behöver migrera till en riktig molndatabas som kan hantera vår produktkatalog och användardata. Vidare kräver webbutiken en säker autentiseringslösning för kundinloggning, skyddade rutter och orderhantering. Vi måste välja en lösning som täter både datalagring och autentisering med minimal konfigurationskomplexitet.

---

## 2. Övervägda Alternativ

### Alternativ A: Neon PostgreSQL + Prisma (eller Drizzle)
* **Fördelar:** Renodlad PostgreSQL-upplevelse med starkt ORM-stöd. Prisma och Drizzle är välutvecklade ORM-bibliotek med typssäkerhet.
* **Nackdelar:** Kräver två separata tjänster (Neon för databas och t.ex. NextAuth eller Clerk för autentisering). Flertalet beroenden att hantera och underhålla. Mer komplex uppsättning.

### Alternativ B: Firebase (Firestore + Firebase Auth)
* **Fördelar:** Allt i ett system, enkel att komma igång med, inkluderar både databas och autentisering.
* **Nackdelar:** Firestore är ett NoSQL-dokumentlager som inte passar lika väl för relationell produktdata. Begränsat med fria kostnadsnivån. Svårare att integrera med Next.js App Router på grund av Firebase's SDK-struktur och SSR-utmaningar.

### Alternativ C: Supabase (PostgreSQL + Auth)
* **Fördelar:** Ger en komplett lösning med PostgreSQL-databas och inbyggd autentisering (Auth stack) i samma plattform. Direktintegrering med Next.js via Supabase-klienten. Inkluderar row-level security, realtime subscriptions och lagringsfunktioner. Enklare att sätta upp än två separata tjänster och har utmärkt dokumentation för Next.js.
* **Nackdelar:** Supabase kan bli dyrare vid högre trafik. Vissa avancerade databasfunktioner kan vara begränsade jämfört med en dedikerad PostgreSQL-instans.

---

## 3. Beslut

Vi beslutar att använda **Alternativ C: Supabase**. Det ger oss en enda plattform som täter både vår databas-migrering från JSON-server och vår autentiseringsstack, vilket minskar antalet externa beroenden och förenklar arkitekturen. Supabase Auth fungerar utmärkt med Next.js App Router och erbjuder allt vi behöver för kundinloggning och skyddade rutter.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Enklare migration från Fas 1:s JSON-server till en riktig molndatabas.
* Autentisering och databas i samma tjänst – färre beroenden att hantera och underhålla.
* Inbyggd säkerhet (row-level security) som skyddar användardata.
* Fungerar direkt med Vercel-deployment utan localhost-begränsningar.

### Negativa konsekvenser / Risker
* Teamet måste lära sig Supabase-specifika API:er om inte alla har tidigare erfarenhet.
* Vid mycket hög trafik kan kostnaden för Supabase öka betydligt.
* Beroende av en tredje parts tjänst för både data och autentisering.

---

## 5. Hur vi verifierar beslutet

* [ ] Produktdata från JSON-server är migrerad till Supabase och hämtas korrekt.
* [ ] Kundregistrering och inloggning fungerar via Supabase Auth.
* [ ] Skyddade rutter (t.ex. kontosida, orderhistorik) kräver inloggning.
* [ ] Webbplatsen fungerar korrekt efter deployment på Vercel med Supabase som datakälla.
