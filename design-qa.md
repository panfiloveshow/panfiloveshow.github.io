# Design QA — Sellico landing v2

final result: passed after the 250% zoom correction

## Visual target

- Selected source: `/Users/panfiloveshow/.codex/generated_images/019f8f37-24e2-7571-af8f-359547ed6e95/call_ljmm5WNrSbgSxwpW8eT1W4EG.png`
- Source dimensions: `864 × 1821`
- Direction: the user's selected second concept — XWAY-inspired section rhythm, seasonal banner, large product hero, AI block, dark growth funnel, product workspace, marketplace banners, cases, pricing, and a compact conversion ending.
- Combined comparison input: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-reference-comparison.png`

## Implementation captures

Desktop viewport: `1440 × 1024`

- Hero: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-final-desktop.png`
- Workspace: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-demo-final-desktop.png`
- Marketplace banners: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-campaign-final-desktop.png`
- Pricing: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-pricing-final-desktop.png`

Mobile viewport: `390 × 844`

- Hero: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-hero-mobile.png`
- Workspace: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-demo-mobile-final.png`
- Marketplace banners: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-campaign-mobile-final.png`
- Pricing: `/Users/panfiloveshow/Documents/ПРОЕКТЫ/сайт селлико/design-qa-assets/sellico-v2-pricing-mobile.png`

## Iterations and resolved findings

1. First desktop pass: the hero title wrapped into four visually weak lines and the workspace grid compressed the dashboard. Resolved by reducing the display size and using explicit `minmax(0, …)` tracks.
2. First mobile pass: the workspace chart stacked all P&L bars vertically and expanded the demo section excessively. Resolved with a horizontal mobile chart rail and a bounded mobile workspace preview while keeping the full desktop workspace.
3. Final comparison: the implementation matches the selected concept's hierarchy, light/dark pacing, green product palette, marketplace color moments, rounded geometry, and large transparent 3D assets. No P1 or unresolved P2 visual issues remain.

## Functional checks

- Mobile menu opens and closes; the expected button state changes were verified.
- Promo carousel advances from “Весна продаж” to “Больше заказов”.
- Workspace scenario switches to “Остатки / Склад” with `aria-pressed="true"`.
- Client result tab switches to “Выросла прибыль” with `aria-selected="true"`.
- Billing toggle changes the Business price from `2 990 ₽` to `2 392 ₽`.
- Empty CTA submission triggers native required validation for email and consent.
- Desktop document width: `1440`, viewport width: `1440`, horizontal overflow: `0`.
- Mobile document width: `390`, viewport width: `390`, horizontal overflow: `0`.
- Browser console errors and warnings: none.
- `npm run typecheck`: passed.
- `npm run build`: passed.

## Responsive raster upgrade — 2026-07-23

The six landing visuals now use AVIF/WebP responsive candidates instead of one
fixed WebP file per slot.

Validated viewports:

- `320 × 800`: no horizontal overflow; mobile hero uses the 768 px candidate.
- `390 × 844`: no horizontal overflow; AI and funnel keep the wide source in
  a native 2:1 strip and place the copy/cards in normal document flow.
- `768 × 1024`: no horizontal overflow; tablet hero remains sharp at a 590 px
  rendered width.
- `1024 × 768`: no horizontal overflow; desktop promotion and hero candidates
  are selected correctly.
- `1440 × 1024`: no horizontal overflow; wide backgrounds select 1920 px
  candidates.
- `1920 × 1080`: no horizontal overflow; hero and promotional assets remain
  constrained to their intended CSS slots.
- `2560 × 1440`: no horizontal overflow; the AI background selects the 2560 px
  candidate at 1x.

Density coverage:

- Hero: 1180 px master for a maximum 590 px desktop slot (`2x`) and roughly
  350 px mobile slot (`3x+`).
- Promotion: 1540 px master for a maximum 560 px slot (`2.75x`).
- Wildberries bag: 950 px master for a 325 px desktop slot (`2.9x`).
- Ozon parcel: 1160 px master for a 430 px desktop slot (`2.7x`).
- AI background: three external `2400 × 720` SVG layers replace the restored
  raster. Their gradients and outlines remain vector at every scale, no layer
  has a CSS blur/filter, and independent wrapper motion spans 32, 220 and
  380 px vertically with opposing horizontal drift. This creates clearly
  visible parallax without resampling a bitmap. On desktop the vector field
  overscans and covers the complete section height.
- Below 1024 px, only the outer edges of the particle viewport are masked
  (`0–12%` at the top and `76–100%` at the bottom). The sharp center is
  untouched, while a 40–48 px card overlap removes the hard visual seam.
- Funnel background: the source master is `1774 × 887`; its media slot keeps
  the source ratio instead of forcing a tall crop.

