# Vena%Revenue — Website

Premium cinematic Next.js website for Vena%Revenue's revenue engineering platform.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** — custom design tokens matching brand palette
- **Framer Motion** — scroll-triggered reveals, page transitions, counter animations
- **Space Grotesk + Inter** — display & body fonts via next/font/google

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — cinematic 5-chapter story |
| `/services` | Services — outcome-focused interactive cards |
| `/projects` | Projects — case studies with before/after |
| `/about` | About — mission & company timeline |
| `/contact` | Contact — multi-step animated form |

## Design System

Colors defined in `tailwind.config.js` and `globals.css`:
- **Background:** `#0B0F1A`
- **Aqua accent:** `#00F5D4`
- **Purple accent:** `#7B61FF`
- **Pink accent:** `#FF4D6D`
- **Text:** `#E6E9F2`
- **Muted:** `#8892A4`
- **Gold % symbol:** `#FFD700`

## Key Components

| Component | Purpose |
|-----------|---------|
| `CustomCursor` | Dot + ring cursor with hover state |
| `ScrollProgress` | Gradient progress bar (top of viewport) |
| `AnimatedSection` | Scroll-triggered reveal wrapper |
| `GlowCard` | 3D-tilt glass card with radial hover glow |
| `Counter` | Eased number counter triggered on scroll |
| `TickerStrip` | Auto-scrolling marquee between sections |

## Sections (Home)

1. **Hero** — Particle canvas, animated headline, floating metric cards
2. **Ticker** — Scrolling capability strip
3. **Problem** — 4 revenue leak cards with scroll-animated timeline
4. **System** — 3-phase process (Diagnose → Engineer → Defend)
5. **Results** — Animated counters + case study cards
6. **Offer** — 3-tier pricing + radical risk reversal
7. **Final CTA** — Emotional close

## Production Notes

- All animations respect `prefers-reduced-motion` via Framer Motion defaults
- Canvas particle system is cleaned up on unmount
- Custom cursor hidden on mobile (< md breakpoint)
- Fonts loaded with `display: 'swap'` for performance
