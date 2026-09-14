-- =============================================================================
-- Kisan Setu — Fix Staff Users Table RLS & Permissions
-- Run this script in the Supabase SQL Editor
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    staff_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF',
    centre_id TEXT NOT NULL,
    centre_name TEXT NOT NULL,
    designation TEXT,
    section TEXT,
    shift TEXT,
    desk_assigned TEXT,
    password_hash TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access on staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Staff users access policy" ON public.staff_users;
DROP POLICY IF EXISTS "Admin manage staff users" ON public.staff_users;
DROP POLICY IF EXISTS "Staff can view own profile" ON public.staff_users;
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_users;
DROP POLICY IF EXISTS "Admin can manage staff" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff registration via auth" ON public.staff_users;
DROP POLICY IF EXISTS "Staff View Access" ON public.staff_users;
DROP POLICY IF EXISTS "Hierarchical Staff Creation" ON public.staff_users;
DROP POLICY IF EXISTS "Hierarchical Staff Update" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff select" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff insert" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff update" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff delete" ON public.staff_users;

CREATE POLICY "Allow staff select"
ON public.staff_users FOR SELECT
USING (true);

CREATE POLICY "Allow staff insert"
ON public.staff_users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow staff update"
ON public.staff_users FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow staff delete"
ON public.staff_users FOR DELETE
USING (true);

GRANT ALL ON public.staff_users TO anon;
GRANT ALL ON public.staff_users TO authenticated;
GRANT ALL ON public.staff_users TO service_role;
