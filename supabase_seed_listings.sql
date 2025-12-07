-- Seed Listings with detailed data

-- 1. Harvest Right Freeze Dryer
WITH harvest_cat AS (SELECT id FROM public.categories WHERE name = 'Harvest' LIMIT 1),
     owner_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.listings (
    title, 
    description, 
    daily_price, 
    booking_type, 
    accepts_barter, 
    weight_kg, 
    dimensions_cm, 
    specifications, 
    images, 
    category_id, 
    is_high_powered,
    owner_id
)
SELECT 
    'Harvest Right Freeze Dryer',
    'Large capacity freeze dryer perfect for preserving garden bounty or making astronaut ice cream.',
    50.00,
    'instant',
    true,
    68.00,
    '70x60x90',
    '{"capacity":"5 Trays","power_type":"110V"}'::jsonb,
    ARRAY['https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer', 'https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer+Inside'],
    id,
    false,
    (SELECT id FROM owner_user)
FROM harvest_cat;

-- 2. Makita Impact Drill Kit
WITH power_cat AS (SELECT id FROM public.categories WHERE name = 'Small Power Tools' LIMIT 1),
     owner_user AS (SELECT id FROM auth.users LIMIT 1)
INSERT INTO public.listings (
    title, 
    description, 
    daily_price, 
    booking_type, 
    accepts_barter, 
    weight_kg, 
    dimensions_cm, 
    specifications, 
    images, 
    category_id, 
    is_high_powered,
    owner_id
)
SELECT 
    'Makita Impact Drill Kit',
    'Powerful drill kit for any home renovation project.',
    15.00,
    'request',
    false,
    2.50,
    '30x25x10',
    '{"voltage":"18V","power_type":"Battery"}'::jsonb,
    ARRAY['https://placehold.co/600x400/e2e8f0/1e293b?text=Makita+Drill'],
    id,
    true,
    (SELECT id FROM owner_user)
FROM power_cat;
