import { useState, useRef, useEffect, useCallback } from 'react'
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Download,
  Globe2,
  Headphones,
  Menu,
  Navigation,
  Printer,
  QrCode,
  RefreshCw,
  Scale,
  Smartphone,
  Sparkles,
  Sprout,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import { fetchAIQueueAnalysis, type AIAnalysisResponse } from '../../services/mlService'
import { fetchMandiLiveStatusFromDB, type DbMandiLiveStatus } from '../../services/supabaseDataService'
import { getFarmerBookings, type BookingRecord } from '../../services/qrBookingService'
import {
  ALL_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import { GoogleMapsModal } from '../common/GoogleMapsModal'
import FarmerSidebar from './FarmerSidebar'
import './FarmerDashboard.css'
import './LiveQueuePage.css'

interface MandiBay {
  id: number
  name: string
  crop: string
  servingToken: string
  status: 'Serving' | 'Processing' | 'Available' | 'Break'
  operator: string
}

export default function LiveQueuePage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [passModalOpen, setPassModalOpen] = useState(false)
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [smsNotify, setSmsNotify] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mlData, setMlData] = useState<AIAnalysisResponse | null>(null)
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null)

  const [mandiStatus, setMandiStatus] = useState<DbMandiLiveStatus>({
    id: ALL_PROCUREMENT_CENTRES[0].id,
    mandi_id: ALL_PROCUREMENT_CENTRES[0].id,
    mandi_name: farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName,
    current_serving_token: 'Yard Clear',
    active_counters: 4,
    queue_length: 0,
    avg_service_time_mins: 5.5,
    congestion_level: 'LOW',
    updated_at: new Date().toISOString(),
  })

  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    const fId = farmer.farmerId || 'KS-FARM-2026-8942'
    try {
      const bookings = await getFarmerBookings(fId)
      const active = bookings?.find((b) => b.verification_status !== 'VERIFIED' && b.status !== 'CANCELLED') || null
      setActiveBooking(active)

      const targetCentre = active ? active.centre_name : (farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName)
      const status = await fetchMandiLiveStatusFromDB(targetCentre, active?.booking_date, active?.token_number)
      setMandiStatus(status)

      const queueAhead = active ? status.queue_length : 0
      const res = await fetchAIQueueAnalysis({
        queue_length: queueAhead,
        active_counters: status.active_counters,
        avg_service_time: status.avg_service_time_mins,
        appointments_next_hour: active ? 12 : 4,
      })
      setMlData(res)
    } catch {
      // ignore
    }
  }, [farmer.farmerId, farmer.preferredMandi])

  useEffect(() => {
    let isMounted = true
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/queue')
      navigate('/login')
      return
    }
    const fId = farmer.farmerId || 'KS-FARM-2026-8942'

    getFarmerBookings(fId).then(async (bookings) => {
      if (!isMounted) return
      const active = bookings?.find((b) => b.verification_status !== 'VERIFIED' && b.status !== 'CANCELLED') || null
      setActiveBooking(active)

      const targetCentre = active ? active.centre_name : (farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName)
      const status = await fetchMandiLiveStatusFromDB(targetCentre, active?.booking_date, active?.token_number)
      if (isMounted) setMandiStatus(status)

      const queueAhead = active ? status.queue_length : 0
      try {
        const res = await fetchAIQueueAnalysis({
          queue_length: queueAhead,
          active_counters: status.active_counters,
          avg_service_time: status.avg_service_time_mins,
          appointments_next_hour: active ? 12 : 4,
        })
        if (isMounted) setMlData(res)
      } catch {
        // ignore
      }
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [farmer.farmerId, farmer.preferredMandi])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Manual Refresh querying real backend
  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await loadData()
    setTimeout(() => setIsRefreshing(false), 400)
  }

  const estimatedMins = activeBooking
    ? (mlData?.waiting_time.minutes ?? Math.round(mandiStatus.queue_length * 5))
    : 0

  const dynamicBays: MandiBay[] = [
    {
      id: 1,
      name: 'Weighbridge Bay 1 (Gross Scale)',
      crop: activeBooking ? `${activeBooking.commodity} (MSP Intake)` : 'MSP Grain Intake',
      servingToken: mandiStatus.current_serving_token,
      status: mandiStatus.current_serving_token !== 'Yard Clear' ? 'Serving' : 'Available',
      operator: 'Intake Scale Bay 1',
    },
    {
      id: 2,
      name: 'Moisture & Quality Assay Lab',
      crop: 'Quality Grade & Moisture Verification',
      servingToken: 'Active',
      status: 'Processing',
      operator: 'Quality Testing Unit',
    },
    {
      id: 3,
      name: 'Weighbridge Bay 2 (Tare Scale)',
      crop: 'Empty Vehicle Tare Scale',
      servingToken: 'Active',
      status: 'Available',
      operator: 'Tare Weight Desk',
    },
    {
      id: 4,
      name: 'DBT Settlement & J-Form Desk',
      crop: 'PFMS Digital Bank Credit',
      servingToken: 'Online',
      status: 'Available',
      operator: 'Nodal Account Operator',
    },
  ]

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="queue-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="queue"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="lq-main-content">
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
              <h1>Live Mandi Queue &amp; Bay Tracker</h1>
            </div>
            <p>{mandiStatus.mandi_name} • Real-time weighbridge status for Rabi procurement cycle.</p>
          </div>

          <div className="fd-topbar-actions">
            {/* Manual Refresh CTA */}
            <button
              className="fd-icon-btn"
              onClick={handleManualRefresh}
              title="Refresh Live Token Status"
              style={{ color: isRefreshing ? '#16a34a' : 'inherit' }}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

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
              onClick={() => navigate('/notifications')}
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

        {/* Main 2-Column Grid */}
        <div className="lq-grid">
          {/* ====================================================================
              Left Column: Hero Queue Card & Stepper
              ==================================================================== */}
          <div>
            {/* Split Status Card */}
            <div className="lq-hero-card">
              {/* Serving Side */}
              <div className="lq-serving-side">
                <div className="lq-live-badge">
                  <span className="lq-pulse-dot" />
                  <span>Live Weighbridge Update</span>
                </div>
                <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
                  Currently Serving at Intake Bay
                </span>
                <div className="lq-serving-token">
                  <span>{mandiStatus.current_serving_token}</span>
                </div>
                <span style={{ fontSize: '12px', color: '#334155' }}>
                  Intake Gate: <strong>Bay 1 &amp; 2 Active</strong>
                </span>
              </div>

              {/* Farmer Token Side */}
              <div className="lq-user-token-box">
                {activeBooking ? (
                  <>
                    <div className="lq-user-token-header">
                      <div>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Your Booked Token
                        </span>
                        <div className="lq-user-token-val">{activeBooking.token_number}</div>
                      </div>
                      <button
                        type="button"
                        className="fd-icon-btn"
                        style={{ background: '#ffffff', border: '1px solid #bbf7d0' }}
                        onClick={() => setPassModalOpen(true)}
                        title="View QR Gate Pass"
                      >
                        <QrCode size={18} color="#0d631b" />
                      </button>
                    </div>

                    <div className="lq-user-stats-grid">
                      <div className="lq-stat-item">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={11} color="#16a34a" /> Estimated Wait
                        </span>
                        <strong style={{ color: '#0d631b' }}>~{estimatedMins} Mins</strong>
                        {mlData && (
                          <small style={{ fontSize: '9.5px', fontWeight: 800, color: mlData.waiting_time.status === 'LOW' ? '#16a34a' : mlData.waiting_time.status === 'MEDIUM' ? '#d97706' : '#dc2626' }}>
                            {mlData.waiting_time.status} CONGESTION
                          </small>
                        )}
                      </div>
                      <div className="lq-stat-item">
                        <span>Farmers Ahead</span>
                        <strong style={{ color: mandiStatus.queue_length > 0 ? '#d97706' : '#16a34a' }}>
                          {mandiStatus.queue_length} Farmers
                        </strong>
                        <small style={{ fontSize: '9.5px', color: '#64748b' }}>
                          {mandiStatus.active_counters} Bays Operating
                        </small>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', padding: '6px 0' }}>
                    <div>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                        Your Booked Token
                      </span>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#94a3b8', margin: '4px 0 8px' }}>
                        No Active Slot
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                        Book an intake slot to receive a verified token and QR pass.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="fd-card-btn primary"
                      style={{ padding: '8px 12px', fontSize: '11.5px', marginTop: '10px' }}
                      onClick={() => navigate('/appointments')}
                    >
                      Book Intake Slot →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ================================================================
                AI/ML Multi-Horizon Queue Forecast & Advisory Card
                ================================================================ */}
            {mlData && (
              <div className="lq-card" style={{ background: '#ffffff', border: '1.5px solid #bbf7d0', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                      <Cpu size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'Manrope', fontSize: '14px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        AI Queue Forecast &amp; Trend Engine
                      </h3>
                      <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {mlData.is_live_server ? '🟢 Live FastAPI Microservice (:8000)' : '⚡ Scikit-Learn Model (Active)'}
                      </small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: mlData.queue_forecast.trend === 'DECREASING' ? '#dcfce7' : mlData.queue_forecast.trend === 'INCREASING' ? '#fee2e2' : '#f1f5f9',
                        color: mlData.queue_forecast.trend === 'DECREASING' ? '#166534' : mlData.queue_forecast.trend === 'INCREASING' ? '#991b1b' : '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <TrendingUp size={11} /> {mlData.queue_forecast.trend}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: mlData.queue_forecast.risk === 'LOW' ? '#dcfce7' : mlData.queue_forecast.risk === 'MEDIUM' ? '#fef3c7' : '#fee2e2',
                        color: mlData.queue_forecast.risk === 'LOW' ? '#166534' : mlData.queue_forecast.risk === 'MEDIUM' ? '#92400e' : '#991b1b',
                      }}
                    >
                      RISK: {mlData.queue_forecast.risk}
                    </span>
                  </div>
                </div>

                {/* 4-Horizon Timeline Forecast Bars */}
                <div className="lq-forecast-bars">
                  <div className="lq-forecast-item">
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Now</span>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>{mlData.queue_forecast.current}</strong>
                    <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>vehicles</small>
                  </div>
                  <div className="lq-forecast-item">
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>+15 min</span>
                    <strong style={{ fontSize: '15px', color: '#0d631b' }}>{mlData.queue_forecast['15_minutes']}</strong>
                    <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>est. queue</small>
                  </div>
                  <div className="lq-forecast-item">
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>+30 min</span>
                    <strong style={{ fontSize: '15px', color: '#0d631b' }}>{mlData.queue_forecast['30_minutes']}</strong>
                    <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>est. queue</small>
                  </div>
                  <div className="lq-forecast-item">
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>+45 min</span>
                    <strong style={{ fontSize: '15px', color: '#0d631b' }}>{mlData.queue_forecast['45_minutes']}</strong>
                    <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>est. queue</small>
                  </div>
                  <div className="lq-forecast-item">
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>+60 min</span>
                    <strong style={{ fontSize: '15px', color: '#0d631b' }}>{mlData.queue_forecast['60_minutes']}</strong>
                    <small style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>est. queue</small>
                  </div>
                </div>

                {/* AI Farmer Action Advisory */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                  <div>
                    <strong>AI Recommendation: </strong>
                    <span>
                      {typeof mlData.recommendation === 'string'
                        ? mlData.recommendation
                        : mlData.recommendation.farmer_action || 'Optimal operational pace.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Procurement Journey Stepper */}
            <div className="lq-stepper-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Live Procurement Progress</h2>
                {activeBooking?.vehicle_number ? (
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 10px', borderRadius: '99px' }}>
                    Vehicle: {activeBooking.vehicle_number}
                  </span>
                ) : activeBooking ? (
                  <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                    Vehicle: Not Specified
                  </span>
                ) : null}
              </div>

              {activeBooking ? (
                <div className="lq-steps-track">
                  {/* Step 1: Gate Entry */}
                  <div className={`lq-step-node ${activeBooking.verification_status === 'VERIFIED' ? 'completed' : 'active'}`}>
                    <div className="lq-step-circle">
                      <CheckCircle2 size={22} />
                    </div>
                    <span className="lq-step-title">Gate Token</span>
                    <span className="lq-step-sub" style={{ color: '#16a34a', fontWeight: 700 }}>
                      {activeBooking.verification_status === 'VERIFIED' ? 'Gate Entry Verified' : 'Token Active (Ready)'}
                    </span>
                  </div>

                  {/* Step 2: Quality Assay */}
                  <div className={`lq-step-node ${activeBooking.verification_status === 'VERIFIED' ? 'completed' : ''}`}>
                    <div className="lq-step-circle">
                      <Sprout size={20} />
                    </div>
                    <span className="lq-step-title">Quality Assay</span>
                    <span className="lq-step-sub" style={{ color: activeBooking.verification_status === 'VERIFIED' ? '#16a34a' : '#64748b' }}>
                      {activeBooking.verification_status === 'VERIFIED' ? 'Passed (Grade A)' : 'Awaiting Weighbridge Gate'}
                    </span>
                  </div>

                  {/* Step 3: Weighment */}
                  <div className={`lq-step-node ${activeBooking.verification_status === 'VERIFIED' ? 'completed' : ''}`}>
                    <div className="lq-step-circle">
                      <Scale size={20} />
                    </div>
                    <span className="lq-step-title">Gross Weighment</span>
                    <span className="lq-step-sub">
                      {activeBooking.verification_status === 'VERIFIED' ? `${activeBooking.quantity} Qtl Recorded` : 'Next in Line'}
                    </span>
                  </div>

                  {/* Step 4: DBT Settlement */}
                  <div className="lq-step-node">
                    <div className="lq-step-circle">
                      <BadgeCheck size={20} />
                    </div>
                    <span className="lq-step-title">J-Form &amp; DBT</span>
                    <span className="lq-step-sub">
                      {activeBooking.verification_status === 'VERIFIED' ? 'Disbursal Initiated' : 'Instant Bank Credit'}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8faf8', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                    No procurement session currently active. Book a slot to start live gate intake.
                  </p>
                  <button
                    type="button"
                    className="fd-card-btn primary"
                    style={{ margin: '0 auto', display: 'inline-flex', padding: '8px 16px' }}
                    onClick={() => navigate('/appointments')}
                  >
                    + Book Procurement Slot
                  </button>
                </div>
              )}
            </div>

            {/* Mandi Gate Layout Map Card */}
            <div className="lq-card" style={{ background: '#f8faf8', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0d631b', color: '#ffffff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Navigation size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                    Need Mandi Yard Directions?
                  </strong>
                  <small style={{ color: '#64748b' }}>
                    View Gate 2 entry lanes, gross weighbridge bay allocation and unloader ramps.
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="fd-card-btn primary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                onClick={() => setMapModalOpen(true)}
              >
                View Mandi Gate Map →
              </button>
            </div>
          </div>

          {/* ====================================================================
              Right Column: Live Weighbridge Bays & Alert Settings
              ==================================================================== */}
          <div>
            {/* Live Counters Card */}
            <div className="lq-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} color="#0d631b" />
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Active Mandi Bays
                  </h3>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '99px' }}>
                  {dynamicBays.length} Online
                </span>
              </div>

              <div className="lq-bay-list">
                {dynamicBays.map((bay) => (
                  <div
                    key={bay.id}
                    className={`lq-bay-item ${bay.id === 2 ? 'active' : ''}`}
                  >
                    <div className="lq-bay-num">{bay.id}</div>
                    <div className="lq-bay-info">
                      <strong>{bay.name}</strong>
                      <small>{bay.crop} • {bay.operator}</small>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="lq-bay-token">{bay.servingToken}</div>
                      <small style={{ fontSize: '10px', color: bay.id === 2 ? '#166534' : '#64748b', fontWeight: 700 }}>
                        {bay.status}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Alert Preferences Card */}
            <div className="lq-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Smartphone size={18} color="#0d631b" />
                <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Turn Alerts
                </h3>
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.4 }}>
                Receive an automatic WhatsApp &amp; SMS ping when 2 tokens remain before your turn.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  WhatsApp &amp; SMS Alerts
                </span>
                <label className="nt-switch">
                  <input
                    type="checkbox"
                    checked={smsNotify}
                    onChange={(e) => setSmsNotify(e.target.checked)}
                  />
                  <span className="nt-slider" />
                </label>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="lq-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Headphones size={18} color="#166534" />
                <strong style={{ fontSize: '14px', color: '#166534' }}>Queue Delayed?</strong>
              </div>
              <p style={{ fontSize: '11.5px', color: '#15803d', margin: '0 0 12px' }}>
                If you face weighbridge bottlenecks or vehicle breakdown in yard, contact the gate supervisor.
              </p>
              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', borderColor: '#86efac' }}
                onClick={() => window.open('https://wa.me/919214334494', '_blank')}
              >
                Contact Mandi Yard In-Charge →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================================================
          QR Gate Entry Pass Modal
          ========================================================================== */}
      {passModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '460px' }}>
            <div className="fd-modal-header">
              <h2>Digital Gate Pass &amp; QR</h2>
              <button
                className="fd-modal-close"
                onClick={() => setPassModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '6px 0', textAlign: 'center' }}>
              <div className="lq-gatepass-box">
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {mandiStatus.mandi_name} Gate Pass
                </span>
                <h1 style={{ fontFamily: 'Manrope', fontSize: '32px', fontWeight: 800, color: '#0d631b', margin: '4px 0 12px' }}>
                  TOKEN {activeBooking ? activeBooking.token_number : '—'}
                </h1>

                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <QrCode size={120} color="#0d631b" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>

                <div style={{ marginTop: '12px', fontSize: '12px', color: '#334155', lineHeight: 1.5, textAlign: 'left', background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2ebe4' }}>
                  <div><strong>Farmer:</strong> {farmer.name || activeBooking?.farmer_name || 'Ramesh Kumar Singh'}</div>
                  <div><strong>Produce:</strong> {activeBooking ? `${activeBooking.commodity} (${activeBooking.quantity} Qtl)` : 'MSP Produce'}</div>
                  <div><strong>Vehicle:</strong> {activeBooking?.vehicle_number || 'Not Registered'}</div>
                  <div><strong>Assigned Gate:</strong> Mandi Intake Gate 1</div>
                </div>
              </div>

              <div className="fd-modal-grid-2" style={{ marginTop: '10px' }}>
                <button
                  type="button"
                  className="fd-card-btn primary"
                  onClick={() => alert('Gate pass QR downloaded to device!')}
                >
                  <Download size={15} /> Save Gate Pass
                </button>
                <button
                  type="button"
                  className="fd-card-btn secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print Pass
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Mandi Yard Layout Google Map Modal
          ========================================================================== */}
      {(() => {
        const matched = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === mandiStatus.mandi_name)
        return (
          <GoogleMapsModal
            isOpen={mapModalOpen}
            onClose={() => setMapModalOpen(false)}
            centreName={mandiStatus.mandi_name}
            address={matched?.address}
            district={matched?.district}
            blockTehsil={matched?.blockTehsil}
            agency={matched?.agency}
          />
        )
      })()}
    </div>
  )
}
