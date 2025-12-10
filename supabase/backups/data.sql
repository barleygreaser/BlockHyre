SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict hh6mXR1Fb22DMGu527uOzLKvHelODYBNm4fcgOq9gKcdDGXfjK9zBxIzUe1iea6

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."categories" ("id", "name", "risk_daily_fee") VALUES
	('9a331ef0-04cd-4f86-8eb4-39a2c32408be', 'Hand Tools', 1),
	('6337f66d-53c9-47f9-b87b-e2aa581a836e', 'Small Power Tools', 3),
	('051b9257-3e61-499f-98df-82b5f71173ec', 'Heavy Machinery', 10),
	('b7333297-58bd-41e5-a6f1-0eabd8fe9f05', 'Harvest', 2),
	('2cb19ebd-f9e2-4cef-8d25-c463a44c641f', 'Power Tools', 3);


--
-- Data for Name: neighborhoods; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."neighborhoods" ("id", "name", "center_lat", "center_lon", "service_radius_miles") VALUES
	('04080d33-ad68-44c7-86a0-fda314d29145', 'Woodlands', 34.0924, -84.5097, 2.0),
	('89c4cf81-3f0b-4f9b-8384-e00e5b3cae03', 'Deer Run', 34.1080, -84.5125, 2.0);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."listings" ("id", "title", "daily_price", "accepts_barter", "category_id", "description", "booking_type", "weight_kg", "dimensions_cm", "specifications", "owner_id", "images", "manual_url", "is_high_powered", "brand", "display_name", "is_available", "created_at", "deposit_amount", "owner_notes") VALUES
	('b81d78f5-23ce-4fe7-a2b9-95b0c5c9f68e', 'Harvest Right Freeze Dryer', 50.00, true, 'b7333297-58bd-41e5-a6f1-0eabd8fe9f05', 'Large capacity freeze dryer perfect for preserving garden bounty or making astronaut ice cream.', 'instant', 68.00, '70x60x90', '{"capacity": "5 Trays", "power_type": "110V"}', NULL, '{https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer,https://placehold.co/600x400/e2e8f0/1e293b?text=Freeze+Dryer+Inside}', NULL, false, NULL, NULL, true, '2025-12-10 14:13:59.971226+00', 0, NULL),
	('74fb1286-5f20-44a2-9b1b-408b4786bffb', 'Makita Impact Drill Kit', 15.00, false, '6337f66d-53c9-47f9-b87b-e2aa581a836e', 'Powerful drill kit for any home renovation project.', 'request', 2.50, '30x25x10', '{"voltage": "18V", "power_type": "Battery"}', NULL, '{https://placehold.co/600x400/e2e8f0/1e293b?text=Makita+Drill}', NULL, true, NULL, NULL, true, '2025-12-10 14:13:59.971226+00', 0, NULL);


--
-- Data for Name: blocked_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: rentals; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: peace_fund_claims; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--



--
-- Data for Name: tool_suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tool_suggestions" ("id", "brand", "tool_name", "tier_suggestion", "created_at") VALUES
	('f7eaabdf-ea9c-4187-8c15-56d2fdebf95e', 'Harvest Right', 'Freeze Dryer', 3, '2025-12-10 14:13:57.755414+00'),
	('0edbd209-f4d4-4744-b924-121ee4bb277f', 'DeWalt', 'Table Saw', 2, '2025-12-10 14:13:57.755414+00'),
	('0b6dbcf7-a6de-42d3-9c3a-1adfc3c1b307', 'Canon', 'EOS R6 Camera Body', 3, '2025-12-10 14:13:57.755414+00'),
	('4139e467-0788-4f30-8577-52ebfcf0f5b4', 'Makita', 'Jackhammer', 2, '2025-12-10 14:13:57.755414+00'),
	('88d8682c-8847-4d98-be1e-4c8a73dfcb27', 'Stihl', 'Chainsaw', 2, '2025-12-10 14:13:57.755414+00'),
	('5ba733b0-ee49-4a99-87e2-0c6e2254b4d0', 'Honda', 'Generator EU2200i', 2, '2025-12-10 14:13:57.755414+00'),
	('9908b8df-ed1e-48fa-a4ca-cf7ae12d3437', 'Husqvarna', 'Lawn Mower', 2, '2025-12-10 14:13:57.755414+00'),
	('0cc9d5ef-d249-46bc-9127-10d550b27ddb', 'Milwaukee', 'M18 Fuel Impact Driver', 1, '2025-12-10 14:13:57.755414+00'),
	('cf6f8d5c-6e77-420b-8099-afe3ce74c5f3', 'Bosch', 'Rotary Hammer', 2, '2025-12-10 14:13:57.755414+00'),
	('eed3f48c-9dd2-4b41-8ce5-c1900e203fd5', 'Karcher', 'Pressure Washer', 1, '2025-12-10 14:13:57.755414+00'),
	('2d20901e-b067-4595-8fbc-ae319669c1d8', 'Festool', 'Domino Joiner', 3, '2025-12-10 14:13:57.755414+00'),
	('6a46d3e4-471f-4c57-88d0-46b0f0e58104', 'Dji', 'Mavic 3 Drone', 3, '2025-12-10 14:13:57.755414+00'),
	('9aa6ca0d-92dc-4f08-a335-fcfd6a4adcc8', 'Sony', 'A7S III Camera', 3, '2025-12-10 14:13:57.755414+00'),
	('3142aec7-e92d-4240-9ce9-6839c5368f25', 'Blackmagic', 'Pocket Cinema Camera 6K', 3, '2025-12-10 14:13:57.755414+00'),
	('d654689d-e39e-4bac-9d8f-829d76311a09', 'Generac', 'Pressure Washer', 2, '2025-12-10 14:13:57.755414+00'),
	('a7a4cdd4-ff4d-45ce-b11d-47f31344be6b', 'Toro', 'Snow Blower', 2, '2025-12-10 14:13:57.755414+00'),
	('78f0319d-4cc9-4c25-a64c-c9e7d621f51b', 'Vitamix', 'Commercial Blender', 1, '2025-12-10 14:13:57.755414+00'),
	('bf707b44-fd64-4257-b151-d3c96d416a3b', 'Ooni', 'Pizza Oven', 1, '2025-12-10 14:13:57.755414+00'),
	('4f2c7686-eec7-49a9-8a76-4561db3171e8', 'SawStop', 'Table Saw', 3, '2025-12-10 14:13:57.755414+00'),
	('f4f1b92d-cf75-40f1-901e-f19d8580d3e1', 'Kubota', 'Mini Excavator', 3, '2025-12-10 14:13:57.755414+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('avatars', 'avatars', NULL, '2025-12-08 08:04:46.69352+00', '2025-12-08 08:04:46.69352+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('tool_images', 'tool_images', NULL, '2025-12-08 08:04:46.69352+00', '2025-12-08 08:04:46.69352+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict hh6mXR1Fb22DMGu527uOzLKvHelODYBNm4fcgOq9gKcdDGXfjK9zBxIzUe1iea6

RESET ALL;
