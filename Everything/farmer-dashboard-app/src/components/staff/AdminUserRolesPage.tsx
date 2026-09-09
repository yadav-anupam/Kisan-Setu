import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Save,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'
import './AdminUserRolesPage.css'

interface PermissionItem {
  id: string
  name: string
  category: 'Operations' | 'Finance & DBT' | 'Master Config' | 'Security & Audit'
  description: string
  roles: {
    ADMIN: boolean
    CENTRE_ADMIN: boolean
    STAFF: boolean
    AUDITOR: boolean
  }
}

const defaultPermissions: PermissionItem[] = [
  {
    id: 'perm-gate-scan',
    name: 'QR Gate Pass Verification',
    category: 'Operations',
    description: 'Scan digital farmer QR tokens, verify vehicle registration and biometric gate entry.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: true, AUDITOR: false },
  },
  {
    id: 'perm-scale-tare',
    name: 'Weighbridge Gross & Tare Capture',
    category: 'Operations',
    description: 'Interface with electronic weighbridge indicators to capture gross and tare weight.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: true, AUDITOR: false },
  },
  {
    id: 'perm-quality-analysis',
    name: 'Quality Inspection & Moisture Grading',
    category: 'Operations',
    description: 'Record moisture %, foreign matter deduction, and approve/reject commodity lots.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: true, AUDITOR: false },
  },
  {
    id: 'perm-voucher-gen',
    name: 'Issue J-Form Procurement Vouchers',
    category: 'Operations',
    description: 'Generate legal MSP purchase receipts and sign procurement certificates.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: false, AUDITOR: false },
  },
  {
    id: 'perm-dbt-batch-auth',
    name: 'Authorize Direct DBT Payment Batches',
    category: 'Finance & DBT',
    description: 'Digitally approve Aadhaar-linked NPCI/PFMS direct bank transfers to farmers.',
    roles: { ADMIN: true, CENTRE_ADMIN: false, STAFF: false, AUDITOR: false },
  },
  {
    id: 'perm-price-override',
    name: 'Modify MSP & Bonus Support Prices',
    category: 'Finance & DBT',
    description: 'Update government MSP rates, center bonus per quintal, and mandi cess rates.',
    roles: { ADMIN: true, CENTRE_ADMIN: false, STAFF: false, AUDITOR: false },
  },
  {
    id: 'perm-centre-provision',
    name: 'Provision & Verify Procurement Centres',
    category: 'Master Config',
    description: 'Add new APMC mandis, configure geo-fence coordinates, and register weighbridges.',
    roles: { ADMIN: true, CENTRE_ADMIN: false, STAFF: false, AUDITOR: false },
  },
  {
    id: 'perm-staff-mgmt',
    name: 'Manage Staff Credentials & Roles',
    category: 'Security & Audit',
    description: 'Create field operator accounts, reassign centres, and reset security pins.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: false, AUDITOR: false },
  },
  {
    id: 'perm-audit-trail',
    name: 'Inspect System Audit Logs & CCTV Feeds',
    category: 'Security & Audit',
    description: 'View immutable system change logs, weight override trails, and surveillance.',
    roles: { ADMIN: true, CENTRE_ADMIN: true, STAFF: false, AUDITOR: true },
  },
]

