// =============================================================================
// Kisan Setu — Verified Mandi Location Management & Tracking Service
// =============================================================================
// Comprehensive geospatial data management, verification workflows, Nominatim
// geocoding/reverse geocoding, distance calculations, and dual-layer persistence.
// =============================================================================

import { getSupabaseClient } from './supabaseClient'
import { getStaffAuthSession, type StaffProfile } from './staffDataService'

export type LocationSource =
  | 'OFFICIAL_PORTAL'
  | 'ON_SITE_GPS'
  | 'GEOCODED_MAP_PICKER'
  | 'GOVERNMENT_GAZETTE'
  | 'MANUAL'

export type VerificationStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'

export interface MandiLocationRecord {
  id: string
  centre_code: string
  name: string
  address: string
  state: string
  district: string
  city_or_village: string
  pincode: string
  landmark: string
  latitude: number
  longitude: number
  location_source: LocationSource
  verification_status: VerificationStatus
  verified_by?: string
  verified_at?: string
  verification_notes?: string
  is_active: boolean
  agency?: string
  crops?: string
  contact_phone?: string
  operating_hours?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateMandiInput {
  centre_code: string
  name: string
  address: string
  state?: string
  district: string
  city_or_village: string
  pincode: string
  landmark?: string
  latitude: number
  longitude: number
  location_source?: LocationSource
  agency?: string
  crops?: string
  contact_phone?: string
  verification_notes?: string
  mark_verified?: boolean
}

export interface UpdateMandiInput {
  name?: string
  address?: string
  district?: string
  city_or_village?: string
  pincode?: string
  landmark?: string
  latitude?: number
  longitude?: number
  location_source?: LocationSource
  agency?: string
  crops?: string
  contact_phone?: string
  operating_hours?: string
  is_active?: boolean
}

export interface VerifyMandiInput {
  status: 'VERIFIED' | 'REJECTED'
  notes?: string
  verified_by?: string
}

const STORAGE_KEY = 'kisan_setu_verified_mandis_v1'
const EVENT_NAME = 'kisan_setu_mandis_updated'

// -----------------------------------------------------------------------------
// Initial Verified UP Procurement Mandi Locations
// -----------------------------------------------------------------------------
const INITIAL_MANDIS: MandiLocationRecord[] = [
  {
    id: 'mandi-vns-01',
    centre_code: 'vns-01',
    name: 'Chiraigaon 1st at Gaurakala (FCS)',
    address: 'State Highway 73, Gaurakala Village, Chiraigaon Block, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Gaurakala / Chiraigaon',
    pincode: '221112',
    landmark: 'Near Gaurakala Primary Health Centre & Kisan Seva Kendra Gate 1',
    latitude: 25.3872,
    longitude: 83.0514,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Divisional Mandi Deputy Director, Varanasi',
    verified_at: '2026-03-15T10:30:00Z',
    verification_notes: 'Physical on-site GPS verification complete. Truck entry gate calibrated.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48101',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-15T10:30:00Z',
  },
  {
    id: 'mandi-vns-02',
    centre_code: 'vns-02',
    name: 'B PACS Anei (PCF)',
    address: 'Anei Village Mandi Yard, Pindra-Baragaon Link Road, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Anei',
    pincode: '221206',
    landmark: 'Opposite Cooperative Bank, Pindra Link Road',
    latitude: 25.465,
    longitude: 82.842,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'APMC Varanasi District Officer',
    verified_at: '2026-03-18T14:15:00Z',
    verification_notes: 'Official PACS godown entrance and dual weighbridge verified.',
    is_active: true,
    agency: 'PCF',
    crops: 'Paddy / Wheat / Mustard',
    contact_phone: '+91 94152 48102',
    operating_hours: '08:30 AM - 05:30 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-18T14:15:00Z',
  },
  {
    id: 'mandi-vns-03',
    centre_code: 'vns-03',
    name: 'B PACS Bhatauli (PCF)',
    address: 'Bhatauli Procurement Yard, Kashi / Sadar Block, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Bhatauli',
    pincode: '221008',
    landmark: 'Behind Block Development Office, Bhatauli',
    latitude: 25.295,
    longitude: 82.955,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'APMC Varanasi District Officer',
    verified_at: '2026-03-20T11:00:00Z',
    verification_notes: 'Gate entrance verified with high clearance for grain haulage.',
    is_active: true,
    agency: 'PCF',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48103',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-20T11:00:00Z',
  },
  {
    id: 'mandi-vns-21',
    centre_code: 'vns-21',
    name: 'A.M.H. Bachhaw A (Mandi Samiti)',
    address: 'Mandi Samiti Complex, Bachhaw, Kashi Vidyapeeth, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Bachhaw',
    pincode: '221011',
    landmark: 'Main Highway Gate, Bachhaw APMC Yard',
    latitude: 25.2678,
    longitude: 82.9351,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Divisional Mandi Deputy Director',
    verified_at: '2026-03-22T09:45:00Z',
    verification_notes: 'Central Mandi Samiti Gate 1 and electronic scale verified.',
    is_active: true,
    agency: 'Mandi Samiti',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48121',
    operating_hours: '07:30 AM - 06:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-22T09:45:00Z',
  },
  {
    id: 'mandi-vns-23',
    centre_code: 'vns-23',
    name: 'Pahariya (SWC Mandi Parisar - FCI)',
    address: 'SWC Mandi Parisar, Ring Road Phase 1, Pahariya, Sadar, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Pahariya',
    pincode: '221007',
    landmark: 'Near Ring Road Overbridge, State Warehousing Complex',
    latitude: 25.3524,
    longitude: 82.9985,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Food Corporation of India & Mandi Director',
    verified_at: '2026-03-25T16:00:00Z',
    verification_notes: 'FCI Warehousing Gate verified with automated queue barrier.',
    is_active: true,
    agency: 'FCI',
    crops: 'Paddy / Wheat / Maize',
    contact_phone: '+91 94152 48123',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-25T16:00:00Z',
  },
  {
    id: 'mandi-vns-14',
    centre_code: 'vns-14',
    name: 'Harahua 1 at Gosaipur Mohaw (FCS)',
    address: 'Gosaipur Mohaw Procurement Depot, Harahua Block, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Gosaipur Mohaw',
    pincode: '221105',
    landmark: 'Behind Block Veterinary Hospital, Harahua',
    latitude: 25.399,
    longitude: 82.912,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'APMC Varanasi District Officer',
    verified_at: '2026-03-28T12:30:00Z',
    verification_notes: 'FCS Procurement Shed verified.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48114',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-28T12:30:00Z',
  },
  {
    id: 'mandi-vns-16',
    centre_code: 'vns-16',
    name: 'Pindra 1 at Marui (FCS)',
    address: 'Marui Village Yard, Pindra Tehsil, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Marui / Pindra',
    pincode: '221206',
    landmark: 'Near Pindra Tehsil Gate, Jaunpur Highway',
    latitude: 25.495,
    longitude: 82.812,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'APMC Varanasi District Officer',
    verified_at: '2026-03-29T15:00:00Z',
    verification_notes: 'Physical depot verification confirmed with local administration.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Wheat / Pulses',
    contact_phone: '+91 94152 48116',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-03-29T15:00:00Z',
  },
  {
    id: 'mandi-cnd-01',
    centre_code: 'cnd-01',
    name: 'Navin Mandi Chandauli (FCI)',
    address: 'National Highway 19, Navin Krishi Mandi Samiti, Chandauli',
    state: 'Uttar Pradesh',
    district: 'Chandauli',
    city_or_village: 'Chandauli',
    pincode: '232104',
    landmark: 'NH-19 South Service Road, Mandi Gate No. 1',
    latitude: 25.261,
    longitude: 83.265,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'District Mandi Officer, Chandauli',
    verified_at: '2026-03-24T10:00:00Z',
    verification_notes: 'Grand entrance verified for large commercial grain transports.',
    is_active: true,
    agency: 'FCI',
    crops: 'Paddy / Wheat / Maize',
    contact_phone: '+91 94152 48201',
    operating_hours: '07:30 AM - 06:00 PM',
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-03-24T10:00:00Z',
  },
  {
    id: 'mandi-cnd-05',
    centre_code: 'cnd-05',
    name: 'Chakia FCS Centre',
    address: 'Near Tehsil Headquarters, Chakia-Naugarh Road, Chakia, Chandauli',
    state: 'Uttar Pradesh',
    district: 'Chandauli',
    city_or_village: 'Chakia',
    pincode: '232103',
    landmark: 'Adjacent to Krishi Upaj Mandi Sub-Yard',
    latitude: 25.045,
    longitude: 83.218,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'District Mandi Officer, Chandauli',
    verified_at: '2026-03-26T11:45:00Z',
    verification_notes: 'Chakia FCS depot entrance certified.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Wheat',
    contact_phone: '+91 94152 48205',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-12T09:00:00Z',
    updated_at: '2026-03-26T11:45:00Z',
  },
  {
    id: 'mandi-ghz-01',
    centre_code: 'ghz-01',
    name: 'Jakhania FCS Centre',
    address: 'Railway Station Road, Procurement Yard, Jakhania, Ghazipur',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    city_or_village: 'Jakhania',
    pincode: '275203',
    landmark: 'Adjacent to Jakhania Railway Goods Siding',
    latitude: 25.795,
    longitude: 83.321,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Ghazipur District Mandi Cell',
    verified_at: '2026-03-27T14:20:00Z',
    verification_notes: 'Rail-adjacent goods siding gate coordinates verified.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Wheat / Pulses',
    contact_phone: '+91 94152 48301',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-14T09:00:00Z',
    updated_at: '2026-03-27T14:20:00Z',
  },
  {
    id: 'mandi-ghz-05',
    centre_code: 'ghz-05',
    name: 'Saidpur FCS Centre',
    address: 'Ghazipur-Varanasi Road, Saidpur Town, Ghazipur',
    state: 'Uttar Pradesh',
    district: 'Ghazipur',
    city_or_village: 'Saidpur',
    pincode: '233304',
    landmark: 'Near Ganga Bridge Toll Plaza, Saidpur',
    latitude: 25.545,
    longitude: 83.212,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Ghazipur District Mandi Cell',
    verified_at: '2026-03-28T16:10:00Z',
    verification_notes: 'Saidpur FCS depot entrance verified.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Bajara / Wheat',
    contact_phone: '+91 94152 48305',
    operating_hours: '08:00 AM - 05:00 PM',
    created_at: '2026-01-14T09:00:00Z',
    updated_at: '2026-03-28T16:10:00Z',
  },
  {
    id: 'mandi-jnp-01',
    centre_code: 'jnp-01',
    name: 'Navin Mandi Jaunpur (Mandi Samiti)',
    address: 'Varanasi-Jaunpur Highway, Mandi Samiti Complex, Jaunpur',
    state: 'Uttar Pradesh',
    district: 'Jaunpur',
    city_or_village: 'Jaunpur',
    pincode: '222002',
    landmark: 'Highway Main Gate, Krishi Upaj Mandi Parisar',
    latitude: 25.731,
    longitude: 82.695,
    location_source: 'ON_SITE_GPS',
    verification_status: 'VERIFIED',
    verified_by: 'Jaunpur APMC In-Charge',
    verified_at: '2026-03-29T10:45:00Z',
    verification_notes: 'Main gate verified with automated weighment scale and ANPR cameras.',
    is_active: true,
    agency: 'Mandi Samiti',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48401',
    operating_hours: '07:00 AM - 06:00 PM',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-03-29T10:45:00Z',
  },
  {
    id: 'mandi-vns-18',
    centre_code: 'vns-18',
    name: 'Jayapur Adarsh Mandi Centre (FCS)',
    address: 'Jayapur Village Adarsh Vikas Kendra, Arajiline / Sevapuri, Varanasi',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    city_or_village: 'Jayapur',
    pincode: '221305',
    landmark: 'Near Adarsh Gram Panchayat Bhawan',
    latitude: 25.231,
    longitude: 82.815,
    location_source: 'GEOCODED_MAP_PICKER',
    verification_status: 'PENDING_VERIFICATION',
    verification_notes: 'Address geocoded; awaiting on-site GPS gate audit by block inspector.',
    is_active: true,
    agency: 'FCS',
    crops: 'Paddy / Bajara / Makka / Wheat',
    contact_phone: '+91 94152 48118',
    operating_hours: '08:30 AM - 05:00 PM',
    created_at: '2026-03-30T10:00:00Z',
    updated_at: '2026-03-30T10:00:00Z',
  },
]

// -----------------------------------------------------------------------------
// Storage & Persistence Helper Functions
// -----------------------------------------------------------------------------

function getStoredMandis(): MandiLocationRecord[] {
  if (typeof window === 'undefined') return INITIAL_MANDIS

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MANDIS))
      return INITIAL_MANDIS
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (err) {
    console.warn('[MandiLocationService] Error reading localStorage, using initial:', err)
  }

  return INITIAL_MANDIS
}

