# ADR-001: Val av UI-komponenter (shadcn/ui + TailwindCSS)

* **Status:** Beslutad
* **Datum:** 2026-09-22
* **Deltagare:** Group 4 (Spyridon P., Sana I. David P. Kiberewosen G.)
* **Relaterad Issue/Ticket:** #TBD

---

## 1. Kontext & Problemställning

Vi behöver bygga ett visuellt konsistent, tillgängligt och modernt gränssnitt för webbshoppen. Projektet kräver responsiva komponenter som fungerar smidigt på alla enheter, från mobiler till skrivbord. Vi måste välja ett UI-system som ger oss tillförlitliga, väldesignade komponenter utan att vi behöver bygga allt från grunden.

---

## 2. Övervägda Alternativ

### Alternativ A: HeroUI
* **Fördelar:** Byggt direkt på TailwindCSS, vilket ger konsistens med vårt val av Tailwind. Ger prebyggda komponenter som är enklare att anpassa än Bootstrap/Material UI.
* **Nackdelar:** Mindre etablerat community jämfört med de mer välkända alternativen. Färre tredjepartsresurser och dokumentation om teamet stöttar på problem.

### Alternativ B: Bygga all CSS från scratch med vanilla CSS / SCSS
* **Fördelar:** Fullständig kontroll över varje pixel, inga externa beroenden.
* **Nackdelar:** Tidskrävande att implementera alla komponenter (knappar, formulär, modaler, navigationsmenyer), högre risk för ojämnhet och otillgänglighet, och långsammare utvecklingshastighet.

### Alternativ C: shadcn/ui + TailwindCSS
* **Fördelar:** Prebyggda, högkvalitativa komponenter som är enkla att anpassa via TailwindCSS-klasser. Bygger direkt på Tailwind vilket ger maximal designflexibilitet. Lättviktigt, tillgängligt och mycket snabbt att komma igång med. Komponenterna är byggda som rena React-komponenter utan onödiga JavaScript-abstraktioner.
* **Nackdelar:** Kräver att teamet lär sig TailwindCSS om inte alla är bekanta med det. Inbyggda komponenter har begränsade alternativ för komplex anpassning utan att skriva egen CSS.

---

## 3. Beslut

Vi beslutar att använda **Alternativ C: shadcn/ui + TailwindCSS**. Det ger oss snabbast möjliga väg till ett professionellt, responsivt och visuellt konsistent gränssnitt. Komponenterna är byggda för att fungera perfekt i Next.js-appar, och TailwindCSS låter oss anpassa varje detalj utan att lämna JavaScript-koden.

---

## 4. Konsekvenser

### Positiva konsekvenser
* Webbutiken får ett modernt, professionellt utseende från start utan att bygga allt från grunden.
* Snabbare utveckling tack vare prebyggda komponenter som kan användas för produktkort, navigering, formulär och knappar.
* Responsivt gränssnitt som fungerar utmärkt på både mobil (Maya) och dator (Peter) enligt personasmåtten.
* Enklare att upprätthålla och uppdatera designen via TailwindCSS-klasser.

### Negativa konsekvenser / Risker
* Teamet måste vara bekväma med TailwindCSS – om någon inte känner till det behövs en inledande träningsinsats.
* Mycket anpassning av komponenternas utseende kan fortfarande kräva skrivande av custom CSS.

---

## 5. Hur vi verifierar beslutet

* [ ] Alla grundläggande komponenter (produktkort, knappar, formulär, navigation) är implementerade med shadcn/ui.
* [ ] Webbplatsen är fullt responsiv och fungerar på både mobil och skrivbord.
* [ ] Designen är konsekvent över alla sidor.
* [ ] Inga JavaScript-bördor som påverkar prestanda negativt.
