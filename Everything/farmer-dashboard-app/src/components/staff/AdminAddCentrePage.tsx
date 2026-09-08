import { useState, useEffect } from 'react'
import {
  Building2,
  Scale,
  Users,
  CheckCircle2,
  ArrowLeft,
  Save,
  Layers,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  addNewProcurementCentre,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function AdminAddCentrePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  // Form State
  const [centreName, setCentreName] = useState('')
  const [district, setDistrict] = useState('Varanasi')
  const [blockTehsil, setBlockTehsil] = useState('')
  const [agency, setAgency] = useState<'FCS' | 'PCF' | 'PCU' | 'Mandi Samiti' | 'FCI'>('FCS')
  const [crops, setCrops] = useState(['Paddy (Common)', 'Paddy (Grade A)', 'Wheat'])
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('25.3176')
  const [longitude, setLongitude] = useState('82.9739')
  const [weighbridges, setWeighbridges] = useState('2')
  const [moistureMeters, setMoistureMeters] = useState('3')
  const [storageCapacity, setStorageCapacity] = useState('1500')
  const [dailyQuota, setDailyQuota] = useState('120')
  const [maxDailyTokens, setMaxDailyTokens] = useState('60')
  const [inchargeName, setInchargeName] = useState('')
  const [inchargePhone, setInchargePhone] = useState('')
  const [inchargeEmail, setInchargeEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/centres/add')
      navigate('/staff/login')
      return
    }
    setStaff(getStaffAuthSession())
  }, [])

  const handleCropToggle = (cropName: string) => {
    if (crops.includes(cropName)) {
      setCrops(crops.filter((c) => c !== cropName))
    } else {
      setCrops([...crops, cropName])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!centreName.trim() || !blockTehsil.trim()) {
      alert('Please fill out all mandatory centre details.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      addNewProcurementCentre({
        centreName: centreName.trim(),
        district,
        blockTehsil: blockTehsil.trim(),
        agency,
        crops: crops.join(' / ') || 'Paddy / Wheat',
        address: address.trim() || `${blockTehsil}, ${district}`,
        status: 'Listed 2026–27',
      })

      setIsSubmitting(false)
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/centres')
      }, 1500)
    }, 600)
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="centres"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Provision New Procurement Centre"
        />

        <main style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto' }}>
          {/* Back Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={() => navigate('/admin/centres')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Back to Centres Directory
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Layers size={14} /> Official APMC / KMS 2026-27 Onboarding
              </span>
            </div>
          </div>

          {success && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                padding: '16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                color: '#065f46',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={20} color="#059669" />
              <span>Procurement Centre "{centreName}" successfully provisioned and listed in APMC registry! Redirecting...</span>
            </div>
          )}

          {/* Provisioning Form */}
          <form onSubmit={handleSubmit}>
            {/* Section 1: Institutional & Geographical Details */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#dbeafe', color: '#1e40af', padding: '8px', borderRadius: '8px' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    1. Centre Identity &amp; Jurisdiction
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Government nodal agency, APMC code, and geographical tehsil mapping.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Procurement Centre Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chiraigaon 1st at Gaurakala (FCS)"
                    value={centreName}
                    onChange={(e) => setCentreName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Procuring Agency <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={agency}
                    onChange={(e) => setAgency(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    <option value="FCS">FCS (Food &amp; Civil Supplies)</option>
                    <option value="PCF">PCF (Pradeshik Co-operative Fed.)</option>
                    <option value="PCU">PCU (Pradeshik Co-operative Union)</option>
                    <option value="Mandi Samiti">UP Rajya Krishi Utpadan Mandi Samiti</option>
                    <option value="FCI">FCI (Food Corporation of India)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    District <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none',
                    }}
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Chandauli">Chandauli</option>
                    <option value="Ghazipur">Ghazipur</option>
                    <option value="Jaunpur">Jaunpur</option>
                    <option value="Mirzapur">Mirzapur</option>
                    <option value="Sonbhadra">Sonbhadra</option>
                    <option value="Prayagraj">Prayagraj</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Block / Tehsil <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chiraigaon / Sadar"
                    value={blockTehsil}
                    onChange={(e) => setBlockTehsil(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Physical Address &amp; Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Gaura Kala Primary School, Post Chiraigaon, Varanasi - 221112"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Latitude (GPS)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Longitude (GPS)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Infrastructure & Capacity */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '8px' }}>
                  <Scale size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    2. Infrastructure, Hardware &amp; Commodities
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Weighbridge units, moisture analyzers, Godown storage capacity, and accepted crop types.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Accepted Commodities for Procurement
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['Paddy (Common)', 'Paddy (Grade A)', 'Wheat', 'Mustard / Rapeseed', 'Chana / Gram', 'Maize', 'Soybean'].map((crop) => {
                    const selected = crops.includes(crop)
                    return (
                      <button
                        type="button"
                        key={crop}
                        onClick={() => handleCropToggle(crop)}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: selected ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                          background: selected ? '#f0fdf4' : '#ffffff',
                          color: selected ? '#15803d' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {selected ? '✓ ' : '+ '}
                        {crop}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Active Electronic Weighbridges
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={weighbridges}
                    onChange={(e) => setWeighbridges(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Digital Moisture Meters
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={moistureMeters}
                    onChange={(e) => setMoistureMeters(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Godown Storage Capacity (MT)
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={storageCapacity}
                    onChange={(e) => setStorageCapacity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Daily Intake Quota (MT)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Max Tokens Per Day
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={maxDailyTokens}
                    onChange={(e) => setMaxDailyTokens(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Centre Superintendent & Officer Assignment */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#ede9fe', color: '#6d28d9', padding: '8px', borderRadius: '8px' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    3. Centre Superintendent &amp; In-Charge Designation
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Assign the primary officer credentials for OTP login and DBT authorization.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Centre In-Charge Officer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra Verma"
                    value={inchargeName}
                    onChange={(e) => setInchargeName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Official Mobile (For OTP / Alert SMS)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={inchargePhone}
                    onChange={(e) => setInchargePhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    NIC / Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.fcs@up.gov.in"
                    value={inchargeEmail}
                    onChange={(e) => setInchargeEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/centres')}
                style={{
                  padding: '11px 22px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '11px 26px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                }}
              >
                <Save size={16} />
                {isSubmitting ? 'Provisioning Centre...' : 'Authorize & Register Centre'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
