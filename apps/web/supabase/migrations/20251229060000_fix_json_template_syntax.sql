-- Fix JSON Syntax for Conditional Template
-- The user wants to use Liquid-style text which is NOT valid JSON unless stringified.
-- However, our system expects `template_body` to be JSONB if it's stored in a jsonb column.
-- If the user wants plain text conditionals, we need to structure the JSON differently.

-- BUT, the `cancel_rental_request` RPC currently does naive string replacement:
-- v_message_content := v_template::text;
-- v_message_content := REPLACE(v_message_content, ...);

-- If the template contains complex logic like {% if %}, the Postgres REPLACE function won't parse it.
-- The error "invalid input syntax for type json" happens because the user likely stored a raw string 
-- into the JSONB column or tried to cast infinite formatted text as JSON.

-- The proper fix is to store the complicated structure as a valid JSON string inside the JSONB, 
-- OR simplify the strategy.

-- OPTION A: Store the template as a simple string inside the JSON object's "content" field.
-- OPTION B: The RPC logic needs to be smarter to handle 'recipient_role'.

-- Given the user's request, they want dynamic content based on who sees it.
-- However, `send_system_message` sends a SINGLE message to the chat.
-- Chat messages are shared history. If we send one message, it's the same text for both parties.
-- You cannot have "different text" for the same message ID for different users unless resolved on the frontend.

-- RECOMMENDATION: Send a neutral message that makes sense for both, OR sending the "content" as the Markdown provided
-- and letting the Frontend render it?
-- The error `invalid input syntax` suggests the INSERT command itself failed or the RPC casting failed.

-- Let's update the template to be a valid JSONB object where the "content" field contains the conditional text.
-- We must escape newlines and quotes correctly.

INSERT INTO public.system_message_templates (event_name, template_body)
VALUES (
    'RENTAL_CANCELLED',
    jsonb_build_object(
        'type', 'cancellation',
        'title', 'Rental Cancelled',
        'content', '{% if recipient_role == ''owner'' %}
    ❌ **Rental Cancelled:** The rental request for **{{ listing_title }}** has been cancelled by **{{ renter_name }}**.
    
    The tool is now back in your inventory and available for other renters to book.
    
{% elif recipient_role == ''renter'' %}

    ❌ **Rental Cancelled:** Your request for the **{{ listing_title }}** has been successfully cancelled.
    
    No charges have been processed for this request.
    
{% endif %}',
        'metadata', jsonb_build_object(
            'rental_id', '{{rental_id}}',
            'listing_id', '{{listing_id}}',
            'cancelled_at', '{{cancelled_at}}'
        ),
        'actions', jsonb_build_array(
            jsonb_build_object(
                'label', 'View Details',
                'url', '/dashboard'
            )
        )
    )
)
ON CONFLICT (event_name) 
DO UPDATE SET template_body = EXCLUDED.template_body;
