-- RPC function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_chat_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET is_read = true
  WHERE chat_id = p_chat_id
  AND sender_id != auth.uid()
  AND is_read = false;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_messages_read(uuid) TO authenticated;

COMMENT ON FUNCTION mark_messages_read IS 'Marks all unread messages in a chat as read for the current user';
