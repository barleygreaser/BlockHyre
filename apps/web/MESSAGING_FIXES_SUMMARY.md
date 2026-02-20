# Messaging Optimization & Fixes

**Date:** 2026-02-18
**Status:** ✅ Implemented

## 1. Resolved: Avatar Flickering ("Pop")
**Issue:** When sending messages in the same minute, the user's avatar would flick back and forth between the Google OAuth photo (from `user_metadata`) and the custom profile photo (from DB).
**Fix:** Updated `MessageView` to prioritize `userProfile.profilePhotoUrl` (DB source) for the local user's avatar, ensuring consistency with the backend and `RealtimeChat`.

## 2. Optimized: Redundant Auth Checks (P0)
**Issue:** Technical analysis showed `supabase.auth.getUser()` was being called ~7 times per message flow, adding significant latency.
**Fix:** Refactored `useMessages` hook to use the `user` object directly from `AuthContext` (via `useAuth`), eliminating these redundant network round-trips.

## 3. Improved: Hook Stability
**Issue:** `fetchConversations`, `fetchMessages`, etc., were recreated on every render.
**Fix:** Wrapped all data fetching functions in `useCallback` to ensure referential stability and prevent unnecessary effect re-firing.

## Remaining Observations
- The "refreshing" behavior when sending back-to-back messages might be related to the optimistic update logic in `ConversationList`. Since `INSERT` events are handled optimistically without a full reload, the list behavior should be smooth. If "popping" persists, it was likely the avatar swap which is now fixed.
- **Recommendations for future:** Consider implementing optimistic updates for `UPDATE` events (e.g. read status) in `ConversationList` to further reduce reloads.
