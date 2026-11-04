# BlockHyre Brand Sheet: The Industrial Boutique

This document defines the visual language, design principles, and technical specifications for the BlockHyre platform. It bridges the gap between rugged industrial utility and premium boutique precision—a concept we call **"The Neighborhood Factory."**

All design tokens are managed centrally in the monorepo via `@repo/tokens` (`packages/tokens`) and exported to CSS variables (Tailwind v4) and TypeScript constants (React Native).

---

## 🏗️ Design Philosophy: "Industrial Boutique"

BlockHyre is not a marketplace; it is a **production network**. Our design reflects the transition of the neighborhood from a place of consumption to a place of production.

### Core Pillars
1. **Rugged Authority**: Using the visual language of high-end machinery and construction (heavy borders, safety alerts, industrial fonts).
2. **Precise Luxury**: High-end spacing, sophisticated typography (Serif/Sans pairings), and smooth, deliberate animations.
3. **The Peace Fund**: A sense of security and trust woven into the interface through "operational" indicators and insured status signals.
4. **Cinematic Utility**: Every interaction feels like part of a larger machine—precise, mechanical, and satisfying.

---

## 🎨 Color Palette

The color system combines the precision of high-end tools with clear functional roles. Primary interactions are anchored in **Electric Indigo** and **Midnight Navy**, while **Safety Orange** is reserved exclusively for critical warnings and safety gates.

| Color | Hex | Role | Usage |
| :--- | :--- | :--- | :--- |
| **Electric Indigo** | `#5B6EAE` | Primary Brand CTA | Primary action buttons, active navigation states, focus rings, brand accent links |
| **Midnight Navy** | `#1B2A4A` | Secondary Brand / Hero | High-contrast dark cards, hero headers, primary pricing typography, button hover states |
| **Periwinkle Blue** | `#7289DA` | Dark Mode Interactive | Dark mode primary accent, interactive contrast on dark charcoal surfaces |
| **Safety Orange** | `#FF6B00` | Dedicated Semantic Urgency | High-Power Tier 3 Safety Gate modal, legal & liability caution icons, countdown return timers (NOT general CTAs) |
| **Peace Fund Emerald** | `#10B981` | Trust & Operational Status | Operational pulsing dots, approved rental state, net revenue figures |
| **Charcoal** | `#1A1A1A` | Workshop Dark Backgrounds | Manifesto sections, high-contrast footers, dark mode base |
| **Deep Charcoal** | `#1C1C2E` | Elevated Dark Surfaces | Sidebar navigation, dark cards, telemetry containers |
| **Concrete** | `#E8E4DD` | Secondary Surfaces | Light secondary backgrounds, section transitions, structural dividers |
| **Signal White** | `#FAFAF8` | Primary Canvas | Clean workspace canvas, high-legibility card surfaces |
| **Workshop Gray** | `#333333` | Industrial Borders | Spec borders, tertiary labels, machinery telemetry shadows |

---

## 📐 Corner Radii: Strict 5-Tier Semantic Scale

Corner radii balance hard industrial machinery lines with the signature 40px Boutique curve. Every UI container must adhere to one of these five tiers:

| Tier | Radius | CSS Token | Utility Class | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **None** | `0px` | `--radius-none` | `rounded-none` | Hard machinery edges, raw telemetry containers, industrial data grids |
| **Subtle** | `6px` | `--radius-subtle` | `rounded-subtle` | Form inputs, small badges, inline tags, toast borders, telemetry brackets |
| **Default / Interactive** | `10px` | `--radius-default` / `--radius-interactive` | `rounded-default` / `rounded-interactive` | Standard buttons, dropdowns, interactive icon containers, action elements |
| **Card** | `16px` | `--radius-card` | `rounded-card` | Standard content cards, dashboard containers, modal dialogs, drawers |
| **Boutique** | `40px` (`2.5rem`) | `--radius-boutique` | `rounded-boutique` | Signature boutique radius for hero cards, featured tool showcases, primary promo containers |
| **Full** | `9999px` | `--radius-full` | `rounded-full` | Circular status dots, user avatars, pill badges, operational indicators |

---

## 🔡 Typography

We use a four-font system to establish clear hierarchy and industrial tone.

| Category | Font Family | Usage |
| :--- | :--- | :--- |
| **Display** | **Bebas Neue** | High-impact headlines (e.g., "FACTORY."), uppercase tracking. |
| **Serif** | **Roboto Slab** | Section headers, Dashboard titles, card titles—adds the "Boutique" elegance. |
| **Sans** | **Inter** | UI text, body copy, form labels—ensures modern legibility and WCAG AA contrast. |
| **Mono** | **Space Mono / Courier New** | Metadata, Telemetry, Brackets, countdown timers—functional/spec-sheet data. |

### Industrial Tracking
- **Headlines**: `tracking-tight` for a dense, authoritative feel.
- **Micro-labels & Telemetry**: `uppercase tracking-industrial` (`0.2em`) for a "serial number" aesthetic.

---

## ⚙️ Components & Textures

### Visual Textures
- **Workshop Grit**: A global `grain-overlay` (SVG noise at 4% opacity) gives the interface a tactile, physical feel.
- **Boutique Radius**: Signature `2.5rem` (40px) corner radius contrasts hard industrial lines with soft premium geometry.
- **Electric Glow**: Focused interactive elements feature subtle Electric Indigo telemetry glows (`shadow-[0_0_20px_rgba(91,110,174,0.4)]`).

### Interaction Language
- **The Bracket Reveal**: `[ LINK ]` brackets slide in on hover, mimicking a factory terminal's focus state.
- **Magnetic Press**: Buttons lift on hover (shadow expansion) and physically depress on click (`active:translate-y-0.5`).
- **Telemetry Cards**: KPI cards are styled as digital readouts from a machine—monospace numbers, glowing borders, and status dots.
- **Safety Gate**: Tier 3 High-Power tools require interactive safety waivers and manual checks utilizing dedicated Safety Orange indicators.

---

## 📡 Principles from "The Neighborhood Factory"
*Derived from the BlockHyre Refactor Protocol*

- **Show the Machine**: Don't hide the data. Use telemetry feeds, heatmaps, and specs grids to show the platform is "Operational."
- **Insured by Default**: The "Peace Fund" is not a footer link; it's a UI element. Use emerald "operational" dots to signify coverage.
- **Motion with Purpose**: Avoid "sliding" for the sake of it. Use "Conveyor Belt" entrances—staggered x-axis movements that feel like a production line starting up.
- **Contrast Breaks**: Use dark charcoal sections (The Manifesto) to break up the Signal White workspace, creating a cinematic rhythm as the user scrolls.

---
*Last Updated: November 2026*
