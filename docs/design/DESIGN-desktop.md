# DESIGN-desktop — Web Shop (Group 4 / Nordisk Form)

> Design spec for the **desktop view (1440 px)** based on the Figma file `Untitled`
> (fileKey `jJQcaNXVgkv9W5WChNHYgz`). Source frames: `nordisk-form-desktop` (#129:6),
> `Group 4 category page` (#140:26), `Landingpage` (#146:16) and the product/review frames
> (#309:581). Companions: [DESIGN-tablet.md](./DESIGN-tablet.md), [DESIGN-mobile.md](./DESIGN-mobile.md).

---

## 1. Overview

| Property | Value |
|---|---|
| Canvas width | 1440 px |
| Page margins | 64 px (left/right) in most sections |
| Content column | ~1048–1312 px centered, depending on section |
| Language | Swedish (all copy in the design) |
| UI system | shadcn/ui + TailwindCSS (see [ADR-001](../ADR-001-val-av-ui-komponenter.md)) |

**Page structure (landing):** announcement bar → store header → category nav → hero →
category introduction (dark banner with category tiles) → category grid (4 image cards) →
live category pill selector → product catalog (filters + 3-column grid) → benefits →
reviews → store footer.

**Page structure (category page):** announcement bar → store header → category nav →
category intro → product catalog (breadcrumbs, filter sidebar, toolbar, 12 cards, pagination) → store footer.

---

## 2. Design tokens

### 2.1 Colors

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#F7F7F4` | Page background (warm off-white) |
| `bg-surface` | `#FFFFFF` | Cards, header, hero CTA |
| `bg-dark` | `#2D2D2D` | Announcement bar, active category, dark buttons |
| `bg-footer` | `#F1F2EE` | Footer background |
| `border` | `#DDE2DF` | Default border (cards, inputs, header) |
| `border-soft` | `#DEDEDA` | Review cards |
| `text-primary` | `#17201E` | Primary text |
| `text-heading` | `#171817` | Section headings |
| `text-secondary` | `#66716E` | Secondary text |
| `text-muted` | `#BDC9C6` | Struck-through price, inactive text |
| `accent-teal` | `#0F766E` | Logo tagline, links |
| `accent-teal-bright` | `#0D9488` | "4" in the logo |
| `accent-teal-dark` | `#042F2E` | "GROUP" in the logo |
| `accent-teal-deep` | `#005C55` | Icons in the pill selector |
| `badge-sale-bg` | `#FFE5E5` | Sale badge background |
| `badge-sale-text` | `#FF2929` | Sale badge text |
| `alert` | `#E77C40` | Eyebrow ("PRODUCT") |
| `toggle-bg` | `#E9F3F1` | Availability toggle |
| `pill-bg` | `#F4F2FD` | Category pill background |
| `pill-count-bg` | `#E8E7F1` | Count badge in pills |
| `pill-text` | `#3E4947` | Pill label |
| `pill-count-text` | `#6E7977` | Pill count |
| `brand-mark-bg` | `#D7EBE7` | Logo mark |
| `overlay-hero` | `rgba(0,0,0,0.5)` | Hero overlay |
| `overlay-card` | `rgba(33,33,33,0.5)` | Category card overlay |

### 2.2 Typography

Primary font: **Inter** (400/500/600/700/800). Logo: **Nimbus Sans Bold**.
Secondary fonts in the design: JetBrains Mono, Plus Jakarta Sans (not in the main flows).

| Role | Style | Usage |
|---|---|---|
| Display | Inter Bold 56 | Hero "Välkommen till Group 4", "We Are Group 4" |
| H1 | Inter Bold 44.41 / lh 55.52 / ls 0.005em | Hero "Upp till 50% på grejer" |
| H2 | Inter SemiBold 30 / lh 1.15 / ls -0.02em | "Alltid hos Group 4", "Vad våra kunder säger" |
| H3 | Inter SemiBold 17 / lh 1.25 / ls -0.01em | Benefit card title |
| Body-lg | Inter Regular 18–20 / lh 1.55 | Hero body, category intro |
| Body | Inter Regular 14 / lh 1.45 | Standard text |
| Card title | Inter SemiBold 15–16 | Product name |
| Button | Inter SemiBold 16 | Primary buttons |
| Link | Inter Bold 15.54 / ls 0.0143em | "Shoppa nu" links |
| Label | Inter Bold 12 / ls 0.125–0.167em / UPPERCASE | Eyebrows, field labels |
| Caption | Inter Regular 11–13 | Meta, "Verifierad köpare" |
| Mono | JetBrains Mono Bold 32/64 | DNA-parser (not shop UI) |

### 2.3 Radii & shadows

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4 px | Hero CTA, small buttons |
| `radius-md` | 8 px | Pills, filter chips |
| `radius-lg` | 10 px | Category tiles |
| `radius-card` | 12 px | Product cards, inputs |
| `radius-xl` | 18 px | Benefit cards, hero cards |
| `shadow-card` | `0 5px 18px rgba(23,32,30,0.04)` | Cards |
| `shadow-subtle` | `0 1px 2px rgba(0,0,0,0.05)` | Pill selector |
| `shadow-elevated` | `0 4px 20px rgba(0,0,0,0.06)` | Elevated elements |

### 2.4 Spacing

Base grid 4 px. Common values: 4, 8, 12, 16, 20, 24, 28, 32, 40, 56, 64 px.
Section internals: 64 px (padding), 28–32 px (gap between blocks).

---

## 3. Layout

### 3.1 Grids

- **Product grid:** `repeat(3, minmax(0, 1fr))`, gap 24 px, width 1048 px.
- **Review grid:** `repeat(3, minmax(0, 1fr))`, gap 32 px, width 1048 px.
- **Category tiles (landing):** 4 × 295×272 px, gap 20 px.
- **Category tiles (intro):** 4 × fill, gap 8 px, height 172 px.
- **Benefit cards:** 4 × fill, gap 16 px, height 184 px.

### 3.2 Section widths

| Section | Width |
|---|---|
| Announcement bar / hero / footer | 1440 (full bleed) |
| Category intro | 1440, padding 56/64/40 |
| Product grid | 1048 |
| Benefits | 1050 |
| Reviews | 1072 |

---

## 4. Components

### 4.1 Announcement bar

Full width, `#2D2D2D`, height ~40 px, padding 10/24. Three items with icon (truck, clock,
shield), white text 12–13 px: **"Fri frakt över 499 kr"**, **"1-3 dagars leverans"**,
**"Trygg betalning med Klarna"**.

### 4.2 Store header

White, bottom border `#DDE2DF` (1 px), height ~90 px, padding 0/64:

- **Logo:** "GROUP 4" (Nimbus Sans Bold 30; "GROUP" `#042F2E`, "4" `#0D9488`) +
  "SWEDISH COMMERCE" (Inter Bold 10, ls 0.2em, `#0F766E`).
- **Search field:** centered, fill width, border `#DDE2DF`, radius 12, search icon,
  placeholder **"Sök produkter, märken och mer..."**.
- **Commerce icons:** user, heart, cart with count badge.

### 4.3 Category nav

Row, height 59 px, padding 0/64, white: dark button **"Alla kategorier"** (`#2D2D2D`,
white text, radius 8) + links: **Kläder, Skor, Accessoarer, Skönhet, Hem & Kök, Teknik,
Kampanjer, Nyheter** (Inter 14–15, `#17201E`).

### 4.4 Hero

Full bleed 1440×650, image + overlay `rgba(0,0,0,0.5)`. Text block left (500 px wide):

- Eyebrow **"PRODUCT"**: `#E77C40`, Bold 15.54, UPPERCASE.
- H1 **"Upp till 50% på grejer"**: white, Bold 44.41.
- CTA **"Shoppa nu"**: bg `#F7F7F4`, text `#525252`, padding 12/24, radius 4.

Alternative variant: H1 **"Välkommen till Group 4"** (Bold 56) + body
**"Noggrant utvalda produkter inom teknik, mode, hem och skönhet. Snabb leverans och enkel retur."**
+ CTA **"Utforska sortimentet"** (text `#000000`).

### 4.5 Category introduction

1440×500, dark image + overlay `rgba(0,0,0,0.5)`, padding 56/64/40:

- Title **"Kläder"** (Inter Regular 46, white).
- Body **"Upptäck säsongens nyheter inom herr- och dammode. Från tidlösa klassiker till
  moderna favoriter – hitta din stil hos Nordisk Form."** (Regular 20, lh 1.55, white).
- **Category tiles** (4, row, gap 8, height 172, radius 10, icon + label 13 SemiBold):
  - Active: bg `#2D2D2D`, white text/icon.
  - Inactive: bg `#F7F7F4`, border `#DDE2DF`, text `#17201E`.
  - Labels: **"Tech & Electronics"**, **"Fashion & Accessories"**, **"Home & Kitchen"**, **"Beauty & Care"**.

### 4.6 Category grid (landing)

4 image cards (295×272, padding 80/20/30, overlay `rgba(33,33,33,0.5)`):
**"Teknik"**, **"Men"**, **"Kids"**, **"Accessories"** (Bold 25, white) + subtext (Regular 18, white).

### 4.7 Live category pill selector

White panel (1232 px, padding 16, gap 16, radius 8, `shadow-subtle`):

- **Pill:** column, padding 12 px, bg `#F4F2FD`, radius 8, centered:
  icon (12–22 px, `#005C55`) + label (SemiBold 11, ls 0.04em, `#3E4947`) +
  count badge (bg `#E8E7F1`, radius 12, padding 2/6, Medium 11, `#6E7977`).
- Labels: **Beauty (2 st), Fragrances (3 st), Laptops (1 st), Furniture, Smartphones,
  Tillbehör, Klockor, Väskor, Kök & Mat**.
- Button row: primary + secondary button (radius 8).

### 4.8 Product catalog

- **Breadcrumbs** (category page).
- **Filter sidebar** (left, ~250 px): Availability (toggle, bg `#E9F3F1`),
  Category (checkboxes: Stickade plagg, Jackor, Skjortor, Accessoarer), Price (range slider),
  Rating, Brand, shipping note.
- **Toolbar:** **"16 produkter funna"** (left) + **"Filter"** button + sort
  **"Mest populära"** (right).
- **Grid:** 3 columns, gap 24, 12 cards, pagination below.

### 4.9 Product card

White, border `#DDE2DF` 1 px, radius 12, media height 260 px (landing) / ~328 px (category page):

- **"Sale" badge:** top left, pill, bg `#FFE5E5`, text `#FF2929`.
- **Favorite button:** top right, circle 34.7 px, white, border `#ECECE9`.
- Text: category (UPPERCASE 11–12), name (SemiBold 15–16), price (Bold 16) +
  old price (13, strikethrough, `#BDC9C6`), rating stars.

### 4.10 Benefits section

1440, padding 64, column centered, gap 28, white:

- Header (1050, space-between): **"Alltid hos Group 4"** (SemiBold 30, `#171817`).
- 4 cards (fill, gap 16, height 184, radius 18, `shadow-card`, padding 24):
  icon 38×38 + title (SemiBold 17, `#171817`) + body (Regular 14, `#5F6461`):
  - **"Beställ enkelt"** — "Handla som gäst, ingen registrering krävs"
  - **"Flexibel leverans"** — "Hemleverans eller hämta hos ombud"
  - **"Smidig betalning"** — "Klarna, Swish och kort"
  - **"Enkel retur"** — "14 dagars ångerrätt"

### 4.11 Reviews section

1440, padding 14/0, centered, gap 12, bg `#F7F7F4`:

- Header (1072, space-between): **"Vad våra kunder säger"** (SemiBold 30) +
  **"Visa fler omdömen"** (Medium 14, underlined).
- **Rating summary** (220 px, centered, white, border `#DEDEDA`, radius 11.1, `shadow-card`):
  **"4.8"** (Bold 56, `#0A0A0A`) + stars (gap 4) + **"Baserat på 1 240 omdömen"**
  (Regular 13, `#6D6D6D`).
- **Review cards** (3, fill, gap 16, white, border `#DEDEDA`, radius 11.1, padding 16):
  stars (gap 3) + title (SemiBold 15, `#0A0A0A`) + text (Regular 13, lh 1.5, `#5F6461`) +
  name (Medium 13, `#0A0A0A`) + **"Verifierad köpare"** (Regular 11, `#6D6D6D`).
  Example: **"Snabb leverans"** — "Beställde på måndagen och hade paketet på onsdagen. Smidigt!" — Carin.

### 4.12 Store footer

Bg `#F1F2EE`, padding 64/64/32, gap 32:

- Logo + description.
- 3 link columns (Kundservice, Produkter, Om oss, etc.).
- Legal bar: **"© 2026 Group 4. Alla rättigheter reserverade."**

---

## 5. Known inconsistencies in the design

1. **Brand:** the logo says "GROUP 4 / SWEDISH COMMERCE", the hero/intro says
   "Nordisk Form", the footer says "© 2026 Group 4". Confirm the official brand (see GLOSSARY.md).
2. **Category names:** English ("Tech & Electronics", "Beauty & Care") in tiles/pills vs
   Swedish ("Kläder", "Skor") in nav and filters.
3. **Hero CTA text color:** `#525252` on `#F7F7F4` has low contrast — consider `#17201E`.
