# BlockHyre - Hyperlocal Tool Sharing

**BlockHyre** is a "High-Fidelity" MVP for a hyperlocal tool-sharing platform designed to turn neighborhoods into distributed factories. It emphasizes Trust, Safety, and Community Production by allowing neighbors to rent high-value tools (like freeze dryers, table saws, and heavy machinery) from each other within a 2-mile radius.

---

## 🚀 Key Features

### For Renters
- **Hyperlocal Inventory:** Find tools within 2 miles of your home (limited to three trial neighborhoods at launch).
- **Trust & Access Filters:**  New sidebar filters to sort by **Protection Tier** (1, 2, 3), **Verified Owners**, and distance from home.
- **Safety First:** Every rental includes a mandatory "Safety Gate" with liability waivers and safety manual checks.
- **Transparent Pricing:** Clear breakdown of Rental Fees, Platform Fees, Peace Fund Fees, and the **Temporary Refundable Security Deposit**.
- **Active Dashboard:** Track your rental status, upload pre-use inspection photos, and manage returns.

### For Owners
- **Asset Protection:** "Risk Toggle" automatically adjusts deposits based on tool type (Standard vs. Heavy Machinery).
- **Owner Dashboard:** Manage listings, approve/deny requests, and track earnings.
- **Return Inspection:** Side-by-Side photo comparison tool for verifying tool condition upon return.
- **Dispute Resolution:** Integrated dispute reporting for damaged items.
- **Real-time Messaging:** Instant, secure communication with renters during the booking process.

### Community
- **The Peace Fund:** A community-led safety net (funded by 10% of fees) that covers minor accidents and repairs.
- **Verification:** All users are ID-verified. **Verification is tiered:** Residency proof for Tiers 1 & 2; Mandatory Government ID for Tier 3.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **UI Components:** Custom components inspired by Shadcn UI.
- **Datepicker:** Custom implementation based on `react-tailwindcss-datepicker`, now fully themed for Light Mode.

---

## 🔄 Recent Updates

- **Inventory Sidebar Redesign:**
  - **Phase 1 (Discovery):** Search & Categories.
  - **Phase 2 (Trust):** Filter by Protection Tier, Verified Owners Only, and Hyperlocal Distance.
  - **Phase 3 (Financial):** Filter by Daily Rate, Barter Only, and Instant Book.
- **Product Page Enhancements:**
  - RESTORED: Interactive **Calendar** for availability checking.
  - Added dynamic "Total Price" and "Peace Fund Fee" calculators based on selected dates.
- **Visual Improvements:**
  - Fixed "Dark Mode" styles in the calendar component to ensure a clean, white aesthetic.
  - Added `Separator` and `Skeleton` UI components.
- **Profile & Payments:**
  - **Profile Dashboard:** New tabbed interface (Identity, Activity, Financials).
  - **Stripe Connect:** Integrated Stripe onboarding flow for secure user payouts.
  - **Verification:** UI supports Residency Verification display.
  - **Identity:** Secure Profile Photo upload with client-side validation (3MB limit, type checking) and Supabase Storage integration.

---

## 📄 Legal & Protection

To ensure trust and transparency, BlockHyre requires users to adhere to core policies backed by the **Peace Fund**.

### The Peace Fund: Worry-Free Renting
Replaces large security deposits and covers accidental damage.

| Tier | Peace Fund Fee (Daily) | Max Coverage | Refundable Deposit (Temp) |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **$1.00** | Up to $100 | **$50.00** |
| **Tier 2** | **$3.00** | Up to $500 | **$100.00** |
| **Tier 3** | **$10.00** | Up to $3,000 | **$250.00** |

*Note: The **refundable deposit** is temporary for the first six months to ensure the Peace Fund reserve is solvent.*

---

## 🔐 Database & Security

### Security State: **SECURE**
Role-Level Security (RLS) is strictly enforced on all core tables to ensure data privacy and integrity.

| Table | Read Access | Write Access |
| :--- | :--- | :--- |
| **Listings** | **Public** | **Owner Only** |
| **Rentals** | **Participants (Owner/Renter)** | **Renters (Create), Participants (Update)** |
| **Users** | **Public (Profiles)** | **Self Only** |
| **Categories** | **Public** | **Admin Only** |

