// =============================================================================
// Kisan Setu — Live Queue & Gate Pass Verification Service
// Handles Atomic Gate Pass Check-in, Monotonic Queue Positioning, & Real-time Sync
// =============================================================================

import { getSupabaseClient } from './supabaseClient'
import { ALL_PROCUREMENT_CENTRES } from '../data/procurementCentresData'
import type { BookingRecord, StaffUser } from './qrBookingService'

export type LiveQueueStatus = 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED'

export interface LiveQueueItem {
  id: string
  booking_id: string
  farmer_id: string
  farmer_name: string
  farmer_phone?: string
  centre_id: string
  centre_name: string
  slot_id?: string
  token_number: string
  queue_position: number
  status: LiveQueueStatus
  counter_id: string
  commodity?: string
  quantity?: number
  vehicle_number?: string
  checked_in_at: string
  called_at?: string
  service_started_at?: string
  service_completed_at?: string
  created_at?: string
  updated_at?: string
}

export interface GateVerificationResponse {
  success: boolean
  code?: 'VALID' | 'ALREADY_CHECKED_IN' | 'CENTRE_MISMATCH' | 'CANCELLED_BOOKING' | 'ALREADY_COMPLETED' | 'NOT_FOUND' | 'INVALID_TOKEN' | 'ERROR'
  message: string
  booking?: Partial<BookingRecord>
  queueEntry?: LiveQueueItem
}

export interface FarmerQueueStatus {
  isVerified: boolean
  bookingId?: string
  tokenNumber?: string
  queuePosition: number
  status: LiveQueueStatus | 'NOT_CHECKED_IN'
  farmersAhead: number
  estimatedWaitMinutes: number
  activeCounters: number
  currentServingToken: string
  assignedBay: string
  checkedInAt?: string
  lastUpdatedAt: string
}

