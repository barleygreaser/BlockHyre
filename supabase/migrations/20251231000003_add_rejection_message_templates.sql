-- Add system message templates for rental request rejections
-- These templates handle both manual owner rejection and automatic denial

-- Template 1: Manual rejection by owner
INSERT INTO public.system_message_templates (event_name, template_body, description)
VALUES (
  'RENTAL_REQUEST_REJECTED',
  $${% if recipient_role == 'owner' %}
📋 **Request Declined** - You have declined the rental request from {{ renter_name }} for the **{{ tool_name }}**.

**Declined Period:** {{ start_date }} to {{ end_date }}

The renter has been notified of your decision.
{% elsif recipient_role == 'renter' %}
❌ **Request Declined** - Unfortunately, {{ owner_name }} has declined your rental request for the **{{ tool_name }}**.

**Requested Period:** {{ start_date }} to {{ end_date }}

Feel free to browse other available tools or contact the owner for more information.
{% endif %}$$,
  'Sent to both owner and renter when owner manually declines a rental request'
)
ON CONFLICT (event_name) DO UPDATE
SET template_body = EXCLUDED.template_body,
    description = EXCLUDED.description;

-- Template 2: Automatic denial after 24 hours
INSERT INTO public.system_message_templates (event_name, template_body, description)
VALUES (
  'RENTAL_REQUEST_AUTO_DENIED',
  $${% if recipient_role == 'owner' %}
⏰ **Request Auto-Denied** - The rental request from {{ renter_name }} for the **{{ tool_name }}** was automatically declined due to no response within 24 hours.

**Period:** {{ start_date }} to {{ end_date }}

To avoid automatic denials, please respond to rental requests promptly.
{% elsif recipient_role == 'renter' %}
⏰ **Request Expired** - Your rental request for the **{{ tool_name }}** from {{ owner_name }} has been automatically declined as the owner did not respond within 24 hours.

**Requested Period:** {{ start_date }} to {{ end_date }}

You may submit a new request or browse other available tools.
{% endif %}$$,
  'Sent to both owner and renter when a rental request is automatically denied after 24 hours of no response'
)
ON CONFLICT (event_name) DO UPDATE
SET template_body = EXCLUDED.template_body,
    description = EXCLUDED.description;
