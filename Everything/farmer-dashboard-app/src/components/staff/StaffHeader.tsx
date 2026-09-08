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
  Building2,
} from 'lucide-react'
import { navigate, useRouter } from '../../router'
import './StaffHeader.css'
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

export default function StaffHeader({ onToggleSidebar, pageTitle = 'Operations Desk' }: StaffHeaderProps) {
  const { path } = useRouter()
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [notifications, setNotifications] = useState<StaffNotification[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isAdminPortal = path.startsWith('/admin')
  const isCentreAdminPortal = path.startsWith('/centre-admin')
  const isStaffPortal = !isAdminPortal && !isCentreAdminPortal

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
    if (isAdminPortal) navigate('/admin/login')
    else if (isCentreAdminPortal) navigate('/centre-admin/login')
    else navigate('/staff/login')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      if (isAdminPortal) {
        navigate(`/admin/centres?q=${encodeURIComponent(searchQuery.trim())}`)
      } else if (isCentreAdminPortal) {
        navigate(`/centre-admin/token-management?q=${encodeURIComponent(searchQuery.trim())}`)
      } else {
        navigate(`/staff/bookings?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  // Theme Config
  const badgeBg = isAdminPortal ? '#e0e7ff' : isCentreAdminPortal ? '#d1fae5' : '#dcfce7'
  const badgeColor = isAdminPortal ? '#3730a3' : isCentreAdminPortal ? '#065f46' : '#166534'
  const primaryTitleColor = isAdminPortal ? '#1e1b4b' : isCentreAdminPortal ? '#064e3b' : '#075a27'
  const badgeLabel = isAdminPortal ? 'STATEWIDE APMC COMMAND' : isCentreAdminPortal ? 'MANDI SUPERINTENDENT' : 'GATE 2 DESK'

  return (
    <header className="staff-topbar">
      <div className="staff-topbar-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="staff-mobile-toggle-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation"
          >
            <Menu size={17} />
          </button>
        )}

        <div className="staff-title-group">
          <div className="staff-title-row">
            <span className="staff-title-text" style={{ color: primaryTitleColor }}>
              {isAdminPortal ? 'Uttar Pradesh APMC Governance' : staff.centre_name || 'Chiraigaon Mandi Centre'}
            </span>
            <span
              className="staff-role-badge"
              style={{
                background: badgeBg,
                color: badgeColor,
              }}
            >
              {badgeLabel}
            </span>
          </div>
          <p className="staff-subtitle">
            <span>{todayFormatted}</span>
            <span>•</span>
            <strong style={{ color: '#0f172a' }}>{pageTitle}</strong>
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="staff-search-form">
        <div className="staff-search-input-wrap">
          <Search
            size={14}
            color="#94a3b8"
            style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            className="staff-search-input"
            placeholder={
              isAdminPortal
                ? 'Search mandis, officers, or DBT...'
                : isCentreAdminPortal
                ? 'Search tokens, farmers, vouchers...'
                : 'Search gate pass QR, booking, vehicle...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Header Right Actions */}
      <div className="staff-topbar-right">
        {/* Action Shortcuts based on Portal */}
        {isStaffPortal && (
          <button
            type="button"
            className="staff-action-btn"
            onClick={() => navigate('/staff/qr-verification')}
            style={{
              background: '#0d631b',
              color: '#ffffff',
            }}
          >
            <QrCode size={13} /> Scan QR
          </button>
        )}

        {isAdminPortal && (
          <button
            type="button"
            className="staff-action-btn"
            onClick={() => navigate('/admin/centres/add')}
            style={{
              background: '#1e3a8a',
              color: '#ffffff',
            }}
          >
            <Building2 size={13} /> + Add Mandi
          </button>
        )}

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="staff-notif-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Staff Notifications"
          >
            <Bell size={16} color="#334155" />
            {unreadCount > 0 && (
              <span className="staff-notif-badge">
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
            className="staff-avatar-pill"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          >
            <div
              className="staff-avatar-circle"
              style={{ background: primaryTitleColor }}
            >
              {staff.full_name?.charAt(0) || 'S'}
            </div>
            <span className="staff-avatar-name">
              {staff.full_name || 'Staff Officer'}
            </span>
            <ChevronDown size={13} className="staff-avatar-chevron" />
          </button>

          {profileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '240px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                zIndex: 1000,
                padding: '6px 0',
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>
                  {staff.full_name || 'Staff User'}
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {staff.staff_id} • {staff.role}
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); navigate('/staff/profile') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
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
                <User size={14} color="#64748b" /> Staff Profile
              </button>

              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); navigate('/staff/settings') }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
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
                <ShieldCheck size={14} color="#64748b" /> Terminal Settings
              </button>

              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
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
                <LogOut size={14} color="#dc2626" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
