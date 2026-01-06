-- 1. Create table for specification definitions
create table public.listing_specifications (
  id uuid default gen_random_uuid() primary key,
  spec_key text not null unique,
  display_name text not null,
  unit_type text, -- e.g. "V", "Ah", "kg", or null
  icon_name text not null, -- references Lucide icon name
  is_numeric boolean default false
);

-- 2. Create junction table for Category <-> Specifications
create table public.category_specifications (
  category_id uuid references public.categories(id) on delete cascade,
  spec_id uuid references public.listing_specifications(id) on delete cascade,
  primary key (category_id, spec_id)
);

-- 3. Seed Specifications
insert into public.listing_specifications (spec_key, display_name, unit_type, icon_name, is_numeric) values
('voltage', 'Voltage', 'V', 'Zap', true),
('amperage', 'Amperage', 'A', 'Zap', true),
('battery_capacity', 'Battery Capacity', 'Ah', 'BatteryFull', true),
('power_source', 'Power Source', null, 'Plug', false),
('weight', 'Weight', 'kg', 'Scale', true),
('max_rpm', 'Max RPM', 'RPM', 'Gauge', true),
('torque', 'Torque', 'Nm', 'Wrench', true),
('fuel_type', 'Fuel Type', null, 'Fuel', false),
('tank_capacity', 'Tank Capacity', 'L', 'Droplet', true),
('length', 'Length', 'cm', 'Ruler', true)
on conflict (spec_key) do nothing;

-- 4. Link specs to categories (Seed Data)
do $$
declare
  cat_power uuid;
  cat_heavy uuid;
  spec_volt uuid;
  spec_amp uuid;
  spec_batt uuid;
  spec_rpm uuid;
  spec_fuel uuid;
  spec_tank uuid;
  spec_torque uuid;
begin
  -- Get Category IDs
  select id into cat_power from public.categories where name = 'Small Power Tools' limit 1;
  select id into cat_heavy from public.categories where name = 'Heavy Machinery' limit 1;

  -- Get Spec IDs
  select id into spec_volt from public.listing_specifications where spec_key = 'voltage';
  select id into spec_amp from public.listing_specifications where spec_key = 'amperage';
  select id into spec_batt from public.listing_specifications where spec_key = 'battery_capacity';
  select id into spec_rpm from public.listing_specifications where spec_key = 'max_rpm';
  select id into spec_fuel from public.listing_specifications where spec_key = 'fuel_type';
  select id into spec_tank from public.listing_specifications where spec_key = 'tank_capacity';
  select id into spec_torque from public.listing_specifications where spec_key = 'torque';

  -- Link Power Tools -> Voltage, Battery, RPM
  if cat_power is not null then
    insert into public.category_specifications (category_id, spec_id) values
    (cat_power, spec_volt),
    (cat_power, spec_batt),
    (cat_power, spec_rpm)
    on conflict do nothing;
  end if;

  -- Link Heavy Machinery -> Fuel, Tank, Torque
  if cat_heavy is not null then
    insert into public.category_specifications (category_id, spec_id) values
    (cat_heavy, spec_fuel),
    (cat_heavy, spec_tank),
    (cat_heavy, spec_torque)
    on conflict do nothing;
  end if;

end $$;
