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

## 2024-05-31 - Middleware Auth Optimization
**Learning:** Optimizing middleware to skip `supabase.auth.getUser()` on public routes improves performance but breaks session maintenance (cookie refreshing) if using Server-Side Rendering or if the client session expires while browsing public pages.
**Action:** Do not remove `getUser()` calls from middleware unless you have a robust alternative mechanism for server-side session maintenance.

## 2024-05-31 - Global Hook State Management
**Learning:** Global hooks (like `useUnreadCount`) that depend on the user object can cause cascading renders if they synchronously update state when the user changes. Also, they can display stale data if the user switches accounts.
**Action:** Track the `userId` alongside the data in the hook's local state and verify it matches the current `user.id` during render to avoid stale data flashes and unnecessary effect updates.

## 2024-06-01 - Radix UI Avatar Optimization
**Learning:** The `@radix-ui/react-avatar` primitive renders a standard `<img>` tag via `AvatarImage`, bypassing Next.js image optimization. This leads to large image payloads in list views (like conversation lists).
**Action:** When using avatars in high-frequency lists, replace `AvatarImage` with `next/image` (wrapped in a relative container) to ensure proper resizing and format optimization.

## 2024-05-31 - Conversation List Optimization
**Learning:** Extracting list items into memoized components and stabilizing event handlers in the parent is crucial for performance when the list is long or when the parent re-renders frequently (e.g. on selection change).
**Action:** When working with lists where items have complex rendering logic or interactivity, always extract the item into a separate memoized component and ensure callback props are stable.

## 2024-06-03 - Responsive Image Optimization
**Learning:** Using CSS classes like `md:hidden` to toggle between two `next/image` components (e.g., portrait vs landscape) still results in both images being downloaded if `priority` is set, significantly impacting LCP.
**Action:** Use the `sizes` attribute to instruct the browser to download a minimal placeholder (e.g., `1px` or `1vw`) for the hidden variant based on media queries (e.g., `sizes="(max-width: 767px) 1px, 100vw"` for a desktop-only image).

## 2024-06-04 - Pre-calculating Derived Data for Filtering
**Learning:** Performing string normalization (e.g. `toLowerCase().trim()`) inside a filter loop causes O(N*M) complexity on every keystroke.
**Action:** Use `useMemo` to pre-calculate normalized fields (e.g. `normTitle`) for the entire dataset once when it changes, reducing filter complexity to O(N) comparisons.

## 2025-02-26 - Supabase Realtime Subscription Optimization
**Learning:** Depending on transient UI state (e.g. `selectedChatId`) inside a `useEffect` for Supabase Realtime subscription causes the subscription to tear down and reconnect on every interaction (e.g. clicking a chat).
**Action:** Use a `useRef` to track the current value of the transient state and access `ref.current` inside the subscription callback to maintain a stable subscription while still accessing fresh state.
