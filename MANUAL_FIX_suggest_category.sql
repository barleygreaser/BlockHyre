-- MANUAL FIX: Run this in Supabase Dashboard > SQL Editor
-- This will fix the suggest_category function

-- 1. Drop the broken function
DROP FUNCTION IF EXISTS public.suggest_category(text);

-- 2. Create the corrected version
CREATE FUNCTION public.suggest_category(tool_title text)
RETURNS TABLE (
    id uuid,
    name text,
    risk_tier integer,
    risk_daily_fee numeric,
    deductible_amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_categories AS (
        SELECT 
            c.id,
            c.name,
            c.risk_tier::integer,
            c.risk_daily_fee,
            c.deductible_amount,
            CASE 
                WHEN LOWER(c.name) = LOWER(tool_title) THEN 0
                WHEN LOWER(c.name) LIKE LOWER(tool_title) || '%' THEN 1
                WHEN LOWER(tool_title) LIKE '%' || LOWER(c.name) || '%' THEN 2
                ELSE 3
            END as match_rank
        FROM public.categories c
        WHERE 
            c.name ILIKE '%' || tool_title || '%'
            OR tool_title ILIKE '%' || c.name || '%'
    )
    SELECT 
        r.id,
        r.name,
        r.risk_tier,
        r.risk_daily_fee,
        r.deductible_amount
    FROM ranked_categories r
    ORDER BY r.match_rank ASC, r.name ASC
    LIMIT 1;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO anon;
