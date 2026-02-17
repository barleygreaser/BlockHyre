<<<<<<< HEAD
# Architecture Overview for BlockHyre Web App

This document serves as a critical, living template designed to equip agents with a rapid and comprehensive understanding of the `apps/web` codebase's architecture, enabling efficient navigation and effective contribution from day one. Update this document as the codebase evolves.

## 1. Project Structure

This section provides a high-level overview of the `apps/web` directory structure.

```
apps/web/
├── .github/              # GitHub workflows/actions
├── .next/                # Next.js build output (gitignored)
├── app/                  # Next.js App Router (pages & layouts)
│   ├── (auth)/           # Authentication routes (group)
│   ├── api/              # API Routes (backend-for-frontend)
│   ├── components/       # App-specific components
│   ├── dashboard/        # Dashboard feature routes
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and shared logic
│   ├── listings/         # Listing feature routes
│   ├── supabase/         # Supabase client instances
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # Reusable UI components (shadcn/ui, base components)
│   └── ui/               # Primitive UI components
├── docs/                 # Documentation files
├── hooks/                # Global custom hooks
├── lib/                  # Shared libraries and utilities
│   ├── supabase/         # Supabase client customization
│   └── utils.ts          # Helper functions
├── public/               # Static assets (images, fonts, icons)
├── scripts/              # Utility scripts (db checks, etc.)
├── supabase/             # Supabase configuration
│   ├── functions/        # Supabase Edge Functions
│   └── migrations/       # Database migrations
├── types/                # TypeScript type definitions
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 2. High-Level System Diagram

A simplified view of the system components and data flow:

```mermaid
graph TD
    User[User] -->|HTTPS| WebApp[Next.js Web App]
    WebApp -->|Client SDK| Supabase[Supabase Platform]
    WebApp -->|API Routes| Supabase
    
    subgraph "Supabase Platform"
        Auth[Authentication]
        DB[(PostgreSQL Database)]
        Storage[Object Storage]
        Edge[Edge Functions]
    end
    
    WebApp -->|API| Stripe[Stripe Payments]
    WebApp -->|API| Mapbox[Mapbox Services]
    
    Supabase -->|Webhooks| WebApp
=======
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
>>>>>>> fix/listings-loading-and-location
```

## 3. Core Components

### 3.1. Frontend Application
<<<<<<< HEAD
**Name:** BlockHyre Web  
**Description:** The main user interface for the BlockHyre platform. It handles user authentication, listing discovery, booking management, and dashboard functionalities. Built with a component-driven architecture using React Server Components where applicable.  
**Technologies:**
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI (Headless), Lucide React (Icons)
- **State Management:** URL state (`nuqs`), React Context, Local State
- **Maps:** Mapbox GL
- **Payments:** Stripe

**Deployment:** Vercel (assumed standard Next.js deployment) or Docker container.

### 3.2. Backend Services (Serverless)
**Name:** Supabase Backend  
**Description:** Provides backend-as-a-service functionality including authentication, database, and storage.  
**Technologies:**
- **Database:** PostgreSQL
- **Auth:** GoTrue (Supabase Auth)
- **Storage:** Supabase Storage (S3-compatible)
- **Edge Functions:** Deno-based serverless functions for complex logic.

**Deployment:** Supabase Cloud.

## 4. Data Stores

### 4.1. Primary Database
**Name:** BlockHyre Database (Supabase)  
**Type:** PostgreSQL  
**Purpose:** Stores all persistent application data.  
**Key Tables:**
- `users` (profiles)
- `listings` (rental items)
- `bookings` (rental transactions)
- `messages` (user communication)
- `reviews` (feedback)

### 4.2. Object Storage
**Name:** Supabase Storage  
**Type:** Object Store (S3-compatible)  
**Purpose:** Stores user-uploaded content.  
**Key Buckets:**
- `avatars` (user profile pictures)
- `listing-images` (photos of rental items)
- `documents` (verification docs, if applicable)
=======
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
>>>>>>> fix/listings-loading-and-location

## 5. External Integrations / APIs

### 5.1. Stripe
<<<<<<< HEAD
**Purpose:** Payment processing for rentals and deposits.  
**Integration Method:** Stripe Node.js SDK (API Routes) & Stripe.js (Client).

### 5.2. Mapbox
**Purpose:** Location services, geocoding, and map rendering for listings.  
**Integration Method:** Mapbox GL JS, Mapbox Geocoding API.

### 5.3. Supabase Auth
**Purpose:** User authentication and identity management.  
**Integration Method:** `@supabase/ssr` (Next.js middleware & server/client components).

## 6. Deployment & Infrastructure

**Cloud Provider:** Vercel (Web App), Supabase (Backend/DB)  
**CI/CD Pipeline:** GitHub Actions (implied by `.github` folder directory).  
**Monitoring & Logging:**
- Next.js Analytics / Vercel Analytics (potential).
- Supabase Logs (Database & Auth logs).

## 7. Security Considerations

**Authentication:** 
- Powered by Supabase Auth (Email/Password, OAuth providers like Google, GitHub).
- Protected routes via Next.js middleware using `@supabase/ssr`.

**Authorization:**
- Row Level Security (RLS) policies in PostgreSQL to restrict data access at the database level.
- Server-side checks in API routes and Server Actions.

**Data Protection:**
- Environment variables (`.env.local`) for sensitive keys (e.g., `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- HTTP Security Headers configured in `next.config.ts` (CSP, HSTS, X-Frame-Options).
=======
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
>>>>>>> fix/listings-loading-and-location

## 8. Development & Testing Environment

**Local Setup:**
1. Clone the repository.
<<<<<<< HEAD
2. Install dependencies: `npm install` (or `pnpm`/`yarn`/`bun`).
3. Set up environment variables in `.env.local`.
4. Run development server: `npm run dev`.

**Linting & Formatting:**
- ESLint (configured in `eslint.config.mjs`).
- Prettier (implied usage).

**Testing:**
- Currently minimal/manual testing. (Future: Jest/Vitest for unit tests, Playwright for E2E).

## 9. Future Considerations / Roadmap

- **Testing Strategy:** Implement comprehensive unit and E2E testing suites.
- **Real-time Features:** Enhance messaging and notifications using Supabase Realtime.
- **Performance Optimization:** Further optimize image loading (Next.js Image) and route prefetching.
- **Accessibility:** Ensure full WCAG compliance (Radix UI provides a good baseline).

## 10. Project Identification

**Project Name:** BlockHyre Web  
**Repository Path:** `apps/web`  
**Primary Tech:** Next.js, Supabase, Tailwind CSS  
**Date of Last Update:** 2026-02-17
=======
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
>>>>>>> fix/listings-loading-and-location
