# ADR-003: Val av Hosting (Vercel)

* **Status:** Beslutad
* **Datum:** 2026-09-22
* **Deltagare:** Utvecklingsteamet
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Webbutiken måste driftsättas i en produktionsmiljö som är tillgänglig för allmänheten. Projektet bygger på Next.js (App Router) vilket ställer specifika krav på hostingplattformen – den måste stödja Server Components, Server Actions och statisk generation. Vidare krävs att datakällan (Supabase) är nåbar från molnet, vilket utesluter localhost-lösningar.

---

## 2. Övervägda Alternativ

### Alternativ A: Netlify
* **Fördelar:** Populär plattform med Git-integrering, CI/CD och gratis tier. Stöd för Next.js statisk export.
* **Nackdelar:** Inte lika optimerad för Next.js App Router som Vercel. Server Actions och middleware kan ha begränsad funktionalitet. Edge Functions stöds ej på samma sätt.

### Alternativ B: Railway eller Render
* **Fördelar:** Enkel att sätta upp, goda Docker-baserade deploymenter, flexibla.
* **Nackdelar:** Inte specifikt optimerade för Next.js. Kräver mer konfiguration för optimal prestanda. Ingen inbyggd CDN-optimering jämfört med Vercel.

### Alternativ C: Vercel
* **Fördelar:** Ägs av samma team som skapade Next.js, vilket ger perfekt integrering. Inbyggt stöd för Server Components, Server Actions, Middleware, och automatisk optimering (bilder, kod-splitting). Global CDN-nätverk för snabbaste möjliga laddtider. Enkel Git-baserad deployment. Gratis tier räcker för projektets storlek.
* **Nackdelar:** Kan bli dyr vid högre trafik på betalningsplanen. Beroende av en enskild leverantör (vendor lock-in).

---

## 3. Beslut

Vi beslutar att använda **Alternativ C: Vercel**. Som Next.js:s skapare erbjuder Vercel den mest nativa och optimerade upplevelsen för vår applikation. Deploymenten är direkt från Git och all optimeringsautomatisering (bilder, prestanda) sker utan manuell konfiguration.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Direktuppkoppling med Next.js fungerar utan konfigurationsproblem.
* Automatisk bildoptimering och prestandaförbättringar utan extra arbete.
* Global CDN säkerställer snabba laddtider för användare världen över.
* Enkel pipeline från GitHub-repo till produktion.

### Negativa konsekvenser / Risker
* Vendor lock-in – att flytta till en annan plattform i framtiden kan kräva omfattande ändringar.
* Om Vercel upplever en driftstörning påverkas webbutiken direkt (även om deras uptime är mycket hög).

---

## 5. Hur vi verifierar beslutet

* [ ] Webbplatsen deployas framgångsrikt via Vercel från GitHub.
* [ ] Alla sidor laddas snabbt och korrekt i produktion.
* [ ] Next.js Server Components och Server Actions fungerar i produktionsmiljö.
* [ ] Supabase-datakällan är tillgänglig från den deployerade appen.
* [ ] Bilder laddas optimerat via Next.js Image Component.
