import { useState, useEffect, useRef } from 'react'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  QrCode,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  logoutStaffUser,
  fetchStaffNotifications,
  markStaffNotificationRead,
  type StaffProfile,
  type StaffNotification,
} from '../../services/staffDataService'

interface StaffHeaderProps {
  onToggleSidebar?: () => void
  pageTitle?: string
}

export default function StaffHeader({ onToggleSidebar, pageTitle = 'Staff Operations' }: StaffHeaderProps) {
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [notifications, setNotifications] = useState<StaffNotification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(getStaffAuthSession())
    }
    window.addEventListener('kisan_setu_staff_profile_updated', handleUpdate)

    setStaff(getStaffAuthSession())
    fetchStaffNotifications(staff.staff_id).then(setNotifications).catch(() => {})

    return () => {
      window.removeEventListener('kisan_setu_staff_profile_updated', handleUpdate)
    }
  }, [staff.staff_id])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markStaffNotificationRead(n.id))
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleLogout = () => {
    logoutStaffUser()
    navigate('/staff/login')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/staff/bookings?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="fd-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'relative', zIndex: 100, overflow: 'visible' }}>
      <div className="fd-header-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            className="fd-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Menu size={18} color="#0f172a" />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0d631b' }}>
              {staff.centre_name}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                background: '#dcfce7',
                color: '#166534',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              GATE 2 DESK
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
            {todayFormatted} • <strong style={{ color: '#0f172a' }}>{pageTitle}</strong>
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: 1,
          maxWidth: '380px',
          margin: '0 20px',
          display: 'none',
        }}
        className="staff-search-desktop"
      >
        <style>{`
          @media (min-width: 900px) {
            .staff-search-desktop { display: block !important; }
          }
        `}</style>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={15}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search booking #, farmer or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 12px 0 36px',
              borderRadius: '20px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              background: '#f8fafc',
              outline: 'none',
            }}
          />
        </div>
      </form>

      {/* Header Right Actions */}
      <div className="fd-header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick QR Scanner Shortcut */}
        <button
          type="button"
          onClick={() => navigate('/staff/qr-verification')}
          style={{
            background: '#0d631b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '20px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 6px rgba(13,99,27,0.2)',
          }}
        >
          <QrCode size={14} /> Scan QR
        </button>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="fd-icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              position: 'relative',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Staff Notifications"
          >
            <Bell size={17} color="#334155" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 'auto',
                width: '360px',
                maxWidth: '90vw',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18), 0 2px 10px rgba(0, 0, 0, 0.08)',
                zIndex: 9999,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease-out',
              }}
            >
              {/* Popover Header */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} />
                  <strong style={{ fontSize: '13.5px', fontWeight: 800 }}>Centre Alerts &amp; Notices</strong>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '12px',
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List Body */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '6px 0' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                    <Bell size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                    <strong style={{ display: 'block', fontSize: '13px', color: '#334155' }}>No Notifications</strong>
                    <span style={{ fontSize: '12px' }}>You are all caught up with centre operations.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markStaffNotificationRead(n.id)
                        setNotifications((prev) =>
                          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
                        )
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        background: n.is_read ? '#ffffff' : '#f0fdf4',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: '#0f172a', fontSize: '12.5px', lineHeight: 1.3, flex: 1 }}>
                          {n.title}
                        </strong>
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            background:
                              n.type === 'ALERT'
                                ? '#fee2e2'
                                : n.type === 'INFO'
                                ? '#e0f2fe'
                                : '#f0fdf4',
                            color:
                              n.type === 'ALERT'
                                ? '#dc2626'
                                : n.type === 'INFO'
                                ? '#0284c7'
                                : '#166534',
                          }}
                        >
                          {n.type}
                        </span>
                      </div>

                      <p style={{ color: '#334155', margin: '0 0 6px', lineHeight: 1.45, fontSize: '12px' }}>
                        {n.message}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b' }}>
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!n.is_read && (
                          <span style={{ color: '#0d631b', fontWeight: 700, fontSize: '10.5px' }}>
                            • Unread
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill & Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            type="button"
            className="fd-avatar-pill"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '4px 10px 4px 5px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#0d631b',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '12px',
                fontWeight: 800,
              }}
            >
              {staff.full_name?.charAt(0) || 'S'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block' }}>
                {staff.full_name || 'Staff Officer'}
              </strong>
              <small style={{ fontSize: '10px', color: '#64748b', fontWeight: 600 }}>
                {staff.staff_id} • {staff.role}
              </small>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '200px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                zIndex: 1000,
                padding: '6px 0',
              }}
            >
              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); navigate('/staff/profile') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '12.5px',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <User size={15} color="#64748b" /> Staff Profile
              </button>

              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); navigate('/staff/settings') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '12.5px',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <ShieldCheck size={15} color="#64748b" /> Terminal Settings
              </button>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '12.5px',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <LogOut size={15} color="#dc2626" /> Staff Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
