# Dashboard Build Status & Todo

*Last Updated: 2026-03-06T18:24:00*

---

## 🏭 Design Standard: Industrial Boutique

> **All dashboard pages and components must conform to the [BRAND_SHEET.md](file:///c:/Users/Christopher%20Robinson/Documents/VPS/BlockHyre_Monorepo/BRAND_SHEET.md) — "The Industrial Boutique" design language. Any new page or component that deviates from this standard is considered incomplete.**

### Required Design Elements Checklist
Every new dashboard page/component must implement the following before it is considered "done":

#### Color Palette
- [ ] **Safety Orange** `#FF6B00` — used for all primary CTAs, urgency indicators, and brand accents
- [ ] **Charcoal** `#1A1A1A` — used for high-contrast card surfaces (e.g. extension request cards, dark section breaks)
- [ ] **Concrete** `#E8E4DD` — used for secondary backgrounds and section transitions
- [ ] **Signal White** `#FAFAF8` — primary page/card backgrounds
- [ ] No generic colors (plain red, blue, green) — all status colors from the approved palette only

#### Typography
- [ ] **Roboto Slab** (serif) — section headers and dashboard titles (`font-serif`)
- [ ] **Inter** (sans) — all body copy, labels, descriptions (`font-sans`)
- [ ] **Monospace** — all metadata, KPI numbers, dates, status codes (`font-mono`)
- [ ] **Display labels**: `uppercase tracking-wider` or `tracking-widest` for micro-labels and serial-number-style metadata
- [ ] **Headlines**: `tracking-tight` for dense, authoritative feel

#### Components & Textures
- [ ] **Boutique Radius**: `rounded-[2rem]` (40px) for all main cards — never `rounded-lg` or `rounded-xl` on primary cards
- [ ] **Workshop Grit**: The SVG grain overlay (`opacity-[0.04]`) is applied globally in `dashboard/layout.tsx` — do not override or remove it on new pages
- [ ] **Telemetry Cards**: KPI stat blocks must use monospace numbers, a colored status dot (emerald for healthy, red for alert), and glowing border on alert state
- [ ] **Scanner Sweep**: Interactive/clickable cards should include the vertical orange scanner bar (`animate-scanner`) on hover

#### Interaction Language
- [ ] **Magnetic Press**: Buttons use `active:translate-y-[2px]` on click (physical depress)
- [ ] **Hover lift**: Cards use `hover:shadow-xl hover:border-safety-orange/30` for hover state — feels like the card lifts off the surface
- [ ] **Operational dots**: Emerald `animate-pulse-operational` dots on active/healthy states; pinging red dots on alert/overdue states
- [ ] **Conveyor Belt entrances**: Staggered entrance animations (`animate-in`, delay per item) for list items — not all items pop in simultaneously

---

## ✅ Owner Dashboard — Completed

| Page | Route | Notes |
|---|---|---|
| Owner Dashboard (Main) | `/dashboard?role=owner` | `owner-view.tsx` — KPIs, requests, extensions |
| Tool Bookings | `/dashboard/owner/bookings` | Full page with All / Upcoming / Active / Overdue / Completed filters |
| My Fleet / Inventory | `/dashboard/inventory` | Tool listing management |
| Transactions & Payouts | `/dashboard/owner/transactions` | Real Stripe balance, payout history, rental transaction table, Stripe Dashboard link |

## ✅ Renter Dashboard — Completed

| Page | Route | Notes |
|---|---|---|
| Renter Dashboard (Main) | `/dashboard?role=renter` | `renter-view.tsx` — Active rentals, upcoming, pending, history widget |
| My Rentals | `/dashboard/renter/rentals` | Full page with All / Active / Upcoming / Completed / Cancelled filters |

---

## ❌ Owner Dashboard — Todo

### ~~1. Transactions / Payouts Page~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - API route `/api/stripe/transactions` fetches real Stripe balance, payouts, and Express Dashboard login link
  - Full page at `/dashboard/owner/transactions` with balance KPIs, filterable payout list, rental transaction table
  - Industrial Boutique design language applied throughout
  - Sidebar nav link added

### ~~2. Wire Up Real Payout Data~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - `owner-view.tsx` Recent Payouts widget now fetches real data from the Stripe API via `/api/stripe/transactions`
  - `stripeConnected` state now checks actual `stripe_account_id` from user profile
  - Loading skeleton shown while data is being fetched
  - Falls back to "No payouts yet" when no payout history exists

### ~~3. Earnings KPI Tile — Add Link~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - Earnings (30d) KPI tile is now a `<Link>` to `/dashboard/owner/transactions`
  - Includes scanner hover animation and active press like the other KPI tiles

### ~~4. Reconcile `/owner/listings` vs `/dashboard/inventory`~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - Empty state "Manage Listings" button now points to `/dashboard/inventory` for consistency

---

## ✅ Renter Dashboard — Completed

| Page | Route | Notes |
|---|---|---|
| Renter Dashboard (Main) | `/dashboard?role=renter` | `renter-view.tsx` — Active rentals, pending requests, upcoming bookings, history |

---

## ❌ Renter Dashboard — Todo

### ~~5. Verify Leave a Review Flow~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - `apps/web/app/reviews/new/page.tsx` was fully refactored to the Industrial Boutique design system.
  - Redirects point gracefully back to the new `/dashboard/renter/rentals` endpoint instead of relying on legacy `/my-rentals`.
  - The review is saved, updates correctly, and appropriately registers on the DB.

### ~~6. Renter Sub-Pages~~ ✅ DONE
- **Status:** Completed (2026-03-06)
- **What was built:**
  - Full "My Rentals" page at `/dashboard/renter/rentals` with All / Active / Upcoming / Completed / Cancelled filter tabs
  - Card-based layout with tool images, owner info, dates, pricing, and contextual actions (message, leave review, rent again)
  - Overdue/due-today urgency styling matching the renter dashboard
  - Review status tracking — "Leave Review" CTA for unreviewed completed rentals
  - Sidebar nav link "My Rentals" added to renter section
  - "View all rentals →" link added to the Rental History widget in renter-view.tsx

---

## ⚠️ Global / Sidebar — Gaps

| Item | Status | Notes |
|---|---|---|
| Messages `/messages` | ✅ Built | |
| Favorites `/favorites` | ✅ Built | |
| Profile `/profile` | ✅ Built | |
| Disputes widget (Owner) | ⚠️ Stubbed | `owner-view.tsx` renders a disputes section but it always shows "No active disputes" — no real data source wired up |
| Disputes widget (Renter) | ⚠️ Stubbed | Same — hardcoded empty state in `renter-view.tsx` |

---

## Priority Order

1. ~~🔴 **Transactions page + real payout data**~~ ✅ DONE
2. ~~🔴 **Verify Leave a Review end-to-end**~~ ✅ DONE
3. ~~🟡 **Earnings KPI tile link**~~ ✅ DONE
4. ~~🟡 **Reconcile `/owner/listings` vs `/dashboard/inventory`**~~ ✅ DONE
5. 🟢 **Disputes data** — wire up real dispute records
6. ~~🟢 **Renter sub-pages**~~ ✅ DONE
