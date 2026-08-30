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
  activePage:
    | 'dashboard'
    | 'appointments'
    | 'book-slot'
    | 'queue'
    | 'procurement'
    | 'payments'
    | 'history'
    | 'notifications'
    | 'profile'
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
      window.open('https://wa.me/919214334494', '_blank')
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
        <nav className="fd-nav-list">
          <button
            className={`fd-nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleItemClick('dashboard')}
          >
            <CalendarCheck size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`fd-nav-item ${activePage === 'appointments' ? 'active' : ''}`}
            onClick={() => handleItemClick('appointments')}
          >
            <Calendar size={18} />
            <span>My Appointments</span>
            {upcomingCount > 0 && <span className="fd-nav-badge">{upcomingCount}</span>}
          </button>

          <button
            className={`fd-nav-item ${activePage === 'book-slot' ? 'active' : ''}`}
            onClick={() => handleItemClick('book-slot')}
          >
            <PlusCircle size={18} />
            <span>Book New Slot</span>
          </button>

          <button
            className={`fd-nav-item ${activePage === 'queue' ? 'active' : ''}`}
            onClick={() => handleItemClick('queue')}
          >
            <Users size={18} />
            <span>Live Queue</span>
          </button>

          <button
            className={`fd-nav-item ${activePage === 'procurement' ? 'active' : ''}`}
            onClick={() => handleItemClick('procurement')}
          >
            <Sprout size={18} />
            <span>My Procurement</span>
          </button>

          <button
            className={`fd-nav-item ${activePage === 'payments' ? 'active' : ''}`}
            onClick={() => handleItemClick('payments')}
          >
            <CreditCard size={18} />
            <span>DBT Payments</span>
          </button>

          <button
            className={`fd-nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => handleItemClick('history')}
          >
            <History size={18} />
            <span>History</span>
          </button>

          <div className="fd-nav-divider" />

          <button
            className={`fd-nav-item ${activePage === 'notifications' ? 'active' : ''}`}
            onClick={() => handleItemClick('notifications')}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && <span className="fd-nav-badge red">{unreadCount}</span>}
          </button>

          <button
            className={`fd-nav-item ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => handleItemClick('profile')}
          >
            <User size={18} />
            <span>Farmer Profile</span>
          </button>

          <button
            className="fd-nav-item"
            onClick={() => handleItemClick('help')}
          >
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </button>
        </nav>

        {/* Smart Procurement Box */}
        <div className="fd-sidebar-smart-box">
          <strong>Smart Procurement</strong>
          <p>Direct DBT credit on every batch with automated digital scales.</p>
          <button
            className="fd-smart-action"
            onClick={() => handleItemClick('book-slot')}
          >
            Book Next Slot →
          </button>
        </div>

        {/* Logout Action */}
        <button className="fd-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout Portal</span>
        </button>
      </aside>
    </>
  )
}