function persistMandis(mandis: MandiLocationRecord[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mandis))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count: mandis.length } }))
  } catch (err) {
    console.error('[MandiLocationService] Error writing localStorage:', err)
  }
}

// -----------------------------------------------------------------------------
// Public Query API
// -----------------------------------------------------------------------------

/**
 * Fetch all registered mandi locations with optional filter.
 */
export async function getAllMandiLocations(options?: {
  verifiedOnly?: boolean
  activeOnly?: boolean
  district?: string
}): Promise<MandiLocationRecord[]> {
  const localList = getStoredMandis()

  // Try to sync from Supabase if online
  const supabase = getSupabaseClient()
  if (supabase) {
    try {
      let query = supabase
        .from('centres')
        .select('*')

      if (options?.activeOnly) {
        query = query.eq('is_active', true)
      }
      if (options?.verifiedOnly) {
        query = query.eq('verification_status', 'VERIFIED')
      }
      if (options?.district && options.district !== 'ALL') {
        query = query.ilike('district', options.district)
      }

      const { data, error } = await query
      if (!error && data && data.length > 0) {
        // Map database records into MandiLocationRecord
        const mergedMap = new Map<string, MandiLocationRecord>()
        localList.forEach((m) => mergedMap.set(m.centre_code.toLowerCase(), m))

        data.forEach((dbRow: any) => {
          const code = (dbRow.centre_code || dbRow.code || '').toLowerCase()
          if (!code) return

          const existing = mergedMap.get(code)
          mergedMap.set(code, {
            id: dbRow.id || existing?.id || `mandi-${code}`,
            centre_code: dbRow.centre_code || dbRow.code || existing?.centre_code || code,
            name: dbRow.centre_name || dbRow.name || existing?.name || 'Procurement Centre',
            address: dbRow.address || existing?.address || '',
            state: dbRow.state || existing?.state || 'Uttar Pradesh',
            district: dbRow.district || existing?.district || 'Varanasi',
            city_or_village: dbRow.city_or_village || existing?.city_or_village || dbRow.block_tehsil || '',
            pincode: dbRow.pincode || existing?.pincode || '221001',
            landmark: dbRow.landmark || existing?.landmark || '',
            latitude: typeof dbRow.latitude === 'number' && !isNaN(dbRow.latitude) ? dbRow.latitude : (existing?.latitude ?? 25.3176),
            longitude: typeof dbRow.longitude === 'number' && !isNaN(dbRow.longitude) ? dbRow.longitude : (existing?.longitude ?? 82.9739),
            location_source: (dbRow.location_source as LocationSource) || existing?.location_source || 'OFFICIAL_PORTAL',
            verification_status: (dbRow.verification_status as VerificationStatus) || existing?.verification_status || 'PENDING_VERIFICATION',
            verified_by: dbRow.verified_by || existing?.verified_by,
            verified_at: dbRow.verified_at || existing?.verified_at,
            verification_notes: dbRow.verification_notes || existing?.verification_notes,
            is_active: dbRow.is_active !== undefined ? Boolean(dbRow.is_active) : (existing?.is_active ?? true),
            agency: dbRow.agency || existing?.agency || 'FCS',
            crops: dbRow.crops || existing?.crops || 'Paddy / Wheat',
            contact_phone: dbRow.contact_phone || existing?.contact_phone,
            operating_hours: dbRow.operating_hours || existing?.operating_hours || '08:00 AM - 05:00 PM',
            created_at: dbRow.created_at || existing?.created_at || new Date().toISOString(),
            updated_at: dbRow.updated_at || existing?.updated_at || new Date().toISOString(),
          })
        })

        const updated = Array.from(mergedMap.values())
        persistMandis(updated)
        return applyLocalFilters(updated, options)
      }
    } catch {
      // Graceful fallback to local vault
    }
  }

  return applyLocalFilters(localList, options)
}