export interface AdminCentreQueueSummary {
  centreId: string
  centreName: string
  district: string
  agency: string
  totalCheckedIn: number
  waitingCount: number
  servingCount: number
  completedCount: number
  activeCounters: number
  currentServingToken: string
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

// -----------------------------------------------------------------------------
// 1. GATE PASS VERIFICATION -> JOIN LIVE QUEUE (ATOMIC BACKEND VERIFICATION)
// -----------------------------------------------------------------------------
export async function verifyGatePassAndJoinQueue(
  rawTokenOrBooking: string,
  staffUser: StaffUser,
  remarks = 'Verified at Gate Intake Desk'
): Promise<GateVerificationResponse> {
  const cleanInput = rawTokenOrBooking.trim()
  if (!cleanInput) {
    return {
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Please provide a valid gate pass QR or Token Number.',
    }
  }

  const supabase = getSupabaseClient()
  if (!supabase) {
    return {
      success: false,
      code: 'ERROR',
      message: 'Database connection failed. Please check backend configuration.',
    }
  }

  // 1. Attempt Atomic Supabase RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('verify_gate_pass_and_join_queue', {
      p_token_or_booking: cleanInput,
      p_staff_id: staffUser.id,
      p_staff_name: staffUser.name,
      p_staff_centre_id: staffUser.centre_id,
      p_staff_centre_name: staffUser.centre_name,
      p_remarks: remarks,
    })

    if (!rpcError && rpcData) {
      const res = rpcData as GateVerificationResponse
      if (res.success && typeof window !== 'undefined') {
        broadcastQueueEvent('QUEUE_ENTRY_CREATED', res.queueEntry)
      }
      return res
    }
  } catch {
    // Fallback to direct transactional query if RPC not yet compiled
  }

  // 2. Direct Fallback Check-in Logic
  try {
    let cleanToken = cleanInput
    if (cleanToken.startsWith('KS1|')) {
      cleanToken = cleanToken.substring(4)
    }

    // Locate booking
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .or(`id.eq.${cleanToken},booking_number.ilike.${cleanToken},token_number.ilike.${cleanToken},qr_token_hash.ilike.${cleanToken}`)
      .maybeSingle()

    if (fetchErr || !booking) {
      return {
        success: false,
        code: 'NOT_FOUND',
        message: 'Booking record not found for this gate pass.',
      }
    }

    if (booking.status === 'CANCELLED') {
      return {
        success: false,
        code: 'CANCELLED_BOOKING',
        message: 'This booking has been cancelled and cannot enter the yard.',
      }
    }

    if (booking.status === 'COMPLETED') {
      return {
        success: false,
        code: 'ALREADY_COMPLETED',
        message: 'This booking has already completed weighment and procurement.',
      }
    }

    // Check Centre Isolation
    if (staffUser.centre_name && staffUser.centre_name !== 'ALL') {
      const staffCentreLower = staffUser.centre_name.toLowerCase()
      const bookCentreLower = (booking.centre_name || '').toLowerCase()
      if (
        bookCentreLower &&
        !bookCentreLower.includes(staffCentreLower) &&
        !staffCentreLower.includes(bookCentreLower)
      ) {
        return {
          success: false,
          code: 'CENTRE_MISMATCH',
          message: `Gate pass belongs to ${booking.centre_name}, but was scanned at ${staffUser.centre_name}.`,
        }
      }
    }

    // Check if already in live_queue
    const { data: existingQueue } = await supabase
      .from('live_queue')
      .select('*')
      .eq('booking_id', booking.id)
      .maybeSingle()

    if (existingQueue && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(existingQueue.status)) {
      return {
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `Farmer is already checked in at Position #${existingQueue.queue_position}.`,
        queueEntry: existingQueue as LiveQueueItem,
      }
    }

    // Calculate next queue position for today
    const today = new Date().toISOString().split('T')[0]
    const { data: todayQueue } = await supabase
      .from('live_queue')
      .select('queue_position')
      .eq('centre_id', booking.centre_id || staffUser.centre_id || 'centre-up-vns-01')
      .gte('created_at', `${today}T00:00:00Z`)
      .order('queue_position', { ascending: false })
      .limit(1)

    const nextPos = (todayQueue && todayQueue.length > 0 ? todayQueue[0].queue_position : 0) + 1
    const now = new Date().toISOString()

    // Update booking
    await supabase
      .from('bookings')
      .update({
        status: 'CHECKED_IN',
        verification_status: 'VERIFIED',
        verified_by: staffUser.id,
        verified_by_name: staffUser.name,
        verified_at: now,
        verification_remarks: remarks,
        updated_at: now,
      })
      .eq('id', booking.id)

    // Insert live_queue
    const newQueuePayload: Partial<LiveQueueItem> = {
      booking_id: booking.id,
      farmer_id: booking.farmer_id,
      farmer_name: booking.farmer_name,
      farmer_phone: booking.farmer_phone,
      centre_id: booking.centre_id || staffUser.centre_id || 'centre-up-vns-01',
      centre_name: booking.centre_name || staffUser.centre_name || 'Chiraigaon 1st at Gaurakala (FCS)',
      slot_id: booking.slot_id,
      token_number: booking.token_number,
      queue_position: nextPos,
      status: 'WAITING',
      counter_id: 'Bay 2',
      commodity: booking.commodity,
      quantity: booking.quantity,
      vehicle_number: booking.vehicle_number || '',
      checked_in_at: now,
      created_at: now,
      updated_at: now,
    }

    const { data: insertedQueue } = await supabase
      .from('live_queue')
      .upsert(newQueuePayload, { onConflict: 'booking_id' })
      .select()
      .single()

    const queueEntry = (insertedQueue || newQueuePayload) as LiveQueueItem

    // Audit log
    await supabase.from('booking_verifications').insert({
      booking_id: booking.id,
      booking_number: booking.booking_number,
      staff_id: staffUser.id,
      staff_name: staffUser.name,
      centre_name: staffUser.centre_name || booking.centre_name,
      action: 'VERIFY',
      result: 'VALID',
      remarks,
      scanned_at: now,
    })

    if (typeof window !== 'undefined') {
      broadcastQueueEvent('QUEUE_ENTRY_CREATED', queueEntry)
    }

    return {
      success: true,
      code: 'VALID',
      message: `Gate pass verified successfully! Farmer joined Live Queue at Position #${nextPos}.`,
      booking: {
        id: booking.id,
        booking_number: booking.booking_number,
        token_number: booking.token_number,
        status: 'CHECKED_IN',
        verification_status: 'VERIFIED',
      },
      queueEntry,
    }
  } catch (err: any) {
    return {
      success: false,
      code: 'ERROR',
      message: `Verification processing failed: ${err.message}`,
    }
  }
}

