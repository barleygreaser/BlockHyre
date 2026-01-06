-- Migration: Split tool_suggestions into brand_suggestions and tool_name_suggestions
-- This allows generic tool name suggestions that work across all brands

-- Step 1: Create brand_suggestions table
CREATE TABLE IF NOT EXISTS brand_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create tool_name_suggestions table
CREATE TABLE IF NOT EXISTS tool_name_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    tier_suggestion INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Populate brand_suggestions with unique brands
INSERT INTO brand_suggestions (name)
SELECT DISTINCT brand 
FROM tool_suggestions
ON CONFLICT (name) DO NOTHING;

-- Step 4: Populate tool_name_suggestions with unique tool names
-- Using the highest tier if duplicates exist
INSERT INTO tool_name_suggestions (name, tier_suggestion)
SELECT 
    tool_name,
    MAX(tier_suggestion::INTEGER) as tier_suggestion
FROM tool_suggestions
GROUP BY tool_name
ON CONFLICT (name) DO NOTHING;

-- Step 5: (Optional) Drop old table after verifying data
-- DROP TABLE tool_suggestions;
