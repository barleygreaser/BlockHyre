# `/listings` Page Optimization Plan

**Date:** 2026-02-18
**Branch:** `fix/listings-performance`
**Baseline (Logged In):** `onContentLoad: 1457ms` | `onLoad: 2204ms` | 22+ API requests | 18 duplicates

---

## Problem Summary

The `/listings` page has **four distinct performance issues** for logged-in users, identified via HAR analysis and render timeline inspection:

1. **🚨 Favorites N+1 Query** — 16 identical `GET /rest/v1/favorites` requests (8 listings × 2 render cycles)
2. **🚨 Neighborhood Section Flash/Pop-In** — SSR HTML has no neighborhood section → it pops in after JS hydration (~1.5s), causing Cumulative Layout Shift (CLS) and desynchronized skeletons
3. **⚠️ Duplicate Profile & Neighborhood Queries** — User profile and neighborhood data each fetched twice
4. **ℹ️ `useMarketplace` Instantiation Waste** — Hook allocates unused functions/effects on every mount

### Skeleton Timing Problem (Why Skeletons Don't Load Together)

```
SSR HTML (what the browser paints at +0ms):
├── Navbar            → skeleton ✅ (loading = true by default)
├── Inventory Grid    → skeleton ✅ (loading = true by default)
└── My Neighborhood   → MISSING ❌ (maybeAuthenticated = false on server, no localStorage)

After JS Hydration (~1.5s):
├── useLayoutEffect   → maybeAuthenticated = true
└── My Neighborhood   → skeleton POPS IN 💥 (CLS, content shifts down)

After Auth + Query (~3.5s):
└── My Neighborhood   → real data replaces skeleton
```

The inventory skeleton and navbar skeleton are synchronized because their `loading` state initializes as `true` (pure state, works in SSR). But `maybeAuthenticated` relies on `useLayoutEffect` + `localStorage`, which can't run during SSR — so the neighborhood section is absent from the initial HTML entirely.

---

## Task 1: Fix Favorites N+1 Query (P0 — Critical)

**Impact:** Eliminates ~15 redundant requests, ~300ms faster render
**Files:**
- `app/context/favorites-context.tsx` (new)
- `app/hooks/use-favorites.ts` (refactor to thin wrapper)
- `app/layout.tsx` (mount provider)

### Root Cause

Every `<FavoriteButton>` component calls `useFavorites()` independently. Since `useFavorites()` is a standalone hook (not context-backed), **each instance creates its own `useEffect` that fetches the full favorites list from Supabase.** With 8 tool cards rendered in 2 React render cycles (SSR hydration → client), this produces 16 identical requests.

```
ToolCard #1 → FavoriteButton → useFavorites() → GET /favorites  ← Instance 1
ToolCard #2 → FavoriteButton → useFavorites() → GET /favorites  ← Instance 2
ToolCard #3 → FavoriteButton → useFavorites() → GET /favorites  ← Instance 3
...
× 2 render cycles = 16 total
```

### Solution: Lift Favorites to Context

Create a `FavoritesProvider` context that wraps the app. All `FavoriteButton` instances consume the context instead of each creating their own fetch.

### Steps

1. **Create `app/context/favorites-context.tsx`**
   - Move the core logic from `useFavorites()` (the `fetchFavoriteIds`, `isFavorite`, `toggleFavorite` functions) into a `FavoritesProvider` context.
   - The context fetches favorites **once** when a user is authenticated, then provides `favoriteIds: Set<string>`, `isFavorite(id)`, and `toggleFavorite(id)` to all consumers.
   - Keep optimistic updates and error rollback logic intact.