### Database Reset
The database schema uses `UUID` primary keys. To reset the database to a clean state:
```bash
npx supabase db reset --linked
```
*Note: This will verify the schema against `supabase/migrations` and re-seed initial data.*

### Recent Database Actions
- **Reversion:** Revered schema from a 'wrecked' state (Integer vs UUID conflict) back to a clean UUID-based state.
- **Audited:** Full security audit conducted to ensure congruency between Frontend permissions and Backend enforcement.
- **Hardened:** Strict RLS policies applied via `20251209003000_apply_strict_rls.sql`.

---

## 📦 Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/blockshare.git
   cd blockshare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to `http://localhost:3000`.

---

## 🎨 Branding & Design System

### Color Palette

**Primary Colors:**
- **Safety Orange:** `#FF6700` (Used for CTAs, Alerts, and Highlights)
- **Slate 900:** `#0F172A` (Primary Text, Headings)
- **White:** `#FFFFFF` (Backgrounds, Cards)

**Secondary Colors:**
- **Slate 500:** `#64748B` (Secondary Text)
- **Slate 200:** `#E2E8F0` (Borders, Dividers)
- **Emerald 500:** `#10B981` (Verified Status, Success)
- **Red 600:** `#DC2626` (Errors, Urgent Alerts)

### Typography

**Headings (Serif):**
- **Font Family:** `Roboto Slab`
- **Usage:** Used for major page titles and section headers to convey trust and established reliability.

**Body (Sans-Serif):**
- **Font Family:** `Inter`
- **Usage:** Used for all body text, UI elements, and data displays for maximum readability and modern clarity.

### Design Principles
- **Industrial Modern:** Clean lines, high contrast, and functional whitespace.
- **Trust-Centric:** Use of "Safety Orange" serves as a constant reminder of caution and awareness, while ample whitespace suggests organization and clarity.

---

## 💬 Messaging Platform Architecture

### **Backend & Database (Supabase)**
*   **PostgreSQL:** The core relational database storing `chats`, `messages`, and user relationships.
*   **Supabase Realtime:** powered by Phoenix/Elixir channels. We use the **Broadcast** feature for sub-millisecond instant message delivery between online users.
*   **Postgraphile / PostgREST:** Automatically generates the API endpoints we use to fetch chat history (`supabase.from('messages').select(...)`).
*   **PL/pgSQL (RPC Functions):** Custom database functions like `upsert_conversation` that handle complex logic (e.g., finding existing chats or creating new ones with system messages) in a single atomic transaction.
*   **Row Level Security (RLS):** Database policies that enforce security at the lowest level, ensuring users can only access their own conversations.
*   **Database Triggers:** Automated logic that updates the `last_message_at` timestamp on a chat whenever a new message is inserted.

### **Frontend (Next.js)**
*   **Framework:** **Next.js 14+** (App Router) using **TypeScript**.
*   **State Management:**
    *   **React Hooks:** Custom hooks like `useMessages` and `useRealtimeChat` to encapsulate logic.
    *   **nuqs:** A library for managing state in the URL (e.g., `?id=...`), making chat links shareable and ensuring the correct chat opens on refresh.
*   **Styling:**
    *   **Tailwind CSS:** For utility-first styling.
    *   **Shadcn UI:** Reusable component primitives (Buttons, Inputs, Avatars, Badges, ScrollAreas) built on Radix UI.
    *   **Lucide React:** For the icon set.

### **Key Utilities**
*   **`@supabase/supabase-js`:** The client SDK for interacting with the database and realtime channels.
*   **`date-fns`:** For human-readable timestamp formatting (e.g., "5 minutes ago").

### **Architecture: "Optimistic Hybrid"**
We implemented a robust hybrid architecture:
1.  **Instant:** Messages are broadcast immediately via **Realtime** (WebSockets) so the UI updates instantly.
2.  **Persistent:** Messages are simultaneously saved to **PostgreSQL** for permanent history.
3.  **System Injection:** The backend injects "System Messages" (like the tool inquiry details) automatically, treating them as special robust message types.

---

## 📄 License
This project is an MVP prototype and is not currently licensed for commercial distribution.