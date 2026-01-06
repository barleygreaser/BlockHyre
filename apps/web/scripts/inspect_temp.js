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

async function inspect() {
    console.log('Checking for recipient_id in messages...');
    const { data, error } = await supabase
        .from('messages')
        .select('recipient_id')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Result:', JSON.stringify(data, null, 2));
    }
}

inspect();
