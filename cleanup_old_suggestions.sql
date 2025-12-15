-- Cleanup: Drop the old tool_suggestions table
-- Run this AFTER you've verified the new tables are working correctly

-- Step 1: Verify new tables exist and have data
SELECT COUNT(*) as brand_count FROM brand_suggestions;
SELECT COUNT(*) as tool_count FROM tool_name_suggestions;

-- Step 2: Drop the old table
DROP TABLE IF EXISTS tool_suggestions;
