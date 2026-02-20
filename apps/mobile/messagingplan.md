# Messaging Implementation Plan (Mobile App)

## Phase 1: Synchronization & Data Layer (Foundation)

**Objective**: Harmonize the mobile application's data structures with the existing Supabase schema and web app logic, establishing a robust foundation for real-time messaging.

### Step 1.1: Standardize Types & Interfaces
-   Define `Chat` and `Message` interfaces in a shared location, reflecting the updated Supabase schema (`public.chats`, `public.messages`).
-   Include relational fields essential for UI rendering (e.g., `listing:listing_id`, `owner:owner_id`, `renter:renter_id`).

### Step 1.2: Create `useMessages` Hook (`apps/mobile/hooks/use-messages.ts`)
-   **Fetch Inbox**: Implement `fetchConversations` to retrieve a unified list of chats for the current user, joined with necessary user profiles and listing titles. Sort by `last_message_at`.
-   **Unread Count**: Batch fetch unread message counts to optimize network requests.
-   **Fetch History**: Implement `fetchMessages(chatId)` to load message history for a specific chat.
-   **Send Message**: Implement `sendMessage(chatId, content)` that inserts a new record into `public.messages`.
-   **Real-time Subscription**: Implement `subscribeToChat(chatId, callback)` utilizing Supabase's `postgres_changes` to listen for new messages instantly.
-   **Read Receipts**: Implement `markMessagesAsRead(chatId)` invoking the `mark_messages_read` RPC.

### Step 1.3: Update Supabase Types (Optional but Recommended)
-  If a `types/supabase.ts` or similar auto-generated file exists, ensure it matches the latest schema migrations to prevent typing errors during development.

---

## Phase 2: Premium UI/UX (Native Experience)

**Objective**: Revamp the existing placeholder screens (`messages.tsx` and `chat/[id].tsx`) to provide a high-quality native experience using modern layout and animation patterns.

### Step 2.1: Inbox UI Refactoring (`apps/mobile/app/(tabs)/messages.tsx`)
-   Integrate the new `useMessages` hook to fetch and display real `Chat` data.
-   Implement Liquid Glass design elements (translucent headers, sleek lists).
-   Add custom Skeletons (`InboxSkeleton`) for loading states.
-   Include Unread specific styling (e.g., bold text, unread badges).

### Step 2.2: Chat View Refactoring (`apps/mobile/app/chat/[id].tsx`)
-   Properly integrate `react-native-gifted-chat` replacing the mocked current logic.
-   Feed real data from the `useMessages` hook into the chat view.
-   Implement the `onSend` callback utilizing the hook's `sendMessage` function.
-   Set up real-time updates seamlessly.
-   Create a custom rendering view for **System Messages** (distinguishing standard text from automated platform updates).

---

## Phase 3: Integration (Contextual Flow)

**Objective**: Connect the messaging functionality to the rest of the application, particularly the tools discovery flow.

### Step 3.1: Listing Inquiry Connection (`apps/mobile/app/listings/[id].tsx`)
-   Modify the "Message User" or "Rent" button on the Listing Detail screen.
-   On tap, call the `upsert_conversation` RPC to either find an existing chat or create a new contextual chat thread between the Renter and Owner.
-   Navigate the user directly to the new (or existing) chat view (`/chat/[chatId]`).

### Step 3.2: Edge Cases & Polish
-   Handle scenario where User is not logged in (prompt login).
-   Ensure keyboard avoidance is functioning perfectly within the chat screen.
-   Test pull-to-refresh implementations.
