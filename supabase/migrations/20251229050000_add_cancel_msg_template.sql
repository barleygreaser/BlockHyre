-- Add RENTAL_CANCELLED system message template
-- Used when a renter cancels a booking

INSERT INTO public.system_message_templates (event_name, template_body)
VALUES (
    'RENTAL_CANCELLED',
    '{
        "type": "cancellation",
        "title": "Rental Cancelled",
        "content": "The rental request for **{{listing_title}}** has been cancelled by **{{renter_name}}**.",
        "metadata": {
            "rental_id": "{{rental_id}}",
            "listing_id": "{{listing_id}}",
            "cancelled_at": "{{cancelled_at}}"
        },
        "actions": [
            {
                "label": "View Details",
                "url": "/dashboard"
            }
        ]
    }'::jsonb
)
ON CONFLICT (event_name) 
DO UPDATE SET template_body = EXCLUDED.template_body;
