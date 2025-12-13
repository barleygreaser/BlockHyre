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
    console.log('Checking for function send_system_message...');
    const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_name', 'send_system_message')
        .eq('routine_schema', 'public');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Result:', JSON.stringify(data, null, 2));
    }
}

inspect();
