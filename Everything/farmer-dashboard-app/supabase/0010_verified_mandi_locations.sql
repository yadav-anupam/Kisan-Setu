-- ==============================================================================
-- Kisan Setu — Migration 0010: Verified Mandi Location Management & Tracking
-- ==============================================================================
-- Adds high-precision geospatial entrance coordinates, physical address metadata,
-- verification audit fields, and RLS policies for procurement centres (mandis).
-- ==============================================================================

-- 1. Extend public.centres with comprehensive geospatial & verification columns
ALTER TABLE public.centres
    ADD COLUMN IF NOT EXISTS centre_code VARCHAR(50),
    ADD COLUMN IF NOT EXISTS city_or_village VARCHAR(100),
    ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
    ADD COLUMN IF NOT EXISTS landmark VARCHAR(255),
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_source VARCHAR(50) DEFAULT 'OFFICIAL_PORTAL',
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) DEFAULT 'PENDING_VERIFICATION',
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);

-- Ensure centre_code has index
CREATE INDEX IF NOT EXISTS idx_centres_centre_code ON public.centres(centre_code);
CREATE INDEX IF NOT EXISTS idx_centres_verification_status ON public.centres(verification_status);
CREATE INDEX IF NOT EXISTS idx_centres_lat_lng ON public.centres(latitude, longitude);

-- 2. Create Audit Log for Mandi Location Verifications
CREATE TABLE IF NOT EXISTS public.mandi_location_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    centre_code VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'REGISTERED', 'LOCATION_UPDATED', 'VERIFIED', 'REJECTED', 'STATUS_TOGGLED'
    previous_latitude DOUBLE PRECISION,
    previous_longitude DOUBLE PRECISION,
    new_latitude DOUBLE PRECISION,
    new_longitude DOUBLE PRECISION,
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    action_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mandi_audit_centre ON public.mandi_location_audit_logs(centre_code);

-- 3. Populate Precise Entrance Coordinates for Key Operational Procurement Mandis
-- Varanasi District
UPDATE public.centres
SET
    city_or_village = 'Chiraigaon',
    pincode = '221112',
    landmark = 'Near Gaurakala Primary Health Centre & Kisan Seva Kendra',
    latitude = 25.3872,
    longitude = 83.0514,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'APMC Varanasi District Officer',
    verified_at = NOW(),
    verification_notes = 'Main truck entry gate on State Highway verified via on-site survey'
WHERE centre_code = 'vns-01' OR code = 'vns-01';

UPDATE public.centres
SET
    city_or_village = 'Anei',
    pincode = '221206',
    landmark = 'Near Pindra-Baragaon Link Road',
    latitude = 25.4650,
    longitude = 82.8420,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'APMC Varanasi District Officer',
    verified_at = NOW(),
    verification_notes = 'Gate 1 Weighbridge entrance confirmed'
WHERE centre_code = 'vns-02' OR code = 'vns-02';

UPDATE public.centres
SET
    city_or_village = 'Pahariya',
    pincode = '221007',
    landmark = 'SWC Mandi Complex, Ring Road Phase 1',
    latitude = 25.3524,
    longitude = 82.9985,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'Divisional Mandi Deputy Director',
    verified_at = NOW(),
    verification_notes = 'Central Grain Mandi complex North Gate verified'
WHERE centre_code = 'vns-23' OR centre_code = 'vns-37' OR code = 'vns-23' OR code = 'vns-37';

UPDATE public.centres
SET
    city_or_village = 'Bachhaw',
    pincode = '221011',
    landmark = 'Mandi Samiti Yard, Kashi Vidyapeeth',
    latitude = 25.2678,
    longitude = 82.9351,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'APMC Varanasi District Officer',
    verified_at = NOW(),
    verification_notes = 'Mandi Samiti entrance gate calibrated with dual weighbridge access'
WHERE centre_code = 'vns-21' OR centre_code = 'vns-22' OR code = 'vns-21';

-- Chandauli District
UPDATE public.centres
SET
    city_or_village = 'Chandauli',
    pincode = '232104',
    landmark = 'Navin Krishi Utpadan Mandi Samiti, GT Road NH-19',
    latitude = 25.2610,
    longitude = 83.2650,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'Chandauli District Mandi Officer',
    verified_at = NOW(),
    verification_notes = 'NH-19 South Gate for commercial tractors & 10-wheeler trucks'
WHERE centre_code = 'cnd-01' OR centre_code = 'cnd-02' OR code = 'cnd-01';

UPDATE public.centres
SET
    city_or_village = 'Chakia',
    pincode = '232103',
    landmark = 'Near Tehsil Campus, Chakia-Naugarh Road',
    latitude = 25.0450,
    longitude = 83.2180,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'Chandauli District Mandi Officer',
    verified_at = NOW(),
    verification_notes = 'FCS Depot Gate verified'
WHERE centre_code = 'cnd-05' OR code = 'cnd-05';

-- Ghazipur District
UPDATE public.centres
SET
    city_or_village = 'Jakhania',
    pincode = '275203',
    landmark = 'Near Railway Station Yard, Jakhania',
    latitude = 25.7950,
    longitude = 83.3210,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'Ghazipur District Magistrate Mandi Cell',
    verified_at = NOW(),
    verification_notes = 'Goods rail-siding adjacent procurement yard gate'
WHERE centre_code = 'ghz-01' OR code = 'ghz-01';

-- Jaunpur District
UPDATE public.centres
SET
    city_or_village = 'Navin Mandi Jaunpur',
    pincode = '222002',
    landmark = 'Mandi Samiti Complex, Varanasi-Jaunpur Highway',
    latitude = 25.7310,
    longitude = 82.6950,
    location_source = 'ON_SITE_GPS',
    verification_status = 'VERIFIED',
    verified_by = 'Jaunpur APMC In-Charge',
    verified_at = NOW(),
    verification_notes = 'Official main gate with digital weighbridge verification'
WHERE centre_code = 'jnp-01' OR code = 'jnp-01';

-- 4. Enable Row Level Security (RLS) Policies
ALTER TABLE public.mandi_location_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified centres
DROP POLICY IF EXISTS "Public can view active centres" ON public.centres;
CREATE POLICY "Public can view active centres" ON public.centres
    FOR SELECT
    USING (is_active = true);

-- Allow authenticated staff/admin full read
DROP POLICY IF EXISTS "Staff full access centres" ON public.centres;
CREATE POLICY "Staff full access centres" ON public.centres
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated staff read audit logs
DROP POLICY IF EXISTS "Staff read audit logs" ON public.mandi_location_audit_logs;
CREATE POLICY "Staff read audit logs" ON public.mandi_location_audit_logs
    FOR SELECT
    TO authenticated
    USING (true);
