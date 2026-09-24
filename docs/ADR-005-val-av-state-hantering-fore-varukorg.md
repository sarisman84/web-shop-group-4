# ADR-005: Val av State-hantering för Varukorg (Zustand med persist-middleware)

* **Status:** Pending
* **Datum:** 2026-09-23
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Webbutiken behöver ett globalt tillstånd för varukorgen som är tillgängligt från flera olika delar av gränssnittet (produktsida, navbar-ikon, kassasida) och som överlever sidomladdningar samt sessioner. Enligt PRD:n (FR-5 och fördjupningsmodulen *Persistent Varukorg*) ska lösningen vara enkel att implementera, kräva inga externa API-konton och fungera helt i kodbasen. Vi arbetar med Next.js App Router, vilket innebär att vi måste hantera både server- och klientrendering samt undvika hydration-mismatches.

---

## 2. Övervägda Alternativ

### Alternativ A: React Context API med LocalStorage
* **Fördelar:** Inga externa beroenden, inbyggt i React.
* **Nackdelar:** Varje uppdatering av korgen kan orsaka omrenderingar i alla komponenter som konsumerar contexten. Kräver manuell hantering av hydrering mot LocalStorage (t.ex. med `useEffect` och `mounted`-flagga) för att undvika mismatch-varningar. Mer boilerplate än övriga alternativ.

### Alternativ B: Zustand med persist-middleware
* **Fördelar:** Lättviktigt (under 2 kB), selector-baserad modell som minimerar onödiga omrenderingar, inbyggt `persist()`-API som synkroniserar automatiskt med LocalStorage. Enkel, platt API som är enkel att lära sig och testa. Fungerar sömlöst i Client Components.
* **Nackdelar:** Ett extra npm-paket. Kräver att korgen bara hanteras i Client Components (eller att hydration hanteras medvetet). Korgen sparas per webbläsare/enhet och synkas inte mellan enheter.

### Alternativ C: Server State med Cookies och Server Actions
* **Fördelar:** Fungerar sömlöst med Server Components, ingen JavaScript behövs på klienten för att läsa korgen, kan i framtiden kopplas till inloggad användare.
* **Nackdelar:** Mer komplex att implementera för snabba, optimistiska UI-uppdateringar (t.ex. omedelbar uppdatering av navbar-badgen). Kräver mer backend-logik för ett enkelt krav.

### Alternativ D: Redux Toolkit med redux-persist
* **Fördelar:** Mogen, väl dokumenterad lösning som skalar till stora tillståndsmodeller.
* **Nackdelar:** Betydande boilerplate (reducers, actions, store-konfiguration) som är oproportionerligt för en varukorg i ett kursprojekt.

---

## 3. Beslut

Vi beslutar att använda **Alternativ B: Zustand med persist-middleware**.

Zustand ger oss ett globalt, reaktivt tillstånd med minimal boilerplate, medan `persist()`-middleware:n hanterar synkroniseringen mot LocalStorage "out of the box". Detta uppfyller PRD:ns krav på en persistent varukorg utan externa beroenden och håller lösningen enkel nog för teamet att förstå och underhålla gemensamt.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Korgen är tillgänglig i alla Client Components via en enkel `useCartStore()`-hook.
* Innehållet persisteras automatiskt mellan sidomladdningar och sessioner utan manuell kod.
* Selector-modellen minimerar onödiga omrenderingar jämfört med Context.
* Enkelt att testa och mocka i enhetstester.
* Lättviktigt beroende som inte påverkar bundelstorleken märkbart.

### Negativa konsekvenser / Risker
* Varukorgen är per webbläsare/enhet – en användares korg synkas inte mellan enheter eller om webbläsardata rensas.
* Vi måste hantera hydration i Next.js medvetet (t.ex. med `skipHydration` eller en `mounted`-flagga) så att korgens innehåll inte renderas servern och skapar mismatch-varningar.
* Alla i teamet måste känna till Zustands API för att kunna bidra till varukorgsrelaterad kod.

---

## 5. Hur vi verifierar beslutet

* [ ] Varor kan läggas till och tas bort från både produktsida och kassasida.
* [ ] Antalet varor i navbar-badgen uppdateras omedelbart utan sidomladdning.
* [ ] Varukorgens innehåll finns kvar efter att sidan laddats om (`F5`).
* [ ] Varukorgens innehåll finns kvar efter att webbläsarfönstret stängts och öppnats igen.
* [ ] Inga Hydration-varningar syns i webbläsarkonsolen.
