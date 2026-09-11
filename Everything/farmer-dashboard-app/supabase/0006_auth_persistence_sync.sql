-- =============================================================================
-- Kisan Setu — Migration 0006: Auth Persistence & Profile Synchronization
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Restore and Ensure Auth Schema Permissions for Supabase GoTrue
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- -----------------------------------------------------------------------------
-- 2. Canonical public.centres Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_code VARCHAR(50) UNIQUE NOT NULL,
    centre_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Uttar Pradesh',
    block_tehsil VARCHAR(100),
    agency VARCHAR(50) NOT NULL,
    crops TEXT DEFAULT 'Paddy / Bajara / Makka / Wheat',
    address TEXT NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 05:00 PM',
    status VARCHAR(50) DEFAULT 'Listed 2026–27',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_centres_district ON public.centres(district);
CREATE INDEX IF NOT EXISTS idx_centres_code ON public.centres(centre_code);

-- -----------------------------------------------------------------------------
-- 3. Unified Application Profiles Table (public.profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'FARMER',
    full_name VARCHAR(255),
    phone VARCHAR(30),
    email VARCHAR(255),
    account_status VARCHAR(30) DEFAULT 'ACTIVE',
    centre_id UUID REFERENCES public.centres(id) ON DELETE SET NULL,
    centre_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- -----------------------------------------------------------------------------
-- 4. Auth User Auto-Sync Trigger
-- Automatically synchronizes every auth.users record into public.profiles
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id,
        role,
        full_name,
        phone,
        email,
        account_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'mobile', NEW.phone, ''),
        NEW.email,
        'ACTIVE',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
        phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.profiles.phone END,
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 5. Standardize public.farmers & public.staff_users Columns & References
-- -----------------------------------------------------------------------------
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS centre_id UUID REFERENCES public.centres(id) ON DELETE SET NULL;

