import { useState, useEffect } from 'react'
import {
  Calendar,
  CalendarCheck,
  CreditCard,
  HelpCircle,
  History,
  LogOut,
  PlusCircle,
  Sprout,
  User,
  Users,
  X,
  Bell,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import { logoutFarmer, getFarmerProfile } from '../../auth'
import { getFarmerBookings } from '../../services/qrBookingService'
import { fetchNotificationsFromDB } from '../../services/supabaseDataService'

interface FarmerSidebarProps {
  activePage?:
    | 'dashboard'
    | 'appointments'
    | 'book-slot'
    | 'queue'
    | 'procurement'
    | 'payments'
    | 'history'
    | 'notifications'
    | 'profile'
    | 'help'
  isOpen: boolean
  onClose: () => void
  onOpenBookingModal?: () => void
  onOpenQueueModal?: () => void
}

export default function FarmerSidebar({
  activePage,
  isOpen,
  onClose,
  onOpenBookingModal,
  onOpenQueueModal: _onOpenQueueModal,
}: FarmerSidebarProps) {
  const [upcomingCount, setUpcomingCount] = useState<number>(0)
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    let isMounted = true
    const farmer = getFarmerProfile()
    const fId = farmer.farmerId || 'KS-FARM-2026-8942'

    Promise.all([
      getFarmerBookings(fId),
      fetchNotificationsFromDB(fId),
    ]).then(([bookings, notifs]) => {
      if (isMounted) {
        if (bookings) {
          const upcoming = bookings.filter(
            (b) => b.verification_status !== 'VERIFIED' && b.status !== 'CANCELLED'
          )
          setUpcomingCount(upcoming.length)
        }
        if (notifs) {
          const unread = notifs.filter((n) => !n.is_read)
          setUnreadCount(unread.length)
        }
      }
    }).catch(() => {})

    const handleNotifUpdate = (e: Event) => {
      const custom = e as CustomEvent<{ unreadCount?: number }>
      if (typeof custom.detail?.unreadCount === 'number') {
        setUnreadCount(custom.detail.unreadCount)
      } else {
        fetchNotificationsFromDB(fId).then((notifs) => {
          if (isMounted && notifs) {
            setUnreadCount(notifs.filter((n) => !n.is_read).length)
          }
        }).catch(() => {})
      }
    }

    const handleBookingsUpdate = () => {
      getFarmerBookings(fId).then((bookings) => {
        if (isMounted && bookings) {
          const upcoming = bookings.filter(
            (b) => b.verification_status !== 'VERIFIED' && b.status !== 'CANCELLED'
          )
          setUpcomingCount(upcoming.length)
        }
      }).catch(() => {})
    }

    window.addEventListener('kisan_setu_notifs_updated', handleNotifUpdate)
    window.addEventListener('kisan_setu_booking_cancelled', handleBookingsUpdate)
    window.addEventListener('kisan_setu_booking_updated', handleBookingsUpdate)

    return () => {
      isMounted = false
      window.removeEventListener('kisan_setu_notifs_updated', handleNotifUpdate)
      window.removeEventListener('kisan_setu_booking_cancelled', handleBookingsUpdate)
      window.removeEventListener('kisan_setu_booking_updated', handleBookingsUpdate)
    }
  }, [])

  const handleLogout = () => {
    logoutFarmer()
    navigate('/login')
  }

  const handleItemClick = (page: string) => {
    onClose()
    if (page === 'dashboard') {
      navigate('/farmer-dashboard')
    } else if (page === 'appointments') {
      navigate('/my-appointments')
    } else if (page === 'book-slot') {
      if (onOpenBookingModal) {
        onOpenBookingModal()
      } else {
        navigate('/my-appointments')
      }
    } else if (page === 'queue') {
      navigate('/queue')
    } else if (page === 'procurement') {
      navigate('/my-procurement')
    } else if (page === 'payments') {
      navigate('/payments')
    } else if (page === 'history') {
      navigate('/history')
    } else if (page === 'notifications') {
      navigate('/notifications')
    } else if (page === 'profile') {
      navigate('/profile')
    } else if (page === 'help') {
      navigate('/help-support')
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fd-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fd-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Top Solid Green Header Box */}
        <div className="fd-sidebar-header-box">
          <div className="fd-header-content">
            <a
              href="/"
              className="fd-brand-link"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <img src={logoImg} alt="Kisan Setu" className="fd-logo-small" />
              <div>
                <h1 className="fd-brand-heading">Kisan Setu</h1>
                <p className="fd-brand-sub">Agri-Trust Platform</p>
              </div>
            </a>

            {/* Mobile Close Button */}
            <button
              className="fd-close-mobile-btn"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="fd-nav-list" style={{ overflowY: 'auto', flex: 1, padding: '4px 10px 16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Section: Overview */}
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '10px 10px 4px' }}>
            Main Menu
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleItemClick('dashboard')}
          >
            <CalendarCheck size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'appointments' ? 'active' : ''}`}
            onClick={() => handleItemClick('appointments')}
          >
            <Calendar size={18} />
            <span>My Appointments</span>
            {upcomingCount > 0 && <span className="fd-nav-badge">{upcomingCount}</span>}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'book-slot' ? 'active' : ''}`}
            onClick={() => handleItemClick('book-slot')}
          >
            <PlusCircle size={18} />
            <span>Book New Slot</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'queue' ? 'active' : ''}`}
            onClick={() => handleItemClick('queue')}
          >
            <Users size={18} />
            <span>Live Yard Queue</span>
          </button>

          {/* Section: Procurement & DBT */}
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '14px 10px 4px' }}>
            Procurement &amp; DBT
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'procurement' ? 'active' : ''}`}
            onClick={() => handleItemClick('procurement')}
          >
            <Sprout size={18} />
            <span>My Procurement</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'payments' ? 'active' : ''}`}
            onClick={() => handleItemClick('payments')}
          >
            <CreditCard size={18} />
            <span>DBT Payments</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => handleItemClick('history')}
          >
            <History size={18} />
            <span>Procurement History</span>
          </button>

          {/* Section: Preferences & Support */}
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#94a3b8', padding: '14px 10px 4px' }}>
            Account &amp; Support
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'notifications' ? 'active' : ''}`}
            onClick={() => handleItemClick('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && <span className="fd-nav-badge red">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => handleItemClick('profile')}
          >
            <User size={18} />
            <span>Farmer Profile</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activePage === 'help' ? 'active' : ''}`}
            onClick={() => handleItemClick('help')}
          >
            <HelpCircle size={18} />
            <span>Help &amp; Support</span>
          </button>
        </nav>

        {/* Farmer Profile Footer */}
        <div
          style={{
            marginTop: 'auto',
            flexShrink: 0,
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 14px',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#0d631b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {getFarmerProfile().name?.charAt(0) || 'K'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {getFarmerProfile().name || 'Farmer Portal'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {getFarmerProfile().farmerId || 'KS-FARM-8942'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="fd-logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '8px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} color="#dc2626" />
            <span>Sign Out Farmer</span>
          </button>
        </div>
      </aside>
    </>
  )
}
