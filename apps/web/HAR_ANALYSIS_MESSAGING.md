# HAR Analysis — Messaging Page (`/messages?id=...`)

**Date:** 2026-02-18
**Source:** `message_sent_testing [26-02-18 21-37-56]`
**Browser:** Firefox (localhost:3000, dev mode, cache disabled)
**User:** `392afe27-adb0-41ea-9704-c62173c7c052` (barley@usbc.be)
**Scenario:** Page load → open chat `1b54f224-...` → send message "testing"

---

## 1. Request Timeline

Page start: `21:37:35.757` | `onContentLoad: 1372ms` | `onLoad: 2304ms`

### Phase 1: Page Load & Auth (35.757 — 39.692)

| # | Timestamp | Method | Endpoint | ms | Notes |
|---|-----------|--------|----------|---:|-------|
| 1 | 35.757 | GET | `/messages?id=1b54f224-...` (SSR) | 475 | HTML document |
| 2 | 38.466 | GET | `/users` (full_name, photo, neighborhood) | 263 | ✅ AuthContext centralized fetch |
| 3 | 38.467 | GET | `/users` (full_name, photo, neighborhood) | 306 | ⚠️ **DUPLICATE of #2** |
| 4 | 38.469 | GET | `/auth/v1/user` | 267 | Auth check #1 |
| 5 | 38.470 | WS | Supabase Realtime websocket | 243 | Auth subscription connect |
| 6 | 38.969 | GET | `/_next/image` (avatar) | 6 | Cached image |
| 7 | 39.027 | GET | `/auth/v1/user` | 268 | ⚠️ **Auth check #2** |
| 8 | 39.370 | GET | `/auth/v1/user` | 304 | ⚠️ **Auth check #3** |
| 9 | 39.692 | GET | `/auth/v1/user` | 283 | ⚠️ **Auth check #4** |

### Phase 2: Chat Data Fetch (40.029 — 41.511)

| # | Timestamp | Method | Endpoint | ms | Notes |
|---|-----------|--------|----------|---:|-------|
| 10 | 40.029 | GET | `/users?neighborhood_id` | 266 | ⚠️ Redundant — already fetched in #2 |
| 11 | 40.029 | HEAD | `/messages` (unread count) | 271 | Navbar badge count |
| 12 | 40.030 | POST | `rpc/mark_messages_read` | 293 | ✅ Mark chat as read |
| 13 | 40.030 | GET | `/favorites?listing_id` | 284 | ⚠️ **On messages page?** |
| 14 | 40.030 | POST | `rpc/mark_messages_read` | 297 | 🚨 **DUPLICATE of #12** |
| 15 | 40.031 | GET | `/users?neighborhood_id` | 273 | 🚨 **DUPLICATE of #10** |
| 16 | 40.031 | GET | `/favorites?listing_id` | 771 | 🚨 **DUPLICATE of #13** |
| 17 | 40.031 | GET | `/chats` (with joins) | 285 | ConversationList fetch #1 |
| 18 | 40.032 | GET | `/messages` (chat messages) | 297 | MessageView fetch #1 |
| 19 | 40.032 | GET | `/chats` (with joins) | 780 | 🚨 **DUPLICATE of #17** |
| 20 | 40.033 | GET | `/messages` (chat messages) | 781 | 🚨 **DUPLICATE of #18** |
| 21 | 40.378 | GET | `/messages?chat_id&is_read=false` | 729 | Unread count (per-chat) |
| 22 | 40.544 | GET | `/_next/image` (avatar) | 4 | Cached |
| 23 | 41.160 | GET | `/messages?chat_id&is_read=false` | 267 | ⚠️ **DUPLICATE of #21** |
| 24 | 41.162 | GET | `/messages?content,created_at` | 270 | Last message preview #1 |
| 25 | 41.460 | GET | `/messages?content,created_at` | 266 | ⚠️ **DUPLICATE of #24** |
| 26 | 41.511 | GET | `/_next/image` (other user avatar) | 3 | Cached |

### Phase 3: Send Message "testing" (45.457 — 48.070)

| # | Timestamp | Method | Endpoint | ms | Notes |
|---|-----------|--------|----------|---:|-------|
| 27 | 45.457 | GET | `/auth/v1/user` | 267 | ⚠️ **Auth check #5** (before send) |
| 28 | 45.824 | POST | `/messages` (insert) | 273 | ✅ Send message |
| 29 | 46.209 | GET | `/users` (sender profile) | 266 | Notification handler: fetch sender |
| 30 | 46.510 | GET | `/auth/v1/user` | 260 | ⚠️ **Auth check #6** |
| 31 | 47.213 | GET | `/auth/v1/user` | 264 | ⚠️ **Auth check #7** |
| 32 | 47.492 | GET | `/chats` (full reload) | 268 | 🚨 Conversation list full re-fetch |
| 33 | 47.775 | GET | `/messages?is_read=false` | 261 | Unread count re-fetch |
| 34 | 48.070 | GET | `/messages?content,created_at` | 300 | Last message re-fetch |

