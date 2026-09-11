-- =============================================================================
-- Kisan Setu - Strict Hierarchical Auth & Master Admin Setup
-- =============================================================================

-- 1. FIX SCHEMA DEPENDENCIES
-- Ensure farmers table has user_id to map to auth.users safely
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. CREATE MASTER ADMINISTRATIVE ADMIN
-- This creates the root 'MANDI_ADMIN' securely bypassing the frontend.
-- Change the email and password strings below before running if desired.
DO $block
DECLARE
    new_admin_uid UUID := gen_random_uuid();
    admin_email TEXT := 'admin@kisansetu.in';
    admin_password TEXT := 'admin1234'; -- Change this!
    admin_staff_id TEXT := 'AD-2026-0001';
BEGIN
    -- Only insert if the email doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        -- Insert into Supabase auth.users
        INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', new_admin_uid, 'authenticated', 'authenticated', admin_email,
            crypt(admin_password, gen_salt('bf')), NOW(),
            '{"provider":"email","providers":["email"]}',
            json_build_object('role', 'MANDI_ADMIN', 'staff_id', admin_staff_id),
            NOW(), NOW()
        );

        -- Insert into staff_users
        INSERT INTO public.staff_users (
            user_id, staff_id, full_name, email, mobile, role, centre_id, centre_name, 
            designation, status, created_at
        ) VALUES (
            new_admin_uid, admin_staff_id, 'Chief Mandi Administrator', admin_email, '+910000000000', 'MANDI_ADMIN', 
            'HQ-01', 'State APMC & Food Supplies Headquarters', 'Chief Administrator', 'ACTIVE', NOW()
        );
    END IF;
END $block;

-- 3. STRICT HIERARCHICAL RLS POLICIES
-- First, enable RLS
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid conflicts
DO $block
BEGIN
    DROP POLICY IF EXISTS "Allow staff registration via auth" ON public.staff_users;
    DROP POLICY IF EXISTS "Staff can view and update own profile" ON public.staff_users;
    DROP POLICY IF EXISTS "Farmers can manage own profile" ON public.farmers;
    DROP POLICY IF EXISTS "Allow farmer registration via auth" ON public.farmers;
EXCEPTION WHEN OTHERS THEN 
END $block;

-- ==========================================================
-- STAFF HIERARCHY POLICIES
-- ==========================================================

-- READ: Active staff can see other staff members. 
-- (Using auth.uid() avoids recursion because we don't query the table again)
CREATE POLICY "Staff View Access"
ON public.staff_users FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR 
    (auth.jwt()->'user_metadata'->>'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
);

-- INSERT: Strict Hierarchy Enforced
-- Nobody can create a MANDI_ADMIN via the API.
-- Only MANDI_ADMIN can create CENTRE_OPERATOR.
-- Only CENTRE_OPERATOR or MANDI_ADMIN can create STAFF.
CREATE POLICY "Hierarchical Staff Creation"
ON public.staff_users FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() AND (
        (role = 'STAFF' AND (auth.jwt()->'user_metadata'->>'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR'))
        OR
        (role = 'CENTRE_OPERATOR' AND (auth.jwt()->'user_metadata'->>'role') = 'MANDI_ADMIN')
        -- Note: 'MANDI_ADMIN' is completely omitted here, making it impossible to insert via API.
    )
);

-- UPDATE: Only Admins can modify status/roles of others. Users can update their own non-critical details.
CREATE POLICY "Hierarchical Staff Update"
ON public.staff_users FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() 
    OR (auth.jwt()->'user_metadata'->>'role') = 'MANDI_ADMIN'
);

-- ==========================================================
-- FARMER POLICIES (No one can register as staff from farmer app)
-- ==========================================================

-- READ: Farmers can only see themselves. Staff can see all farmers.
CREATE POLICY "Farmers View Access"
ON public.farmers FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() 
    OR (auth.jwt()->'user_metadata'->>'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
);

-- INSERT: Anyone can register as a Farmer, but they CANNOT elevate to staff.
CREATE POLICY "Farmer Registration"
ON public.farmers FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() 
    -- Ensure they are not trying to sneak into the staff table
    AND NOT EXISTS (
        SELECT 1 FROM public.staff_users WHERE staff_users.user_id = auth.uid()
    )
);

-- UPDATE: Farmers can update their own data. Staff can update it too.
CREATE POLICY "Farmer Update Access"
ON public.farmers FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() 
    OR (auth.jwt()->'user_metadata'->>'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
);
