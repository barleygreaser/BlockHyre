const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRpc() {
    console.log('Testing RPC upsert_conversation...');

    // Use dummy UUIDs
    const dummyId = '00000000-0000-0000-0000-000000000000';

    // We expect this to fail with "Listing not found" or similar from inside the function
    // OR "Could not find the function" if it doesn't exist.
    const { data, error } = await supabase.rpc('upsert_conversation', {
        owner_id_in: dummyId,
        renter_id_in: dummyId,
        listing_id_in: dummyId
    });

    if (error) {
        console.error('RPC Error:', error);
    } else {
        console.log('RPC Success (Unexpected with dummy IDs):', data);
    }
}

testRpc();
