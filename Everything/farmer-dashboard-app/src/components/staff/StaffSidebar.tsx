import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  ShieldCheck,
  User,
  X,
  Scale,
  Sparkles,
  LifeBuoy,
  Megaphone,
  IndianRupee,
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
  | 'weighment'
  | 'quality'
  | 'payments'
  | 'announcements'
  | 'farmers'
  | 'history'
  | 'reports'
  | 'management'
  | 'prices'
  | 'centres'
  | 'profile'
  | 'settings'
  | 'support'
  | 'help'
  | 'grievance'

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
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: '1.2',
                    margin: 0,
                    letterSpacing: '-0.2px',
                  }}
                >
                  Kisan Setu
                </h1>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    color: '#86efac',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  MANDI FIELD OPERATIONS
                </span>
              </div>
            </a>

            {isOpen && (
              <button
                type="button"
                className="fd-sidebar-close"
                onClick={onClose}
                aria-label="Close sidebar"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
          {/* Section: Gate Operations (Available to Gate Staff & Operators) */}
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
            Gate &amp; Operations
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
            <span>QR Gate Verification</span>
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
            className={`fd-nav-item ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/queue')}
          >
            <Clock size={17} />
            <span>Yard Queue Callboard</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/bookings')}
          >
            <Calendar size={17} />
            <span>Today's Bookings</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'slots' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/slots')}
          >
            <Clock size={17} />
            <span>Slot Timetable</span>
          </button>

          {/* Section: Intake Workstations (Operator / Admin Level Authority Only) */}
          {(staff.role === 'CENTRE_OPERATOR' || staff.role === 'MANDI_ADMIN' || (staff as any).role === 'CENTRE_ADMIN' || (staff as any).role === 'ADMIN') && (
            <>
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
                Intake Workstations (Operator)
              </div>

              <button
                type="button"
                className={`fd-nav-item ${activeTab === 'weighment' ? 'active' : ''}`}
                onClick={() => handleNav('/staff/weighment')}
              >
                <Scale size={17} />
                <span>Weighbridge Gross &amp; Tare</span>
              </button>

              <button
                type="button"
                className={`fd-nav-item ${activeTab === 'quality' ? 'active' : ''}`}
                onClick={() => handleNav('/staff/quality-check')}
              >
                <Sparkles size={17} />
                <span>Grain Moisture &amp; Quality</span>
              </button>

              <button
                type="button"
                className={`fd-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => handleNav('/staff/payments')}
              >
                <IndianRupee size={17} />
                <span>DBT Payment Vouchers</span>
              </button>
            </>
          )}

          {/* Section: Broadcast & Support */}
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
            Communication &amp; Support
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/announcements')}
          >
            <Megaphone size={17} />
            <span>Yard Announcements</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'support' || activeTab === 'help' || activeTab === 'grievance' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/help-support')}
          >
            <LifeBuoy size={17} />
            <span>Grievance Helpdesk</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleNav('/staff/profile')}
          >
            <User size={17} />
            <span>Staff Profile</span>
          </button>

          {(staff.role === 'CENTRE_OPERATOR' || staff.role === 'MANDI_ADMIN' || (staff as any).role === 'CENTRE_ADMIN' || (staff as any).role === 'ADMIN') && (
            <button
              type="button"
              className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleNav('/staff/settings')}
            >
              <Settings size={17} />
              <span>Terminal Settings</span>
            </button>
          )}
        </nav>

        {/* Footer User Info & Logout */}
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
          {/* Staff Profile Card */}
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
              {staff.full_name?.charAt(0) || 'S'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {staff.full_name || 'Staff Officer'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {staff.designation?.split('&')[0] || staff.role} • {staff.staff_id}
              </div>
            </div>
          </div>

          <button
            type="button"
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
              boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)',
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} color="#dc2626" />
            <span>Sign Out Desk</span>
          </button>
        </div>
      </aside>
    </>
  )
}
