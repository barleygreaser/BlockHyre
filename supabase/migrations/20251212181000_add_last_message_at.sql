-- Add last_message_at column and update trigger for chat sorting

-- 1. Add last_message_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chats' 
        AND column_name = 'last_message_at'
    ) THEN
        ALTER TABLE public.chats ADD COLUMN last_message_at timestamptz;
        -- Initialize with created_at for existing chats
        UPDATE public.chats SET last_message_at = created_at WHERE last_message_at IS NULL;
        RAISE NOTICE 'Added last_message_at column';
    END IF;
END $$;

-- 2. Create index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON public.chats(last_message_at DESC);

-- 3. Update the trigger function to also update last_message_at
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET 
        last_message_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Drop old trigger if exists and recreate
DROP TRIGGER IF EXISTS update_chat_timestamp_trigger ON public.messages;
DROP TRIGGER IF EXISTS on_message_insert ON public.messages;

CREATE TRIGGER on_message_insert
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();
