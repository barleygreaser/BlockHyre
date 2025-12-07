# BlockShare - Hyperlocal Tool Sharing Platform

BlockShare is a "High-Fidelity" MVP for a hyperlocal tool-sharing platform designed to turn neighborhoods into distributed factories. It emphasizes **Trust**, **Safety**, and **Community Production** by allowing neighbors to rent high-value tools (like freeze dryers, table saws, and heavy machinery) from each other within a 2-mile radius.

## 🚀 Key Features

### For Renters
*   **Hyperlocal Inventory**: Find tools within 2 miles of your home.
*   **Safety First**: Every rental includes a mandatory "Safety Gate" with liability waivers and safety manual checks.
*   **Transparent Pricing**: Clear breakdown of Rental Fees, Platform Fees (including the "Peace Fund"), and Refundable Deposits.
*   **Active Dashboard**: Track your rental status, upload pre-use inspection photos, and manage returns.

### For Owners
*   **Asset Protection**: "Risk Toggle" automatically adjusts deposits based on tool type (Standard vs. Heavy Machinery).
*   **Owner Dashboard**: Manage listings, approve/deny requests, and track earnings.
*   **Return Inspection**: Side-by-side photo comparison tool for verifying tool condition upon return.
*   **Dispute Resolution**: Integrated dispute reporting for damaged items.

### Community
*   **The Peace Fund**: A community-led safety net (funded by 10% of fees) that covers minor accidents and repairs, keeping neighbors friendly.
*   **Verification**: All users are ID-verified and limited to a specific neighborhood radius.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **UI Components**: Custom components inspired by Shadcn UI (Button, Card, Badge, Modal).
*   **Datepicker**: Custom implementation based on `react-tailwindcss-datepicker` for Airbnb-style range selection.
*   **Animations**: `canvas-confetti` for success states.

## 🔄 Recent Updates (Real Data Integration)
*   **Live Inventory**: Connected to Supabase PostgreSQL database for fetching real categories and listings.
*   **Dynamic Routing**: Implemented `/listings/[id]/[slug]` for SEO-friendly product pages.
*   **Smart Filtering**: Client-side filtering for multi-category selection and search.
*   **Badges**: Added "Heavy Machinery" (High Powered) and "Accepts Barter" badges driven by DB flags.
*   **Geospatial Search**: Implemented PostGIS-based "Search Nearby" RPC function.

## 📦 Installation & Usage

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/blockshare.git
    cd blockshare
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🗺️ Project Structure

*   `app/page.tsx`: Main landing page with Hero, Value Props, and Featured Inventory.
*   `app/how-it-works/page.tsx`: Explainer page with process timeline and deposit formula.
*   `app/tools/[id]/page.tsx`: Detailed tool view with safety alerts and booking flow.
*   `app/checkout/page.tsx`: Checkout page with mandatory safety gate checkboxes.
*   `app/my-rentals/[id]/page.tsx`: Active rental dashboard for renters.
*   `app/add-tool/page.tsx`: Listing creation form for owners.
*   `app/owner/dashboard/page.tsx`: Owner management dashboard.
*   `app/components/`: Reusable UI components (Navbar, Footer, Cards, Modals).

## 🎨 Design Aesthetic

*   **Style**: Industrial Modern.
*   **Colors**: White backgrounds, Slate-900 text, and **Safety Orange (#FF6700)** accents.
*   **Typography**: `Roboto Slab` for headings, `Inter` for body text.

## 📄 License

This project is an MVP prototype and is not currently licensed for commercial distribution.
