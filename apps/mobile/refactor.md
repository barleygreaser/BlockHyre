BlockHyre Cinematic Refactor Protocol: "The Neighborhood Factory"

Role

Act as a World-Class Senior Creative Technologist. Your mission is to refactor BlockHyre from a standard tool-rental marketplace into a high-fidelity, industrial-grade "digital instrument." The site should feel like a high-end workshop—rugged, precise, and authoritative.

Context: The BlockHyre Mission

BlockHyre allows users to "Turn their neighborhood into a factory." It facilitates the rental of heavy machinery (Excavators, Skid Steers) and high-end tools (Chainsaws, Drills) within a 2-mile radius. It’s about production, local power, and industrial-grade trust.

Refactor Flow — MUST FOLLOW

Ask these 3 questions in a single call to calibrate the build:

"What is the primary aesthetic tone?" — Select from:

Preset C (Brutalist Signal): Concrete, steel, and signal red. Raw, industrial, and heavy.

Preset E (Industrial Boutique): High-end workshop. Charcoal, safety orange, and "Garage" luxury.

"Pick 3 Featured Tool Categories" — (e.g., Heavy Machinery, Woodworking, Power Tools).

"What is the core Trust Factor to emphasize?" — (e.g., "The Peace Fund" insurance, "Verified Neighbors", or "Production-Ready Guarantee").

Technical Constraints

Stack: Next.js 14/15 (App Router), Tailwind CSS, GSAP 3 (ScrollTrigger), Lucide React.

Architecture: apps/web/ in the Turborepo.

