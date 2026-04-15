-- DEALERS_SETUP.sql
-- Creates the dealers table with geographic coordinates for map positioning.
-- Run this in the Supabase SQL Editor.

-- 1. Create the dealers table
CREATE TABLE IF NOT EXISTS public.dealers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN DEFAULT true,
  dealer_type TEXT NOT NULL DEFAULT 'standard' CHECK (dealer_type IN ('premium', 'standard', 'coming_soon')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public read access (anyone can view dealers)
CREATE POLICY "Public can view active dealers"
  ON public.dealers
  FOR SELECT
  USING (is_active = true);

-- Authenticated admin full access
CREATE POLICY "Admin full access to dealers"
  ON public.dealers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Grant permissions
GRANT SELECT ON public.dealers TO anon;
GRANT ALL ON public.dealers TO authenticated;
GRANT ALL ON public.dealers TO service_role;

-- 5. Seed data with correct geographic coordinates
INSERT INTO public.dealers (dealer_name, contact_person, phone, email, address, city, state, pincode, latitude, longitude, is_active, dealer_type) VALUES
  ('Gentech Guard Mumbai Central', 'Rajesh Sharma', '+91 99898 20222', 'mumbai@gentechguard.com', '123 Marine Drive, Near Oberoi Mall', 'Mumbai', 'Maharashtra', '400002', 19.076, 72.878, true, 'premium'),
  ('Delhi Premium Auto Care', 'Vikram Singh', '+91 99898 20223', 'delhi@gentechguard.com', '456 Connaught Place, New Delhi', 'Delhi', 'Delhi', '110001', 28.614, 77.209, true, 'premium'),
  ('Bangalore South PPF Center', 'Priya Kumar', '+91 99898 20224', 'bangalore@gentechguard.com', '789 Koramangala, Bangalore', 'Bangalore', 'Karnataka', '560034', 12.972, 77.594, true, 'premium'),
  ('Hyderabad Auto Shield', 'Suresh Reddy', '+91 99898 20225', 'hyderabad@gentechguard.com', '321 Banjara Hills, Hyderabad', 'Hyderabad', 'Telangana', '500034', 17.385, 78.486, true, 'premium'),
  ('Chennai Coastal Protection', 'Karthik Venkat', '+91 99898 20226', 'chennai@gentechguard.com', '654 Anna Salai, Chennai', 'Chennai', 'Tamil Nadu', '600002', 13.083, 80.270, true, 'standard'),
  ('Kolkata East Auto Films', 'Arjun Banerjee', '+91 99898 20227', 'kolkata@gentechguard.com', '987 Park Street, Kolkata', 'Kolkata', 'West Bengal', '700016', 22.572, 88.364, true, 'standard'),
  ('Pune West Auto Care', 'Amit Patil', '+91 99898 20228', 'pune@gentechguard.com', '147 FC Road, Pune', 'Pune', 'Maharashtra', '411004', 18.520, 73.856, true, 'standard'),
  ('Ahmedabad Gujarat Auto Shield', 'Naresh Patel', '+91 99898 20229', 'ahmedabad@gentechguard.com', '258 CG Road, Ahmedabad', 'Ahmedabad', 'Gujarat', '380009', 23.023, 72.571, true, 'standard'),
  ('Jaipur Royal Auto Protection', 'Rajendra Singh', '+91 99898 20230', 'jaipur@gentechguard.com', '369 MI Road, Jaipur', 'Jaipur', 'Rajasthan', '302001', 26.912, 75.787, true, 'standard'),
  ('Kochi Kerala Auto Films', 'Thomas George', '+91 99898 20231', 'kochi@gentechguard.com', '741 MG Road, Kochi', 'Kochi', 'Kerala', '682011', 9.932, 76.267, true, 'standard'),
  ('Chandigarh North Auto Care', 'Harpreet Singh', '+91 99898 20232', 'chandigarh@gentechguard.com', '852 Sector 17, Chandigarh', 'Chandigarh', 'Chandigarh', '160017', 30.734, 76.779, true, 'standard'),
  ('Lucknow UP Auto Shield', 'Amitabh Tiwari', '+91 99898 20233', 'lucknow@gentechguard.com', '963 Hazratganj, Lucknow', 'Lucknow', 'Uttar Pradesh', '226001', 26.847, 80.947, true, 'standard'),
  ('Bhopal MP Protection Center', 'Rahul Verma', '+91 99898 20234', 'bhopal@gentechguard.com', '159 MP Nagar, Bhopal', 'Bhopal', 'Madhya Pradesh', '462011', 23.260, 77.413, true, 'standard'),
  ('Visakhapatnam AP Films', 'Srinivas Rao', '+91 99898 20235', 'vizag@gentechguard.com', '357 Beach Road, Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh', '530002', 17.686, 83.218, true, 'coming_soon'),
  ('Indore Premium Auto Care', 'Neeraj Gupta', '+91 99898 20236', 'indore@gentechguard.com', '753 MG Road, Indore', 'Indore', 'Madhya Pradesh', '452001', 22.720, 75.857, true, 'standard');