// -----------------------------------------------------------------------------
// 2. FETCH LIVE QUEUE FOR A SPECIFIC CENTRE (OPERATOR & CENTRE ADMIN)
// -----------------------------------------------------------------------------
export async function fetchCentreLiveQueue(
  centreIdOrName = 'centre-up-vns-01',
  explicitCentreName?: string
): Promise<LiveQueueItem[]> {
  const supabase = getSupabaseClient()
  const rawQuery = (centreIdOrName || '').trim()

  const matched = ALL_PROCUREMENT_CENTRES.find(
    (c) =>
      c.id.toLowerCase() === rawQuery.toLowerCase() ||
      c.centreName.toLowerCase() === rawQuery.toLowerCase() ||
      `centre-up-${c.id}`.toLowerCase() === rawQuery.toLowerCase() ||
      `centre-${c.id}`.toLowerCase() === rawQuery.toLowerCase() ||
      (explicitCentreName && c.centreName.toLowerCase() === explicitCentreName.toLowerCase())
  )

  const targetCentreName = explicitCentreName || (matched ? matched.centreName : rawQuery)
  const possibleIds = Array.from(
    new Set([
      rawQuery,
      matched ? matched.id : '',
      matched ? `centre-up-${matched.id}` : '',
      matched ? `centre-${matched.id}` : '',
      rawQuery.startsWith('centre-up-') ? rawQuery.replace('centre-up-', '') : '',
      rawQuery.startsWith('centre-') ? rawQuery.replace('centre-', '') : '',
      !rawQuery.startsWith('centre-') && rawQuery ? `centre-up-${rawQuery}` : '',
    ].filter(Boolean))
  )

  if (supabase) {
    try {
      let query = supabase
        .from('live_queue')
        .select('*')
        .neq('status', 'CANCELLED')

      if (possibleIds.length > 0 && targetCentreName) {
        const escapedName = targetCentreName.replace(/,/g, '').trim()
        query = query.or(`centre_id.in.(${possibleIds.join(',')}),centre_name.ilike.%${escapedName}%`)
      } else if (possibleIds.length > 0) {
        query = query.in('centre_id', possibleIds)
      } else if (targetCentreName) {
        query = query.ilike('centre_name', `%${targetCentreName}%`)
      }

      const { data, error } = await query.order('queue_position', { ascending: true })

      if (!error && data && data.length > 0) {
        return data as LiveQueueItem[]
      }
    } catch {
      // fallback
    }

    // Fallback: build from verified bookings
    try {
      let bQuery = supabase
        .from('bookings')
        .select('*')
        .eq('verification_status', 'VERIFIED')
        .neq('status', 'CANCELLED')

      if (possibleIds.length > 0 && targetCentreName) {
        const escapedName = targetCentreName.replace(/,/g, '').trim()
        bQuery = bQuery.or(`centre_id.in.(${possibleIds.join(',')}),centre_name.ilike.%${escapedName}%`)
      }

      const { data: bData } = await bQuery.order('verified_at', { ascending: true })
      if (bData && bData.length > 0) {
        return bData.map((b, idx) => ({
          id: b.id,
          booking_id: b.id,
          farmer_id: b.farmer_id,
          farmer_name: b.farmer_name,
          farmer_phone: b.farmer_phone,
          centre_id: b.centre_id || (matched ? matched.id : rawQuery),
          centre_name: b.centre_name || targetCentreName,
          token_number: b.token_number,
          queue_position: idx + 1,
          status: b.status === 'COMPLETED' ? 'COMPLETED' : b.status === 'SERVING' ? 'IN_SERVICE' : 'WAITING',
          counter_id: b.bay_assigned || 'Bay 2',
          commodity: b.commodity,
          quantity: b.quantity,
          vehicle_number: b.vehicle_number || '',
          checked_in_at: b.verified_at || b.created_at,
          created_at: b.created_at,
          updated_at: b.updated_at,
        })) as LiveQueueItem[]
      }
    } catch {
      // ignore
    }
  }

  return []
}

