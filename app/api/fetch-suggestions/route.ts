import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type"); // 'brand' or 'tool'
    const brandFilter = searchParams.get("brandFilter");

    if (!query || query.length < 1) {
        return NextResponse.json({ suggestions: [] });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let data, error;

    if (type === 'brand') {
        // Fetch distinct brands matching the query
        // Supabase select doesn't support distinct comfortably on a single column without returning objects.
        // We will fetch matching rows and dedup in memory or use a trick.
        // Actually for simplicity in MVP, let's fetch rows matching brand ilike query.

        // Better: Use .select('brand') and then process.

        const result = await supabase
            .from('tool_suggestions')
            .select('brand')
            .ilike('brand', `%${query}%`)
            .limit(20);

        if (result.error) {
            console.error("Brand fetch error:", result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        // Deduplicate brands
        const distinctBrands = Array.from(new Set(result.data.map((item: any) => item.brand)));
        // Map to format
        data = distinctBrands.map(b => ({ brand: b }));

    } else {
        // Fetch tools, optionally filtered by brand
        let dbQuery = supabase
            .from('tool_suggestions')
            .select('*')
            .ilike('tool_name', `%${query}%`)
            .limit(20);

        if (brandFilter) {
            dbQuery = dbQuery.ilike('brand', brandFilter);
        }

        const result = await dbQuery;
        error = result.error;
        data = result.data;
    }

    if (error) {
        console.error("Suggestion fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions: data || [] });
}
