-- =============================================================================
-- Gentech Guard — Supabase schema export
-- Source project: rnscmxjrkqelmaiwrouz
-- Generated from audit, 2026-04-18
-- Run on NEW project via Dashboard → SQL Editor (run this file top to bottom)
-- Prerequisites: pgcrypto, uuid-ossp must be enabled via Dashboard → Database → Extensions
-- =============================================================================

-- --- Sequence(s) --------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.warranty_registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;

-- --- Tables -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id         uuid PRIMARY KEY,
    email      text NOT NULL,
    full_name  text,
    is_active  boolean DEFAULT false,
    role       text DEFAULT 'admin'::text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
    id         text PRIMARY KEY,
    name       text NOT NULL,
    short_desc text,
    features   jsonb DEFAULT '[]'::jsonb,
    specs      jsonb DEFAULT '[]'::jsonb,
    parent_id  text REFERENCES public.products(id) ON DELETE CASCADE,
    image_url  text,
    sort_order integer DEFAULT 999,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.warranty_registrations (
    id                    bigint PRIMARY KEY DEFAULT nextval('public.warranty_registrations_id_seq'::regclass),
    name                  text NOT NULL,
    phone                 text NOT NULL,
    email                 text,
    reg_number            text NOT NULL,
    chassis_number        text,
    ppf_roll              text,
    ppf_category          text,
    dealer_name           text,
    installer_mobile      text,
    installation_location text,
    message               text,
    vehicle_image_url     text,
    rc_image_url          text,
    status                text NOT NULL DEFAULT 'pending'::text,
    created_at            timestamptz NOT NULL DEFAULT now()
);
ALTER SEQUENCE public.warranty_registrations_id_seq OWNED BY public.warranty_registrations.id;

