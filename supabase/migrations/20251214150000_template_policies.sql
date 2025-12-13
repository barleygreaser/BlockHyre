-- Enable RLS just in case (good practice, though usually enabled by default)
ALTER TABLE public.system_message_templates ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public templates)
CREATE POLICY "Allow public read access" 
ON public.system_message_templates 
FOR SELECT 
USING (true);

-- Or if you prefer authenticated only:
-- CREATE POLICY "Allow authenticated read access" 
-- ON public.system_message_templates 
-- FOR SELECT 
-- TO authenticated
-- USING (true);
