-- 1. Create Neighborhoods Table
create table if not exists public.neighborhoods (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  center_lat numeric not null,
  center_lon numeric not null,
  service_radius_miles numeric not null
);

-- 2. Add Foreign Key to Users Table
alter table public.users
add column if not exists neighborhood_id uuid references public.neighborhoods(id);
