-- Seed data for brand_suggestions and tool_name_suggestions tables

-- Insert Brands
INSERT INTO brand_suggestions (name) VALUES
('Blackmagic'),
('Bosch'),
('Canon'),
('DeWalt'),
('Dji'),
('Festool'),
('Generac'),
('Harvest Right'),
('Honda'),
('Husqvarna'),
('Karcher'),
('Kubota'),
('Makita'),
('Milwaukee'),
('Ooni'),
('SawStop'),
('Sony'),
('Stihl'),
('Toro'),
('Vitamix')
ON CONFLICT (name) DO NOTHING;

-- Insert Tool Names (generic, work with any brand)
INSERT INTO tool_name_suggestions (name, tier_suggestion) VALUES
('Chainsaw', 2),
('Commercial Blender', 1),
('Domino Joiner', 3),
('Drill', 1),
('EOS R6 Camera Body', 3),
('Freeze Dryer', 3),
('Generator EU2200i', 2),
('Impact Driver', 1),
('Jackhammer', 2),
('Lawn Mower', 2),
('Mavic 3 Drone', 3),
('Mini Excavator', 3),
('Pizza Oven', 1),
('Pocket Cinema Camera 6K', 3),
('Pressure Washer', 2),
('Rotary Hammer', 2),
('Snow Blower', 2),
('Table Saw', 3),
('A7S III Camera', 3)
ON CONFLICT (name) DO NOTHING;