function applyLocalFilters(
  list: MandiLocationRecord[],
  options?: { verifiedOnly?: boolean; activeOnly?: boolean; district?: string }
): MandiLocationRecord[] {
  return list.filter((m) => {
    if (options?.verifiedOnly && m.verification_status !== 'VERIFIED') return false
    if (options?.activeOnly && !m.is_active) return false
    if (options?.district && options.district !== 'ALL' && m.district.toLowerCase() !== options.district.toLowerCase()) {
      return false
    }
    return true
  })
}

/**
 * Get a single Mandi record by ID or centre_code.
 */
export async function getMandiLocationByIdOrCode(
  identifier: string
): Promise<MandiLocationRecord | undefined> {
  const all = await getAllMandiLocations()
  const clean = identifier.trim().toLowerCase()
  return all.find(
    (m) =>
      m.id.toLowerCase() === clean ||
      m.centre_code.toLowerCase() === clean ||
      m.name.toLowerCase() === clean
  )
}

// -----------------------------------------------------------------------------
// Admin Write Operations
// -----------------------------------------------------------------------------

/**
 * Register a new procurement centre / mandi location.
 */
export async function registerMandiLocation(
  input: CreateMandiInput,
  currentUser?: StaffProfile | null
): Promise<MandiLocationRecord> {
  const staff = currentUser || getStaffAuthSession()
  const list = getStoredMandis()

  const cleanCode = input.centre_code.trim().toLowerCase()
  const existing = list.find((m) => m.centre_code.toLowerCase() === cleanCode)
  if (existing) {
    throw new Error(`A procurement centre with code "${input.centre_code}" already exists.`)
  }

  // Validate coordinates
  validateCoordinates(input.latitude, input.longitude)

  const now = new Date().toISOString()
  const isDirectVerified = Boolean(input.mark_verified) && staff?.role === 'ADMIN'

  const newRecord: MandiLocationRecord = {
    id: `mandi-${cleanCode}-${Date.now()}`,
    centre_code: input.centre_code.trim(),
    name: input.name.trim(),
    address: input.address.trim(),
    state: input.state?.trim() || 'Uttar Pradesh',
    district: input.district.trim(),
    city_or_village: input.city_or_village.trim(),
    pincode: input.pincode.trim(),
    landmark: input.landmark?.trim() || '',
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    location_source: input.location_source || 'GEOCODED_MAP_PICKER',
    verification_status: isDirectVerified ? 'VERIFIED' : 'PENDING_VERIFICATION',
    verified_by: isDirectVerified ? (staff?.full_name || 'Senior Administrative Officer') : undefined,
    verified_at: isDirectVerified ? now : undefined,
    verification_notes: input.verification_notes || (isDirectVerified ? 'Directly verified by System Admin' : 'Awaiting physical on-site verification'),
    is_active: true,
    agency: input.agency || 'FCS',
    crops: input.crops || 'Paddy / Wheat',
    contact_phone: input.contact_phone || '',
    operating_hours: '08:00 AM - 05:00 PM',
    created_by: staff?.full_name || 'Administrator',
    created_at: now,
    updated_at: now,
  }

  list.unshift(newRecord)
  persistMandis(list)

  // Asynchronously attempt DB write
  const supabase = getSupabaseClient()
  if (supabase) {
    Promise.resolve(
      supabase
        .from('centres')
        .insert({
          centre_code: newRecord.centre_code,
          code: newRecord.centre_code,
          centre_name: newRecord.name,
          name: newRecord.name,
          district: newRecord.district,
          state: newRecord.state,
          address: newRecord.address,
          city_or_village: newRecord.city_or_village,
          pincode: newRecord.pincode,
          landmark: newRecord.landmark,
          latitude: newRecord.latitude,
          longitude: newRecord.longitude,
          location_source: newRecord.location_source,
          verification_status: newRecord.verification_status,
          verified_by: newRecord.verified_by,
          verified_at: newRecord.verified_at,
          verification_notes: newRecord.verification_notes,
          is_active: true,
        })
    )
      .then(({ error }: any) => {
        if (error) console.warn('[MandiLocationService] Supabase insert warning:', error.message)
      })
      .catch(() => {})
  }

  return newRecord
}