ALTER TABLE public.staff_users ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff_users ADD COLUMN IF NOT EXISTS centre_ref_id UUID REFERENCES public.centres(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 6. Atomic Stored Procedure: Register Farmer
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_farmer_atomic(
    p_farmer_id TEXT,
    p_name TEXT,
    p_mobile TEXT,
    p_email TEXT,
    p_gender TEXT,
    p_dob DATE,
    p_state TEXT,
    p_district TEXT,
    p_tehsil TEXT,
    p_village TEXT,
    p_pincode TEXT,
    p_preferred_mandi TEXT,
    p_khasra_number TEXT,
    p_land_area_acres NUMERIC,
    p_bank_name TEXT,
    p_account_number_masked TEXT,
    p_ifsc_code TEXT,
    p_vehicle_number TEXT,
    p_pin_hash TEXT,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_farmer_record RECORD;
BEGIN
    -- Check if farmer already exists by mobile
    IF EXISTS (SELECT 1 FROM public.farmers WHERE mobile = p_mobile) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'MOBILE_ALREADY_EXISTS',
            'message', 'A farmer is already registered with this mobile number.'
        );
    END IF;

    -- Insert farmer record
    INSERT INTO public.farmers (
        farmer_id, name, mobile, email, gender, dob, state, district,
        tehsil, village, pincode, preferred_mandi, khasra_number,
        land_area_acres, bank_name, account_number_masked, ifsc_code,
        vehicle_number, pin_hash, kyc_status, user_id, created_at, updated_at
    ) VALUES (
        p_farmer_id, p_name, p_mobile, p_email, p_gender, p_dob, p_state, p_district,
        p_tehsil, p_village, p_pincode, p_preferred_mandi, p_khasra_number,
        p_land_area_acres, p_bank_name, p_account_number_masked, p_ifsc_code,
        p_vehicle_number, p_pin_hash, 'VERIFIED', p_user_id, NOW(), NOW()
    )
    RETURNING * INTO v_farmer_record;

    -- Create initial welcome notification
    INSERT INTO public.farmer_notifications (
        farmer_id, title, message, category, is_read, created_at
    ) VALUES (
        p_farmer_id,
        'Welcome to Kisan Setu!',
        'Your farmer account has been registered and verified for direct MSP procurement.',
        'SYSTEM',
        false,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'farmer_id', v_farmer_record.farmer_id,
        'name', v_farmer_record.name,
        'mobile', v_farmer_record.mobile,
        'message', 'Farmer registration successfully persisted to database.'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 7. Atomic Stored Procedure: Appoint Staff Officer
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.appoint_staff_officer_atomic(
    p_staff_id TEXT,
    p_full_name TEXT,
    p_mobile TEXT,
    p_email TEXT,
    p_role TEXT,
    p_centre_id TEXT,
    p_centre_name TEXT,
    p_designation TEXT,
    p_section TEXT,
    p_shift_hours TEXT,
    p_desk_assigned TEXT,
    p_password_hash TEXT,
    p_appointed_by TEXT DEFAULT 'ADMIN',
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_staff_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM public.staff_users WHERE email ILIKE p_email OR mobile = p_mobile) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'STAFF_ALREADY_EXISTS',
            'message', 'A staff officer is already registered with this email or mobile number.'
        );
    END IF;

    INSERT INTO public.staff_users (
        staff_id, full_name, mobile, email, role, centre_id, centre_name,
        designation, section, shift_hours, desk_assigned, password_hash,
        status, appointed_by, user_id, created_at, updated_at
    ) VALUES (
        p_staff_id, p_full_name, p_mobile, p_email, p_role, p_centre_id, p_centre_name,
        p_designation, p_section, p_shift_hours, p_desk_assigned, p_password_hash,
        'ACTIVE', p_appointed_by, p_user_id, NOW(), NOW()
    )
    RETURNING * INTO v_staff_record;

    RETURN jsonb_build_object(
        'success', true,
        'staff_id', v_staff_record.staff_id,
        'full_name', v_staff_record.full_name,
        'role', v_staff_record.role,
        'message', 'Staff officer successfully appointed and persisted.'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error_code', SQLSTATE,
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 8. Row Level Security Policies
-- -----------------------------------------------------------------------------
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- Centres: Publicly viewable by anyone, manageable by Admin
DROP POLICY IF EXISTS "Public can view centres" ON public.centres;
CREATE POLICY "Public can view centres" ON public.centres FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin can manage centres" ON public.centres;
CREATE POLICY "Admin can manage centres" ON public.centres FOR ALL TO authenticated
USING (
    auth.jwt()->'user_metadata'->>'role' IN ('ADMIN', 'MANDI_ADMIN')
);

-- Profiles: Users view own profile, Admins view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
USING (
    user_id = auth.uid()
    OR auth.jwt()->'user_metadata'->>'role' IN ('ADMIN', 'MANDI_ADMIN')
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Farmers: Public can view for booking verification; Farmers manage own
DROP POLICY IF EXISTS "Public view farmers" ON public.farmers;
CREATE POLICY "Public view farmers" ON public.farmers FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Farmers manage own profile" ON public.farmers;
CREATE POLICY "Farmers manage own profile" ON public.farmers FOR ALL TO authenticated
USING (
    user_id = auth.uid()
    OR farmer_id = (auth.jwt()->'user_metadata'->>'farmer_id')
    OR auth.jwt()->'user_metadata'->>'role' IN ('ADMIN', 'MANDI_ADMIN', 'STAFF', 'CENTRE_OPERATOR')
);

-- Staff Users: Viewable by staff and public booking lookup
DROP POLICY IF EXISTS "Staff users access policy" ON public.staff_users;
CREATE POLICY "Staff users access policy" ON public.staff_users FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Admin manage staff users" ON public.staff_users;
CREATE POLICY "Admin manage staff users" ON public.staff_users FOR ALL TO authenticated
USING (
    user_id = auth.uid()
    OR auth.jwt()->'user_metadata'->>'role' IN ('ADMIN', 'MANDI_ADMIN')
);
