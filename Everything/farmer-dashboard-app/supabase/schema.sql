-- ==============================================================================
-- Kisan Setu — Production SQL Schema for QR Slot Booking & Verification System
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. APMC Mandi Procurement Centres Table
CREATE TABLE IF NOT EXISTS public.centres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    address TEXT,
    operating_hours VARCHAR(100) DEFAULT '08:00 AM - 05:00 PM',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mandi Procurement Time Slots Table
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id UUID REFERENCES public.centres(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    max_capacity_qtl NUMERIC(10, 2) DEFAULT 1000.00,
    max_vehicles INT DEFAULT 50,
    booked_count INT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_centre_slot UNIQUE (centre_id, slot_date, start_time, commodity)
);

-- 3. Slot Bookings Table with Cryptographic QR Token Hash
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    farmer_id VARCHAR(100) NOT NULL,
    farmer_name VARCHAR(255) NOT NULL,
    farmer_phone VARCHAR(20),
    centre_id UUID REFERENCES public.centres(id),
    centre_name VARCHAR(255) NOT NULL,
    slot_id UUID REFERENCES public.slots(id),
    booking_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    commodity VARCHAR(100) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    token_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED')),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    qr_token_hash VARCHAR(64) NOT NULL, -- SHA-256 Hash of KS1|<secure-random-token>
    verified_by VARCHAR(100),
    verified_by_name VARCHAR(255),
    verified_at TIMESTAMPTZ,
    verification_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Verification Audit Log Table
CREATE TABLE IF NOT EXISTS public.booking_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    booking_number VARCHAR(50) NOT NULL,
    staff_id VARCHAR(100) NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    centre_id VARCHAR(100),
    centre_name VARCHAR(255),
    action VARCHAR(50) NOT NULL CHECK (action IN ('SCAN', 'VERIFY', 'REJECT', 'MANUAL_ENTRY')),
    result VARCHAR(50) NOT NULL CHECK (result IN ('VALID', 'ALREADY_VERIFIED', 'CANCELLED', 'EXPIRED', 'NOT_FOUND', 'UNAUTHORIZED', 'INVALID_QR')),
    remarks TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Indexes for High Performance & Token Lookup
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bookings_qr_token_hash ON public.bookings(qr_token_hash);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON public.bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_farmer_id ON public.bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_centre_date ON public.bookings(centre_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_verification_status ON public.bookings(verification_status);
CREATE INDEX IF NOT EXISTS idx_verifications_booking_id ON public.booking_verifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_verifications_staff_id ON public.booking_verifications(staff_id);
CREATE INDEX IF NOT EXISTS idx_verifications_scanned_at ON public.booking_verifications(scanned_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_verifications ENABLE ROW LEVEL SECURITY;

-- Centres & Slots: Public read
CREATE POLICY "Public Read Centres" ON public.centres FOR SELECT USING (true);
CREATE POLICY "Public Read Slots" ON public.slots FOR SELECT USING (true);

-- Bookings Policy: Farmers can read their own bookings
CREATE POLICY "Farmers can read own bookings" ON public.bookings
    FOR SELECT
    USING (
        auth.jwt() ->> 'sub' = farmer_id OR
        auth.jwt() ->> 'role' IN ('staff', 'centre_operator', 'admin', 'service_role')
    );

-- Bookings Policy: Authorized staff can update verification status
CREATE POLICY "Staff can verify bookings" ON public.bookings
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' IN ('staff', 'centre_operator', 'admin', 'service_role')
    )
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('staff', 'centre_operator', 'admin', 'service_role')
    );

-- Verifications Policy: Staff can view and insert verification logs
CREATE POLICY "Staff can insert audit logs" ON public.booking_verifications
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' IN ('staff', 'centre_operator', 'admin', 'service_role')
    );

CREATE POLICY "Staff can view audit logs" ON public.booking_verifications
    FOR SELECT
    USING (
        auth.jwt() ->> 'role' IN ('staff', 'centre_operator', 'admin', 'service_role')
    );

