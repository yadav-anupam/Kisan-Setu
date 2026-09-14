-- =============================================================================
-- Kisan Setu — Live Queue & Gate Pass Verification Atomic RPC
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vcmpigosbcttphodpvry/sql
-- =============================================================================

-- 1. Create live_queue table
CREATE TABLE IF NOT EXISTS public.live_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT,
    centre_id TEXT NOT NULL,
    centre_name TEXT NOT NULL,
    slot_id TEXT,
    token_number TEXT NOT NULL,
    queue_position INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING' CHECK (status IN ('WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'SKIPPED', 'CANCELLED')),
    counter_id TEXT DEFAULT 'Bay 2',
    commodity TEXT,
    quantity NUMERIC DEFAULT 0,
    vehicle_number TEXT,
    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    called_at TIMESTAMPTZ,
    service_started_at TIMESTAMPTZ,
    service_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_live_queue_centre ON public.live_queue(centre_id);
CREATE INDEX IF NOT EXISTS idx_live_queue_booking ON public.live_queue(booking_id);
CREATE INDEX IF NOT EXISTS idx_live_queue_farmer ON public.live_queue(farmer_id);
CREATE INDEX IF NOT EXISTS idx_live_queue_status ON public.live_queue(status);
CREATE INDEX IF NOT EXISTS idx_live_queue_pos ON public.live_queue(centre_id, queue_position);
CREATE INDEX IF NOT EXISTS idx_live_queue_created ON public.live_queue(created_at);

-- 3. Enable RLS and setup policies
ALTER TABLE public.live_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow live queue select" ON public.live_queue;
DROP POLICY IF EXISTS "Allow live queue insert" ON public.live_queue;
DROP POLICY IF EXISTS "Allow live queue update" ON public.live_queue;
DROP POLICY IF EXISTS "Allow live queue delete" ON public.live_queue;

CREATE POLICY "Allow live queue select" ON public.live_queue FOR SELECT USING (true);
CREATE POLICY "Allow live queue insert" ON public.live_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow live queue update" ON public.live_queue FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow live queue delete" ON public.live_queue FOR DELETE USING (true);

GRANT ALL ON public.live_queue TO anon;
GRANT ALL ON public.live_queue TO authenticated;
GRANT ALL ON public.live_queue TO service_role;

