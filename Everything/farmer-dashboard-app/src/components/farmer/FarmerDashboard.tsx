import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Download,
  Eye,
  Globe2,
  Info,
  MapPin,
  Menu,
  Navigation,
  PlusCircle,
  QrCode,
  Scale,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Wind,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import BookingQR from '../common/BookingQR'
import { GoogleMapsModal } from '../common/GoogleMapsModal'
import {
  createSlotBooking,
  getFarmerBookings,
  type BookingRecord,
  getFarmerRawToken,
} from '../../services/qrBookingService'
import {
  fetchDashboardMetrics,
  fetchProcurementsFromDB,
  fetchDbtPaymentsFromDB,
  fetchNotificationsFromDB,
  fetchMandiLiveStatusFromDB,
  type DashboardAggregatedMetrics,
  type DbProcurementBatch,
  type DbDbtPayment,
  type DbFarmerNotification,
  type DbMandiLiveStatus,
} from '../../services/supabaseDataService'
import {
  getAutoLiveWeather,
  requestFarmerGPS,
  fetchLiveWeatherByCoords,
  type RealWeatherReport,
} from '../../services/weatherService'
import FarmerSidebar from './FarmerSidebar'
import {
  ALL_PROCUREMENT_CENTRES,
  VARANASI_PROCUREMENT_CENTRES,
  CHANDAULI_PROCUREMENT_CENTRES,
  GHAZIPUR_PROCUREMENT_CENTRES,
  JAUNPUR_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import './FarmerDashboard.css'

export default function FarmerDashboard() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const [farmer, setFarmer] = useState(getFarmerProfile())

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/farmer-dashboard')
      navigate('/login')
    }

    const handleProfileUpdate = () => {
      setFarmer(getFarmerProfile())
    }
    window.addEventListener('kisan_setu_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('kisan_setu_profile_updated', handleProfileUpdate)
  }, [])

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [queueModalOpen, setQueueModalOpen] = useState(false)
  const [confirmedModalOpen, setConfirmedModalOpen] = useState(false)
  const [lastBooking, setLastBooking] = useState<{ booking: BookingRecord; rawToken: string } | null>(null)
  const [viewPassModalOpen, setViewPassModalOpen] = useState(false)

  interface ActiveAppointment {
    id?: string
    date: string
    time: string
    centre: string
    crop: string
    quantity: string
    token: string
    status: string
  }

  // Dynamic Appointment State (Null when farmer has no active upcoming booking)
  const [appointment, setAppointment] = useState<ActiveAppointment | null>(null)

  // Slot Booking Form State
  const [newCrop, setNewCrop] = useState('Wheat (गेहूं)')
  const [newQty, setNewQty] = useState('50')
  const [newDate, setNewDate] = useState('2026-09-02')
  const [newTime, setNewTime] = useState('10:00 AM')
  const [newVehicleNumber, setNewVehicleNumber] = useState('')
  const [selectedCentre, setSelectedCentre] = useState<string>(
    farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Live Database States
  const [metrics, setMetrics] = useState<DashboardAggregatedMetrics>({
    totalRevenue: 0,
    totalProcuredQtl: 0,
    dbtDisbursed: 0,
    dbtPending: 0,
    activeUpcomingBookings: 0,
    completedBookingsCount: 0,
  })
  const [procurements, setProcurements] = useState<DbProcurementBatch[]>([])
  const [payments, setPayments] = useState<DbDbtPayment[]>([])
  const [notifications, setNotifications] = useState<DbFarmerNotification[]>([])
  const [mandiStatus, setMandiStatus] = useState<DbMandiLiveStatus>({
    mandi_id: ALL_PROCUREMENT_CENTRES[0].id,
    mandi_name: ALL_PROCUREMENT_CENTRES[0].centreName,
    current_serving_token: 'Yard Clear',
    queue_length: 0,
    active_counters: 4,
    avg_service_time_mins: 5.5,
    congestion_level: 'LOW',
  })

  // Google Maps State
  const [mapModalCentre, setMapModalCentre] = useState<{
    centreName: string
    address?: string
    district?: string
    blockTehsil?: string
    agency?: string
  } | null>(null)

  // Real-time GPS & Weather State
  const [weather, setWeather] = useState<RealWeatherReport>({
    temp: 31,
    condition: 'Sunny (Clear Skies)',
    advisory: 'Optimal Harvesting & Mandi Intake Conditions',
    humidity: 58,
    windSpeed: 12,
    locationName: farmer.district ? `${farmer.district}, UP Procurement Yard` : 'Varanasi, UP Procurement Yard',
    isLiveGPS: false,
    updatedAt: 'Live',
  })
  const [isLocating, setIsLocating] = useState(false)

  const handleDetectLocation = async () => {
    setIsLocating(true)
    try {
      const gps = await requestFarmerGPS()
      const liveReport = await fetchLiveWeatherByCoords(gps.lat, gps.lon, gps.locationName, true)
      setWeather(liveReport)
    } catch {
      alert('Could not access GPS. Showing real-time weather for ' + (farmer.district || 'Varanasi') + ' Mandi.')
    } finally {
      setIsLocating(false)
    }
  }

  const loadAllDashboardData = useCallback(() => {
    const fId = farmer.farmerId
    const phone = farmer.mobile
    Promise.all([
      fetchDashboardMetrics(fId, phone),
      fetchProcurementsFromDB(fId),
      fetchDbtPaymentsFromDB(fId),
      fetchNotificationsFromDB(fId),
      getFarmerBookings(fId, phone),
    ]).then(async ([m, p, pay, notif, books]) => {
      setMetrics(m)
      setProcurements(p)
      setPayments(pay)
      setNotifications(notif)
      
      const active = books?.find((b) => b.status === 'CONFIRMED' && b.verification_status !== 'VERIFIED')
      if (active) {
        setAppointment({
          id: active.id,
          date: active.booking_date,
          time: active.start_time,
          centre: active.centre_name,
          crop: active.commodity,
          quantity: active.quantity.toString(),
          token: active.token_number,
          status: 'Upcoming',
        })
        const status = await fetchMandiLiveStatusFromDB(active.centre_name, active.booking_date, active.token_number)
        setMandiStatus(status)
      } else {
        setAppointment(null)
        const status = await fetchMandiLiveStatusFromDB(farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName)
        setMandiStatus(status)
      }
    }).catch(() => {})
  }, [farmer.farmerId, farmer.mobile, farmer.preferredMandi])

  useEffect(() => {
    let isMounted = true
    const fId = farmer.farmerId
    const phone = farmer.mobile

    // Automatically load real weather (GPS first, fallback to district)
    getAutoLiveWeather(farmer.district || 'Varanasi', (fresh) => {
      if (isMounted) setWeather(fresh)
    }).then((initialReport) => {
      if (isMounted) setWeather(initialReport)
    }).catch(() => {})

    Promise.all([
      fetchDashboardMetrics(fId, phone),
      fetchProcurementsFromDB(fId),
      fetchDbtPaymentsFromDB(fId),
      fetchNotificationsFromDB(fId),
      getFarmerBookings(fId, phone),
    ]).then(async ([m, p, pay, notif, books]) => {
      if (!isMounted) return
      setMetrics(m)
      setProcurements(p)
      setPayments(pay)
      setNotifications(notif)

      const active = books?.find((b) => b.status === 'CONFIRMED' && b.verification_status !== 'VERIFIED')
      if (active) {
        setAppointment({
          id: active.id,
          date: active.booking_date,
          time: active.start_time,
          centre: active.centre_name,
          crop: active.commodity,
          quantity: active.quantity.toString(),
          token: active.token_number,
          status: 'Upcoming',
        })
        const status = await fetchMandiLiveStatusFromDB(active.centre_name, active.booking_date, active.token_number)
        if (isMounted) setMandiStatus(status)
      } else {
        setAppointment(null)
        const status = await fetchMandiLiveStatusFromDB(farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName)
        if (isMounted) setMandiStatus(status)
      }
    }).catch(() => {})

    const handleBookingUpdate = () => {
      loadAllDashboardData()
    }
    window.addEventListener('kisan_setu_booking_updated', handleBookingUpdate)
    window.addEventListener('kisan_setu_booking_cancelled', handleBookingUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('kisan_setu_booking_updated', handleBookingUpdate)
      window.removeEventListener('kisan_setu_booking_cancelled', handleBookingUpdate)
    }
  }, [farmer.farmerId, farmer.mobile, farmer.preferredMandi, farmer.district, loadAllDashboardData])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    const matched = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === selectedCentre) || ALL_PROCUREMENT_CENTRES[0]

    const { booking, rawToken } = await createSlotBooking({
      farmer_id: farmer.farmerId || 'KS-FARM-2026-8942',
      farmer_name: farmer.name || 'Ramesh Kumar Singh',
      farmer_phone: farmer.mobile,
      centre_id: matched.id,
      centre_name: matched.centreName,
      booking_date: newDate,
      start_time: newTime,
      end_time: '12:00 PM',
      commodity: newCrop,
      quantity: Number(newQty),
      vehicle_number: newVehicleNumber.trim() || '',
    })

    setAppointment({
      date: newDate,
      time: newTime,
      centre: matched.centreName,
      crop: newCrop,
      quantity: newQty,
      token: booking.token_number,
      status: 'Confirmed',
    })
    setLastBooking({ booking, rawToken })
    setBookingModalOpen(false)
    setConfirmedModalOpen(true)
    window.dispatchEvent(new Event('kisan_setu_booking_updated'))
    loadAllDashboardData()
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="farmer-dashboard-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="dashboard"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenBookingModal={() => setBookingModalOpen(true)}
        onOpenQueueModal={() => setQueueModalOpen(true)}
      />

      {/* ==========================================================================
          Main Content Dashboard
          ========================================================================== */}
      <main className="fd-main-content">
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
              <h1>Namaste, {farmer.name || 'Ramesh Kumar'}</h1>
            </div>
            <p>
              <MapPin size={13} color="#16a34a" /> {farmer.district}, {farmer.state} • ID: {farmer.farmerId}
            </p>
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
              onClick={() => alert('You have 2 new Mandi queue notifications.')}
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

        {/* ==========================================================================
            Top 3 Cards: Appointment, Live Queue, Quick Actions
            ========================================================================== */}
        <section className="fd-top-cards-grid">
          {/* Card 1: Next Appointment */}
          <div className="fd-card">
            {appointment ? (
              <div>
                <div className="fd-card-header">
                  <h2>Next Appointment</h2>
                  <span className="fd-status-pill">{appointment.status}</span>
                </div>

                <div className="fd-appt-main">
                  <div className="fd-appt-icon">
                    <CalendarCheck size={22} />
                  </div>
                  <div>
                    <strong>{appointment.date} ({appointment.time})</strong>
                    <small>{appointment.centre}</small>
                  </div>
                </div>

                <div className="fd-appt-details-grid">
                  <div className="fd-appt-detail-box">
                    <small>Produce Crop</small>
                    <strong>{appointment.crop}</strong>
                  </div>
                  <div className="fd-appt-detail-box">
                    <small>Quantity</small>
                    <strong>{appointment.quantity} Quintal</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
                  <button
                    className="fd-card-btn secondary"
                    onClick={() => navigate('/appointments')}
                  >
                    <Eye size={14} /> View Pass
                  </button>
                  <button
                    className="fd-card-btn secondary"
                    onClick={() => {
                      const m = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === appointment.centre)
                      setMapModalCentre({
                        centreName: appointment.centre,
                        address: m?.address,
                        district: m?.district,
                        blockTehsil: m?.blockTehsil,
                        agency: m?.agency,
                      })
                    }}
                  >
                    <MapPin size={14} color="#16a34a" /> Google Map
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div className="fd-card-header">
                    <h2>Next Appointment</h2>
                    <span className="fd-status-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>No Active Slot</span>
                  </div>

                  <div style={{ margin: '14px 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>No upcoming appointment scheduled.</p>
                    <small style={{ color: '#64748b', display: 'block', marginTop: '6px' }}>
                      Book an official intake slot to receive your verified digital token and QR gate pass.
                    </small>
                  </div>
                </div>

                <button
                  className="fd-card-btn primary"
                  onClick={() => setBookingModalOpen(true)}
                >
                  <PlusCircle size={15} /> Book Procurement Slot
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Live Queue Status */}
          <div className="fd-card">
            {appointment ? (
              <div>
                <div className="fd-card-header">
                  <h2>Live Queue Status</h2>
                  <span className="fd-status-pill live">
                    <span className="fd-live-dot" /> Live Active
                  </span>
                </div>

                <div className="fd-token-row">
                  <div className="fd-current-token">
                    <small>Serving Token</small>
                    <strong>{mandiStatus.current_serving_token}</strong>
                  </div>
                  <div className="fd-your-token">
                    <small>Your Token</small>
                    <strong>{appointment.token}</strong>
                  </div>
                </div>

                <div className="fd-queue-meta">
                  <span>Farmers Ahead: <strong>{mandiStatus.queue_length}</strong></span>
                  <span>Est. Wait: <strong>{Math.round(mandiStatus.queue_length * (mandiStatus.avg_service_time_mins / Math.max(1, mandiStatus.active_counters)))} min</strong></span>
                </div>

                <div className="fd-queue-track">
                  <div className="fd-queue-fill" style={{ width: `${Math.min(100, Math.max(15, mandiStatus.queue_length * 15))}%` }} />
                </div>

                <div className="fd-queue-advisory" style={{ marginTop: '12px' }}>
                  <Info size={16} color="#166534" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Real queue intake active for {appointment.centre}. {mandiStatus.active_counters} weighbridge counters operational.</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <div className="fd-card-header">
                    <h2>Live Queue Status</h2>
                    <span className="fd-status-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>No Queue Token</span>
                  </div>

                  <div className="fd-token-row">
                    <div className="fd-current-token">
                      <small>Centre Intake Token</small>
                      <strong>{mandiStatus.current_serving_token}</strong>
                    </div>
                    <div className="fd-your-token" style={{ opacity: 0.6 }}>
                      <small>Your Token</small>
                      <strong>—</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', margin: '10px 0', lineHeight: 1.4 }}>
                    You have no active slot registered for today. Book a slot at <strong>{mandiStatus.mandi_name}</strong> to join the live gate queue.
                  </div>
                </div>

                <button
                  className="fd-card-btn secondary"
                  onClick={() => setBookingModalOpen(true)}
                >
                  <PlusCircle size={15} /> Book Slot to Join Queue
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Quick Actions */}
          <div className="fd-card">
            <div>
              <div className="fd-card-header">
                <h2>Quick Actions</h2>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>1-Click Operations</span>
              </div>

              <div className="fd-quick-grid">
                <div className="fd-quick-tile" onClick={() => setBookingModalOpen(true)}>
                  <div className="fd-quick-icon"><PlusCircle size={18} /></div>
                  <span>Book Slot</span>
                </div>
                <div className="fd-quick-tile" onClick={() => navigate('/my-procurement')}>
                  <div className="fd-quick-icon"><MapPin size={18} /></div>
                  <span>Batches</span>
                </div>
                <div className="fd-quick-tile" onClick={() => setQueueModalOpen(true)}>
                  <div className="fd-quick-icon"><QrCode size={18} /></div>
                  <span>Token QR</span>
                </div>
                <div className="fd-quick-tile" onClick={() => navigate('/dbt-payments')}>
                  <div className="fd-quick-icon"><Wallet size={18} /></div>
                  <span>DBT Status</span>
                </div>
              </div>
            </div>

            <button
              className="fd-card-btn primary"
              onClick={() => alert('Downloading official digital receipt & gate pass (PDF)...')}
            >
              <Download size={15} /> Download Token & Gate Pass
            </button>
          </div>
        </section>

        {/* ==========================================================================
            5-Column Procurement KPI Grid
            ========================================================================== */}
        <section className="fd-stats-grid">
          <div className="fd-stat-card">
            <div className="fd-stat-label"><ShoppingBag size={14} /> Total Batches</div>
            <strong>{procurements.length}</strong>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-label"><Scale size={14} /> Total Quantity</div>
            <strong>{metrics.totalProcuredQtl.toFixed(2)} <small style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>Qtl</small></strong>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-label"><TrendingUp size={14} /> Total MSP Earnings</div>
            <strong className="highlight">₹ {metrics.totalRevenue.toLocaleString('en-IN')}</strong>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-label"><Clock size={14} /> Avg Waiting Time</div>
            <strong>{mandiStatus.avg_service_time_mins} <small style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>min</small></strong>
          </div>

          <div className="fd-stat-card">
            <div className="fd-stat-label"><CheckCircle2 size={14} /> Successful Payments</div>
            <strong className="highlight">{payments.filter(p => p.status === 'COMPLETED').length} <small style={{ fontSize: '11px', color: '#166534' }}>100% DBT</small></strong>
          </div>
        </section>

        {/* ==========================================================================
            Lower Section Grid: Notifications, History, Payment Summary
            ========================================================================== */}
        <section className="fd-lower-grid">
          {/* Column 1: Notifications & Mandi Weather */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="fd-card">
              <div className="fd-card-header">
                <h2>Recent Notifications</h2>
                <button
                  style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => navigate('/notifications')}
                >
                  View All
                </button>
              </div>

              <div className="fd-notif-list">
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '10px 0' }}>No new notifications.</p>
                ) : (
                  notifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="fd-notif-item">
                      <div className="fd-notif-icon">
                        {n.category === 'PAYMENT' ? <CreditCard size={15} /> : <CheckCircle2 size={15} />}
                      </div>
                      <div>
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <small>{new Date(n.created_at).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weather Widget */}
            <div className="fd-weather-widget" style={{ position: 'relative' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <small style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                    <MapPin size={12} color="#86efac" /> {weather.locationName}
                  </small>
                  {weather.isLiveGPS && (
                    <span style={{ fontSize: '9px', background: 'rgba(220, 252, 231, 0.25)', color: '#dcfce7', fontWeight: 800, padding: '1px 6px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                      GPS LIVE
                    </span>
                  )}
                </div>
                <strong style={{ fontSize: '28px', lineHeight: 1 }}>{weather.temp}°C</strong>
                <span style={{ display: 'block', fontSize: '11px', color: '#dcfce7', marginTop: '2px' }}>
                  {weather.condition} • {weather.advisory}
                </span>
              </div>

              <div style={{ textAlign: 'right', fontSize: '11px', color: '#dcfce7', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '2px' }}>
                    <Wind size={13} /> {weather.windSpeed} km/h
                  </div>
                  <div>Humidity: {weather.humidity}%</div>
                </div>

                {weather.isLiveGPS ? (
                  <span
                    style={{
                      marginTop: '6px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#dcfce7',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      fontSize: '9.5px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80' }} />
                    Live Meteorological Feed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    style={{
                      marginTop: '6px',
                      background: 'rgba(255, 255, 255, 0.22)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(4px)',
                    }}
                    title="Click to detect exact farm/GPS location"
                  >
                    <Navigation size={10} />
                    {isLocating ? 'Detecting...' : 'Sync Live GPS'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Procurement History Table */}
          <div className="fd-card">
            <div className="fd-card-header">
              <h2>Procurement History</h2>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Verified Activity Records</span>
            </div>

            <div className="fd-table-wrap">
              <table className="fd-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Crop</th>
                    <th>Quantity / Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {procurements.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        No procurement deliveries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    procurements.slice(0, 3).map((p) => (
                      <tr key={p.id || p.batch_number}>
                        <td><strong>{new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong></td>
                        <td>{p.commodity}</td>
                        <td>
                          <div><strong>{p.net_weight_qtl} Qtl</strong></div>
                          <small style={{ color: '#64748b' }}>₹ {Number(p.net_amount).toLocaleString('en-IN')}</small>
                        </td>
                        <td><span className="fd-table-badge">✓ Completed</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button
              className="fd-card-btn secondary"
              style={{ marginTop: '12px' }}
              onClick={() => navigate('/my-procurement')}
            >
              <Download size={14} /> View All Procurement Batches
            </button>
          </div>

          {/* Column 3: Payment Summary */}
          <div className="fd-card">
            <div className="fd-card-header">
              <h2>Payment Summary</h2>
              <CreditCard size={17} color="#16a34a" />
            </div>

            <div className="fd-payment-banner">
              <small>Last Payment Received</small>
              <strong>₹ {payments.length > 0 ? Number(payments[0].amount).toLocaleString('en-IN') : '0'}</strong>
              <div className="fd-payment-badge">
                <CheckCircle2 size={12} /> {payments.length > 0 ? `Credited on ${new Date(payments[0].transfer_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Direct PFMS Linked'}
              </div>
            </div>

            <div className="fd-payment-details">
              <div className="fd-payment-row">
                <span>Payment Mode</span>
                <strong>DBT / PFMS Direct</strong>
              </div>
              <div className="fd-payment-row">
                <span>Bank Account</span>
                <strong>{payments.length > 0 ? `•••• •••• ${payments[0].account_suffix}` : (farmer.bankAccount || '•••• •••• 4589')}</strong>
              </div>
              <div className="fd-payment-row">
                <span>Bank Name</span>
                <strong>{payments.length > 0 ? payments[0].bank_name : (farmer.bankName || 'State Bank of India')}</strong>
              </div>
              <div className="fd-payment-row">
                <span>UTR Reference</span>
                <strong style={{ fontFamily: 'monospace' }}>{payments.length > 0 ? payments[0].utr_number : 'UTR928374829104'}</strong>
              </div>
            </div>

            <button
              className="fd-card-btn secondary"
              onClick={() => navigate('/dbt-payments')}
            >
              <ShieldCheck size={14} /> View DBT Ledger &amp; Passbook
            </button>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          Slot Booking Modal
          ========================================================================== */}
      {bookingModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card">
            <div className="fd-modal-header">
              <h2>Book Procurement Slot</h2>
              <button
                className="fd-modal-close"
                onClick={() => setBookingModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="fd-modal-form">
              <div className="fd-modal-field">
                <label>Select Crop *</label>
                <select
                  value={newCrop}
                  onChange={(e) => setNewCrop(e.target.value)}
                >
                  <option value="Wheat (गेहूं)">Wheat (गेहूं) - MSP ₹ 2,275/Qtl</option>
                  <option value="Paddy / Rice (धान)">Paddy / Rice (धान) - MSP ₹ 2,183/Qtl</option>
                  <option value="Mustard (सरसों)">Mustard (सरसों) - MSP ₹ 5,650/Qtl</option>
                  <option value="Gram / Chana (चना)">Gram / Chana (चना) - MSP ₹ 5,440/Qtl</option>
                  <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन) - MSP ₹ 4,600/Qtl</option>
                </select>
              </div>

              <div className="fd-modal-field">
                <label>Estimated Quantity (Quintals) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                />
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Time Slot *</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  >
                    <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="fd-modal-field">
                <label>Choose Procurement Centre ({ALL_PROCUREMENT_CENTRES.length} Centres Available) *</label>
                <select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                  style={{ fontWeight: 600 }}
                >
                  <optgroup label="Varanasi District (43 Centres)">
                    {VARANASI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chandauli District (5 Centres)">
                    {CHANDAULI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ghazipur District (5 Centres)">
                    {GHAZIPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Jaunpur District (5 Centres)">
                    {JAUNPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                </select>
                {(() => {
                  const m = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === selectedCentre)
                  if (!m) return null
                  return (
                    <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '4px', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      📍 <strong>{m.district} District:</strong> {m.address} • Agency: <strong>{m.agency}</strong>
                    </div>
                  )
                })()}
              </div>

              <div className="fd-modal-field">
                <label>Vehicle / Tractor / Trolley Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UP-65-XX-1234 or Leave blank"
                  value={newVehicleNumber}
                  onChange={(e) => setNewVehicleNumber(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="fd-card-btn primary"
                style={{ padding: '12px', marginTop: '6px' }}
              >
                <CheckCircle2 size={16} /> Confirm & Generate Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Live Queue Progress Modal
          ========================================================================== */}
      {queueModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card">
            <div className="fd-modal-header">
              <h2>Live Mandi Queue & Gate Progress</h2>
              <button
                className="fd-modal-close"
                onClick={() => setQueueModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Your Token Number</span>
              <div style={{ fontFamily: 'Manrope', fontSize: '36px', fontWeight: 800, color: '#0d631b' }}>{appointment ? appointment.token : '—'}</div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                {appointment ? `${mandiStatus.queue_length} Farmers Ahead • Est. Gate In: ${Math.round(mandiStatus.queue_length * 5)} min` : 'No active queue token for today'}
              </div>
            </div>

            {/* Step Milestones */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8faf8', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 700, fontSize: '12.5px' }}>
                <CheckCircle2 size={18} color="#16a34a" /> 1. Slot Booked & Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 700, fontSize: '12.5px' }}>
                <CheckCircle2 size={18} color="#16a34a" /> 2. Gate Token Active
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: 700, fontSize: '12.5px' }}>
                <Clock size={18} color="#f59e0b" /> 3. Weighbridge In Queue (Next)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '12px' }}>
                <Scale size={18} color="#cbd5e1" /> 4. Automated Moisture & Quality Test
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#94a3b8', fontSize: '12px' }}>
                <CreditCard size={18} color="#cbd5e1" /> 5. Direct DBT Bank Transfer (Within 24-48h)
              </div>
            </div>

            <button
              type="button"
              className="fd-card-btn primary"
              style={{ width: '100%' }}
              onClick={() => setQueueModalOpen(false)}
            >
              Close Live Monitor
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Booking Confirmed Modal (Real High-Res QR Generator)
          ========================================================================== */}
      {confirmedModalOpen && lastBooking && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '480px' }}>
            <div className="fd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <h2>BOOKING CONFIRMED</h2>
              </div>
              <button
                className="fd-modal-close"
                onClick={() => setConfirmedModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '8px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: '99px', fontWeight: 800 }}>
                Status: CONFIRMED • Gate Token: {lastBooking.booking.token_number}
              </span>

              <div style={{ margin: '14px 0' }}>
                <BookingQR
                  token={lastBooking.rawToken}
                  bookingNumber={lastBooking.booking.booking_number}
                  farmerName={lastBooking.booking.farmer_name}
                  commodity={`${lastBooking.booking.commodity} (${lastBooking.booking.quantity} Qtl)`}
                  size={200}
                  showActions={true}
                  showDetails={false}
                />
              </div>

              {/* Summary Details Grid */}
              <div style={{ background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px', textAlign: 'left', fontSize: '12.5px', lineHeight: 1.5, marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Booking Reference:</span>
                  <strong style={{ fontFamily: 'Manrope' }}>{lastBooking.booking.booking_number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Centre:</span>
                  <strong>{lastBooking.booking.centre_name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Date & Slot:</span>
                  <strong>{lastBooking.booking.booking_date} ({lastBooking.booking.start_time} - {lastBooking.booking.end_time})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <span style={{ color: '#64748b' }}>Vehicle Assigned:</span>
                  <strong>{lastBooking.booking.vehicle_number}</strong>
                </div>
              </div>

              <button
                type="button"
                className="fd-card-btn primary"
                style={{ width: '100%', padding: '10px' }}
                onClick={() => setConfirmedModalOpen(false)}
              >
                Done, Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          View Existing Gate Pass Modal
          ========================================================================== */}
      {viewPassModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '460px' }}>
            <div className="fd-modal-header">
              <h2>Gate Entry Token & Pass</h2>
              <button
                className="fd-modal-close"
                onClick={() => setViewPassModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '8px 0' }}>
              {appointment ? (
                <BookingQR
                  token={getFarmerRawToken(appointment.token)}
                  bookingNumber={`KS-2026-${appointment.token.replace(/\D/g, '') || '000184'}`}
                  farmerName={farmer.name || 'Ramesh Kumar Singh'}
                  commodity={`${appointment.crop} (${appointment.quantity} Qtl)`}
                  size={200}
                  showActions={true}
                  showDetails={true}
                />
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px 0' }}>
                  No active booking pass available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ==========================================================================
          Interactive Google Map Modal
          ========================================================================== */}
      <GoogleMapsModal
        isOpen={!!mapModalCentre}
        onClose={() => setMapModalCentre(null)}
        centreName={mapModalCentre?.centreName || ''}
        address={mapModalCentre?.address}
        district={mapModalCentre?.district}
        blockTehsil={mapModalCentre?.blockTehsil}
        agency={mapModalCentre?.agency}
      />
    </div>
  )
}
