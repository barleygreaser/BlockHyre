-- Create table for tool suggestions
CREATE TABLE IF NOT EXISTS public.tool_suggestions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    brand text NOT NULL,
    tool_name text NOT NULL,
    tier_suggestion integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to suggestions
CREATE POLICY "Suggestions are viewable by everyone"
    ON public.tool_suggestions FOR SELECT
    USING (true);

-- Seed Data (High-Value Items)
INSERT INTO public.tool_suggestions (brand, tool_name, tier_suggestion) VALUES
    ('Harvest Right', 'Freeze Dryer', 3),
    ('DeWalt', 'Table Saw', 2),
    ('Canon', 'EOS R6 Camera Body', 3),
    ('Makita', 'Jackhammer', 2),
    ('Stihl', 'Chainsaw', 2),
    ('Honda', 'Generator EU2200i', 2),
    ('Husqvarna', 'Lawn Mower', 2),
    ('Milwaukee', 'M18 Fuel Impact Driver', 1),
    ('Bosch', 'Rotary Hammer', 2),
    ('Karcher', 'Pressure Washer', 1),
    ('Festool', 'Domino Joiner', 3),
    ('Dji', 'Mavic 3 Drone', 3),
    ('Sony', 'A7S III Camera', 3),
    ('Blackmagic', 'Pocket Cinema Camera 6K', 3),
    ('Generac', 'Pressure Washer', 2),
    ('Toro', 'Snow Blower', 2),
    ('Vitamix', 'Commercial Blender', 1),
    ('Ooni', 'Pizza Oven', 1),
    ('SawStop', 'Table Saw', 3),
    ('Kubota', 'Mini Excavator', 3);
