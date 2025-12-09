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

## 🎨 Design Aesthetic
- **Style:** Industrial Modern.
- **Colors:** White backgrounds, Slate-900 text, and **Safety Orange (#FF6700)** accents.
- **Typography:** *Roboto Slab* for headings, *Inter* for body text.

---

## 📄 License
This project is an MVP prototype and is not currently licensed for commercial distribution.