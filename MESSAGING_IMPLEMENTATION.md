# Messaging System Implementation Summary

## Overview
Implemented a complete messaging system with proper tool/owner/renter linking and context.

## Database Schema

### Tables
- **public.chats**: Conversations between users about specific tools
  - `id` (uuid, PK)
  - `listing_id` (uuid, FK → listings) - The tool being discussed
  - `user_one_id` (uuid, FK → users) - First user (sorted)
  - `user_two_id` (uuid, FK → users) - Second user (sorted)
  - `created_at`, `updated_at` (timestamptz)

- **public.messages**: Individual messages within chats
  - `id` (uuid, PK)
  - `chat_id` (uuid, FK → chats)
  - `sender_id` (uuid, FK → users)
  - `content` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

### RPC Functions

#### `upsert_conversation(p_tool_id uuid, p_renter_id uuid)`
**Purpose**: Find or create a conversation between a renter and tool owner

**Logic**:
1. Gets the tool owner from `listings.owner_id`
2. Prevents self-messaging (owner = renter)
3. Ensures consistent user ordering (user_one_id < user_two_id)
4. Checks if conversation exists for (tool_id, user_one, user_two)
5. Returns existing chat_id OR creates new chat and returns new chat_id

**Security**: `SECURITY DEFINER` with `authenticated` role access

## Client-Side Flow

### Step A: Renter Clicks "Contact Owner"
**Location**: `/app/listings/[id]/[slug]/page.tsx`

```typescript
const handleContactOwner = async () => {
    if (!user) {
        toast.error('Please log in to contact the owner');
        router.push('/auth');
        return;
    }

    try {
        const chatId = await upsertConversation(listing.id);
        if (chatId) {
            router.push(`/messages?id=${chatId}`);
        }
    } catch (error) {
        toast.error('Failed to contact owner');
    }
};
```

### Step B: Find/Create Chat
**Location**: `/app/lib/chat-helpers.ts`

```typescript
export async function upsertConversation(toolId: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase.rpc('upsert_conversation', {
        p_tool_id: toolId,
        p_renter_id: user.id
    });

    return data; // Returns chat_id
}
```

### Step C: Navigate to Chat
**Action**: `router.push('/messages?id=' + chatId)`

Navigates to the messaging center with the specific chat selected via URL query parameter.

### Step D: Fetch Conversation Details
**Location**: `/app/hooks/use-messages.ts`

```typescript
const { data: chats } = await supabase
    .from('chats')
    .select(`
        *,
        listing:listing_id(title, daily_price, images),
        user_one:user_one_id(id, full_name, profile_photo_url),
        user_two:user_two_id(id, full_name, profile_photo_url)
    `)
    .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`)
    .order('updated_at', { ascending: false });
```

**Returns**:
- Chat metadata (id, created_at, updated_at)
- Tool details (title, price, images)
- Owner profile (name, photo)
- Renter profile (name, photo)
- Last message content and timestamp
- Unread message count

## Real-Time Features

### Message Subscriptions
**Location**: `/app/hooks/use-messages.ts → subscribeToChat()`

```typescript
const channel = supabase
    .channel(`chat:${chatId}`)
    .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
    }, (payload) => {
        onMessage(payload.new);
    })
    .subscribe();
```

### Auto-Mark as Read
Messages are automatically marked as read when:
1. User opens a chat (`markMessagesAsRead` called on mount)
2. New message arrives from other user (checked in real-time handler)

## Security (RLS Policies)

### Chats Table
- **SELECT**: Users can view chats they participate in
- **INSERT**: Users can create chats where they are a participant

### Messages Table
- **SELECT**: Users can view messages in their chats
- **INSERT**: Users can send messages to their chats (must be sender)
- **UPDATE**: Users can update read status in their chats

## UI Components

### Conversation List
**File**: `/app/components/messages/conversation-list.tsx`
- Shows all user's conversations
- Displays tool title, other user name/photo
- Shows last message preview
- Unread badge count
- Click to select conversation

### Message View
**File**: `/app/components/messages/message-view.tsx`
- Displays message history
- Real-time message updates
- Auto-scroll to bottom
- Sticky input form
- Send button with loading state

### Message Bubble
**File**: `/app/components/messages/message-bubble.tsx`
- Distinct styling for sender/receiver
- User avatar
- Timestamp
- Smooth animations

## Next Steps: Real-Time Notifications
- [ ] Add notification badge to navbar Messages link
- [ ] Show total unread count across all chats
- [ ] Browser notifications for new messages
- [ ] Sound alerts (optional)
- [ ] Push notifications (future)
