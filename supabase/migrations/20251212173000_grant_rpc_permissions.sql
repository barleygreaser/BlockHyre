-- Grant execute permission on upsert_conversation to authenticated users
GRANT EXECUTE ON FUNCTION upsert_conversation(uuid, uuid) TO authenticated;
