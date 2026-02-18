# HAR Analysis — Listings Page (`/listings`)

**Date:** 2026-02-18
**Browser:** Firefox 147.0.3
**Environment:** `localhost:3000` (Next.js dev mode, cache disabled)
**Supabase Project:** `uttbptpkekijlfzvauzu`

---

## 1. Guest User (Not Logged In)

**Source:** `blockhyre_har[26-02-18 13-40-02]`
**Page Timings:** `onContentLoad: 909ms` | `onLoad: 1614ms`

### Request Timeline

| # | Offset | Method | Endpoint | Wait (ms) | Status | Notes |
|---|--------|--------|----------|-----------|--------|-------|
| 1 | +0ms | GET | `/rest/v1/categories` | 368 | 200 | 36 categories returned |
| 2 | +158ms | GET | `/rest/v1/platform_settings` | 328 | 200 | Settings object |
| 3 | +160ms | POST | `/__nextjs_original-stack-frames` | 9 | 200 | Dev-only (Firefox extension noise) |
| 4 | +360ms | OPTIONS | `/rest/v1/categories` (CORS) | 55 | 200 | Preflight |
| 5 | +459ms | OPTIONS | `/rest/v1/platform_settings` (CORS) | 53 | 200 | Preflight |
| 6 | +461ms | POST | `/rest/v1/rpc/search_nearby_listings` | 313 | 200 | 8 listings returned |
| 7 | +498ms | OPTIONS | `/rpc/search_nearby_listings` (CORS) | 60 | 200 | Preflight |

### Observations — Guest

- ✅ **Clean load.** All requests succeed. No unnecessary auth calls.
- ✅ **No `getSession` call.** No Supabase auth token in localStorage → no session check fired.
- ✅ **No "My Neighborhood" section.** `maybeAuthenticated = false` correctly hides it.
- ✅ **No favorites queries.** Guest users don't trigger favorite checks.
- ℹ️ **`__nextjs_original-stack-frames`**: Harmless dev-only request caused by a Firefox extension ("URL Shortener Unshortener"). Not present in production.
- ℹ️ **Listings RPC params:** `radius_miles: 20000`, `min_price: 0`, `max_price: 300`, `category_filter: null`, `search_query: null` — defaults for guest with no location.

---

## 2. Logged-In User

**Source:** `blockhyre_loggedin[26-02-18 13-49-14]`
**Page Timings:** `onContentLoad: 1457ms` | `onLoad: 2204ms`
**User:** `392afe27-adb0-41ea-9704-c62173c7c052` (barley@usbc.be)

### Request Timeline

| # | Timestamp | Method | Endpoint | Wait (ms) | Status | Notes |
|---|-----------|--------|----------|-----------|--------|-------|
| 1 | 48:59.267 | GET | `/listings` (SSR) | 642 | 200 | HTML document |
| 2 | 49:00.858 | GET | WebSocket HMR | 1 | 101 | Dev-only |
| 3 | 49:02.413 | GET | Supabase Realtime WS | 328 | 101 | Auth subscription |
| 4 | 49:02.524 | GET | `/rest/v1/categories` | 279 | 200 | 36 categories |
| 5 | 49:02.786 | GET | `/rest/v1/platform_settings` | 277 | 200 | Settings |
| 6 | 49:02.788 | HEAD | `/rest/v1/messages` (unread) | 280 | 200 | Notification check |
| 7 | 49:02.789 | GET | `/rest/v1/users` (profile) | 275 | 200 | Photo + name |
| 8 | 49:02.791 | GET | `/rest/v1/users` (neighborhood) | 344 | 200 | Neighborhood join |
| 9 | 49:02.886 | GET | `/rest/v1/users` (profile) | 267 | 200 | ⚠️ **DUPLICATE of #7** |
| 10 | 49:02.887 | GET | `/rest/v1/users` (neighborhood) | 263 | 200 | ⚠️ **DUPLICATE of #8** |
| 11 | 49:03.493 | GET | `/_next/image` (avatar) | 6 | 200 | Optimized image |
| 12 | 49:04.142 | POST | `/rpc/search_nearby_listings` | 266 | 200 | 8 listings |
| 13-20 | 49:04.794+ | GET | `/_next/image` (tool images ×8) | ~10-27 | 200 | Tool card images |
| 21-36 | 49:04.802+ | GET | `/rest/v1/favorites` | ~253-694 | 200 | 🚨 **×16 IDENTICAL** |

