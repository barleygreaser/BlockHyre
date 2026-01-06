-- Drop the old tool_id foreign key constraint
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_tool_id_fkey;

-- Verify we only have one constraint pointing to listings now
-- The remaining chats_listing_id_fkey should be the only one
