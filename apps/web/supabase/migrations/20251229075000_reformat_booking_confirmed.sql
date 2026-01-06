-- Fix BOOKING_CONFIRMED template formatting to match RENTAL_REQUEST_SUBMITTED
-- Remove leading spaces and ensure consistent markdown formatting

UPDATE public.system_message_templates
SET template_body = '{% if recipient_role == ''renter'' %}
🎉 **Rental Confirmed!** Your booking for the **{{ tool_name }}** from {{ owner_name }} is confirmed for {{ start_date }} to {{ end_date }}.

**Pickup Location:** {{ location_address }}
**Total Paid:** ${{ total_paid }}

{% elif recipient_role == ''owner'' %}
✅ **New Booking Confirmed!** The **{{ tool_name }}** has been rented by {{ renter_name }} for the period {{ start_date }} to {{ end_date }}.

Please prepare the tool for pickup at {{ pickup_time }}.

**Total Earnings:** ${{ owner_earnings }}

{% endif %}'
WHERE event_name = 'BOOKING_CONFIRMED';