/**
 * Update mandi details, address, entrance marker coordinates.
 */
export async function updateMandiLocation(
  centreCode: string,
  updates: UpdateMandiInput,
  currentUser?: StaffProfile | null
): Promise<MandiLocationRecord> {
  const staff = currentUser || getStaffAuthSession()
  const list = getStoredMandis()
  const cleanCode = centreCode.trim().toLowerCase()

  const index = list.findIndex((m) => m.centre_code.toLowerCase() === cleanCode)
  if (index === -1) {
    throw new Error(`Procurement centre "${centreCode}" not found.`)
  }

  // Validate coordinates if changed
  if (updates.latitude !== undefined && updates.longitude !== undefined) {
    validateCoordinates(updates.latitude, updates.longitude)
  }

  const existing = list[index]
  const coordinatesChanged =
    (updates.latitude !== undefined && updates.latitude !== existing.latitude) ||
    (updates.longitude !== undefined && updates.longitude !== existing.longitude)

  const now = new Date().toISOString()
  const updatedRecord: MandiLocationRecord = {
    ...existing,
    ...updates,
    centre_code: existing.centre_code, // Centre code cannot be changed to prevent orphan bookings
    id: existing.id,
    // If coordinates were relocated by Centre Admin without Admin sign-off, mark pending re-verification
    verification_status:
      coordinatesChanged && staff?.role !== 'ADMIN'
        ? 'PENDING_VERIFICATION'
        : existing.verification_status,
    verification_notes:
      coordinatesChanged && staff?.role !== 'ADMIN'
        ? `Entrance marker modified by ${staff?.full_name || 'Staff'}. Pending re-verification.`
        : existing.verification_notes,
    updated_at: now,
  }

  list[index] = updatedRecord
  persistMandis(list)

  // Sync Supabase
  const supabase = getSupabaseClient()
  if (supabase) {
    Promise.resolve(
      supabase
        .from('centres')
        .update({
          centre_name: updatedRecord.name,
          name: updatedRecord.name,
          address: updatedRecord.address,
          district: updatedRecord.district,
          city_or_village: updatedRecord.city_or_village,
          pincode: updatedRecord.pincode,
          landmark: updatedRecord.landmark,
          latitude: updatedRecord.latitude,
          longitude: updatedRecord.longitude,
          location_source: updatedRecord.location_source,
          verification_status: updatedRecord.verification_status,
          verification_notes: updatedRecord.verification_notes,
          is_active: updatedRecord.is_active,
          updated_at: now,
        })
        .or(`centre_code.eq.${cleanCode},code.eq.${cleanCode}`)
    )
      .then(({ error }: any) => {
        if (error) console.warn('[MandiLocationService] Supabase update warning:', error.message)
      })
      .catch(() => {})
  }

  return updatedRecord
}