New implementation captures:

- `design-qa-assets/responsive-narrow-320.png`
- `design-qa-assets/responsive-ai-mobile.png`
- `design-qa-assets/responsive-tablet.png`
- `design-qa-assets/responsive-hero-desktop.png`
- `design-qa-assets/responsive-banners-desktop.png`
- `design-qa-assets/responsive-wide-1920.png`

## Mobile raster and structure correction — 2026-07-23

The portrait AI and funnel crops were removed after visual QA showed that they
had enlarged details from the wide source and looked pixelated on phones.

- AI mobile media is now a 2:1 strip rendered at `390 × 195`; the text card is
  a separate, opaque surface in normal flow with a 28 px controlled overlap.
- Funnel mobile media is rendered at `348 × 174`; its five step cards reflow
  below the image instead of sitting over an oversized portrait crop.
- Hero proof points use a compact two-column mobile grid; the integration card
  spans the row.
- `320 × 800`, `390 × 900`, `768 × 1024`, and `1440 × 1024` were checked with
  zero horizontal overflow.
- Browser console errors/warnings: none. Broken images: `0`.

## Full responsive image audit — 2026-07-23

Validated CSS viewports:

- Phones: `320 × 568`, `360 × 800`, `390 × 844`, `430 × 932`.
- Tablets and browser-zoom reflow: `768 × 1024`, `820 × 430`,
  `1024 × 768`.
- Desktop: `1280 × 800`, `1366 × 768`, `1440 × 900`, `1920 × 1080`,
  `2560 × 1440`.

Asset checks:

- All 52 production AVIF/WebP variants were decoded and their intrinsic
  dimensions checked.
- Every candidate within an asset family keeps the same aspect ratio.
- Hero, promotion, Wildberries, and Ozon assets retain an alpha channel.
- AI and funnel backgrounds use RGB sources with candidates through 5120 px
  and 3840 px respectively.
- No broken image, document-level horizontal overflow, or framework overlay
  was found in the final matrix.

Resolved during the audit:

- Limited the `640–1023 px` hero artwork to 440 px so it fits shallow windows
  created by 200–250% browser zoom.
- Reflowed marketplace artwork below the copy on phones, eliminating copy/image
  collisions at 320 px.
- Corrected `sizes` values for hero, funnel, Wildberries, and Ozon.
- Capped the wide funnel canvas at 1600 px; the `2560 px` viewport now renders
  it at about 1590 px instead of stretching it beyond 2300 px.
- Removed 320 px text overflow in the AI heading and proof cards.
- Fixed the pricing switch thumb origin and reduced the compact header/footer
  scale at narrow reflow widths.

## 250% zoom raster correction — 2026-07-23

Root cause:

- At a 250% browser zoom, the effective CSS viewport was about `820 × 430`.
- The AI and funnel sections switched to their desktop overlays at `640 px`.
- Their `2:1` raster sources were forced into tall `object-cover` slots, so the
  browser had to enlarge and crop them by height. The source detail was
  therefore visibly upscaled even though a large `srcset` candidate existed.
- The funnel also switched to a three-column grid, producing an uneven
  `3 + 2` card layout.

Correction:

- Desktop image overlays now start at `1024 px`.
- At `768–1023 px`, both visuals use a static `3:1` banner cropped by width,
  not enlarged by height.
- At phone widths they remain `2:1`.
- AI copy is a separate surface in normal flow below `1024 px`.
- Funnel cards use `2 + 2 + 1-wide` below `1024 px`; the five-column overlay is
  reserved for desktop.
- Desktop AI media is capped to `min(50vw, 760px)` with only a 10 px parallax
  allowance. The funnel no longer has a forced 520 px minimum image height.

Final matrix:

- `320 × 568`, `390 × 844`, `768 × 1024`, `820 × 430`, `1024 × 768`,
  `1440 × 900`, `1920 × 1080`.
- Horizontal overflow: `0` at every viewport.
- Broken images after lazy-load settling: `0`.
- Browser console errors/warnings: `0`.
- `npm run lint`, `npm run typecheck`, `npm run build`: passed.

## Hero artwork integration — 2026-07-23

- Removed the standalone hero illustration from phone, tablet, and browser-zoom
  layouts below `1024 px`.
- The proof grid now follows the offer directly; the artwork contributes zero
  layout height below the desktop breakpoint.
- On desktop the illustration is absolutely positioned inside the same hero
  scene and no longer determines the section height.
- Reduced the desktop artwork footprint and kept responsive AVIF/WebP loading.
- Verified at `390 × 844`, `502 × 341`, `1024 × 768`, and `1440 × 900` with
  zero horizontal overflow.
