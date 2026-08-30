-- =============================================================================
-- Kisan Setu — Complete Supabase PostgreSQL Production Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/vcmpigosbcttphodpvry/sql)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLE: farmers (Farmer Profiles, DigiLocker KYC, Bank & Land Details)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    father_name TEXT,
    mobile TEXT UNIQUE NOT NULL,
    email TEXT,
    aadhar_masked TEXT,
    gender TEXT DEFAULT 'Male',
    dob DATE,
    state TEXT DEFAULT 'Rajasthan',
    district TEXT DEFAULT 'Alwar',
    tehsil TEXT DEFAULT 'Ramgarh',
    village TEXT DEFAULT 'Bambora',
    pincode TEXT DEFAULT '301026',
    preferred_mandi TEXT DEFAULT 'Alwar Central Grain Mandi',
    khasra_number TEXT DEFAULT '342/1, 342/2',
    land_area_acres NUMERIC(6, 2) DEFAULT 4.50,
    irrigation_type TEXT DEFAULT 'Tube Well',
    crop_category TEXT DEFAULT 'Rabi (Wheat, Mustard)',
    bank_name TEXT DEFAULT 'State Bank of India',
    branch_name TEXT DEFAULT 'Alwar Main Branch',
    account_number_masked TEXT DEFAULT '•••• •••• 4589',
    ifsc_code TEXT DEFAULT 'SBIN0001234',
    kyc_status TEXT DEFAULT 'VERIFIED',
    digilocker_verified_at TIMESTAMPTZ DEFAULT NOW(),
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLE: bookings (Procurement Slot Bookings & QR Token Hashes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT,
    centre_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    commodity TEXT NOT NULL,
    quantity NUMERIC(8, 2) NOT NULL,
    vehicle_number TEXT NOT NULL,
    token_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED',
    verification_status TEXT NOT NULL DEFAULT 'PENDING',
    qr_token_hash TEXT NOT NULL,
    verified_by TEXT,
    verified_by_name TEXT,
    verified_at TIMESTAMPTZ,
    verification_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_qr_hash ON public.bookings(qr_token_hash);
CREATE INDEX IF NOT EXISTS idx_bookings_farmer_id ON public.bookings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);

-- -----------------------------------------------------------------------------
-- 3. TABLE: booking_verifications (Cryptographic Verification Audits)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    booking_number TEXT NOT NULL,
    farmer_name TEXT,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    centre_name TEXT,
    action TEXT NOT NULL,
    result TEXT NOT NULL,
    remarks TEXT,
    scanned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_booking_number ON public.booking_verifications(booking_number);

-- -----------------------------------------------------------------------------
-- 4. TABLE: procurements (Real Weighbridge Batches, Moisture & MSP Billing)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.procurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    commodity TEXT NOT NULL,
    gross_weight_qtl NUMERIC(8, 2) NOT NULL,
    tare_weight_qtl NUMERIC(8, 2) NOT NULL,
    net_weight_qtl NUMERIC(8, 2) NOT NULL,
    moisture_percentage NUMERIC(4, 2) NOT NULL DEFAULT 11.20,
    foreign_matter_percentage NUMERIC(4, 2) NOT NULL DEFAULT 0.50,
    msp_rate_per_qtl NUMERIC(8, 2) NOT NULL,
    gross_amount NUMERIC(12, 2) NOT NULL,
    deductions NUMERIC(10, 2) DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL,
    quality_grade TEXT DEFAULT 'Grade A (FAQ Standard)',
    payment_status TEXT DEFAULT 'PAID_DBT',
    centre_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procurements_farmer_id ON public.procurements(farmer_id);