CREATE TABLE IF NOT EXISTS public.site_settings (
    key        text PRIMARY KEY,
    value      jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dealers (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_name    text NOT NULL,
    contact_person text,
    phone          text NOT NULL,
    email          text,
    address        text NOT NULL,
    city           text NOT NULL,
    state          text NOT NULL,
    pincode        text,
    latitude       double precision NOT NULL,
    longitude      double precision NOT NULL,
    is_active      boolean DEFAULT true,
    dealer_type    text NOT NULL DEFAULT 'standard'::text,
    created_at     timestamptz DEFAULT now(),
    CONSTRAINT dealers_dealer_type_check CHECK (dealer_type = ANY (ARRAY['premium'::text,'standard'::text,'coming_soon'::text]))
);

CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone        text NOT NULL,
    otp_code     text NOT NULL,
    dealer_id    uuid REFERENCES public.dealers(id),
    purpose      text NOT NULL DEFAULT 'warranty_registration'::text,
    attempts     integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    is_verified  boolean DEFAULT false,
    expires_at   timestamptz NOT NULL,
    created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.warranty_certificates (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_id           text NOT NULL,
    registration_id       uuid,
    pdf_storage_path      text,
    pdf_public_url        text,
    delivered_to_dealer   boolean DEFAULT false,
    delivered_to_customer boolean DEFAULT false,
    delivered_to_admin    boolean DEFAULT false,
    delivery_errors       jsonb DEFAULT '[]'::jsonb,
    created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.customer_enquiries (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name       text NOT NULL,
    mobile_number       text NOT NULL,
    city_name           text NOT NULL,
    vehicle_name_model  text NOT NULL,
    treatment_type      text NOT NULL,
    status              text DEFAULT 'NEW'::text,
    source              text DEFAULT 'WEBSITE_HEADER'::text,
    notes               text,
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now(),
    CONSTRAINT customer_enquiries_treatment_type_check CHECK (treatment_type = ANY (ARRAY['PPF'::text,'SUNFILM'::text,'GRAPHENE_COATING'::text,'MULTIPLE'::text])),
    CONSTRAINT customer_enquiries_status_check        CHECK (status = ANY (ARRAY['NEW'::text,'CONTACTED'::text,'CONVERTED'::text,'CLOSED'::text]))
);

CREATE TABLE IF NOT EXISTS public.dealer_enquiries (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_name         text NOT NULL,
    mobile_number       text NOT NULL,
    studio_name         text NOT NULL,
    products_interested jsonb DEFAULT '[]'::jsonb,
    city                text NOT NULL,
    state               text NOT NULL,
    investment_capacity text,
    existing_business   boolean DEFAULT false,
    status              text DEFAULT 'PENDING'::text,
    created_at          timestamptz DEFAULT now(),
    updated_at          timestamptz DEFAULT now(),
    CONSTRAINT dealer_enquiries_status_check CHECK (status = ANY (ARRAY['PENDING'::text,'UNDER_REVIEW'::text,'APPROVED'::text,'REJECTED'::text]))
);

CREATE TABLE IF NOT EXISTS public.distributor_enquiries (
    id                           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    distributor_name             text NOT NULL,
    mobile_number                text NOT NULL,
    firm_name                    text NOT NULL,
    products_interested          jsonb DEFAULT '[]'::jsonb,
    city                         text NOT NULL,
    state                        text NOT NULL,
    gst_number                   text,
    current_distribution_network text,
    status                       text DEFAULT 'PENDING'::text,
    created_at                   timestamptz DEFAULT now(),
    updated_at                   timestamptz DEFAULT now(),
    CONSTRAINT distributor_enquiries_status_check CHECK (status = ANY (ARRAY['PENDING'::text,'UNDER_REVIEW'::text,'APPROVED'::text,'REJECTED'::text]))
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path text NOT NULL,
    title        text NOT NULL,
    category     text NOT NULL,
    description  text,
    width        integer,
    height       integer,
    created_at   timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT gallery_images_category_check CHECK (category = ANY (ARRAY['all'::text,'installations'::text,'products'::text,'events'::text,'showroom'::text]))
);

CREATE TABLE IF NOT EXISTS public.get_in_touch (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    phone      text NOT NULL,
    email      text NOT NULL,
    product    text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- --- Indexes ------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_parent              ON public.products              (parent_id);
CREATE INDEX IF NOT EXISTS idx_warranty_phone               ON public.warranty_registrations (phone);
CREATE INDEX IF NOT EXISTS idx_warranty_reg_number          ON public.warranty_registrations (reg_number);
CREATE INDEX IF NOT EXISTS idx_warranty_chassis             ON public.warranty_registrations (chassis_number);
CREATE INDEX IF NOT EXISTS idx_otp_phone_active             ON public.otp_verifications      (phone, is_verified, expires_at);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_mobile    ON public.customer_enquiries     (mobile_number);
CREATE INDEX IF NOT EXISTS idx_customer_enquiries_created   ON public.customer_enquiries     (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dealer_enquiries_mobile      ON public.dealer_enquiries       (mobile_number);
CREATE INDEX IF NOT EXISTS idx_dealer_enquiries_status      ON public.dealer_enquiries       (status);
CREATE INDEX IF NOT EXISTS idx_distributor_enquiries_mobile ON public.distributor_enquiries  (mobile_number);
CREATE INDEX IF NOT EXISTS idx_distributor_enquiries_status ON public.distributor_enquiries  (status);
CREATE INDEX IF NOT EXISTS idx_gallery_category             ON public.gallery_images         (category);
CREATE INDEX IF NOT EXISTS idx_gallery_created              ON public.gallery_images         (created_at DESC);

-- --- Functions ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.normalize_phone(phone_input text)
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
  RETURN '+91' || RIGHT(regexp_replace(phone_input, '[^0-9]', '', 'g'), 10);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Note: get_dealer_stats in the old project referenced a missing `dealers_locations` table.
-- Rewritten here to reference the actual `dealers` table.
CREATE OR REPLACE FUNCTION public.get_dealer_stats()
RETURNS TABLE(total bigint, premium bigint, standard bigint, coming_soon bigint, cities bigint, states bigint)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE dealer_type = 'premium')::BIGINT AS premium,
    COUNT(*) FILTER (WHERE dealer_type = 'standard')::BIGINT AS standard,
    COUNT(*) FILTER (WHERE dealer_type = 'coming_soon')::BIGINT AS coming_soon,
    COUNT(DISTINCT city)::BIGINT AS cities,
    COUNT(DISTINCT state)::BIGINT AS states
  FROM public.dealers
  WHERE is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, email, full_name, is_active)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', false);
  RETURN NEW;
END;
$$;

-- --- Triggers -----------------------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_customer_enquiries_updated_at
  BEFORE UPDATE ON public.customer_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dealer_enquiries_updated_at
  BEFORE UPDATE ON public.dealer_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distributor_enquiries_updated_at
  BEFORE UPDATE ON public.distributor_enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- --- RLS (enable on all tables) ----------------------------------------------

ALTER TABLE public.admin_profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_certificates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_enquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_enquiries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributor_enquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.get_in_touch           ENABLE ROW LEVEL SECURITY;

-- --- RLS Policies -------------------------------------------------------------

-- admin_profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.admin_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own profile."       ON public.admin_profiles FOR INSERT TO public WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile."             ON public.admin_profiles FOR UPDATE TO public USING (auth.uid() = id);

-- customer_enquiries
CREATE POLICY "Allow admin select"     ON public.customer_enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin update"     ON public.customer_enquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.customer_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- dealer_enquiries
CREATE POLICY "Allow admin select"     ON public.dealer_enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin update"     ON public.dealer_enquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.dealer_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- distributor_enquiries
CREATE POLICY "Allow admin select"     ON public.distributor_enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow admin update"     ON public.distributor_enquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous insert" ON public.distributor_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- dealers
CREATE POLICY "Admin full access to dealers" ON public.dealers FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can view active dealers" ON public.dealers FOR SELECT TO public USING (is_active = true);

-- gallery_images
CREATE POLICY "Public can view gallery"        ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can view gallery images" ON public.gallery_images FOR SELECT TO anon USING (true);

-- get_in_touch
CREATE POLICY "Allow authenticated delete" ON public.get_in_touch FOR DELETE TO public USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated select" ON public.get_in_touch FOR SELECT TO public USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public insert"        ON public.get_in_touch FOR INSERT TO public WITH CHECK (true);

-- otp_verifications
CREATE POLICY "Service role full access to otp_verifications" ON public.otp_verifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- products
CREATE POLICY "Allow read all products"         ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Enable all access for admins"    ON public.products FOR ALL    TO public USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
      AND admin_profiles.role IN ('superadmin','admin')
  )
);