Components: Must include the "Floating Pill" Navbar (User's favorite).

Component Architecture (The "Industrial" Suite)

1. THE ARCHIVE NAVBAR (Pill Edition)

Logic: A floating pill-shaped island.

Interaction: Transparent on hero; morphs into a blurred bg-white/10 pill with a thin orange border on scroll.

Identity: Right-side "Operational" indicator with a pulsing orange dot.

2. HERO: "THE OPENING SHOT"

Visuals: Full-bleed cinematic background of a chainsaw cutting through wood or an excavator in motion (Source: Unsplash "Industrial/Construction").

Typography: - Part 1: "Turn your neighborhood into a" (Bold Sans).

Part 2: "FACTORY." (Massive, heavy, slightly slanted industrial font).

Primary CTA: "Find Tools Near You" (Magnetic button in Safety Orange).

3. FEATURES: "INDUSTRIAL ARTIFACTS"

Replace generic cards with these interactive functional UIs:

Card 1 (The Availability Heatmap): A 7-day grid showing tool availability. When hovered, a "Scanner" line sweeps across, highlighting open slots in orange.

Card 2 (Listing Shuffler): A vertical stack of tool listing cards (Excavator, Saw, Drill) that cycle with a mechanical "click" sound/animation.

Card 3 (Peace Fund Telemetry): A monospace live-feed showing "Verified Insured" status and "Coverage Active" logs for the neighborhood.

4. THE MANIFESTO (Philosophy)

Background: Deep charcoal with a subtle grain/noise overlay.

Statement:

"Most people focus on: Ownership." (Grayed out, small).

"We focus on: PRODUCTION." (Massive, Safety Orange, high-contrast).

5. THE PROTOCOL (Sticky Stacking)

Step 1: Discover. (Animation: A scanning radar icon over a map).

Step 2: Secure. (Animation: A mechanical lock icon engaging).

Step 3: Build. (Animation: A rotating gear or oscillating waveform).

Visual Texture & Motion

Palette: Safety Orange (#FF6B00), Charcoal (#1A1A1A), Concrete (#E8E4DD), Signal White.

Global Grain: SVG <feTurbulence> filter at 0.05 opacity (feels like workshop grit).

Corners: rounded-[2.5rem] for all containers (the "Boutique" touch).

GSAP: All listings should "slide in" from the side as if on a conveyor belt.

Build Sequence

Map the "Neighborhood Factory" palette to tailwind.config.js.

Implement the "Pill Header" with high-speed scroll logic.

Build the Listing Cards to look like "Industrial Spec Sheets" (Bold typography, clear specs).

Ensure the Hero uses a high-impact industrial background with a heavy bottom-fade.

Directive: Do not build a website; build a production-ready tool.

---

## Refactor Changelog

### Phase 1: Homepage — Light Industrial Boutique Theme (Feb 24, 2026)

**Branch:** `refactor/web-cinematic-redesign`

**Aesthetic chosen:** Preset E (Industrial Boutique) — Light variant  
**Featured Categories:** Heavy Machinery, Woodworking, Power Tools  
**Core Trust Factor:** The Peace Fund  

#### Files Modified

| File | Changes |
|---|---|
| `apps/web/app/page.tsx` | Main background: `bg-charcoal` → `bg-signal-white` |
| `apps/web/app/components/hero.tsx` | Restored original Supabase hero images (landscape + portrait). Bottom gradient fades to `signal-white`. Left-to-right dark overlay kept for text readability. |
| `apps/web/app/components/industrial-artifacts.tsx` | Converted to light theme — white cards, slate borders, orange accent hovers. Scanner sweep, card shuffler, and telemetry animations preserved. |
| `apps/web/app/components/featured-inventory.tsx` | Light `concrete/30` background, white search input, slate text. Category filter pills: white with slate borders, Safety Orange active state. |
| `apps/web/app/components/protocol.tsx` | White cards with colored borders (orange/emerald/sky). Ghost step numbers in low-opacity color. Gear animation preserved. |
| `apps/web/app/components/featured-tool-card.tsx` | White spec-sheet cards, slate typography, monospace specs grid, light hover shadows. |
| `apps/web/app/components/category-filter.tsx` | White pills with slate borders. Safety Orange active state with shadow glow. |
| `apps/web/app/components/navbar.tsx` | Fixed: navbar forced to "scrolled" pill state on non-homepage routes. Added spacer div to prevent content overlap. |

**Manifesto & Footer kept dark** — intentional contrast breaks for visual rhythm.

---

### Phase 2: Dashboard — Industrial Boutique Refactor (Feb 24, 2026)

#### Dashboard Shell (`apps/web/app/dashboard/page.tsx`)

- Background: `bg-slate-50` → `bg-signal-white`
- Header: Industrial header with accent line + monospace "COMMAND CENTER" label + serif title
- Tabs: Replaced shadcn `TabsList` with custom boutique pill tabs — `rounded-full`, Safety Orange active state with glow shadow
- Removed shadcn/ui `Tabs` dependency from this page

#### Owner View (`apps/web/app/components/dashboard/owner-view.tsx`)

- **KPI Cards:** `rounded-[2rem]` boutique radius, monospace labels (`TOOL BOOKINGS`, `EARNINGS 30D`, `TOOLS LISTED`), `font-mono tabular-nums` numbers, hover → orange border glow + shadow-xl
- **Rental Request Cards:** Spec-sheet style, `rounded-[2rem]`, monospace specs grid, `rounded-full` approve/deny buttons with uppercase tracking
- **Extension Requests:** Dark charcoal contrast cards (like Manifesto) — monospace data grid, Safety Orange accents, high visual urgency
- **Action Items:** White cards with amber-300 border, rounded-full Safety Orange CTA
- **Section Headers:** Accent line + serif title (consistent with homepage)
- **Pro Tip:** Subtle Safety Orange tint (`bg-safety-orange/5`) instead of blue
- **All Buttons:** `rounded-full` with `uppercase tracking-wider`
- **Tooltips:** Charcoal bg with monospace revenue breakdown

#### Renter View (`apps/web/app/components/dashboard/renter-view.tsx`)

- **Active Rental Cards:** `rounded-[2rem]` with pulsing status dots (red=overdue, amber=due-today, emerald=active)
- **Pending/Upcoming:** `rounded-2xl` thumbnails, monospace metadata (`text-[10px] font-mono uppercase tracking-wider`)
- **Disputes:** Emerald operational dot (matches navbar's "Operational" indicator)
- **Empty States:** Monospace `font-mono` styled
- **All Buttons:** `rounded-full` with `uppercase tracking-wider`

**Zero business logic changed** across all dashboard files.

---

### Phase 3: GSAP Animation Fix — Client-Side Navigation (Feb 24, 2026)

**Bug:** When navigating back to the homepage via the BlockHyre logo (client-side navigation), hero text ("Turn your neighborhood into a FACTORY.") appeared half-loaded and other sections didn't animate.

**Root Cause:** `gsap.from()` tweens had already played once on initial page visit. On re-mount via Next.js client-side navigation:
1. No cleanup — old ScrollTrigger instances and tweens persisted
2. `from()` recorded the "natural" state (already animated) as the end state
3. Elements were stuck in intermediate opacity/transform states

**Fix applied to ALL 5 GSAP-using components:**

| File | Fix |
|---|---|
| `hero.tsx` | `gsap.context()` scoped to ref, `set()` → `to()` pattern, `requestAnimationFrame` delay, cleanup on unmount, fallback visibility on error |
| `industrial-artifacts.tsx` | `gsap.context()` + `set()` → `to()` + cleanup |
| `manifesto.tsx` | `gsap.context()` + `set()` → `to()` + cleanup |
| `protocol.tsx` | `gsap.context()` + `set()` → `to()` + cleanup |
| `featured-inventory.tsx` | `gsap.context()` + `set()` → `to()` + cleanup |

**Pattern used:** Instead of `gsap.from(el, { opacity: 0 })` (records current state as end), we now:
1. `gsap.set(el, { opacity: 0, y: 60 })` — explicitly hide
2. `gsap.to(el, { opacity: 1, y: 0 })` — animate to visible
3. Wrap in `gsap.context(fn, scopeRef)` — auto-cleanup
4. Return `ctx.revert()` from `useEffect` — kill everything on unmount