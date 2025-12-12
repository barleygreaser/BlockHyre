-- Update RLS policies to properly allow owner and renter to see chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own chats" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

-- Create new policies using owner_id and renter_id
CREATE POLICY "Users can view chats where they are owner or renter"
ON public.chats FOR SELECT
USING (auth.uid() = owner_id OR auth.uid() = renter_id);

CREATE POLICY "Users can create chats where they are owner or renter"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = owner_id OR auth.uid() = renter_id);

-- Also update message policies to work with the new chat structure
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.messages;

CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = messages.chat_id
        AND (chats.owner_id = auth.uid() OR chats.renter_id = auth.uid())
    )
);

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
