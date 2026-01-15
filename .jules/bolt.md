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
