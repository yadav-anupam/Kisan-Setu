import { useState, useEffect } from 'react'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Layers,
  QrCode,
  Truck,
  Megaphone,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchStaffDashboardKPIs,
  fetchCentreSlots,
  fetchCentreQueue,
  getOfficialPriceAnnouncements,
  type StaffProfile,
  type StaffDashboardKPIs,
  type CentreSlot,
  type QueueItem,
  type PriceAnnouncementRecord,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'
import './StaffDashboardPage.css'

export default function StaffDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff] = useState<StaffProfile>(getStaffAuthSession)
  const [kpis, setKpis] = useState<StaffDashboardKPIs>({
    todayBookings: 0,
    todayVerified: 0,
    pendingVerification: 0,
    currentQueue: 0,
    upcomingSlots: 0,
    cancelledCount: 0,
  })
  const [slots, setSlots] = useState<CentreSlot[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [priceAnnouncements, setPriceAnnouncements] = useState<PriceAnnouncementRecord[]>(getOfficialPriceAnnouncements)

  useEffect(() => {
    let isMounted = true
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/dashboard')
      navigate('/staff/login')
      return
    }

    const currentStaff = getStaffAuthSession()
    const loadStaffData = () => {
      Promise.all([
        fetchStaffDashboardKPIs(currentStaff.centre_id),
        fetchCentreSlots(currentStaff.centre_id),
        fetchCentreQueue(currentStaff.centre_id, currentStaff.centre_name),
      ])
        .then(([kpiData, slotData, queueData]) => {
          if (isMounted) {
            setKpis(kpiData)
            setSlots(slotData)
            setQueue(queueData)
          }
        })
        .catch(() => {})
    }

    loadStaffData()

    const handlePriceUpdate = () => {
      if (isMounted) {
        setPriceAnnouncements(getOfficialPriceAnnouncements())
      }
    }

    window.addEventListener('kisan_setu_official_price_announced', handlePriceUpdate)
    window.addEventListener('kisan_setu_msp_prices_updated', handlePriceUpdate)
    window.addEventListener('kisan_setu_queue_updated', loadStaffData)
    window.addEventListener('kisan_setu_booking_updated', loadStaffData)
    window.addEventListener('storage', handlePriceUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('kisan_setu_official_price_announced', handlePriceUpdate)
      window.removeEventListener('kisan_setu_msp_prices_updated', handlePriceUpdate)
      window.removeEventListener('kisan_setu_queue_updated', loadStaffData)
      window.removeEventListener('kisan_setu_booking_updated', loadStaffData)
      window.removeEventListener('storage', handlePriceUpdate)
    }
  }, [])

  return (
    <div className="farmer-dashboard-layout staff-dashboard-wrapper">
      <StaffSidebar
        activeTab="dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="APMC Operations Dashboard"
        />

        <main className="staff-dashboard-main">
          {/* Official Gazette MSP Announcement Banner */}
          {priceAnnouncements.length > 0 && (() => {
            const latest = priceAnnouncements[0]
            return (
              <div
                className={`staff-msp-banner ${latest.isPriceRaised ? 'hike' : ''}`}
              >
                <div className="staff-msp-banner-left">
                  <div
                    className={`staff-msp-icon ${latest.isPriceRaised ? 'hike' : 'info'}`}
                  >
                    {latest.isPriceRaised ? <Sparkles size={20} /> : <Megaphone size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: latest.isPriceRaised ? '#dcfce7' : '#e0f2fe',
                          color: latest.isPriceRaised ? '#166534' : '#0369a1',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {latest.isPriceRaised ? '🔥 Active Government MSP Hike' : '📢 Official MSP Price Notice'}
                      </span>
                      {latest.circularRef && (
                        <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          Gazette: {latest.circularRef}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        {latest.cropName.includes('(') ? latest.cropName : `${latest.cropName}${latest.hindiName ? ` (${latest.hindiName})` : ''}`}:
                      </span>
                      <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '15px' }}>
                        ₹{latest.newPrice.toLocaleString('en-IN')}/Qtl
                      </span>
                      {latest.bonusPerQtl > 0 && (
                        <span style={{ fontSize: '11px', color: '#166534', background: '#bbf7d0', padding: '1px 6px', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          +₹{latest.bonusPerQtl} State Bonus
                        </span>
                      )}
                      {latest.isPriceRaised && latest.percentageIncrease > 0 && (
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          <ArrowUpRight size={13} /> +₹{latest.newPrice - latest.oldPrice}/Qtl (+{latest.percentageIncrease}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Season: <strong style={{ color: '#0f172a' }}>{latest.effectiveSeason}</strong>
                </div>
              </div>
            )
          })()}

          {/* Welcome Banner */}
          <div className="staff-welcome-banner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  LIVE TERMINAL
                </span>
                <span style={{ fontSize: '13px', color: '#dcfce7' }}>
                  Operator Desk • {staff.staff_id}
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
                Good day, {staff.full_name}
              </h1>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#dcfce7' }}>
                {staff.centre_name} — Gate 2 Entry &amp; Digital Weighbridge Operations
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="staff-welcome-btn-scan"
                onClick={() => navigate('/staff/qr-verification')}
              >
                <QrCode size={18} />
                <span>SCAN QR GATE PASS</span>
              </button>
            </div>
          </div>

          {/* KPI Statistics Grid */}
          <section className="staff-kpi-grid">
            <div className="staff-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Calendar size={15} color="#0d631b" /> Today's Bookings
              </div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#0f172a', margin: '8px 0 2px' }}>
                {kpis.todayBookings}
              </strong>
              <small style={{ color: '#16a34a', fontSize: '11px', fontWeight: 700 }}>Scheduled Today</small>
            </div>

            <div className="staff-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <CheckCircle2 size={15} color="#16a34a" /> Verified at Gate
              </div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#16a34a', margin: '8px 0 2px' }}>
                {kpis.todayVerified}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>
                {Math.round((kpis.todayVerified / (kpis.todayBookings || 1)) * 100)}% clearance rate
              </small>
            </div>

            <div className="staff-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Clock size={15} color="#eab308" /> Pending Verification
              </div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#ca8a04', margin: '8px 0 2px' }}>
                {kpis.pendingVerification}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>Awaiting gate arrival</small>
            </div>

            <div className="staff-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Truck size={15} color="#2563eb" /> Current Queue
              </div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#2563eb', margin: '8px 0 2px' }}>
                {kpis.currentQueue}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>4 Weighbridge bays active</small>
            </div>

            <div className="staff-kpi-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Layers size={15} color="#9333ea" /> Today's Slots
              </div>
              <strong style={{ display: 'block', fontSize: '26px', color: '#9333ea', margin: '8px 0 2px' }}>
                {slots.length || 6}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>08:00 AM – 03:00 PM</small>
            </div>
          </section>

          {/* Quick Operational Actions */}
          <section style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Quick Operational Actions
            </h2>
            <div className="staff-actions-grid">
              <button
                type="button"
                className="staff-action-card primary"
                onClick={() => navigate('/staff/qr-verification')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <QrCode size={22} />
                  <span style={{ fontSize: '10px', background: '#22c55e', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>PRIMARY</span>
                </div>
                <strong style={{ fontSize: '14px' }}>Scan QR Gate Pass</strong>
                <span style={{ fontSize: '11px', color: '#dcfce7' }}>Authenticate farmer arrival</span>
              </button>

              <button
                type="button"
                className="staff-action-card standard"
                onClick={() => navigate('/staff/bookings')}
              >
                <Calendar size={22} color="#0d631b" />
                <strong style={{ fontSize: '14px' }}>View Today's Bookings</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Search &amp; filter centre slots</span>
              </button>

              <button
                type="button"
                className="staff-action-card standard"
                onClick={() => navigate('/staff/queue')}
              >
                <Truck size={22} color="#2563eb" />
                <strong style={{ fontSize: '14px' }}>Manage Live Queue</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Call next token to weighbridge</span>
              </button>

              <button
                type="button"
                className="staff-action-card standard"
                onClick={() => navigate('/staff/slots')}
              >
                <Clock size={22} color="#9333ea" />
                <strong style={{ fontSize: '14px' }}>View Capacity Slots</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Check hourly slot utilization</span>
              </button>

              <button
                type="button"
                className="staff-action-card standard"
                onClick={() => navigate('/staff/verification-history')}
              >
                <History size={22} color="#0d631b" />
                <strong style={{ fontSize: '14px' }}>Verification Audit</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Cryptographic verification log</span>
              </button>
            </div>
          </section>

          {/* Lower Grid: Today's Slots Overview & Live Queue Snapshot */}
          <div className="staff-lower-grid">
            {/* Left: Today's Slot Overview */}
            <div className="staff-content-card">
              <div className="staff-card-header">
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Today's Slot Schedule
                  </h2>
                  <small style={{ color: '#64748b' }}>Click any slot to view bookings</small>
                </div>
                <button
                  type="button"
                  className="staff-card-header-btn"
                  onClick={() => navigate('/staff/slots')}
                >
                  All Slots <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {slots.slice(0, 4).map((slot) => {
                  const percent = Math.round((slot.booked_count / slot.capacity) * 100)
                  return (
                    <div
                      key={slot.id}
                      className="staff-slot-item"
                      onClick={() => navigate(`/staff/bookings?slot=${encodeURIComponent(slot.start_time)}`)}
                    >
                      <div className="staff-slot-header">
                        <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                          {slot.start_time} – {slot.end_time}
                        </strong>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: slot.status === 'COMPLETED' ? '#166534' : '#0d631b',
                            background: slot.status === 'COMPLETED' ? '#dcfce7' : '#f0fdf4',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {slot.booked_count} Bookings
                        </span>
                      </div>

                      <div className="staff-slot-meta">
                        <span>✓ {slot.verified_count} Verified</span>
                        <span>⏳ {slot.booked_count - slot.verified_count} Pending</span>
                        <span>🚪 {slot.capacity - slot.booked_count} Available</span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${percent}%`,
                            background: percent > 80 ? '#f59e0b' : '#16a34a',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Live Queue Snapshot */}
            <div className="staff-content-card">
              <div className="staff-card-header">
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Live Mandi Queue Sequence
                  </h2>
                  <small style={{ color: '#64748b' }}>Active weighbridge allocations</small>
                </div>
                <button
                  type="button"
                  className="staff-card-header-btn"
                  onClick={() => navigate('/staff/queue')}
                >
                  Manage Queue <ArrowRight size={14} />
                </button>
              </div>

              <div className="staff-table-scroll">
                <table className="staff-queue-table">
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                      <th style={{ padding: '8px' }}>Token</th>
                      <th style={{ padding: '8px' }}>Farmer</th>
                      <th style={{ padding: '8px' }}>Commodity</th>
                      <th style={{ padding: '8px' }}>Bay</th>
                      <th style={{ padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '28px 8px', textAlign: 'center', color: '#64748b' }}>
                          <Truck size={24} color="#94a3b8" style={{ margin: '0 auto 6px', display: 'block', opacity: 0.6 }} />
                          <strong style={{ fontSize: '12.5px', color: '#334155' }}>Yard Queue is Clear</strong>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Verified gate arrivals will automatically enter the weighbridge queue sequence.</div>
                        </td>
                      </tr>
                    ) : (
                      queue.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', fontWeight: 800, color: '#0d631b' }}>
                            {item.token_number}
                          </td>
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {item.farmer_name}
                        </td>
                        <td style={{ padding: '10px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {item.commodity}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontSize: '11px' }}>
                            {item.counter_id}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background:
                                item.status === 'SERVING'
                                  ? '#dcfce7'
                                  : item.status === 'COMPLETED'
                                  ? '#f1f5f9'
                                  : '#fef3c7',
                              color:
                                item.status === 'SERVING'
                                  ? '#166534'
                                  : item.status === 'COMPLETED'
                                  ? '#64748b'
                                  : '#b45309',
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
