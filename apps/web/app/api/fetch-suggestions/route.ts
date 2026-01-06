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
        // Fetch brands from brand_suggestions table
        const result = await supabase
            .from('brand_suggestions')
            .select('name')
            .ilike('name', `%${query}%`)
            .order('name', { ascending: true })
            .limit(20);

        if (result.error) {
            console.error("Brand fetch error:", result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        // Sort: prioritize results that START with the query
        const sortedData = result.data.sort((a: any, b: any) => {
            const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
            const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return 0; // Keep alphabetical order for same priority
        });

        // Map to expected format
        data = sortedData.map((item: any) => ({ brand: item.name }));

    } else {
        // Fetch generic tool names from tool_name_suggestions table
        // Note: brandFilter is ignored since tool names are now generic
        const result = await supabase
            .from('tool_name_suggestions')
            .select('*')
            .ilike('name', `%${query}%`)
            .order('name', { ascending: true })
            .limit(20);

        error = result.error;

        if (result.data) {
            // Sort: prioritize results that START with the query
            const sortedData = result.data.sort((a: any, b: any) => {
                const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
                const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return 0; // Keep alphabetical order for same priority
            });

            // Map to expected format
            data = sortedData.map((item: any) => ({
                tool_name: item.name,
                tier_suggestion: item.tier_suggestion
            }));
        }
    }

    if (error) {
        console.error("Suggestion fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ suggestions: data || [] });
}
