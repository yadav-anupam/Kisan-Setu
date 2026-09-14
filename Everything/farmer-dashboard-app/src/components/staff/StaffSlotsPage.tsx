import { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  X,
  Plus,
  Calendar,
  Copy,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import {
  fetchCentreSlotsByDate,
  createCentreSlot,
  updateCentreSlot,
  deleteCentreSlot,
  copyCentreSlotsToDate,
  fetchSlotBookings,
  type CentreSlotItem,
  type SlotStatus,
} from '../../services/slotManagementService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'
import './StaffSlotsPage.css'

export default function StaffSlotsPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [slots, setSlots] = useState<CentreSlotItem[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editSlotModal, setEditSlotModal] = useState<CentreSlotItem | null>(null)
  const [copyModalOpen, setCopyModalOpen] = useState(false)
  const [viewBookingsModal, setViewBookingsModal] = useState<{ slot: CentreSlotItem; bookings: any[]; loading: boolean } | null>(null)

  // Form states for Create Slot
  const [newStartTime, setNewStartTime] = useState('09:00 AM')
  const [newEndTime, setNewEndTime] = useState('11:00 AM')
  const [newCapacity, setNewCapacity] = useState('8')
  const [newStatus, setNewStatus] = useState<SlotStatus>('ACTIVE')

  // Form states for Edit Slot
  const [editCapacity, setEditCapacity] = useState('8')
  const [editStatus, setEditStatus] = useState<SlotStatus>('ACTIVE')

  // Form states for Copy Schedule
  const [copyTargetDate, setCopyTargetDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })

  const loadSlots = useCallback(async () => {
    setIsLoading(true)
    setErrorMsg('')
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    const centreId = currentStaff.centre_id || 'centre-alwar-01'

    try {
      const data = await fetchCentreSlotsByDate(centreId, selectedDate)
      setSlots(data)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load centre slots.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || (isAdmin ? '/admin/centres' : isCentreAdmin ? '/centre-admin/slots' : '/staff/slots'))
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }

    loadSlots()

    const handleUpdate = () => loadSlots()
    window.addEventListener('kisan_setu_centre_slots_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_centre_slots_updated', handleUpdate)
  }, [pathname, isCentreAdmin, isAdmin, loadSlots])

  // KPI Calculations
  const totalCapacity = slots.reduce((s, x) => s + Number(x.capacity || 0), 0)
  const totalBooked = slots.reduce((s, x) => s + Number(x.booked_count || 0), 0)
  const totalVerified = slots.reduce((s, x) => s + Number(x.verified_count || 0), 0)
  const totalAvailable = Math.max(0, totalCapacity - totalBooked)

  // 1. Create Slot Handler
  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const res = await createCentreSlot({
      centre_id: staff.centre_id || 'centre-alwar-01',
      centre_name: staff.centre_name || 'Alwar Central Grain Mandi',
      slot_date: selectedDate,
      start_time: newStartTime,
      end_time: newEndTime,
      capacity: Number(newCapacity),
      status: newStatus,
    })

    if (res.success) {
      setSuccessMsg(res.message)
      setCreateModalOpen(false)
      loadSlots()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 2. Edit Slot Handler
  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSlotModal) return
    setErrorMsg('')

    const res = await updateCentreSlot(editSlotModal.id, {
      capacity: Number(editCapacity),
      status: editStatus,
    })

    if (res.success) {
      setSuccessMsg(res.message)
      setEditSlotModal(null)
      loadSlots()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 3. Toggle Slot Status (Close / Re-open)
  const handleToggleSlotStatus = async (slot: CentreSlotItem) => {
    const nextStatus: SlotStatus = slot.status === 'CLOSED' ? 'ACTIVE' : 'CLOSED'
    const confirmText = nextStatus === 'CLOSED'
      ? `Close slot (${slot.start_time} - ${slot.end_time})? Farmers will not be able to make new bookings.`
      : `Re-open slot (${slot.start_time} - ${slot.end_time}) for active farmer bookings?`

    if (!window.confirm(confirmText)) return

    const res = await updateCentreSlot(slot.id, { status: nextStatus })
    if (res.success) {
      setSuccessMsg(`Slot ${slot.start_time} is now ${nextStatus}.`)
      loadSlots()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 4. Delete Slot Handler
  const handleDeleteSlot = async (slot: CentreSlotItem) => {
    if (slot.booked_count > 0) {
      alert(`Cannot delete: This slot already has ${slot.booked_count} confirmed booking(s). You can close the slot instead.`)
      return
    }

    if (!window.confirm(`Permanently delete empty slot (${slot.start_time} - ${slot.end_time})?`)) return

    const res = await deleteCentreSlot(slot.id)
    if (res.success) {
      setSuccessMsg('Slot deleted successfully.')
      loadSlots()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 5. Copy Schedule Handler
  const handleCopySchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const res = await copyCentreSlotsToDate(
      selectedDate,
      copyTargetDate,
      staff.centre_id || 'centre-alwar-01',
      staff.centre_name || 'Alwar Central Grain Mandi'
    )

    if (res.success) {
      setSuccessMsg(res.message)
      setCopyModalOpen(false)
      setSelectedDate(copyTargetDate)
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 6. Publish Draft Slot
  const handlePublishSlot = async (slot: CentreSlotItem) => {
    setErrorMsg('')
    const res = await updateCentreSlot(slot.id, { status: 'ACTIVE' })
    if (res.success) {
      setSuccessMsg(`Slot ${slot.start_time} - ${slot.end_time} is now PUBLISHED and open for farmer bookings.`)
      loadSlots()
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message)
    }
  }

  // 7. Open View Bookings Modal
  const handleOpenViewBookings = async (slot: CentreSlotItem) => {
    setViewBookingsModal({ slot, bookings: [], loading: true })
    const bookings = await fetchSlotBookings(slot)
    setViewBookingsModal({ slot, bookings, loading: false })
  }

  const filteredSlots = slots.filter((s) => {
    if (statusFilter === 'ALL') return true
    if (statusFilter === 'ACTIVE' || statusFilter === 'PUBLISHED') return s.status === 'ACTIVE'
    return s.status === statusFilter
  })

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="slots"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="centres"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="slots"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Slot Capacity &amp; Timetable"
        />

        <main className="staff-slots-main">
          {/* Header Banner with Date Picker & Management Controls */}
          <div className="staff-slots-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={24} color="#0d631b" />
                Centre Procurement Slots &amp; Capacity
              </h1>
              <p>Daily intake windows, vehicle limits, and gate allocation for <strong>{staff.centre_name}</strong></p>
            </div>

            {/* Date Picker, Status Filter & Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                <Calendar size={16} color="#0d631b" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ border: 'none', outline: 'none', fontSize: '13px', fontWeight: 700, color: '#0f172a', background: 'transparent' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Slot States</option>
                <option value="ACTIVE">PUBLISHED / ACTIVE</option>
                <option value="DRAFT">DRAFT (Unpublished)</option>
                <option value="FULL">FULL (Capacity Reached)</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <button
                type="button"
                onClick={loadSlots}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}
                title="Refresh Slots"
              >
                <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
              </button>

              <button
                type="button"
                onClick={() => setCopyModalOpen(true)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700 }}
              >
                <Copy size={14} /> Copy to Date
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg('')
                  setCreateModalOpen(true)
                }}
                style={{ background: '#0d631b', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, boxShadow: '0 2px 8px rgba(13,99,27,0.25)' }}
              >
                <Plus size={16} /> + Create New Slot
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#16a34a" /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 600 }}>
              <AlertTriangle size={18} color="#dc2626" /> {errorMsg}
            </div>
          )}

          {/* KPI Banner */}
          <section className="staff-slots-kpi-grid">
            <div className="staff-slots-kpi-card">
              <div className="staff-slots-kpi-label">Total Daily Capacity</div>
              <strong className="staff-slots-kpi-value" style={{ color: '#0f172a' }}>
                {totalCapacity} Vehicles
              </strong>
              <small className="staff-slots-kpi-sub" style={{ color: '#64748b' }}>{slots.length} Operational Windows</small>
            </div>

            <div className="staff-slots-kpi-card">
              <div className="staff-slots-kpi-label">Total Booked on {selectedDate}</div>
              <strong className="staff-slots-kpi-value" style={{ color: '#0d631b' }}>
                {totalBooked} ({Math.round((totalBooked / (totalCapacity || 1)) * 100)}%)
              </strong>
              <small className="staff-slots-kpi-sub" style={{ color: '#16a34a', fontWeight: 700 }}>Confirmed Bookings</small>
            </div>

            <div className="staff-slots-kpi-card">
              <div className="staff-slots-kpi-label">Available Capacity</div>
              <strong className="staff-slots-kpi-value" style={{ color: '#2563eb' }}>
                {totalAvailable} Slots
              </strong>
              <small className="staff-slots-kpi-sub" style={{ color: '#64748b' }}>Open for farmer intake</small>
            </div>

            <div className="staff-slots-kpi-card">
              <div className="staff-slots-kpi-label">Gate Cleared &amp; Verified</div>
              <strong className="staff-slots-kpi-value" style={{ color: '#16a34a' }}>
                {totalVerified} Vehicles
              </strong>
              <small className="staff-slots-kpi-sub" style={{ color: '#64748b' }}>Passed weighbridge</small>
            </div>
          </section>

          {/* Slots Cards Grid */}
          {filteredSlots.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', border: '1px solid #e2e8f0', margin: '20px 0' }}>
              <Clock size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px', color: '#1e293b' }}>
                {slots.length === 0 ? `No Slots Configured for ${selectedDate}` : `No Slots Match Filter (${statusFilter})`}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
                Create new procurement intake slots or adjust your date/status filter.
              </p>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                style={{ marginTop: '16px', background: '#0d631b', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                + Create Slot for {selectedDate}
              </button>
            </div>
          ) : (
            <div className="staff-slots-cards-grid">
              {filteredSlots.map((slot) => {
                const utilPercent = Math.min(100, Math.round((slot.booked_count / (slot.capacity || 1)) * 100))
                const available = Math.max(0, slot.capacity - slot.booked_count)
                const pending = Math.max(0, slot.booked_count - slot.verified_count)
                const isFull = slot.booked_count >= slot.capacity
                const isClosed = slot.status === 'CLOSED' || slot.status === 'CANCELLED'

                let badgeBg = '#dcfce7'
                let badgeColor = '#166534'
                let badgeText = slot.status === 'ACTIVE' ? 'PUBLISHED' : slot.status
                if (isFull) {
                  badgeBg = '#fee2e2'
                  badgeColor = '#991b1b'
                  badgeText = 'FULL'
                } else if (isClosed) {
                  badgeBg = '#f1f5f9'
                  badgeColor = '#64748b'
                } else if (slot.status === 'DRAFT') {
                  badgeBg = '#fef3c7'
                  badgeColor = '#92400e'
                  badgeText = 'DRAFT'
                }

                return (
                  <div key={slot.id} className="staff-slot-card" style={{ borderTop: isFull ? '4px solid #ef4444' : isClosed ? '4px solid #94a3b8' : slot.status === 'DRAFT' ? '4px solid #f59e0b' : '4px solid #16a34a' }}>
                    <div className="staff-slot-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="#0d631b" />
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                          {slot.start_time} – {slot.end_time}
                        </strong>
                      </div>
                      <span
                        className="staff-slot-card-badge"
                        style={{ background: badgeBg, color: badgeColor, fontWeight: 800 }}
                      >
                        {badgeText}
                      </span>
                    </div>

                    {/* Utilization Metric */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: '#64748b' }}>Slot Capacity</span>
                        <strong style={{ color: isFull ? '#ef4444' : utilPercent > 80 ? '#f59e0b' : '#0d631b' }}>
                          {slot.booked_count} / {slot.capacity} ({utilPercent}%)
                        </strong>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${utilPercent}%`,
                            background: isFull ? '#ef4444' : utilPercent > 80 ? '#f59e0b' : '#16a34a',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    {/* 3-Column Slot Breakdown */}
                    <div className="staff-slot-breakdown">
                      <div>
                        <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Verified</small>
                        <strong style={{ fontSize: '14px', color: '#16a34a' }}>{slot.verified_count}</strong>
                      </div>
                      <div>
                        <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Pending</small>
                        <strong style={{ fontSize: '14px', color: '#ca8a04' }}>{pending}</strong>
                      </div>
                      <div>
                        <small style={{ fontSize: '10.5px', color: '#64748b', display: 'block' }}>Available</small>
                        <strong style={{ fontSize: '14px', color: available > 0 ? '#2563eb' : '#94a3b8' }}>{available}</strong>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="staff-slot-actions" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {slot.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handlePublishSlot(slot)}
                          style={{
                            flex: 1,
                            background: '#0d631b',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ✓ Publish Slot
                        </button>
                      )}

                      <button
                        type="button"
                        className="staff-slot-btn-view"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenViewBookings(slot)}
                      >
                        View Bookings ({slot.booked_count})
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditSlotModal(slot)
                          setEditCapacity(slot.capacity.toString())
                          setEditStatus(slot.status)
                        }}
                        title="Edit Capacity & Status"
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
                      >
                        <Edit2 size={14} color="#475569" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleSlotStatus(slot)}
                        title={slot.status === 'CLOSED' ? 'Re-open Slot' : 'Close Slot'}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer' }}
                      >
                        {slot.status === 'CLOSED' ? <Unlock size={14} color="#16a34a" /> : <Lock size={14} color="#d97706" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot)}
                        disabled={slot.booked_count > 0}
                        title={slot.booked_count > 0 ? 'Cannot delete slot with bookings' : 'Delete Slot'}
                        style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 10px', cursor: slot.booked_count > 0 ? 'not-allowed' : 'pointer', opacity: slot.booked_count > 0 ? 0.4 : 1 }}
                      >
                        <Trash2 size={14} color="#dc2626" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ====================================================================
              VIEW BOOKED FARMERS MODAL
              ==================================================================== */}
          {viewBookingsModal && (
            <div className="fd-modal-overlay">
              <div className="fd-modal-card" style={{ maxWidth: '680px' }}>
                <div className="fd-modal-header">
                  <div>
                    <h2 style={{ fontSize: '17px', margin: 0 }}>
                      Booked Farmers — {viewBookingsModal.slot.start_time} - {viewBookingsModal.slot.end_time}
                    </h2>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {viewBookingsModal.slot.slot_date} • {viewBookingsModal.slot.centre_name}
                    </p>
                  </div>
                  <button className="fd-modal-close" onClick={() => setViewBookingsModal(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ padding: '16px 20px', maxHeight: '420px', overflowY: 'auto' }}>
                  {viewBookingsModal.loading ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                      <div>Loading booked appointments...</div>
                    </div>
                  ) : viewBookingsModal.bookings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                      <Clock size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>No farmers booked for this slot yet</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Capacity: {viewBookingsModal.slot.capacity} vehicles ({viewBookingsModal.slot.capacity} remaining)
                      </div>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '8px 10px' }}>Token / Booking #</th>
                          <th style={{ padding: '8px 10px' }}>Farmer Details</th>
                          <th style={{ padding: '8px 10px' }}>Commodity & Qty</th>
                          <th style={{ padding: '8px 10px' }}>Vehicle #</th>
                          <th style={{ padding: '8px 10px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewBookingsModal.bookings.map((b: any) => (
                          <tr key={b.id || b.booking_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px' }}>
                              <strong style={{ color: '#064e3b', display: 'block' }}>{b.token_number || b.booking_number}</strong>
                              <small style={{ color: '#64748b' }}>{b.booking_number}</small>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.farmer_name}</div>
                              <small style={{ color: '#64748b' }}>{b.farmer_phone || b.farmer_id}</small>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <div>{b.commodity}</div>
                              <small style={{ color: '#16a34a', fontWeight: 700 }}>{b.quantity} Qtl</small>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                                {b.vehicle_number || 'Tractor'}
                              </span>
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{
                                padding: '2px 7px',
                                borderRadius: '99px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                                background: b.status === 'COMPLETED' ? '#dcfce7' : '#eff6ff',
                                color: b.status === 'COMPLETED' ? '#166534' : '#1d4ed8',
                              }}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              CREATE NEW SLOT MODAL
              ==================================================================== */}
          {createModalOpen && (
            <div className="fd-modal-overlay">
              <div className="fd-modal-card" style={{ maxWidth: '460px' }}>
                <div className="fd-modal-header">
                  <h2>Create Procurement Slot</h2>
                  <button className="fd-modal-close" onClick={() => setCreateModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateSlot} className="fd-modal-form">
                  <div className="fd-modal-field">
                    <label>Centre Name</label>
                    <input type="text" disabled value={staff.centre_name || 'Chiraigaon 1st at Gaurakala (FCS)'} style={{ background: '#f1f5f9' }} />
                  </div>

                  <div className="fd-modal-field">
                    <label>Operational Date *</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div className="fd-modal-grid-2">
                    <div className="fd-modal-field">
                      <label>Start Time *</label>
                      <select value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)}>
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>

                    <div className="fd-modal-field">
                      <label>End Time *</label>
                      <select value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)}>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="fd-modal-grid-2">
                    <div className="fd-modal-field">
                      <label>Max Capacity (Vehicles) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="200"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                      />
                    </div>

                    <div className="fd-modal-field">
                      <label>Initial Status</label>
                      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as SlotStatus)}>
                        <option value="ACTIVE">PUBLISHED / ACTIVE (Open for Farmers)</option>
                        <option value="DRAFT">DRAFT (Hidden from Farmers)</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="fd-card-btn primary" style={{ padding: '12px', marginTop: '10px' }}>
                    <Plus size={16} /> Save &amp; Issue Slot
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ====================================================================
              EDIT SLOT MODAL
              ==================================================================== */}
          {editSlotModal && (
            <div className="fd-modal-overlay">
              <div className="fd-modal-card" style={{ maxWidth: '440px' }}>
                <div className="fd-modal-header">
                  <h2>Edit Slot ({editSlotModal.start_time} - {editSlotModal.end_time})</h2>
                  <button className="fd-modal-close" onClick={() => setEditSlotModal(null)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateSlot} className="fd-modal-form">
                  <div className="fd-modal-field">
                    <label>Current Booked Count</label>
                    <input type="text" disabled value={`${editSlotModal.booked_count} Bookings confirmed`} style={{ background: '#f8fafc', fontWeight: 700 }} />
                  </div>

                  <div className="fd-modal-field">
                    <label>Max Capacity *</label>
                    <input
                      type="number"
                      required
                      min={editSlotModal.booked_count || 1}
                      max="300"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                    />
                    <small style={{ color: '#64748b' }}>Cannot be set below current booked count ({editSlotModal.booked_count}).</small>
                  </div>

                  <div className="fd-modal-field">
                    <label>Slot Status *</label>
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as SlotStatus)}>
                      <option value="ACTIVE">ACTIVE (Open for Booking)</option>
                      <option value="CLOSED">CLOSED (Stop new bookings)</option>
                      <option value="FULL">FULL (Capacity Reached)</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <button type="submit" className="fd-card-btn primary" style={{ padding: '12px', marginTop: '10px' }}>
                    <CheckCircle2 size={16} /> Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ====================================================================
              COPY SCHEDULE MODAL
              ==================================================================== */}
          {copyModalOpen && (
            <div className="fd-modal-overlay">
              <div className="fd-modal-card" style={{ maxWidth: '440px' }}>
                <div className="fd-modal-header">
                  <h2>Copy Slots to Date</h2>
                  <button className="fd-modal-close" onClick={() => setCopyModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCopySchedule} className="fd-modal-form">
                  <div className="fd-modal-field">
                    <label>Source Date (Current Schedule)</label>
                    <input type="text" disabled value={selectedDate} style={{ background: '#f8fafc', fontWeight: 700 }} />
                  </div>

                  <div className="fd-modal-field">
                    <label>Target Date to Clone Schedule *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={copyTargetDate}
                      onChange={(e) => setCopyTargetDate(e.target.value)}
                    />
                    <small style={{ color: '#64748b' }}>All {slots.length} slots from {selectedDate} will be created with fresh 0/capacity bookings.</small>
                  </div>

                  <button type="submit" className="fd-card-btn primary" style={{ padding: '12px', marginTop: '10px' }}>
                    <Copy size={16} /> Confirm Copy
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
