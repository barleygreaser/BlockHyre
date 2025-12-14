-- Add recipient_id to messages to support segregated visibility
ALTER TABLE public.messages
ADD COLUMN recipient_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update the secure RPC to accept recipient_id
-- We DROP first to change signature
DROP FUNCTION IF EXISTS public.send_system_message(uuid, text, uuid);

CREATE OR REPLACE FUNCTION public.send_system_message(
    p_chat_id uuid,
    p_content text,
    p_sender_id uuid,
    p_recipient_id uuid DEFAULT NULL -- Optional, null means visible to all (or logic handled by query)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.messages (
        chat_id,
        sender_id,
        content,
        message_type,
        is_read,
        recipient_id
    ) VALUES (
        p_chat_id,
        p_sender_id,
        p_content,
        'system',
        false,
        p_recipient_id
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_system_message(uuid, text, uuid, uuid) TO authenticated;
