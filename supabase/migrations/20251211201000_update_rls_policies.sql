-- Ensure RLS policies allow message sending
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;

-- Policy: Users can view messages in chats they participate in
CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.owner_id = auth.uid() OR chats.renter_id = auth.uid())
    )
);

-- Policy: Users can send messages to chats they participate in
CREATE POLICY "Users can send messages to their chats"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.owner_id = auth.uid() OR chats.renter_id = auth.uid())
    )
);

-- Policy: Users can update read status of messages in their chats
CREATE POLICY "Users can update message read status"
ON public.messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.owner_id = auth.uid() OR chats.renter_id = auth.uid())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.owner_id = auth.uid() OR chats.renter_id = auth.uid())
    )
);

-- Also ensure chats table has correct RLS policies
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

-- Policy: Users can view chats they participate in
CREATE POLICY "Users can view their own chats"
ON public.chats FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = renter_id);

-- Policy: Users can create chats where they are a participant
CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = owner_id OR auth.uid() = renter_id);
