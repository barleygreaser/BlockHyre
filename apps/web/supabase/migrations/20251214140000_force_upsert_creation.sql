-- Force creation of upsert_conversation with 3 args
-- We drop explicitly to ensure no conflict

DROP FUNCTION IF EXISTS public.upsert_conversation(uuid, uuid);
DROP FUNCTION IF EXISTS public.upsert_conversation(uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION public.upsert_conversation(
    owner_id_in uuid,
    renter_id_in uuid,
    listing_id_in uuid
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    chat_id_out uuid;
BEGIN
    SELECT id
    INTO chat_id_out
    FROM public.chats
    WHERE 
        owner_id = owner_id_in AND
        renter_id = renter_id_in AND
        listing_id = listing_id_in;

    IF chat_id_out IS NULL THEN
        INSERT INTO public.chats (owner_id, renter_id, listing_id)
        VALUES (owner_id_in, renter_id_in, listing_id_in)
        RETURNING id INTO chat_id_out;
    END IF;

    RETURN chat_id_out;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.upsert_conversation(uuid, uuid, uuid) TO authenticated;
