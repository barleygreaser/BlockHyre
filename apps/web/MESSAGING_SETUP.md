# Messaging Center - Database Setup

## Apply the Migration

You need to apply the database migration to create the `chats` and `messages` tables.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251211120500_create_messaging_schema.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI (if configured)

```bash
# Set your database password
$env:SUPABASE_DB_PASSWORD="your-database-password"

# Push the migration
npx supabase db push
```

## Verify the Migration

After running the migration, verify that the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('chats', 'messages');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('chats', 'messages');
```

## Test the Messaging Feature

1. Navigate to `/messages` in your browser
2. You should see the messaging center UI
3. To test with real data, you can insert a test chat:

```sql
-- Create a test chat (replace UUIDs with actual user IDs and listing ID)
INSERT INTO public.chats (listing_id, user_one_id, user_two_id)
VALUES (
  'your-listing-id',
  'user-1-id',
  'user-2-id'
);

-- Send a test message
INSERT INTO public.messages (chat_id, sender_id, content)
VALUES (
  'the-chat-id-from-above',
  'user-1-id',
  'Hello! Is this tool still available?'
);
```

## Features Implemented

✅ Two-pane responsive layout (mobile + desktop)
✅ Conversation list with unread badges
✅ Real-time message updates via Supabase Realtime
✅ Message bubbles with sender/receiver styling
✅ URL state management with Nuqs
✅ Mark messages as read functionality
✅ Row Level Security (RLS) policies
✅ Auto-scroll to newest message
✅ Sticky input form

## Next Steps

- Add typing indicators
- Add message reactions
- Add file/image attachments
- Add message search
- Add conversation archiving
