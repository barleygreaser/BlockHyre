-- MANUAL FIX: Drop the broken suggest_category function
-- This migration integrates a manual fix that was previously applied directly or identified as necessary.

DROP FUNCTION IF EXISTS public.suggest_category(text);
