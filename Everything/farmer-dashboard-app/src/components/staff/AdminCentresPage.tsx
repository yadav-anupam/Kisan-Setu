import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  CheckCircle2,
  MapPin,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getAllProcurementCentresList,
  addNewProcurementCentre,
  type StaffProfile,
} from '../../services/staffDataService'
import type { ProcurementCentreItem } from '../../data/procurementCentresData'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function AdminCentresPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [centres, setCentres] = useState<ProcurementCentreItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [agencyFilter, setAgencyFilter] = useState('ALL')

  // Add centre modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [centreName, setCentreName] = useState('')
  const [district, setDistrict] = useState('Varanasi')
  const [blockTehsil, setBlockTehsil] = useState('')
  const [agency, setAgency] = useState<'FCS' | 'PCF' | 'PCU' | 'Mandi Samiti' | 'FCI'>('FCS')
  const [crops, setCrops] = useState('Paddy / Wheat / Mustard')
  const [address, setAddress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || (isAdmin ? '/admin/centres' : isCentreAdmin ? '/centre-admin/dashboard' : '/staff/centres'))
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }
    setStaff(getStaffAuthSession())
    setCentres(getAllProcurementCentresList())
  }, [pathname, isCentreAdmin, isAdmin])

  const handleAddCentreSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!centreName.trim() || !blockTehsil.trim()) return

    const created = addNewProcurementCentre({
      centreName: centreName.trim(),
      district,
      blockTehsil: blockTehsil.trim(),
      agency,
      crops,
      address: address.trim() || `${blockTehsil}, ${district}`,
      status: 'Listed 2026–27',
    })

    setCentres(getAllProcurementCentresList())
    setIsAddModalOpen(false)
    setCentreName('')
    setBlockTehsil('')
    setAddress('')
    setSuccessMsg(`Procurement Centre "${created.centreName}" successfully registered & active!`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const filteredCentres = centres.filter((c) => {
    const matchSearch =
      c.centreName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.blockTehsil.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDistrict = districtFilter === 'ALL' || c.district === districtFilter
    const matchAgency = agencyFilter === 'ALL' || c.agency === agencyFilter
    return matchSearch && matchDistrict && matchAgency
  })

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

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
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
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Procurement Centres Master Management
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Registry of government purchase depots across Varanasi, Chandauli, Ghazipur, and Jaunpur districts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
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
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
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
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search centre name, tehsil or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Districts ({centres.length})</option>
                <option value="Varanasi">Varanasi District</option>
                <option value="Chandauli">Chandauli District</option>
                <option value="Ghazipur">Ghazipur District</option>
                <option value="Jaunpur">Jaunpur District</option>
              </select>

              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Agencies</option>
                <option value="FCS">FCS (Food &amp; Civil Supplies)</option>
                <option value="PCF">PCF (Cooperative Federation)</option>
                <option value="PCU">PCU (Cooperative Union)</option>
                <option value="Mandi Samiti">Mandi Samiti</option>
                <option value="FCI">FCI (Food Corp of India)</option>
              </select>
            </div>
          </div>

          {/* Centres Table Card */}
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
                    <th style={{ padding: '14px 18px' }}>#</th>
                    <th style={{ padding: '14px 18px' }}>Centre Name &amp; Address</th>
                    <th style={{ padding: '14px 18px' }}>District / Tehsil</th>
                    <th style={{ padding: '14px 18px' }}>Operating Agency</th>
                    <th style={{ padding: '14px 18px' }}>Crop Categories</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCentres.map((c, idx) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{c.centreName}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={12} color="#0d631b" /> {c.address}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#334155', display: 'block' }}>{c.district}</strong>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>{c.blockTehsil}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            background: c.agency === 'FCS' ? '#eff6ff' : c.agency === 'FCI' ? '#fdf2f8' : '#f0fdf4',
                            color: c.agency === 'FCS' ? '#1e40af' : c.agency === 'FCI' ? '#9d174d' : '#166534',
                            border: '1px solid #cbd5e1',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                          }}
                        >
                          {c.agency}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12.5px' }}>
                        {c.crops}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                          ● Active {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Add New Centre Modal */}
      {isAddModalOpen && (
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
              borderRadius: '18px',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Register New Procurement Centre
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCentreSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Official Centre Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohaniya Grain Mandi Yard (FCS)"
                  value={centreName}
                  onChange={(e) => setCentreName(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Chandauli">Chandauli</option>
                    <option value="Ghazipur">Ghazipur</option>
                    <option value="Jaunpur">Jaunpur</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Tehsil / Block *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sevapuri / Kashi"
                    value={blockTehsil}
                    onChange={(e) => setBlockTehsil(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Procurement Agency *
                  </label>
                  <select
                    value={agency}
                    onChange={(e) => setAgency(e.target.value as any)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="FCS">FCS (Food &amp; Civil Supplies)</option>
                    <option value="PCF">PCF (Cooperative Federation)</option>
                    <option value="PCU">PCU (Cooperative Union)</option>
                    <option value="Mandi Samiti">Mandi Samiti</option>
                    <option value="FCI">FCI (Food Corporation of India)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Supported Crops
                  </label>
                  <input
                    type="text"
                    value={crops}
                    onChange={(e) => setCrops(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Location / Physical Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near GT Road, Rohaniya, Varanasi"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Register Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
