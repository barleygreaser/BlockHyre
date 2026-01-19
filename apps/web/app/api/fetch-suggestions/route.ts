import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type"); // 'brand' or 'tool'
    // const brandFilter = searchParams.get("brandFilter"); // Unused

    if (!query || query.length < 1) {
        return NextResponse.json({ suggestions: [] });
    }

    // Security: Limit query length to prevent DoS
    if (query.length > 100) {
        return NextResponse.json({ error: "Query too long" }, { status: 400 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let data, error;

    if (type === 'brand') {
        // Optimization: Try prefix search first (index-friendly)
        // This avoids full table scan for the most common case (user typing start of word)
        const prefixResult = await supabase
            .from('brand_suggestions')
            .select('name')
            .ilike('name', `${query}%`)
            .order('name', { ascending: true })
            .limit(20);

        if (!prefixResult.error && prefixResult.data && prefixResult.data.length === 20) {
             // We found enough prefix matches, so we can skip the expensive wildcard query.
             // Since they all start with the query, they are already prioritized.
             data = prefixResult.data.map((item: { name: string }) => ({ brand: item.name }));
        } else {
             // Fallback: Fetch brands from brand_suggestions table with leading wildcard
             // This is slower (full table scan) but needed to find "Hammer Drill" when typing "Drill"
             // if we didn't find enough prefix matches.
            const result = await supabase
                .from('brand_suggestions')
                .select('name')
                .ilike('name', `%${query}%`)
                .order('name', { ascending: true })
                .limit(20);

            if (result.error) {
                console.error("Brand fetch error:", result.error);
                // Security: Don't leak DB error details to client
                return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
            }

            // Sort: prioritize results that START with the query
            const sortedData = result.data.sort((a: { name: string }, b: { name: string }) => {
                const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
                const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;
                return 0; // Keep alphabetical order for same priority
            });

            // Map to expected format
            data = sortedData.map((item: { name: string }) => ({ brand: item.name }));
        }

    } else {
        // Optimization: Try prefix search first
        const prefixResult = await supabase
            .from('tool_name_suggestions')
            .select('*')
            .ilike('name', `${query}%`)
            .order('name', { ascending: true })
            .limit(20);

        if (!prefixResult.error && prefixResult.data && prefixResult.data.length === 20) {
             data = prefixResult.data.map((item: { name: string; tier_suggestion?: string }) => ({
                tool_name: item.name,
                tier_suggestion: item.tier_suggestion
            }));
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
                const sortedData = result.data.sort((a: { name: string }, b: { name: string }) => {
                    const aStartsWith = a.name.toLowerCase().startsWith(query.toLowerCase());
                    const bStartsWith = b.name.toLowerCase().startsWith(query.toLowerCase());

                    if (aStartsWith && !bStartsWith) return -1;
                    if (!aStartsWith && bStartsWith) return 1;
                    return 0; // Keep alphabetical order for same priority
                });

                // Map to expected format
                data = sortedData.map((item: { name: string; tier_suggestion?: string }) => ({
                    tool_name: item.name,
                    tier_suggestion: item.tier_suggestion
                }));
            }
        }
    }

    if (error) {
        console.error("Suggestion fetch error:", error);
        // Security: Don't leak DB error details to client
        return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
    }

    return NextResponse.json({ suggestions: data || [] });
}
