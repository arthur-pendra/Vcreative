# V-Creative

Portfolio- en bedrijfssite van Viënna Wachelder — content en strategie voor merken met karakter. Gebouwd met Next.js (App Router), GSAP + Lenis voor de scroll-choreografie en Three.js voor de WebGL-laag (tekst-reveals, ink-menu, 3D-logo, image-bend).

## Stack

- **Next.js 16** (App Router, TypeScript, CSS Modules)
- **GSAP + ScrollTrigger** — scroll-animaties, pinning, parallax
- **Lenis** — smooth scrolling, gekoppeld aan de GSAP-ticker
- **Three.js** — noise-mask tekst-reveals, ink-menu, pearl-logo (draco-gecomprimeerd GLB)
- **sharp / ffmpeg** — lokale asset-pipeline (zie Scripts)

## Ontwikkelen

```bash
npm install
npm run dev        # dev-server op 0.0.0.0 — bewust, zodat je op je telefoon
                   # via het LAN kunt meetesten (zie allowedDevOrigins in next.config.ts)
npm run build      # productie-build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Scripts (asset-pipeline)

```bash
npm run optimize:images   # alle png/jpg in public/ → webp (max 1920px, q85), verwijdert origineel
npm run optimize:videos   # mp4's in public/ comprimeren (vereist ffmpeg)
```

Na `optimize:images` moet je verwijzingen in de code zelf bijwerken naar `.webp`. Ruwe videobronnen horen in `source/videos-original/` (gitignored).

## Structuur

```
app/
  page.tsx           Homepage
  cases/             Cases-index + caseData.ts (alle case-content) + detailroutes
  over-mij/          Over-pagina
  contact/           Contactpagina
  components/        Gedeelde UI (Header, MenuOverlay, Loader, DynamicCursor, …)
  lib/               Lenis-singleton, WebGL-effects hook
docs/                Content-overzicht, sitemap, design-referenties (reference/ is gitignored)
public/
  cases/             Case-fotografie en -video's (webp/mp4, door de pipeline gehaald)
  fonts/             HW Cigars (display) + PP Mori (sans)
  icons/3D/          VIENNA_LOGO.glb + matcap/iridescence textures
  draco/             Draco-decoder voor de GLTF-loader
```

## Conventies

- **Sizing in `em`, nooit vaste `px`** — Figma-waardes ÷ 16 (zie `CLAUDE.md`). Het Osmo fluid-scaling systeem in `globals.css` zet `--size-font` op `body`; alles schaalt mee.
- **WebGL-tekst-reveals**: element markeren met `data-animation="webgl-text"`; modes via `data-webgl-text-mode`.
- **Parallax**: `data-parallax="trigger"` om een wrapper, `data-parallax="target"` op het bewegende element.
- **Case toevoegen**: entry in `app/cases/caseData.ts` + assets in `public/cases/<slug>/`.

## Aandachtspunten vóór livegang

- **HW Cigars draait op een trial-licentie** (`public/fonts/HW Cigars Trial/`) — definitieve licentie kopen en de productie-cuts plaatsen.
- Op `/cases/fgs` en `/cases/vloerverwarming-limburg` staat nog **"TODO copy klant"**-placeholder-tekst.
- Telefoonnummer en social-links deels placeholder.
