# ADR-005: Val av State-hantering för Varukorg (Cookies och Server Actions)

* **Status:** Beslutad
* **Datum:** 2026-10-01
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #96 (Discussion), #50 (T50), ADR-002

---

## 1. Kontext & Problemställning

Webbutiken behöver ett globalt tillstånd för varukorgen som är tillgängligt från flera olika delar av gränssnittet (produktsida, navbar-ikon, kassasida) och som överlever sidomladdningar samt sessioner. Enligt PRD:n (FR-5 och fördjupningsmodulen *Persistent Varukorg*) ska lösningen vara enkel att implementera, kräva inga externa API-konton och fungera helt i kodbasen. Vi arbetar med Next.js App Router, vilket innebär att vi måste hantera både server- och klientrendering samt undvika hydration-mismatches.

Vidare har ADR-002 redan slagit fast Supabase (PostgreSQL + Auth) som databas och autentisering, och PRD:n kräver kundinloggning. Det är den faktorn som avgjorde valet nedan: en varukorg som ligger i klientens LocalStorage är låst till en webbläsare på en enhet, medan en serverbaserad varukorg kan knytas till en inloggad kund utan en klienttrogen migrering.

Det ursprungliga utkastet (2026-09-23) föreslog Zustand med persist-middleware, men skrev inte in hur lösningen skulle se ut när autentiseringen landade. Frågan togs upp på Discussion #96 och beslutades enhälligt av maintainer och teammedlemmar den 2026-10-01.

---

## 2. Övervägda Alternativ

### Alternativ A: React Context API med LocalStorage
* **Fördelar:** Inga externa beroenden, inbyggt i React.
* **Nackdelar:** Varje uppdatering av korgen kan orsaka omrenderingar i alla komponenter som konsumerar contexten. Kräver manuell hantering av hydrering mot LocalStorage (t.ex. med `useEffect` och `mounted`-flagga) för att undvika mismatch-varningar. Mer boilerplate än övriga alternativ.

### Alternativ B: Zustand med persist-middleware
* **Fördelar:** Lättviktigt (under 2 kB), selector-baserad modell som minimerar onödiga omrenderingar, inbyggt `persist()`-API som synkroniserar automatiskt med LocalStorage. Enkel, platt API som är enkel att lära sig och testa. Fungerar sömlöst i Client Components.
* **Nackdelar:** Ett extra npm-paket. Kräver att korgen bara hanteras i Client Components (eller att hydration hanteras medvetet). Korgen sparas per webbläsare/enhet och synkas inte mellan enheter. En klientstore kan inte skrivas till från servern, vilket gör kopplingen till en inloggad användare till en migrering som måste läsas av klienten och köras upp i exakt rätt ögonblick (vid inloggning) – annars tappas korgen tyst.

### Alternativ C: Server State med Cookies och Server Actions
* **Fördelar:** Fungerar sömlöst med Server Components, ingen JavaScript behövs på klienten för att läsa korgen. Ger server-side validering av lagerstatus och pris före varje skrivning. Korgen kan kopplas till en inloggad användare genom att läsa cookien, skriva raderna och rensa cookien. Möjligt att validera cookien som opålitbar klientinput (t.ex. med zod, kvantiteter takade, antal rader begränsat).
* **Nackdelar:** Mer komplex att implementera för snabba uppdateringar av navbar-badgen, eftersom varje ändring går via en Server Action. Kräver mer backend-logik för ett enkelt krav.

### Alternativ D: Redux Toolkit med redux-persist
* **Fördelar:** Mogen, väl dokumenterad lösning som skalar till stora tillståndsmodeller.
* **Nackdelar:** Betydande boilerplate (reducers, actions, store-konfiguration) som är oproportionerligt för en varukorg i ett kursprojekt.

---

## 3. Beslut

Vi beslutar att använda **Alternativ C: Server State med Cookies och Server Actions**.

Skälet är inte att cookies är "enklare" i sig, utan att vi redan har bundit oss till Supabase + autentisering (ADR-002) och att det är enda alternativet som kan bli en kundspecifik varukorg utan en riskfylld migrering:

| | Zustand + persist | Cookies + Server Actions |
|---|---|---|
| Gästkorg | fungerar | fungerar |
| Inloggad korg | svårt – måste kopiera LocalStorage till databasen, och en klientstore kan inte skrivas till från servern | naturligt – en Server Action skriver rader med `user_id` |
| Synk mellan enheter | inte möjligt | inte möjligt (men väntar bara på inloggning) |
| Server-side lagerkontroll | inte möjlig | redan byggd (`cart-actions.ts`) |
| Tyst utgångsgång / manipulering | ej relevant | hanterad (zod-validerad, takad) |

Priset vi betalar är en synlig fördröjning på badgen, eftersom varje ändring går via en Server Action. Det köps tillbaka med React 19 `useOptimistic`, som ger en omedelbar uppdatering medan servern bekräftar – utan att vi behöver en hybrid med två sanningskällor.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Lagerstatus och pris valideras om på servern före varje skrivning. Det spelar roll nu när databasen är skarp och data inte längre är mock.
* Inga hydration-varningar: korgen läses på servern, så badgen renderas korrekt redan vid första målning. Det var en känd risk med Zustand (`skipHydration` / `mounted`-flagga).
* Korgen fungerar före inloggning och överlever omladdning; kopplingen vid inloggning blir en liten Server Action.
* Cookien behandlas som opålitbar input och valideras (dubbletter slås ihop, kvantiteter och antal rader begränsas).
* Server/DB som sanningskällan gäller även för kassflödet, i linje med ADR-002.

### Negativa konsekvenser / Risker
* Badgen uppdateras inte omedelbart utan `useOptimistic`; round-tripen syns tydligt vid normala fördröjningar.
* Storleksbegränsningen för cookies innebär att korgen måste hålla sig till ett fåtal rader, inte att varje användare kan ha ett obegränsat antal.
* T44 ("Zustand cart store med persist-middleware") är föråldrat av detta beslut och ska stängas; T51 och T60 behöver ses över eftersom de skrevs mot en Zustand-store.
* Alla som bygger varukorgsrelaterad kod måste arbeta med `cookies()` och Server Actions i stället för en client-store.

---

## 5. Hur vi verifierar beslutet

* [ ] Varor kan läggas till och tas bort från både produktsida och kassasida.
* [ ] Antalet varor i navbar-badgen uppdateras efter Server Action utan sidomladdning.
* [ ] Varukorgens innehåll finns kvar efter att sidan laddats om (`F5`).
* [ ] Varukorgens innehåll finns kvar efter att webbläsarfönstret stängts och öppnats igen.
* [ ] En artikel som är slut i lager avvisas av servern och läggs inte i korgen.
* [ ] En manipulierad cookie (t.ex. negativ kvantitet eller för stort antal rader) avvisas av valideringen.
* [ ] Inga hydration-varningar syns i webbläsarkonsolen.