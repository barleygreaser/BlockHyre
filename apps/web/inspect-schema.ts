import { supabase } from './lib/supabase'

async function inspectSchema() {
    console.log('Inspecting system_messages_template table...\n')

    // Query the table structure
    const { data, error } = await supabase
        .from('system_messages_template')
        .select('*')
        .limit(10)

    if (error) {
        console.error('Error querying table:', error.message)
        console.error('Full error:', error)
        return
    }

    console.log('Sample rows from system_messages_template:')
    console.log(JSON.stringify(data, null, 2))

    // Get all column names
    if (data && data.length > 0) {
        console.log('\n\nColumn names:')
        console.log(Object.keys(data[0]))
    } else {
        console.log('\nNo rows found in table')
    }
}

inspectSchema()
