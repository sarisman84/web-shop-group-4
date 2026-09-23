# ADR-004: Val av Betalningslösning (Stripe Hosted Checkout)

* **Status:** Beslutad
* **Datum:** 2026-09-22
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Webbutiken behöver en fungerande betalningsprocess som simulerar ett riktigt köpflöde i testläge. Kunderna ska kunna gå till kassa och slutföra en betalning. Vi måste välja en betalningslösning som är säker, enkel att integrera med Next.js och som inte kräver att vi bygger ett helt betalningssystem från grunden. Lösningen ska minimera komplexiteten för teamet samtidigt som den ger en realistisk köpupplevelse.

---

## 2. Övervägda Alternativ

### Alternativ A: Bygga ett eget betalningssystem med Stripe Elements (Stripe.js)
* **Fördelar:** Full kontroll över betalningsformulärets utseende och upplevelse. Stripe.js låter oss bygga ett skräddarsytt checkout-gränssnitt.
* **Nackdelar:** Kräver betydande utvecklingstid för att implementera ett säkert, PCI-aktande formulär. Vi måste hantera allt från betalningsinsamling till framtidsbehandling själva. Högre krav på säkerhet och kompatibilitet.

### Alternativ B: PayPal Checkout Integration
* **Fördelar:** Välkänt betalningsmärke som många användare föredrar. Enkel att lägga till med PayPal SDK.
* **Nackdelar:** Kräver separat konto och konfiguration. Inte lika smidig integration med Next.js som Stripe. Betalningsflödet är mer stelt och erbjuder färre anpassningsmöjligheter.

### Alternativ C: Stripe Hosted Checkout
* **Fördelar:** Kunden omdirigeras till Stripes säkra betalningssida och tillbaka till webbutiken efter betalning. Minimal kod behövs – Stripe hanterar all betalningsinsamling, säkerhet och PCI-överensstämmelse. Enkel att integrera med Next.js via Stripe SDK. Fungerar utmärkt i testläge med test-API-nycklar. Ger en professionell och pålitlig köpupplevelse.
* **Nackdelar:** Kunden lämnar webbutiken temporärt under betalningsprocessen, vilket kan kännas avbrytande. Mindre kontroll över den visuella upplevelsen jämfört med en inbyggd lösning.

---

## 3. Beslut

Vi beslutar att använda **Alternativ C: Stripe Hosted Checkout**. Som PRD:n rekommenderar ger detta den bästa balancen mellan enkelhet och funktionalitet. Stripe hanterar all säkerhet och betalningshantering, vilket låter oss fokusera på webbutikens kärnfunktioner. Testläge med Stripe-testnycklar låter oss verifiera hela köpflödet utan riktiga betalningar.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Minimal kod behövs för att implementera betalningsflödet – vi fokuserar på webbutikens övriga funktioner.
* Stripe hanterar alla säkerhets- och PCI-ansvar, vilket minskar vår riskbelastning.
* Testläge med test-API-nycklar låter oss verifiera hela flödet under utveckling.
* Professionell och pålitlig betalningsupplevelse för kunderna.

### Negativa konsekvenser / Risker
* Kunden omdirigeras till Stripe-sidan under betalning, vilket kan bryta det sömlösa upplevelsetempoet.
* Vi är beroende av Stripe som tredje parts tjänst – om Stripe upplever problem påverkas betalningsfunktionen.
* Även om vi använder test-nycklar under utveckling behöver vi byta till levande nycklar vid produktionsstart.

---

## 5. Hur vi verifierar beslutet

* [ ] Stripe Hosted Checkout laddas korrekt på kassasidan.
* [ ] Testbetalning genomförs framgångsrikt med Stripe-test-nycklar.
* [ ] Kunden omdirigeras tillbaka till webbutiken efter betalning.
* [ ] Orderbekräftelse visas efter slutförd betalning.
* [ ] Betalningsflödet fungerar korrekt i både test- och produktionsmiljö.
