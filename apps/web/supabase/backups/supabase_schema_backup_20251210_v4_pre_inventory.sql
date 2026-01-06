-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  profile_photo_url text
);

-- 2. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  risk_daily_fee numeric not null -- The "Peace Fund" rate
);

-- 3. Listings Table
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  daily_price numeric not null,
  accepts_barter boolean default false,
  category_id uuid references public.categories(id)
);

-- 4. Rentals Table
create table public.rentals (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id),
  renter_id uuid references auth.users(id),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  total_days integer,
  daily_price_snapshot numeric, -- Financial Snapshot
  risk_fee_snapshot numeric,    -- Financial Snapshot
  is_barter_deal boolean default false,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- SEED DATA --

-- Insert Categories
insert into public.categories (name, risk_daily_fee) values
('Hand Tools', 1),
('Small Power Tools', 3),
('Heavy Machinery', 10);

-- Insert Mock Listings (Assuming IDs for categories - simplified for SQL editor)
-- You might need to check the category IDs after insertion if doing this manually, 
-- but here is a dynamic way to insert a tool linked to 'Heavy Machinery':

with heavy_cat as (select id from public.categories where name = 'Heavy Machinery' limit 1)
insert into public.listings (title, daily_price, accepts_barter, category_id)
select 'Kubota Mini Excavator', 250, true, id from heavy_cat;

with power_cat as (select id from public.categories where name = 'Small Power Tools' limit 1)
insert into public.listings (title, daily_price, accepts_barter, category_id)
select 'DeWalt Table Saw', 25, false, id from power_cat;
