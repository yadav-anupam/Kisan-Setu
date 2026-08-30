import { useState, useRef, useEffect } from 'react'
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe2,
  Headphones,
  Info,
  Menu,
  ShieldCheck,
  Sprout,
  Users,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import {
  fetchNotificationsFromDB,
  markNotificationAsReadInDB,
  type DbFarmerNotification,
} from '../../services/supabaseDataService'
import FarmerSidebar from './FarmerSidebar'
import './FarmerDashboard.css'
import './FarmerNotificationsPage.css'

export interface NotificationItem {
  id: string
  title: string
  desc: string
  category: 'appointments' | 'queue' | 'payments' | 'procurement' | 'system'
  time: string
  isUnread: boolean
  isNew?: boolean
  linkText?: string
  linkTarget?: string
}

export default function FarmerNotificationsPage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [filterTab, setFilterTab] = useState<
    'all' | 'unread' | 'appointments' | 'payments' | 'procurement' | 'system'
  >('all')
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null)

  // Toggle Preferences
  const [pushEnabled, setPushEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/notifications')
      navigate('/login')
      return
    }
    let isMounted = true
    fetchNotificationsFromDB(farmer.farmerId || 'KS-FARM-2026-8942').then((records: DbFarmerNotification[]) => {
      if (isMounted && records) {
        const transformed: NotificationItem[] = records.map((r) => ({
          id: r.id,
          title: r.title,
          desc: r.message,
          category: r.category === 'PAYMENT' ? 'payments' : r.category === 'SLOT' ? 'appointments' : r.category === 'QUEUE' ? 'queue' : 'system',
          time: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUnread: !r.is_read,
          isNew: !r.is_read,
          linkText: r.category === 'PAYMENT' ? 'View DBT Ledger' : 'View Mandi Pass',
          linkTarget: r.category === 'PAYMENT' ? '/dbt-payments' : '/my-appointments',
        }))
        setNotifications(transformed)
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

  const unreadCount = notifications.filter((n) => n.isUnread).length

  const handleMarkAllRead = () => {
    notifications.forEach((n) => markNotificationAsReadInDB(n.id))
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false, isNew: false })))
    window.dispatchEvent(new CustomEvent('kisan_setu_notifs_updated', { detail: { unreadCount: 0 } }))
  }

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsReadInDB(item.id)
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, isUnread: false, isNew: false } : n))
    const remaining = updated.filter((n) => n.isUnread).length
    setNotifications(updated)
    window.dispatchEvent(new CustomEvent('kisan_setu_notifs_updated', { detail: { unreadCount: remaining } }))
    setSelectedNotif(item)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'unread' && !n.isUnread) return false
    if (filterTab === 'appointments' && n.category !== 'appointments' && n.category !== 'queue') return false
    if (filterTab === 'payments' && n.category !== 'payments') return false
    if (filterTab === 'procurement' && n.category !== 'procurement') return false
    if (filterTab === 'system' && n.category !== 'system') return false
    return true
  })

  const getCategoryIcon = (category: string) => {
    if (category === 'appointments') {
      return (
        <div className="nt-item-icon" style={{ background: '#e9f6e8', color: '#0d631b' }}>
          <CalendarCheck size={18} />
        </div>
      )
    }
    if (category === 'queue') {
      return (
        <div className="nt-item-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
          <Users size={18} />
        </div>
      )
    }
    if (category === 'payments') {
      return (
        <div className="nt-item-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
          <CreditCard size={18} />
        </div>
      )
    }
    if (category === 'procurement') {
      return (
        <div className="nt-item-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
          <Sprout size={18} />
        </div>
      )
    }
    return (
      <div className="nt-item-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
        <ShieldCheck size={18} />
      </div>
    )
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="notifications-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="notifications"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="nt-main-content">
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
              <h1>Notifications &amp; Alerts</h1>
            </div>
            <p>Stay updated with gate entry passes, queue updates, DBT payment credits and Mandi alerts.</p>
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
              onClick={handleMarkAllRead}
              aria-label="Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="fd-notif-dot" />}
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

        {/* 2-Column Content Grid: Feed (1fr), Right Widgets (320px) */}
        <section className="nt-content-grid">
          {/* Left Feed Panel */}
          <div className="nt-feed-panel">
            <div className="nt-feed-header">
              <div className="nt-tabs-list">
                <button
                  className={`nt-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  className={`nt-tab-btn ${filterTab === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilterTab('unread')}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  className={`nt-tab-btn ${filterTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setFilterTab('appointments')}
                >
                  Appointments ({notifications.filter((n) => n.category === 'appointments' || n.category === 'queue').length})
                </button>
                <button
                  className={`nt-tab-btn ${filterTab === 'payments' ? 'active' : ''}`}
                  onClick={() => setFilterTab('payments')}
                >
                  Payments ({notifications.filter((n) => n.category === 'payments').length})
                </button>
                <button
                  className={`nt-tab-btn ${filterTab === 'procurement' ? 'active' : ''}`}
                  onClick={() => setFilterTab('procurement')}
                >
                  Procurement ({notifications.filter((n) => n.category === 'procurement').length})
                </button>
                <button
                  className={`nt-tab-btn ${filterTab === 'system' ? 'active' : ''}`}
                  onClick={() => setFilterTab('system')}
                >
                  System ({notifications.filter((n) => n.category === 'system').length})
                </button>
              </div>

              {unreadCount > 0 && (
                <button className="nt-mark-read-btn" onClick={handleMarkAllRead}>
                  <CheckCircle2 size={14} /> Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="nt-list">
              {filteredNotifications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                  <Info size={32} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                  <p>No notifications found in this category.</p>
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    className={`nt-item ${item.isUnread ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(item)}
                  >
                    {getCategoryIcon(item.category)}

                    <div className="nt-item-body">
                      <div className="nt-item-title-row">
                        <strong>{item.title}</strong>
                        {item.isNew && (
                          <span
                            className="nt-item-badge"
                            style={{ background: '#dcfce7', color: '#166534' }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <p className="nt-item-desc">{item.desc}</p>
                    </div>

                    <div className="nt-item-meta">
                      <span className="nt-item-time">{item.time}</span>
                      {item.isUnread && <span className="nt-unread-dot" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <div className="nt-right-sidebar">
            {/* Notification Preferences */}
            <div className="nt-widget-card">
              <h3>Notification Settings</h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 14px' }}>
                Choose channels to receive token queue alerts and payment confirmations.
              </p>

              <div className="nt-toggle-row">
                <span>Push &amp; WhatsApp Alerts</span>
                <label className="nt-switch">
                  <input
                    type="checkbox"
                    checked={pushEnabled}
                    onChange={(e) => setPushEnabled(e.target.checked)}
                  />
                  <span className="nt-slider" />
                </label>
              </div>

              <div className="nt-toggle-row">
                <span>SMS Gate Pass Alerts</span>
                <label className="nt-switch">
                  <input
                    type="checkbox"
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                  />
                  <span className="nt-slider" />
                </label>
              </div>

              <div className="nt-toggle-row">
                <span>Monthly Email Statements</span>
                <label className="nt-switch">
                  <input
                    type="checkbox"
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                  />
                  <span className="nt-slider" />
                </label>
              </div>
            </div>

            {/* Helpline Assistance */}
            <div className="nt-widget-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Headphones size={18} color="#166534" />
                <strong style={{ fontSize: '14px', color: '#166534' }}>Need Help?</strong>
              </div>
              <p style={{ fontSize: '11.5px', color: '#15803d', margin: '0 0 12px' }}>
                Our 24x7 APMC Mandi grievance desk is ready to assist with queue delays or SMS updates.
              </p>
              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', borderColor: '#86efac' }}
                onClick={() => window.open('https://wa.me/919214334494', '_blank')}
              >
                Chat on WhatsApp Support →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          Notification Detail Action Modal
          ========================================================================== */}
      {selectedNotif && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '440px' }}>
            <div className="fd-modal-header">
              <h2>Notification Details</h2>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedNotif(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                {getCategoryIcon(selectedNotif.category)}
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>{selectedNotif.title}</strong>
                  <small style={{ color: '#64748b', display: 'block' }}>{selectedNotif.time}</small>
                </div>
              </div>

              <div style={{ background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '16px' }}>
                {selectedNotif.desc}
              </div>

              {selectedNotif.linkTarget && (
                <button
                  type="button"
                  className="fd-card-btn primary"
                  style={{ marginBottom: '8px' }}
                  onClick={() => {
                    const target = selectedNotif.linkTarget!
                    setSelectedNotif(null)
                    navigate(target)
                  }}
                >
                  {selectedNotif.linkText || 'Go to Section'} →
                </button>
              )}

              <button
                type="button"
                className="fd-card-btn secondary"
                onClick={() => setSelectedNotif(null)}
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
