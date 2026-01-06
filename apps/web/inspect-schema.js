// Quick script to inspect system_messages_template table
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSchema() {
    console.log('Inspecting system_messages_template table...\n')

    // Query the table structure
    const { data, error } = await supabase
        .from('system_messages_template')
        .select('*')
        .limit(10)

    if (error) {
        console.error('Error querying table:', error.message)
        return
    }

    console.log('Sample rows from system_messages_template:')
    console.log(JSON.stringify(data, null, 2))

    // Get all column names
    if (data && data.length > 0) {
        console.log('\n\nColumn names:')
        console.log(Object.keys(data[0]))
    }
}

inspectSchema()
