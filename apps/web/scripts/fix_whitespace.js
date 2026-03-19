const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    const value = rest.join('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixWhitespace() {
    const { data: templates } = await supabase
        .from('system_message_templates')
        .select('event_name, template_body');

    for (const t of templates) {
        // Strip out leading spaces, tabs from every line
        const fixedBody = t.template_body
            .split('\n')
            .map(line => line.trimLeft())
            .join('\n');

        if (fixedBody !== t.template_body) {
            const { error } = await supabase
                .from('system_message_templates')
                .update({ template_body: fixedBody })
                .eq('event_name', t.event_name);
            if (error) {
                console.error(`Error fixing ${t.event_name}:`, error.message);
            } else {
                console.log(`✅ Fixed whitespace for ${t.event_name}`);
            }
        }
    }
    console.log('Whitespace cleanup complete!');
}

fixWhitespace();
