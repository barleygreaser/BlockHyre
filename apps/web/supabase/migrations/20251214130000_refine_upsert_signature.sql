-- Drop the old function with 2 args
DROP FUNCTION IF EXISTS public.upsert_conversation(uuid, uuid);

-- Create the new function with 3 args (owner_id_in, renter_id_in, listing_id_in)
CREATE OR REPLACE FUNCTION public.upsert_conversation(
    owner_id_in uuid,
    renter_id_in uuid,
    listing_id_in uuid
)
 RETURNS uuid -- Returns the ID of the existing or newly created chat
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    -- Variable to hold the existing or new chat ID
    chat_id_out uuid;
BEGIN
    -- 1. Check for existing chat between these users for this listing
    SELECT id
    INTO chat_id_out
    FROM public.chats
    WHERE 
        owner_id = owner_id_in AND
        renter_id = renter_id_in AND
        listing_id = listing_id_in;

    -- 2. If no chat exists, create a new one
    IF chat_id_out IS NULL THEN
        INSERT INTO public.chats (owner_id, renter_id, listing_id)
        VALUES (owner_id_in, renter_id_in, listing_id_in)
        RETURNING id INTO chat_id_out;
    END IF;

    -- 3. RETURN the Chat ID
    RETURN chat_id_out;
END;
$function$;

-- Ensure the 'authenticated' role can execute this function via RPC
GRANT EXECUTE ON FUNCTION public.upsert_conversation(uuid, uuid, uuid) TO authenticated;
