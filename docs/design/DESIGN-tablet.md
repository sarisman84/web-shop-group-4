# DESIGN-tablet — Web Shop (Group 4 / Nordisk Form)

> Design spec for the **tablet view (768 px)** based on the Figma file `Untitled`
> (fileKey `jJQcaNXVgkv9W5WChNHYgz`). Source frame: `nordisk-form-tablet` (#129:288,
> template `EL-0ecbad00`; also appears as #140:889). Companions:
> [DESIGN-desktop.md](./DESIGN-desktop.md), [DESIGN-mobile.md](./DESIGN-mobile.md).

---

## 1. Overview

| Property | Value |
|---|---|
| Canvas width | 768 px |
| Page margins | 32 px (header, hero, grid); 64 px (footer) |
| Language | Swedish |
| UI system | shadcn/ui + TailwindCSS (see [ADR-001](../adr/ADR-001-val-av-ui-komponenter.md)) |

**Page structure:** announcement bar → primary header (compact) → hero banner →
quick-filters row → product grid (3 columns × 2 rows) → store footer.

**Differences vs desktop:** no category nav, no filter sidebar (replaced by a
"Filter (2)" chip), the search field is an icon button, the hero is shorter (300 px) with
text at the bottom, product cards have a "Köp" button directly in the card.

---

## 2. Design tokens

### 2.1 Colors

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#F7F7F4` | Page background |
| `bg-surface` | `#FFFFFF` | Header, cards, hero CTA |
| `bg-dark` | `#2D2D2D` | Announcement bar, "Köp" button, footer logo |
| `bg-footer` | `#F1F2EE` | Footer background |
| `border` | `#DDE2DF` | Borders (header, cards, chips, icons) |
| `text-primary` | `#17201E` | Primary text, product names |
| `text-secondary` | `#66716E` | Category, old price, footer links |
| `text-muted` | `#BDC9C6` | Divider, bullet separators |
| `accent-teal` | `#0F766E` | "SWEDISH COMMERCE" in the logo |
| `accent-teal-bright` | `#0D9488` | "4" in the logo |
| `accent-teal-dark` | `#042F2E` | "GROUP" in the logo |
| `badge-sale-bg` | `#FFE5E5` | Sale badge background |
| `badge-sale-text` | `#FF2929` | Sale badge text |
| `brand-mark-bg` | `#D7EBE7` | Footer logo mark |
| `overlay-hero` | `rgba(23,32,30,0.45)` | Hero overlay |

### 2.2 Typography

Primary font: **Inter** (400/500/600/700/800). Logo: **Nimbus Sans**.

| Role | Style | Usage |
|---|---|---|
| Hero H1 | Inter ExtraBold 800 / 32 | "Nordisk Form" |
| Hero body | Inter Regular 14 / lh 1.5 | Hero subtext |
| Count | Inter SemiBold 600 / 14 | "16 produkter" |
| Card name | Inter SemiBold 600 / 15 | Product name |
| Card category | Inter Regular 13 | "Ytterkläder" etc. |
| Card rating | Inter Bold 12 | "4.6" |
| Card meta | Inter Regular 12 | "89 svar" |
| Price | Inter Bold 16 | "$349" |
| Old price | Inter Regular 13 / strikethrough | "$449" |
| Button (Köp) | Inter SemiBold 12 | "Köp" |
| Chip label | Inter SemiBold 13 | "Filter (2)", "Mest populära" |
| Announcement | Inter SemiBold 11 / ls 0.04em | Announcement bar |
| Footer heading | Inter Bold 14 / UPPERCASE | "Handla", "Kundservice", "Om Group 4" |
| Footer link | Inter Regular 13 | Footer links |
| Footer brand | Inter ExtraBold 19 + Medium 19 | "GROUP" + "4" |
| Footer legal | Inter Regular 11 | Legal bar |
| Logo | Nimbus Sans Bold 900 / 30 / ls -0.0167em | "GROUP" |
| Logo tagline | Inter Bold 10 / ls 0.2em | "SWEDISH COMMERCE" |

### 2.3 Radii & shadows

| Token | Value | Usage |
|---|---|---|
| `radius-md` | 8 px | Search/cart button, filter chip, "Köp" button |
| `radius-card` | 12 px | Product cards, sale badge |
| `radius-full` | 999 px | Favorite button, brand mark |

### 2.4 Spacing

Base grid 4 px. Common values: 6, 8, 10, 12, 14, 16, 24, 32, 40, 48, 64 px.

---

## 3. Layout

### 3.1 Grids

- **Product grid:** `repeat(3, minmax(0, 1fr))`, 2 rows, gap 16 px, height 485 px,
  nested in a container with padding 24/32/48.

### 3.2 Section widths

| Section | Width / padding |
|---|---|
| Announcement bar | 768, padding 10/24 |
| Primary header | 768, padding 16/32 |
| Hero | 768×300, padding 64/32/48 |
| Quick filters | 768, padding 16/32 |
| Grid container | 768, padding 24/32/48 |
| Footer | 768, padding 64/64/32, gap 40 |

---

## 4. Components

### 4.1 Announcement bar

Full width, `#2D2D2D`, padding 10/24, space-between. Three items (icon + text,
SemiBold 11, white) separated by "•" (`#BDC9C6`):
**"Fri frakt över 499 kr"**, **"1-3 dagars leverans"**, **"Trygg betalning med Klarna"**.

### 4.2 Primary header (compact)

White, bottom border `#DDE2DF`, padding 16/32, space-between:

- **Logo (Variant 3 "Sustainable Horizon"):** 64×64 icon (x 20) +
  "GROUP" (Nimbus Sans Bold 900 30, `#042F2E`) + " 4" (Nimbus Sans Regular 30, `#0D9488`) +
  "SWEDISH COMMERCE" (Inter Bold 10, ls 0.2em, `#0F766E`).
- **Search button:** 8 px padding, border `#DDE2DF`, radius 8, search icon 18 px.
- **Cart button:** same style as the search button, shopping-bag icon 18 px.

### 4.3 Hero banner

768×300, image + overlay `rgba(23,32,30,0.45)`, padding 64/32/48, text at the bottom (flex-end), gap 12:

- **"Nordisk Form"** (ExtraBold 32, white).
- **"Upptäck ren skandinavisk minimalism formgiven för det moderna hemmet."**
  (Regular 14, lh 1.5, white).

### 4.4 Quick-filters row

White, border `#DDE2DF`, padding 16/32, space-between:

- **"16 produkter"** (SemiBold 14, `#17201E`).
- **"Filter (2)" chip:** padding 8/14, border `#DDE2DF`, radius 8, sliders icon 14 px +
  label (SemiBold 13, `#17201E`).
- **Sort:** **"Mest populära"** (SemiBold 13, `#17201E`) + chevron-down 10 px.

### 4.5 Product card

White, border `#DDE2DF` 1 px, radius 12, column stretch:

- **Media:** height 260 px, product image (cover).
- **Media controls:** absolute 12/12, width 224, space-between:
  - **Sale badge:** padding 4/10, bg `#FFE5E5`, radius 12, "Sale" (Bold 11, `#FF2929`).
  - **Favorite button:** 32×32, white, border `#DDE2DF`, radius 999, heart 16 px.
- **Details:** padding 16, gap 12:
  - Row: category (Regular 13, `#66716E`) + star 12 px + rating (Bold 12, `#17201E`) +
    "N svar" (Regular 12, `#66716E`).
  - Name (SemiBold 15, `#17201E`).
  - Row: price (Bold 16, `#17201E`) + old price (Regular 13, strikethrough, `#66716E`) +
    **"Köp" button** (padding 6/12, gap 6, bg `#17201E`, radius 8, cart icon 14 px +
    "Köp" SemiBold 12, white).

**Products in the design:**

| Name | Category | Rating | Reviews | Price |
|---|---|---|---|---|
| Wool Blend Overcoat | Ytterkläder | 4.6 | 89 | $349 / $449 |
| Slim Fit Chinos | Byxor | 4.5 | 214 | $89 / $129 |
| Merino Crew Sweater | Stickade plagg | 4.7 | 156 | $129 |
| Denim Trucker Jacket | Jackor | 4.4 | 97 | $159 / $219 |
| Oxford Button-Down | Skjortor | 4.9 | 312 | $79 |
| Cashmere Scarf | Accessoarer | 4.9 | 73 | $119 / $169 |

### 4.6 Store footer

Bg `#F1F2EE`, padding 64/64/32, gap 40:

- **Brand column (400 px):** logo mark (circle: ring 22×23 stroke `#2D2D2D` 3 px +
  core 10×10 `#2D2D2D`, bg `#D7EBE7`, radius 999) + "GROUP" (ExtraBold 19, `#17201E`) +
  "4" (Medium 19, `#2D2D2D`) + description (Regular 13, lh 1.5, `#66716E`):
  **"Nordens destination för noggrant utvald design, elektronik och heminredning.
  Skandinavisk estetik möter funktion och hållbarhet."**
- **Link columns** (heading Bold 14 UPPERCASE `#17201E`, links Regular 13 `#66716E`, gap 10):
  - **Handla:** Hem & Inredning, Elektronik, Kök & Gastronomi, Belysning
  - **Kundservice:** Kontakta kundtjänst, Leverans & Spårning, Retur & Reklamation, Köpvillkor
  - **Om Group 4:** Vår filosofi & Lagom, Hållbarhet, Karriär, Press
- **Divider:** 1 px `#BDC9C6`.
- **Legal bar:** **"© 2026 Group 4. Alla rättigheter reserverade."** +
  **"Integritet · Cookies · Tillgänglighet"** (Regular 11, `#66716E`).

---

## 5. Known inconsistencies in the design

1. **Currency:** prices are in `$` (USD) while all other copy is Swedish — confirm currency (SEK?).
2. **Brand:** the hero says "Nordisk Form", the logo/footer say "Group 4".
3. **Announcement bar:** tablet uses "•" separators while desktop uses space-between without separators.
