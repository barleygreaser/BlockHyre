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

async function checkTables() {
    console.log('Checking for tables matching "system_message"...');

    // We can't easily query information_schema with supabase-js client unless we use RPC or have permissions.
    // But we can try to select from the table directly.

    const singular = 'system_messages_template';
    const plural = 'system_message_templates';

    // Check Singular
    const { error: errorSingular } = await supabase.from(singular).select('id').limit(1);
    if (!errorSingular) {
        console.log(`FOUND: ${singular}`);
    } else {
        console.log(`NOT FOUND: ${singular} (${errorSingular.message})`);
    }

    // Check Plural
    const { error: errorPlural } = await supabase.from(plural).select('id').limit(1);
    if (!errorPlural) {
        console.log(`FOUND: ${plural}`);
    } else {
        console.log(`NOT FOUND: ${plural} (${errorPlural.message})`);
    }
}

checkTables();
