const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        persistSession: false
    }
});

async function findListings() {
    console.log('Querying database listings...\n');

    // Fetch listings
    const { data: listings, error } = await supabase
        .from('listings')
        .select('id, title, owner_id, booking_type, daily_price')
        .limit(20);

    if (error) {
        console.error('Error fetching listings:', error.message);
        return;
    }

    console.log('Listings found:');
    console.log(JSON.stringify(listings, null, 2));
}

findListings();
