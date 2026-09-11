// =============================================================================
// Kisan Setu — Slot Management & Concurrency Service
// Handles Centre-wise Slot CRUD, Capacity Control, & Atomic Booking RPC
// =============================================================================

import { getSupabaseClient } from './supabaseClient'
import { getStaffAuthSession } from './staffDataService'
import { hashTokenSHA256, generateSecureQRToken, setFarmerRawToken } from './qrBookingService'

export type SlotStatus = 'DRAFT' | 'ACTIVE' | 'FULL' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'

export interface CentreSlotItem {
  id: string
  centre_id: string
  centre_name: string
  slot_date: string // YYYY-MM-DD
  start_time: string // e.g. "09:00 AM"
  end_time: string // e.g. "11:00 AM"
  capacity: number
  booked_count: number
  verified_count: number
  status: SlotStatus
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateSlotParams {
  centre_id: string
  centre_name: string
  slot_date: string
  start_time: string
  end_time: string
  capacity: number
  status?: SlotStatus
}

export interface AtomicBookingParams {
  slot_id: string
  farmer_id: string
  farmer_name: string
  farmer_phone?: string
  centre_id: string
  centre_name: string
  booking_date: string
  commodity: string
  quantity: number
  vehicle_number?: string
}

export interface AtomicBookingResult {
  success: boolean
  booking_id?: string
  booking_number?: string
  token_number?: string
  slot_id?: string
  start_time?: string
  end_time?: string
  available_remaining?: number
  rawToken?: string
  error_code?: string
  message: string
}

// -----------------------------------------------------------------------------
// Helper: Time parser to compare 12-hour strings (e.g. "09:00 AM" vs "11:00 AM")
// -----------------------------------------------------------------------------
export function parse12HourTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const modifier = match[3].toUpperCase()

  if (modifier === 'PM' && hours < 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0

  return hours * 60 + minutes
}

// =============================================================================
// 1. CENTRE ADMIN SLOT MANAGEMENT (CRUD)
// =============================================================================

/**
 * Fetches all slots for a specific centre and operational date from Supabase PostgreSQL.
 * Enforces centre-level isolation.
 */
export async function fetchCentreSlotsByDate(
  centreId: string,
  dateStr?: string
): Promise<CentreSlotItem[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const targetDate = dateStr || new Date().toISOString().split('T')[0]

  try {
    const { data, error } = await supabase
      .from('centre_slots')
      .select('*')
      .eq('centre_id', centreId)
      .eq('slot_date', targetDate)
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching centre slots:', error)
      return []
    }

    return (data || []) as CentreSlotItem[]
  } catch (err) {
    console.error('Failed to fetch centre slots:', err)
    return []
  }
}

/**
 * Creates a new procurement slot for a centre with strict validation.
 */
export async function createCentreSlot(
  params: CreateSlotParams
): Promise<{ success: boolean; slot?: CentreSlotItem; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, message: 'Database connection failed. Please check Supabase configuration.' }
  }

  // 1. Authorization & Session Check
  const staff = getStaffAuthSession()
  if (staff.role !== 'ADMIN' && staff.centre_id && staff.centre_id !== params.centre_id) {
    return { success: false, message: 'Access Denied: You can only create slots for your assigned centre.' }
  }

  // 2. Validate Capacity
  const cap = Number(params.capacity)
  if (!cap || cap <= 0 || !Number.isInteger(cap)) {
    return { success: false, message: 'Slot capacity must be a positive whole number (e.g. 8, 10, 40).' }
  }

  // 3. Validate Time Ordering
  const startMin = parse12HourTimeToMinutes(params.start_time)
  const endMin = parse12HourTimeToMinutes(params.end_time)
  if (startMin >= endMin) {
    return { success: false, message: 'Slot Start Time must be strictly before End Time.' }
  }

  // 4. Validate Date (Cannot create slots for past dates)
  const today = new Date().toISOString().split('T')[0]
  if (params.slot_date < today) {
    return { success: false, message: 'Cannot create procurement slots for past dates.' }
  }

  // 5. Check Overlapping & Duplicate Slots on Same Date & Centre
  const existingSlots = await fetchCentreSlotsByDate(params.centre_id, params.slot_date)
  for (const s of existingSlots) {
    if (s.status === 'CANCELLED') continue
    const sStart = parse12HourTimeToMinutes(s.start_time)
    const sEnd = parse12HourTimeToMinutes(s.end_time)

    // Exact match check
    if (s.start_time.trim().toUpperCase() === params.start_time.trim().toUpperCase() &&
        s.end_time.trim().toUpperCase() === params.end_time.trim().toUpperCase()) {
      return { success: false, message: `A slot with timing ${params.start_time} - ${params.end_time} already exists on this date.` }
    }

    // Overlap check
    if (startMin < sEnd && endMin > sStart) {
      return { 
        success: false, 
        message: `Timing conflict: This slot overlaps with existing slot (${s.start_time} - ${s.end_time}). Please adjust timing.` 
      }
    }
  }

  // 6. Insert Slot into Supabase
  try {
    const payload = {
      centre_id: params.centre_id,
      centre_name: params.centre_name,
      slot_date: params.slot_date,
      start_time: params.start_time.trim(),
      end_time: params.end_time.trim(),
      capacity: cap,
      booked_count: 0,
      verified_count: 0,
      status: (params.status || 'ACTIVE') as SlotStatus,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('centre_slots')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return { success: false, message: `Database error creating slot: ${error.message}` }
    }

    window.dispatchEvent(new CustomEvent('kisan_setu_centre_slots_updated'))
    return { success: true, slot: data as CentreSlotItem, message: 'Procurement slot created successfully.' }
  } catch (err: any) {
    return { success: false, message: `Failed to create slot: ${err.message}` }
  }
}