/**
 * Verify or Reject a Mandi location (Administrative action only).
 */
export async function verifyMandiLocation(
  centreCode: string,
  verification: VerifyMandiInput,
  currentUser?: StaffProfile | null
): Promise<MandiLocationRecord> {
  const staff = currentUser || getStaffAuthSession()
  const list = getStoredMandis()
  const cleanCode = centreCode.trim().toLowerCase()

  const index = list.findIndex((m) => m.centre_code.toLowerCase() === cleanCode)
  if (index === -1) {
    throw new Error(`Procurement centre "${centreCode}" not found.`)
  }

  const existing = list[index]
  const now = new Date().toISOString()
  const verifierName = verification.verified_by || staff?.full_name || 'Authorized Mandi Inspector'

  const updatedRecord: MandiLocationRecord = {
    ...existing,
    verification_status: verification.status,
    verified_by: verifierName,
    verified_at: now,
    verification_notes: verification.notes || `Location ${verification.status.toLowerCase()} by ${verifierName}`,
    updated_at: now,
  }

  list[index] = updatedRecord
  persistMandis(list)

  // Supabase update
  const supabase = getSupabaseClient()
  if (supabase) {
    Promise.resolve(
      supabase
        .from('centres')
        .update({
          verification_status: updatedRecord.verification_status,
          verified_by: updatedRecord.verified_by,
          verified_at: updatedRecord.verified_at,
          verification_notes: updatedRecord.verification_notes,
          updated_at: now,
        })
        .or(`centre_code.eq.${cleanCode},code.eq.${cleanCode}`)
    )
      .then(({ error }: any) => {
        if (error) console.warn('[MandiLocationService] Supabase verify update error:', error.message)
      })
      .catch(() => {})
  }

  return updatedRecord
}

