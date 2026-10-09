# ADR-006: Val av Transaktionell E-post (Resend)

* **Status:** Beslutad
* **Datum:** 2026-09-23
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Webbutiken ska skicka transaktionella e-postmeddelanden – främst orderbekräftelse efter genomförd betalning samt svar på kontaktformulär. Enligt PRD:n (fördjupningsmodulen *Transaktionell E-post*) ska meddelandena skickas via Next.js Server Actions. Vi behöver en tjänst som är enkel att integrera i Next.js, inte kräver krångliga SMTP-inställningar och som tillåter oss att fokusera på butikens kärnfunktioner. Tjänsten ska vara tillräckligt pålitlig för transaktionella meddelanden och ha en gratis- eller lågkostnadsplan som räcker för ett kursprojekt.

---

## 2. Övervägda Alternativ

### Alternativ A: Resend
* **Fördelar:** API-first design som passar naturnaturalt in i Next.js Server Actions och Route Handlers – e-post skickas med en enkel `fetch`-anrop eller Resend SDK. Inga SMTP-konfigurationer. Inbyggt stöd för DKIM/SPF via dashboard, testmeddelanden och loggar. Generös gratisplan som räcker för ett kursprojekt.
* **Nackdelar:** Extern tjänst (API-nyckel och konto). Låga sändningsgränser på gratisplanen (irrelevant för projektets volym).

### Alternativ B: SendGrid (Twilio)
* **Fördelar:** Mogen tjänst med stor dokumentation och bred funktionalitet.
* **Nackdelar:** Mer konfiguration än Resend för en enkel Next.js-integration. API:et är inte lika "drop-in" för Server Actions.

### Alternativ C: Postmark
* **Fördelar:** Utmärkt leverans och reputationshantering, inriktad specifikt på transaktionell e-post.
* **Nackdelar:** Mindre gratisvolym. Mindre dokumentation och community stöd jämfört med Resend för Next.js.

### Alternativ D: Nodemailer med egen SMTP-tjänst (t.ex. Gmail App Password)
* **Fördelar:** Inget extern e-postkonto behövs, full kontroll över sändningen.
* **Nackdelar:** Kräver manuell hantering av SMTP-kredentiv, DKIM/SPF-konfiguration och (i Gmails fall) dagliga sändningsgränser. Precis den typ av "krångliga SMTP-inställningar" som PRD:ns rekommendation vill undvika.

### Alternativ E: AWS SES
* **Fördelar:** Mycket låg kostnad per e-post vid hög volym.
* **Nackdelar:** Tung konfiguration (IAM, identitetsverifiering, regionval). Oproportionerligt för ett kursprojekt.

---

## 3. Beslut

Vi beslutar att använda **Alternativ A: Resend**.

Resend ger oss den enklaste integrationen med Next.js Server Actions – orderbekräftelsen skickas med ett fåtal rader kod, utan SMTP-konfiguration. Tjänstens gratisplan täcker projektets sändningsvolym med god marginal, och dashboarden med loggar och testmeddelanden underlättar utveckling och felsökning.

---

## 4. Konsekvenser

### Positiva konsekvenser
* E-postskick sker i Server Actions med minimal kod – ingen SMTP-konfiguration behövs.
* Leveranssäkerhet (DKIM/SPF) hanteras via Resends dashboard, inte i vår kodbas.
* Gratisplanen räcker med stor marginal för ett kursprojekt.
* Loggar och testmeddelanden i dashboarden underlättar utveckling.

### Negativa konsekvenser / Risker
* Vi är beroende av Resend som tredje parts tjänst – om tjänsten upplever problem påverkas e-postflödet.
* API-nyckeln måste förvaras säkert (miljövariabel, aldrig i kodbasen).
* Vid produktionsstart kan vi behöva verifiera vår domän för att säkerställa bästa leverans.

---

## 5. Hur vi verifierar beslutet

* [ ] Orderbekräftelse e-post skickas och levereras efter genomförd (test-)betalning.
* [ ] Kontaktformulärets svar e-post skickas korrekt.
* [ ] E-post skickas från en verifierad avsändardomän.
* [ ] Inga känsliga kredentiv (API-nyckel) commitas till kodbasen.
* [ ] Fel vid e-postskick hanteras graciöst (loggas och påverkar inte användarens köpupplevelse).
