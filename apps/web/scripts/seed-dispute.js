import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

async function seed() {
    // 1. Get an existing owner/renter who has a rental
    const { data: rentals, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .limit(1);

    if (rentalsError || !rentals || rentals.length === 0) {
        console.error('No rentals found to dispute. Error:', rentalsError);
        return;
    }
    const rental = rentals[0];

    // 2. Insert dispute on this rental (reported by owner)
    // Wait, the policy says reporter_id must be auth.uid(), but since we might be using anon key without auth, we'll try it, or we bypass RLS by doing a direct sql insertion. Let's see if we have service key or we can use admin API.

    // Instead of using Supabase-js which requires RLS or Service Key, I'll generate a SQL file and push it with Supabase CLI
}
seed();
