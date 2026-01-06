import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Create Supabase client with service role key for admin access
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Step 1: Send expiring warnings (< 2 hours remaining)
        const { data: warningsData, error: warningsError } = await supabase.rpc('send_expiring_rental_warnings');

        if (warningsError) {
            console.error('Error sending expiring warnings:', warningsError);
            // Continue to auto-denial even if warnings fail
        } else {
            console.log('Expiring warnings sent:', warningsData?.length || 0);
        }

        // Step 2: Call the auto-denial function
        const { error } = await supabase.rpc('auto_deny_expired_rentals');

        if (error) {
            console.error('Error running auto-denial:', error);
            return new Response(
                JSON.stringify({ error: error.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            );
        }

        // Return success
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Auto-denial check completed',
                timestamp: new Date().toISOString()
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});
