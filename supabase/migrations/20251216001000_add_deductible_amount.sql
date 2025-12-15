-- Add deductible_amount column to categories
alter table public.categories 
add column if not exists deductible_amount numeric not null default 0;

-- Update deductible amounts based on risk_tier
-- Tier 3 (High Risk) = $250 deductible
-- Tier 2 (Mid Risk) = $0 deductible
-- Tier 1 (Low Risk) = $0 deductible

update public.categories
set deductible_amount = case
    when risk_tier = 3 then 250
    else 0
end;
