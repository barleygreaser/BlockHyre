# User Testing Checklist (Recent Implementations)

Use this checklist to verify the functionality of all recently implemented features in the BlockHyre MVP.

---

### 1. Owner Earnings Transparency
**Goal:** Verify that the owner sees exactly what they earned versus what the platform took.
- [ ] **Dashboard KPI:** Log in as an Owner. Does the "Net Earnings (30d)" card show in emerald green?
- [ ] **Tooltip:** Hover over the Net Earnings. Does it show the Gross Revenue, Platform Fee, and Net to You breakdown?
- [ ] **Transactions Page:** Navigate to `/dashboard/owner/transactions`. 
    - [ ] Does the "Total Earned" at the top say "Net Earned"?
    - [ ] Does the summary sub-label show the total fees deducted?
    - [ ] In the table, are there separate columns for **Gross**, **Fee** (red), and **Net** (green)?
- [ ] **Math Check:** Pick one transaction. Is the Fee exactly 15% (or your current `seller_fee_percent`) of the Gross? Is Net + Fee = Gross?

### 2. Transactional Email Engine (Resend)
**Goal:** Confirm the system communicates effectively with both parties.
- [ ] **Template Review:** Run `bun run scripts/test-emails.ts` from `apps/web`.
    - [ ] Check your `robinsonc24@gmail.com` inbox.
    - [ ] Are the logos and buttons rendering correctly?
    - [ ] Is the "Bebas Neue" font being simulated/used properly for that high-end look?
- [ ] **Live Integration (Webhook):** Complete a real test checkout using Stripe Test Mode.
    - [ ] Does the Owner receive the "New Rental Request" email?
    - [ ] Does the Renter receive the "Booking Approved" email?
    - [ ] *Note: This requires your Local Dev server to be connected to Stripe via `stripe listen --forward-to localhost:3000/api/stripe/webhook`.*

### 3. CSRF Security Layer
**Goal:** Ensure the app blocks malicious cross-origin requests.
- [ ] **Authenticated API Call:** Open the app and perform a mutation (e.g., cancel a rental or add a tool). Verify it still works normally (internal same-origin requests should pass).
- [ ] **Security Test (Simulated Attack):** 
    - Open your browser console on a **different** website (e.g., google.com).
    - Try to `fetch` your local API: `fetch('http://localhost:3000/api/rentals/cancel', { method: 'POST' })`.
    - Verify that your console logs a **403 Forbidden** error with the message: `"Forbidden: CSRF token invalid or missing."`

### 4. VPS Deployment Strategy
**Goal:** Verify the documentation matches your personal infrastructure.
- [ ] **Audit Review:** Open `docs/mvp_readiness_audit.md`.
    - [ ] Does the "VPS Deployment Strategy" (Section 7) accurately reflect the Docker stack you intend to use?
    - [ ] Are the specs (2 vCPU / 4GB RAM) sufficient for your monorepo build?

---

### Implementation Date: 2026-03-28
### Implementation Scope:
- `app/api/stripe/webhook/route.ts` (Email triggers)
- `middleware.ts` & `lib/middleware.ts` (CSRF)
- `owner-view.tsx` & `transactions/page.tsx` (Earnings transparency)
- `emails/` (React Email templates)
- `lib/email.ts` (Resend engine)