// -----------------------------------------------------------------------------
// 3. FETCH FARMER-SPECIFIC LIVE QUEUE STATUS (FARMER DASHBOARD & LIVE TRACKER)
// -----------------------------------------------------------------------------
export async function fetchFarmerLiveQueueStatus(
  farmerId: string,
  targetBookingId?: string
): Promise<FarmerQueueStatus> {
  const supabase = getSupabaseClient()
  const fallbackDate = new Date().toISOString()

  if (!supabase || !farmerId) {
    return {
      isVerified: false,
      queuePosition: 0,
      status: 'NOT_CHECKED_IN',
      farmersAhead: 0,
      estimatedWaitMinutes: 0,
      activeCounters: 2,
      currentServingToken: 'Yard Clear',
      assignedBay: 'Intake Bay 1',
      lastUpdatedAt: fallbackDate,
    }
  }

  try {
    // 1. Locate farmer's active booking
    let bQuery = supabase
      .from('bookings')
      .select('*')
      .eq('farmer_id', farmerId)
      .neq('status', 'CANCELLED')

    if (targetBookingId) {
      bQuery = bQuery.eq('id', targetBookingId)
    }

    const { data: bookings } = await bQuery.order('created_at', { ascending: false }).limit(1)
    const activeBooking = bookings && bookings.length > 0 ? bookings[0] : null

    if (!activeBooking) {
      return {
        isVerified: false,
        queuePosition: 0,
        status: 'NOT_CHECKED_IN',
        farmersAhead: 0,
        estimatedWaitMinutes: 0,
        activeCounters: 2,
        currentServingToken: 'Yard Clear',
        assignedBay: 'Intake Bay 1',
        lastUpdatedAt: fallbackDate,
      }
    }

    const isVerified = activeBooking.verification_status === 'VERIFIED' || activeBooking.status === 'CHECKED_IN'
    const centreName = activeBooking.centre_name

    // 2. Fetch centre live queue
    const queueList = await fetchCentreLiveQueue(centreName, centreName)
    const activeWaiting = queueList.filter((q) => q.status === 'WAITING' || q.status === 'CALLED' || q.status === 'IN_SERVICE')
    const servingItem = queueList.find((q) => q.status === 'IN_SERVICE' || q.status === 'CALLED')
    const servingToken = servingItem ? servingItem.token_number : activeWaiting.length > 0 ? activeWaiting[0].token_number : 'Yard Clear'

    if (!isVerified) {
      return {
        isVerified: false,
        bookingId: activeBooking.id,
        tokenNumber: activeBooking.token_number,
        queuePosition: 0,
        status: 'NOT_CHECKED_IN',
        farmersAhead: 0,
        estimatedWaitMinutes: 0,
        activeCounters: 2,
        currentServingToken: servingToken,
        assignedBay: 'Gate 2 Verification Desk',
        lastUpdatedAt: fallbackDate,
      }
    }

    // 3. Find farmer's queue entry
    const myEntry = queueList.find((q) => q.booking_id === activeBooking.id || q.token_number === activeBooking.token_number)
    const myPos = myEntry ? myEntry.queue_position : 1
    const myStatus = (myEntry?.status as LiveQueueStatus) || (activeBooking.status === 'COMPLETED' ? 'COMPLETED' : 'WAITING')

    // Farmers ahead in active queue
    const farmersAhead = activeWaiting.findIndex(
      (q) => q.booking_id === activeBooking.id || q.token_number === activeBooking.token_number
    )
    const effectiveAhead = farmersAhead >= 0 ? farmersAhead : Math.max(0, myPos - 1)

    const activeCounters = 2
    const avgServiceTimeMins = 5.5
    const estimatedWaitMinutes = Math.ceil(effectiveAhead / activeCounters) * avgServiceTimeMins

    return {
      isVerified: true,
      bookingId: activeBooking.id,
      tokenNumber: activeBooking.token_number,
      queuePosition: myPos,
      status: myStatus,
      farmersAhead: effectiveAhead,
      estimatedWaitMinutes: Math.round(estimatedWaitMinutes),
      activeCounters,
      currentServingToken: servingToken,
      assignedBay: myEntry?.counter_id || 'Bay 2',
      checkedInAt: activeBooking.verified_at || myEntry?.checked_in_at,
      lastUpdatedAt: fallbackDate,
    }
  } catch {
    return {
      isVerified: false,
      queuePosition: 0,
      status: 'NOT_CHECKED_IN',
      farmersAhead: 0,
      estimatedWaitMinutes: 0,
      activeCounters: 2,
      currentServingToken: 'Yard Clear',
      assignedBay: 'Intake Bay 1',
      lastUpdatedAt: fallbackDate,
    }
  }
}