-- -----------------------------------------------------------------------------
-- 5. TABLE: dbt_payments (Direct Benefit Transfers to Farmer Bank Accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dbt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_ref TEXT UNIQUE NOT NULL,
    farmer_id TEXT NOT NULL,
    procurement_batch_number TEXT,
    commodity TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    utr_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    bank_name TEXT NOT NULL DEFAULT 'State Bank of India',
    account_suffix TEXT NOT NULL DEFAULT '4589',
    ifsc_code TEXT NOT NULL DEFAULT 'SBIN0001234',
    transfer_date TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dbt_farmer_id ON public.dbt_payments(farmer_id);

-- -----------------------------------------------------------------------------
-- 6. TABLE: mandi_live_status (Live Mandi Yards, Bays & Queue Metrics)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mandi_live_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandi_id TEXT UNIQUE NOT NULL,
    mandi_name TEXT NOT NULL,
    current_serving_token TEXT NOT NULL DEFAULT 'A-45',
    queue_length INT NOT NULL DEFAULT 12,
    active_counters INT NOT NULL DEFAULT 4,
    avg_service_time_mins NUMERIC(4, 1) DEFAULT 6.5,
    congestion_level TEXT DEFAULT 'LOW',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TABLE: farmer_notifications (Live Alerts, Advisories & Queue Pushes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmer_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_farmer_id ON public.farmer_notifications(farmer_id);

-- -----------------------------------------------------------------------------
-- 8. TABLE: staff_users (Authorized Centre Operators & Mandi Officers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    staff_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF', -- 'STAFF', 'CENTRE_OPERATOR', 'MANDI_ADMIN'
    centre_id TEXT NOT NULL DEFAULT 'centre-alwar-01',
    centre_name TEXT NOT NULL DEFAULT 'Alwar Central Grain Mandi',
    designation TEXT DEFAULT 'Weighbridge & Gate Verification Officer',
    profile_photo TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON public.staff_users(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_centre_id ON public.staff_users(centre_id);

-- -----------------------------------------------------------------------------
-- 9. TABLE: centre_slots (Centre Capacity & Slot Timetable)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.centre_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id TEXT NOT NULL,
    centre_name TEXT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    capacity INT DEFAULT 40,
    booked_count INT DEFAULT 0,
    verified_count INT DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'FULL', 'CLOSED', 'COMPLETED'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON public.centre_slots(centre_id, slot_date);

-- -----------------------------------------------------------------------------
-- 10. TABLE: centre_queue_items (Real-time Mandi Queue Sequence)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.centre_queue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    centre_id TEXT NOT NULL,
    token_number TEXT NOT NULL,
    booking_number TEXT NOT NULL,
    farmer_name TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    commodity TEXT NOT NULL,
    status TEXT DEFAULT 'WAITING', -- 'WAITING', 'SERVING', 'PROCESSING', 'COMPLETED', 'HELD', 'SKIPPED'
    counter_id TEXT DEFAULT 'Bay 2',
    called_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_centre_status ON public.centre_queue_items(centre_id, status);

-- -----------------------------------------------------------------------------
-- 11. TABLE: staff_notifications (Operational Staff Alerts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT NOT NULL,
    centre_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_notifs_staff_id ON public.staff_notifications(staff_id);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES (Full Read/Write Access for Kisan Setu App)
-- -----------------------------------------------------------------------------
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

CREATE POLICY "Public full access on farmers" ON public.farmers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on booking_verifications" ON public.booking_verifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on procurements" ON public.procurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on dbt_payments" ON public.dbt_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on mandi_live_status" ON public.mandi_live_status FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access on farmer_notifications" ON public.farmer_notifications;
CREATE POLICY "Public full access on farmer_notifications" ON public.farmer_notifications FOR ALL USING (true) WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- SEED INITIAL REAL DATA FOR DEMO FARMER: KS-FARM-2026-8942
-- -----------------------------------------------------------------------------

-- 1. Insert Farmer Profile
INSERT INTO public.farmers (
    farmer_id, name, father_name, mobile, aadhar_masked, gender, dob, state, district,
    village, preferred_mandi, khasra_number, land_area_acres, bank_name, account_number_masked, ifsc_code, kyc_status
) VALUES (
    'KS-FARM-2026-8942',
    'Ramesh Kumar Singh',
    'Shivdayal Singh',
    '+91 92143 34494',
    'XXXX-XXXX-4589',
    'Male',
    '1984-06-15',
    'Rajasthan',
    'Alwar',
    'Bambora Village, Tehsil Ramgarh',
    'Alwar Central Grain Mandi',
    '342/1, 342/2',
    4.50,
    'State Bank of India',
    '•••• •••• 4589',
    'SBIN0001234',
    'VERIFIED'
) ON CONFLICT (farmer_id) DO NOTHING;

-- 2. Insert Mandi Live Status
INSERT INTO public.mandi_live_status (
    mandi_id, mandi_name, current_serving_token, queue_length, active_counters, avg_service_time_mins, congestion_level
) VALUES (
    'centre-alwar-01',
    'Alwar Central Grain Mandi',
    'A-45',
    12,
    4,
    6.5,
    'LOW'
) ON CONFLICT (mandi_id) DO UPDATE SET
    current_serving_token = EXCLUDED.current_serving_token,
    queue_length = EXCLUDED.queue_length,
    active_counters = EXCLUDED.active_counters,
    avg_service_time_mins = EXCLUDED.avg_service_time_mins,
    congestion_level = EXCLUDED.congestion_level;

-- 3. Insert Real Delivered Procurements
INSERT INTO public.procurements (
    batch_number, farmer_id, farmer_name, commodity, gross_weight_qtl, tare_weight_qtl,
    net_weight_qtl, moisture_percentage, foreign_matter_percentage, msp_rate_per_qtl,
    gross_amount, deductions, net_amount, quality_grade, payment_status, centre_name, created_at
) VALUES 
(
    'PR-2026-0814-482',
    'KS-FARM-2026-8942',
    'Ramesh Kumar Singh',
    'Wheat (गेहूं - Sharbati)',
    34.50,
    2.50,
    32.00,
    11.20,
    0.40,
    2275.00,
    72800.00,
    0.00,
    72800.00,
    'Grade A (FAQ Standard)',
    'PAID_DBT',
    'Alwar Central Grain Mandi',
    NOW() - INTERVAL '15 days'
),
(
    'PR-2026-0728-119',
    'KS-FARM-2026-8942',
    'Ramesh Kumar Singh',
    'Mustard (सरसों - Pioneer)',
    16.80,
    1.80,
    15.00,
    7.50,
    0.30,
    5650.00,
    84750.00,
    0.00,
    84750.00,
    'Grade A (FAQ Standard)',
    'PAID_DBT',
    'Behror Sub-Yard',
    NOW() - INTERVAL '32 days'
) ON CONFLICT (batch_number) DO NOTHING;

-- 4. Insert Real DBT Payment Transfers
INSERT INTO public.dbt_payments (
    payment_ref, farmer_id, procurement_batch_number, commodity, amount,
    utr_number, status, bank_name, account_suffix, ifsc_code, transfer_date
) VALUES 
(
    'DBT-2026-8942-01',
    'KS-FARM-2026-8942',
    'PR-2026-0814-482',
    'Wheat (गेहूं)',
    72800.00,
    'UTR928374829104',
    'COMPLETED',
    'State Bank of India',
    '4589',
    'SBIN0001234',
    NOW() - INTERVAL '14 days'
),
(
    'DBT-2026-8942-02',
    'KS-FARM-2026-8942',
    'PR-2026-0728-119',
    'Mustard (सरसों)',
    84750.00,
    'UTR718293840192',
    'COMPLETED',
    'State Bank of India',
    '4589',
    'SBIN0001234',
    NOW() - INTERVAL '31 days'
) ON CONFLICT (payment_ref) DO NOTHING;

-- 5. Insert Live Farmer Notifications
INSERT INTO public.farmer_notifications (
    farmer_id, title, message, category, is_read, created_at
) VALUES 
(
    'KS-FARM-2026-8942',
    'DBT Payment Credited ₹72,800',
    'Direct Benefit Transfer for Wheat Batch PR-2026-0814-482 has been credited to your SBI Account •••• 4589 (UTR: UTR928374829104).',
    'PAYMENT',
    false,
    NOW() - INTERVAL '2 hours'
),
(
    'KS-FARM-2026-8942',
    'Upcoming Mandi Slot Reminder',
    'Your procurement appointment at Alwar Central Grain Mandi is scheduled. Please ensure vehicle RJ-02-GB-8942 arrives with QR Gate Pass ready.',
    'SLOT',
    false,
    NOW() - INTERVAL '1 day'
);

-- 6. Insert Staff Users
INSERT INTO public.staff_users (
    staff_id, full_name, mobile, email, role, centre_id, centre_name, designation, status
) VALUES 
(
    'ST-102',
    'Rajesh Kumar',
    '+91 98290 12345',
    'rajesh.kumar@apmc.rajasthan.gov.in',
    'STAFF',
    'centre-alwar-01',
    'Alwar Central Grain Mandi',
    'Weighbridge & Gate Verification Officer',
    'ACTIVE'
),
(
    'OP-401',
    'Suresh Meena',
    '+91 94140 56789',
    'suresh.meena@apmc.rajasthan.gov.in',
    'CENTRE_OPERATOR',
    'centre-alwar-01',
    'Alwar Central Grain Mandi',
    'Senior Mandi Inspector',
    'ACTIVE'
),
(
    'AD-001',
    'Vikram Singh',
    '+91 98280 98765',
    'vikram.singh@apmc.rajasthan.gov.in',
    'MANDI_ADMIN',
    'centre-alwar-01',
    'Alwar Central Grain Mandi',
    'Mandi Yard Administrator',
    'ACTIVE'
) ON CONFLICT (staff_id) DO NOTHING;

-- 7. Insert Today's Centre Slots
INSERT INTO public.centre_slots (
    centre_id, centre_name, slot_date, start_time, end_time, capacity, booked_count, verified_count, status
) VALUES
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '08:00 AM', '09:00 AM', 40, 24, 18, 'COMPLETED'),
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '09:00 AM', '10:00 AM', 40, 30, 21, 'OPEN'),
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '10:00 AM', '11:00 AM', 40, 28, 20, 'OPEN'),
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '11:00 AM', '12:00 PM', 40, 32, 22, 'OPEN'),
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '01:00 PM', '02:00 PM', 40, 18, 5, 'OPEN'),
('centre-alwar-01', 'Alwar Central Grain Mandi', CURRENT_DATE, '02:00 PM', '03:00 PM', 40, 15, 0, 'OPEN');

