-- Update the Geospatial Search Function to return is_high_powered and accepts_barter
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
  join public.categories c on l.category_id = c.id
  where 
    l.daily_price >= min_price 
    and l.daily_price <= max_price
    and (category_filter is null or c.name = category_filter)
    and (
      3959 * acos(
        cos(radians(user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(user_long)) + 
        sin(radians(user_lat)) * sin(radians(l.latitude))
      )
    ) < radius_miles
  order by distance_miles asc;
end;
$$;