-- site_settings
CREATE POLICY "public read site_settings"            ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "active admin upsert site_settings"    ON public.site_settings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
);
CREATE POLICY "active admin update site_settings"    ON public.site_settings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
);
CREATE POLICY "active admin delete site_settings"    ON public.site_settings FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
);

-- warranty_certificates
CREATE POLICY "Public can view warranty certificates"           ON public.warranty_certificates FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert warranty certificates"           ON public.warranty_certificates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Authenticated full access to warranty_certificates" ON public.warranty_certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access to warranty_certificates"  ON public.warranty_certificates FOR ALL TO service_role USING (true) WITH CHECK (true);

-- warranty_registrations
CREATE POLICY "public read warranties"   ON public.warranty_registrations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert warranties" ON public.warranty_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "active admin update warranties" ON public.warranty_registrations FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
);
CREATE POLICY "active admin delete warranties" ON public.warranty_registrations FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = auth.uid() AND ap.is_active = true)
);

-- --- Storage bucket policies --------------------------------------------------
-- (Buckets themselves are created by the storage migration script, see migrate-storage.mjs)

CREATE POLICY "public read warranty uploads"           ON storage.objects FOR SELECT TO public USING (bucket_id = 'warranty-uploads');
CREATE POLICY "public upload warranty uploads"         ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'warranty-uploads');
CREATE POLICY "Public Access Gallery"                  ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "Public can view gallery images 1vs8c42_0"  ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "Public can insert gallery images 1vs8c42_0" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "Public can insert gallery images 1vs8c42_1" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "Public can view product images 1twuy9b_0"   ON storage.objects FOR SELECT TO public USING (bucket_id = 'product');
CREATE POLICY "Public can view product images 1twuy9b_1"   ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product');
CREATE POLICY "Public can view product images 1twuy9b_2"   ON storage.objects FOR UPDATE TO public USING (bucket_id = 'product');
CREATE POLICY "Public can view product images 1twuy9b_3"   ON storage.objects FOR DELETE TO public USING (bucket_id = 'product');
CREATE POLICY "Public can view and insert product images 1twuy9b_0" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product');
CREATE POLICY "Public can view and insert product images 1twuy9b_1" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'product');
CREATE POLICY "Public can view warrenty 1fd3t2l_0"     ON storage.objects FOR SELECT TO public USING (bucket_id = 'warranty-certificates');
CREATE POLICY "Public can view warrenty 1fd3t2l_1"     ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'warranty-certificates');

-- =============================================================================
-- End of schema.sql
-- Next: run seed.sql to import table data, then migrate-storage.mjs for files.
-- =============================================================================
