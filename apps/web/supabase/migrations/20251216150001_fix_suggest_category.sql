-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.suggest_category(text);

-- Create simplified RPC function to suggest category based on tool title
CREATE OR REPLACE FUNCTION public.suggest_category(tool_title text)
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
    -- Fuzzy match against category names using CTE for clarity
    RETURN QUERY
    WITH ranked_categories AS (
        SELECT 
            c.id,
            c.name,
            c.risk_tier,
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
        ranked_categories.id,
        ranked_categories.name,
        ranked_categories.risk_tier,
        ranked_categories.risk_daily_fee,
        ranked_categories.deductible_amount
    FROM ranked_categories
    ORDER BY match_rank ASC, name ASC
    LIMIT 1;
END;
$$;

-- Grant execute permission if not already granted
DO $$ 
BEGIN
  GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.suggest_category(text) TO anon;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
