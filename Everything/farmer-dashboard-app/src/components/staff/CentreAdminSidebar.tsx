import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  LifeBuoy,
  LogOut,
  X,
  Building,
  QrCode,
  Clock,
  IndianRupee,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import { logoutStaffUser, getStaffAuthSession, type StaffProfile } from '../../services/staffDataService'

export type CentreAdminNavTab =
  | 'dashboard'
  | 'tokens'
  | 'queue'
  | 'procurement'
  | 'payments'
  | 'farmers'
  | 'staff'
  | 'reports'
  | 'audit-logs'
  | 'settings'
  | 'support'
  | string

interface CentreAdminSidebarProps {
  activeTab: CentreAdminNavTab
  isOpen: boolean
  onClose: () => void
}

export default function CentreAdminSidebar({ activeTab, isOpen, onClose }: CentreAdminSidebarProps) {
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(getStaffAuthSession())
    }
    window.addEventListener('kisan_setu_staff_profile_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_staff_profile_updated', handleUpdate)
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from the Centre Admin Portal?')) {
      logoutStaffUser()
      navigate('/centre-admin/login')
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

      {/* Main Centre Admin Sidebar */}
      <aside className={`fd-sidebar ${isOpen ? 'open mobile-open' : ''}`} style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        {/* Header Branding Box */}
        <div
          className="fd-sidebar-header-box"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #0d631b 50%, #15803d 100%)',
            padding: '16px 14px',
            marginBottom: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
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
                    color: '#a7f3d0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  CENTRE ADMIN DESK
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
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Assigned Centre Badge */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '7px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Building size={14} color="#86efac" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '10px', color: '#bbf7d0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Active Procurement Centre
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {staff.centre_name || 'Chiraigaon Mandi (FCS)'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="fd-nav-list" style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Section: Command Overview */}
          <div className="fd-nav-group-label" style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 10px 4px' }}>
            Operational Command
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'dashboard' || activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/dashboard')}
          >
            <LayoutDashboard size={17} />
            <span>Centre Command Desk</span>
            {(activeTab === 'dashboard' || activeTab === 'overview') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'slots' || activeTab === 'slot-management' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/slots')}
          >
            <Clock size={17} />
            <span>Procurement Slots</span>
            {(activeTab === 'slots' || activeTab === 'slot-management') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'tokens' || activeTab === 'token-management' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/token-management')}
          >
            <QrCode size={17} />
            <span>Token Dispatch</span>
            {(activeTab === 'tokens' || activeTab === 'token-management') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'queue' || activeTab === 'live-queue' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/live-queue')}
          >
            <Clock size={17} />
            <span>Live Yard Queue</span>
            {(activeTab === 'queue' || activeTab === 'live-queue') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'procurement' || activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/procurement')}
          >
            <IndianRupee size={17} />
            <span>DBT Batch Approvals</span>
            {(activeTab === 'procurement' || activeTab === 'payments') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          {/* Section: Governance & Personnel */}
          <div className="fd-nav-group-label" style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '14px 10px 4px' }}>
            Governance &amp; Personnel
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/farmers')}
          >
            <Users size={17} />
            <span>Registered Farmers</span>
            {activeTab === 'farmers' && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'staff' || activeTab === 'management' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/staff')}
          >
            <ShieldCheck size={17} />
            <span>Centre Staff Roster</span>
            {(activeTab === 'staff' || activeTab === 'management') ? (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            ) : (
              <span
                style={{
                  background: '#dcfce7',
                  color: '#166534',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '6px',
                  marginLeft: 'auto',
                }}
              >
                ACTIVE
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'reports' || activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/reports')}
          >
            <BarChart3 size={17} />
            <span>Centre Analytics</span>
            {(activeTab === 'reports' || activeTab === 'analytics') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'audit-logs' || activeTab === 'history' || activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/audit-logs')}
          >
            <History size={17} />
            <span>Audit Trail</span>
            {(activeTab === 'audit-logs' || activeTab === 'history' || activeTab === 'audit') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          {/* Section: Settings & Support */}
          <div className="fd-nav-group-label" style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '14px 10px 4px' }}>
            Settings &amp; Support
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/settings')}
          >
            <Settings size={17} />
            <span>Centre Settings</span>
            {activeTab === 'settings' && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'support' || activeTab === 'help' || activeTab === 'grievance' ? 'active' : ''}`}
            onClick={() => handleNav('/centre-admin/help-support')}
          >
            <LifeBuoy size={17} />
            <span>Farmer Help &amp; Grievances</span>
            {(activeTab === 'support' || activeTab === 'help' || activeTab === 'grievance') && (
              <span className="fd-nav-badge" style={{ background: '#22c55e', color: '#ffffff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
                CURRENT
              </span>
            )}
          </button>
        </nav>

        {/* User Card & Cross-Portal Switchers */}
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
          {/* User Info Badge */}
          <div
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0d631b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {staff.full_name?.charAt(0) || 'C'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {staff.full_name || 'Centre Superintendent'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: 600 }}>
                {staff.role} • {staff.staff_id}
              </div>
            </div>
          </div>

          {/* Logout Button */}
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
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} color="#dc2626" />
            <span>Sign Out Centre Admin</span>
          </button>
        </div>
      </aside>
    </>
  )
}
