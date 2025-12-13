-- Fix syntax error in template: LiquidJS uses 'elsif', not 'elif'

UPDATE public.system_message_templates
SET template_body = REPLACE(template_body, '{% elif ', '{% elsif ')
WHERE event_name = 'LISTING_INQUIRY';
