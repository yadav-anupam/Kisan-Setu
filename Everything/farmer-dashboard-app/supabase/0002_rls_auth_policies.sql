-- =============================================================================
-- Kisan Setu - RLS Policies Integration with True Supabase Auth
-- =============================================================================
-- Run this script in the Supabase SQL Editor.
-- This script safely drops existing broken RLS policies and replaces them 
-- with robust policies that leverage auth.jwt() -> 'user_metadata' mappings.
-- =============================================================================

-- Ensure RLS is fully enabled on all relevant tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dbt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_verifications ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Clean up old potentially broken policies
-- -----------------------------------------------------------------------------
DO $block
BEGIN
  -- Drop from farmers
  DROP POLICY IF EXISTS "Farmers can view own profile" ON public.farmers;
  DROP POLICY IF EXISTS "Farmers can update own profile" ON public.farmers;
  DROP POLICY IF EXISTS "Allow farmer registration" ON public.farmers;
  
  -- Drop from staff_users
  DROP POLICY IF EXISTS "Staff can view own profile" ON public.staff_users;
  DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_users;
  DROP POLICY IF EXISTS "Admin can manage staff" ON public.staff_users;
  
  -- Drop from bookings
  DROP POLICY IF EXISTS "View bookings policy" ON public.bookings;
  DROP POLICY IF EXISTS "Create bookings policy" ON public.bookings;
  DROP POLICY IF EXISTS "Update bookings policy" ON public.bookings;
  
  -- Drop from procurements
  DROP POLICY IF EXISTS "View procurements policy" ON public.procurements;
  DROP POLICY IF EXISTS "Staff insert procurements" ON public.procurements;
  DROP POLICY IF EXISTS "Centre Admin approve DBT procurements" ON public.procurements;
EXCEPTION WHEN OTHERS THEN 
  -- Ignore if policies do not exist
END $block;

-- -----------------------------------------------------------------------------
-- 1. FARMERS TABLE POLICIES
-- -----------------------------------------------------------------------------
-- A Farmer can read and update their own row based on the farmer_id claim in their JWT
CREATE POLICY "Farmers can manage own profile"
  ON public.farmers FOR ALL
  TO authenticated
  USING (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

-- Allow authenticated users who just signed up to insert their own profile
CREATE POLICY "Allow farmer registration via auth"
  ON public.farmers FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
  );

-- -----------------------------------------------------------------------------
-- 2. STAFF USERS TABLE POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Staff can view and update own profile"
  ON public.staff_users FOR ALL
  TO authenticated
  USING (
    staff_id = (auth.jwt() -> 'user_metadata' ->> 'staff_id')
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'MANDI_ADMIN'
  );

-- Allow admins or the user themselves (on sign-up) to insert
CREATE POLICY "Allow staff registration via auth"
  ON public.staff_users FOR INSERT
  TO authenticated
  WITH CHECK (
    staff_id = (auth.jwt() -> 'user_metadata' ->> 'staff_id')
    OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'MANDI_ADMIN'
  );

-- -----------------------------------------------------------------------------
-- 3. BOOKINGS POLICIES
-- -----------------------------------------------------------------------------
-- Farmers see their own. Staff see all bookings for their centre. Admins see all.
CREATE POLICY "Bookings Read Access"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
    OR
    (
      (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
    )
  );

-- Farmers can insert their own bookings
CREATE POLICY "Bookings Insert Access"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
  );

-- Staff can verify/update bookings
CREATE POLICY "Bookings Update Access"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

-- -----------------------------------------------------------------------------
-- 4. PROCUREMENTS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Procurements Read Access"
  ON public.procurements FOR SELECT
  TO authenticated
  USING (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

-- Only Staff/Admins can create or modify procurements
CREATE POLICY "Procurements Write Access"
  ON public.procurements FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

CREATE POLICY "Procurements Update Access"
  ON public.procurements FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

-- -----------------------------------------------------------------------------
-- 5. DBT PAYMENTS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "DBT Payments Read Access"
  ON public.dbt_payments FOR SELECT
  TO authenticated
  USING (
    farmer_id = (auth.jwt() -> 'user_metadata' ->> 'farmer_id')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

-- Only Admin can insert/update DBT payments
CREATE POLICY "DBT Payments Write Access"
  ON public.dbt_payments FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'MANDI_ADMIN'
  );

-- -----------------------------------------------------------------------------
-- 6. VERIFICATION AUDIT LOGS POLICIES
-- -----------------------------------------------------------------------------
-- Audit logs should be readable by staff, but inserts are allowed by verifying staff
CREATE POLICY "Audit Logs Read Access"
  ON public.booking_verifications FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
  );

CREATE POLICY "Audit Logs Write Access"
  ON public.booking_verifications FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('MANDI_ADMIN', 'CENTRE_OPERATOR', 'STAFF')
    AND
    staff_id = (auth.jwt() -> 'user_metadata' ->> 'staff_id')
  );
