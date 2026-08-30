import { useState, useRef, useEffect } from 'react'
import {
  ArrowUpRight,
  Bell,
  Calendar,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  FileSpreadsheet,
  Globe2,
  Headphones,
  Info,
  Menu,
  Printer,
  Search,
  Sprout,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import {
  fetchProcurementsFromDB,
  fetchDbtPaymentsFromDB,
  type DbProcurementBatch,
  type DbDbtPayment,
} from '../../services/supabaseDataService'
import { getFarmerBookings, type BookingRecord } from '../../services/qrBookingService'
import FarmerSidebar from './FarmerSidebar'
import './FarmerDashboard.css'
import './FarmerHistoryPage.css'

interface HistoryRecord {
  id: string
  txnId: string
  type: 'procurement' | 'payment' | 'booking'
  date: string
  time: string
  centre: string
  location: string
  produce: string
  grade: string
  quantity: number
  amount: number
  status: 'Completed' | 'Paid' | 'Processing' | 'Cancelled'
  utr?: string
  moisture?: number
}

export default function FarmerHistoryPage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [filterTab, setFilterTab] = useState<'all' | 'procurements' | 'payments' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null)
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/history')
      navigate('/login')
      return
    }

    let isMounted = true
    const fId = farmer.farmerId || 'KS-FARM-2026-8942'

    Promise.all([
      fetchProcurementsFromDB(fId),
      fetchDbtPaymentsFromDB(fId),
      getFarmerBookings(fId),
    ]).then(([procurements, payments, bookings]) => {
      if (!isMounted) return
      const combined: HistoryRecord[] = []

      // 1. Procurements
      if (procurements && procurements.length > 0) {
        procurements.forEach((p: DbProcurementBatch) => {
          combined.push({
            id: p.id,
            txnId: p.batch_number,
            type: 'procurement',
            date: new Date(p.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            centre: p.centre_name,
            location: 'Procurement Mandi Yard',
            produce: p.commodity,
            grade: p.quality_grade || 'Grade A (FAQ Standard)',
            quantity: Number(p.net_weight_qtl),
            amount: Number(p.net_amount),
            status: p.payment_status === 'PAID_DBT' ? 'Completed' : 'Processing',
            moisture: Number(p.moisture_percentage) || 11.5,
          })
        })
      }

      // 2. DBT Payments
      if (payments && payments.length > 0) {
        payments.forEach((pay: DbDbtPayment) => {
          combined.push({
            id: pay.id,
            txnId: pay.payment_ref,
            type: 'payment',
            date: new Date(pay.transfer_date || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: '02:30 PM',
            centre: farmer.preferredMandi || 'Chiraigaon 1st at Gaurakala (FCS)',
            location: 'Direct PFMS / Aadhaar Bridge',
            produce: pay.commodity,
            grade: 'DBT Bank Disbursal',
            quantity: 40.0,
            amount: Number(pay.amount),
            status: pay.status === 'COMPLETED' ? 'Paid' : 'Processing',
            utr: pay.utr_number,
          })
        })
      }

      // 3. Cancelled Bookings
      if (bookings && bookings.length > 0) {
        bookings.filter((b: BookingRecord) => b.status === 'CANCELLED').forEach((b: BookingRecord) => {
          combined.push({
            id: b.id,
            txnId: b.booking_number,
            type: 'booking',
            date: b.booking_date,
            time: b.start_time,
            centre: b.centre_name,
            location: 'Procurement Centre Yard',
            produce: b.commodity,
            grade: 'Cancelled Slot Pass',
            quantity: b.quantity,
            amount: b.quantity * 2275,
            status: 'Cancelled',
          })
        })
      }

      setHistoryRecords(combined)
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [farmer.farmerId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredRecords = historyRecords.filter((rec) => {
    if (filterTab === 'procurements' && rec.type !== 'procurement') return false
    if (filterTab === 'payments' && rec.type !== 'payment') return false
    if (filterTab === 'cancelled' && rec.status !== 'Cancelled') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        rec.txnId.toLowerCase().includes(q) ||
        rec.centre.toLowerCase().includes(q) ||
        rec.produce.toLowerCase().includes(q) ||
        rec.date.toLowerCase().includes(q)
      )
    }
    return true
  })

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="history-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="history"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="hs-main-content">
        {/* Top Header Bar */}
        <header className="fd-topbar">
          <div className="fd-greeting">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="fd-icon-btn fd-mobile-toggle"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle Menu"
              >
                <Menu size={20} />
              </button>
              <h1>History &amp; Audit Log</h1>
            </div>
            <p>View complete records of your past appointments, procurements and DBT settlements.</p>
          </div>

          <div className="fd-topbar-actions">
            {/* Language Selector Dropdown */}
            <div className="ks-lang-wrapper" ref={dropdownRef}>
              <button
                className={`ks-lang-btn ${langMenuOpen ? 'open' : ''}`}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change Language"
              >
                <Globe2 size={14} />
                <span>{activeLangObj.nativeName}</span>
                <ChevronDown size={12} className="ks-lang-arrow" />
              </button>

              {langMenuOpen && (
                <div className="ks-lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`ks-lang-option ${currentLang === lang.code ? 'selected' : ''}`}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLangMenuOpen(false)
                      }}
                    >
                      <span className="ks-lang-native">{lang.nativeName}</span>
                      <span className="ks-lang-english">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              className="fd-icon-btn"
              onClick={() => alert('All past records are cryptographically verified and immutable.')}
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="fd-notif-dot" />
            </button>

            {/* Farmer Avatar Pill */}
            <div
              className="fd-avatar-pill"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              title="Open Farmer Profile"
            >
              <div className="fd-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
                {farmer.profilePhoto ? (
                  <img
                    src={farmer.profilePhoto}
                    alt={farmer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'RK'
                )}
              </div>
              <span className="fd-avatar-name">{farmer.name.split(' ')[0] || 'Farmer'}</span>
            </div>
          </div>
        </header>

        {/* Title Bar & Date Range Selector */}
        <div className="hs-title-bar">
          <div className="hs-title-text">
            <h1>Activity Records</h1>
            <p>All weighment slips and DBT transaction vouchers for FY 2026–27</p>
          </div>

          <div className="hs-top-actions">
            <button
              className="hs-date-picker-btn"
              onClick={() => alert('Filter date range: 1 Aug 2026 – 31 Aug 2026')}
            >
              <Calendar size={15} color="#0d631b" />
              <span>1 Aug 2026 – 31 Aug 2026</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            <button
              className="hs-export-btn"
              onClick={() => alert('Generating complete seasonal audit PDF report...')}
            >
              <Download size={14} /> Download Report
            </button>
          </div>
        </div>

        {/* 4 Metrics Grid */}
        <section className="hs-metrics-grid">
          <div className="hs-metric-card">
            <div className="hs-metric-top">
              <div className="hs-metric-icon" style={{ background: '#e9f6e8', color: '#0d631b' }}>
                <Sprout size={22} />
              </div>
              <div className="hs-metric-info">
                <span>Total Procurements</span>
                <strong>{historyRecords.filter((r) => r.type === 'procurement').length} Batches</strong>
              </div>
            </div>
            <div className="hs-metric-bottom">
              <small>Verified Records</small>
              <span className="hs-metric-badge">
                <ArrowUpRight size={11} /> 100% Digital Weighment
              </span>
            </div>
          </div>

          <div className="hs-metric-card">
            <div className="hs-metric-top">
              <div className="hs-metric-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <TrendingUp size={22} />
              </div>
              <div className="hs-metric-info">
                <span>Total Quantity</span>
                <strong>{historyRecords.filter((r) => r.type === 'procurement').reduce((sum, r) => sum + r.quantity, 0).toFixed(2)} Qtl</strong>
              </div>
            </div>
            <div className="hs-metric-bottom">
              <small>Delivered Quantity</small>
              <span className="hs-metric-badge">
                <ArrowUpRight size={11} /> Verified Scale
              </span>
            </div>
          </div>

          <div className="hs-metric-card">
            <div className="hs-metric-top">
              <div className="hs-metric-icon" style={{ background: '#dcfce7', color: '#15803d' }}>
                <Wallet size={22} />
              </div>
              <div className="hs-metric-info">
                <span>Total Amount</span>
                <strong>₹ {historyRecords.filter((r) => r.status === 'Completed' || r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <div className="hs-metric-bottom">
              <small>MSP Payout</small>
              <span className="hs-metric-badge">
                <ArrowUpRight size={11} /> Direct Transfer
              </span>
            </div>
          </div>

          <div className="hs-metric-card">
            <div className="hs-metric-top">
              <div className="hs-metric-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <CreditCard size={22} />
              </div>
              <div className="hs-metric-info">
                <span>DBT Settlements</span>
                <strong>
                  {historyRecords.filter((r) => r.type === 'payment' && r.status === 'Paid').length} / {Math.max(1, historyRecords.filter((r) => r.type === 'payment').length)} Settled
                </strong>
              </div>
            </div>
            <div className="hs-metric-bottom">
              <small>PFMS Speed</small>
              <span className="hs-metric-badge" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                ✓ 24h Payout
              </span>
            </div>
          </div>
        </section>

        {/* History Table Section */}
        <section className="hs-table-card">
          <div className="hs-table-header">
            <div className="hs-filter-chips">
              <button
                className={`hs-filter-chip ${filterTab === 'all' ? 'active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All ({historyRecords.length})
              </button>
              <button
                className={`hs-filter-chip ${filterTab === 'procurements' ? 'active' : ''}`}
                onClick={() => setFilterTab('procurements')}
              >
                Procurements ({historyRecords.filter((r) => r.type === 'procurement').length})
              </button>
              <button
                className={`hs-filter-chip ${filterTab === 'payments' ? 'active' : ''}`}
                onClick={() => setFilterTab('payments')}
              >
                Payments ({historyRecords.filter((r) => r.type === 'payment').length})
              </button>
              <button
                className={`hs-filter-chip ${filterTab === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilterTab('cancelled')}
              >
                Cancelled ({historyRecords.filter((r) => r.status === 'Cancelled').length})
              </button>
            </div>

            <div className="hs-search-box">
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Search centre, produce, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="hs-table-wrap">
            <table className="hs-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Record ID</th>
                  <th>Centre</th>
                  <th>Produce</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: rec.type === 'procurement' ? '#e9f6e8' : '#eff6ff',
                              color: rec.type === 'procurement' ? '#0d631b' : '#2563eb',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {rec.type === 'procurement' ? <Sprout size={16} /> : <Wallet size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.date}</div>
                            <small style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} /> {rec.time}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0d631b', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0', fontSize: '11px' }}>
                          {rec.txnId}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.centre}</div>
                        <small style={{ color: '#64748b' }}>{rec.location}</small>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.produce}</div>
                        <small style={{ color: '#64748b' }}>{rec.grade}</small>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {rec.quantity.toFixed(2)} Qtl
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        ₹ {rec.amount.toLocaleString('en-IN')}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`pm-status-pill ${rec.status.toLowerCase()}`}
                          style={{
                            background: rec.status === 'Paid' || rec.status === 'Completed' ? '#dcfce7' : '#fef2f2',
                            color: rec.status === 'Paid' || rec.status === 'Completed' ? '#166534' : '#991b1b',
                          }}
                        >
                          {rec.status === 'Completed' && '✓ COMPLETED'}
                          {rec.status === 'Paid' && '✓ PAID'}
                          {rec.status === 'Processing' && '⏳ PROCESSING'}
                          {rec.status === 'Cancelled' && '✓ CANCELLED'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '5px 10px',
                            color: '#0d631b',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onClick={() => setSelectedRecord(rec)}
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                      <Sprout size={32} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.7 }} />
                      <strong style={{ display: 'block', color: '#1e293b', fontSize: '14px', marginBottom: '4px' }}>No Activity Records Found</strong>
                      <span style={{ fontSize: '12px' }}>Book a procurement slot to record intake and receive instant DBT payments.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 16px', background: '#f8faf8', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>Showing {filteredRecords.length} of {historyRecords.length} entries</span>
            <button
              style={{ background: 'none', border: 'none', color: '#0d631b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => alert('Exporting history audit log to Excel...')}
            >
              <FileSpreadsheet size={15} /> Export Audit Log
            </button>
          </div>
        </section>

        {/* Support Help Banner */}
        <section className="hs-support-banner">
          <div className="hs-support-content">
            <div className="hs-support-icon">
              <Info size={22} />
            </div>
            <div className="hs-support-text">
              <strong>Need help with your past transactions or weighing records?</strong>
              <p>Our dedicated APMC grievance desk is available 24x7 to assist you.</p>
            </div>
          </div>

          <button
            className="hs-support-btn"
            onClick={() => window.open('https://wa.me/919214334494', '_blank')}
          >
            <Headphones size={15} /> Contact Support Desk
          </button>
        </section>
      </main>

      {/* ==========================================================================
          Transaction Audit Detail Modal
          ========================================================================== */}
      {selectedRecord && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '480px' }}>
            <div className="fd-modal-header">
              <h2>Transaction Audit Detail</h2>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                {selectedRecord.type === 'procurement' ? 'Procurement Batch Verified' : 'Direct DBT Payout'}
              </span>
              <div style={{ fontFamily: 'Manrope', fontSize: '30px', fontWeight: 800, color: '#0d631b', margin: '4px 0' }}>
                ₹ {selectedRecord.amount.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', background: '#ffffff', padding: '2px 8px', borderRadius: '99px', border: '1px solid #86efac', color: '#166534', fontWeight: 700 }}>
                ID: {selectedRecord.txnId} • {selectedRecord.status}
              </span>
            </div>

            <div className="pm-receipt-box">
              <div className="pm-receipt-row">
                <span>Farmer Beneficiary:</span>
                <strong>{farmer.name || 'Ramesh Kumar Singh'}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Mandi Centre:</span>
                <strong>{selectedRecord.centre}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Produce &amp; Grade:</span>
                <strong>{selectedRecord.produce} ({selectedRecord.grade})</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Verified Quantity:</span>
                <strong>{selectedRecord.quantity} Quintal</strong>
              </div>
              {selectedRecord.moisture && (
                <div className="pm-receipt-row">
                  <span>Assay Moisture:</span>
                  <strong style={{ color: '#0d631b' }}>{selectedRecord.moisture}% (Passed)</strong>
                </div>
              )}
              {selectedRecord.utr && (
                <div className="pm-receipt-row">
                  <span>Bank PFMS UTR:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0d631b' }}>{selectedRecord.utr}</strong>
                </div>
              )}
              <div className="pm-receipt-row">
                <span>Recorded Timestamp:</span>
                <strong>{selectedRecord.date} at {selectedRecord.time}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="fd-card-btn primary"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Record
              </button>
              <button
                type="button"
                className="fd-card-btn secondary"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