export default function AdminUserRolesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [permissions, setPermissions] = useState<PermissionItem[]>(defaultPermissions)
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'ADMIN' | 'CENTRE_ADMIN' | 'STAFF' | 'AUDITOR'>('ALL')
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/users-roles')
      navigate('/admin/login')
      return
    }
    setStaff(getStaffAuthSession())
  }, [])

  const toggleRolePermission = (permId: string, roleKey: 'ADMIN' | 'CENTRE_ADMIN' | 'STAFF' | 'AUDITOR') => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id === permId) {
          return {
            ...p,
            roles: {
              ...p.roles,
              [roleKey]: !p.roles[roleKey],
            },
          }
        }
        return p
      })
    )
  }

  const handleSaveMatrix = () => {
    setToastMessage('Role-Based Access Control (RBAC) security matrix successfully applied statewide.')
    setTimeout(() => setToastMessage(''), 4000)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all RBAC permissions back to standard government security defaults?')) {
      setPermissions(defaultPermissions)
      setToastMessage('Permissions reset to official baseline defaults.')
      setTimeout(() => setToastMessage(''), 4000)
    }
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="staff"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="User Roles &amp; Security Permissions Matrix"
        />

        <main className="admin-rbac-container">
          {/* Header Controls */}
          <div className="admin-rbac-header-row">
            <div className="admin-rbac-header-info">
              <div className="admin-rbac-title-badge">
                <ShieldCheck size={14} /> Security Governance Matrix
              </div>
              <h1 className="admin-rbac-title">
                Role-Based Access Control (RBAC)
              </h1>
              <p className="admin-rbac-desc">
                Configure fine-grained operational authorities across Platform Admins, Centre Superintendents, Field Operators, and Vigilance Auditors.
              </p>
            </div>

            <div className="admin-rbac-actions">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="admin-rbac-btn-reset"
              >
                <RotateCcw size={15} /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveMatrix}
                className="admin-rbac-btn-save"
              >
                <Save size={15} /> Save &amp; Enforce Permissions
              </button>
            </div>
          </div>

          {toastMessage && (
            <div className="admin-rbac-toast">
              <CheckCircle2 size={18} color="#059669" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Role Filter Tabs */}
          <div className="admin-rbac-tabs-bar">
            {[
              { key: 'ALL', label: 'All Roles (Matrix View)' },
              { key: 'ADMIN', label: 'Platform & State Admins' },
              { key: 'CENTRE_ADMIN', label: 'Centre Superintendents' },
              { key: 'STAFF', label: 'Field Operators / Scale Staff' },
              { key: 'AUDITOR', label: 'Vigilance & Audit Officers' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedRole(tab.key as any)}
                className={`admin-rbac-tab-btn ${selectedRole === tab.key ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* RBAC Table Matrix */}
          <div className="admin-rbac-card">
            <div className="admin-rbac-table-wrap">
              <table className="admin-rbac-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Security Capability / Action</th>
                    <th style={{ width: '15%' }}>Category</th>
                    {(selectedRole === 'ALL' || selectedRole === 'ADMIN') && (
                      <th className="center">Platform Admin</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'CENTRE_ADMIN') && (
                      <th className="center">Centre Admin</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'STAFF') && (
                      <th className="center">Field Staff</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'AUDITOR') && (
                      <th className="center">Auditor</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => {
                    const catClass =
                      p.category === 'Operations'
                        ? 'operations'
                        : p.category === 'Finance & DBT'
                        ? 'finance'
                        : p.category === 'Master Config'
                        ? 'master'
                        : 'security'

                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="admin-rbac-perm-title">{p.name}</div>
                          <div className="admin-rbac-perm-desc">{p.description}</div>
                        </td>

                        <td>
                          <span className={`admin-rbac-category-pill ${catClass}`}>
                            {p.category}
                          </span>
                        </td>

                        {(selectedRole === 'ALL' || selectedRole === 'ADMIN') && (
                          <td className="center">
                            <button
                              type="button"
                              onClick={() => toggleRolePermission(p.id, 'ADMIN')}
                              className={`admin-rbac-toggle-btn ${p.roles.ADMIN ? 'admin-on' : 'off'}`}
                              title={p.roles.ADMIN ? 'Platform Admin: Enabled' : 'Platform Admin: Disabled'}
                            >
                              {p.roles.ADMIN ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                            </button>
                          </td>
                        )}

                        {(selectedRole === 'ALL' || selectedRole === 'CENTRE_ADMIN') && (
                          <td className="center">
                            <button
                              type="button"
                              onClick={() => toggleRolePermission(p.id, 'CENTRE_ADMIN')}
                              className={`admin-rbac-toggle-btn ${p.roles.CENTRE_ADMIN ? 'centre-on' : 'off'}`}
                              title={p.roles.CENTRE_ADMIN ? 'Centre Admin: Enabled' : 'Centre Admin: Disabled'}
                            >
                              {p.roles.CENTRE_ADMIN ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                            </button>
                          </td>
                        )}

                        {(selectedRole === 'ALL' || selectedRole === 'STAFF') && (
                          <td className="center">
                            <button
                              type="button"
                              onClick={() => toggleRolePermission(p.id, 'STAFF')}
                              className={`admin-rbac-toggle-btn ${p.roles.STAFF ? 'staff-on' : 'off'}`}
                              title={p.roles.STAFF ? 'Field Staff: Enabled' : 'Field Staff: Disabled'}
                            >
                              {p.roles.STAFF ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                            </button>
                          </td>
                        )}

                        {(selectedRole === 'ALL' || selectedRole === 'AUDITOR') && (
                          <td className="center">
                            <button
                              type="button"
                              onClick={() => toggleRolePermission(p.id, 'AUDITOR')}
                              className={`admin-rbac-toggle-btn ${p.roles.AUDITOR ? 'auditor-on' : 'off'}`}
                              title={p.roles.AUDITOR ? 'Auditor: Enabled' : 'Auditor: Disabled'}
                            >
                              {p.roles.AUDITOR ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
