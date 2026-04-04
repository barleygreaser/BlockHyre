-- Migration: Add category path to tool name suggestions

-- 1. Add the column
ALTER TABLE tool_name_suggestions 
ADD COLUMN IF NOT EXISTS category_path TEXT;

-- 2. Optional: Add an index if you plan to search by category_path later
CREATE INDEX IF NOT EXISTS idx_tool_name_suggestions_category ON tool_name_suggestions(category_path);
