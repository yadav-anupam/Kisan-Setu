import { useState, useEffect, useCallback } from 'react'
import {
  BadgeCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchAllAppointedStaff,
  appointStaffOfficer,
  updateStaffStatus,
  type StaffProfile,
  type StaffRole,
  type RegisteredStaffRecord,
} from '../../services/staffDataService'
import {
  ALL_PROCUREMENT_CENTRES,
  VARANASI_PROCUREMENT_CENTRES,
  CHANDAULI_PROCUREMENT_CENTRES,
  GHAZIPUR_PROCUREMENT_CENTRES,
  JAUNPUR_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [staffList, setStaffList] = useState<RegisteredStaffRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [appointModalOpen, setAppointModalOpen] = useState(false)

  // Appoint Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [role, setRole] = useState<StaffRole>('STAFF')
  const [selectedMandi, setSelectedMandi] = useState(
    currentStaff.centre_name || ALL_PROCUREMENT_CENTRES[0].centreName
  )
  const [designation, setDesignation] = useState('Weighbridge & Gate Verification Officer')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadStaff = useCallback(async () => {
    setIsLoading(true)
    const session = getStaffAuthSession()
    setCurrentStaff(session)
    try {
      const records = await fetchAllAppointedStaff()
      setStaffList(records)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/management')
      navigate('/staff/login')
      return
    }
    loadStaff()
  }, [loadStaff])

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole)
    if (newRole === 'MANDI_ADMIN') {
      setDesignation('Mandi Yard Administrator')
    } else if (newRole === 'CENTRE_OPERATOR') {
      setDesignation('Senior Mandi Inspector')
    } else {
      setDesignation('Weighbridge & Gate Verification Officer')
    }
  }

  const handleAppointSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    const matchedCentre =
      ALL_PROCUREMENT_CENTRES.find((c) => c.centreName === selectedMandi) || ALL_PROCUREMENT_CENTRES[0]

    try {
      const res = await appointStaffOfficer({
        full_name: fullName,
        email,
        mobile,
        role,
        centre_id: matchedCentre.id,
        centre_name: matchedCentre.centreName,
        designation,
        password,
        appointed_by: `${currentStaff.full_name} (${currentStaff.staff_id})`,
      })

      setIsSubmitting(false)
      if (res.success && res.staff) {
        setSuccessMsg(
          `Staff Officer ${res.staff.full_name} (${res.staff.staff_id}) successfully appointed with access.`
        )
        setFullName('')
        setEmail('')
        setMobile('')
        setPassword('')
        setAppointModalOpen(false)
        loadStaff()
        setTimeout(() => setSuccessMsg(''), 5000)
      } else {
        setFormError(res.message || 'Failed to appoint staff officer.')
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setFormError(err?.message || 'Error occurred while saving credentials.')
    }
  }

  const handleToggleStatus = async (officer: RegisteredStaffRecord) => {
    const nextStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const confirmMsg =
      nextStatus === 'INACTIVE'
        ? `Are you sure you want to suspend access for ${officer.full_name} (${officer.staff_id})?`
        : `Activate dashboard access for ${officer.full_name} (${officer.staff_id})?`

    if (window.confirm(confirmMsg)) {
      await updateStaffStatus(officer.staff_id, nextStatus)
      setStaffList((prev) =>
        prev.map((s) => (s.staff_id === officer.staff_id ? { ...s, status: nextStatus } : s))
      )
    }
  }

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      !searchQuery.trim() ||
      s.full_name.toLowerCase().includes(q) ||
      s.staff_id.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.centre_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Staff Appointment & Access Management"
        />

        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Staff &amp; Operator Access Directory
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Appoint official Mandi personnel, manage terminal access, and enforce role-based security.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAppointModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 20px',
                fontWeight: 700,
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
              }}
            >
              <UserPlus size={16} />
              Appoint New Staff Officer
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '20px',
                color: '#166534',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Search & Stats Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search staff by name, email, staff ID or Mandi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px 0 38px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                <Users size={16} /> Total Appointed: {staffList.length}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d631b', fontWeight: 700 }}>
                <UserCheck size={16} /> Active: {staffList.filter((s) => s.status === 'ACTIVE').length}
              </div>
              <button
                type="button"
                onClick={loadStaff}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Officers Table Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 18px' }}>Officer Details</th>
                    <th style={{ padding: '14px 18px' }}>Staff ID</th>
                    <th style={{ padding: '14px 18px' }}>Role &amp; Privilege</th>
                    <th style={{ padding: '14px 18px' }}>Assigned APMC Mandi</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                        Loading appointed staff records...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                        No staff officers match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((officer) => {
                      const isSelf = officer.staff_id === currentStaff.staff_id
                      const roleBadgeBg =
                        officer.role === 'MANDI_ADMIN'
                          ? '#fdf2f8'
                          : officer.role === 'CENTRE_OPERATOR'
                          ? '#eff6ff'
                          : '#f0fdf4'
                      const roleBadgeColor =
                        officer.role === 'MANDI_ADMIN'
                          ? '#9d174d'
                          : officer.role === 'CENTRE_OPERATOR'
                          ? '#1e40af'
                          : '#166534'
                      const roleBadgeBorder =
                        officer.role === 'MANDI_ADMIN'
                          ? '#fbcfe8'
                          : officer.role === 'CENTRE_OPERATOR'
                          ? '#bfdbfe'
                          : '#bbf7d0'

                      return (
                        <tr key={officer.staff_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  background: '#f1f5f9',
                                  color: '#0d631b',
                                  display: 'grid',
                                  placeItems: 'center',
                                  fontWeight: 800,
                                  fontSize: '14px',
                                }}
                              >
                                {officer.full_name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>
                                  {officer.full_name} {isSelf && <span style={{ fontSize: '11px', color: '#0d631b' }}>(You)</span>}
                                </strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                  {officer.email || `${officer.staff_id.toLowerCase()}@fcs.up.gov.in`} • {officer.mobile}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                            {officer.staff_id}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                background: roleBadgeBg,
                                color: roleBadgeColor,
                                border: `1px solid ${roleBadgeBorder}`,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'inline-block',
                              }}
                            >
                              {officer.designation || officer.role}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12.5px' }}>
                            {officer.centre_name}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                background: officer.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                color: officer.status === 'ACTIVE' ? '#166534' : '#991b1b',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {officer.status === 'ACTIVE' ? '● Active Access' : '○ Suspended'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(officer)}
                                style={{
                                  background: officer.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                                  color: officer.status === 'ACTIVE' ? '#b91c1c' : '#166534',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                {officer.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================================
          Appoint New Staff Officer Modal
          ====================================================================== */}
      {appointModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', color: '#0d631b', display: 'grid', placeItems: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Appoint Official Staff Officer
                  </h2>
                  <small style={{ color: '#64748b' }}>Provision government email &amp; dashboard credentials</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppointModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAppointSubmit} style={{ padding: '24px' }}>
              {formError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    fontWeight: 600,
                  }}
                >
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Verma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Government Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. amit.verma@fcs.up.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Official Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Assigned Role &amp; Access Level *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="STAFF">Weighbridge &amp; Gate Staff</option>
                    <option value="CENTRE_OPERATOR">Senior Mandi Inspector</option>
                    <option value="MANDI_ADMIN">Mandi Administrator</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  Assigned APMC Procurement Mandi *
                </label>
                <select
                  value={selectedMandi}
                  onChange={(e) => setSelectedMandi(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <optgroup label="Varanasi District (43 Centres)">
                    {VARANASI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chandauli District (5 Centres)">
                    {CHANDAULI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ghazipur District (5 Centres)">
                    {GHAZIPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Jaunpur District (5 Centres)">
                    {JAUNPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  Set Security Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters (e.g. Pass@2026)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  fontSize: '12px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={16} color="#0d631b" />
                <span>Password will be stored with SHA-256 cryptographic hashing in the government central registry.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAppointModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0d631b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <BadgeCheck size={16} />
                  {isSubmitting ? 'Authorizing & Appointing...' : 'Appoint & Authorize Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
