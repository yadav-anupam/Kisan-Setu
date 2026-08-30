import { useState, useEffect } from 'react'
import {
  BarChart3,
  Calendar,
  Clock,
  History,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import { logoutStaffUser, getStaffAuthSession, type StaffProfile } from '../../services/staffDataService'

export type StaffNavTab =
  | 'dashboard'
  | 'scanner'
  | 'bookings'
  | 'queue'
  | 'slots'
  | 'farmers'
  | 'management'
  | 'history'
  | 'reports'
  | 'profile'
  | 'settings'

interface StaffSidebarProps {
  activeTab: StaffNavTab
  isOpen: boolean
  onClose: () => void
}

export default function StaffSidebar({ activeTab, isOpen, onClose }: StaffSidebarProps) {
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(getStaffAuthSession())
    }
    window.addEventListener('kisan_setu_staff_profile_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_staff_profile_updated', handleUpdate)
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from the Staff Portal?')) {
      logoutStaffUser()
      navigate('/staff/login')
    }
  }

  const handleNav = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fd-sidebar-backdrop" onClick={onClose} />}

      {/* Main Staff Sidebar */}
      <aside className={`fd-sidebar ${isOpen ? 'open mobile-open' : ''}`}>
        {/* Header Branding Box */}
        <div
          className="fd-sidebar-header-box"
          style={{ background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)', padding: '16px 14px', marginBottom: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <a
              href="/"
              className="fd-brand-link"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', minWidth: 0 }}
            >
              <img
                src={logoImg}
                alt="Kisan Setu"
                style={{
                  height: '36px',
                  width: '36px',
                  objectFit: 'contain',
                  background: '#ffffff',
                  borderRadius: '9px',
                  padding: '3px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '16px',
                    fontWeight: 800,
                    margin: 0,
                    color: '#ffffff',
                    lineHeight: 1.15,
                    letterSpacing: '-0.2px',
                  }}
                >
                  Kisan Setu
                </h1>
                <p style={{ fontSize: '10.5px', color: '#bbf7d0', margin: '2px 0 0', fontWeight: 600 }}>
                  Staff Operations Portal
                </p>
              </div>
            </a>

            {isOpen && (
              <button
                type="button"
                className="fd-sidebar-close-btn"
                onClick={onClose}
                aria-label="Close sidebar"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '8px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} color="#86efac" style={{ flexShrink: 0 }} />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '11px',
                color: '#ffffff',
              }}
              title={staff.centre_name}
            >
              {staff.centre_name || 'Chiraigaon 1st at Gaurakala (FCS)'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="fd-nav-list" style={{ overflowY: 'auto', flex: 1, paddingBottom: '16px' }}>
          {/* Section: Operations */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '12px 16px 4px',
            }}
          >
            Operations
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Staff Dashboard</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/qr-verification')}
          >
            <QrCode size={17} />
            <span>QR Verification</span>
            <span
              style={{
                background: '#22c55e',
                color: '#ffffff',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                marginLeft: 'auto',
              }}
            >
              SCAN
            </span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/bookings')}
          >
            <Calendar size={17} />
            <span>Centre Bookings</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/queue')}
          >
            <Clock size={17} />
            <span>Queue Management</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'slots' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/slots')}
          >
            <Clock size={17} />
            <span>Slot Management</span>
          </button>

          {/* Section: Management */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '16px 16px 4px',
            }}
          >
            Management
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/farmers')}
          >
            <Users size={17} />
            <span>Farmers Directory</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'management' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/management')}
          >
            <ShieldCheck size={17} />
            <span>Staff &amp; Officers</span>
            <span
              style={{
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: '9px',
                fontWeight: 800,
                padding: '1px 5px',
                borderRadius: '4px',
                marginLeft: 'auto',
              }}
            >
              ADMIN
            </span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/verification-history')}
          >
            <History size={17} />
            <span>Verification Audit</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/reports')}
          >
            <BarChart3 size={17} />
            <span>Operational Reports</span>
          </button>

          {/* Section: Account & Settings */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '16px 16px 4px',
            }}
          >
            Account
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/profile')}
          >
            <User size={17} />
            <span>Staff Profile</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/settings')}
          >
            <Settings size={17} />
            <span>Terminal Settings</span>
          </button>
        </nav>

        {/* Footer Logout Button */}
        <div
          style={{
            marginTop: 'auto',
            flexShrink: 0,
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 14px',
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2'
              e.currentTarget.style.borderColor = '#fca5a5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fef2f2'
              e.currentTarget.style.borderColor = '#fecaca'
            }}
          >
            <LogOut size={16} color="#dc2626" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>
    </>
  )
}
