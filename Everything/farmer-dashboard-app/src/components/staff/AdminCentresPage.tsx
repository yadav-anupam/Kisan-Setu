import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  X,
  Compass,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Edit2,
  Power,
  Save,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import {
  getAllMandiLocations,
  updateMandiLocation,
  verifyMandiLocation,
  toggleMandiActiveStatus,
  type MandiLocationRecord,
  type VerificationStatus,
} from '../../services/mandiLocationService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import InteractiveMandiMap from '../common/InteractiveMandiMap'
import './StaffQRScannerPage.css'

export default function AdminCentresPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [mandis, setMandis] = useState<MandiLocationRecord[]>([])
  const [loading, setLoading] = useState(true)

  // View state: 'table' or 'map'
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL')
  const [agencyFilter, setAgencyFilter] = useState('ALL')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Modals state
  const [selectedMandiForEdit, setSelectedMandiForEdit] = useState<MandiLocationRecord | null>(null)
  const [selectedMandiForVerify, setSelectedMandiForVerify] = useState<MandiLocationRecord | null>(null)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editCityVillage, setEditCityVillage] = useState('')
  const [editDistrict, setEditDistrict] = useState('')
  const [editPincode, setEditPincode] = useState('')
  const [editLandmark, setEditLandmark] = useState('')
  const [editLat, setEditLat] = useState(25.3176)
  const [editLng, setEditLng] = useState(82.9739)
  const [editPhone, setEditPhone] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  // Verify form state
  const [verifyStatusChoice, setVerifyStatusChoice] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED')
  const [verifyNotes, setVerifyNotes] = useState('')
  const [isSavingVerify, setIsSavingVerify] = useState(false)

  // Load Mandis
  const loadMandis = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllMandiLocations()
      setMandis(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem(
        'kisan_setu_staff_redirect',
        pathname || (isAdmin ? '/admin/centres' : isCentreAdmin ? '/centre-admin/dashboard' : '/staff/centres')
      )
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }
    const current = getStaffAuthSession()
    setStaff(current)
    loadMandis()

    const handleUpdate = () => loadMandis()
    window.addEventListener('kisan_setu_mandis_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_mandis_updated', handleUpdate)
  }, [pathname, isCentreAdmin, isAdmin, loadMandis])

  // Filtered Mandis
  const filteredMandis = useMemo(() => {
    return mandis.filter((m) => {
      // Centre admin restriction: if centre admin has an assigned centre code, show only theirs or highlight
      if (isCentreAdmin && staff?.centre_id) {
        if (m.centre_code.toLowerCase() !== staff.centre_id.toLowerCase()) {
          // Keep listed or filter to assigned centre
        }
      }

      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.centre_code.toLowerCase().includes(q) ||
        m.city_or_village.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.pincode.includes(q)

      const matchDistrict = districtFilter === 'ALL' || m.district.toLowerCase() === districtFilter.toLowerCase()
      const matchStatus = statusFilter === 'ALL' || m.verification_status === statusFilter
      const matchAgency = agencyFilter === 'ALL' || (m.agency && m.agency === agencyFilter)

      return matchSearch && matchDistrict && matchStatus && matchAgency
    })
  }, [mandis, searchQuery, districtFilter, statusFilter, agencyFilter, isCentreAdmin, staff])

  // Open Edit Modal
  const openEditModal = (mandi: MandiLocationRecord) => {
    // Role check: centre admin can only edit their own centre
    if (isCentreAdmin && staff?.centre_id && mandi.centre_code.toLowerCase() !== staff.centre_id.toLowerCase()) {
      alert(`As Centre Admin for ${staff.centre_name || staff.centre_id}, you are only authorized to manage your assigned centre.`)
      return
    }

    setSelectedMandiForEdit(mandi)
    setEditName(mandi.name)
    setEditAddress(mandi.address)
    setEditCityVillage(mandi.city_or_village)
    setEditDistrict(mandi.district)
    setEditPincode(mandi.pincode)
    setEditLandmark(mandi.landmark || '')
    setEditLat(mandi.latitude)
    setEditLng(mandi.longitude)
    setEditPhone(mandi.contact_phone || '')
  }

  // Handle Edit Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMandiForEdit) return

    setIsSavingEdit(true)
    setErrorMsg('')
    try {
      await updateMandiLocation(
        selectedMandiForEdit.centre_code,
        {
          name: editName.trim(),
          address: editAddress.trim(),
          city_or_village: editCityVillage.trim(),
          district: editDistrict.trim(),
          pincode: editPincode.trim(),
          landmark: editLandmark.trim(),
          latitude: editLat,
          longitude: editLng,
          contact_phone: editPhone.trim(),
        },
        staff
      )

      setSelectedMandiForEdit(null)
      setSuccessMsg(`Procurement centre "${editName}" updated successfully.`)
      setTimeout(() => setSuccessMsg(''), 5000)
      loadMandis()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update mandi details.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Open Verify Modal
  const openVerifyModal = (mandi: MandiLocationRecord) => {
    // Only Administrative Admin can sign off verification
    if (staff?.role !== 'ADMIN') {
      alert('Only authorized APMC District Administrators can verify procurement centre locations.')
      return
    }

    setSelectedMandiForVerify(mandi)
    setVerifyStatusChoice('VERIFIED')
    setVerifyNotes(`GPS entrance coordinates checked against official cadastral records on ${new Date().toLocaleDateString('en-IN')}`)
  }

  // Handle Verify Submit
  const handleSaveVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMandiForVerify) return

    setIsSavingVerify(true)
    setErrorMsg('')
    try {
      await verifyMandiLocation(
        selectedMandiForVerify.centre_code,
        {
          status: verifyStatusChoice,
          notes: verifyNotes.trim(),
          verified_by: staff?.full_name || 'Administrative Officer',
        },
        staff
      )

      setSelectedMandiForVerify(null)
      setSuccessMsg(
        `Procurement Centre "${selectedMandiForVerify.name}" marked as ${verifyStatusChoice}.`
      )
      setTimeout(() => setSuccessMsg(''), 5000)
      loadMandis()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update verification status.')
    } finally {
      setIsSavingVerify(false)
    }
  }

  // Handle Toggle Active
  const handleToggleActive = async (mandi: MandiLocationRecord) => {
    const action = mandi.is_active ? 'deactivate' : 'activate'
    if (
      !window.confirm(
        `Are you sure you want to ${action} "${mandi.name}" (${mandi.centre_code.toUpperCase()})? Existing appointments and records will be preserved.`
      )
    ) {
      return
    }

    try {
      await toggleMandiActiveStatus(mandi.centre_code, !mandi.is_active)
      setSuccessMsg(`Procurement centre "${mandi.name}" is now ${!mandi.is_active ? 'Active' : 'Inactive'}.`)
      setTimeout(() => setSuccessMsg(''), 5000)
      loadMandis()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to toggle active status.')
    }
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="dashboard"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="centres"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="centres"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="APMC Mandi &amp; Procurement Centres Directory"
        />

        <main style={{ padding: '24px', maxWidth: '1360px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Procurement Centres Master Management
                </h1>
                <span
                  style={{
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {mandis.length} Registered Mandis
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Registry of government purchase depots across Varanasi, Chandauli, Ghazipur, and Jaunpur with verified GPS gate tagging.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* View Mode Toggle */}
              <div
                style={{
                  display: 'flex',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '3px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    border: 'none',
                    background: viewMode === 'table' ? '#0f172a' : 'transparent',
                    color: viewMode === 'table' ? '#ffffff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                  }}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  style={{
                    border: 'none',
                    background: viewMode === 'map' ? '#0f172a' : 'transparent',
                    color: viewMode === 'map' ? '#ffffff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Compass size={14} /> Map View
                </button>
              </div>

              {/* Add Centre Button (Admin only) */}
              {(!isCentreAdmin || staff?.role === 'ADMIN') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin/centres/add')}
                  style={{
                    background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 18px',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
                  }}
                >
                  <Plus size={16} /> Add New Procurement Centre
                </button>
              )}
            </div>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '12px 18px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#dc2626" />
              {errorMsg}
            </div>
          )}

          {/* Filters Bar */}
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
              gap: '14px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search centre name, code, village, tehsil or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Verification Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="VERIFIED">Officially Verified (GPS)</option>
                <option value="PENDING_VERIFICATION">Pending Field Audit</option>
                <option value="REJECTED">Audit Rejected</option>
              </select>

              {/* District Filter */}
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Districts</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Chandauli">Chandauli</option>
                <option value="Ghazipur">Ghazipur</option>
                <option value="Jaunpur">Jaunpur</option>
                <option value="Mirzapur">Mirzapur</option>
              </select>

              {/* Agency Filter */}
              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Agencies</option>
                <option value="FCS">FCS</option>
                <option value="PCF">PCF</option>
                <option value="PCU">PCU</option>
                <option value="Mandi Samiti">Mandi Samiti</option>
                <option value="FCI">FCI</option>
              </select>
            </div>
          </div>

          {/* Map View Rendering */}
          {viewMode === 'map' ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                height: '620px',
              }}
            >
              <InteractiveMandiMap
                mode="directory"
                mandis={filteredMandis}
                height="100%"
                showSearch={true}
              />
            </div>
          ) : (
            /* Table List View Rendering */
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '14px 16px' }}>Code</th>
                      <th style={{ padding: '14px 16px' }}>Centre Name &amp; Physical Gate</th>
                      <th style={{ padding: '14px 16px' }}>District / Tehsil</th>
                      <th style={{ padding: '14px 16px' }}>GPS Coordinates</th>
                      <th style={{ padding: '14px 16px' }}>Verification Status</th>
                      <th style={{ padding: '14px 16px' }}>State</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          Loading procurement centre records...
                        </td>
                      </tr>
                    ) : filteredMandis.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          No procurement centres match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMandis.map((m) => {
                        const isVerified = m.verification_status === 'VERIFIED'
                        const isRejected = m.verification_status === 'REJECTED'

                        return (
                          <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                              {m.centre_code.toUpperCase()}
                            </td>
                            <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{m.name}</strong>
                              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <MapPin size={12} color="#059669" /> {m.address || `${m.city_or_village}, ${m.district}`}
                              </span>
                              {m.landmark && (
                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                  Landmark: {m.landmark}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <strong style={{ color: '#334155', display: 'block' }}>{m.district}</strong>
                              <span style={{ fontSize: '11.5px', color: '#64748b' }}>{m.city_or_village}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '11.5px', color: '#0f172a', background: '#f8fafc', padding: '3px 6px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                {m.latitude.toFixed(4)}° N, {m.longitude.toFixed(4)}° E
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                Source: {m.location_source.replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              {isVerified ? (
                                <span
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <ShieldCheck size={12} /> Verified
                                </span>
                              ) : isRejected ? (
                                <span
                                  style={{
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Rejected
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <Clock size={12} /> Pending Audit
                                </span>
                              )}
                              {m.verified_at && (
                                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                  {new Date(m.verified_at).toLocaleDateString('en-IN')}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span
                                style={{
                                  background: m.is_active ? '#dcfce7' : '#f1f5f9',
                                  color: m.is_active ? '#166534' : '#64748b',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {m.is_active ? '● Active' : '○ Inactive'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                {/* Edit Coordinates & Gate Marker */}
                                <button
                                  type="button"
                                  onClick={() => openEditModal(m)}
                                  title="Edit Mandi Entrance & Coordinates"
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: '#334155',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <Edit2 size={13} /> Edit
                                </button>

                                {/* Verify Location (Admin Only) */}
                                {staff?.role === 'ADMIN' && (
                                  <button
                                    type="button"
                                    onClick={() => openVerifyModal(m)}
                                    title="Audit & Sign Off Location"
                                    style={{
                                      background: '#f0fdf4',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '6px',
                                      padding: '6px 8px',
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      color: '#166534',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <ShieldCheck size={13} /> Verify
                                  </button>
                                )}

                                {/* Toggle Active / Inactive */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleActive(m)}
                                  title={m.is_active ? 'Deactivate Mandi' : 'Activate Mandi'}
                                  style={{
                                    background: m.is_active ? '#fef2f2' : '#f0fdf4',
                                    border: m.is_active ? '1px solid #fecaca' : '1px solid #bbf7d0',
                                    borderRadius: '6px',
                                    padding: '6px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: m.is_active ? '#dc2626' : '#166534',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Power size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Mandi & Gate Location Modal */}
      {selectedMandiForEdit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                color: '#ffffff',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  Edit Mandi Location — {selectedMandiForEdit.centre_code.toUpperCase()}
                </h3>
                <p style={{ fontSize: '12px', margin: '2px 0 0', opacity: 0.85 }}>
                  Adjust the exact entrance gate marker coordinates and physical address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMandiForEdit(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
              {/* Interactive Map Picker */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Adjust Mandi Gate Entrance Pin (Drag pin or click map)
                </label>
                <InteractiveMandiMap
                  mode="picker"
                  latitude={editLat}
                  longitude={editLng}
                  height="320px"
                  onLocationChange={(lat, lng, rev) => {
                    setEditLat(lat)
                    setEditLng(lng)
                    if (rev && rev.fullAddress) {
                      setEditAddress(rev.fullAddress)
                    }
                  }}
                />
              </div>

              {/* Coordinates & Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Latitude (° N)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editLat}
                    onChange={(e) => setEditLat(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Longitude (° E)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editLng}
                    onChange={(e) => setEditLng(parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Postal PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.trim())}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Centre Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Nearby Landmark / Gate Identifier
                  </label>
                  <input
                    type="text"
                    value={editLandmark}
                    onChange={(e) => setEditLandmark(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMandiForEdit(null)}
                  disabled={isSavingEdit}
                  style={{ padding: '9px 18px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: isSavingEdit ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={14} />
                  {isSavingEdit ? 'Saving Coordinates...' : 'Save Location Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Mandi Location Modal (Requirement 2) */}
      {selectedMandiForVerify && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
                color: '#ffffff',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#86efac" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  Audit &amp; Verify Mandi Entrance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMandiForVerify(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveVerify} style={{ padding: '24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '18px', fontSize: '13px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: '#0f172a' }}>{selectedMandiForVerify.name}</strong>
                  <span style={{ fontFamily: 'monospace', color: '#64748b', marginLeft: '6px' }}>
                    ({selectedMandiForVerify.centre_code.toUpperCase()})
                  </span>
                </div>
                <div style={{ color: '#475569', fontSize: '12px', marginBottom: '4px' }}>
                  📍 {selectedMandiForVerify.address}
                </div>
                <div style={{ color: '#059669', fontSize: '12px', fontWeight: 700 }}>
                  GPS: {selectedMandiForVerify.latitude.toFixed(6)}° N, {selectedMandiForVerify.longitude.toFixed(6)}° E
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Audit Determination
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: verifyStatusChoice === 'VERIFIED' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: verifyStatusChoice === 'VERIFIED' ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="audit-determination"
                      value="VERIFIED"
                      checked={verifyStatusChoice === 'VERIFIED'}
                      onChange={() => setVerifyStatusChoice('VERIFIED')}
                      style={{ accentColor: '#16a34a' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: '#166534', fontSize: '13px' }}>VERIFY LOCATION</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Approve gate marker for farmers</span>
                    </div>
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: verifyStatusChoice === 'REJECTED' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                      background: verifyStatusChoice === 'REJECTED' ? '#fef2f2' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="audit-determination"
                      value="REJECTED"
                      checked={verifyStatusChoice === 'REJECTED'}
                      onChange={() => setVerifyStatusChoice('REJECTED')}
                      style={{ accentColor: '#dc2626' }}
                    />
                    <div>
                      <strong style={{ display: 'block', color: '#991b1b', fontSize: '13px' }}>REJECT LOCATION</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Disallow until revised</span>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Audit Officer Notes &amp; Verification Evidence
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Field inspection completed by APMC District Officer. Electronic weighbridge gate confirmed on NH-19."
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMandiForVerify(null)}
                  disabled={isSavingVerify}
                  style={{ padding: '9px 18px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVerify}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: verifyStatusChoice === 'VERIFIED' ? '#047857' : '#dc2626',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: isSavingVerify ? 'wait' : 'pointer',
                  }}
                >
                  {isSavingVerify ? 'Submitting Audit...' : `Confirm ${verifyStatusChoice}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
