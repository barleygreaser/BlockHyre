- Added `router.dismiss()` before `router.replace('/(tabs)/')` in `apps/mobile/app/onboarding/permissions.tsx` to fix infinite navigation stack loop.
- Added mock data check in `apps/mobile/app/listings/[id].tsx` `handleRent` function to prevent crashing Supabase RPC call with `mock-owner-id`.

- Added `router.dismiss()` before `router.replace('/(tabs)/')` in `apps/mobile/app/onboarding/permissions.tsx` to fix infinite navigation stack loop.
- Added mock data check in `apps/mobile/app/listings/[id].tsx` `handleRent` function to prevent crashing Supabase RPC call with `mock-owner-id`.

## Optimization & Architecture
- When navigating from a Stack screen to a Tab screen (e.g., Onboarding to Tabs), always execute `if (router.canDismiss()) router.dismiss();` before `router.replace('/(tabs)/')`. This prevents infinite navigation stack loops.
- When making backend RPC calls (like `upsertConversation`), ensure mock data IDs (like `mock-owner-id` or development IDs length < 20) are intercepted and prevented from reaching the database, avoiding unhandled promise rejections and app crashes.

- When navigating from a Stack screen to a Tab screen (e.g., Onboarding to Tabs), always execute `if (router.canDismiss()) router.dismiss();` before `router.replace('/(tabs)/')`. This prevents infinite navigation stack loops.
- When making backend RPC calls (like `upsertConversation`), ensure mock data IDs (like `mock-owner-id` or development IDs length < 20) are intercepted and prevented from reaching the database, avoiding unhandled promise rejections and app crashes.
