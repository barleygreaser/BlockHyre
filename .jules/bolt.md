# Bolt's Journal

## 2024-05-24 - Image Optimization
**Learning:** The codebase was using standard `<img>` tags in critical components like `FeaturedToolCard`, bypassing Next.js built-in image optimization.
**Action:** Always check for `<img>` tags in shared components and replace with `next/image` to leverage automatic resizing, lazy loading, and format conversion.
