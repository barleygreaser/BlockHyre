# Bolt's Journal

## 2024-05-24 - Image Optimization
**Learning:** The codebase was using standard `<img>` tags in critical components like `FeaturedToolCard`, bypassing Next.js built-in image optimization.
**Action:** Always check for `<img>` tags in shared components and replace with `next/image` to leverage automatic resizing, lazy loading, and format conversion.

## 2024-05-25 - External Image Domains
**Learning:** When switching to `next/image`, any external image sources (like `placehold.co` used for mock data) must be explicitly whitelisted in `next.config.ts`, otherwise the app will throw errors at runtime.
**Action:** Before migrating `<img>` to `next/image`, grep for potential external domains in the codebase and update `next.config.ts` accordingly.

## 2024-05-26 - Date Sorting Performance
**Learning:** Using `String.prototype.localeCompare` to sort ISO 8601 date strings is significantly slower than direct comparison. In frequently re-rendered components or large lists, this adds unnecessary overhead.
**Action:** Use standard relational operators (`>`, `<`) for ISO date strings, ensuring 0 is returned for equality to maintain sort stability.

## 2024-05-27 - Date Formatting Performance
**Learning:** `toLocaleTimeString` and `toLocaleDateString` instantiate a new `Intl.DateTimeFormat` object on every call, which is expensive in lists (like chat messages).
**Action:** Extract `Intl.DateTimeFormat` to a static constant outside the component when formatting options are static.

## 2024-05-28 - React Hook Re-subscriptions
**Learning:** Initializing the Supabase client directly inside a component body (e.g., `const supabase = createClient()`) creates a new reference on every render. If used in a `useEffect` dependency array, this causes infinite re-subscription loops.
**Action:** Always wrap client initialization in `useState` lazy initializer or `useMemo` to ensure stability.

## 2024-05-29 - Optimistic Prefix Search
**Learning:** Supabase/Postgres `ilike` with leading wildcards (`%query%`) forces full table scans. For autocomplete features, users typically type the start of the word.
**Action:** Implement "optimistic prefix search": try `ilike query%` first (index-friendly). If it yields sufficient results, return them. Only fallback to expensive `%query%` if necessary.

## 2024-05-30 - Memoization of Heavy Props
**Learning:** Components like `RealtimeChat` often perform expensive merging/sorting in `useMemo`. If the parent component passes a derived array (e.g. `messages.map(...)`) without `useMemo`, the child's optimization is defeated, leading to O(N log N) operations on every render.
**Action:** Always memoize derived arrays passed to heavy UI components, especially those involving lists or charts.
