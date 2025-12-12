-- Add message_type column to distinguish system messages from text messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' NOT NULL;

-- Add constraint to ensure only valid message types
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_type_check;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_type_check 
CHECK (message_type IN ('text', 'system'));

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);
