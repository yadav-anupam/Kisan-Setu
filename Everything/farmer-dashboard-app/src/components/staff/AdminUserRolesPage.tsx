import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Save,
  RotateCcw,
  Check,
  X,
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

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Role-Based Access Control (RBAC)
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Configure fine-grained operational authorities across Platform Admins, Centre Superintendents, Field Operators, and Vigilance Auditors.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResetDefaults}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} /> Reset Defaults
              </button>
              <button
                onClick={handleSaveMatrix}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
                }}
              >
                <Save size={15} /> Save &amp; Enforce Permissions
              </button>
            </div>
          </div>

          {toastMessage && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                padding: '14px 18px',
                borderRadius: '8px',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Role Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '20px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
            }}
          >
            {[
              { key: 'ALL', label: 'All Roles (Matrix View)' },
              { key: 'ADMIN', label: 'Platform & State Admins' },
              { key: 'CENTRE_ADMIN', label: 'Centre Superintendents' },
              { key: 'STAFF', label: 'Field Operators / Scale Staff' },
              { key: 'AUDITOR', label: 'Vigilance & Audit Officers' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedRole(tab.key as any)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: selectedRole === tab.key ? 700 : 500,
                  border: 'none',
                  background: selectedRole === tab.key ? '#1e3a8a' : '#f1f5f9',
                  color: selectedRole === tab.key ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* RBAC Table Matrix */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '14px 18px', width: '40%' }}>Security Capability / Action</th>
                    <th style={{ padding: '14px 18px', width: '15%' }}>Category</th>
                    {(selectedRole === 'ALL' || selectedRole === 'ADMIN') && (
                      <th style={{ padding: '14px 18px', textAlign: 'center' }}>Platform Admin</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'CENTRE_ADMIN') && (
                      <th style={{ padding: '14px 18px', textAlign: 'center' }}>Centre Admin</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'STAFF') && (
                      <th style={{ padding: '14px 18px', textAlign: 'center' }}>Field Staff</th>
                    )}
                    {(selectedRole === 'ALL' || selectedRole === 'AUDITOR') && (
                      <th style={{ padding: '14px 18px', textAlign: 'center' }}>Auditor</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.description}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {p.category}
                        </span>
                      </td>

                      {(selectedRole === 'ALL' || selectedRole === 'ADMIN') && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleRolePermission(p.id, 'ADMIN')}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: p.roles.ADMIN ? '#dbeafe' : '#f1f5f9',
                              color: p.roles.ADMIN ? '#1d4ed8' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {p.roles.ADMIN ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                          </button>
                        </td>
                      )}

                      {(selectedRole === 'ALL' || selectedRole === 'CENTRE_ADMIN') && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleRolePermission(p.id, 'CENTRE_ADMIN')}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: p.roles.CENTRE_ADMIN ? '#dcfce7' : '#f1f5f9',
                              color: p.roles.CENTRE_ADMIN ? '#15803d' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {p.roles.CENTRE_ADMIN ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                          </button>
                        </td>
                      )}

                      {(selectedRole === 'ALL' || selectedRole === 'STAFF') && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleRolePermission(p.id, 'STAFF')}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: p.roles.STAFF ? '#fef3c7' : '#f1f5f9',
                              color: p.roles.STAFF ? '#b45309' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {p.roles.STAFF ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                          </button>
                        </td>
                      )}

                      {(selectedRole === 'ALL' || selectedRole === 'AUDITOR') && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleRolePermission(p.id, 'AUDITOR')}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: 'none',
                              background: p.roles.AUDITOR ? '#f3e8ff' : '#f1f5f9',
                              color: p.roles.AUDITOR ? '#7e22ce' : '#94a3b8',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {p.roles.AUDITOR ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
