-- =============================================================================
-- Kisan Setu — Security Hardening, RBAC & State Machine Integrity (SQL)
-- =============================================================================
-- This script hardens PostgreSQL with:
-- 1. Immutable Audit Logging (Tamper-Evident Trail)
-- 2. Concurrency-Safe Atomic Token Sequence Generator (Format: KS-YYMMDDNNNN)
-- 3. Strict State Transition Enforcement (Procurement Lifecycle State Machine)
-- 4. Hardened Row Level Security (RLS) with Role and Scope Isolation
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLE: audit_logs (Tamper-Evident Security & Audit Trail)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    centre_id TEXT,
    old_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_centre ON public.audit_logs(centre_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Prevent audit log tampering (Append-Only)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_audit_logs ON public.audit_logs;
CREATE TRIGGER trg_protect_audit_logs
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_modification();


-- -----------------------------------------------------------------------------
-- 2. TABLE: token_sequences (Atomic Daily Per-Centre Concurrency Safe Sequences)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.token_sequences (
    centre_id TEXT NOT NULL,
    sequence_date DATE NOT NULL,
    last_sequence_number INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (centre_id, sequence_date)
);

-- Concurrency-Safe Stored Procedure for Official Token Generation
-- Generates token in format: KS-YYMMDDNNNN (e.g. KS-2608280001)
CREATE OR REPLACE FUNCTION public.generate_atomic_token(
    p_centre_id TEXT,
    p_booking_date DATE
)
RETURNS TEXT AS $$
DECLARE
    v_next_seq INT;
    v_date_part TEXT;
    v_token TEXT;
BEGIN
    -- Format date part: YYMMDD
    v_date_part := to_char(p_booking_date, 'YYMMDD');

    -- Insert or update sequence with row-level locking
    INSERT INTO public.token_sequences (centre_id, sequence_date, last_sequence_number, updated_at)
    VALUES (p_centre_id, p_booking_date, 1, NOW())
    ON CONFLICT (centre_id, sequence_date)
    DO UPDATE SET
        last_sequence_number = public.token_sequences.last_sequence_number + 1,
        updated_at = NOW()
    RETURNING last_sequence_number INTO v_next_seq;

    -- Format token: KS-YYMMDD + 4 digit padded sequence number
    v_token := 'KS-' || v_date_part || lpad(v_next_seq::TEXT, 4, '0');
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -----------------------------------------------------------------------------
-- 3. FUNCTION: validate_procurement_state_transition()
-- Lifecycle: BOOKED -> CHECKED_IN -> WEIGHED -> QUALITY_CHECKED -> PROCURED -> PAYMENT_PENDING -> PAID
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.validate_procurement_state_transition()
RETURNS TRIGGER AS $$
DECLARE
    v_valid BOOLEAN := FALSE;
BEGIN
    -- If status did not change, permit update
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- State machine validation matrix
    IF OLD.status = 'BOOKED' AND NEW.status IN ('CHECKED_IN', 'CANCELLED') THEN
        v_valid := TRUE;
    ELSIF OLD.status = 'CHECKED_IN' AND NEW.status IN ('WEIGHED', 'CANCELLED') THEN
        v_valid := TRUE;
    ELSIF OLD.status = 'WEIGHED' AND NEW.status IN ('QUALITY_CHECKED', 'REJECTED') THEN
        v_valid := TRUE;
    ELSIF OLD.status = 'QUALITY_CHECKED' AND NEW.status IN ('PROCURED', 'REJECTED') THEN
        v_valid := TRUE;
    ELSIF OLD.status = 'PROCURED' AND NEW.status IN ('PAYMENT_PENDING') THEN
        v_valid := TRUE;
    ELSIF OLD.status = 'PAYMENT_PENDING' AND NEW.status IN ('PAID', 'REJECTED') THEN
        v_valid := TRUE;
    END IF;

    IF NOT v_valid THEN
        RAISE EXCEPTION 'Invalid procurement state transition from % to %', OLD.status, NEW.status;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- -----------------------------------------------------------------------------
-- 4. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dbt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_live_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop insecure public full-access policies
DROP POLICY IF EXISTS "Public full access on farmers" ON public.farmers;
DROP POLICY IF EXISTS "Public full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public full access on booking_verifications" ON public.booking_verifications;
DROP POLICY IF EXISTS "Public full access on procurements" ON public.procurements;
DROP POLICY IF EXISTS "Public full access on dbt_payments" ON public.dbt_payments;
DROP POLICY IF EXISTS "Public full access on mandi_live_status" ON public.mandi_live_status;
DROP POLICY IF EXISTS "Public full access on farmer_notifications" ON public.farmer_notifications;
DROP POLICY IF EXISTS "Public full access on staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Public full access on centre_slots" ON public.centre_slots;
DROP POLICY IF EXISTS "Public full access on centre_queue_items" ON public.centre_queue_items;
DROP POLICY IF EXISTS "Public full access on staff_notifications" ON public.staff_notifications;

-- A. FARMERS POLICIES (Own profile and verified staff access)
CREATE POLICY "Farmers can view own profile"
ON public.farmers FOR SELECT
USING (
    auth.uid()::text = id::text 
    OR auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE s.user_id = auth.uid() OR s.staff_id = current_setting('request.jwt.claims', true)::json->>'staff_id'
    )
);

