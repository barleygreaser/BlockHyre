# Gifted Chat Implementation Plan

## Problem Statement
The integration of `react-native-gifted-chat` is partially complete. While the data layer hooked to Supabase (`useMessages.ts`) and the Inbox UI both function, the core chat screen and listing integration have critical edge cases (like keyboard avoidance, user race conditions, and error-handling) that will break the app when interacting with real data.

## Goal
Finalize the messaging flow by resolving layout bugs, fixing race conditions, and enforcing strict data validation to ensure i

## Action Plan

### ✅ 1. Fix Listing Integration Edge Cases (`app/listings/[id].tsx`)
Currently, `handleRent()` blindly falls back to `'mock-owner-id'` if no owner ID exists. Sending this to the `upsert_conversation` Supabase RPC will crash the query because it expects a valid UUID.
- **Action**: Add strict validation inside `handleRent()` to check if `listing.owner_id` is a valid UUID.
- **Action**: Alert the user or block the action gracefully if the `owner_id` is invalid or missing, instead of crashing the database request.

### ✅ 2. Implement Safe Keyboard Avoidance (`app/chat/[id].tsx`)
Gifted Chat's input box will be misaligned due to iOS translucent tabs and home indicator safe areas.
- **Action**: Import `useSafeAreaInsets` from `react-native-safe-area-context`.
- **Action**: Bind the `bottomOffset` prop in `<GiftedChatWrapper />` dynamically based on the platform (`Platform.OS === 'ios' ? insets.bottom : 0`).
- **Action**: Ensure a `KeyboardAvoidingView` is correctly utilized if the native GiftedChat view requires it to push up reliably over the keyboard.

### ✅ 3. Resolve `currentUser` Race Condition (`app/chat/[id].tsx`)
Right now, the chat defaults the ID to `'demo-user-id'` while the `<GiftedChatWrapper />` mounts asynchronously before `currentUser` fully resolves, causing optimistic messages to be orphaned.
- **Action**: Only render the `GiftedChatWrapper` component *after* `currentUser` has been fully fetched and established in the local state.
- **Action**: Show an `ActivityIndicator` or skeleton while `currentUser` is resolving.

### ✅ 4. Verify Supabase Real-Time Settings (Dashboard/CLI)
The application relies on `postgres_changes` to deliver messages in real-time. If the tables are not configured to broadcast, messages won't appear until a pull-to-refresh.
- **Action**: Verify that the `public.messages` and `public.chats` tables have Realtime enabled in the Supabase Dashboard.
- **Action**: Ensure Replica Identity is set to `DEFAULT` or `FULL` on the `messages` table to stream new inserts correctly.

---

## Next Steps
All implementation steps, including the backend Supabase Realtime configurations, are complete. The messaging flow is now fully operational and robust!
