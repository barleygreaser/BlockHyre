-- Clean up unused RENTAL_CANCELLED template
-- The final implementation sends two hardcoded messages instead of using a template

DELETE FROM public.system_message_templates
WHERE event_name = 'RENTAL_CANCELLED';