-- ==============================================================================
-- Atomic Stored Function for Concurrent Verification
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.verify_booking_atomic(
    p_token_hash VARCHAR(64),
    p_staff_id VARCHAR(100),
    p_staff_name VARCHAR(255),
    p_centre_id VARCHAR(100),
    p_centre_name VARCHAR(255),
    p_remarks TEXT DEFAULT 'QR Verified at Gate 2 Weighbridge'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
    v_result JSONB;
BEGIN
    -- 1. Select with row lock (FOR UPDATE) to prevent race condition
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE qr_token_hash = p_token_hash
    FOR UPDATE;

    -- If booking not found
    IF NOT FOUND THEN
        INSERT INTO public.booking_verifications (booking_number, staff_id, staff_name, centre_id, centre_name, action, result, remarks)
        VALUES ('UNKNOWN', p_staff_id, p_staff_name, p_centre_id, p_centre_name, 'SCAN', 'NOT_FOUND', 'No matching booking found for token hash');
        
        RETURN jsonb_build_object(
            'status', 'NOT_FOUND',
            'message', 'Invalid QR code. No associated Kisan Setu booking found.'
        );
    END IF;

    -- Check if cancelled
    IF v_booking.status = 'CANCELLED' THEN
        INSERT INTO public.booking_verifications (booking_id, booking_number, staff_id, staff_name, centre_id, centre_name, action, result, remarks)
        VALUES (v_booking.id, v_booking.booking_number, p_staff_id, p_staff_name, p_centre_id, p_centre_name, 'SCAN', 'CANCELLED', 'Attempted to scan cancelled booking');

        RETURN jsonb_build_object(
            'status', 'CANCELLED',
            'booking_number', v_booking.booking_number,
            'message', 'This booking was cancelled and cannot be verified.'
        );
    END IF;

    -- Check if already verified
    IF v_booking.verification_status = 'VERIFIED' THEN
        INSERT INTO public.booking_verifications (booking_id, booking_number, staff_id, staff_name, centre_id, centre_name, action, result, remarks)
        VALUES (v_booking.id, v_booking.booking_number, p_staff_id, p_staff_name, p_centre_id, p_centre_name, 'SCAN', 'ALREADY_VERIFIED', 'Duplicate verification attempt');

        RETURN jsonb_build_object(
            'status', 'ALREADY_VERIFIED',
            'booking_number', v_booking.booking_number,
            'farmer_name', v_booking.farmer_name,
            'verified_at', v_booking.verified_at,
            'verified_by', v_booking.verified_by_name,
            'message', 'This booking has already been verified.'
        );
    END IF;

    -- 2. Perform Atomic Verification Update
    UPDATE public.bookings
    SET 
        verification_status = 'VERIFIED',
        verified_by = p_staff_id,
        verified_by_name = p_staff_name,
        verified_at = NOW(),
        verification_remarks = p_remarks,
        updated_at = NOW()
    WHERE id = v_booking.id;

    -- 3. Insert Audit Log
    INSERT INTO public.booking_verifications (
        booking_id,
        booking_number,
        staff_id,
        staff_name,
        centre_id,
        centre_name,
        action,
        result,
        remarks
    ) VALUES (
        v_booking.id,
        v_booking.booking_number,
        p_staff_id,
        p_staff_name,
        p_centre_id,
        p_centre_name,
        'VERIFY',
        'VALID',
        p_remarks
    );

    RETURN jsonb_build_object(
        'status', 'VALID',
        'booking_number', v_booking.booking_number,
        'farmer_name', v_booking.farmer_name,
        'centre_name', v_booking.centre_name,
        'booking_date', v_booking.booking_date,
        'start_time', v_booking.start_time,
        'end_time', v_booking.end_time,
        'commodity', v_booking.commodity,
        'quantity', v_booking.quantity,
        'vehicle_number', v_booking.vehicle_number,
        'token_number', v_booking.token_number,
        'verified_at', NOW(),
        'message', 'Booking verified successfully.'
    );
END;
$$;
