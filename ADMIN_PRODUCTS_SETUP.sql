-- Create Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_desc TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
-- Public Read Access (for website)
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Admin Full Access
-- Assumes you have an admin_profiles table as created previously
CREATE POLICY "Enable all access for admins" ON products
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.id = auth.uid()
            AND admin_profiles.is_active = true
            AND (admin_profiles.role = 'superadmin' OR admin_profiles.role = 'admin')
        )
    );

-- SEED DATA (from SolutionsSection.tsx)
INSERT INTO products (id, name, short_desc, features, specs)
VALUES 
    (
        'gen-5', 
        'GEN 5 PPF', 
        'Engineered for Hot Climate Performance',
        '["190 micron High-Clarity TPU", "Fast Self-Healing Top Coat", "Hydrophobic + Anti-Contamination Layer", "Superior Tensile Strength", "Outstanding Gloss Depth"]'::jsonb,
        '[{"label": "Thickness", "value": "190 microns"}, {"label": "Warranty", "value": "5 Years"}, {"label": "Finish", "value": "Gloss"}, {"label": "Max Temp", "value": "120°C"}]'::jsonb
    ),
    (
        'gen-4', 
        'GEN 4 PPF', 
        'Reliable TPU Gloss Protection',
        '["175 Micron TPU Gloss Film", "High-Gloss Clear Finish", "Standard Self-Healing Technology", "Excellent Weather Resistance", "Strong Surface Protection"]'::jsonb,
        '[{"label": "Thickness", "value": "175 microns"}, {"label": "Warranty", "value": "4 Years"}, {"label": "Finish", "value": "High-Gloss"}, {"label": "Max Temp", "value": "115°C"}]'::jsonb
    ),
    (
        'gen-pro-6', 
        'GEN PRO 6', 
        'High-clarity TPU with hydrophobic properties',
        '["190 micron High-Clarity TPU", "Fast Self-Healing (Heat Activated)", "Superior Tensile Strength", "Advanced UV Inhibitors", "Excellent High-Temp Stability"]'::jsonb,
        '[{"label": "Thickness", "value": "190 microns"}, {"label": "Warranty", "value": "6 Years"}, {"label": "Finish", "value": "Ultra Gloss"}, {"label": "Max Temp", "value": "120°C"}]'::jsonb
    ),
    (
        'gen-ultra-pro-8', 
        'GEN ULTRA PRO 8', 
        'Advanced instant self-healing TPU',
        '["215 micron Ultra-Premium TPU", "Instant Self-Healing (No Heat)", "Best-In-Class Stain Resistance", "Ultra Hydrophobic Top-Coat", "150% Stretch"]'::jsonb,
        '[{"label": "Thickness", "value": "215 microns"}, {"label": "Warranty", "value": "8 Years"}, {"label": "Finish", "value": "Crystal Gloss"}, {"label": "Max Temp", "value": "120°C"}]'::jsonb
    ),
    (
        'gen-matte-5', 
        'GEN MATTE 5', 
        'Stealth Matte Finish with TPU Protection',
        '["190 micron TPU Matte Film", "Satin-Matte Uniform Texture", "Anti-Fingerprint & Anti-Glare", "UV-Resistant Polymer", "OEM-Style Matte Finish"]'::jsonb,
        '[{"label": "Thickness", "value": "190 microns"}, {"label": "Warranty", "value": "5 Years"}, {"label": "Finish", "value": "Satin Matte"}, {"label": "Max Temp", "value": "120°C"}]'::jsonb
    );
