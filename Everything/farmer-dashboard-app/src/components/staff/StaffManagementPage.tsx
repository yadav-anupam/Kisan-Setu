import { useState, useEffect, useCallback } from 'react'
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  DoorOpen,
  Grid,
  IndianRupee,
  Landmark,
  Layers,
  LayoutList,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
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
  getAllProcurementCentresList,
  type StaffProfile,
  type StaffRole,
  type StaffSection,
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
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'
import './StaffManagementPage.css'

interface SectionMeta {
  id: StaffSection
  title: string
  shortTitle: string
  icon: typeof DoorOpen
  color: string
  bg: string
  border: string
  description: string
  responsibilities: string[]
}

const MANDI_SECTIONS: SectionMeta[] = [
  {
    id: 'GATE_INTAKE',
    title: 'Gate & Intake Control Section',
    shortTitle: 'Gate & Intake',
    icon: DoorOpen,
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    description: 'Vehicle entry toll, digital QR gate pass vetting, biometric check-in & token dispatch.',
    responsibilities: ['Entry Gate Scans', 'Token Dispensing', 'Vehicle Queue Marshalling'],
  },
  {
    id: 'WEIGHMENT_ASSAY',
    title: 'Weighbridge & Quality Assay Section',
    shortTitle: 'Weighment & Assay',
    icon: Scale,
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    description: 'Gross and tare weighbridge calibration, electronic grain moisture testing (<12%) & QA assay.',
    responsibilities: ['Gross/Tare Weighment', 'Moisture Content Assay', 'Grain Refraction & Grading'],
  },
  {
    id: 'PROCUREMENT_DBT',
    title: 'Procurement & DBT Accounts Section',
    shortTitle: 'Procurement & DBT',
    icon: IndianRupee,
    color: '#b45309',
    bg: '#fefce8',
    border: '#fde047',
    description: 'Electronic J-Form acceptance, godown stack allocation, PFMS beneficiary verification & DBT clearance.',
    responsibilities: ['J-Form Bill Generation', 'Bag Stacking Logs', 'PFMS / Aadhaar DBT Approvals'],
  },
  {
    id: 'ADMIN_GRIEVANCE',
    title: 'Administration & Grievance Cell',
    shortTitle: 'Admin & Grievance',
    icon: Landmark,
    color: '#7e22ce',
    bg: '#faf5ff',
    border: '#e9d5ff',
    description: 'Mandi Superintendent command, farmer grievance resolution, staff duty rosters & audit logs.',
    responsibilities: ['Centre Command', 'Farmer Dispute Redressal', 'Security & Compliance Audits'],
  },
]