---

## 2. Issues Found (by severity)

### 🚨 P0 — `supabase.auth.getUser()` called 7 times (Lines 4, 7, 8, 9, 27, 30, 31)

**Root Cause:** Multiple hooks independently call `supabase.auth.getUser()` to verify the current user:
- `useMessages.fetchConversations()` (line 44 of `use-messages.ts`) — `await supabase.auth.getUser()`
- `useMessages.fetchMessages()` (line 147 of `use-messages.ts`) — inline `await supabase.auth.getUser()`
- `useMessages.sendMessage()` (line 165 of `use-messages.ts`) — `await supabase.auth.getUser()`
- `useMessages.subscribeToChat()` (line 215 of `use-messages.ts`) — `await supabase.auth.getUser()`
- `AuthContext.checkSession()` also triggers auth state changes that cascade

Each call is a **round-trip to Supabase** (~265ms each). Over the entire flow, that's **~1.85 seconds** spent purely on redundant auth checks.

**Fix:** The user is already available from `useAuth()`. Pass `user.id` as a parameter to `fetchConversations`, `fetchMessages`, `sendMessage`, and `subscribeToChat` instead of calling `getUser()` inside each one. The `AuthContext` has already resolved the user by the time these functions are called.

**Expected savings:** 6 eliminated network requests, ~1.6 seconds faster

---

### 🚨 P1 — Every data query fires twice (Lines 12/14, 17/19, 18/20, 21/23, 24/25)

**Duplicated queries:**

| Query | Line pair | Source |
|-------|-----------|--------|
| `rpc/mark_messages_read` | 12 + 14 | `MessageView.useEffect` fires twice on mount |
| `chats` (conversation list) | 17 + 19 | `fetchConversations` called twice |
| `messages` (chat messages) | 18 + 20 | `fetchMessages` called twice |
| `messages?is_read=false` (unread) | 21 + 23 | Inside `fetchConversations` → called twice |
| `messages?content,created_at` (last msg) | 24 + 25 | Inside `fetchConversations` → called twice |

**Root Cause:** React Strict Mode (double-mount in dev) and/or `useMessages()` being called from multiple components (`ConversationList` + `MessageView`) each creating their own hook instance. When both mount simultaneously, each fires its own fetch.

**Fix:**
1. Add a `useRef` guard in `MessageView` to prevent double-execution:
   ```ts
   const hasLoadedRef = useRef(false);
   useEffect(() => {
     if (hasLoadedRef.current) return;
     hasLoadedRef.current = true;
     loadMessages();
     markMessagesAsRead(chatId);
   }, [chatId]);
   ```
2. Alternatively, share a single `useMessages()` instance via context or lift the data fetching to `MessagesCenter` and pass data down as props.

**Expected savings:** 5 eliminated requests on load

---

### ⚠️ P2 — User profile fetched redundantly (Lines 2/3, 10/15)

**The user's profile/neighborhood data is fetched 4 times:**

| # | Query | Source |
|---|-------|--------|
| 2 | `users?full_name,photo,neighborhood_id,neighborhoods(...)` | `AuthContext.fetchUserProfile` |
| 3 | Same query | `AuthContext.fetchUserProfile` (double-mount or `onAuthStateChange` + `checkSession`) |
| 10 | `users?neighborhood_id` | Some other component (Navbar?) |
| 15 | `users?neighborhood_id` | Same query, duplicate |

**Fix:** `AuthContext` already has `userProfile` with `neighborhoodId`. Any component needing the neighborhood should read from `useAuth().userProfile` instead of making its own Supabase call. The `checkSession` + `onAuthStateChange` double-fire can be guarded with a ref.

**Expected savings:** 3 eliminated requests

---

### ⚠️ P3 — Favorites fetched on the Messages page (Lines 13, 16)

**Two calls to `favorites?select=listing_id`** appear during the messages page load. The messages page doesn't display favorites anywhere.

**Root Cause:** Likely a global component (layout provider, navbar, or message notification provider) is fetching favorites regardless of the current page.

**Fix:** Conditionally fetch favorites only on pages that need them (listings, homepage), or lazy-load the favorites context.

**Expected savings:** 2 eliminated requests, ~500ms faster on messages page

