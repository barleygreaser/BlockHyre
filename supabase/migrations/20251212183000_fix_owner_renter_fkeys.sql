-- Ensure owner_id and renter_id have proper foreign keys to public.users
-- Drop existing if any
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_owner;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS fk_chats_renter;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_owner_id_fkey;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_renter_id_fkey;

-- Add new foreign keys with standard naming
ALTER TABLE public.chats
ADD CONSTRAINT chats_owner_id_fkey
FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.chats
ADD CONSTRAINT chats_renter_id_fkey
FOREIGN KEY (renter_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Verify by listing all constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'chats';
