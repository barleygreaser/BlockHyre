-- Update send_system_message to accept recipient_id parameter
-- The helper function passes 4 params but the RPC only accepts 3

CREATE OR REPLACE FUNCTION send_system_message(
    p_chat_id uuid,
    p_content text,
    p_sender_id uuid,
    p_recipient_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.messages (
        chat_id,
        sender_id,
        recipient_id,
        content,
        message_type,
        is_read
    ) VALUES (
        p_chat_id,
        p_sender_id,
        p_recipient_id,
        p_content,
        'system',
        false
    );
END;
$$;

-- Update grant to include the new signature
GRANT EXECUTE ON FUNCTION send_system_message(uuid, text, uuid, uuid) TO authenticated;
-- Keep old signature for backwards compatibility
GRANT EXECUTE ON FUNCTION send_system_message(uuid, text, uuid) TO authenticated;
