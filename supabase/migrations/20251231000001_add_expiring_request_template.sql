-- Add system message template for when rental requests are expiring (< 2 hours remaining)
-- This sends a notification ONLY to the owner to prompt urgent action

INSERT INTO public.system_message_templates (event_name, template_body, description)
VALUES (
  'RENTAL_REQUEST_EXPIRING',
  '{% if recipient_role == ''owner'' %}
⚠️ **Urgent: Rental Request Expiring Soon!**

{{ renter_name }} is waiting for your response on their rental request for the **{{ tool_name }}**.

**Time Remaining:** Less than 2 hours before auto-denial
**Requested Period:** {{ start_date }} to {{ end_date }}
**Potential Earnings:** ${{ owner_revenue }}

Please approve or decline this request promptly to avoid automatic rejection.
{% endif %}',
  'Sent to owner when a rental request has less than 2 hours before automatic denial'
)
ON CONFLICT (event_name) DO UPDATE
SET template_body = EXCLUDED.template_body,
    description = EXCLUDED.description;

-- Add comment for documentation
COMMENT ON TABLE public.system_message_templates IS 'System message templates using Liquid syntax for dynamic content. See docs/system-messages.md for usage.';
