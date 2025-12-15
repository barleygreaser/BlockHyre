-- Create platform_settings table
create table if not exists public.platform_settings (
    id int primary key default 1 check (id = 1), -- Singleton pattern constraint
    seller_fee_percent numeric not null default 7.0,
    buyer_fee_percent numeric not null default 10.0, -- Defaulting to 10%
    maintenance_mode boolean not null default false, -- Full site maintenance mode
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.platform_settings enable row level security;

-- Policies
create policy "Public read access" 
  on public.platform_settings for select 
  using (true);

create policy "Admin only write access" 
  on public.platform_settings for all 
  using (auth.role() = 'service_role'); -- Or specific admin check

-- Seed initial data
insert into public.platform_settings (id, seller_fee_percent, buyer_fee_percent, maintenance_mode)
values (1, 7.0, 10.0, false)
on conflict (id) do nothing;
