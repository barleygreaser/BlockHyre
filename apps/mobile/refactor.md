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