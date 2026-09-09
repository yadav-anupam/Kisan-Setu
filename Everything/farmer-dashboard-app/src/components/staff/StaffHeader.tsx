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
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  X,
  Home,
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
            <span
              className="staff-title-text"
              style={{ color: primaryTitleColor }}
              title={isAdminPortal ? 'Uttar Pradesh APMC Governance' : staff.centre_name || 'Chiraigaon Mandi Centre'}
            >
              {isAdminPortal
                ? 'Uttar Pradesh APMC'
                : staff.centre_name
                ? staff.centre_name.replace(' 1st at Gaurakala (FCS)', ' Mandi (FCS)').replace(' at Gaurakala', '')
                : 'Chiraigaon Mandi'}
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
        {/* Return to Public Website (Home) Button */}
        <button
          type="button"
          className="staff-home-btn"
          onClick={() => navigate('/')}
          title="Return to Public Website (Home)"
          aria-label="Home"
        >
          <Home size={14} />
          <span className="staff-home-btn-text">Home</span>
        </button>

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

          {notifOpen && (() => {
            // Helper: relative time label
            const relTime = (iso: string) => {
              const diff = Date.now() - new Date(iso).getTime()
              const m = Math.floor(diff / 60000)
              if (m < 1) return 'Just now'
              if (m < 60) return `${m}m ago`
              const h = Math.floor(m / 60)
              if (h < 24) return `${h}h ago`
              return `${Math.floor(h / 24)}d ago`
            }

            // Helper: type config
            const typeConfig = (type: string) => {
              switch (type) {
                case 'ALERT': return { icon: AlertTriangle, bg: '#fff7ed', border: '#fb923c', iconColor: '#ea580c', badgeBg: '#fee2e2', badgeColor: '#b91c1c', label: 'Alert' }
                case 'INFO':  return { icon: Info,           bg: '#eff6ff', border: '#60a5fa', iconColor: '#2563eb', badgeBg: '#dbeafe', badgeColor: '#1d4ed8', label: 'Info' }
                case 'QUEUE': return { icon: Zap,            bg: '#fdf4ff', border: '#c084fc', iconColor: '#9333ea', badgeBg: '#f3e8ff', badgeColor: '#7e22ce', label: 'Queue' }
                default:      return { icon: CheckCircle2,  bg: '#f0fdf4', border: '#4ade80', iconColor: '#16a34a', badgeBg: '#dcfce7', badgeColor: '#166534', label: 'System' }
              }
            }

            const isToday = (iso: string) => {
              const d = new Date(iso)
              const n = new Date()
              return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
            }

            const todayNotifs   = notifications.filter(n => isToday(n.created_at))
            const earlierNotifs = notifications.filter(n => !isToday(n.created_at))

            const renderNotif = (n: typeof notifications[0]) => {
              const cfg = typeConfig(n.type)
              const IconComp = cfg.icon
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    markStaffNotificationRead(n.id)
                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item))
                  }}
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #f1f5f9',
                    background: n.is_read ? '#ffffff' : cfg.bg,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    borderLeft: `3px solid ${n.is_read ? 'transparent' : cfg.border}`,
                    transition: 'background 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* Left icon */}
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: n.is_read ? '#f1f5f9' : cfg.badgeBg,
                    display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: '1px',
                  }}>
                    <IconComp size={14} color={n.is_read ? '#94a3b8' : cfg.iconColor} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <strong style={{
                        color: n.is_read ? '#64748b' : '#0f172a',
                        fontSize: '12.5px', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {n.title}
                      </strong>
                      <span style={{
                        fontSize: '9px', fontWeight: 800, padding: '1px 5px',
                        borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: n.is_read ? '#f1f5f9' : cfg.badgeBg,
                        color: n.is_read ? '#94a3b8' : cfg.badgeColor,
                        flexShrink: 0,
                      }}>
                        {cfg.label}
                      </span>
                    </div>

                    <p style={{ color: '#475569', margin: '0 0 5px', lineHeight: 1.45, fontSize: '11.5px' }}>
                      {n.message}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
                        {relTime(n.created_at)}
                      </span>
                      {!n.is_read && (
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: cfg.iconColor, display: 'inline-block', flexShrink: 0,
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Dismiss X */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setNotifications(prev => prev.filter(item => item.id !== n.id))
                    }}
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#cbd5e1', padding: '2px', borderRadius: '4px',
                      display: 'flex', alignItems: 'center',
                      opacity: 0.6,
                    }}
                    title="Dismiss"
                  >
                    <X size={11} />
                  </button>
                </div>
              )
            }

            return (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  left: 'auto',
                  width: '380px',
                  maxWidth: '95vw',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06)',
                  zIndex: 9999,
                  overflow: 'hidden',
                }}
              >
                {/* Panel Header */}
                <div style={{
                  padding: '14px 16px',
                  background: 'linear-gradient(135deg, #064e3b 0%, #0d631b 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
                      <Bell size={15} />
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', fontWeight: 800, display: 'block', lineHeight: 1.2 }}>
                        Centre Alerts & Notices
                      </strong>
                      <span style={{ fontSize: '10.5px', opacity: 0.75 }}>
                        {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                        {unreadCount > 0 ? ` · ${unreadCount} unread` : ' · All read'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'rgba(255,255,255,0.18)',
                          border: '1px solid rgba(255,255,255,0.25)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      style={{
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        width: '26px', height: '26px',
                        display: 'grid', placeItems: 'center',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Notification Body */}
                <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px 16px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: '#f1f5f9', display: 'grid', placeItems: 'center',
                        margin: '0 auto 12px',
                      }}>
                        <Bell size={24} color="#cbd5e1" />
                      </div>
                      <strong style={{ display: 'block', fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                        All Caught Up
                      </strong>
                      <span style={{ fontSize: '12px' }}>No pending alerts or notices for this centre.</span>
                    </div>
                  ) : (
                    <>
                      {todayNotifs.length > 0 && (
                        <>
                          <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#f8fafc' }}>
                            Today
                          </div>
                          {todayNotifs.map(renderNotif)}
                        </>
                      )}
                      {earlierNotifs.length > 0 && (
                        <>
                          <div style={{ padding: '8px 14px 4px', fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', background: '#f8fafc' }}>
                            Earlier
                          </div>
                          {earlierNotifs.map(renderNotif)}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid #f1f5f9',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {unreadCount > 0
                        ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
                        : 'No unread alerts'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setNotifOpen(false); navigate(isCentreAdminPortal ? '/centre-admin/reports' : isAdminPortal ? '/admin/reports' : '/staff/reports') }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11.5px',
                        color: '#0d631b',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      View Reports →
                    </button>
                  </div>
                )}
              </div>
            )
          })()}

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
