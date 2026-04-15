-- OTP_WHATSAPP_SETUP.sql
-- Creates tables for OTP verification and warranty certificate tracking.
-- Run this in the Supabase SQL Editor.

-- ============================================================
-- 1. OTP Verifications Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,                    -- Normalized: '+919989820222'
  otp_code TEXT NOT NULL,                 -- 6-digit code (hashed)
  dealer_id UUID REFERENCES public.dealers(id),
  purpose TEXT NOT NULL DEFAULT 'warranty_registration',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Only service_role (Edge Functions) can access this table
CREATE POLICY "Service role full access to otp_verifications"
  ON public.otp_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.otp_verifications TO service_role;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone_active
  ON public.otp_verifications(phone, is_verified, expires_at);

-- ============================================================
-- 2. Warranty Certificates Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.warranty_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warranty_id TEXT NOT NULL,
  registration_id UUID,
  pdf_storage_path TEXT,
  pdf_public_url TEXT,
  delivered_to_dealer BOOLEAN DEFAULT false,
  delivered_to_customer BOOLEAN DEFAULT false,
  delivered_to_admin BOOLEAN DEFAULT false,
  delivery_errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.warranty_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view warranty certificates"
  ON public.warranty_certificates
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert warranty certificates"
  ON public.warranty_certificates
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role full access to warranty_certificates"
  ON public.warranty_certificates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated full access to warranty_certificates"
  ON public.warranty_certificates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT SELECT, INSERT ON public.warranty_certificates TO anon;
GRANT ALL ON public.warranty_certificates TO authenticated;
GRANT ALL ON public.warranty_certificates TO service_role;

-- ============================================================
-- 3. Phone Normalization Helper Function
-- ============================================================
CREATE OR REPLACE FUNCTION normalize_phone(phone_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove all non-digit characters, take last 10 digits, prepend +91
  RETURN '+91' || RIGHT(regexp_replace(phone_input, '[^0-9]', '', 'g'), 10);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 4. Storage Bucket Setup (run manually in Supabase Dashboard)
-- ============================================================
-- Go to Supabase Dashboard > Storage > Create Bucket:
--   Name: warranty-certificates
--   Public: true
--   File size limit: 10MB
--   Allowed MIME types: application/pdf
--
-- Then add a storage policy:
--   INSERT: Allow anon to upload (or restrict to authenticated)
--   SELECT: Allow public read (so Twilio can fetch PDF URLs)