/**
 * Updates an existing slot (e.g. changing capacity, status).
 * Protects timings if bookings already exist.
 */
export async function updateCentreSlot(
  slotId: string,
  updates: Partial<Pick<CentreSlotItem, 'capacity' | 'status' | 'is_active' | 'start_time' | 'end_time'>>
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, message: 'Database connection failed.' }
  }

  try {
    // 1. Fetch current slot record
    const { data: slot, error: fetchErr } = await supabase
      .from('centre_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (fetchErr || !slot) {
      return { success: false, message: 'Slot not found.' }
    }

    // 2. Authorization check
    const staff = getStaffAuthSession()
    if (staff.role !== 'ADMIN' && staff.centre_id && staff.centre_id !== slot.centre_id) {
      return { success: false, message: 'Access Denied: You cannot modify slots for other centres.' }
    }

    // 3. Protect timings if bookings already exist
    if ((updates.start_time || updates.end_time) && slot.booked_count > 0) {
      if (updates.start_time !== slot.start_time || updates.end_time !== slot.end_time) {
        return { 
          success: false, 
          message: `Cannot change timings because this slot already has ${slot.booked_count} confirmed farmer booking(s).` 
        }
      }
    }

    // 4. Validate Capacity
    if (updates.capacity !== undefined) {
      const cap = Number(updates.capacity)
      if (cap <= 0 || !Number.isInteger(cap)) {
        return { success: false, message: 'Capacity must be a positive integer.' }
      }
      if (cap < slot.booked_count) {
        return { 
          success: false, 
          message: `Capacity cannot be set lower than the current booked count (${slot.booked_count}).` 
        }
      }
    }

    // 5. Apply Status Adjustments
    let newStatus = updates.status || slot.status
    if (updates.capacity && updates.capacity <= slot.booked_count) {
      newStatus = 'FULL'
    } else if (newStatus === 'FULL' && updates.capacity && updates.capacity > slot.booked_count) {
      newStatus = 'ACTIVE'
    }

    const dbUpdates = {
      ...updates,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    const { error: updateErr } = await supabase
      .from('centre_slots')
      .update(dbUpdates)
      .eq('id', slotId)

    if (updateErr) {
      return { success: false, message: `Update error: ${updateErr.message}` }
    }

    window.dispatchEvent(new CustomEvent('kisan_setu_centre_slots_updated'))
    return { success: true, message: 'Slot updated successfully.' }
  } catch (err: any) {
    return { success: false, message: `Failed to update slot: ${err.message}` }
  }
}

/**
 * Safely deletes a slot only if 0 bookings have been created in it.
 */
export async function deleteCentreSlot(
  slotId: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { success: false, message: 'Database connection failed.' }

  try {
    const { data: slot, error: fetchErr } = await supabase
      .from('centre_slots')
      .select('*')
      .eq('id', slotId)
      .single()

    if (fetchErr || !slot) {
      return { success: false, message: 'Slot record not found.' }
    }

    if (slot.booked_count > 0) {
      return { 
        success: false, 
        message: `Cannot delete slot: ${slot.booked_count} active booking(s) exist. You can close or cancel the slot instead.` 
      }
    }

    const { error: deleteErr } = await supabase
      .from('centre_slots')
      .delete()
      .eq('id', slotId)

    if (deleteErr) {
      return { success: false, message: `Delete failed: ${deleteErr.message}` }
    }

    window.dispatchEvent(new CustomEvent('kisan_setu_centre_slots_updated'))
    return { success: true, message: 'Slot deleted successfully.' }
  } catch (err: any) {
    return { success: false, message: `Failed to delete slot: ${err.message}` }
  }
}

