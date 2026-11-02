const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
    console.log('Fetching Barley profile...');
    const { data: barley, error: bErr } = await supabase
        .from('users')
        .select('id, neighborhood_id')
        .eq('email', 'barley@usbc.be')
        .single();
    
    if (bErr) throw bErr;
    console.log('Barley:', barley);

    let lat = 34.0924;
    let lon = -84.5097;

    if (barley.neighborhood_id) {
        console.log('Fetching neighborhood center...');
        const { data: n, error: nErr } = await supabase
            .from('neighborhoods')
            .select('center_lat, center_lon')
            .eq('id', barley.neighborhood_id)
            .single();
        if (n) {
            lat = n.center_lat;
            lon = n.center_lon;
            console.log('Center:', lat, lon);
        }
    }

    const chrisId = '057291df-d626-43c8-85a2-de78acbf6d5a';

    console.log('Finding a listing to update...');
    const { data: listings } = await supabase
        .from('listings')
        .select('id, title')
        .eq('title', 'Table Saw') // Specific target we've been using
        .limit(1);
    
    if (listings && listings[0]) {
        const l = listings[0];
        console.log(`Updating "${l.title}" to be owned by Chris and Instant...`);
        const { error } = await supabase
            .from('listings')
            .update({
                booking_type: 'instant',
                latitude: lat,
                longitude: lon,
                owner_id: chrisId,
                status: 'active'
            })
            .eq('id', l.id);
        
        if (error) console.error(error);
        else console.log('Fixed!');
    } else {
        console.log('No listing found.');
    }

}

fix();
