-- Migration: Consolidate chats so there is one chat per user pair (owner+renter),
-- regardless of which listing the inquiry is about.
-- listing_id is kept as optional context but is no longer part of the lookup key.

-- 1. Drop old versions of upsert_conversation
DROP FUNCTION IF EXISTS public.upsert_conversation(uuid, uuid);
DROP FUNCTION IF EXISTS public.upsert_conversation(uuid, uuid, uuid);

-- 2. Create new upsert_conversation that matches on (owner_id, renter_id) only
CREATE OR REPLACE FUNCTION public.upsert_conversation(
    owner_id_in uuid,
    renter_id_in uuid,
    listing_id_in uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    chat_id_out uuid;
BEGIN
    -- Look up existing chat by user pair only (ignore listing_id)
    SELECT id
    INTO chat_id_out
    FROM public.chats
    WHERE
        owner_id = owner_id_in AND
        renter_id = renter_id_in
    ORDER BY created_at ASC
    LIMIT 1;

    IF chat_id_out IS NOT NULL THEN
        -- Optionally update listing_id to reflect the latest inquiry
        IF listing_id_in IS NOT NULL THEN
            UPDATE public.chats
            SET listing_id = listing_id_in,
                updated_at = now()
            WHERE id = chat_id_out;
        END IF;

        RETURN chat_id_out;
    END IF;

    -- No existing chat found — create one
    INSERT INTO public.chats (owner_id, renter_id, listing_id)
    VALUES (owner_id_in, renter_id_in, listing_id_in)
    RETURNING id INTO chat_id_out;

    RETURN chat_id_out;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_conversation(uuid, uuid, uuid) TO authenticated;

-- 3. Add a unique constraint on (owner_id, renter_id) to enforce one-chat-per-pair
-- First, deduplicate existing chats: keep the oldest, reassign messages from dupes, then delete dupes
DO $$
DECLARE
    rec RECORD;
    keeper_id uuid;
BEGIN
    -- Find all (owner_id, renter_id) pairs that have more than one chat
    FOR rec IN
        SELECT owner_id, renter_id
        FROM public.chats
        GROUP BY owner_id, renter_id
        HAVING COUNT(*) > 1
    LOOP
        -- Get the oldest chat (the one to keep)
        SELECT id INTO keeper_id
        FROM public.chats
        WHERE owner_id = rec.owner_id AND renter_id = rec.renter_id
        ORDER BY created_at ASC
        LIMIT 1;

        -- Move all messages from duplicate chats to the keeper
        UPDATE public.messages
        SET chat_id = keeper_id
        WHERE chat_id IN (
            SELECT id FROM public.chats
            WHERE owner_id = rec.owner_id
              AND renter_id = rec.renter_id
              AND id != keeper_id
        );

        -- Delete the duplicate chats
        DELETE FROM public.chats
        WHERE owner_id = rec.owner_id
          AND renter_id = rec.renter_id
          AND id != keeper_id;
    END LOOP;
END $$;

-- Now add the unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_chats_owner_renter'
    ) THEN
        ALTER TABLE public.chats
        ADD CONSTRAINT uq_chats_owner_renter UNIQUE (owner_id, renter_id);
    END IF;
END $$;
