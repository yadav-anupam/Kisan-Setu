// =============================================================================
// Kisan Setu — Procurement Centres Database Persistence & Cache Service
// Fetches live centres from PostgreSQL public.centres table with static fallback
// =============================================================================

import { getSupabaseClient } from './supabaseClient'
import {
  ALL_PROCUREMENT_CENTRES,
  type ProcurementCentreItem,
} from '../data/procurementCentresData'

export type { ProcurementCentreItem }

let cachedCentres: ProcurementCentreItem[] | null = null
let lastFetchedAt = 0
const CACHE_TTL_MS = 60 * 1000 // 1 minute cache

/**
 * Fetches all official procurement centres directly from Supabase PostgreSQL database.
 */
export async function fetchAllCentresFromDB(): Promise<ProcurementCentreItem[]> {
  const now = Date.now()
  if (cachedCentres && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedCentres
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return ALL_PROCUREMENT_CENTRES
  }

  try {
    const { data, error } = await supabase
      .from('centres')
      .select('*')
      .eq('is_active', true)
      .order('district', { ascending: true })
      .order('centre_code', { ascending: true })

    if (error || !data || data.length === 0) {
      return ALL_PROCUREMENT_CENTRES
    }

    const mapped: ProcurementCentreItem[] = data.map((c: any, index: number) => ({
      id: c.centre_code || c.id,
      district: c.district,
      sNo: index + 1,
      centreName: c.centre_name,
      blockTehsil: c.block_tehsil || '',
      agency: c.agency || 'FCS',
      crops: c.crops || 'Paddy / Bajara / Makka / Wheat',
      address: c.address,
      status: c.status || 'Listed 2026–27',
    }))

    cachedCentres = mapped
    lastFetchedAt = now
    return mapped
  } catch {
    return ALL_PROCUREMENT_CENTRES
  }
}

/**
 * Fetches centres filtered by district name.
 */
export async function fetchCentresByDistrictFromDB(district: string): Promise<ProcurementCentreItem[]> {
  const all = await fetchAllCentresFromDB()
  return all.filter((c) => c.district.toLowerCase() === district.toLowerCase())
}

/**
 * Finds a centre by its ID or Code or Name.
 */
export async function findCentreByCodeOrName(identifier: string): Promise<ProcurementCentreItem | undefined> {
  const all = await fetchAllCentresFromDB()
  const clean = identifier.trim().toLowerCase()
  return all.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.centreName.toLowerCase() === clean ||
      c.centreName.toLowerCase().includes(clean)
  )
}