### Observations — Logged In

#### 🚨 Critical: Favorites N+1 Query (Lines 21-36)

**The exact same query is fired 16 times in parallel:**
```
GET /rest/v1/favorites?select=listing_id&user_id=eq.392afe27-adb0-41ea-9704-c62173c7c052
```

- Each takes ~270-694ms
- Every `ToolCard` component independently fetches the full favorites list
- **8 listings × 2 render cycles = 16 requests** for identical data
- Total wasted bandwidth: ~15 redundant requests
- **Fix:** Fetch favorites once at the page level (or via context) and pass down as a prop or Set

#### ⚠️ Moderate: Duplicate Profile & Neighborhood Queries (Lines 7-10)

The user profile and neighborhood data are each fetched **twice**:
- `users?select=profile_photo_url,full_name` → Lines 7 and 9
- `users?select=neighborhood_id,neighborhoods(...)` → Lines 8 and 10

Likely caused by:
- Double-mount during React hydration (SSR → client)
- Or multiple components independently requesting the same user data

**Fix:** Centralize user data fetching in the `AuthProvider` or a shared hook with deduplication.

#### ⏱️ Timing: "My Neighborhood" Pop-In Root Cause

The timeline explains the pop-in behavior:

```
+0.0s  SSR HTML delivered (no neighborhood in HTML — SSR can't check localStorage)
+1.5s  JS hydration begins
+1.5s  useLayoutEffect fires → maybeAuthenticated = true → skeleton renders
+3.5s  Neighborhood query starts (after auth resolves)
+3.8s  Neighborhood data arrives → skeleton replaced with actual name
```

The skeleton appears at ~1.5s (after hydration), not at 0s (initial paint). This 1.5s gap is the "pop-in" the user sees. The SSR HTML contains no neighborhood section because the server cannot access `localStorage`.

---

## 3. Comparison Summary

| Metric | Guest | Logged In | Delta |
|--------|-------|-----------|-------|
| `onContentLoad` | 909ms | 1457ms | +548ms |
| `onLoad` | 1614ms | 2204ms | +590ms |
| Total API requests | 3 | 22+ | +19 |
| Supabase queries | 3 | 20+ | +17 |
| Duplicate queries | 0 | 18 | — |
| Favorites queries | 0 | 16 | 🚨 |

---

## 4. Prioritized Recommendations

### P0 — Favorites N+1 (High Impact, Easy Fix)
- Fetch user favorites **once** at the listings page level
- Pass the `Set<string>` of favorited listing IDs down to each `ToolCard`
- **Expected savings:** 15 eliminated requests, ~300ms faster render

### P1 — Deduplicate User Data Queries (Medium Impact)
- Profile photo/name and neighborhood queries fire twice each
- Centralize in `AuthProvider` or use a shared SWR/React Query cache
- **Expected savings:** 2 eliminated requests, cleaner data flow

### P2 — Neighborhood Skeleton Timing (UX Polish)
- Current: Skeleton appears at ~1.5s (after JS hydration)
- Ideal: Skeleton in SSR HTML (requires server-side auth cookie reading)
- Alternative: Accept the 1.5s delay since `useLayoutEffect` prevents flash-of-no-skeleton after hydration
- **This is cosmetic** — the current implementation is functionally correct

### P3 — Consider Request Batching
- Categories, platform_settings, user profile, and neighborhood queries all fire within 300ms of each other
- PostgREST doesn't support batching natively, but a custom edge function could combine them
- **Low priority** — parallel requests are already fast
