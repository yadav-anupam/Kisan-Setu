import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Building2,
  IndianRupee,
  BadgeCheck,
  ShieldCheck,
  Users,
  History,
  BarChart3,
  Megaphone,
  LifeBuoy,
  Settings,
  LogOut,
  X,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import { logoutStaffUser, getStaffAuthSession, type StaffProfile } from '../../services/staffDataService'

export type AdminNavTab =
  | 'dashboard'
  | 'centres'
  | 'prices'
  | 'payments'
  | 'staff'
  | 'farmers'
  | 'history'
  | 'reports'
  | 'announcements'
  | 'support'
  | 'settings'
  | 'profile'

interface AdminSidebarProps {
  activeTab: AdminNavTab
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ activeTab, isOpen, onClose }: AdminSidebarProps) {
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  useEffect(() => {
    const handleUpdate = () => {
      setStaff(getStaffAuthSession())
    }
    window.addEventListener('kisan_setu_staff_profile_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_staff_profile_updated', handleUpdate)
  }, [])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out from the Administrative Command Center?')) {
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

      {/* Main Admin Sidebar */}
      <aside className={`fd-sidebar ${isOpen ? 'open mobile-open' : ''}`} style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>
        {/* Header Branding Box */}
        <div
          className="fd-sidebar-header-box"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%)',
            padding: '16px 14px',
            marginBottom: '6px',
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
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: '15.5px',
                    fontWeight: 800,
                    color: '#ffffff',
                    lineHeight: '1.2',
                    margin: 0,
                    letterSpacing: '-0.3px',
                  }}
                >
                  Kisan Setu
                </h1>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: '#c7d2fe',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  ADMINISTRATION DESK
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
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
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
            <ShieldCheck size={14} color="#a5b4fc" style={{ flexShrink: 0 }} />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '11px',
                color: '#ffffff',
                fontWeight: 700,
              }}
              title="State / Central Governance"
            >
              State &amp; Central Governance
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="fd-nav-list" style={{ overflowY: 'auto', flex: 1, paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {/* Section: Overview */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '10px 14px 4px',
            }}
          >
            Governance &amp; Policy
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/dashboard')}
            style={activeTab === 'dashboard' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <LayoutDashboard size={17} />
            <span>Admin Dashboard</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/prices')}
            style={activeTab === 'prices' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <IndianRupee size={17} />
            <span>MSP Price Master</span>
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
              GAZETTE
            </span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/payments')}
            style={activeTab === 'payments' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <BadgeCheck size={17} />
            <span>DBT Approvals &amp; Payouts</span>
          </button>

          {/* Section: Procurement Infrastructure */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '14px 14px 4px',
            }}
          >
            Procurement Infrastructure
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'centres' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/centres')}
            style={activeTab === 'centres' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <Building2 size={17} />
            <span>Procurement Centres</span>
          </button>

          <button
            type="button"
            className="fd-nav-item"
            style={{ paddingLeft: '34px', fontSize: '12.5px', color: '#4338ca', fontWeight: 700 }}
            onClick={() => handleNav('/admin/centres/add')}
          >
            <span>+ Provision New Centre</span>
          </button>

          <button
            type="button"
            className="fd-nav-item"
            style={{ paddingLeft: '34px', fontSize: '12px' }}
            onClick={() => handleNav('/admin/centres/verification')}
          >
            <span>Mandi Verification &amp; Audit</span>
          </button>

          <button
            type="button"
            className="fd-nav-item"
            style={{ paddingLeft: '34px', fontSize: '12px' }}
            onClick={() => handleNav('/admin/centres/categories')}
          >
            <span>Yard Tiers &amp; Classification</span>
          </button>

          {/* Section: Personnel & Users */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '14px 14px 4px',
            }}
          >
            Personnel &amp; Users
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/management')}
            style={activeTab === 'staff' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <ShieldCheck size={17} />
            <span>Staff &amp; Officers</span>
            <span
              style={{
                background: '#e0e7ff',
                color: '#3730a3',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: '4px',
                marginLeft: 'auto',
              }}
            >
              ROSTER
            </span>
          </button>

          <button
            type="button"
            className="fd-nav-item"
            style={{ paddingLeft: '34px', fontSize: '12px' }}
            onClick={() => handleNav('/admin/staff/departments')}
          >
            <span>Nodal Departments</span>
          </button>

          <button
            type="button"
            className="fd-nav-item"
            style={{ paddingLeft: '34px', fontSize: '12px' }}
            onClick={() => handleNav('/admin/users-roles')}
          >
            <span>RBAC &amp; Permissions</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'farmers' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/farmers')}
            style={activeTab === 'farmers' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <Users size={17} />
            <span>Farmers Directory</span>
          </button>

          {/* Section: Operations & Audit */}
          <div
            style={{
              fontSize: '10px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              color: '#94a3b8',
              padding: '14px 14px 4px',
            }}
          >
            Operations &amp; Audit
          </div>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/verification-history')}
            style={activeTab === 'history' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <History size={17} />
            <span>Verification Audit</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/reports')}
            style={activeTab === 'reports' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <BarChart3 size={17} />
            <span>District Macro Reports</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/announcements')}
            style={activeTab === 'announcements' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <Megaphone size={17} />
            <span>Yard Broadcasts</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/help-support')}
            style={activeTab === 'support' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <LifeBuoy size={17} />
            <span>Grievance Redressal</span>
          </button>

          <button
            type="button"
            className={`fd-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNav('/admin/system-settings')}
            style={activeTab === 'settings' ? { background: '#312e81', color: '#ffffff' } : {}}
          >
            <Settings size={17} />
            <span>System Settings</span>
          </button>
        </nav>

        {/* Portal Switcher & Footer */}
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
          {/* Admin User Info Card */}
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
                background: '#312e81',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {staff.full_name?.charAt(0) || 'A'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {staff.full_name || 'Dr. Arvind Sharma'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#4338ca', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {staff.role === 'ADMIN' ? 'State Administrator' : staff.role} • {staff.staff_id}
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
              transition: 'all 0.15s ease',
            }}
          >
            <LogOut size={14} color="#dc2626" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>
    </>
  )
}
