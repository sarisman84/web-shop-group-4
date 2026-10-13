# DESIGN-mobile — Web Shop (Group 4 / Nordisk Form)

> Design spec for the **mobile view (375/390 px)** based on the Figma file `Untitled`
> (fileKey `jJQcaNXVgkv9W5WChNHYgz`). Source frames: `nordisk-form-mobile` (#129:515,
> template `EL-ab6d85fc`; also #140:1146), `mobile-header` (#127:114),
> `mobile-menu-open` (#127:138), `Benefits section — mobile` (#210:183).
> Companions: [DESIGN-desktop.md](./DESIGN-desktop.md), [DESIGN-tablet.md](./DESIGN-tablet.md).

---

## 1. Overview

| Property | Value |
|---|---|
| Canvas width | 390 px (main frame); 375 px (header/menu) |
| Page margins | 16 px (header, hero, list, controls); 24 px (announcement) |
| Language | Swedish |
| UI system | shadcn/ui + TailwindCSS (see [ADR-001](../adr/ADR-001-val-av-ui-komponenter.md)) |

**Page structure:** announcement bar → primary header → hero (image + text) →
controls row (Filtrera/Sortera) → product list (1 column) → store footer (accordion).

**Differences vs tablet/desktop:** hamburger menu instead of category nav,
search as an icon button, products in a 1-column list, footer as an accordion,
full-screen overlay for the menu.

---

## 2. Design tokens

### 2.1 Colors

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#F7F7F4` | Page background |
| `bg-surface` | `#FFFFFF` | Header, cards, menu panel |
| `bg-dark` | `#2D2D2D` | Announcement bar, "Köp" button |
| `bg-footer` | `#F1F2EE` | Footer background |
| `bg-section` | `#F4F6F5` | Menu sections (categories, utility) |
| `border` | `#DDE2DF` | Borders (cards, chips, accordion) |
| `border-mobile` | `#E2E7E4` | Header/menu borders (375 variant) |
| `text-primary` | `#17201E` | Primary text, product names |
| `text-mobile` | `#1E2522` | Header/menu text (375 variant) |
| `text-secondary` | `#66716E` | Secondary text, old price |
| `text-mobile-secondary` | `#636E69` | Menu sublinks, utility |
| `text-muted` | `#BDC9C6` | Divider |
| `text-copyright` | `#95A39E` | "© 2026 Nordisk Form AB" |
| `accent-sale` | `#C84B42` | "Rea %" in the menu |
| `badge-sale-bg` | `#FFE5E5` | Sale badge background |
| `badge-sale-text` | `#FF2929` | Sale badge text |
| `badge-cart-bg` | `#1E2522` | Cart badge |
| `brand-mark-bg` | `#D7EBE7` | Footer logo mark |
| `overlay-menu` | `rgba(30,37,34,0.3)` | Menu overlay |

### 2.2 Typography

Primary font: **Inter** (400/500/600/700/800).

| Role | Style | Usage |
|---|---|---|
| Hero H1 | Inter ExtraBold 800 / 24 | "Nordisk Form" |
| Hero body | Inter Regular 13 / lh 1.4 | Hero subtext |
| Section title | Inter SemiBold 25 / ls -0.02em | "Alltid hos Group 4" |
| Card name | Inter SemiBold 15 | Product name |
| Card category | Inter Regular 13 | "Ytterkläder" etc. |
| Card rating | Inter Bold 12 | "4.6" |
| Card meta | Inter Regular 12 | "89 svar" |
| Price | Inter Bold 16 | "$349" |
| Old price | Inter Regular 13 / strikethrough | "$449" |
| Button (Köp) | Inter SemiBold 12 | "Köp" |
| Chip label | Inter SemiBold 13 / Regular 13 | "Filtrera" / "Sortera" |
| Announcement | Inter SemiBold 11 / ls 0.04em | Announcement bar |
| Menu primary link | Inter Medium 16 | "Nyheter", "Kampanjer" |
| Menu section label | Inter SemiBold 14 / UPPERCASE | "ALLA KATEGORIER" |
| Menu subcategory | Inter SemiBold 15 / Medium 15 | "Kläder", "Skor" |
| Menu nested link | Inter Regular 14 | "Jackor", "Byxor" |
| Menu utility | Inter Medium 13 | "Kundservice" etc. |
| Logo (header) | Inter Bold 15 / UPPERCASE | "NORDISK FORM" |
| Status bar | Inter SemiBold 14 | "9:41" |
| Footer heading | Inter SemiBold 14 | "Handla", "Kundservice" |
| Footer brand | Inter ExtraBold 19 + Medium 19 | "GROUP" + "4" |
| Footer legal | Inter Regular 11 | Legal bar |

### 2.3 Radii, shadows & touch targets

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6 px | Chips, cart button |
| `radius-md` | 8 px | Hero image, cart badge |
| `radius-card` | 12 px | Product cards, sale badge, header, menu |
| `radius-xl` | 18 px | Benefit cards |
| `shadow-header` | `0 4px 16px rgba(30,37,34,0.05)` | Mobile header |
| `shadow-card` | `0 5px 18px rgba(23,32,30,0.04)` | Benefit cards |
| `touch-target` | 44×44 px | All tap areas (hamburger, search, cart, close) |

### 2.4 Spacing

Base grid 4 px. Common values: 4, 6, 8, 12, 16, 18, 20, 24, 32, 40, 44 px.

---

## 3. Layout

### 3.1 Grids

- **Product list:** 1 column, gap 16 px, padding 16 px.
- **Benefits grid:** `repeat(2, 1fr)`, gap 12 px, padding 40/20 (section #210:183).

### 3.2 Section widths

| Section | Width / padding |
|---|---|
| Announcement bar | 390, padding 10/24 |
| Primary header | 390, padding 12/16 |
| Hero | 390, padding 16, gap 12 |
| Controls row | 390, padding 12/16, gap 12 |
| Product list | 390, padding 16, gap 16 |
| Footer | 390, padding 32/16/24, gap 40 |

---

## 4. Components

### 4.1 Announcement bar

Full width, `#2D2D2D`, padding 10/24. Two items (icon + text, SemiBold 11, white)
separated by "•" (`#BDC9C6`): **"Fri frakt över 499 kr"**, **"1-3 dagars leverans"**.

### 4.2 Primary header

White, bottom border `#DDE2DF`, padding 12/16, space-between:

- **Left:** hamburger icon 20×20 + logo 64×64 (gap 12).
- **Right:** cart button (padding 6, border `#DDE2DF`, radius 6, shopping-bag 16 px).

**375 variant (`mobile-header` #127:114)** — standalone header with status bar:

- 375 px, white, border `#E2E7E4`, radius 12, `shadow-header`.
- **Status bar:** 44 px, padding 0/20: "9:41" (SemiBold 14, `#1E2522`) +
  signal/wifi/battery icons (gap 6).
- **Header bar:** 56 px, padding 0/16, bottom border `#E2E7E4`:
  - Hamburger tap 44×44 (icon 22×22).
  - Logo: **"NORDISK FORM"** (Bold 15, UPPERCASE, `#1E2522`).
  - Search tap 44×44 (icon 20×20) + cart tap 44×44 (bag 24×24 + badge 16×16,
    offset x 12 / y -4, bg `#1E2522`, radius 8, "3" Bold 9, white).

### 4.3 Mobile menu (full-screen overlay)

375×812, overlay `rgba(30,37,34,0.3)`, border `#E2E7E4`, radius 12. White panel,
column space-between:

- **Status bar** + **header bar (close state):** close tap 44×44 (x-circle 22) +
  "NORDISK FORM" + spacer 44×44.
- **Primary links** (row, 52 px, padding 0/24, bottom border `#E2E7E4`, chevron-right 16):
  **"Nyheter"**, **"Kampanjer"**, **"Varumärken"** (Medium 16, `#1E2522`),
  **"Rea %"** (SemiBold 16, `#C84B42`).
- **Categories section:**
  - Trigger (52 px, padding 0/24, bg `#F4F6F5`): **"ALLA KATEGORIER"**
    (SemiBold 14, UPPERCASE, `#1E2522`) + chevron-down 16.
  - Tree (padding 0 0 12):
    - **"Kläder"** (SemiBold 15, `#1E2522`, row 48 px, padding 0/24/0/32) + minus icon 14.
    - Nested (padding 0 0 8 48, gap 4, left border 2 px `#E2E7E4`):
      **"Jackor"**, **"Byxor"**, **"Skjortor"**, **"Stickat"** (Regular 14, `#636E69`, 36 px).
    - **"Skor"**, **"Accessoarer"**, **"Skönhet"** (Medium 15, `#1E2522`) + chevron-right.
- **Utility footer** (padding 24/24/44, gap 16, bg `#F4F6F5`, top border `#E2E7E4`):
  **"Kundservice"**, **"Leverans & retur"**, **"Spåra order"** (Medium 13, `#636E69`, 32 px) +
  **"© 2026 Nordisk Form AB"** (Regular 11, `#95A39E`).

### 4.4 Hero

390, padding 16, gap 12:

- **Image:** fill, height 180 px, radius 8 (cover).
- **"Nordisk Form"** (ExtraBold 24, `#17201E`).
- **"Upptäck ren skandinavisk minimalism formgiven för det moderna hemmet."**
  (Regular 13, lh 1.4, `#66716E`).

### 4.5 Controls row

White, border `#DDE2DF`, padding 12/16, gap 12. Two fill chips (padding 8/0, centered,
gap 6, border `#DDE2DF`, radius 6):

- **"Filtrera":** sliders icon 14 px + label (SemiBold 13, `#17201E`).
- **"Sortera":** label (Regular 13, `#17201E`) + chevron-down 10 px.

### 4.6 Product card (1 column)

White, border `#DDE2DF` 1 px, radius 12, column stretch:

- **Media:** height 260 px, product image (cover).
- **Media controls:** absolute 12/12, width 358, space-between:
  - **Sale badge:** padding 4/10, bg `#FFE5E5`, radius 12, "Sale" (Bold 11, `#FF2929`).
  - **Favorite button:** 32×32, white, border `#DDE2DF`, radius 999, heart 16 px.
- **Details:** padding 16, gap 12:
  - Row: category (Regular 13, `#66716E`) + star 12 px + rating (Bold 12) + "N svar" (Regular 12).
  - Name (SemiBold 15, `#17201E`).
  - Row: price (Bold 16) + old price (Regular 13, strikethrough, `#66716E`) +
    **"Köp" button** (padding 6/12, gap 6, bg `#17201E`, radius 8, cart icon 14 px + "Köp" SemiBold 12, white).

**Products in the design:** the same six as tablet — Wool Blend Overcoat (Ytterkläder,
4.6, $349/$449), Slim Fit Chinos (Byxor, 4.5, $89/$129), Merino Crew Sweater
(Stickade plagg, 4.7, $129), Denim Trucker Jacket (Jackor, 4.4, $159/$219),
Oxford Button-Down (Skjortor, 4.9, $79), Cashmere Scarf (Accessoarer, 4.9, $119/$169).

### 4.7 Benefits section (mobile)

390, padding 40/20:

- Title **"Alltid hos Group 4"** (SemiBold 25, ls -0.02em, `#171817`).
- 2×2 grid, gap 12. **Card:** fill, height 210, padding 18, white, border `#DDE2DF`,
  `shadow-card`, radius 18: icon 32×32 + text block (padding 16 0 0, gap 7):
  title (SemiBold 17, `#171817`) + body (Regular 14, `#5F6461`):
  - **"Beställ enkelt"** — "Handla som gäst, ingen registrering krävs"
  - **"Flexibel leverans"** — "Hemleverans eller hämta hos ombud"
  - **"Smidig betalning"** — "Klarna, Swish och kort"
  - **"Enkel retur"** — "14 dagars ångerrätt"

### 4.8 Store footer

Bg `#F1F2EE`, padding 32/16/24, gap 40:

- **Brand column:** logo mark (circle: ring 22×23 stroke `#2D2D2D` 3 px +
  core 10×10 `#2D2D2D`, bg `#D7EBE7`, radius 999) + "GROUP" (ExtraBold 19, `#17201E`) +
  "4" (Medium 19, `#2D2D2D`) + description (Regular 13, lh 1.5, `#66716E`):
  **"Nordens destination för noggrant utvald design, elektronik och heminredning.
  Skandinavisk estetik möter funktion och hållbarhet."**
- **Accordion** (gap 32; row padding 8/0, space-between, border `#DDE2DF`):
  **"Handla"**, **"Kundservice"**, **"Om Group 4"** (SemiBold 14, `#17201E`) + plus icon 14 px.
- **Divider:** 1 px `#BDC9C6`.
- **Legal bar:** **"© 2026 Group 4. Alla rättigheter reserverade."** +
  **"Integritet · Cookies · Tillgänglighet"** (Regular 11, `#66716E`).

---

## 5. Known inconsistencies in the design

1. **Two header variants:** #129:515 (390 px, 64×64 logo image, bordered cart) vs
   #127:114 (375 px, "NORDISK FORM" text, search + cart with badge). Confirm which is canonical.
2. **Currency:** prices are in `$` (USD) while all other copy is Swedish.
3. **Brand:** hero/header say "Nordisk Form", logo/footer say "Group 4",
   the menu says "© 2026 Nordisk Form AB".
4. **Announcement bar:** mobile shows 2 of 3 items (the Klarna item is missing).
