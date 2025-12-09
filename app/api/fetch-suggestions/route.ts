import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    // Initialize Supabase Client (Anon is fine as RLS allows public read)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Perform search
    const { data, error } = await supabase
        .from('tool_suggestions')
        .select('*')
        .or(`brand.ilike.%${query}%,tool_name.ilike.%${query}%`)
        .limit(10);

    if (error) {
        console.error("Suggestion fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions: data });
}
