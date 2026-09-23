# 📋 Product Requirements Document (PRD): Webbshoppen – Kunddelen (Fas 2)

| Metadata | Beskrivning |
| :--- | :--- |
| **Projekt** | Webbshoppen – Kundportal (Fas 2) |
| **Beställare** | Nordic Retail Group (Fiktiv uppdragsgivare) |
| **Utvecklingsteam** | Konsultteamet / Projektgruppen |
| **Projekttid** | 21 september 2026 – 13 oktober 2026 |
| **Slutleverans & Demo** | Tisdag 13 oktober 2026 |
| **Teknisk Stack** | Next.js (App Router), React, TypeScript/JavaScript, CSS/Tailwind |
| **Stöddokument** | [ADR-mall](file:///c:/docLocal/Lexicon/FE26/grupparbete/docs/ADR-mall.md) \| [Domänordlista](file:///c:/docLocal/Lexicon/FE26/grupparbete/docs/GLOSSARY.md) \| [Gruppkontrakt](file:///c:/docLocal/Lexicon/FE26/grupparbete/kontrakt.md) |

---

## 1. Vision & Bakgrund

Nordic Retail Group har framgångsrikt lanserat sitt interna administrativa gränssnitt (Fas 1). Nu behöver verksamheten ta nästa avgörande steg: **att öppna butiken för konsumenterna**.

Målet med Fas 2 är att förvandla produktkatalogen till en modern, inbjudande och högpresterande e-handelsbutik. Kunderna ska snabbt kunna hitta produkter, navigera i sortimentet, granska detaljer och förbereda sina beställningar. Lösningen ska byggas ovanpå teamets befintliga grund från Fas 1 med fokus på god användarupplevelse (UX), modern Next.js-arkitektur och stabil kodkvalitet.

---

## 2. Personas (Målgrupp)

För att säkerställa att design- och funktionsbeslut möter verkliga användarbehov utgår vi från två primära personas:

### 📱 Mobil-shopparen "Maya" (24 år)

* **Beteende:** Surfar ofta på språng via mobilen. Vill ha snabba laddtider och tydliga bilder.
* **Behov:** Enkel sökfunktion, ren layout utan krångliga menyer och smidig navigering mellan produktöversikt och detaljer.
* **Pain point:** Tröga sidor med layout shifts eller små knappar som är svåra att trycka på.

### 🔍 Pris- & Kvalitetsmedvetne "Peter" (42 år)

* **Beteende:** Handlar från dator/laptop, jämför specifikationer och vill filtrera fram exakt rätt vara.
* **Behov:** Exakt kategorifiltrering, fungerande paginering/sortering och länkar som går att dela/bokmärka (`searchParams`).
* **Pain point:** Sökfilter som nollställs vid sidomladdning eller otydlig lager- och prisinformation.

---

## 3. Grundläggande Funktionskrav (MVP - Scope)

Följande funktioner utgör basleveransen och måste vara implementerade och fungerande:

### 🛍️ FR-1: Produktkatalog (Översiktssida)

* Systemet ska visa alla tillgängliga produkter i ett responsivt rutnät (grid).
* Varje produktkort ska visa minst: bild, produktnamn, pris och kategori.
* Klick på ett produktkort ska leda direkt till produktens detaljsida.

### 🔍 FR-2: Dynamisk Detaljsida (`/products/[id]`)

* Systemet ska använda dynamiska rutter i Next.js App Router för att hämta och rendera information för en specifik vara.
* Sidan ska visa utförlig information: titel, högupplöst bild, beskrivning, pris, kategori och lagerstatus/köpknapp.
* Felhantering: Om en produkt inte finns ska en användarvänlig 404/not-found-vy visas.

### ⚡ FR-3: Sök & Filtrering via URL State (`searchParams`)

* Användaren ska kunna söka på produktnamn samt filtrera på kategorier.
* Tillståndet för sök och filter **måste lagras i URL:en** med hjälp av `searchParams` (så att filtrerade sökningar kan bokmärkas och delas).
* Data ska hämtas/filtreras sömlöst på servern baserat på aktuella parametrar.

### 📄 FR-4: Paginering

* Om katalogen innehåller fler varor än vad som ryms på en sida ska paginering finnas.
* Pagineringen ska styras via URL (`?page=X`) och möjliggöra bläddring framåt, bakåt och direktval av sida.

### 🛒 FR-5: Varukorg (Översiktsvy)

* En dedikerad vy/sida för varukorgen som visar hur en sammanställning av ordervärde, produkter, antal och totalbelopp ser ut.
* *Basnivå:* En statisk vy med exempelprodukter som demonstrerar kassan och layouten.  
  *(Tips: Full dynamisk/persistent varukorg kan väljas som fördjupningsmodul).*

### 🛡️ Icke-funktionella krav (NFR)

* **Prestanda & Bildoptimering:** Använd Next.js inbyggda `<Image />`-komponent för optimerade bildstorlekar.
* **Tillgänglighet & SEO:** Semantisk HTML (`<header>`, `<main>`, `<article>`, `<nav>`), tydliga rubriknivåer (`h1`-`h3`) samt unika metadata-titlar per sida.
* **Dokumentation:** Repot ska ha en professionell och välstrukturerad `README.md` med installationsanvisningar, beskrivning av arkitektur och skärmdumpar.

---

## 4. Fas 2b: Fördjupningsmoduler (Kundens Önskelista)

För att särskilja ert erbjudande och skapa extra affärsvärde har kunden listat ett antal prioriterade fördjupningsområden. Varje team väljer fritt moduler utifrån sin kompetensprofil, sina ambitioner och intressen.

> 💡 **Riktlinje för teamet:**  
> Prioritera alltid **kvalitet och förståelse framför kvantitet**. En väl genomarbetad modul som alla i teamet förstår och kan förklara under redovisningen slår tre halvfärdiga moduler.

| Modul | Svårighetsgrad | Inriktning & Rekommendation |
| :--- | :---: | :--- |
| **📦 Persistent Varukorg** | 🟢 Lätt / Medel | Spara varukorgens innehåll mellan sidladdningar och sessioner.<br>*(Rekommenderat: **Zustand med persist-middleware** eller Cookies. Mycket tacksamt då det sker helt i kodbasen utan externa API-konton).* |
| **🎨 Designsystem & UI** | 🟢 Lätt / Medel | Bygg ett enhetligt, tillgängligt och proffsigt gränssnitt.<br>*(Rekommenderat: **Shadcn/ui + Tailwind CSS**. Undvik att bygga all CSS från scratch för att spara tid).* |
| **📨 Transaktionell E-post** | 🟢 Lätt / Medel | Fungerande kontaktformulär eller orderbekräftelse via Next.js Server Actions.<br>*(Rekommenderat: **Resend**. Extremt smidigt i Next.js och kräver inga krångliga SMTP-inställningar).* |
| **🔐 Autentisering** | 🟡 Medel | Kundinloggning och skyddade rutter (*Mina sidor*, orderhistorik, favoriter).<br>*(Rekommenderat: **NextAuth**, **Kinde**, **BetterAuth** eller **Clerk** för snabbast och säkrast integration med Next.js App Router).* |
| **💳 Betallösning** | 🟡 Medel | Simulera ett riktigt köpflöde i testläge.<br>*(Rekommenderat: **Stripe Hosted Checkout**. Kunden omdirigeras till Stripes säkra sida och tillbaka, vilket minimerar komplexitet).* |
| **☁️ Databasmigration** | 🟡 Medel | Ersätt Fas 1:s JSON-server med en riktig molndatabas och ett modernt ORM.<br>*(Rekommenderat: **Supabase** eller **Neon PostgreSQL** kopplat med **Prisma** eller **Drizzle**).* |
| **🌍 Cloud Deployment** | 🟡 Medel | Publik driftsättning i produktionsmiljö.<br>*(Rekommenderat: **Vercel**. **Obs:** Kräver att er datakälla finns online och inte på `localhost:3001`!)* |
| **〽️ Prestandaoptimering** | 🔴 Avancerad | Avancerad strömning, skelettladdare och optimistiska gränssnittsuppdateringar.<br>*(Rekommenderat: **Suspense-boundaries**, `useOptimistic` och Server Actions).* |
| **⚙️ Automatiserad Testning** | 🔴 Avancerad | E2E-testning av affärskritiska flöden (sök vara → öppna detaljsida → lägg i korg).<br>*(Rekommenderat: **Playwright**).* |

> ⚠️ **Arkitekturtips inför val av moduler:**  
>
> * **Säkra kort utan externa konton:** Om ni känner er osäkra eller vill minimera beroenden, välj **Persistent Varukorg (Zustand)** och **Designsystem (Shadcn/ui)**.  
> * **Deployment-fällan:** Om ni vill driftsätta på Vercel måste datan antingen migreras till en molndatabas (t.ex. Supabase) eller serveras via ett publikt API. Vercel kan inte prata med er lokala `json-server`.

---

## 5. Teamets Arbetsdel & Specifikation [Att färdigställas av teamet]

> ✍️ **Instruktion till teamet:**  
> Denna sektion ska fyllas i av gruppen under **Sprint 1 (vecka 39)** innan kodningen drar igång.

### 5.1 Vald Kodbas från Fas 1 & Repouppsättning

> 🚀 **Gemensamt repo från start:**  
> För att alla i gruppen ska ha samma förutsättningar och behörigheter ska ni **inte** fortsätta koda direkt i en enskild persons gamla Fas 1-repo.  
>
> 1. En person skapar ett **helt nytt gemensamt GitHub-repo** för gruppen (t.ex. `grupp-X-webbshop-fas2`).  
> 2. Bjud in samtliga gruppmedlemmar som **Collaborators** med fulla skrivrättigheter.  
> 3. Kopiera över den valda koden från Fas 1 och pusha som er första commit (`Initial commit from Phase 1`).  
> 4. Lägg in detta dokument (`PRD.md`), `kontrakt.md` och `docs/` i repot.

* **Vald Fas 1-kodbas:** Bygger på kod skriven av `[Namn / Repolänk till Fas 1]`
* **Nytt gemensamt GitHub-repo:** `[Länk till gruppens nya GitHub-repo]`
* **Eventuella städnings- eller refaktoreringsbehov i basen innan start:**
  * `[Beskriv kort vad som behöver fixas, t.ex. rensa död kod, städa CSS, fixa datastruktur]`

---

### 5.2 Datamodell & API-kontrakt

*Specificera hur er produktmodell ser ut för kundgränssnittet:*

```json
{
  "id": "string | number",
  "title": "string",
  "description": "string",
  "price": 0,
  "category": "string",
  "imageUrl": "string",
  "stock": 0
}
```

*(Justera fälten ovan så de matchar er faktiska backend).*

---

### 5.3 Teamets User Stories & Acceptanskriterier

*Formulera minst 3–5 konkreta User Stories för ert MVP och era valda funktioner. Använd Gherkin-format (Given/When/Then) för acceptanskriterierna.*

#### User Story 1: Söka efter produkter

* **Som en** *kund som letar efter en specifik produkt*
* **vill jag** *kunna skriva in ett sökord i sökfältet och omedelbart se matchande varor*
* **så att** *jag slipper bläddra igenom hela sortimentet manuellt.*

**Acceptanskriterier (Given / When / Then):**

* **Given** att jag befinner mig på produktkatalogen
* **When** jag skriver "jacka" i sökfältet
* **Then** uppdateras URL:en till `?search=jacka` och endast produkter med "jacka" i titeln eller beskrivningen visas.
* **And** om inga varor matchar visas ett tydligt meddelande: "Inga produkter matchade din sökning".

#### User Story 2: Köpa produkter

* **Som en** *kund som vill köpa produkter*
* **vill jag** *kunna beställa ett antal produkter genom att välja ett produkt efter jag har gränsat priset*
* **så att** *jag slipper köpa produkter ett i taget.*

**Acceptanskriterier:**

* **Given** *att jag har hittat ett produkt som jag vill köpa*
* **When** *jag inspektera produkten och trycker ett "Köp" knapp*
* **Then** *en varokorg uppdateras i ett top-bar i sidan, där det lygger ett historik av varor som jag har laggt till korgen, med ett total pris och ett "Till kassa" knapp.*

#### User Story 3: Wishlist / Favorites

* **Som en** *webbanvändare (browsing user)*
* **vill jag** *spara produkter till en önskelista eller favoritlista*
* **så att** *jag enkelt kan hitta och köpa dem senare utan att behöva söka efter dem igen.*

**Acceptanskriterier:**

* **Given** *att jag är inne på en produktsida*
* **When** *jag klickar på "Spara till favorit"-knappen*
* **Then** *ska produkten läggas till i min personliga önskelista och visas där*

#### User Story 4: Stock Availability / Lagerstatus

* **Som en** *kund som letar efter produkter med hög efterfrågan*
* **vill jag** *se om en vara finns i lager eller om lagerstatusen är låg*
* **så att** *jag kan göra mitt köp innan varan tar slut*

**Acceptanskriterier:**

* **Given** *att jag tittar på en produktsdetaljsida*
* **When** *lagret för den produkten är under fem exemplar*
* **Then** *ska ett meddelande visas som säger "Få varor kvar i lager" (eller "Endast X kvar").*

#### User Story 5: Leveransadress

* **Som en** *inloggad användare i kassan*
* **vill jag** *säkert kunna ange min leveransadress i kassan* ange min leveransadress
* **så att** *jag framgångsrikt kan slutföra mitt köp och få en orderbekräftelse.*

**Acceptanskriterier:**

* **Given** *att jag befinner mig i kassan (checkout) som inloggad kund*
* **When** *jag fyller i mina adressuppgifter och klickar på "Spara/Fortsätt"*
* **Then** *ska adressen sparas i mitt konto och en orderbekräftelse skickas till min e-post efter betalning.*

#### User Story 6: Skapa konto

* **Som en** *användare som inte har ett konto*
* **vill jag** *skapa ett nytt konto där jag kan ha min information sparad*
* **så att**  *Så jag slipper fylla i mina uppgifter på nytt vid varje köp*

**Acceptanskriterier:**

* **Given** *att jag befinner mig registersidan*
* **When** *jag fyller i giltiga uppgifter (t.ex namn, e-post, lösenord) och klickar*
* **Then** *ska adressen sparas i mitt konto och en orderbekräftelse skickas till min e-post efter betalning.*

#### User Story 7: Betala för varor

* **Som en** *användare som håller på att köpa varor*
* **vill jag** *använda ett betalningsprocess där jag kan använda min bankinformation*
* **så att**  *jag kan slutföra mitt köp*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på checkoutsidan*
* **When** *jag fyller i giltiga betalningsuppgifter och klickar på "Betala"*
* **Then** *ska betalningen genomföras och jag ska se en bekräftelsesida*

#### Epic User Story 1: Kontosida

* **Som en** *användare som har ett konto och är inloggad till den konto*
* **vill jag** *få en översikt över min konto's information*
* **så att**  *jag kan gränsa och redigera min kontoinformation*

**Acceptanskriterier:**

* **Given** *att jag är inloggad och befinner mig på min kontosida*
* **When** *sidan laddas*
* **Then** *ska jag se en översikt över mina kontouppgifter såsom namn, e-post och telefonnummer*
* **And** *ska kunna navigera till att redigera min information, ändra lösenordet eller se min orderhistorik*

#### Child User Story 1: Se kontoinformation

* **Som en** *inloggad användare som har ett konto*
* **vill jag** *se en översikt över mina kontouppgifter som namn, e-post och telefonnummer*
* **så att** *jag kan verifiera att min information är korrekt och uppdaterad*

**Acceptanskriterier:**

* **Given** *att jag är inloggad och befinner mig på min kontosida*
* **When** *sidan laddas*
* **Then** *ska alla mina kontouppgifter (namn, e-post, telefonnummer) visas i läsbar form*
* **And** *ska ingen information vara dold eller borttagen*

#### Child User Story 2: Redigera personlig information

* **Som en** *inloggad användare som vill uppdatera sina uppgifter*
* **vill jag** *kunna ändra min personliga information som namn, e-post och telefonnummer*
* **så att** *min kontoinformation förblir korrekt och aktuell*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på min kontosida*
* **When** *jag ändrar mina uppgifter i formuläret och klickar på "Spara"*
* **Then** *ska ändringarna sparas och en bekräftelsemeddelande ska visas*
* **And** *ska de uppdaterade uppgifterna synas på kontosidan*

#### Child User Story 3: Ändra lösenord

* **Som en** *inloggad användare som vill förbättra säkerheten*
* **vill jag** *kunna byta mitt lösenord genom att ange det nuvarande och ett nytt*
* **så att** *mitt konto förblir säkert*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på min kontosida*
* **When** *jag fyller i nuvarande lösenord och ett nytt lösenord och klickar på "Ändra lösenord"*
* **Then** *ska lösenordet uppdateras och jag får en bekräftelse*
* **And** *om det nuvarande lösenordet är felaktigt ska ett felmeddelande visas*

#### Child User Story 4: Visa orderhistorik

* **Som en** *inloggad användare som vill se sina tidigare köp*
* **vill jag** *se en lista över alla mina genomförda beställningar med datum, produkter och status*
* **så att** *jag kan följa upp tidigare köp och referensera dem om det behövs*

**Acceptanskriterier:**

* **Given** *att jag är inloggad och har genomfört tidigare beställningar*
* **When** *jag navigerar till min kontosida och klickar på "Orderhistorik"*
* **Then** *ska en lista över alla tidigare beställningar visas med datum, produkter och orderstatus*
* **And** *om jag inte har några tidigare beställningar ska ett meddelande visas: "Inga tidigare beställningar hittades"*

#### Child User Story 5: Hantera leveransadresser

* **Som en** *inloggad användare som ofta handlar*
* **vill jag** *lägga till, redigera och ta bort sparade leveransadresser*
* **så att** *jag snabbt kan välja en adress vid kassan utan att behöva ange den varje gång*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på min kontosida*
* **When** *jag lägger till en ny adress och fyller i alla obligatoriska fält*
* **Then** *ska adressen sparas och visas i min lista över sparade adresser*
* **And** *ska jag kunna radera eller redigera befintliga adresser från listan*

#### User Story 8: Se produktkatalog

* **Som en** *kund som besöker webbshopen*
* **vill jag** *se alla tillgängliga produkter uppdelade i ett responsivt rutnät med bild, produktnamn, pris och kategori*
* **så att** *jag snabbt kan bläddra bland sortimentet*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på produktkatalog-sidan*
* **When** *sidan laddas*
* **Then** *ska alla produkter visas i ett responsivt rutnät med bild, titel, pris och kategori*
* **And** *ska klick på ett produktkort leda till produktens detaljsida*

#### User Story 9: Se produktdetalj

* **Som en** *kund som vill veta mer om en specifik produkt*
* **vill jag** *se utförlig information om en produkt på en dedikerad detaljsida inklusive titel, bild, beskrivning, pris, kategori och lagerstatus*
* **så att** *jag kan fatta ett välgrundat köpbeslut*

**Acceptanskriterier:**

* **Given** *att jag klickar på ett produktkort i katalogen*
* **When** *jag navigerar till produktens detaljsida*
* **Then** *ska sidan visa produktens titel, högupplöst bild, beskrivning, pris, kategori och lagerstatus*
* **And** *om produkten inte finns ska en användarvänlig 404-vy visas*

#### User Story 10: Filtrera produkter efter kategori

* **Som en** *kund som vill hitta produkter inom en viss kategori*
* **vill jag** *filtrera produkter på katalogsidan genom att välja en kategori, med filtret i URL:en som `searchParams`*
* **så att** *jag kan snabbt hitta vad jag letar efter och dela eller bokmärka den filtrerade vyen*

**Acceptanskriterier:**

* **Given** *att jag befinner mig på produktkatalogen*
* **When** *jag väljer en kategori i filtermenyn*
* **Then** *ska URL:en uppdateras med kategoriparametern och endast produkter i den valda kategorin visas*
* **And** *ska filtret bestå vid sidomladdning och kunna delas via länk*

#### User Story 11: Bläddra produkter med paginering

* **Som en** *kund som handlar i en stor kategori*
* **vill jag** *navigera mellan sidor av produkter via paginering styrd av URL:en (`?page=X`)*
* **så att** *jag kan effektivt bläddra igenom ett stort sortiment*

**Acceptanskriterier:**

* **Given** *att det finns fler produkter än vad som ryms på en sida*
* **When** *jag klickar på en sida i pagineringen eller ändrar `?page=X` i URL:en*
* **Then** *ska rätt produkter för den valda sidan visas*
* **And** *ska jag kunna navigera framåt, bakåt och direkt till en specifik sida*

#### User Story 12: Se varukorgsuppföljning

* **Som en** *kund som lagt till produkter i varukorgen*
* **vill jag** *se en sammanställning av min varukorg med produkter, antal, ordervärde och totalbelopp*
* **så att** *jag kan granska mina val innan jag går till kassan*

**Acceptanskriterier:**

* **Given** *att jag har lagt till produkter i min varukorg*
* **When** *jag navigerar till varukorgsvyn*
* **Then** *ska varukorgen visa alla lagda produkter med antal, pris per produkt, totalt ordervärde och totalbelopp*
* **And** *ska jag kunna se en "Till kassa"-knapp för att gå vidare till betalning*

#### User Story 13: Tillgänglighet och SEO

* **Som en** *användare med tillgänglighetsbehov och en sökmotor*
* **vill jag** *att sidan följer tillgänglighets- och SEO-bästa praxis med semantisk HTML, tydliga rubriknivåer och unika metadatatitlar*
* **så att** *sidan är användbar för alla och väl indexerad av sökmotorer*

**Acceptanskriterier:**

* **Given** *att en sida har laddats*
* **When** *sidan renderats*
* **Then** *ska HTML använda semantiska element som `<header>`, `<main>`, `<article>` och `<nav>`*
* **And** *ska alla sidor ha unika metadatatitlar och tydliga rubriknivåer (`h1`-`h3`)*
* **And** *ska bilder använda Next.js `<Image />`-komponenten för optimerad laddning*

---

### 5.4 Valda Fördjupningsmoduler & Arkitekturbeslut (ADR)

> 💡 **Riktlinje för ADR:er (Architecture Decision Records):**
> Använd mallen i `docs/ADR-mall.md`. Det är viktigt att koppla er ADR till era valbara fördjupningsmoduler och förklara varför valen gjordes.

1. **Modul 1: UI-komponenter (shadcn/ui + TailwindCSS)**
   * **ADR-dokument:** [`docs/ADR-001-val-av-ui-komponenter.md`](docs/ADR-001-val-av-ui-komponenter.md)
   * **Kort motivering:** Vi valde shadcn/ui + TailwindCSS för att snabbt få ett professionellt, responsivt gränssnitt utan bygga allt från grunden.

2. **Modul 2: Databas & Autentisering (Supabase)**
   * **ADR-dokument:** [`docs/ADR-002-val-av-databas-och-autentisering.md`](docs/ADR-002-val-av-databas-och-autentisering.md)
   * **Kort motivering:** Supabase ger en komplett lösning med PostgreSQL-databas och inbyggd autentisering i samma plattform, vilket minskar externa beroenden.

3. **Modul 3: Hosting (Vercel)**
   * **ADR-dokument:** [`docs/ADR-003-val-av-hosting.md`](docs/ADR-003-val-av-hosting.md)
   * **Kort motivering:** Vercel, skapat av Next.js-teamet, ger perfekt nativ integration med Server Components, Server Actions och automatisk optimering.

4. **Modul 4: Betalningslösning (Stripe Hosted Checkout)**
    * **ADR-dokument:** [`docs/ADR-004-val-av-betalningslosning.md`](docs/ADR-004-val-av-betalningslosning.md)
    * **Kort motivering:** Stripe Hosted Checkout minimiserar komplexiteten – Stripe hanterar all säkerhet och betalningshantering, och testläge fungerar direkt.

5. **Modul 5: Persistent Varukorg (Zustand med persist-middleware)**
    * **ADR-dokument:** [`docs/ADR-005-val-av-state-hantering-fore-varukorg.md`](docs/ADR-005-val-av-state-hantering-fore-varukorg.md)
    * **Kort motivering:** Zustand + persist-middleware ger en global, reaktiv varukorg som överlever sidomladdningar och sessioner – helt i kodbasen utan externa API-konton.

6. **Modul 6: Transaktionell E-post (Resend)**
    * **ADR-dokument:** [`docs/ADR-006-val-av-transaktionell-epost.md`](docs/ADR-006-val-av-transaktionell-epost.md)
    * **Kort motivering:** Resend är API-first och kräver inga SMTP-inställningar – orderbekräftelser skickas med ett fåtal rader kod direkt i Server Actions.

---

### 5.5 Teamets Definition of Done (DoD)

*Vad krävs i er grupp för att en Issue/Ticket ska få flyttas till "Done"? (Kryssa i och anpassa)*:

* [x] Koden löser den specificerade User Storyn och uppfyller acceptanskriterierna.
* [x] Koden är testad lokalt och bygger utan fel (`npm run build`).
* [x] Inga TypeScript- eller lint-fel i terminalen.
* [x] Pull Request är skapad och granskad (Code Review) av minst en annan teammedlem.
* [x] Mergad till `dev`-branchen.
* [x] Relaterad issue är stängd i GitHub Projects.

---

## 6. Process, Tidslinje & Rekommenderade Milstolpar

Grupperna förväntas arbeta enligt agila principer med sprintar, backlog i GitHub Projects och dagliga korta avstämningar enligt ert [Gruppkontrakt](file:///c:/docLocal/Lexicon/FE26/grupparbete/kontrakt.md).

### 🗓️ Hållpunkter i projektet

| Period | Huvudfokus | Mål & Leverans |
| :--- | :--- | :--- |
| **Vecka 39 (21/9 – 25/9)** | **Uppstart, Kontrakt & Specifikation** | • Gruppkontrakt signerat.<br>• Val av Fas 1-kodbas fastställt.<br>• PRD-sektionerna ovan ifyllda.<br>• **Senast fredag 25/9:** Kanban-board / GitHub Projects uppsatt med brutna tickets redo för sprintstart nästa vecka. |
| **Vecka 40 (28/9 – 2/10)** | **Sprint: MVP-Utveckling** | • Kodning startar i full skala!<br>• Implementering av rutnät, detaljsida, sök/filter och paginering.<br>• **Mål slutet av v.40 (~2/10):** Feature Freeze för grundläggande MVP-krav. |
| **Vecka 41 (5/10 – 9/10)** | **Sprint: Fördjupning & Förfining** | • Implementering av era valda fördjupningsmoduler.<br>• Refaktorering av kodbasen, styling och UI-puts.<br>• Skriva färdigt ADR-dokumentation i `docs/`. |
| **Vecka 42 (12/10 – 13/10)** | **Slutleverans & Redovisning** | • **Måndag 12/10:** Total Code Freeze, finslipning av `README.md`, förberedelse och testkörning av presentationen.<br>• **Tisdag 13/10:** Slutredovisningar enligt [redovisningsinstruktionen](file:///c:/docLocal/Lexicon/FE26/grupparbete/redovisning.md). |

---

## 7. Leverabler & Slutredovisning

Vid projektets avslutning ska varje grupp leverera:

1. **GitHub-repo:** Innehållande ren kod, versionshistorik via PRs, ifylld `PRD.md`, era `docs/ADR-xxx.md` samt en informativ `README.md`.
2. **Fungerande applikation:** Redo att demonstreras live under redovisningen.
3. **Muntlig presentation:** 15–20 minuter uppdelad i tre delar: *Förberedelse*, *Utförande* och *Resultat & Reflektion* enligt instruktionerna i [redovisning.md](file:///c:/docLocal/Lexicon/FE26/grupparbete/redovisning.md).
