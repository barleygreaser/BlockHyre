const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDatabase() {
    console.log('\n=== INSPECTING REMOTE SUPABASE DATABASE ===\n');

    // 1. Check system_messages_template table schema
    console.log('1. Checking system_messages_template schema...\n');
    const { data: schemaData, error: schemaError } = await supabase
        .rpc('exec_sql', {
            query: `
        SELECT 
          column_name, 
          data_type, 
          is_nullable, 
          column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'system_messages_template' 
        ORDER BY ordinal_position;
      `
        });

    if (schemaError) {
        console.error('Error fetching schema (trying direct query):', schemaError.message);
        // Try direct query instead
        const { data: tableData, error: tableError } = await supabase
            .from('system_messages_template')
            .select('*')
            .limit(0);

        if (!tableError) {
            console.log('Table exists! (No schema details available via RPC)\n');
        } else {
            console.error('Table query error:', tableError.message);
        }
    } else {
        console.log('Schema:', JSON.stringify(schemaData, null, 2));
    }

    // 2. Fetch all rows from system_messages_template
    console.log('\n2. Fetching all system_messages_template rows...\n');
    const { data: templateData, error: templateError } = await supabase
        .from('system_messages_template')
        .select('*');

    if (templateError) {
        console.error('Error fetching templates:', templateError.message);
    } else {
        console.log('Templates found:', templateData.length);
        console.log(JSON.stringify(templateData, null, 2));
    }

    // 3. Check messages table structure
    console.log('\n3. Checking messages table schema...\n');
    const { data: messagesSchema, error: messagesSchemaError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);

    if (messagesSchemaError) {
        console.error('Error fetching messages schema:', messagesSchemaError.message);
    } else {
        console.log('Sample message structure:');
        console.log(JSON.stringify(messagesSchema[0] || {}, null, 2));
    }

    // 4. List all message-related tables
    console.log('\n4. Listing all tables with "message" in name...\n');
    const { data: tables, error: tablesError } = await supabase
        .rpc('exec_sql', {
            query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE '%message%' 
        ORDER BY table_name;
      `
        });

    if (tablesError) {
        console.log('Could not list tables via RPC:', tablesError.message);
    } else {
        console.log('Tables:', JSON.stringify(tables, null, 2));
    }

    console.log('\n=== INSPECTION COMPLETE ===\n');
}

inspectDatabase().catch(console.error);