export default function StaffManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [currentStaff, setCurrentStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [staffList, setStaffList] = useState<RegisteredStaffRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [appointModalOpen, setAppointModalOpen] = useState(false)

  // Filters
  const [selectedMandiFilter, setSelectedMandiFilter] = useState<string>('ALL')
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'SECTION_GROUPED' | 'TABLE'>('SECTION_GROUPED')

  // Appoint Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [role, setRole] = useState<StaffRole>('STAFF')
  const [formMandi, setFormMandi] = useState(
    currentStaff.centre_name || ALL_PROCUREMENT_CENTRES[0].centreName
  )
  const [formSection, setFormSection] = useState<StaffSection>('GATE_INTAKE')
  const [designation, setDesignation] = useState('Gate Entry & QR Verification Officer')
  const [shift, setShift] = useState('Morning Shift (06:00 - 14:00)')
  const [deskAssigned, setDeskAssigned] = useState('Gate 1 Entry Booth')
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
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || (isAdmin ? '/admin/staff' : isCentreAdmin ? '/centre-admin/staff' : '/staff/management'))
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }
    loadStaff()

    const handleUpdate = () => loadStaff()
    window.addEventListener('kisan_setu_staff_vault_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('kisan_setu_staff_vault_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [loadStaff, pathname, isCentreAdmin, isAdmin])

  // Handle Section Change in Appoint Form
  const handleFormSectionChange = (newSec: StaffSection) => {
    setFormSection(newSec)
    if (newSec === 'GATE_INTAKE') {
      setRole('STAFF')
      setDesignation('Gate Entry & QR Verification Officer')
      setDeskAssigned('Gate 1 Entry Booth')
      setShift('Morning Shift (06:00 - 14:00)')
    } else if (newSec === 'WEIGHMENT_ASSAY') {
      setRole('CENTRE_OPERATOR')
      setDesignation('Weighbridge In-Charge & Scale Operator')
      setDeskAssigned('Gross/Tare Weighbridge #1')
      setShift('General Shift (08:00 - 17:00)')
    } else if (newSec === 'PROCUREMENT_DBT') {
      setRole('CENTRE_OPERATOR')
      setDesignation('J-Form Billing & Stacking Officer')
      setDeskAssigned('J-Form Generation Counter #3')
      setShift('General Shift (09:00 - 18:00)')
    } else if (newSec === 'ADMIN_GRIEVANCE') {
      setRole('MANDI_ADMIN')
      setDesignation('APMC Grievance & Farmer Helpdesk Officer')
      setDeskAssigned('Grievance Redressal Cell')
      setShift('General Shift (08:30 - 17:00)')
    }
  }

  const isSuperAdmin = (currentStaff.role === 'ADMIN' && isAdmin)
  const currentMandiName = currentStaff.centre_name || 'Chiraigaon 1st at Gaurakala (FCS)'

  const handleAppointSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    const targetCentreName = isSuperAdmin ? formMandi : currentMandiName
    const matchedCentre =
      ALL_PROCUREMENT_CENTRES.find((c) => c.centreName.toLowerCase() === targetCentreName.toLowerCase()) ||
      ALL_PROCUREMENT_CENTRES[0]

    const centreIdToUse = isSuperAdmin ? matchedCentre.id : (currentStaff.centre_id || matchedCentre.id)
    const centreNameToUse = isSuperAdmin ? matchedCentre.centreName : currentMandiName

    try {
      const res = await appointStaffOfficer({
        full_name: fullName,
        email,
        mobile,
        role,
        centre_id: centreIdToUse,
        centre_name: centreNameToUse,
        designation,
        section: formSection,
        shift,
        desk_assigned: deskAssigned,
        password,
        appointed_by: `${currentStaff.full_name} (${currentStaff.staff_id})`,
      })

      setIsSubmitting(false)
      if (res.success && res.staff) {
        setSuccessMsg(
          `Staff Officer ${res.staff.full_name} (${res.staff.staff_id}) successfully appointed in ${formSection.replace('_', ' ')} at ${centreNameToUse}.`
        )
        setFullName('')
        setEmail('')
        setMobile('')
        setPassword('')
        setAppointModalOpen(false)
        loadStaff()
        setTimeout(() => setSuccessMsg(''), 6000)
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

  // Scoped Staff List (Strict Mandi Isolation for Centre Admin)
  const scopedStaffList = isSuperAdmin
    ? (selectedMandiFilter === 'ALL'
        ? staffList
        : staffList.filter((s) => s.centre_name.toLowerCase() === selectedMandiFilter.toLowerCase()))
    : staffList.filter(
        (s) =>
          s.centre_name.toLowerCase().includes(currentMandiName.toLowerCase()) ||
          currentMandiName.toLowerCase().includes(s.centre_name.toLowerCase())
      )

  // Filtered List by Search & Section
  const filteredStaff = scopedStaffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      s.full_name.toLowerCase().includes(q) ||
      s.staff_id.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.centre_name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)

    const matchesSection =
      selectedSectionFilter === 'ALL' || s.section === selectedSectionFilter

    return matchesSearch && matchesSection
  })

  // Group by Section
  const getStaffBySection = (secId: StaffSection) => {
    return filteredStaff.filter((s) => (s.section || 'GATE_INTAKE') === secId)
  }

  // Get Unique Mandis present in Staff List + All Registered Procurement Depots
  const allRegisteredCentres = getAllProcurementCentresList()
  const availableMandisInRoster = Array.from(
    new Set([
      ...staffList.map((s) => s.centre_name),
      ...allRegisteredCentres.map((c) => c.centreName),
    ])
  ).filter(Boolean)

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="staff"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="staff"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="management"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Centre Staff & Section Rosters"
        />

        <main className="staff-mgmt-container">
          {/* Top Header Banner */}
          <div className="staff-mgmt-banner">
            <div className="staff-mgmt-banner-text">
              <div className="staff-mgmt-banner-pills">
                <span className="staff-mgmt-pill-dir">
                  <ShieldCheck size={13} /> Official APMC Personnel Directory
                </span>
                <span className="staff-mgmt-pill-live">
                  ● Live State Directory
                </span>
              </div>
              <h1 className="staff-mgmt-banner-title">
                Centre Staff &amp; Section-Wise Duty Rosters
              </h1>
              <p className="staff-mgmt-banner-desc">
                View and manage appointed personnel categorized by registered procurement mandis and operational sections.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAppointModalOpen(true)}
              className="staff-mgmt-appoint-btn"
            >
              <UserPlus size={17} color="#075a27" />
              Appoint New Staff Officer
            </button>
          </div>

          {/* Success Notification */}
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
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Controls Bar: Registered Mandi Selector + Search + View Switcher */}
          <div className="staff-mgmt-controls-bar">
            {/* Left Filter: Mandi Selector (Statewide Super Admin) or Locked Mandi Badge (Centre Admin) */}
            <div className="staff-mgmt-mandi-select-wrap">
              {isSuperAdmin ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <Building2 size={16} color="#15803d" /> Registered Mandi:
                  </div>
                  <select
                    value={selectedMandiFilter}
                    onChange={(e) => setSelectedMandiFilter(e.target.value)}
                    className="staff-mgmt-mandi-select"
                  >
                    <option value="ALL">All Registered Mandis ({staffList.length} Officers)</option>
                    {availableMandisInRoster.map((mandi) => {
                      const count = staffList.filter((s) => s.centre_name === mandi).length
                      return (
                        <option key={mandi} value={mandi}>
                          {mandi} ({count} Staff)
                        </option>
                      )
                    })}
                  </select>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '6px 14px', borderRadius: '10px', flexWrap: 'wrap' }}>
                  <Building2 size={16} color="#15803d" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                    {currentMandiName}
                  </span>
                  <span style={{ fontSize: '11px', background: '#dcfce7', color: '#14532d', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                    🔒 Assigned Mandi ({scopedStaffList.length} Officers)
                  </span>
                </div>
              )}
            </div>

            {/* Middle Search Input */}
            <div className="staff-mgmt-search-wrap">
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                placeholder="Search by officer name, ID, or desk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="staff-mgmt-search-input"
              />
            </div>

            {/* Right: View Mode Toggle & Refresh */}
            <div className="staff-mgmt-view-actions">
              <div className="staff-mgmt-toggle-pill">
                <button
                  type="button"
                  onClick={() => setViewMode('SECTION_GROUPED')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'SECTION_GROUPED' ? '#ffffff' : 'transparent',
                    color: viewMode === 'SECTION_GROUPED' ? '#0f172a' : '#64748b',
                    fontWeight: viewMode === 'SECTION_GROUPED' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'SECTION_GROUPED' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <Grid size={14} /> Section View
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('TABLE')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
                    color: viewMode === 'TABLE' ? '#0f172a' : '#64748b',
                    fontWeight: viewMode === 'TABLE' ? 700 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'TABLE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <LayoutList size={14} /> Roster Table
                </button>
              </div>

              <button
                type="button"
                onClick={loadStaff}
                className="staff-mgmt-refresh-btn"
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Section Selector Tabs Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedSectionFilter('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: selectedSectionFilter === 'ALL' ? '1.5px solid #15803d' : '1px solid #e2e8f0',
                background: selectedSectionFilter === 'ALL' ? '#f0fdf4' : '#ffffff',
                color: selectedSectionFilter === 'ALL' ? '#166534' : '#475569',
                fontSize: '13px',
                fontWeight: selectedSectionFilter === 'ALL' ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={15} color={selectedSectionFilter === 'ALL' ? '#166534' : '#64748b'} />
              All Sections
              <span
                style={{
                  background: selectedSectionFilter === 'ALL' ? '#166534' : '#e2e8f0',
                  color: selectedSectionFilter === 'ALL' ? '#ffffff' : '#475569',
                  fontSize: '11px',
                  padding: '1px 7px',
                  borderRadius: '99px',
                  fontWeight: 700,
                }}
              >
                {scopedStaffList.length}
              </span>
            </button>

            {MANDI_SECTIONS.map((sec) => {
              const count = scopedStaffList.filter((s) => (s.section || 'GATE_INTAKE') === sec.id).length
              const isSelected = selectedSectionFilter === sec.id
              const IconComp = sec.icon

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setSelectedSectionFilter(sec.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: isSelected ? `1.5px solid ${sec.color}` : '1px solid #e2e8f0',
                    background: isSelected ? sec.bg : '#ffffff',
                    color: isSelected ? sec.color : '#475569',
                    fontSize: '13px',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <IconComp size={15} color={isSelected ? sec.color : '#64748b'} />
                  {sec.shortTitle}
                  <span
                    style={{
                      background: isSelected ? sec.color : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '11px',
                      padding: '1px 7px',
                      borderRadius: '99px',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ====================================================================
              MODE 1: SECTION-WISE GROUPED VIEW
              ==================================================================== */}
          {viewMode === 'SECTION_GROUPED' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {MANDI_SECTIONS.filter(
                (sec) => selectedSectionFilter === 'ALL' || selectedSectionFilter === sec.id
              ).map((sec) => {
                const sectionOfficers = getStaffBySection(sec.id)
                const IconComp = sec.icon

                return (
                  <div
                    key={sec.id}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${sec.border}`,
                      borderRadius: '18px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    {/* Section Card Header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        background: sec.bg,
                        borderBottom: `1px solid ${sec.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: '#ffffff',
                            border: `1px solid ${sec.border}`,
                            color: sec.color,
                            display: 'grid',
                            placeItems: 'center',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
                          }}
                        >
                          <IconComp size={18} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              {sec.title}
                            </h2>
                            <span
                              style={{
                                background: '#ffffff',
                                color: sec.color,
                                border: `1px solid ${sec.border}`,
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '99px',
                              }}
                            >
                              {sectionOfficers.length} Officers On Roster
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                            {sec.description}
                          </p>
                        </div>
                      </div>

                      {/* Responsibilities tags */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {sec.responsibilities.map((r) => (
                          <span
                            key={r}
                            style={{
                              fontSize: '10.5px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                            }}
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Section Officers Grid */}
                    <div style={{ padding: '20px' }}>
                      {sectionOfficers.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8' }}>
                          <Users size={28} color="#cbd5e1" style={{ margin: '0 auto 8px', display: 'block' }} />
                          <p style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>
                            No staff officers appointed in this section for the selected Mandi filter.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '16px',
                          }}
                        >
                          {sectionOfficers.map((officer) => {
                            const isSelf = officer.staff_id === currentStaff.staff_id

                            return (
                              <div
                                key={officer.staff_id}
                                style={{
                                  background: '#ffffff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '12px',
                                  padding: '16px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  gap: '12px',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                                }}
                              >
                                <div>
                                  {/* Top Row: Avatar + Name + Status */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div
                                        style={{
                                          width: '36px',
                                          height: '36px',
                                          borderRadius: '50%',
                                          background: sec.bg,
                                          border: `1.5px solid ${sec.border}`,
                                          color: sec.color,
                                          display: 'grid',
                                          placeItems: 'center',
                                          fontSize: '13px',
                                          fontWeight: 800,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {officer.full_name?.charAt(0) || 'S'}
                                      </div>
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                                            {officer.full_name}
                                          </strong>
                                          {isSelf && (
                                            <span style={{ fontSize: '10.5px', color: '#15803d', fontWeight: 700 }}>
                                              (You)
                                            </span>
                                          )}
                                        </div>
                                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                                          {officer.staff_id}
                                        </span>
                                      </div>
                                    </div>

                                    <span
                                      style={{
                                        background: officer.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                                        color: officer.status === 'ACTIVE' ? '#166534' : '#991b1b',
                                        fontSize: '10.5px',
                                        fontWeight: 800,
                                        padding: '2px 8px',
                                        borderRadius: '99px',
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      {officer.status === 'ACTIVE' ? '● Active' : '○ Suspended'}
                                    </span>
                                  </div>

                                  {/* Designation & Duty Desk */}
                                  <div
                                    style={{
                                      background: '#f8fafc',
                                      border: '1px solid #f1f5f9',
                                      borderRadius: '8px',
                                      padding: '8px 10px',
                                      marginBottom: '10px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                    }}
                                  >
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                                      {officer.designation}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                                      <Clock size={12} color="#94a3b8" />
                                      <span>{officer.shift || 'General Shift (09:00 - 18:00)'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
                                      <MapPin size={12} color="#15803d" />
                                      <span>Desk: <strong>{officer.desk_assigned || 'Central Desk'}</strong></span>
                                    </div>
                                  </div>

                                  {/* Mandi & Contacts */}
                                  <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Building2 size={12} color="#64748b" />
                                      <span style={{ fontWeight: 600, color: '#334155' }}>{officer.centre_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Mail size={12} color="#94a3b8" />
                                      <span>{officer.email || `${officer.staff_id.toLowerCase()}@fcs.up.gov.in`}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <Phone size={12} color="#94a3b8" />
                                      <span>{officer.mobile}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Row */}
                                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      color: sec.color,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.4px',
                                    }}
                                  >
                                    {officer.role}
                                  </span>

                                  {!isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(officer)}
                                      style={{
                                        background: officer.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                                        color: officer.status === 'ACTIVE' ? '#b91c1c' : '#166534',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                      }}
                                    >
                                      {officer.status === 'ACTIVE' ? 'Suspend Access' : 'Activate Access'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* ====================================================================
               MODE 2: ROSTER TABLE VIEW
               ==================================================================== */
            <div className="staff-mgmt-table-wrap">
              <table className="staff-mgmt-table">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 18px' }}>Officer Details</th>
                      <th style={{ padding: '14px 18px' }}>Staff ID</th>
                      <th style={{ padding: '14px 18px' }}>Operational Section</th>
                      <th style={{ padding: '14px 18px' }}>Registered APMC Mandi</th>
                      <th style={{ padding: '14px 18px' }}>Shift &amp; Duty Desk</th>
                      <th style={{ padding: '14px 18px' }}>Access Status</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          Loading appointed staff records...
                        </td>
                      </tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                          No staff officers match your search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStaff.map((officer) => {
                        const isSelf = officer.staff_id === currentStaff.staff_id
                        const secMeta =
                          MANDI_SECTIONS.find((s) => s.id === officer.section) || MANDI_SECTIONS[0]

                        return (
                          <tr key={officer.staff_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: secMeta.bg,
                                    color: secMeta.color,
                                    border: `1px solid ${secMeta.border}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                    fontWeight: 800,
                                    fontSize: '13px',
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
                                  background: secMeta.bg,
                                  color: secMeta.color,
                                  border: `1px solid ${secMeta.border}`,
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  display: 'inline-block',
                                }}
                              >
                                {secMeta.shortTitle}
                              </span>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {officer.designation}
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12.5px' }}>
                              {officer.centre_name}
                            </td>
                            <td style={{ padding: '14px 18px', fontSize: '12px', color: '#475569' }}>
                              <div><strong>{officer.desk_assigned || 'General Desk'}</strong></div>
                              <small style={{ color: '#64748b' }}>{officer.shift || '09:00 - 18:00'}</small>
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
                                {officer.status === 'ACTIVE' ? '● Active' : '○ Suspended'}
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
                                  {officer.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
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
          )}
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
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
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
                    Appoint Mandi Staff Officer
                  </h2>
                  <small style={{ color: '#64748b' }}>Assign to specific registered Mandi &amp; operational section</small>
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
            <form onSubmit={handleAppointSubmit} style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
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

              {/* 1. Mandi Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  Registered APMC Procurement Mandi {isSuperAdmin ? '*' : '(Assigned Centre)'}
                </label>
                {isSuperAdmin ? (
                  <select
                    value={formMandi}
                    onChange={(e) => setFormMandi(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
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
                ) : (
                  <div>
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #bbf7d0',
                        background: '#f0fdf4',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxSizing: 'border-box',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={15} color="#15803d" />
                        {currentMandiName}
                      </span>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#14532d', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        🔒 Locked to Your Mandi
                      </span>
                    </div>
                    <small style={{ color: '#64748b', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                      As Mandi Superintendent / Centre Admin, you can only appoint officers to your authorized procurement depot.
                    </small>
                  </div>
                )}
              </div>

              {/* 2. Section Selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  Operational Section &amp; Functional Wing *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {MANDI_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleFormSectionChange(sec.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: formSection === sec.id ? `2px solid ${sec.color}` : '1px solid #cbd5e1',
                        background: formSection === sec.id ? sec.bg : '#ffffff',
                        color: formSection === sec.id ? sec.color : '#334155',
                        fontWeight: formSection === sec.id ? 800 : 600,
                        fontSize: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <sec.icon size={15} color={sec.color} />
                      <span>{sec.shortTitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Officer Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Officer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Shahi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. r.shahi@fcs.up.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 4. Phone & Designation */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Official Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Official Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 5. Shift & Desk */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Assigned Duty Shift *
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Morning Shift (06:00 - 14:00)">Morning Shift (06:00 - 14:00)</option>
                    <option value="General Shift (08:00 - 17:00)">General Shift (08:00 - 17:00)</option>
                    <option value="Evening Shift (14:00 - 22:00)">Evening Shift (14:00 - 22:00)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Assigned Duty Desk / Station *
                  </label>
                  <input
                    type="text"
                    required
                    value={deskAssigned}
                    onChange={(e) => setDeskAssigned(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* 6. Security Password */}
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
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  fontSize: '11.5px',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ShieldCheck size={16} color="#0d631b" />
                <span>Password is stored with SHA-256 government cryptographic encryption.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAppointModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0d631b',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <BadgeCheck size={16} />
                  {isSubmitting ? 'Authorizing...' : 'Appoint & Authorize Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