/**
 * Toggle Active / Inactive status of a Mandi location.
 */
export async function toggleMandiActiveStatus(
  centreCode: string,
  isActive: boolean
): Promise<MandiLocationRecord> {
  return updateMandiLocation(centreCode, { is_active: isActive })
}

// -----------------------------------------------------------------------------
// Geospatial & Geocoding Utilities (OpenStreetMap Nominatim API)
// -----------------------------------------------------------------------------

export interface GeocodedAddressResult {
  place_id: number
  display_name: string
  lat: number
  lon: number
  type: string
  importance: number
}

/**
 * Forward Geocoding: Look up an address query and return candidates.
 */
export async function searchAddressNominatim(
  query: string,
  signal?: AbortSignal
): Promise<GeocodedAddressResult[]> {
  if (!query || query.trim().length < 3) return []

  const cleaned = encodeURIComponent(`${query.trim()}, Uttar Pradesh, India`)
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${cleaned}&limit=5&countrycodes=in&addressdetails=1`

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KisanSetu-AgriTrust-Platform/1.0',
      },
    })

    if (!res.ok) {
      throw new Error(`Geocoding failed with HTTP ${res.status}`)
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((item: any) => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type || 'address',
      importance: item.importance || 0,
    }))
  } catch (err: any) {
    if (err.name === 'AbortError') return []
    console.warn('[MandiLocationService] Nominatim geocode error:', err.message)
    return []
  }
}

/**
 * Reverse Geocoding: Get human-readable address from latitude & longitude.
 */
export async function reverseGeocodeNominatim(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<{
  fullAddress: string
  cityOrVillage: string
  district: string
  state: string
  pincode: string
} | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`

  try {
    const res = await fetch(url, {
      signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'KisanSetu-AgriTrust-Platform/1.0',
      },
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data || !data.address) return null

    const addr = data.address
    const cityOrVillage =
      addr.village || addr.town || addr.suburb || addr.city || addr.hamlet || ''
    const district =
      addr.state_district || addr.county || addr.district || 'Varanasi'
    const state = addr.state || 'Uttar Pradesh'
    const pincode = addr.postcode || ''

    return {
      fullAddress: data.display_name || '',
      cityOrVillage,
      district,
      state,
      pincode,
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return null
    console.warn('[MandiLocationService] Reverse geocode error:', err.message)
    return null
  }
}

// -----------------------------------------------------------------------------
// Distance Calculation & Navigation Helpers
// -----------------------------------------------------------------------------

/**
 * Great-circle distance between two GPS coordinates using Haversine formula (km).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Format distance cleanly with explicit approximate label.
 */
export function formatApproxDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || isNaN(km)) return ''
  if (km < 1) {
    return `Approx. ${Math.round(km * 1000)} meters away`
  }
  return `Approx. ${km.toFixed(1)} km away`
}

/**
 * Generate Google Maps navigation link pointing to the exact mandi gate coordinates.
 */
export function getGoogleMapsDirectionsUrl(
  destLat: number,
  destLng: number,
  srcLat?: number,
  srcLng?: number
): string {
  if (srcLat !== undefined && srcLng !== undefined) {
    return `https://www.google.com/maps/dir/?api=1&origin=${srcLat},${srcLng}&destination=${destLat},${destLng}&travelmode=driving`
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`
}

/**
 * Validate latitude and longitude boundary constraints for India / UP.
 */
export function validateCoordinates(lat: number, lng: number): void {
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Coordinates must be valid numbers.')
  }
  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and +90 degrees.')
  }
  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and +180 degrees.')
  }
  // India bounds check
  if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
    throw new Error(
      'Selected coordinates appear outside India. Please position the marker at the verified procurement yard.'
    )
  }
}