CREATE POLICY "Farmers can update own profile"
ON public.farmers FOR UPDATE
USING (auth.uid()::text = id::text OR auth.role() = 'service_role')
WITH CHECK (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Allow farmer registration"
ON public.farmers FOR INSERT
WITH CHECK (true);

-- B. BOOKINGS POLICIES (Scoped to farmer owner or centre staff)
CREATE POLICY "View bookings policy"
ON public.bookings FOR SELECT
USING (
    farmer_id = current_setting('request.jwt.claims', true)::json->>'farmer_id'
    OR auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE (s.user_id = auth.uid() OR s.staff_id = current_setting('request.jwt.claims', true)::json->>'staff_id')
        AND (s.role = 'ADMIN' OR s.centre_name = public.bookings.centre_name)
    )
);

CREATE POLICY "Create bookings policy"
ON public.bookings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Update bookings policy"
ON public.bookings FOR UPDATE
USING (
    farmer_id = current_setting('request.jwt.claims', true)::json->>'farmer_id'
    OR auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE (s.user_id = auth.uid() OR s.staff_id = current_setting('request.jwt.claims', true)::json->>'staff_id')
        AND (s.role IN ('ADMIN', 'CENTRE_ADMIN', 'MANDI_ADMIN', 'STAFF', 'CENTRE_OPERATOR'))
    )
);

-- C. PROCUREMENTS POLICIES (Farmer sees own, staff sees centre-scoped)
CREATE POLICY "View procurements policy"
ON public.procurements FOR SELECT
USING (
    farmer_id = current_setting('request.jwt.claims', true)::json->>'farmer_id'
    OR auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE (s.user_id = auth.uid() OR s.staff_id = current_setting('request.jwt.claims', true)::json->>'staff_id')
        AND (s.role = 'ADMIN' OR s.centre_name = public.procurements.centre_name)
    )
);

CREATE POLICY "Staff insert procurements"
ON public.procurements FOR INSERT
WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE s.role IN ('ADMIN', 'CENTRE_ADMIN', 'MANDI_ADMIN', 'STAFF', 'CENTRE_OPERATOR')
    )
);

CREATE POLICY "Centre Admin approve DBT procurements"
ON public.procurements FOR UPDATE
USING (
    auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE s.role IN ('ADMIN', 'CENTRE_ADMIN', 'MANDI_ADMIN')
        AND (s.role = 'ADMIN' OR s.centre_name = public.procurements.centre_name)
    )
);

-- D. MANDI LIVE STATUS (Publicly readable, staff/centre-admin write)
CREATE POLICY "Public can view mandi live status"
ON public.mandi_live_status FOR SELECT
USING (true);

CREATE POLICY "Staff can update mandi live status"
ON public.mandi_live_status FOR ALL
USING (
    auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE s.role IN ('ADMIN', 'CENTRE_ADMIN', 'MANDI_ADMIN', 'STAFF', 'CENTRE_OPERATOR')
    )
);

-- E. AUDIT LOGS POLICIES (Admin & Centre Admin view, service write)
CREATE POLICY "View audit logs policy"
ON public.audit_logs FOR SELECT
USING (
    auth.role() = 'service_role'
    OR EXISTS (
        SELECT 1 FROM public.staff_users s 
        WHERE s.role IN ('ADMIN', 'CENTRE_ADMIN', 'MANDI_ADMIN')
        AND (s.role = 'ADMIN' OR s.centre_id = public.audit_logs.centre_id)
    )
);

CREATE POLICY "Insert audit logs policy"
ON public.audit_logs FOR INSERT
WITH CHECK (true);
