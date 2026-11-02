# Gemini Context: BlockHyre Monorepo

Welcome to the **BlockHyre** monorepo. This project is a high-fidelity MVP for a hyperlocal tool-sharing platform designed to enable neighbors to rent high-value tools within a 2-mile radius.

## 🏗 Project Architecture

This is a monorepo managed by **Turborepo** and **pnpm**.

- **Web App (`apps/web`):** Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI.
- **Mobile App (`apps/mobile`):** Expo 54 (React Native), React 19, Expo Router.
- **Shared Package (`packages/database`):** Placeholder for shared database logic.
- **Backend/DB:** Supabase (Auth, PostgreSQL, Storage, Edge Functions).
- **External Services:** Stripe (Payments), Mapbox (Maps), Resend (Emails).

## 🚀 Key Commands

Execute these from the project root:

| Command | Description |
| :--- | :--- |
| `pnpm install` | Install all dependencies for the workspace. |
| `pnpm dev` | Start development servers for all apps. |
| `pnpm dev --filter web` | Start only the Next.js web application. |
| `pnpm dev --filter mobile` | Start only the Expo mobile application. |
| `pnpm build` | Build all applications in the workspace. |
| `pnpm lint` | Run ESLint across the entire monorepo. |
| `pnpm format` | Format all supported files using Prettier. |

### App-Specific Commands

- **Web (`apps/web`):** `pnpm test` or `pnpm test:run` (Vitest).
- **Mobile (`apps/mobile`):** `pnpm android` or `pnpm ios` for native builds.

## 🛠 Development Conventions

### General
- **Monorepo:** Use `pnpm` and `turbo` for all workspace operations.
- **Environment Variables:** Managed in `apps/web/.env.local` and `apps/mobile/.env`.
- **Branching:** Use `feature/`, `fix/`, or `refactor/` prefixes for branch names.
- **Commits:** Follow atomic, imperative commit messages (e.g., "Feat: Add mobile filter drawer").

### Web Development (`apps/web`)
- **Styling:** Uses **Tailwind CSS 4**. Follow established patterns for components.
- **Components:** Uses **Radix UI** primitives and **shadcn/ui** patterns.
- **Navigation:** Next.js **App Router**.
- **State:** Use `nuqs` for URL-driven state when appropriate.
- **Icons:** Use `lucide-react`.

### Mobile Development (`apps/mobile`)
- **Navigation:** **Expo Router** (file-based navigation).
- **UI:** Uses **Lucide React Native**, `@gorhom/bottom-sheet`, and `react-native-reanimated`.
- **Assets:** Managed through Expo constants and assets folder.

### Backend & Database (Supabase)
- **RLS:** Row Level Security is strictly enforced. Always verify RLS policies when adding new tables or features.
- **Real-time:** Messaging system uses Supabase Broadcast and Postgres Changes.
- **RPC:** Complex logic (like `upsert_conversation`) is handled via Postgres functions.
- **Storage:** Use `avatars` and `listing-images` buckets for user uploads.

## 📁 Key Directories & Files

- `apps/web/app/`: Core Next.js application routes and components.
- `apps/mobile/app/`: Expo Router application structure.
- `docs/ARCHITECTURE.md`: Detailed architectural overview of the web app.
- `supabase/migrations/`: Database schema and RLS policy definitions.

## ⚠️ Security & Trust
- **Tiered Verification:** User residency proof for Tiers 1 & 2; mandatory Government ID for Tier 3.
- **Peace Fund:** 10% of fees fund community-led safety net.
- **Safety Gate:** Mandatory liability waivers and safety manual checks for rentals.