/**
 * Copies a full day's slot schedule template to a future target date.
 */
export async function copyCentreSlotsToDate(
  sourceDate: string,
  targetDate: string,
  centreId: string,
  centreName: string
): Promise<{ success: boolean; count: number; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { success: false, count: 0, message: 'Database connection failed.' }

  if (targetDate <= sourceDate) {
    return { success: false, count: 0, message: 'Target date must be in the future.' }
  }

  const sourceSlots = await fetchCentreSlotsByDate(centreId, sourceDate)
  if (sourceSlots.length === 0) {
    return { success: false, count: 0, message: `No slots found on source date (${sourceDate}) to copy.` }
  }

  const targetSlots = await fetchCentreSlotsByDate(centreId, targetDate)
  if (targetSlots.length > 0) {
    return { success: false, count: 0, message: `Target date (${targetDate}) already has ${targetSlots.length} configured slots.` }
  }

  const newSlotsPayload = sourceSlots.map((s) => ({
    centre_id: centreId,
    centre_name: centreName,
    slot_date: targetDate,
    start_time: s.start_time,
    end_time: s.end_time,
    capacity: s.capacity,
    booked_count: 0,
    verified_count: 0,
    status: 'ACTIVE' as SlotStatus,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('centre_slots').insert(newSlotsPayload)
  if (error) {
    return { success: false, count: 0, message: `Failed to copy slots: ${error.message}` }
  }

  window.dispatchEvent(new CustomEvent('kisan_setu_centre_slots_updated'))
  return { success: true, count: newSlotsPayload.length, message: `Successfully copied ${newSlotsPayload.length} slots to ${targetDate}.` }
}

// =============================================================================
// 2. FARMER DYNAMIC SLOT FETCHING & ATOMIC BOOKING
// =============================================================================

/**
 * Fetches real-time slots available for booking by a farmer.
 * Includes calculated available capacity and availability status.
 */
export async function fetchAvailableSlotsForFarmer(
  centreId: string,
  dateStr: string
): Promise<Array<CentreSlotItem & { available_capacity: number; is_bookable: boolean }>> {
  const slots = await fetchCentreSlotsByDate(centreId, dateStr)

  return slots.map((s) => {
    const available = Math.max(0, s.capacity - s.booked_count)
    const isBookable = s.status === 'ACTIVE' && s.is_active && available > 0

    return {
      ...s,
      available_capacity: available,
      is_bookable: isBookable,
    }
  })
}

/**
 * Executes an atomic concurrency-protected slot booking via Supabase RPC.
 * Guarantees zero over-booking and no race conditions.
 */
export async function bookSlotAtomic(
  params: AtomicBookingParams
): Promise<AtomicBookingResult> {
  const supabase = getSupabaseClient()
  if (!supabase) {
    return { success: false, message: 'Database connection failed. Please check Supabase configuration.' }
  }

  try {
    const rawToken = generateSecureQRToken()
    const qrTokenHash = await hashTokenSHA256(rawToken)

    const rpcPayload = {
      p_slot_id: params.slot_id,
      p_farmer_id: params.farmer_id,
      p_farmer_name: params.farmer_name,
      p_farmer_phone: params.farmer_phone || '',
      p_centre_id: params.centre_id,
      p_centre_name: params.centre_name,
      p_booking_date: params.booking_date,
      p_commodity: params.commodity,
      p_quantity: params.quantity,
      p_vehicle_number: params.vehicle_number || '',
      p_qr_token_hash: qrTokenHash,
    }

    const { data, error } = await supabase.rpc('book_procurement_slot_atomic', rpcPayload)

    if (error) {
      return {
        success: false,
        error_code: 'DATABASE_ERROR',
        message: `Booking failed: ${error.message}`,
      }
    }

    const result = data as any
    if (!result?.success) {
      return {
        success: false,
        error_code: result?.error_code || 'BOOKING_REJECTED',
        message: result?.message || 'Slot booking failed. Please select another slot.',
      }
    }

    // Store raw token securely for the farmer's frontend QR display
    if (result.booking_number) {
      setFarmerRawToken(result.booking_number, rawToken)
    }

    return {
      success: true,
      booking_id: result.booking_id,
      booking_number: result.booking_number,
      token_number: result.token_number,
      slot_id: result.slot_id,
      start_time: result.start_time,
      end_time: result.end_time,
      available_remaining: result.available_remaining,
      rawToken,
      message: `Booking confirmed! Gate Token: ${result.token_number}`,
    }
  } catch (err: any) {
    return {
      success: false,
      error_code: 'CLIENT_EXCEPTION',
      message: `Booking error: ${err.message}`,
    }
  }
}