---

### ⚠️ P4 — Full conversation list reload after sending a message (Lines 32-34)

After inserting the "testing" message (line 28), the `conversation-list.tsx` Realtime subscription triggers a full `fetchConversations()` reload (lines 32-34), which:
1. Calls `supabase.auth.getUser()` again (line 31)
2. Re-fetches all chats with joins (line 32)
3. Re-fetches unread counts (line 33)
4. Re-fetches last message previews (line 34)

**The conversation list already has an optimistic update** in `conversation-list.tsx` lines 51-81 that handles INSERTs! But the issue is that the `subscribeToChat` callback in `MessageView` might also process this INSERT (via the `chat:${chatId}` channel), triggering additional state updates that cascade into re-fetches.

Looking at the code in `conversation-list.tsx` line 51:
```ts
if (payload.eventType === 'INSERT') { /* optimistic update */ }
```

This correctly handles INSERT optimistically. But then `mark_messages_read` is called after adding the message to state (line 49 in `message-view.tsx`), which fires an UPDATE event on the messages table, and the conversation list subscription catches all `*` events (line 45), and for UPDATEs it falls through to line 84: `loadConversations(true)` — triggering a full reload.

**Fix:** Filter the UPDATE handler to only reload when relevant (e.g., when `is_read` changes for messages in chats the user participated in), or debounce the reload to batch multiple rapid events.

**Expected savings:** 3 eliminated requests after each message send

---

### ℹ️ P5 — Sender profile fetched after own message send (Line 29)

After the user sends "testing", the `subscribeToChat` handler (line 207 of `use-messages.ts`) fires and fetches the sender's profile:
```ts
const { data: sender } = await supabase.from('users').select('...').eq('id', payload.new.sender_id);
```

For the user's **own** message, this is unnecessary — the sender is the current user, whose profile is already in `AuthContext.userProfile`.

**Fix:** Skip the sender profile fetch if `payload.new.sender_id === currentUserId`.

---

## 3. Request Count Summary

| Phase | Requests | Unique Needed | Redundant |
|-------|----------|---------------|-----------|
| Page Load & Auth | 9 | 4 | 5 |
| Chat Data Fetch | 17 | 7 | 10 |
| Send Message | 8 | 2 | 6 |
| **Total** | **34** | **13** | **21** |

**62% of all requests are redundant or duplicated.**

---

## 4. Prioritized Action Plan

| Priority | Issue | Requests Saved | Time Saved | Effort |
|----------|-------|----------------|------------|--------|
| **P0** | Stop calling `getUser()` in hooks — use `user.id` from `useAuth()` | 6 | ~1.6s | Low |
| **P1** | Guard against double-mount / deduplicate hook instances | 5 | ~1.4s | Medium |
| **P2** | Use centralized `userProfile` from AuthContext everywhere | 3 | ~0.8s | Low |
| **P3** | Don't fetch favorites on messages page | 2 | ~0.5s | Low |
| **P4** | Don't full-reload conversation list after own message send | 3 | ~0.8s | Medium |
| **P5** | Skip sender fetch for own messages | 1 | ~0.3s | Low |
| **Total** | | **20** | **~5.4s** | |

---

## 5. Architecture Note: Dual Realtime Channels

The messaging system currently uses **two parallel Realtime mechanisms** for the same chat:

1. **Broadcast channel** (`use-realtime-chat.tsx` line 34): `supabase.channel(roomName)` — Supabase Broadcast for instant delivery to connected clients. Used for the live typing/sending experience.

2. **Postgres Changes channel** (`use-messages.ts` line 197): `supabase.channel('chat:${chatId}')` — Subscribes to INSERT events on the `messages` table. Used for DB-level persistence confirmation.

Additionally, `conversation-list.tsx` subscribes to a **third channel** (`conversation-list-updates`) watching ALL messages table changes, and `use-message-notifications.tsx` subscribes to a **fourth channel** (`message-notifications`) also watching ALL message INSERTs.

**That's 4 Realtime channels active for a single open chat.**

This is not necessarily a bug — each serves a purpose — but it contributes to the cascade of events after a single message send. The INSERT from `sendMessage` triggers:
1. Broadcast → instant local display ✅
2. `chat:${chatId}` channel → fetches sender + `getUser()` → adds to state again
3. `conversation-list-updates` → triggers optimistic update, then `mark_messages_read` → triggers UPDATE event → triggers full `fetchConversations()` reload
4. `message-notifications` → checks if sender is self → exits (correct)

Consider consolidating channels 2 and 3, or using a shared event bus to prevent cascading side effects.