2. **Refactor `app/hooks/use-favorites.ts`**
   - Change `useFavorites()` to be a thin wrapper around `useContext(FavoritesContext)`.
   - Keep `fetchFavoriteListings()` in the hook as-is (it's only used on the `/favorites` page, not per-card).
   - The public API stays the same: `{ isFavorite, toggleFavorite, favoriteIds, favoriteCount, loading }`.

3. **Mount `FavoritesProvider` in `app/layout.tsx`**
   - Wrap inside the existing `AuthProvider` so it has access to `useAuth()`.
   - It should only fetch when `user` is non-null.

4. **No changes needed to `FavoriteButton`, `ToolCard`, or `MobileToolCard`**
   - They already call `useFavorites()` — once the hook reads from context instead of creating its own fetch, the N+1 disappears automatically.

### Expected Result

```
Before: 16 × GET /rest/v1/favorites?select=listing_id&user_id=eq.xxx
After:   1 × GET /rest/v1/favorites?select=listing_id&user_id=eq.xxx
```

**Validation:** Reload `/listings` while logged in. HAR should show exactly **1** favorites query.

---

## Task 2: Server-Side Auth Hint for Synchronized Skeletons (P0 — UX Critical)

**Impact:** Eliminates neighborhood pop-in/flash, synchronizes all skeletons from first paint, eliminates CLS
**Files:**
- `lib/middleware.ts` (set auth hint header/cookie)
- `app/listings/page.tsx` (read server-side hint, convert to hybrid SSR/client page)
- `app/context/auth-context.tsx` (accept server-side initial hint)
- `app/layout.tsx` (pass server-side hint to providers)

### Root Cause

The SSR render has no way to know if a user is authenticated. `maybeAuthenticated` is set via `useLayoutEffect` + `localStorage`, which only runs client-side after hydration (~1.5s). This means:
- The neighborhood section is **absent** from the SSR HTML
- It **pops in** after hydration, causing CLS (content shifts down)
- Skeletons are **desynchronized** — inventory/navbar skeletons show immediately but neighborhood does not

### Key Insight: Middleware Already Has Auth State

The existing `lib/middleware.ts` already calls `supabase.auth.getUser()` on every request (line 38-40). The server **already knows** if the user is authenticated — we just aren't passing that information to the SSR render.

### Solution: Cookie-Based Auth Hint

Set a lightweight cookie in middleware that the server render (or a layout Server Component) can read. This eliminates the SSR → hydration gap entirely.

### Steps

1. **Update `lib/middleware.ts`** — Set a `bh-auth-hint` cookie
   - After the `getUser()` call that already exists, set a simple boolean cookie:
     ```ts
     // After line 40: const { data: { user } } = await supabase.auth.getUser()

     // Set a lightweight auth hint cookie for SSR skeleton rendering
     // This is NOT a security mechanism — just a rendering optimization
     if (user) {
         supabaseResponse.cookies.set('bh-auth-hint', '1', {
             path: '/',
             httpOnly: false, // Client JS also reads this (replaces localStorage check)
             sameSite: 'lax',
             secure: process.env.NODE_ENV === 'production',
             maxAge: 60 * 60 * 24 * 7, // 7 days, refreshed on every request
         });
     } else {
         supabaseResponse.cookies.delete('bh-auth-hint');
     }
     ```
   - This cookie is refreshed on every request, so it stays in sync with actual auth state.
   - It's NOT a security mechanism — it's purely a rendering hint. Actual auth is still handled by Supabase tokens.

2. **Update `app/context/auth-context.tsx`** — Replace `localStorage` check with cookie check
   - Replace the `getInitialAuthHint()` function:
     ```ts
     const getInitialAuthHint = (): boolean => {
         if (typeof window === 'undefined') {
             // SSR: can't check cookies here, but the Server Component
             // will pass the hint via props
             return false;
         }
         // Client: check the cookie set by middleware
         return document.cookie.includes('bh-auth-hint=1');
     };
     ```
   - This is a minor improvement — the cookie check is simpler than scanning `localStorage` for Supabase keys.

3. **Create a Server Component wrapper for the listings page**
   - Create `app/listings/layout.tsx` (Server Component) that reads the cookie:
     ```tsx
     import { cookies } from 'next/headers';

     export default async function ListingsLayout({
         children,
     }: { children: React.ReactNode }) {
         const cookieStore = await cookies();
         const isAuthenticated = cookieStore.get('bh-auth-hint')?.value === '1';

         return (
             <div data-auth-hint={isAuthenticated ? '1' : '0'}>
                 {children}
             </div>
         );
     }
     ```
   - Alternatively (and simpler): pass the hint via a CSS class on `<body>` or a `data-*` attribute that the client component can read synchronously on first render, avoiding hydration mismatches.

4. **Update `app/listings/page.tsx`** — Read the SSR auth hint
   - On the first render (SSR), the component reads the `data-auth-hint` attribute from the parent layout or consumes the cookie directly via the `getInitialAuthHint()` cookie-based check.
   - Since `document.cookie` is available synchronously in the browser (unlike `localStorage` which needs `useLayoutEffect`), and the cookie is set by the server (so it's also readable during SSR via `cookies()`), the neighborhood skeleton can be included in the SSR HTML from the very first render.

### How This Synchronizes Skeletons

```
SSR HTML (with cookie-based auth hint):
├── Navbar            → skeleton ✅ (loading = true)
├── My Neighborhood   → skeleton ✅ (bh-auth-hint=1 → maybeAuthenticated = true at SSR)
├── Inventory Grid    → skeleton ✅ (loading = true)
└── All skeletons visible from first paint 🎯

After JS Hydration:
├── No pop-in, no CLS — skeletons already present
├── Auth resolves → real data replaces skeletons smoothly
```

### Expected Result

- **Zero CLS** for the neighborhood section
- All skeletons (navbar, neighborhood, inventory grid) visible from the **first paint**
- Guests see **no** neighborhood skeleton (cookie absent → hint = false → section hidden)

**Validation:** Open `/listings` while logged in. On first paint, the neighborhood skeleton should be visible alongside the inventory skeleton. No content shift.

---

## Task 3: Deduplicate Profile & Neighborhood Queries (P1 — Moderate)

**Impact:** Eliminates 2–4 redundant requests, cleaner data architecture
**Files:**
- `app/context/auth-context.tsx` (add profile data)
- `app/components/navbar.tsx` (consume context instead of fetching)
- `app/listings/page.tsx` (consume context instead of fetching)

### Root Cause

Two components independently fetch the same user data from Supabase:

| Query | Component |
|-------|-----------|
| `users?select=profile_photo_url,full_name` | `Navbar` (line 36-40) |
| `users?select=neighborhood_id,neighborhoods(...)` | `InventoryPage` (line 84-95) |

The **double-fire** of each (lines 7+9 and 8+10 in HAR) is caused by React's StrictMode double-mounting in development. This won't happen in production, but we should still centralize the fetching to prevent it from becoming an issue if another component needs the same data.

### Solution: Centralize User Profile in AuthContext

### Steps

1. **Extend `AuthProvider` in `app/context/auth-context.tsx`**
   - Add `userProfile` to the context type:
     ```ts
     type UserProfile = {
         fullName: string | null;
         profilePhotoUrl: string | null;
         neighborhoodId: string | null;
         neighborhood: {
             name: string;
             centerLat: number;
             centerLon: number;
         } | null;
     };
     ```
   - Fetch this data **once** inside `AuthProvider` after `checkSession()` resolves a valid user.
   - Combine both queries into a single Supabase call:
     ```ts
     const { data } = await supabase
         .from('users')
         .select('full_name, profile_photo_url, neighborhood_id, neighborhoods(name, center_lat, center_lon)')
         .eq('id', user.id)
         .single();
     ```
   - Expose `userProfile` and `userProfileLoading` in the context value.

2. **Refactor `Navbar` (`app/components/navbar.tsx`)**
   - Remove the local `useEffect` + `fetchUserProfile` (lines 32-51).
   - Remove local `avatarUrl` and `fullName` state.
   - Consume `userProfile` from `useAuth()` instead:
     ```ts
     const { user, userProfile, signOut, loading } = useAuth();
     const avatarUrl = userProfile?.profilePhotoUrl;
     const fullName = userProfile?.fullName;
     ```

3. **Refactor `InventoryPage` (`app/listings/page.tsx`)**
   - Remove the neighborhood fetch from the `initializeLocation` `useEffect` (lines 83-117).
   - Consume neighborhood data from `useAuth()` context:
     ```ts
     const { user, userProfile, loading: authLoading, maybeAuthenticated } = useAuth();
     ```
   - Set `userLocation` and `neighborhoodName` from `userProfile.neighborhood` when it becomes available.

### Expected Result

```
Before: 4 queries (profile ×2, neighborhood ×2 due to StrictMode)
After:  1 combined query (fetched once in AuthProvider)
```

In production (no StrictMode): goes from 2 separate queries → 1 combined query.

**Validation:** HAR should show exactly **1** `GET /rest/v1/users?select=full_name,profile_photo_url,neighborhood_id,neighborhoods(...)` request.

---

## Task 4: `useMarketplace` Instantiation Waste (Deferred — Future Refactor)

**Impact:** Prevents unnecessary re-renders, reduces memory allocation
**Files:**
- `app/hooks/use-marketplace.ts`
- `app/listings/page.tsx`

### Root Cause

Every component that calls `useMarketplace()` gets a brand new instance of the hook, with its own state, its own `useEffect` for `fetchCategories` + `fetchPlatformSettings`, and its own copy of every function. Functions like `createRental`, `blockDateRange`, `deleteBlockedDate`, `fetchBlockedDates`, `fetchListing`, `fetchFeaturedListings`, and the entire auto-categorization system are **all initialized** even though the listings page only uses `searchListings`, `categories`, and `loading`.

The module-level cache (`cachedCategories`, `cachedPlatformSettings`) mitigates the worst of it (no duplicate network calls after first load), but the hook still allocates objects and sets up effects unnecessarily.

### Future Solution

Split `useMarketplace` into focused hooks:
- `useListingSearch()` — search/filter logic
- `useCategories()` — category fetching with cache
- `useListingDetail(id)` — single listing fetch
- `useRentals()` — rental creation
- `usePlatformSettings()` — settings fetch

Each page imports only what it needs.

### Recommendation

**Skip this task for now.** The module-level cache is doing its job, and the extra allocations are negligible. Flag for future refactoring sprint.

---

## Execution Order

| Order | Task | Priority | Effort | Impact |
|-------|------|----------|--------|--------|
| 1 | Favorites N+1 → FavoritesProvider Context | P0 | ~30 min | 🔴 High (15 requests eliminated) |
| 2 | Server-Side Auth Hint → Synchronized Skeletons | P0 | ~25 min | 🔴 High (CLS eliminated, skeleton sync) |
| 3 | Deduplicate Profile/Neighborhood → Centralize in AuthContext | P1 | ~20 min | 🟡 Medium (2–4 requests eliminated) |
| 4 | `useMarketplace` refactor | — | Deferred | 🟢 Low (future improvement) |

**Note:** Tasks 2 and 3 share files (`auth-context.tsx`, `listings/page.tsx`) and should be implemented together to avoid merge conflicts.

---

## Expected Outcome

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total API requests (logged in) | 22+ | ~6 | **-73%** |
| Duplicate queries | 18 | 0 | **-100%** |
| Favorites queries | 16 | 1 | **-94%** |
| Profile/Neighborhood queries | 4 | 1 | **-75%** |
| Neighborhood CLS (pop-in) | ~1.5s shift | 0 | **Eliminated** |
| Skeleton synchronization | Desynchronized | All at first paint | **Fixed** |
| Estimated `onLoad` | ~2200ms | ~1600ms | **-27%** |

---

## Validation Checklist

After implementing Tasks 1–3, capture a new HAR and verify:

- [ ] **Guest user:** No regressions. Same 3 API requests as before.
- [ ] **Guest user:** No neighborhood skeleton flash (section stays hidden).
- [ ] **Logged-in user:** Only 1 `GET /favorites` request total.
- [ ] **Logged-in user:** Only 1 `GET /users` request (combined profile + neighborhood).
- [ ] **Logged-in user:** Neighborhood skeleton visible from **first paint** (SSR HTML contains it).
- [ ] **Logged-in user:** All skeletons (navbar, neighborhood, inventory) appear simultaneously.
- [ ] **Favorites still work:** Toggling a favorite updates UI optimistically and persists.
- [ ] **Navbar still shows:** Avatar, full name, and unread count correctly.
- [ ] **My Neighborhood section:** Shows skeleton → smoothly transitions to real data (no CLS).
- [ ] **`bh-auth-hint` cookie:** Present when logged in, absent when logged out.
- [ ] **No console errors** in browser dev tools.
- [ ] **No hydration mismatches** — SSR and client render produce the same initial HTML.
