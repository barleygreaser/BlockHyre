-- Fix BOOKING_CONFIRMED template to use pre-calculated owner_earnings
-- The Liquid template was trying to do math which causes tokenization errors

UPDATE public.system_message_templates
SET template_body = '
{% if recipient_role == ''renter'' %}
    🎉 Rental Confirmed! Your booking for the {{ tool_name }} from {{ owner_name }} is confirmed for {{ start_date }} to {{ end_date }}.
    
    Pickup location: {{ location_address }}. Total Paid: ${{ total_paid }}.
    
{% elif recipient_role == ''owner'' %}

    ✅ New Booking Confirmed! The {{ tool_name }} has been rented by {{ renter_name }} for the period {{ start_date }} to {{ end_date }}.
    
    Please prepare the tool for pickup at {{ pickup_time }}. 
    **Total Earnings:** ${{ owner_earnings }}.
    
{% endif %}
        '
WHERE event_name = 'BOOKING_CONFIRMED';
