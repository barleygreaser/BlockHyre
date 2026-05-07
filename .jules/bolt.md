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
## 2025-02-18 - Unified Supabase Subscriptions
**Learning:** Multiple hooks subscribing to the same Supabase table/channel (e.g. `useUnreadCount` and `useMessageNotifications`) create independent WebSocket connections, multiplying database load and client overhead. Consolidating these into a single Context Provider (`MessageContext`) reduces connections by 50%+ and ensures consistent state application-wide.
**Action:** Always check for existing subscriptions before creating new ones. Use Context to share Realtime data across components.

## 2024-05-24 - React Native FlatList Optimization
**Learning:** `Intl.DateTimeFormat` instantiation inside a `renderItem` method of a React Native `FlatList` significantly degrades scrolling performance because it recalculates on every re-render and for every item. Further, if `renderItem` is not wrapped in `useCallback`, it gets re-created every time the parent re-renders, breaking `FlatList` internal optimizations.
**Action:** Always pre-initialize `Intl.DateTimeFormat` outside the component scope if options are static. Always wrap `renderItem` in `useCallback` with proper dependencies to ensure referential stability.

## 2024-04-04 - [Performance] Pre-initialize Intl.NumberFormat and Intl.DateTimeFormat objects at the module level
**Learning:** Found multiple instances where `Intl.DateTimeFormat` and `Intl.NumberFormat` objects were instantiated inside component functions (even inside loops) or used via `date.toLocaleDateString()` during render. Instantiating formatters inside React components (especially within rendering loops mapping over arrays) causes performance overhead due to recreation on every render.
**Action:** Pre-initialize these objects at the module level outside the component render cycle to significantly improve performance. Replace repeated `toLocaleDateString` and `Intl.NumberFormat` with a single initialized instance for that format.

## 2025-02-28 - Optimizing Filter+Sort on Pre-sorted Arrays
**Learning:** Chaining `.filter().sort()` with `String.prototype.localeCompare` on a pre-sorted array (like category lists) forces O(N log N) time complexity and slow string operations, especially when the goal is just to prioritize prefix matches (startsWith) over partial matches (includes).
**Action:** Use a single O(N) traversal to partition items into `exactMatches` and `partialMatches` arrays based on match quality, then concatenate them. This naturally preserves the original alphabetical sub-sorting automatically with significantly less CPU overhead.

## 2024-04-04 - [Performance] Pre-initialize Intl.DateTimeFormat object
**Learning:** `Intl.DateTimeFormat` object is being instantiated repeatedly inside React components or helper functions during format string operations causing unnecessary re-renders.
**Action:** Always pre-initialize `Intl.DateTimeFormat` objects at the module level when options are static. Replace repeated formatters with pre-initialized instance for the specific format.

## 2025-02-28 - Avoid Redundant Sorting in React Renders
**Learning:** Performing `String.prototype.localeCompare` to sort string arrays (e.g. categories) inside a functional component body causes O(N log N) overhead on every single re-render. Passing pre-sorted arrays as props still resulted in child components unnecessarily re-sorting them.
**Action:** Use `useMemo` to cache sorting operations when the source array is stable. Additionally, do not re-sort arrays in child components (e.g. Filter Modals) if the parent already pre-sorted them.
## 2024-04-05 - [Performance] Optimize API suggestion prefix matching using O(N) partitioning
**Learning:** Using `Array.prototype.sort()` to prioritize items (e.g., prefix matches vs. partial matches) recalculates expensive operations like `toLowerCase()` and `startsWith()` repeatedly (`O(N log N)` times) and is unnecessarily slow when the source array is already pre-sorted (e.g., alphabetically from a DB query).
**Action:** Replace `sort()` with an O(N) traversal that partitions the items into separate arrays based on priority, calculating derived values exactly once per item, and concatenate them to preserve the original sub-sorting and reduce computational overhead.

## 2024-06-04 - Pre-calculating Derived Data for Filtering
**Learning:** Performing string normalization (e.g. `toLowerCase().trim()`) inside a filter loop causes O(N*M) complexity on every keystroke.
**Action:** Use `useMemo` to pre-calculate normalized fields (e.g. `normTitle`) for the entire dataset once when it changes, reducing filter complexity to O(N) comparisons. Furthermore, ALWAYS hoist loop-invariant values (like the search query normalization) outside of the `.filter()` loop.

## 2025-03-02 - Optimize List Filtering and Derived Counts in Render loops
**Learning:** Performing multiple array `.filter()` traversals to derive category counts or recalculating filtered lists on every render (without `useMemo`) creates an O(N * M) performance bottleneck, especially when loop-invariant operations like string normalization (`toLowerCase()`) are placed inside the loop.
**Action:** Always wrap derived lists in `useMemo`, hoist loop-invariant operations like search normalization outside the loop, and use an O(N) array reduction/traversal to pre-calculate category counts once rather than filtering repeatedly.

## 2025-03-02 - Optimize List Filtering and Derived Counts in Render loops
**Learning:** Performing array `.filter()` traversals to derive category counts or recalculating filtered lists on every render (without `useMemo`) creates a performance bottleneck (O(N) executed repeatedly), especially as datasets grow in dashboard tables and lists. This was found unoptimized on both the owner bookings and renter rentals page.
**Action:** Always wrap derived lists in `useMemo`, and use an O(N) array reduction/traversal to pre-calculate category counts once rather than iterating or filtering repeatedly on every single React render.