-- 8. Insert Live Queue Items
INSERT INTO public.centre_queue_items (
    centre_id, token_number, booking_number, farmer_name, slot_time, commodity, status, counter_id
) VALUES
('centre-alwar-01', 'KST-101', 'KS-2026-000183', 'Shiv Charan Sharma', '09:30 AM', 'Wheat (Grade A)', 'COMPLETED', 'Bay 1'),
('centre-alwar-01', 'KST-102', 'KS-2026-000184', 'Rajesh Kumar Yadav', '10:00 AM', 'Wheat (FAQ Standard)', 'SERVING', 'Bay 2'),
('centre-alwar-01', 'KST-103', 'KS-2026-000185', 'Amit Kumar Jat', '10:00 AM', 'Mustard (High Oil)', 'WAITING', 'Bay 3'),
('centre-alwar-01', 'KST-104', 'KS-2026-000186', 'Suresh Kumar Meena', '10:30 AM', 'Wheat (Grade A)', 'WAITING', 'Bay 2'),
('centre-alwar-01', 'KST-105', 'KS-2026-000187', 'Ram Bilas Saini', '10:30 AM', 'Gram (चना)', 'WAITING', 'Bay 1');

-- 9. Insert Initial Staff Notifications
INSERT INTO public.staff_notifications (
    staff_id, centre_id, title, message, type, is_read
) VALUES
('ST-102', 'centre-alwar-01', 'High Influx Expected: 10:00 AM Slot', '32 trolley bookings scheduled. Weighbridge Bay 2 and 3 prioritized for Wheat FAQ standard.', 'ALERT', false),
('ST-102', 'centre-alwar-01', 'Weighbridge Bay 4 Calibrated', 'Government weights & measures inspection passed with 0.01% tolerance.', 'INFO', false),
('ST-102', 'centre-alwar-01', 'DBT Auto-Settlement Active', 'Real-time PFMS gateway connected. Verified batches will auto-initiate bank transfer.', 'SYSTEM', false);

