// Quick script to inspect system_messages_template table
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') })

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
        .limit(5)

    if (error) {
        console.error('Error querying table:', error.message)
        return
    }

    console.log('Sample rows from system_messages_template:')
    console.log(JSON.stringify(data, null, 2))

    // Get all column names
    if (data && data.length > 0) {
        console.log('\nColumn names:')
        console.log(Object.keys(data[0]))
    }
}

inspectSchema()
