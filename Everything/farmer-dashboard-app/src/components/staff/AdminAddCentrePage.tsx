import { useState, useEffect } from 'react'
import {
  Building2,
  Scale,
  Users,
  CheckCircle2,
  ArrowLeft,
  Save,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Compass,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  addNewProcurementCentre,
  type StaffProfile,
} from '../../services/staffDataService'
import {
  registerMandiLocation,
  validateCoordinates,
  type LocationSource,
} from '../../services/mandiLocationService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import InteractiveMandiMap from '../common/InteractiveMandiMap'
import './StaffQRScannerPage.css'

export default function AdminAddCentrePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  // Form State
  const [centreCode, setCentreCode] = useState('')
  const [centreName, setCentreName] = useState('')
  const [district, setDistrict] = useState('Varanasi')
  const [blockTehsil, setBlockTehsil] = useState('')
  const [cityOrVillage, setCityOrVillage] = useState('')
  const [pincode, setPincode] = useState('221001')
  const [landmark, setLandmark] = useState('')
  const [agency, setAgency] = useState<'FCS' | 'PCF' | 'PCU' | 'Mandi Samiti' | 'FCI'>('FCS')
  const [crops, setCrops] = useState(['Paddy (Common)', 'Paddy (Grade A)', 'Wheat'])
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState(25.3872)
  const [longitude, setLongitude] = useState(83.0514)
  const [locationSource, setLocationSource] = useState<LocationSource>('GEOCODED_MAP_PICKER')
  const [markVerifiedImmediately, setMarkVerifiedImmediately] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState('')

  // Infrastructure State
  const [weighbridges, setWeighbridges] = useState('2')
  const [moistureMeters, setMoistureMeters] = useState('3')
  const [storageCapacity, setStorageCapacity] = useState('1500')
  const [dailyQuota, setDailyQuota] = useState('120')
  const [maxDailyTokens, setMaxDailyTokens] = useState('60')
  const [inchargeName, setInchargeName] = useState('')
  const [inchargePhone, setInchargePhone] = useState('')
  const [inchargeEmail, setInchargeEmail] = useState('')

  // Confirmation Modal & Submission
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/centres/add')
      navigate('/staff/login')
      return
    }
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)

    // Suggest a default centre code based on district
    const prefix = district.substring(0, 3).toLowerCase()
    setCentreCode(`${prefix}-${Math.floor(10 + Math.random() * 89)}`)
  }, [district])

  const handleCropToggle = (cropName: string) => {
    if (crops.includes(cropName)) {
      setCrops(crops.filter((c) => c !== cropName))
    } else {
      setCrops([...crops, cropName])
    }
  }

  // Handle map marker drag & reverse geocoding update
  const handleLocationPicked = (lat: number, lng: number, reverse?: any) => {
    setLatitude(Number(lat.toFixed(6)))
    setLongitude(Number(lng.toFixed(6)))
    setLocationSource('GEOCODED_MAP_PICKER')

    if (reverse) {
      if (reverse.fullAddress && !address) {
        setAddress(reverse.fullAddress)
      }
      if (reverse.cityOrVillage && !cityOrVillage) {
        setCityOrVillage(reverse.cityOrVillage)
      }
      if (reverse.pincode && pincode === '221001') {
        setPincode(reverse.pincode)
      }
    }
  }

  const handleInitialValidation = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!centreCode.trim()) {
      setErrorMessage('Centre Code is mandatory and must be unique (e.g. vns-45).')
      return
    }
    if (!centreName.trim()) {
      setErrorMessage('Official Mandi / Centre Name is mandatory.')
      return
    }
    if (!blockTehsil.trim()) {
      setErrorMessage('Block or Tehsil jurisdiction is mandatory.')
      return
    }
    if (!pincode.trim() || pincode.length < 6) {
      setErrorMessage('Please enter a valid 6-digit postal PIN code.')
      return
    }

    try {
      validateCoordinates(latitude, longitude)
    } catch (err: any) {
      setErrorMessage(err.message)
      return
    }

    // Open confirmation review dialog
    setShowConfirmModal(true)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // 1. Register in verified mandi location vault
      await registerMandiLocation(
        {
          centre_code: centreCode.trim().toLowerCase(),
          name: centreName.trim(),
          address: address.trim() || `${cityOrVillage || blockTehsil}, ${district} - ${pincode}`,
          state: 'Uttar Pradesh',
          district,
          city_or_village: cityOrVillage.trim() || blockTehsil.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
          latitude,
          longitude,
          location_source: locationSource,
          agency,
          crops: crops.join(' / ') || 'Paddy / Wheat',
          contact_phone: inchargePhone.trim(),
          verification_notes: verificationNotes.trim(),
          mark_verified: markVerifiedImmediately,
        },
        staff
      )

      // 2. Register in staff data service centres registry
      addNewProcurementCentre({
        centreName: centreName.trim(),
        district,
        blockTehsil: blockTehsil.trim(),
        agency,
        crops: crops.join(' / ') || 'Paddy / Wheat',
        address: address.trim() || `${blockTehsil}, ${district}`,
        status: 'Listed 2026–27',
      })

      setShowConfirmModal(false)
      setIsSubmitting(false)
      setSuccess(true)

      setTimeout(() => {
        navigate('/admin/centres')
      }, 1500)
    } catch (err: any) {
      setIsSubmitting(false)
      setShowConfirmModal(false)
      setErrorMessage(err.message || 'Failed to register procurement centre. Please try again.')
    }
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

        <main style={{ padding: '24px', maxWidth: '1180px', margin: '0 auto' }}>
          {/* Back Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <button
              type="button"
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

          {errorMessage && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '14px 18px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                color: '#991b1b',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <AlertTriangle size={18} color="#dc2626" />
              <span>{errorMessage}</span>
            </div>
          )}

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
              <span>Procurement Centre "{centreName}" ({centreCode.toUpperCase()}) successfully registered with verified GPS coordinates! Redirecting...</span>
            </div>
          )}

          {/* Provisioning Form */}
          <form onSubmit={handleInitialValidation}>
            {/* Section 1: Centre Identity & Official Address */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
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
                    1. Centre Identity &amp; Physical Jurisdiction
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Unique centre code, official name, administrative agency, and postal details.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Centre Code (Unique Identifier) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. vns-45"
                    value={centreCode}
                    onChange={(e) => setCentreCode(e.target.value.toLowerCase().trim())}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'block' }}>
                    Immutable code used across tokens, gate passes &amp; payments.
                  </span>
                </div>

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
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Operating Agency <span style={{ color: '#ef4444' }}>*</span>
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
                      boxSizing: 'border-box',
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
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Chandauli">Chandauli</option>
                    <option value="Ghazipur">Ghazipur</option>
                    <option value="Jaunpur">Jaunpur</option>
                    <option value="Mirzapur">Mirzapur</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Tehsil / Block <span style={{ color: '#ef4444' }}>*</span>
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
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    City / Town / Village <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gaurakala"
                    value={cityOrVillage}
                    onChange={(e) => setCityOrVillage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    PIN Code <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 221112"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.trim())}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Nearby Landmark / Gate Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Kisan Seva Kendra Gate 1, State Highway 73"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Full Physical Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. State Highway 73, Gaurakala Village, Chiraigaon Block, Varanasi, UP - 221112"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Interactive Geospatial Gate Placement */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#dcfce7', color: '#15803d', padding: '8px', borderRadius: '8px' }}>
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      2. Accurate Mandi Entrance Gate Geotagging
                    </h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      Place the marker at the exact vehicular entrance / weighbridge approach.
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}
                >
                  GPS: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </div>

              {/* Embedded Interactive Leaflet Map Picker */}
              <div style={{ marginBottom: '16px' }}>
                <InteractiveMandiMap
                  mode="picker"
                  latitude={latitude}
                  longitude={longitude}
                  pickerTitle="Drag green marker to exact mandi truck entrance"
                  height="400px"
                  onLocationChange={handleLocationPicked}
                />
              </div>

              {/* Manual Lat / Lng Fine Tuning */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Latitude (° N)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Longitude (° E)
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Location Data Source
                  </label>
                  <select
                    value={locationSource}
                    onChange={(e) => setLocationSource(e.target.value as LocationSource)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="GEOCODED_MAP_PICKER">Geocoded Map Marker Placement</option>
                    <option value="ON_SITE_GPS">On-Site GPS Survey (Officer Field Device)</option>
                    <option value="GOVERNMENT_GAZETTE">Official Government APMC Gazette</option>
                    <option value="MANUAL">Manual Cadastral Survey Input</option>
                  </select>
                </div>
              </div>

              {/* Immediate Admin Verification Toggle */}
              {staff?.role === 'ADMIN' && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <input
                    type="checkbox"
                    id="mark-verified"
                    checked={markVerifiedImmediately}
                    onChange={(e) => setMarkVerifiedImmediately(e.target.checked)}
                    style={{ marginTop: '3px', accentColor: '#16a34a', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <div>
                    <label htmlFor="mark-verified" style={{ fontSize: '13px', fontWeight: 800, color: '#166534', cursor: 'pointer' }}>
                      Authorize and Verify Location Entrance Immediately
                    </label>
                    <p style={{ fontSize: '12px', color: '#15803d', margin: '2px 0 6px' }}>
                      As an authorized System Administrator, sign off on this entrance coordinate. If unchecked, the centre will require separate field audit before displaying verified badge to farmers.
                    </p>
                    {markVerifiedImmediately && (
                      <input
                        type="text"
                        placeholder="Optional verification notes (e.g. Field inspection confirmed on 19-Oct-2026)"
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #86efac',
                          fontSize: '12px',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Infrastructure, Hardware & Commodities */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
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
                    3. Infrastructure, Hardware &amp; Commodities
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Weighbridge units, moisture analyzers, Godown storage capacity, and accepted crop types.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Electronic Weighbridges
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={weighbridges}
                    onChange={(e) => setWeighbridges(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Digital Moisture Meters
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={moistureMeters}
                    onChange={(e) => setMoistureMeters(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Storage Capacity (MT)
                  </label>
                  <input
                    type="number"
                    value={storageCapacity}
                    onChange={(e) => setStorageCapacity(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Daily Quota (Qtl)
                  </label>
                  <input
                    type="number"
                    value={dailyQuota}
                    onChange={(e) => setDailyQuota(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Daily Token Limit
                  </label>
                  <input
                    type="number"
                    value={maxDailyTokens}
                    onChange={(e) => setMaxDailyTokens(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Procured Commodities (Select Applicable)
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Paddy (Common)', 'Paddy (Grade A)', 'Wheat', 'Bajara', 'Makka', 'Mustard', 'Gram (Chana)'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleCropToggle(c)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: crops.includes(c) ? '1px solid #16a34a' : '1px solid #cbd5e1',
                        background: crops.includes(c) ? '#f0fdf4' : '#ffffff',
                        color: crops.includes(c) ? '#166534' : '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {crops.includes(c) ? '✓ ' : '+ '} {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Operational Personnel */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fce7f3', color: '#be185d', padding: '8px', borderRadius: '8px' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    4. Centre In-Charge Contact Details
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Designated procurement supervisor for emergency dispatch and SMS updates.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    In-Charge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra Verma"
                    value={inchargeName}
                    onChange={(e) => setInchargeName(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Official Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9415248101"
                    value={inchargePhone}
                    onChange={(e) => setInchargePhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Official Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh.fcs@up.gov.in"
                    value={inchargeEmail}
                    onChange={(e) => setInchargeEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/centres')}
                style={{
                  padding: '11px 22px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '11px 26px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
                }}
              >
                <Save size={16} />
                Review &amp; Authorize Centre
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Review & Confirmation Modal (Requirement 1 & 2) */}
      {showConfirmModal && (
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
              maxWidth: '540px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                color: '#ffffff',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#60a5fa" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>Confirm Mandi Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>
                Please review the official centre metadata and GPS coordinates before final publication:
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Centre Code:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>{centreCode.toUpperCase()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Centre Name:</span>
                  <strong style={{ color: '#0f172a' }}>{centreName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Jurisdiction:</span>
                  <strong>{cityOrVillage || blockTehsil}, {district} ({pincode})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Gate Coordinates:</span>
                  <strong style={{ color: '#059669' }}>{latitude.toFixed(6)}° N, {longitude.toFixed(6)}° E</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Initial Status:</span>
                  <span
                    style={{
                      background: markVerifiedImmediately ? '#dcfce7' : '#fef3c7',
                      color: markVerifiedImmediately ? '#15803d' : '#b45309',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {markVerifiedImmediately ? 'VERIFIED' : 'PENDING VERIFICATION'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  Adjust Details
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#ffffff',
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
                  }}
                >
                  {isSubmitting ? 'Registering...' : 'Confirm & Save Mandi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
