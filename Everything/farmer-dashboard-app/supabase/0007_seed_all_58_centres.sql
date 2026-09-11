-- =============================================================================
-- Kisan Setu — Migration 0007: Idempotent Seeding of All 58 Procurement Centres
-- =============================================================================

INSERT INTO public.centres (
    centre_code, centre_name, district, state, block_tehsil, agency, crops, address, status, is_active
) VALUES
    ('vns-01', 'Chiraigaon 1st at Gaurakala (FCS)', 'Varanasi', 'Uttar Pradesh', 'Chiraigaon', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Gaurakala, Varanasi', 'Listed 2026–27', true),
    ('vns-02', 'B PACS Anei (PCF)', 'Varanasi', 'Uttar Pradesh', 'Pindra / Baragaon', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Anei, Varanasi', 'Listed 2026–27', true),
    ('vns-03', 'B PACS Bhatauli (PCF)', 'Varanasi', 'Uttar Pradesh', 'Kashi / Sadar', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Bhatauli, Varanasi', 'Listed 2026–27', true),
    ('vns-04', 'B PACS Belawa (PCF)', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Belawa, Varanasi', 'Listed 2026–27', true),
    ('vns-05', 'B PACS Jakhhini (PCF)', 'Varanasi', 'Uttar Pradesh', 'Arajiline', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Jakhhini, Varanasi', 'Listed 2026–27', true),
    ('vns-06', 'B PACS Maruichhatav (PCF)', 'Varanasi', 'Uttar Pradesh', 'Pindra', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Maruichhatav, Varanasi', 'Listed 2026–27', true),
    ('vns-07', 'B PACS Mirjamurad (PCF)', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Mirjamurad, Varanasi', 'Listed 2026–27', true),
    ('vns-08', 'B PACS Narayanpur (PCF)', 'Varanasi', 'Uttar Pradesh', 'Chiraigaon', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Narayanpur, Varanasi', 'Listed 2026–27', true),
    ('vns-09', 'B PACS Raunakala (PCF)', 'Varanasi', 'Uttar Pradesh', 'Cholapur', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Raunakala, Varanasi', 'Listed 2026–27', true),
    ('vns-10', 'B.G.S.S.LI Bhatauli (PCU)', 'Varanasi', 'Uttar Pradesh', 'Kashi Vidyapeeth', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Bhatauli, Varanasi', 'Listed 2026–27', true),
    ('vns-11', 'B.G.S.S.LI Kaniyar (PCU)', 'Varanasi', 'Uttar Pradesh', 'Harahua', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Kaniyar, Varanasi', 'Listed 2026–27', true),
    ('vns-12', 'B.G.S.S.LI Thatara (PCU)', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Thatara, Varanasi', 'Listed 2026–27', true),
    ('vns-13', 'B.G.S.S.LI Deura (PCU)', 'Varanasi', 'Uttar Pradesh', 'Badagaon', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Deura, Varanasi', 'Listed 2026–27', true),
    ('vns-14', 'Harahua 1 at Gosaipur Mohaw (FCS)', 'Varanasi', 'Uttar Pradesh', 'Harahua', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Gosaipur Mohaw, Varanasi', 'Listed 2026–27', true),
    ('vns-15', 'Cholapur 1 at Raunakala (FCS)', 'Varanasi', 'Uttar Pradesh', 'Cholapur', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Raunakala, Varanasi', 'Listed 2026–27', true),
    ('vns-16', 'Pindra 1 at Marui (FCS)', 'Varanasi', 'Uttar Pradesh', 'Pindra', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Marui, Varanasi', 'Listed 2026–27', true),
    ('vns-17', 'Sevapuri Pratham (FCS)', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Sevapuri, Varanasi', 'Listed 2026–27', true),
    ('vns-18', 'Jayapur (FCS)', 'Varanasi', 'Uttar Pradesh', 'Arajiline / Sevapuri', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Jayapur, Varanasi', 'Listed 2026–27', true),
    ('vns-19', 'Milkichak Pratham (FCS)', 'Varanasi', 'Uttar Pradesh', 'Chiraigaon', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Milkichak, Varanasi', 'Listed 2026–27', true),
    ('vns-20', 'Badagaon 1 Gangkhurd Bagiya (FCS)', 'Varanasi', 'Uttar Pradesh', 'Badagaon', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Gangkhurd Bagiya, Varanasi', 'Listed 2026–27', true),
    ('vns-21', 'A.M.H. Bachhaw A (Mandi Samiti)', 'Varanasi', 'Uttar Pradesh', 'Kashi Vidyapeeth', 'Mandi Samiti', 'Paddy / Bajara / Makka / Wheat', 'Bachhaw, Varanasi', 'Listed 2026–27', true),
    ('vns-22', 'A.M.H. Bachhaw B (Mandi Samiti)', 'Varanasi', 'Uttar Pradesh', 'Kashi Vidyapeeth', 'Mandi Samiti', 'Paddy / Bajara / Makka / Wheat', 'Bachhaw, Varanasi', 'Listed 2026–27', true),
    ('vns-23', 'Pahariya (SWC Mandi Parisar)', 'Varanasi', 'Uttar Pradesh', 'Pahariya / Sadar', 'FCI', 'Paddy / Bajara / Makka / Wheat', 'Pahariya, Varanasi', 'Listed 2026–27', true),
    ('vns-24', 'B PACS Phoolpur', 'Varanasi', 'Uttar Pradesh', 'Phoolpur / Pindra', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Phoolpur, Varanasi', 'Listed 2026–27', true),
    ('vns-25', 'B PACS Jakhhini', 'Varanasi', 'Uttar Pradesh', 'Arajiline', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Jakhhini, Varanasi', 'Listed 2026–27', true),
    ('vns-26', 'B PACS Maruichhatav', 'Varanasi', 'Uttar Pradesh', 'Pindra', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Maruichhatav, Varanasi', 'Listed 2026–27', true),
    ('vns-27', 'B PACS Mirjamurad', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Mirjamurad, Varanasi', 'Listed 2026–27', true),
    ('vns-28', 'B PACS Narayanpur', 'Varanasi', 'Uttar Pradesh', 'Chiraigaon', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Narayanpur, Varanasi', 'Listed 2026–27', true),
    ('vns-29', 'B PACS Raunakala', 'Varanasi', 'Uttar Pradesh', 'Cholapur', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Raunakala, Varanasi', 'Listed 2026–27', true),
    ('vns-30', 'B PACS Belawa', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Belawa, Varanasi', 'Listed 2026–27', true),
    ('vns-31', 'B PACS Anei', 'Varanasi', 'Uttar Pradesh', 'Pindra / Baragaon', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Anei, Varanasi', 'Listed 2026–27', true),
    ('vns-32', 'B PACS Bhatauli', 'Varanasi', 'Uttar Pradesh', 'Kashi / Sadar', 'PCF', 'Paddy / Bajara / Makka / Wheat', 'Bhatauli, Varanasi', 'Listed 2026–27', true),
    ('vns-33', 'B.G.S.S.LI Kaniyar', 'Varanasi', 'Uttar Pradesh', 'Harahua', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Kaniyar, Varanasi', 'Listed 2026–27', true),
    ('vns-34', 'B.G.S.S.LI Thatara', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Thatara, Varanasi', 'Listed 2026–27', true),
    ('vns-35', 'B.G.S.S.LI Deura', 'Varanasi', 'Uttar Pradesh', 'Badagaon', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Deura, Varanasi', 'Listed 2026–27', true),
    ('vns-36', 'A.M.H. Bachhaw B', 'Varanasi', 'Uttar Pradesh', 'Kashi Vidyapeeth', 'Mandi Samiti', 'Paddy / Bajara / Makka / Wheat', 'Bachhaw, Varanasi', 'Listed 2026–27', true),
    ('vns-37', 'Pahariya (SWC Mandi Parisar)', 'Varanasi', 'Uttar Pradesh', 'Pahariya / Sadar', 'FCI', 'Paddy / Bajara / Makka / Wheat', 'Pahariya, Varanasi', 'Listed 2026–27', true),
    ('vns-38', 'Chiraigaon 1st at Gaurakala', 'Varanasi', 'Uttar Pradesh', 'Chiraigaon', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Gaurakala, Varanasi', 'Listed 2026–27', true),
    ('vns-39', 'Harahua 1 at Gosaipur Mohaw', 'Varanasi', 'Uttar Pradesh', 'Harahua', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Gosaipur Mohaw, Varanasi', 'Listed 2026–27', true),
    ('vns-40', 'Cholapur 1 at Raunakala', 'Varanasi', 'Uttar Pradesh', 'Cholapur', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Raunakala, Varanasi', 'Listed 2026–27', true),
    ('vns-41', 'Pindra 1 at Marui', 'Varanasi', 'Uttar Pradesh', 'Pindra', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Marui, Varanasi', 'Listed 2026–27', true),
    ('vns-42', 'Sevapuri Pratham', 'Varanasi', 'Uttar Pradesh', 'Sevapuri', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Sevapuri, Varanasi', 'Listed 2026–27', true),
    ('vns-43', 'Jayapur', 'Varanasi', 'Uttar Pradesh', 'Arajiline / Sevapuri', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Jayapur, Varanasi', 'Listed 2026–27', true),
    ('cnd-01', 'Navin Mandi Chandauli (FCI)', 'Chandauli', 'Uttar Pradesh', 'Chandauli', 'FCI', 'Paddy / Bajara / Makka / Wheat', 'Navin Mandi, Chandauli', 'Listed 2026–27', true),
    ('cnd-02', 'Navin Mandi Chandauli (FCS)', 'Chandauli', 'Uttar Pradesh', 'Chandauli', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Navin Mandi, Chandauli', 'Listed 2026–27', true),
    ('cnd-03', 'Krishi Utpadan Mandi Samiti', 'Chandauli', 'Uttar Pradesh', 'Chandauli', 'Mandi Samiti', 'Paddy / Bajara / Makka / Wheat', 'Chandauli Mandi, Chandauli', 'Listed 2026–27', true),
    ('cnd-04', 'Krishi Utpadan Mandi Samiti 2', 'Chandauli', 'Uttar Pradesh', 'Chandauli', 'Mandi Samiti', 'Paddy / Bajara / Makka / Wheat', 'Chandauli Mandi, Chandauli', 'Listed 2026–27', true),
    ('cnd-05', 'Chakia (FCS)', 'Chandauli', 'Uttar Pradesh', 'Chakia', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Chakia, Chandauli', 'Listed 2026–27', true),
    ('ghz-01', 'Jakhania FCS Centre', 'Ghazipur', 'Uttar Pradesh', 'Jakhania', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Jakhania, Ghazipur', 'Listed 2026–27', true),
    ('ghz-02', 'Sadat Mandi FCS Centre', 'Ghazipur', 'Uttar Pradesh', 'Sadat', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Sadat Mandi, Ghazipur', 'Listed 2026–27', true),
    ('ghz-03', 'Karimuddinpur FCS Centre', 'Ghazipur', 'Uttar Pradesh', 'Karimuddinpur', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Karimuddinpur, Ghazipur', 'Listed 2026–27', true),
    ('ghz-04', 'Baksada FCS Centre', 'Ghazipur', 'Uttar Pradesh', 'Ghazipur Sadar', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Baksada, Ghazipur', 'Listed 2026–27', true),
    ('ghz-05', 'Saidpur FCS Centre', 'Ghazipur', 'Uttar Pradesh', 'Saidpur', 'FCS', 'Paddy / Bajara / Makka / Wheat', 'Saidpur, Ghazipur', 'Listed 2026–27', true),
    ('jnp-01', 'Dharmapur Mandi', 'Jaunpur', 'Uttar Pradesh', 'Dharmapur', 'FCI', 'Paddy / Bajara / Makka / Wheat', 'Dharmapur, Jaunpur', 'Listed 2026–27', true),
    ('jnp-02', 'B PACS Sohasa', 'Jaunpur', 'Uttar Pradesh', 'Jaunpur Sadar', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Sohasa, Jaunpur', 'Listed 2026–27', true),
    ('jnp-03', 'B PACS Fattupur', 'Jaunpur', 'Uttar Pradesh', 'Jaunpur Sadar', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Fattupur, Jaunpur', 'Listed 2026–27', true),
    ('jnp-04', 'DCF Budhupur', 'Jaunpur', 'Uttar Pradesh', 'Jaunpur Sadar', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Budhupur, Jaunpur', 'Listed 2026–27', true),
    ('jnp-05', 'Belapar', 'Jaunpur', 'Uttar Pradesh', 'Jaunpur Sadar', 'PCU', 'Paddy / Bajara / Makka / Wheat', 'Belapar, Jaunpur', 'Listed 2026–27', true)
ON CONFLICT (centre_code) DO UPDATE SET
    centre_name = EXCLUDED.centre_name,
    district = EXCLUDED.district,
    block_tehsil = EXCLUDED.block_tehsil,
    agency = EXCLUDED.agency,
    crops = EXCLUDED.crops,
    address = EXCLUDED.address,
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Seed Master Administrator into staff_users
INSERT INTO public.staff_users (
    staff_id, full_name, mobile, email, role, centre_id, centre_name,
    designation, section, shift_hours, desk_assigned, password_hash, status, appointed_by, created_at, updated_at
) VALUES (
    'ADM-MASTER-001', 'Anupam Yadav', '+91 94150 91190', 'yadavanupam9119@gmail.com', 'ADMIN', 'STATE_HQ', 'State APMC & Food Supplies Headquarters',
    'Chief APMC Director & System Administrator', 'ADMIN_GRIEVANCE', 'Administrative 24x7', 'Executive Command Center',
    '4a7f38599e7cbfd0a3f1ff7ba9b8d5ad2f557a7acc24c09af9b512241aae9ec6', 'ACTIVE', 'SYSTEM', NOW(), NOW()
)
ON CONFLICT (staff_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    status = 'ACTIVE',
    updated_at = NOW();
