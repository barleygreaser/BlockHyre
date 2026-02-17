# Architecture Overview
This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure
This section provides a high-level overview of the project's directory and file structure, categorized by architectural layer or major functional area. The project is part of a monorepo (`BlockHyre_Monorepo`) managed by Turborepo.

`apps/web/`
├── app/                  # Next.js App Router (16.0.7) - Main application logic
│   ├── (auth)/           # Authentication flows (login, signup)
│   ├── (dashboard)/      # Protected dashboard routes
│   ├── api/              # API Routes (Next.js Server Functions) for Stripe, Webhooks, etc.
│   ├── layout.tsx        # Root layout definition
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles (Tailwind CSS v4)
├── components/           # Reusable UI components
│   ├── ui/               # Radix UI + shadcn-like primitives
│   └── shared/           # Business-logic specific components
├── hooks/                # Custom React hooks (e.g., `use-toast`)
├── lib/                  # Core utilities and client configurations
│   ├── supabase.ts       # Supabase client instantiation
│   ├── stripe.ts         # Stripe client helper
│   ├── location.ts       # Mapbox/Location utilities
│   ├── date-utils.ts     # Date manipulation helpers
│   └── utils.ts          # General helper functions (cn, clsx)
├── public/               # Static assets (images, fonts, icons)
├── supabase/             # Supabase specific configurations/migrations for the web app
├── middleware.ts         # Next.js Middleware for session handling and route protection
├── next.config.ts        # Next.js configuration
├── postcss.config.mjs    # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration (if present, else v4 implicit)
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies and scripts

## 2. High-Level System Diagram
A simplified block diagram of the major components and their interactions.

```mermaid
graph TD
    User[User] -->|HTTPS| WebApp[Next.js Web App (Vercel/Node)]
    WebApp -->|Client SDK & Server API| Supabase[Supabase (Auth, DB, Storage)]
    WebApp -->|Server API| Stripe[Stripe API (Payments)]
    WebApp -->|Client SDK| Mapbox[Mapbox API (Maps)]
    
    subgraph "Backend Services"
        Supabase -->|Auth| Auth[GoTrue / Auth Service]
        Supabase -->|Data| PG[PostgreSQL Database]
        Supabase -->|Files| Storage[Object Storage]
    end
```

## 3. Core Components

### 3.1. Frontend Application
**Name:** BlockHyre Web App
**Description:** The primary user interface for the platform, built with Next.js App Router. It handles user authentication, dashboard management, listing creation, and marketplace browsing.
**Technologies:** 
- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, `tailwindcss-animate`, `lucide-react` (icons)
- **UI Libraries:** Radix UI Primitives (`@radix-ui/*`), Vaul (Drawer), Sonner (Toasts)
- **State Management:** URL State (`nuqs`), React Context, Supabase Realtime

### 3.2. Backend Services
The backend logic is primarily serverless, leveraging Next.js API routes and Supabase's managed backend features.

#### 3.2.1. Next.js API Routes (`app/api`)
**Description:** Handles server-side logic that requires secure environments or third-party webhooks, such as payment processing and complex data aggregation.
**Key Endpoints:**
- `/api/stripe/checkout`: Initiates Stripe Checkout sessions.
- `/api/stripe/webhook`: Handles Stripe webhooks securely.
- `/api/auth/callback`: Handles OAuth callbacks.

#### 3.2.2. Supabase
**Description:** Acts as the primary backend-as-a-service, handling authentication, database interactions, and file storage.
**Key Features:**
- **Auth:** Manages user sessions and Row Level Security (RLS).
- **Database:** PostgreSQL for all application data.
- **Storage:** Buckets for user uploads (avatars, listing images).

## 4. Data Stores

### 4.1. Supabase PostgreSQL
**Name:** Primary Database
**Type:** PostgreSQL (Managed by Supabase)
**Purpose:** Stores all relational data including users, listings, bookings, and transactions.
**Key Tables (Implied):** `users`, `listings`, `bookings`, `profiles`.

### 4.2. Supabase Storage
**Name:** Object Storage
**Type:** S3-compatible Object Storage
**Purpose:** Stores large binary files such as user avatars and listing photos.
**Buckets:** Likely `avatars`, `listings`, or similar.

## 5. External Integrations / APIs

### 5.1. Stripe
**Purpose:** Payment processing, managing subscriptions/one-time payments, and handling payouts.
**Integration Method:** Stripe Node.js SDK (`stripe`), Stripe.js on client.

### 5.2. Mapbox
**Purpose:** providing map tiles, geocoding addresses, and location search functionality.
**Integration Method:** `mapbox-gl` Client SDK.

## 6. Messaging System
The platform features a real-time messaging system for communication between owners and renters.

### 6.1. Consolidated Chat Model
- **Relationship:** 1:1 relationship between any two users (Owner + Renter).
- **Consolidation:** All inquiries or bookings between the same two users are routed to a single, persistent chat thread regardless of the listing.
- **Contextual Awareness:** The `LISTING_INQUIRY` system message is used as a "topic header" in the unified thread whenever a user initiates contact for a specific tool.

### 6.2. Implementation
- **Real-time:** Powered by Supabase Broadcast channels for message delivery and Postgres Changes for notification syncing.
- **RPC Logic:** `upsert_conversation` handles the atomic lookup/creation of user-pair chats.
- **Templating:** Uses `system_message_templates` table with Liquid logic to render role-specific system notifications (confirmations, rejections, etc.).

## 6. Deployment & Infrastructure

**Platform:** Vercel (Recommended for Next.js) or any Node.js compatible host.
**Monorepo Tooling:** Turborepo for build orchestration and caching.
**CI/CD:** GitHub Actions (implied by `.github` folder).
**Monitoring:** Vercel Analytics / Speed Insights (optional), or Supabase Dashboard for DB metrics.

## 7. Security Considerations

**Authentication:** Supabase Auth (JWT-based).
**Authorization:** 
- **Row Level Security (RLS):** Policies defined directly on Postgres tables to restrict data access.
- **Middleware:** `middleware.ts` ensures protected routes redirect unauthenticated users.
**Data Protection:** Environment variables (`.env.local`) manage sensitive API keys (Stripe Secret Key, Supabase Service Role). Public keys (Supabase Anon Key) are safe for client-side use if RLS is configured correctly.

## 8. Development & Testing Environment

**Local Setup:**
1. Clone the repository.
2. Install dependencies: `pnpm install`.
3. Set up environment variables in `.env.local` (Supabase URL/Key, Stripe Keys).
4. Run development server: `pnpm dev`.

**Local Backend:**
- Supabase local development via `supabase start` (requires Docker).

**Code Quality:**
- **Linting:** ESLint (`pnpm lint`).
- **Formatting:** Prettier (implied).

## 9. Future Considerations / Roadmap

- **Enhanced Component Library:** Further abstracting UI components into a shared package within the monorepo (`packages/ui`).
- **Testing Strategy:** Implementing Jest/Vitest for unit testing and Playwright for E2E testing.
- **State Management:** Formalizing the use of Supabase Realtime for a more robust multi-device sync.
- **Mobile Sync:** Ensuring the consolidated messaging model is consistent across the web and upcoming mobile app.

## 10. Project Identification

**Project Name:** BlockHyre Web
**Repository URL:** [Repository URL]
**Primary Contact/Team:** Development Team
**Date of Last Update:** 2026-02-17

## 11. Glossary / Acronyms

**RLS:** Row Level Security (PostgreSQL security feature).
**SSR:** Server-Side Rendering.
**ISR:** Incremental Static Regeneration.
**DTO:** Data Transfer Object.