-- 4. Atomic Function: verify_gate_pass_and_join_queue
CREATE OR REPLACE FUNCTION public.verify_gate_pass_and_join_queue(
    p_token_or_booking TEXT,
    p_staff_id TEXT,
    p_staff_name TEXT,
    p_staff_centre_id TEXT,
    p_staff_centre_name TEXT,
    p_remarks TEXT DEFAULT 'Verified at Gate Intake Desk'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_clean_token TEXT;
    v_existing_queue RECORD;
    v_next_pos INTEGER;
    v_queue_entry RECORD;
    v_now TIMESTAMPTZ := NOW();
    v_token_hash TEXT;
BEGIN
    v_clean_token := TRIM(p_token_or_booking);
    IF v_clean_token LIKE 'KS1|%' THEN
        v_clean_token := SUBSTRING(v_clean_token FROM 5);
    END IF;

    -- 1. Locate booking
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id::TEXT = v_clean_token
       OR booking_number ILIKE v_clean_token
       OR token_number ILIKE v_clean_token
       OR qr_token_hash ILIKE v_clean_token
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'NOT_FOUND',
            'message', 'Booking record not found for this gate pass.'
        );
    END IF;

    -- 2. Check if cancelled
    IF v_booking.status = 'CANCELLED' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'CANCELLED_BOOKING',
            'message', 'This booking has been cancelled and cannot be admitted to the yard.'
        );
    END IF;

    -- 3. Check if already completed
    IF v_booking.status = 'COMPLETED' THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_COMPLETED',
            'message', 'This booking has already completed weighment and procurement.'
        );
    END IF;

    -- 4. Check already checked in or in queue
    SELECT * INTO v_existing_queue
    FROM public.live_queue
    WHERE booking_id = v_booking.id;

    IF FOUND AND v_existing_queue.status IN ('WAITING', 'CALLED', 'IN_SERVICE') THEN
        RETURN jsonb_build_object(
            'success', false,
            'code', 'ALREADY_CHECKED_IN',
            'message', 'Farmer is already checked in and active at queue position #' || v_existing_queue.queue_position || '.',
            'queueEntry', row_to_json(v_existing_queue)
        );
    END IF;

    -- 5. Check centre match
    IF p_staff_centre_name IS NOT NULL AND p_staff_centre_name <> '' AND p_staff_centre_name <> 'ALL' THEN
        IF v_booking.centre_name IS NOT NULL AND v_booking.centre_name <> '' AND
           LOWER(v_booking.centre_name) <> LOWER(p_staff_centre_name) AND
           NOT (v_booking.centre_name ILIKE '%' || p_staff_centre_name || '%' OR p_staff_centre_name ILIKE '%' || v_booking.centre_name || '%') THEN
            RETURN jsonb_build_object(
                'success', false,
                'code', 'CENTRE_MISMATCH',
                'message', 'Gate pass is registered for ' || v_booking.centre_name || ', but scanned at ' || p_staff_centre_name || '.'
            );
        END IF;
    END IF;

    -- 6. Calculate next monotonic queue position for the centre
    SELECT COALESCE(MAX(queue_position), 0) + 1 INTO v_next_pos
    FROM public.live_queue
    WHERE centre_id = COALESCE(v_booking.centre_id, p_staff_centre_id, 'centre-up-vns-01')
      AND DATE(created_at) = DATE(v_now);

    -- 7. Update booking to CHECKED_IN / VERIFIED
    UPDATE public.bookings
    SET status = 'CHECKED_IN',
        verification_status = 'VERIFIED',
        verified_by = p_staff_id,
        verified_by_name = p_staff_name,
        verified_at = v_now,
        verification_remarks = p_remarks,
        updated_at = v_now
    WHERE id = v_booking.id;

    -- 8. Insert or reactivate live_queue entry
    INSERT INTO public.live_queue (
        booking_id,
        farmer_id,
        farmer_name,
        farmer_phone,
        centre_id,
        centre_name,
        slot_id,
        token_number,
        queue_position,
        status,
        counter_id,
        commodity,
        quantity,
        vehicle_number,
        checked_in_at,
        created_at,
        updated_at
    )
    VALUES (
        v_booking.id,
        v_booking.farmer_id,
        v_booking.farmer_name,
        v_booking.farmer_phone,
        COALESCE(v_booking.centre_id, p_staff_centre_id, 'centre-up-vns-01'),
        COALESCE(v_booking.centre_name, p_staff_centre_name, 'Chiraigaon 1st at Gaurakala (FCS)'),
        v_booking.slot_id,
        v_booking.token_number,
        v_next_pos,
        'WAITING',
        'Bay 2',
        v_booking.commodity,
        COALESCE(v_booking.quantity, 40),
        COALESCE(v_booking.vehicle_number, ''),
        v_now,
        v_now,
        v_now
    )
    ON CONFLICT (booking_id) DO UPDATE
    SET queue_position = v_next_pos,
        status = 'WAITING',
        checked_in_at = v_now,
        updated_at = v_now
    RETURNING * INTO v_queue_entry;

    -- 9. Insert verification audit log
    INSERT INTO public.booking_verifications (
        booking_id,
        booking_number,
        staff_id,
        staff_name,
        centre_name,
        action,
        result,
        remarks,
        scanned_at
    )
    VALUES (
        v_booking.id,
        v_booking.booking_number,
        p_staff_id,
        p_staff_name,
        COALESCE(p_staff_centre_name, v_booking.centre_name),
        'VERIFY',
        'VALID',
        p_remarks,
        v_now
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Gate pass verified successfully. Farmer joined the live queue at Position #' || v_next_pos || '.',
        'booking', jsonb_build_object(
            'id', v_booking.id,
            'booking_number', v_booking.booking_number,
            'token_number', v_booking.token_number,
            'status', 'CHECKED_IN',
            'verification_status', 'VERIFIED'
        ),
        'queueEntry', row_to_json(v_queue_entry)
    );
END;
$$;

-- 5. Helper RPCs for Operator Queue Dispatch
CREATE OR REPLACE FUNCTION public.call_queue_token(
    p_queue_id UUID,
    p_counter_id TEXT DEFAULT 'Bay 2'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_entry RECORD;
BEGIN
    UPDATE public.live_queue
    SET status = 'CALLED',
        counter_id = p_counter_id,
        called_at = NOW(),
        updated_at = NOW()
    WHERE id = p_queue_id
    RETURNING * INTO v_entry;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Queue entry not found.');
    END IF;

    UPDATE public.bookings
    SET status = 'CALLED',
        updated_at = NOW()
    WHERE id = v_entry.booking_id;

    RETURN jsonb_build_object('success', true, 'queueEntry', row_to_json(v_entry));
END;
$$;

CREATE OR REPLACE FUNCTION public.start_queue_service(
    p_queue_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_entry RECORD;
BEGIN
    UPDATE public.live_queue
    SET status = 'IN_SERVICE',
        service_started_at = NOW(),
        updated_at = NOW()
    WHERE id = p_queue_id
    RETURNING * INTO v_entry;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Queue entry not found.');
    END IF;

    UPDATE public.bookings
    SET status = 'SERVING',
        updated_at = NOW()
    WHERE id = v_entry.booking_id;

    RETURN jsonb_build_object('success', true, 'queueEntry', row_to_json(v_entry));
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_queue_service(
    p_queue_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_entry RECORD;
BEGIN
    UPDATE public.live_queue
    SET status = 'COMPLETED',
        service_completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_queue_id
    RETURNING * INTO v_entry;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Queue entry not found.');
    END IF;

    UPDATE public.bookings
    SET status = 'COMPLETED',
        updated_at = NOW()
    WHERE id = v_entry.booking_id;

    RETURN jsonb_build_object('success', true, 'queueEntry', row_to_json(v_entry));
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_gate_pass_and_join_queue TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.call_queue_token TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.start_queue_service TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.complete_queue_service TO anon, authenticated, service_role;
