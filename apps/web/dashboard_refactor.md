BlockHyre: Dashboard Refactor & Optimization Plan

This document outlines the implementation of the "Industrial Boutique" aesthetic into a high-performance dashboard architecture. It merges the rugged utility of a workshop with the precision of a premium production network.

1. Structural Architecture: The Double Spine

To solve the "cluttered toggle" issue, we will implement a persistent sidebar with a Role Switcher at the top.

The Role Switcher (The Context Toggle)

Instead of a simple switch, use a high-contrast mechanical toggle at the top of the sidebar.

Owner Mode (Command Center): Charcoal background, Safety Orange accents.

Renter Mode (My Rentals): Signal White background, Workshop Gray accents.

Navigation Hierarchy

Top Section: Role Switcher (Owner/Renter). Global warning badges (e.g., a pulsating red dot with the `overdueCount`) will attach directly to this toggle so users know when their attention is demanded in the other view.

Middle Section (Dynamic): Content changes based on the active role (Inventory for Owners vs. Active Rentals for Renters).

Bottom Section (Global): Messages, Profile, and Favorites—accessible regardless of role.

2. Visual Identity: "The Neighborhood Factory"

We will apply the Brand Sheet's "Industrial Boutique" textures to the UI components.

UI Textures & Geometry

Boutique Radius: Main content cards use a 2.5rem (40px) radius, while inner elements (buttons, inputs) use hard, $0px$ or $4px$ industrial edges.

Workshop Grit: Apply a $4\%$ opacity SVG noise overlay to the entire dashboard to give it a tactile, physical feel.

Telemetry KPI Cards: Replace standard stats with "Digital Readouts."

Font: Monospace (Courier New).

Status Indicators: Every KPI card includes an Emerald "Operational" dot to signify "The Peace Fund" (Insured status). However, if there are overdue items (e.g., `overdueCount > 0`), this dot is overridden by a pulsating Red/Safety Orange alert badge to instantly command attention.

3. Implementation of the "Four Pillars"

Pillar 1: The Inventory Table (Owner Focus)

Visual Separation: Use "Workshop Gray" borders ($1px$) rather than background colors to define rows.

Industrial Logic: Use the "Bracket Reveal" [ EDIT ] on hover for row actions.

Telemetry Data: Display tool status (Available, Rented, Maintenance) as machine telemetry.

Time-to-Action Countdowns: For pending requests (Owner) or auto-expiring rentals (Renter), elevate the existing real-time mono-font countdown timers. They must look like industrial detonation timers—high-contrast and impossible to ignore.

Pillar 2: KPI & Metric Cards

The "Scanner Sweep": When hovering over an Earnings card, a vertical Safety Orange bar "scans" across the card content.

Magnetic Press: KPI cards should physically depress by $2px$ on click, providing a mechanical tactile response.

Pillar 3: Modals & Overlays

Blocking Context: For "Add New Tool" or "Approve Rental," use a modal that dims the background to Charcoal ($80\%$ opacity).

Conveyor Belt Entrance: Modals should slide in from the right on the X-axis, mimicking a production line movement.

Pillar 4: Tabs & Filters

Sub-Navigation: Within the "My Fleet" section, use tabs to filter by "Active," "Paused," and "Maintenance."

4. Interaction & Performance UX

Optimistic UI for the Factory

To maintain the "Rugged Authority" feel, the interface must never feel sluggish.

Action: When an owner clicks "Approve Request," the UI should instantly move that card to the "Active Rentals Out" section while the API call processes in the background.

Feedback: Use a "Toast" notification styled like a factory error log (Mono font, timestamped) to confirm success.

5. Dashboard Site Tree Mapping

Route

View Component

UX Priority

/dashboard/renter

Renter Overview

Urgency: Elevate the current multi-tier alert system:
- **Overdue**: Red border, red pulsing dot, red badge.
- **Due Today**: Amber border, amber pulse, amber badge.
Both states must use aggressive contrast to force user action.

/dashboard/owner

Owner Command Center

Profit: Highlight "Action Center" & Earnings.

/dashboard/inventory

My Fleet

Utility: Bulk editing and status toggles.

/dashboard/messages

Global Inbox

Context: Link messages directly to tool IDs.


Refactor Strategy: We are proceeding with Option 1: The Sidebar Layout. This provides the "Rugged Authority" of a professional tool and allows for the role-switching context to feel natural and robust.

Based on the BlockHyre Brand Sheet & Dashboard UX Guide v1.0