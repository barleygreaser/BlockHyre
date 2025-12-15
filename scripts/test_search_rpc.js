const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars
const envPath = path.resolve(__dirname, '..', '.env.local');
// Try .env.local first, if not exists, try .env
let envContent;
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    const envPathBackup = path.resolve(__dirname, '..', '.env');
    try {
        envContent = fs.readFileSync(envPathBackup, 'utf8');
    } catch (e2) {
        console.error("Could not find .env.local or .env");
        process.exit(1);
    }
}

const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error("Missing URL or KEY in env");
    process.exit(1);
}

const supabase = createClient(url, key);

async function testSearchRpc() {
    console.log('Testing RPC search_nearby_listings...');

    const params = {
        user_lat: 34.0522,
        user_long: -118.2437,
        radius_miles: 50,
        min_price: 0,
        max_price: 1000,
        category_filter: null
    };

    console.log("Calling with params:", params);

    const { data, error } = await supabase.rpc('search_nearby_listings', params);

    if (error) {
        console.error('RPC Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('RPC Success:', data);
    }
}

testSearchRpc();
