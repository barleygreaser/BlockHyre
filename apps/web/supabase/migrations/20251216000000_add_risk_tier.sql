-- Add risk_tier column to categories
alter table public.categories 
add column if not exists risk_tier int not null default 1 check (risk_tier in (1, 2, 3));

-- Update existing categories based on risk_daily_fee map
-- Logic: 
-- Tier 1 (Low): < $3 daily fee
-- Tier 2 (Med): $3 - $9 daily fee
-- Tier 3 (High): >= $10 daily fee

update public.categories
set risk_tier = case
    when risk_daily_fee >= 10 then 3
    when risk_daily_fee >= 3 then 2
    else 1
end;

-- Now, we might want to standardize the fees based on tier?
-- For now, user only asked to USE the risk_tier. 
-- But typically tiers IMPLY a fixed fee per tier.
-- Let's update the fee structure as well? 
-- The request was "change the peace fund fees so that the risk_tier (1,2,3) is being used".
-- This usually means the fee is calculated FROM the tier.
-- Let's add a `tier_fees` jsonb or just hardcode it in logic, OR update categories to be consistent.

-- Let's just ensure the column exists first.
