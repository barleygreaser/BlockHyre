


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_full_name text;
  v_avatar_url text;
  v_username text;
BEGIN
  -- 1. Extract Full Name (try 'full_name' then 'name')
  v_full_name := new.raw_user_meta_data->>'full_name';
  IF v_full_name IS NULL THEN
    v_full_name := new.raw_user_meta_data->>'name';
  END IF;

  -- 2. Extract Avatar (try 'avatar_url' then 'picture')
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';
  IF v_avatar_url IS NULL THEN
     v_avatar_url := new.raw_user_meta_data->>'picture';
  END IF;

  -- 3. Extract Username (leave NULL if not present, let the user set it later)
  -- Note: We generally don't want to auto-generate unique usernames from emails 
  -- to avoid privacy leaks or collisions, but we can if required.
  v_username := new.raw_user_meta_data->>'username';

  -- 4. Insert into public.users
  INSERT INTO public.users (id, email, full_name, username, profile_photo_url)
  VALUES (
    new.id, 
    new.email, 
    v_full_name, 
    v_username,
    v_avatar_url
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    -- Only update these if they are currently null in the record, 
    -- so we don't overwrite user setup if they re-login
    full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
    profile_photo_url = COALESCE(public.users.profile_photo_url, EXCLUDED.profile_photo_url);

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_nearby_listings"("user_lat" double precision, "user_long" double precision, "radius_miles" double precision, "min_price" numeric, "max_price" numeric, "category_filter" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "title" "text", "daily_price" numeric, "images" "text"[], "latitude" double precision, "longitude" double precision, "distance_miles" double precision, "category_name" "text", "risk_daily_fee" numeric, "accepts_barter" boolean, "is_high_powered" boolean, "booking_type" "text")
    LANGUAGE "plpgsql"
    AS $$
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
    l.is_high_powered,
    l.booking_type
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


ALTER FUNCTION "public"."search_nearby_listings"("user_lat" double precision, "user_long" double precision, "radius_miles" double precision, "min_price" numeric, "max_price" numeric, "category_filter" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "risk_daily_fee" numeric NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "daily_price" numeric NOT NULL,
    "accepts_barter" boolean DEFAULT false,
    "category_id" "uuid",
    "description" "text",
    "booking_type" "text" DEFAULT 'request'::"text",
    "weight_kg" numeric,
    "dimensions_cm" "text",
    "specifications" "jsonb" DEFAULT '{}'::"jsonb",
    "owner_id" "uuid",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "manual_url" "text",
    "is_high_powered" boolean DEFAULT false,
    "brand" "text",
    "display_name" "text"
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."peace_fund_claims" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rental_id" "uuid",
    "owner_id" "uuid",
    "claim_amount" numeric(10,2),
    "status" "text" DEFAULT 'PENDING'::"text",
    "evidence_url" "text"[],
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "peace_fund_claims_status_check" CHECK (("status" = ANY (ARRAY['PENDING'::"text", 'APPROVED'::"text", 'REJECTED'::"text"])))
);


ALTER TABLE "public"."peace_fund_claims" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rentals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid",
    "renter_id" "uuid",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "total_days" integer,
    "daily_price_snapshot" numeric,
    "risk_fee_snapshot" numeric,
    "is_barter_deal" boolean DEFAULT false,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "rental_fee" numeric(10,2),
    "peace_fund_fee" numeric(10,2),
    "total_paid" numeric(10,2)
);


ALTER TABLE "public"."rentals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "full_name" "text",
    "profile_photo_url" "text",
    "username" "text",
    "stripe_account_id" "text",
    "stripe_connected" boolean DEFAULT false
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."peace_fund_claims"
    ADD CONSTRAINT "peace_fund_claims_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_users_stripe_account_id" ON "public"."users" USING "btree" ("stripe_account_id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."peace_fund_claims"
    ADD CONSTRAINT "peace_fund_claims_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."peace_fund_claims"
    ADD CONSTRAINT "peace_fund_claims_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "public"."rentals"("id");



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id");



ALTER TABLE ONLY "public"."rentals"
    ADD CONSTRAINT "rentals_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Owners can submit claims" ON "public"."peace_fund_claims" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Owners can view their own claims" ON "public"."peace_fund_claims" FOR SELECT USING (("auth"."uid"() = "owner_id"));



ALTER TABLE "public"."peace_fund_claims" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."search_nearby_listings"("user_lat" double precision, "user_long" double precision, "radius_miles" double precision, "min_price" numeric, "max_price" numeric, "category_filter" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_nearby_listings"("user_lat" double precision, "user_long" double precision, "radius_miles" double precision, "min_price" numeric, "max_price" numeric, "category_filter" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_nearby_listings"("user_lat" double precision, "user_long" double precision, "radius_miles" double precision, "min_price" numeric, "max_price" numeric, "category_filter" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT ALL ON TABLE "public"."peace_fund_claims" TO "anon";
GRANT ALL ON TABLE "public"."peace_fund_claims" TO "authenticated";
GRANT ALL ON TABLE "public"."peace_fund_claims" TO "service_role";



GRANT ALL ON TABLE "public"."rentals" TO "anon";
GRANT ALL ON TABLE "public"."rentals" TO "authenticated";
GRANT ALL ON TABLE "public"."rentals" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