// -----------------------------------------------------------------------------
// 4. OPERATOR QUEUE DISPATCH ACTIONS
// -----------------------------------------------------------------------------
export async function callNextQueueToken(
  queueId: string,
  counterId = 'Bay 2'
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { success: false, message: 'Database connection failed.' }

  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('call_queue_token', {
      p_queue_id: queueId,
      p_counter_id: counterId,
    })
    if (!rpcErr && rpcData?.success) {
      broadcastQueueEvent('TOKEN_CALLED', rpcData.queueEntry)
      return { success: true, message: `Token called to ${counterId}.` }
    }
  } catch {
    // fallback
  }

  try {
    const now = new Date().toISOString()
    const { data: qItem } = await supabase
      .from('live_queue')
      .update({
        status: 'CALLED',
        counter_id: counterId,
        called_at: now,
        updated_at: now,
      })
      .eq('id', queueId)
      .select()
      .single()

    if (qItem?.booking_id) {
      await supabase
        .from('bookings')
        .update({ status: 'CALLED', updated_at: now })
        .eq('id', qItem.booking_id)
    }

    broadcastQueueEvent('TOKEN_CALLED', qItem)
    return { success: true, message: `Token called to ${counterId}.` }
  } catch (err: any) {
    return { success: false, message: `Failed to call token: ${err.message}` }
  }
}

export async function updateQueueItemServiceStatus(
  queueId: string,
  newStatus: LiveQueueStatus,
  counterId = 'Bay 2'
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { success: false, message: 'Database connection failed.' }

  const now = new Date().toISOString()
  try {
    const updatePayload: Partial<LiveQueueItem> = {
      status: newStatus,
      counter_id: counterId,
      updated_at: now,
    }
    if (newStatus === 'CALLED') updatePayload.called_at = now
    if (newStatus === 'IN_SERVICE') updatePayload.service_started_at = now
    if (newStatus === 'COMPLETED') updatePayload.service_completed_at = now

    const { data: qItem } = await supabase
      .from('live_queue')
      .update(updatePayload)
      .eq('id', queueId)
      .select()
      .single()

    if (qItem?.booking_id) {
      const bStatus = newStatus === 'COMPLETED' ? 'COMPLETED' : newStatus === 'IN_SERVICE' ? 'SERVING' : newStatus === 'CALLED' ? 'CALLED' : 'CONFIRMED'
      await supabase
        .from('bookings')
        .update({ status: bStatus, updated_at: now })
        .eq('id', qItem.booking_id)
    }

    broadcastQueueEvent(
      newStatus === 'IN_SERVICE'
        ? 'SERVICE_STARTED'
        : newStatus === 'COMPLETED'
        ? 'SERVICE_COMPLETED'
        : newStatus === 'SKIPPED'
        ? 'QUEUE_ENTRY_SKIPPED'
        : 'QUEUE_UPDATED',
      qItem
    )
    return { success: true, message: `Queue status updated to ${newStatus}.` }
  } catch (err: any) {
    return { success: false, message: `Failed to update status: ${err.message}` }
  }
}

