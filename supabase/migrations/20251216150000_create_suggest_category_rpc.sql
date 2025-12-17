-- Create RPC function to suggest category based on tool title
CREATE OR REPLACE FUNCTION public.suggest_category(tool_title text)
RETURNS TABLE (
    id uuid,
    name text,
    risk_tier integer,
    risk_daily_fee numeric,
    deductible_amount numeric
) AS $$
BEGIN
    -- Fuzzy match against category names
    -- Priority: exact match > starts with > contains
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.risk_tier,
        c.risk_daily_fee,
        c.deductible_amount
    FROM public.categories c
    WHERE 
        c.name ILIKE '%' || tool_title || '%'
        OR tool_title ILIKE '%' || c.name || '%'
    ORDER BY 
        -- Prioritize exact matches
        CASE WHEN LOWER(c.name) = LOWER(tool_title) THEN 0
             WHEN LOWER(c.name) LIKE LOWER(tool_title) || '%' THEN 1
             WHEN LOWER(tool_title) LIKE '%' || LOWER(c.name) || '%' THEN 2
             ELSE 3
        END,
        c.name ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO anon;
