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

async function findChat() {
    console.log('Finding a chat...');
    const { data, error } = await supabase
        .from('chats')
        .select('id, owner_id')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Chat found:', data[0]);
    }
}

findChat();
