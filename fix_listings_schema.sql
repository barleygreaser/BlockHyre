-- 1. Add missing columns to listings table
alter table public.listings 
add column if not exists latitude float,
add column if not exists longitude float,
add column if not exists images text[],
add column if not exists status text default 'draft';

-- 1.1 Update existing listings to 'active' so they don't disappear
UPDATE public.listings SET status = 'active' WHERE status IS NULL OR status = 'draft';

-- 2. Create or Update the Geospatial Search Function (RPC)
-- Drop first to allow return type changes
DROP FUNCTION IF EXISTS search_nearby_listings(float, float, float, numeric, numeric, text);

create or replace function search_nearby_listings(
  user_lat float,
  user_long float,
  radius_miles float,
  min_price numeric,
  max_price numeric,
  category_filter text default null
)
returns table (
  id uuid,
  title text,
  daily_price numeric,
  images text[],
  latitude float,
  longitude float,
  distance_miles float,
  category_name text,
  risk_daily_fee numeric,
  accepts_barter boolean,
  is_high_powered boolean
)
language plpgsql
as $$
begin
  return query
  select 
    l.id, 
    l.title, 
    l.daily_price, 
    l.images, 
    l.latitude, 
    l.longitude,
    (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) as distance_miles,
    c.name as category_name,
    c.risk_daily_fee,
    l.accepts_barter,
    l.is_high_powered
  from public.listings l
  left join public.categories c on l.category_id = c.id
  where 
    l.daily_price >= min_price 
    and l.daily_price <= max_price
    and (category_filter is null or c.name = category_filter)
    and l.status = 'active'
    and (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) < radius_miles
  order by distance_miles asc;
end;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION search_nearby_listings TO anon, authenticated, service_role;

-- 4. Create index regarding listing status
create index IF not exists idx_listings_status on public.listings using btree (status);
