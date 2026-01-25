## 2025-10-26 - [Unprotected Debug Endpoint in Production]
**Vulnerability:** Found `apps/web/app/api/inspect-system-messages/route.ts` which exposes internal database table content without authentication.
**Learning:** Debug endpoints created during development often get left behind and deployed if not flagged or excluded. They provide easy information gathering vectors for attackers.
**Prevention:**
1. Use distinct file naming conventions for debug scripts (e.g., `_debug.ts`) and exclude them from build/deploy.
2. Ensure all API routes have explicit authentication checks, even if they seem harmless.
3. Regularly audit `app/api` folder for unrecognized endpoints.

## 2025-10-27 - [Information Leakage in Search API]
**Vulnerability:** The search suggestions API (`fetch-suggestions`) was returning raw database error messages to the client and accepting unbounded query strings.
**Learning:** Even "public" read-only APIs need input validation (length limits) to prevent DoS and careful error handling to avoid leaking schema details or stack traces via `error.message`.
**Prevention:**
1. Always enforce maximum length limits on string inputs.
2. Catch backend errors and return generic "Something went wrong" messages to clients while logging details server-side.

## 2025-10-28 - [Information Leakage in Payment APIs]
**Vulnerability:** The Stripe Checkout and Connect APIs were returning raw exception messages to the client. This could expose internal configuration details (e.g., "Owner has not connected their Stripe account") or database errors.
**Learning:** When using third-party integrations (Stripe, Supabase), exceptions often contain sensitive context. Simply catching and returning `error.message` is a common but dangerous pattern.
**Prevention:**
1. Implement a pattern of "Log specific, return generic".
2. Use specific error handling for expected logic failures (e.g., "Cart empty") but default to "Internal Error" for anything else.

## 2025-10-29 - [Weak Password Policy & Auth Error Leakage]
**Vulnerability:** The signup endpoint (`apps/web/app/api/signup/route.ts`) only checked password length and returned raw Supabase Auth error messages to the client.
**Learning:** Returning raw auth errors (e.g., from third-party providers like Supabase) can leak implementation details or sensitive user states (like "User already registered"). Also, basic length checks are insufficient for password security.
**Prevention:**
1. Enforce password complexity (uppercase, lowercase, number, special char).
2. Catch and sanitize auth errors, mapping only safe, known errors (like duplicates) to user-friendly messages and hiding the rest.

## 2025-10-30 - [Open Redirect in Stripe Connect]
**Vulnerability:** The Stripe Connect API (`apps/web/app/api/stripe/connect/route.ts`) used the unvalidated `Origin` header to construct redirect URLs.
**Learning:** Relying on `req.headers.get('origin')` for redirects is a classic Open Redirect vulnerability. Attackers can spoof this header to phish users after a trusted workflow (like Stripe onboarding).
**Prevention:**
1. Never trust the `Origin` or `Referer` headers for critical redirects.
2. Use a trusted environment variable (`NEXT_PUBLIC_APP_URL`) or a strict allowlist.
3. Implement fail-secure defaults (e.g., hardcoded production URL) if configuration is missing.

## 2025-10-31 - [Missing Rate Limiting on Signup]
**Vulnerability:** The signup endpoint (`apps/web/app/api/signup/route.ts`) allowed unlimited account creation requests, vulnerable to brute-force and spam attacks.
**Learning:** Next.js Serverless functions are stateless, making traditional rate limiting harder. But neglecting it entirely is dangerous. Simple in-memory counters per container provide "good enough" defense against single-source flooding.
**Prevention:**
1. Implement a lightweight in-memory rate limiter for serverless routes if a global store (Redis) is unavailable.
2. Always apply rate limits to unauthenticated "write" endpoints.

## 2025-11-01 - [Missing Middleware Protection]
**Vulnerability:** The root `middleware.ts` was missing, leaving sensitive routes like `/dashboard`, `/owner`, and `/profile` potentially unprotected server-side, relying only on client-side checks or obscure protections.
**Learning:** `apps/web/lib/middleware.ts` contained logic but was unused because the entry point (`apps/web/middleware.ts`) was absent. Code that exists but isn't wired up provides a false sense of security.
**Prevention:**
1. Always verify that security middleware is active and correctly configured in the framework's entry point.
2. Use integration tests or manual verification to ensure protected routes actually redirect unauthenticated users.

## 2025-11-01 - [Insecure Session Verification Method]
**Vulnerability:** The unused middleware logic relied on `supabase.auth.getClaims()`, which only decodes the JWT without validating it against the auth server.
**Learning:** `getClaims()` (or simply decoding a JWT) is fast but doesn't check for revocation or recent security changes (like password resets). `getUser()` ensures the session is valid and active.
**Prevention:**
1. Always use `supabase.auth.getUser()` for server-side route protection to ensure the token is valid and not revoked.

## 2025-11-03 - [Client-Side Trust in Pricing Logic]
**Vulnerability:** The Stripe Checkout API (`apps/web/app/api/stripe/checkout/route.ts`) accepted the security `deposit` amount directly from the client's cart payload instead of fetching it from the database.
**Learning:** In e-commerce flows, it's easy to accidentally trust the "cart" object passed from the client, especially when it mimics the database structure. Never trust price or fee data sent by the frontend.
**Prevention:**
1. Always re-fetch pricing, deposits, and fees from the database (Source of Truth) during the checkout initialization.
2. Use the client payload ONLY for IDs and quantities, never for monetary values.
