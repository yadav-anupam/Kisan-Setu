import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Globe2,
  MapPin,
  Menu,
  PlusCircle,
  QrCode,
  RotateCcw,
  Scale,
  Sprout,
  Trash2,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import BookingQR from '../common/BookingQR'
import { GoogleMapsModal } from '../common/GoogleMapsModal'
import {
  getFarmerRawToken,
  getFarmerBookings,
  createSlotBooking,
  cancelBookingInDB,
} from '../../services/qrBookingService'
import FarmerSidebar from './FarmerSidebar'
import {
  ALL_PROCUREMENT_CENTRES,
  VARANASI_PROCUREMENT_CENTRES,
  CHANDAULI_PROCUREMENT_CENTRES,
  GHAZIPUR_PROCUREMENT_CENTRES,
  JAUNPUR_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import './FarmerDashboard.css'
import './MyAppointmentsPage.css'

interface Appointment {
  id: string
  date: string
  day: string
  month: string
  year: string
  time: string
  centre: string
  address: string
  crop: string
  quantity: string
  token: string
  status: 'Upcoming' | 'Confirmed' | 'Completed' | 'Cancelled'
}

export default function MyAppointmentsPage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [upcomingList, setUpcomingList] = useState<Appointment[]>([])
  const [pastList, setPastList] = useState<Appointment[]>([])

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedPass, setSelectedPass] = useState<Appointment | null>(null)
  const [rescheduleItem, setRescheduleItem] = useState<Appointment | null>(null)
  const [mapModalCentre, setMapModalCentre] = useState<{
    centreName: string
    address?: string
    district?: string
    blockTehsil?: string
    agency?: string
  } | null>(null)

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-02')
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM')

  // Booking Form State
  const [newCrop, setNewCrop] = useState('Wheat (गेहूं)')
  const [newQty, setNewQty] = useState('45')
  const [newDate, setNewDate] = useState('2026-09-10')
  const [newTime, setNewTime] = useState('10:00 AM')
  const [newVehicleNumber, setNewVehicleNumber] = useState('')
  const [selectedCentre, setSelectedCentre] = useState<string>(
    farmer.preferredMandi || ALL_PROCUREMENT_CENTRES[0].centreName
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  const refreshAppointments = useCallback(async () => {
    try {
      const records = await getFarmerBookings(farmer.farmerId || 'KS-FARM-2026-8942')
      if (records && records.length > 0) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const transformed: Appointment[] = records.map((r) => {
          const parsed = new Date(r.booking_date || Date.now())
          const matched = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === r.centre_name)
          return {
            id: r.id || r.booking_number,
            date: r.booking_date,
            day: parsed.getDate().toString().padStart(2, '0'),
            month: monthNames[parsed.getMonth()] || 'Sep',
            year: parsed.getFullYear().toString(),
            time: r.start_time,
            centre: r.centre_name,
            address: matched ? matched.address : 'Procurement Centre Yard',
            crop: r.commodity,
            quantity: r.quantity.toString(),
            token: r.token_number,
            status: r.verification_status === 'VERIFIED' ? 'Completed' : r.status === 'CANCELLED' ? 'Cancelled' : 'Upcoming',
          }
        })
        const upcoming = transformed.filter((a) => a.status === 'Upcoming' || a.status === 'Confirmed')
        const past = transformed.filter((a) => a.status === 'Completed' || a.status === 'Cancelled')
        setUpcomingList(upcoming)
        setPastList(past)
      } else {
        setUpcomingList([])
        setPastList([])
      }
    } catch {
      // ignore
    }
  }, [farmer.farmerId])

  useEffect(() => {
    let isMounted = true
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/appointments')
      navigate('/login')
      return
    }

    getFarmerBookings(farmer.farmerId || 'KS-FARM-2026-8942').then((records) => {
      if (!isMounted) return
      if (records && records.length > 0) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const transformed: Appointment[] = records.map((r) => {
          const parsed = new Date(r.booking_date || Date.now())
          const matched = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === r.centre_name)
          return {
            id: r.id || r.booking_number,
            date: r.booking_date,
            day: parsed.getDate().toString().padStart(2, '0'),
            month: monthNames[parsed.getMonth()] || 'Sep',
            year: parsed.getFullYear().toString(),
            time: r.start_time,
            centre: r.centre_name,
            address: matched ? matched.address : 'Procurement Centre Yard',
            crop: r.commodity,
            quantity: r.quantity.toString(),
            token: r.token_number,
            status: r.verification_status === 'VERIFIED' ? 'Completed' : r.status === 'CANCELLED' ? 'Cancelled' : 'Upcoming',
          }
        })
        const upcoming = transformed.filter((a) => a.status === 'Upcoming' || a.status === 'Confirmed')
        const past = transformed.filter((a) => a.status === 'Completed' || a.status === 'Cancelled')
        setUpcomingList(upcoming)
        setPastList(past)
      } else {
        setUpcomingList([])
        setPastList([])
      }
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

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    const matched = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === selectedCentre) || ALL_PROCUREMENT_CENTRES[0]

    const { booking } = await createSlotBooking({
      farmer_id: farmer.farmerId || 'KS-FARM-2026-8942',
      farmer_name: farmer.name || 'Ramesh Kumar Singh',
      farmer_phone: farmer.mobile,
      centre_id: matched.id,
      centre_name: matched.centreName,
      booking_date: newDate,
      start_time: newTime,
      end_time: '01:00 PM',
      commodity: newCrop,
      quantity: Number(newQty),
      vehicle_number: newVehicleNumber.trim() || '',
    })

    const parsedDate = new Date(newDate)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const newApt: Appointment = {
      id: booking.id,
      date: newDate,
      day: parsedDate.getDate().toString().padStart(2, '0'),
      month: monthNames[parsedDate.getMonth()] || 'Sep',
      year: parsedDate.getFullYear().toString(),
      time: newTime,
      centre: matched.centreName,
      address: matched.address,
      crop: newCrop,
      quantity: newQty,
      token: booking.token_number,
      status: 'Upcoming',
    }
    setUpcomingList((prev) => [newApt, ...prev])
    setBookingModalOpen(false)
    window.dispatchEvent(new Event('kisan_setu_booking_updated'))
    alert(`Appointment booked successfully at ${matched.centreName}! Gate Token: ${newApt.token}`)
    refreshAppointments()
  }

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleItem) return
    const parsedDate = new Date(rescheduleDate)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    setUpcomingList((prev) =>
      prev.map((item) =>
        item.id === rescheduleItem.id
          ? {
              ...item,
              date: rescheduleDate,
              day: parsedDate.getDate().toString().padStart(2, '0'),
              month: monthNames[parsedDate.getMonth()] || 'Sep',
              year: parsedDate.getFullYear().toString(),
              time: rescheduleTime,
              status: 'Confirmed',
            }
          : item
      )
    )
    setRescheduleItem(null)
    alert('Appointment rescheduled successfully!')
  }

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Are you sure you want to cancel this procurement appointment?')) {
      const itemToCancel = upcomingList.find((i) => i.id === id)
      if (itemToCancel) {
        setUpcomingList((prev) => prev.filter((i) => i.id !== id))
        setPastList((prev) => [{ ...itemToCancel, status: 'Cancelled' }, ...prev])
        await cancelBookingInDB(id)
        window.dispatchEvent(new Event('kisan_setu_booking_cancelled'))
        refreshAppointments()
      }
    }
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="appointments-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="appointments"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenBookingModal={() => setBookingModalOpen(true)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="ap-main-content">
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
              <h1>My Appointments</h1>
            </div>
            <p>Manage your upcoming and past government procurement bookings.</p>
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
              onClick={() => alert('Appointment reminders are active.')}
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
              <div className="fd-avatar-circle">
                {farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'RK'}
              </div>
              <span className="fd-avatar-name">{farmer.name.split(' ')[0] || 'Farmer'}</span>
            </div>
          </div>
        </header>

        {/* Controls & Tab Bar */}
        <section className="ap-controls-bar">
          <div className="ap-tabs-wrap">
            <button
              className={`ap-tab-btn ${tab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setTab('upcoming')}
            >
              Upcoming ({upcomingList.length})
            </button>
            <button
              className={`ap-tab-btn ${tab === 'past' ? 'active' : ''}`}
              onClick={() => setTab('past')}
            >
              Past ({pastList.length})
            </button>
          </div>

          <button className="ap-book-new-btn" onClick={() => setBookingModalOpen(true)}>
            <PlusCircle size={16} /> Book New Slot
          </button>
        </section>

        {/* Appointments List */}
        <section className="ap-cards-list">
          {tab === 'upcoming' && upcomingList.length === 0 && (
            <div className="ap-empty-state">
              <CalendarDays size={48} />
              <h3>No Upcoming Appointments</h3>
              <p>You have no scheduled bookings at this time. Book a slot for your crop produce.</p>
              <button className="ap-book-new-btn" onClick={() => setBookingModalOpen(true)}>
                <PlusCircle size={16} /> Book Slot Now
              </button>
            </div>
          )}

          {tab === 'upcoming' &&
            upcomingList.map((apt) => (
              <div key={apt.id} className="ap-card">
                {/* Date / Time Block */}
                <div className="ap-date-block">
                  <span className="ap-date-month">{apt.month}</span>
                  <span className="ap-date-day">{apt.day}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{apt.year}</span>
                  <div className="ap-date-time">
                    <Clock size={12} color="#16a34a" />
                    <span>{apt.time}</span>
                  </div>
                </div>

                {/* Details Column */}
                <div className="ap-info-col">
                  <div className="ap-centre-title">
                    <MapPin size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>{apt.centre}</strong>
                      <p>{apt.address}</p>
                    </div>
                  </div>

                  <div className="ap-badges-row">
                    <span className="ap-crop-badge">
                      <Sprout size={13} /> {apt.crop}
                    </span>
                    <span className="ap-qty-badge">
                      <Scale size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {apt.quantity} Quintal
                    </span>
                  </div>
                </div>

                {/* Token Block */}
                <div className="ap-token-col">
                  <small>Token Number</small>
                  <strong>{apt.token}</strong>
                  <span className="ap-status-tag upcoming">
                    <CheckCircle2 size={11} /> {apt.status}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="ap-actions-col">
                  <button
                    className="ap-action-btn"
                    onClick={() => setSelectedPass(apt)}
                  >
                    <QrCode size={14} /> Gate Pass &amp; QR
                  </button>
                  <button
                    className="ap-action-btn"
                    onClick={() => {
                      const m = ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === apt.centre)
                      setMapModalCentre({
                        centreName: apt.centre,
                        address: apt.address || m?.address,
                        district: m?.district,
                        blockTehsil: m?.blockTehsil,
                        agency: m?.agency,
                      })
                    }}
                  >
                    <MapPin size={14} color="#16a34a" /> Google Map
                  </button>
                  <button
                    className="ap-action-btn"
                    onClick={() => {
                      setRescheduleItem(apt)
                      setRescheduleDate(apt.date)
                      setRescheduleTime(apt.time)
                    }}
                  >
                    <RotateCcw size={14} /> Reschedule
                  </button>
                  <button
                    className="ap-action-btn danger"
                    onClick={() => handleCancelAppointment(apt.id)}
                  >
                    <Trash2 size={14} /> Cancel
                  </button>
                </div>
              </div>
            ))}

          {tab === 'past' &&
            pastList.map((apt) => (
              <div key={apt.id} className="ap-card" style={{ opacity: 0.9 }}>
                {/* Date / Time Block */}
                <div className="ap-date-block" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <span className="ap-date-month" style={{ color: '#64748b' }}>{apt.month}</span>
                  <span className="ap-date-day">{apt.day}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{apt.year}</span>
                  <div className="ap-date-time">
                    <Clock size={12} color="#64748b" />
                    <span>{apt.time}</span>
                  </div>
                </div>

                {/* Details Column */}
                <div className="ap-info-col">
                  <div className="ap-centre-title">
                    <MapPin size={18} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong>{apt.centre}</strong>
                      <p>{apt.address}</p>
                    </div>
                  </div>

                  <div className="ap-badges-row">
                    <span className="ap-crop-badge" style={{ background: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }}>
                      <Sprout size={13} /> {apt.crop}
                    </span>
                    <span className="ap-qty-badge">{apt.quantity} Quintal</span>
                  </div>
                </div>

                {/* Token Block */}
                <div className="ap-token-col">
                  <small>Token Number</small>
                  <strong style={{ color: '#334155' }}>{apt.token}</strong>
                  <span className="ap-status-tag completed">
                    {apt.status === 'Completed' ? '✓ Completed' : '✕ Cancelled'}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="ap-actions-col">
                  <button
                    className="ap-action-btn"
                    onClick={() => alert('Downloading official weighment receipt & DBT confirmation (PDF)...')}
                  >
                    <Download size={14} /> Download Receipt
                  </button>
                  <button
                    className="ap-action-btn"
                    onClick={() => {
                      setNewCrop(apt.crop)
                      setNewQty(apt.quantity)
                      setBookingModalOpen(true)
                    }}
                  >
                    <PlusCircle size={14} /> Rebook Slot
                  </button>
                </div>
              </div>
            ))}
        </section>
      </main>

      {/* ==========================================================================
          Gate Pass & Token QR Modal
          ========================================================================== */}
      {selectedPass && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '440px' }}>
            <div className="fd-modal-header">
              <h2>Gate Entry Token & Pass</h2>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedPass(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '8px 0' }}>
              <BookingQR
                token={getFarmerRawToken(selectedPass.token)}
                bookingNumber={`KS-2026-${selectedPass.token.replace(/\D/g, '') || '000184'}`}
                farmerName={farmer.name || 'Ramesh Kumar Singh'}
                commodity={`${selectedPass.crop} (${selectedPass.quantity} Qtl)`}
                size={200}
                showActions={true}
                showDetails={false}
              />

              <div style={{ fontSize: '12.5px', background: '#f8faf8', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '14px 0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Assigned Token:</span>
                  <strong style={{ color: '#0d631b', fontFamily: 'Manrope', fontSize: '14px' }}>{selectedPass.token}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b' }}>Date & Slot:</span>
                  <strong>{selectedPass.day} {selectedPass.month} {selectedPass.year} ({selectedPass.time})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px' }}>
                  <span style={{ color: '#64748b' }}>Procurement Mandi:</span>
                  <strong>{selectedPass.centre}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Reschedule Modal
          ========================================================================== */}
      {rescheduleItem && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card">
            <div className="fd-modal-header">
              <h2>Reschedule Appointment</h2>
              <button
                className="fd-modal-close"
                onClick={() => setRescheduleItem(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmReschedule} className="fd-modal-form">
              <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                Rescheduling Token <strong>{rescheduleItem.token}</strong> for {rescheduleItem.crop} ({rescheduleItem.quantity} Qtl).
              </div>

              <div className="fd-modal-field">
                <label>Select New Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>

              <div className="fd-modal-field">
                <label>Select New Time Slot *</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="fd-card-btn primary"
                style={{ padding: '12px', marginTop: '6px' }}
              >
                <RotateCcw size={16} /> Confirm Reschedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Book New Slot Modal
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
