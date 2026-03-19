# BlockHyre Monorepo

Welcome to the BlockHyre repository. This project is a monorepo containing both the Web and Mobile applications for the BlockHyre platform.

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



## Architecture

This project is built using:
- **Monorepo Manager:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Web App:** [Next.js](https://nextjs.org/) (App Router)
- **Mobile App:** [Expo](https://expo.dev/) (React Native)
- **Backend/DB:** [Supabase](https://supabase.com/)

## Project Structure

```text
.
├── apps/
│   ├── web/          # Next.js Web Application
│   └── mobile/       # Expo React Native Mobile App
├── packages/
│   └── database/     # Shared Database Logic (Supabase Client)
├── package.json      # Root configuration
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm

To install pnpm globally:
```bash
npm install -g pnpm
```

### Installation

1. Clone the repository.
2. Install dependencies (from the root):

```bash
pnpm install
```

### Development

You can run both apps simultaneously using the root development script:

```bash
pnpm dev
```

**Filtering:**
To run only a specific app:

```bash
pnpm dev --filter web
```

```bash
pnpm dev --filter mobile
```

## Useful Commands

| Command | Description |
| - | - |
| `pnpm dev` | Starts dev servers for all apps |
| `pnpm build` | Builds all apps |
| `pnpm lint` | Runs linter across the workspace |

## Mobile Development

To properly run the mobile app, ensure you have the Expo Go app installed on your device or an Android/iOS emulator running.

If you encounter issues with the Metro bundler (invalid hook calls, cache issues), use the clear flag:

```bash
pnpm dev --filter mobile -- --clear
```

## Environment Variables

Each app manages its own environment variables.
- **Web:** `apps/web/.env.local`
- **Mobile:** `apps/mobile/.env`

Please ask the project administrator for the required secret keys.

## Contribution

1. Create a new branch for your feature:
```bash
git checkout -b feature/amazing-feature
```

2. Commit your changes:
```bash
git commit -m 'Add some amazing feature'
```

3. Push to the branch:
```bash
git push origin feature/amazing-feature
```

4. Open a Pull Request



