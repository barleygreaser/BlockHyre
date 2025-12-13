import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    try {
        // Query the system_messages_template table
        const { data, error } = await supabase
            .from('system_messages_template')
            .select('*')
            .limit(10)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            data,
            columns: data && data.length > 0 ? Object.keys(data[0]) : [],
            count: data?.length || 0
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
