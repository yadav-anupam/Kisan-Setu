import { useState, useEffect } from 'react'
import {
  Clock,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchCentreSlots,
  type StaffProfile,
  type CentreSlot,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffSlotsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [slots, setSlots] = useState<CentreSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<CentreSlot | null>(null)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/slots')
      navigate('/staff/login')
      return
    }
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    fetchCentreSlots(currentStaff.centre_id).then(setSlots).catch(() => {})
  }, [])

  const totalCapacity = slots.reduce((s, x) => s + x.capacity, 0)
  const totalBooked = slots.reduce((s, x) => s + x.booked_count, 0)
  const totalVerified = slots.reduce((s, x) => s + x.verified_count, 0)

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="slots"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Slot Capacity &amp; Timetable"
        />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Centre Procurement Slots &amp; Capacity
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              Hourly booking limits, gate clearance, and weighbridge utilization for {staff.centre_name}
            </p>
          </div>

          {/* KPI Banner */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Total Daily Capacity</div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#0f172a', margin: '8px 0 2px' }}>
                {totalCapacity} Vehicles
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>6 Operational Windows</small>
            </div>

            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Total Booked Today</div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#0d631b', margin: '8px 0 2px' }}>
                {totalBooked} ({Math.round((totalBooked / (totalCapacity || 1)) * 100)}%)
              </strong>
              <small style={{ color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>Active Farm Bookings</small>
            </div>

            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Cleared &amp; Verified</div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#16a34a', margin: '8px 0 2px' }}>
                {totalVerified} Vehicles
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>Weighment recorded</small>
            </div>
          </section>

          {/* Slots Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '16px',
            }}
          >
            {slots.map((slot) => {
              const utilPercent = Math.round((slot.booked_count / slot.capacity) * 100)
              const available = slot.capacity - slot.booked_count
              const pending = slot.booked_count - slot.verified_count

              return (
                <div
                  key={slot.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="#0d631b" />
                      <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                        {slot.start_time} – {slot.end_time}
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: slot.status === 'COMPLETED' ? '#f1f5f9' : '#dcfce7',
                        color: slot.status === 'COMPLETED' ? '#64748b' : '#166534',
                      }}
                    >
                      {slot.status}
                    </span>
                  </div>

                  {/* Utilization Metric */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#64748b' }}>Slot Utilization</span>
                      <strong style={{ color: utilPercent > 80 ? '#f59e0b' : '#0d631b' }}>
                        {slot.booked_count} / {slot.capacity} bookings ({utilPercent}%)
                      </strong>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${utilPercent}%`,
                          background: utilPercent > 80 ? '#f59e0b' : '#16a34a',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>

                  {/* 3-Column Slot Breakdown */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '10px',
                      marginBottom: '14px',
                      textAlign: 'center',
                    }}
                  >
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
                      <strong style={{ fontSize: '14px', color: '#2563eb' }}>{available}</strong>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/staff/bookings?slot=${encodeURIComponent(slot.start_time)}`)}
                      style={{
                        flex: 1,
                        background: '#0d631b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      View Bookings
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Slot Details
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Section 17: Slot Details Modal */}
          {selectedSlot && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'grid',
                placeItems: 'center',
                padding: '16px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  maxWidth: '500px',
                  width: '100%',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '18px 24px',
                    background: '#0d631b',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <strong style={{ fontSize: '16px' }}>
                    Slot {selectedSlot.start_time} – {selectedSlot.end_time}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setSelectedSlot(null)}
                    style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Assigned Centre:</span>
                      <strong>{selectedSlot.centre_name}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Max Vehicle Capacity:</span>
                      <strong>{selectedSlot.capacity} Trolleys / Hour</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Confirmed Bookings:</span>
                      <strong>{selectedSlot.booked_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Verified at Weighbridge:</span>
                      <strong style={{ color: '#16a34a' }}>{selectedSlot.verified_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                      <span style={{ color: '#64748b' }}>Remaining Unbooked Slots:</span>
                      <strong style={{ color: '#2563eb' }}>{selectedSlot.capacity - selectedSlot.booked_count}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Overall Utilization:</span>
                      <strong style={{ color: '#0d631b' }}>
                        {Math.round((selectedSlot.booked_count / selectedSlot.capacity) * 100)}%
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const time = selectedSlot.start_time
                      setSelectedSlot(null)
                      navigate(`/staff/bookings?slot=${encodeURIComponent(time)}`)
                    }}
                    style={{
                      marginTop: '20px',
                      width: '100%',
                      background: '#0d631b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    View All Farmer Passes for this Slot →
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