// -----------------------------------------------------------------------------
// 5. ADMINISTRATIVE ADMIN: ALL CENTRES QUEUE SUMMARY
// -----------------------------------------------------------------------------
export async function fetchAdminAllCentresQueueSummary(): Promise<AdminCentreQueueSummary[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  try {
    const { data: allQueue } = await supabase
      .from('live_queue')
      .select('*')
      .neq('status', 'CANCELLED')

    const queueList = (allQueue || []) as LiveQueueItem[]

    return ALL_PROCUREMENT_CENTRES.map((centre) => {
      const cLower = centre.centreName.toLowerCase()
      const cIdLower = centre.id.toLowerCase()

      const centreItems = queueList.filter((item) => {
        const itemCentre = (item.centre_name || '').toLowerCase()
        const itemCentreId = (item.centre_id || '').toLowerCase()
        return (
          itemCentre.includes(cLower) ||
          cLower.includes(itemCentre) ||
          itemCentreId === cIdLower ||
          itemCentreId === `centre-up-${cIdLower}`
        )
      })

      const waiting = centreItems.filter((i) => i.status === 'WAITING').length
      const serving = centreItems.filter((i) => i.status === 'CALLED' || i.status === 'IN_SERVICE').length
      const completed = centreItems.filter((i) => i.status === 'COMPLETED').length
      const currentServing = centreItems.find((i) => i.status === 'IN_SERVICE' || i.status === 'CALLED')

      const congestion: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' =
        waiting > 20 ? 'HIGH' : waiting > 8 ? 'MEDIUM' : 'LOW'

      return {
        centreId: centre.id,
        centreName: centre.centreName,
        district: centre.district,
        agency: centre.agency,
        totalCheckedIn: centreItems.length,
        waitingCount: waiting,
        servingCount: serving,
        completedCount: completed,
        activeCounters: 2,
        currentServingToken: currentServing ? currentServing.token_number : waiting > 0 ? 'Next in Queue' : 'Yard Clear',
        congestionLevel: congestion,
      }
    })
  } catch {
    return []
  }
}

// -----------------------------------------------------------------------------
// 6. REAL-TIME BROADCAST & WEBSOCKET SYNC
// -----------------------------------------------------------------------------
export function broadcastQueueEvent(
  eventType:
    | 'QUEUE_ENTRY_CREATED'
    | 'QUEUE_UPDATED'
    | 'TOKEN_CALLED'
    | 'SERVICE_STARTED'
    | 'SERVICE_COMPLETED'
    | 'QUEUE_ENTRY_SKIPPED',
  payload?: any
) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent('kisan_setu_live_queue_event', {
      detail: { eventType, payload },
    })
  )
  window.dispatchEvent(new CustomEvent('kisan_setu_queue_updated', { detail: payload }))
  window.dispatchEvent(new CustomEvent('kisan_setu_booking_updated', { detail: payload }))
}

export function subscribeToLiveQueue(
  centreIdOrName: string,
  onUpdate: () => void
): () => void {
  const supabase = getSupabaseClient()
  let channel: any = null

  if (supabase) {
    try {
      channel = supabase
        .channel(`live_queue_channel_${centreIdOrName.replace(/[^a-zA-Z0-9]/g, '_')}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'live_queue' },
          () => {
            onUpdate()
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          () => {
            onUpdate()
          }
        )
        .subscribe()
    } catch {
      // fallback
    }
  }

  const handleCustomEvent = () => {
    onUpdate()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('kisan_setu_live_queue_event', handleCustomEvent)
    window.addEventListener('kisan_setu_queue_updated', handleCustomEvent)
    window.addEventListener('kisan_setu_booking_updated', handleCustomEvent)
  }

  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel).catch(() => {})
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('kisan_setu_live_queue_event', handleCustomEvent)
      window.removeEventListener('kisan_setu_queue_updated', handleCustomEvent)
      window.removeEventListener('kisan_setu_booking_updated', handleCustomEvent)
    }
  }
}
