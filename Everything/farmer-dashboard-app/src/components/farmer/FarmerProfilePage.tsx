import { useState, useRef, useEffect } from 'react'
import {
  BadgeCheck,
  Bell,
  Building,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  Edit2,
  FileCheck,
  FileText,
  Globe2,
  Headphones,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sprout,
  Trash2,
  Upload,
  UploadCloud,
  User,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin, updateFarmerProfile } from '../../auth'
import { navigate } from '../../router'
import FarmerSidebar from './FarmerSidebar'
import './FarmerDashboard.css'
import './FarmerProfilePage.css'

interface DigiDocument {
  id: string
  title: string
  issuer: string
  category: 'aadhaar' | 'land' | 'bank' | 'passbook' | 'farmer_id'
  docNumber: string
  verifiedDate: string
  uri: string
  fields: { label: string; value: string }[]
  signatory: string
}

interface FarmerData {
  name: string
  phone: string
  email: string
  dob: string
  gender: string
  maritalStatus: string
  farmerId: string
  village: string
  postOffice: string
  tehsil: string
  district: string
  state: string
  pincode: string
  primaryProduce: string
  landHolding: string
  khasraNo: string
  experience: string
  farmerType: string
  bankName: string
  bankAccount: string
  ifscCode: string
  preferredMandi: string
  vehicleNumber?: string
  profilePhoto?: string
}

export default function FarmerProfilePage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedDocKey, setSelectedDocKey] = useState<string | null>(null)
  const [digiConsentModalOpen, setDigiConsentModalOpen] = useState(false)
  const [consentAadhaar, setConsentAadhaar] = useState(true)
  const [consentLand, setConsentLand] = useState(true)
  const [consentBank, setConsentBank] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Editable Profile State loaded directly from user session
  const [profileData, setProfileData] = useState<FarmerData>({
    name: farmer.name || 'Ramesh Kumar Singh',
    phone: farmer.mobile ? (farmer.mobile.startsWith('+91') ? farmer.mobile : `+91 ${farmer.mobile}`) : '+91 92143 34494',
    email: farmer.email || 'rameshkumar@email.com',
    dob: farmer.dob || '15 March 1988',
    gender: farmer.gender || 'Male',
    maritalStatus: farmer.maritalStatus || 'Married',
    farmerId: farmer.farmerId || 'KS-FARM-2026-8942',
    village: farmer.village || 'Village Chiraigaon',
    postOffice: farmer.postOffice || 'Chiraigaon Post',
    tehsil: farmer.tehsil || 'Chiraigaon',
    district: farmer.district || 'Varanasi',
    state: farmer.state || 'Uttar Pradesh',
    pincode: farmer.pincode || '221112',
    primaryProduce: farmer.primaryProduce || 'Wheat (गेहूं) & Mustard (सरसों)',
    landHolding: farmer.landHolding || '3.50 Acres',
    khasraNo: farmer.khasraNo || '142/3 & 143/1',
    experience: farmer.experience || '12 Years',
    farmerType: farmer.farmerType || 'Small Farmer (Marginal)',
    bankName: farmer.bankName || 'State Bank of India',
    bankAccount: farmer.bankAccount || 'XXXX-XXXX-4321',
    ifscCode: farmer.ifscCode || 'SBIN0001234',
    preferredMandi: farmer.preferredMandi || 'Chiraigaon 1st at Gaurakala (FCS)',
    vehicleNumber: farmer.vehicleNumber || 'UP-65-TC-8942',
    profilePhoto: farmer.profilePhoto,
  })

  // Edit Form Temp State
  const [formState, setFormState] = useState<FarmerData>(profileData)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/profile')
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = getFarmerProfile()
      setProfileData({
        name: updated.name || 'Ramesh Kumar Singh',
        phone: updated.mobile ? (updated.mobile.startsWith('+91') ? updated.mobile : `+91 ${updated.mobile}`) : '+91 92143 34494',
        email: updated.email || 'rameshkumar@email.com',
        dob: updated.dob || '15 March 1988',
        gender: updated.gender || 'Male',
        maritalStatus: updated.maritalStatus || 'Married',
        farmerId: updated.farmerId || 'KS-FARM-2026-8942',
        village: updated.village || 'Village Chiraigaon',
        postOffice: updated.postOffice || 'Chiraigaon Post',
        tehsil: updated.tehsil || 'Chiraigaon',
        district: updated.district || 'Varanasi',
        state: updated.state || 'Uttar Pradesh',
        pincode: updated.pincode || '221112',
        primaryProduce: updated.primaryProduce || 'Wheat (गेहूं) & Mustard (सरसों)',
        landHolding: updated.landHolding || '3.50 Acres',
        khasraNo: updated.khasraNo || '142/3 & 143/1',
        experience: updated.experience || '12 Years',
        farmerType: updated.farmerType || 'Small Farmer (Marginal)',
        bankName: updated.bankName || 'State Bank of India',
        bankAccount: updated.bankAccount || 'XXXX-XXXX-4321',
        ifscCode: updated.ifscCode || 'SBIN0001234',
        preferredMandi: updated.preferredMandi || 'Chiraigaon 1st at Gaurakala (FCS)',
        vehicleNumber: updated.vehicleNumber || 'UP-65-TC-8942',
        profilePhoto: updated.profilePhoto,
      })
    }

    window.addEventListener('kisan_setu_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('kisan_setu_profile_updated', handleProfileUpdate)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Photo Upload Handler with Automatic Canvas Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      alert('Photo is larger than 8MB. Please choose a smaller photo.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      if (result) {
        const img = new Image()
        img.src = result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxDim = 320
          let width = img.width
          let height = img.height
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88)

          setProfileData((prev) => ({ ...prev, profilePhoto: compressedDataUrl }))
          setFormState((prev) => ({ ...prev, profilePhoto: compressedDataUrl }))
          updateFarmerProfile({ profilePhoto: compressedDataUrl })
          alert('Profile photo uploaded and updated across your dashboard successfully!')
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    if (confirm('Remove current profile photo?')) {
      setProfileData((prev) => ({ ...prev, profilePhoto: undefined }))
      setFormState((prev) => ({ ...prev, profilePhoto: undefined }))
      updateFarmerProfile({ profilePhoto: undefined })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleOpenEdit = () => {
    setFormState(profileData)
    setEditModalOpen(true)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileData(formState)
    updateFarmerProfile({
      name: formState.name,
      mobile: formState.phone.replace('+91', '').trim(),
      email: formState.email,
      dob: formState.dob,
      gender: formState.gender,
      maritalStatus: formState.maritalStatus,
      village: formState.village,
      postOffice: formState.postOffice,
      tehsil: formState.tehsil,
      district: formState.district,
      state: formState.state,
      pincode: formState.pincode,
      primaryProduce: formState.primaryProduce,
      landHolding: formState.landHolding,
      khasraNo: formState.khasraNo,
      experience: formState.experience,
      farmerType: formState.farmerType,
      bankName: formState.bankName,
      bankAccount: formState.bankAccount,
      ifscCode: formState.ifscCode,
      preferredMandi: formState.preferredMandi,
      vehicleNumber: formState.vehicleNumber,
      profilePhoto: formState.profilePhoto,
    })
    setEditModalOpen(false)
    alert('Farmer profile information updated successfully!')
  }

  const handleSyncDigiLocker = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setDigiConsentModalOpen(false)
      alert('DigiLocker documents synchronized successfully! All credentials are 100% verified.')
    }, 900)
  }

  // Dynamic DigiLocker Documents populated with real farmer profile data
  const dynamicDigiDocs: Record<string, DigiDocument> = {
    aadhaar: {
      id: 'doc-aadhaar',
      title: 'Aadhaar Card (UIDAI Verified)',
      issuer: 'Unique Identification Authority of India (UIDAI)',
      category: 'aadhaar',
      docNumber: `XXXX-XXXX-${farmer.farmerId?.slice(-4) || '8942'}`,
      verifiedDate: '12 Aug 2025, 11:30 AM',
      uri: `in.gov.uidai.aadhaar-${farmer.farmerId?.slice(-4) || '8942'}`,
      fields: [
        { label: 'Cardholder Name', value: profileData.name },
        { label: 'Aadhaar Number', value: `XXXX-XXXX-${farmer.farmerId?.slice(-4) || '8942'}` },
        { label: 'Date of Birth', value: profileData.dob },
        { label: 'Gender', value: profileData.gender },
        { label: 'Registered Mobile', value: profileData.phone },
        { label: 'Permanent Address', value: `${profileData.village}, Tehsil ${profileData.tehsil}, ${profileData.district}, ${profileData.state} - ${profileData.pincode}` },
        { label: 'Authentication Mode', value: 'Biometric & Aadhaar OTP KYC' },
        { label: 'Verification Status', value: 'Digitally Signed & Valid' },
      ],
      signatory: 'Digitally Signed by UIDAI Sub-CA Certificate Server',
    },
    land: {
      id: 'doc-land',
      title: 'Land Record - Khasra & RoR Certificate',
      issuer: `Department of Revenue, Govt. of ${profileData.state} (Bhulekh)`,
      category: 'land',
      docNumber: `UP-VNS-KH-${farmer.farmerId?.slice(-4) || '142'}`,
      verifiedDate: '15 Aug 2025, 02:45 PM',
      uri: 'in.gov.up.revenue.ror-142-3',
      fields: [
        { label: 'Landowner Name', value: `${profileData.name} s/o Ram Singh` },
        { label: 'Khasra / Survey No', value: `${profileData.khasraNo || '142/3'} (${profileData.landHolding})` },
        { label: 'Total Landholding', value: `${profileData.landHolding} (Irrigated Agricultural)` },
        { label: 'Land Classification', value: 'Chahi / Barani (Irrigated Agricultural)' },
        { label: 'Tehsil & District', value: `Tehsil ${profileData.tehsil}, District ${profileData.district}` },
        { label: 'Patwar Circle', value: `${profileData.village} Circle No. 04` },
        { label: 'Approved Crops', value: profileData.primaryProduce },
        { label: 'Soil Health Score', value: 'Optimal (Organic Carbon 0.68%)' },
      ],
      signatory: `Digitally Certified by Tehsildar & Revenue Officer, ${profileData.district} Division`,
    },
    bank: {
      id: 'doc-bank',
      title: 'Bank Account & PFMS DBT Verification',
      issuer: 'Public Financial Management System (PFMS) & NPCI',
      category: 'bank',
      docNumber: `PFMS-VAL-${farmer.farmerId?.slice(-4) || '9832'}`,
      verifiedDate: '18 Aug 2025, 04:10 PM',
      uri: 'in.gov.pfms.dbt-sbi-4321',
      fields: [
        { label: 'Account Holder Name', value: profileData.name },
        { label: 'Bank Name', value: profileData.bankName },
        { label: 'Account Number', value: profileData.bankAccount },
        { label: 'IFSC Code', value: `${profileData.ifscCode} (${profileData.district} Branch)` },
        { label: 'Aadhaar Seeding Status', value: 'Seeded & Active on NPCI Mapper' },
        { label: 'DBT Scheme Mapping', value: 'PM-KISAN & APMC MSP Direct Transfer' },
        { label: 'PFMS Validation Code', value: 'VALIDATED_OK_01' },
        { label: 'Transfer Assurance', value: 'Instant Direct Credit Enabled' },
      ],
      signatory: 'PFMS Central Clearing & NPCI e-Mandate Verification Authority',
    },
    passbook: {
      id: 'doc-passbook',
      title: 'Official Bank Passbook Document',
      issuer: `${profileData.bankName} (Digital Records)`,
      category: 'passbook',
      docNumber: `PB-${farmer.farmerId?.slice(-4) || '4321'}`,
      verifiedDate: '18 Aug 2025, 04:15 PM',
      uri: 'in.bank.sbi.passbook-4321',
      fields: [
        { label: 'Customer Name', value: profileData.name },
        { label: 'CIF Number', value: `89421${farmer.farmerId?.slice(-4) || '098234'}` },
        { label: 'Branch Name', value: `${profileData.preferredMandi || profileData.district} Mandi Complex` },
        { label: 'Account Type', value: 'Regular Savings Bank (Agri DBT)' },
        { label: 'Account Number', value: profileData.bankAccount },
        { label: 'MICR Code', value: `${profileData.pincode?.slice(0, 6) || '221002'}005` },
        { label: 'Status', value: 'KYC Compliant & Active' },
      ],
      signatory: 'Bank Electronic Vault Authentication Server',
    },
    farmer_id: {
      id: 'doc-farmer_id',
      title: 'PM-KISAN & Farmer Registry Certificate',
      issuer: 'Ministry of Agriculture & Farmers Welfare, Govt. of India',
      category: 'farmer_id',
      docNumber: profileData.farmerId,
      verifiedDate: '10 Aug 2025, 09:00 AM',
      uri: `in.gov.agricoop.farmer-${profileData.farmerId}`,
      fields: [
        { label: 'Farmer Registration ID', value: profileData.farmerId },
        { label: 'PM-KISAN Beneficiary ID', value: `PMK-UP-${profileData.district.slice(0, 3).toUpperCase()}-${farmer.farmerId?.slice(-4) || '9842'}` },
        { label: 'Farmer Category', value: profileData.farmerType },
        { label: 'State & District', value: `${profileData.state}, ${profileData.district}` },
        { label: 'Preferred Procurement Mandi', value: profileData.preferredMandi },
        { label: 'Aadhaar e-KYC', value: 'Completed & Verified' },
        { label: 'Validity Period', value: '2025 - 2030 (Rabi/Kharif Active)' },
      ],
      signatory: 'Ministry of Agriculture & Farmers Welfare Electronic Verification Desk',
    },
  }
  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]
  const currentDoc = selectedDocKey ? dynamicDigiDocs[selectedDocKey] : null

  return (
    <div className="profile-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="profile"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="pf-main-content">
        {/* Top Header Bar */}
        <header className="fd-topbar">
          <div className="fd-greeting">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="fd-icon-btn fd-mobile-toggle"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle Menu"
              >
                <Menu size={20} />
              </button>
              <h1>My Farmer Profile</h1>
            </div>
            <p>Verified DigiLocker credentials, revenue land survey, and direct PFMS bank benefit settings.</p>
          </div>

          <div className="fd-topbar-actions">
            {/* Language Selector Dropdown */}
            <div className="ks-lang-wrapper" ref={dropdownRef}>
              <button
                className={`ks-lang-btn ${langMenuOpen ? 'open' : ''}`}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change Language"
              >
                <Globe2 size={14} />
                <span>{activeLangObj.nativeName}</span>
                <ChevronDown size={12} className="ks-lang-arrow" />
              </button>

              {langMenuOpen && (
                <div className="ks-lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`ks-lang-option ${currentLang === lang.code ? 'selected' : ''}`}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLangMenuOpen(false)
                      }}
                    >
                      <span className="ks-lang-native">{lang.nativeName}</span>
                      <span className="ks-lang-english">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              className="fd-icon-btn"
              onClick={() => alert('Profile KYC status: 100% Verified by APMC Nodal Authority & DigiLocker.')}
              aria-label="Notifications"
            >
              <Bell size={17} />
            </button>

            {/* Farmer Avatar Pill */}
            <div
              className="fd-avatar-pill"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              title="Farmer Profile (Active)"
            >
              <div className="fd-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
                {profileData.profilePhoto ? (
                  <img
                    src={profileData.profilePhoto}
                    alt={profileData.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  profileData.name ? profileData.name.substring(0, 2).toUpperCase() : 'RK'
                )}
              </div>
              <span className="fd-avatar-name">{profileData.name.split(' ')[0] || 'Farmer'}</span>
            </div>
          </div>
        </header>

        {/* 3-Column Profile Grid */}
        <div className="pf-grid">
          {/* ====================================================================
              Column 1: Avatar Card & Security
              ==================================================================== */}
          <div>
            {/* User Avatar Card with Photo Upload */}
            <div className="pf-card pf-avatar-card">
              <div className="pf-avatar-wrapper" style={{ position: 'relative' }}>
                {profileData.profilePhoto ? (
                  <img
                    src={profileData.profilePhoto}
                    alt={profileData.name}
                    style={{
                      width: '92px',
                      height: '92px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #16a34a',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
                    }}
                  />
                ) : (
                  <div className="pf-avatar-lg">
                    {profileData.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <label
                  className="pf-avatar-edit"
                  title="Upload / Change Profile Photo"
                  style={{ cursor: 'pointer' }}
                >
                  <Camera size={14} />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {/* Upload & Remove Photo Actions */}
              <div className="pf-photo-actions">
                <label className="pf-photo-upload-btn">
                  <Upload size={12} /> {profileData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                {profileData.profilePhoto && (
                  <button
                    type="button"
                    className="pf-photo-remove-btn"
                    onClick={handleRemovePhoto}
                    title="Remove Profile Photo"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>

              <h2>{profileData.name}</h2>
              <div className="pf-verified-badge">
                <BadgeCheck size={14} /> Verified Farmer • ID: {profileData.farmerId}
              </div>

              <div className="pf-contact-list">
                <div className="pf-contact-item">
                  <Phone size={16} />
                  <span>{profileData.phone}</span>
                </div>
                <div className="pf-contact-item">
                  <Mail size={16} />
                  <span>{profileData.email}</span>
                </div>
                <div className="pf-contact-item">
                  <MapPin size={16} />
                  <span>{profileData.village}, {profileData.district}, {profileData.state}</span>
                </div>
                <div className="pf-contact-item">
                  <Calendar size={16} />
                  <div>
                    <small style={{ color: '#64748b', display: 'block', fontSize: '10.5px' }}>Member Since</small>
                    <span>15 July 2025</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="pf-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Shield size={18} color="#0d631b" />
                <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Account Security
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f2' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Access PIN / Password</strong>
                    <small style={{ color: '#64748b' }}>6-Digit PIN Configured</small>
                  </div>
                  <button
                    style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: '99px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#0d631b', cursor: 'pointer' }}
                    onClick={() => alert('Password / PIN reset link sent to your registered mobile.')}
                  >
                    Change
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f2' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Two-Factor Authentication</strong>
                    <small style={{ color: '#16a34a', fontWeight: 700 }}>✓ Active (SMS OTP)</small>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a' }}>Aadhaar e-KYC</strong>
                    <small style={{ color: '#16a34a', fontWeight: 700 }}>✓ Digitally Verified via UIDAI</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================================
              Column 2: Profile Details, Farming & Bank Information
              ==================================================================== */}
          <div>
            <div className="pf-card">
              {/* Personal Information */}
              <div className="pf-section-header">
                <div className="pf-section-title">
                  <User size={18} color="#0d631b" />
                  <h3>Personal Information</h3>
                </div>
                <button className="pf-edit-btn" onClick={handleOpenEdit}>
                  <Edit2 size={13} /> Edit Profile
                </button>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field-item">
                  <label>Full Name</label>
                  <div className="pf-field-val">{profileData.name}</div>
                </div>
                <div className="pf-field-item">
                  <label>Phone Number</label>
                  <div className="pf-field-val">{profileData.phone}</div>
                </div>
                <div className="pf-field-item">
                  <label>Email Address</label>
                  <div className="pf-field-val">{profileData.email}</div>
                </div>
                <div className="pf-field-item">
                  <label>Date of Birth</label>
                  <div className="pf-field-val">{profileData.dob}</div>
                </div>
                <div className="pf-field-item">
                  <label>Gender</label>
                  <div className="pf-field-val">{profileData.gender}</div>
                </div>
                <div className="pf-field-item">
                  <label>Marital Status</label>
                  <div className="pf-field-val">{profileData.maritalStatus}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }} />

              {/* Address */}
              <div className="pf-section-header">
                <div className="pf-section-title">
                  <MapPin size={18} color="#0d631b" />
                  <h3>Residential Address</h3>
                </div>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field-item">
                  <label>Village</label>
                  <div className="pf-field-val">{profileData.village}</div>
                </div>
                <div className="pf-field-item">
                  <label>Post Office</label>
                  <div className="pf-field-val">{profileData.postOffice}</div>
                </div>
                <div className="pf-field-item">
                  <label>Tehsil / Sub-District</label>
                  <div className="pf-field-val">{profileData.tehsil}</div>
                </div>
                <div className="pf-field-item">
                  <label>District</label>
                  <div className="pf-field-val">{profileData.district}</div>
                </div>
                <div className="pf-field-item">
                  <label>State</label>
                  <div className="pf-field-val">{profileData.state}</div>
                </div>
                <div className="pf-field-item">
                  <label>PIN Code</label>
                  <div className="pf-field-val">{profileData.pincode}</div>
                </div>
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }} />

              {/* Farming Information */}
              <div className="pf-section-header">
                <div className="pf-section-title">
                  <Sprout size={18} color="#0d631b" />
                  <h3>Farming Information &amp; Landholdings</h3>
                </div>
              </div>

              <div className="pf-farming-grid">
                <div className="pf-farming-box">
                  <span>Primary Produce</span>
                  <strong>🌾 {profileData.primaryProduce}</strong>
                </div>
                <div className="pf-farming-box">
                  <span>Land Holding</span>
                  <strong>{profileData.landHolding}</strong>
                </div>
                <div className="pf-farming-box">
                  <span>Khasra / Survey No</span>
                  <strong>{profileData.khasraNo}</strong>
                </div>
                <div className="pf-farming-box">
                  <span>Farmer Category</span>
                  <strong>{profileData.farmerType}</strong>
                </div>
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '20px 0' }} />

              {/* Bank Account & Direct Benefit Transfer */}
              <div className="pf-section-header">
                <div className="pf-section-title">
                  <Building size={18} color="#0d631b" />
                  <h3>Bank Account &amp; PFMS DBT Direct Settlement</h3>
                </div>
              </div>

              <div className="pf-fields-grid">
                <div className="pf-field-item">
                  <label>Bank Name</label>
                  <div className="pf-field-val">{profileData.bankName}</div>
                </div>
                <div className="pf-field-item">
                  <label>Account Number</label>
                  <div className="pf-field-val">{profileData.bankAccount}</div>
                </div>
                <div className="pf-field-item">
                  <label>IFSC Code</label>
                  <div className="pf-field-val">{profileData.ifscCode}</div>
                </div>
                <div className="pf-field-item">
                  <label>Preferred Procurement Mandi</label>
                  <div className="pf-field-val">{profileData.preferredMandi}</div>
                </div>
                <div className="pf-field-item">
                  <label>Transport Vehicle Number</label>
                  <div className="pf-field-val">{profileData.vehicleNumber || 'Not Registered'}</div>
                </div>
                <div className="pf-field-item">
                  <label>Aadhaar Seeding Status</label>
                  <div className="pf-field-val" style={{ color: '#16a34a', fontWeight: 800 }}>✓ Seeded on NPCI Mapper</div>
                </div>
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="pf-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ffffff', color: '#0d631b', display: 'grid', placeItems: 'center', border: '1px solid #86efac', flexShrink: 0 }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block' }}>
                    DigiLocker &amp; Government Verified Profile
                  </strong>
                  <small style={{ color: '#15803d' }}>
                    Aadhaar, Khasra Land Records, and DBT Bank Accounts are 100% verified.
                  </small>
                </div>
              </div>

              <button
                className="pf-edit-btn"
                style={{ borderColor: '#86efac', background: '#ffffff' }}
                onClick={() => setDigiConsentModalOpen(true)}
              >
                <RefreshCw size={12} /> Sync DigiLocker
              </button>
            </div>
          </div>

          {/* ====================================================================
              Column 3: DigiLocker Documents, Preferences & Help
              ==================================================================== */}
          <div className="pf-right-column">
            {/* DigiLocker Documents Card */}
            <div className="pf-card">
              <div className="pf-digilocker-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={18} color="#0d631b" />
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    DigiLocker Vault
                  </h3>
                </div>
                <span className="pf-digi-logo-badge">
                  <Lock size={11} /> DigiLocker
                </span>
              </div>

              <div className="pf-doc-list">
                {/* 1. Aadhaar Card */}
                <div className="pf-doc-item" onClick={() => setSelectedDocKey('aadhaar')}>
                  <div className="pf-doc-info">
                    <KeyRound size={16} color="#0d631b" />
                    <div className="pf-doc-info-text">
                      <strong>Aadhaar Card</strong>
                      <small>UIDAI • XXXX-{farmer.farmerId?.slice(-4) || '8942'}</small>
                    </div>
                  </div>
                  <span className="pf-doc-badge">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>

                {/* 2. Land Khasra */}
                <div className="pf-doc-item" onClick={() => setSelectedDocKey('land')}>
                  <div className="pf-doc-info">
                    <FileText size={16} color="#0d631b" />
                    <div className="pf-doc-info-text">
                      <strong>Land Khasra Proof</strong>
                      <small>Bhulekh • {profileData.khasraNo}</small>
                    </div>
                  </div>
                  <span className="pf-doc-badge">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>

                {/* 3. Bank Account */}
                <div className="pf-doc-item" onClick={() => setSelectedDocKey('bank')}>
                  <div className="pf-doc-info">
                    <Building size={16} color="#0d631b" />
                    <div className="pf-doc-info-text">
                      <strong>Bank Details (PFMS)</strong>
                      <small>{profileData.bankName.slice(0, 8)} • {profileData.bankAccount.slice(-4)}</small>
                    </div>
                  </div>
                  <span className="pf-doc-badge">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>

                {/* 4. Bank Passbook */}
                <div className="pf-doc-item" onClick={() => setSelectedDocKey('passbook')}>
                  <div className="pf-doc-info">
                    <CreditCard size={16} color="#0d631b" />
                    <div className="pf-doc-info-text">
                      <strong>Bank Passbook</strong>
                      <small>e-Passbook Record</small>
                    </div>
                  </div>
                  <span className="pf-doc-badge">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>

                {/* 5. PM-KISAN / Farmer ID */}
                <div className="pf-doc-item" onClick={() => setSelectedDocKey('farmer_id')}>
                  <div className="pf-doc-info">
                    <Sprout size={16} color="#0d631b" />
                    <div className="pf-doc-info-text">
                      <strong>Farmer Registry ID</strong>
                      <small>PM-KISAN • {profileData.farmerId}</small>
                    </div>
                  </div>
                  <span className="pf-doc-badge">
                    <CheckCircle2 size={10} /> Verified
                  </span>
                </div>
              </div>

              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', marginTop: '12px', fontSize: '12px', padding: '8px' }}
                onClick={() => setDigiConsentModalOpen(true)}
              >
                <UploadCloud size={14} /> Sync More Documents from DigiLocker
              </button>
            </div>

            {/* Preferences Card */}
            <div className="pf-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Globe2 size={18} color="#0d631b" />
                <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Preferences
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f1f5f2' }}>
                  <span style={{ color: '#475569' }}>Language</span>
                  <strong style={{ color: '#0d631b' }}>{activeLangObj.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f1f5f2' }}>
                  <span style={{ color: '#475569' }}>Mandi Units</span>
                  <strong style={{ color: '#0f172a' }}>Quintal (qtl)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>Alert Mode</span>
                  <strong style={{ color: '#0f172a' }}>WhatsApp + SMS</strong>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="pf-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Headphones size={18} color="#166534" />
                <strong style={{ fontSize: '14px', color: '#166534' }}>Need Profile Support?</strong>
              </div>
              <p style={{ fontSize: '11.5px', color: '#15803d', margin: '0 0 12px' }}>
                For landholding title updates or bank DBT re-seeding, contact your local APMC centre nodal officer.
              </p>
              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', borderColor: '#86efac' }}
                onClick={() => window.open('https://wa.me/919214334494', '_blank')}
              >
                Contact APMC Helpdesk →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==========================================================================
          DigiLocker Verified Document Certificate Viewer Modal
          ========================================================================== */}
      {currentDoc && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '580px' }}>
            <div className="fd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pf-digi-logo-badge">
                  <Lock size={12} /> DigiLocker Verified
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>URI: {currentDoc.uri}</span>
              </div>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedDocKey(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pf-cert-wrapper">
              <div className="pf-cert-watermark">DIGILOCKER</div>

              {/* Certificate Header */}
              <div className="pf-cert-top-bar">
                <div className="pf-cert-emblem">
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#0d631b', color: '#ffffff', display: 'grid', placeItems: 'center' }}>
                    <BadgeCheck size={24} />
                  </div>
                  <div>
                    <h4>{currentDoc.title}</h4>
                    <p>{currentDoc.issuer}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <QrCode size={36} color="#0d631b" />
                  <span style={{ fontSize: '9px', color: '#166534', fontWeight: 800, marginTop: '2px' }}>
                    SECURE QR
                  </span>
                </div>
              </div>

              {/* Document Fields Grid */}
              <div className="pf-cert-body-grid">
                {currentDoc.fields.map((f, idx) => (
                  <div key={idx} className="pf-cert-field">
                    <span className="pf-cert-label">{f.label}</span>
                    <strong className="pf-cert-val">{f.value}</strong>
                  </div>
                ))}
              </div>

              {/* Verification Stamp Footer */}
              <div className="pf-cert-footer">
                <div className="pf-cert-signature">
                  <CheckCircle2 size={15} color="#166534" />
                  <span>{currentDoc.signatory}</span>
                </div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
                  Verified: {currentDoc.verifiedDate}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="fd-card-btn primary"
                  onClick={() => alert(`Downloading verified copy of ${currentDoc.title}...`)}
                >
                  <Download size={15} /> Download PDF Copy
                </button>
                <button
                  type="button"
                  className="fd-card-btn secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          DigiLocker Consent & Sync Modal
          ========================================================================== */}
      {digiConsentModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '520px' }}>
            <div className="fd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
                  <Lock size={15} />
                </div>
                <h2 style={{ fontSize: '17px' }}>DigiLocker Consent Request</h2>
              </div>
              <button
                className="fd-modal-close"
                onClick={() => setDigiConsentModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '6px 0' }}>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
                Kisan Setu requires your consent to securely fetch and verify digital records from your DigiLocker repository for instant gate pass generation and DBT transfers:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentAadhaar}
                    onChange={(e) => setConsentAadhaar(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Aadhaar Card (UIDAI)</strong>
                    <small style={{ color: '#64748b' }}>For identity verification and biometric e-KYC matching.</small>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentLand}
                    onChange={(e) => setConsentLand(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Land Record / Khasra RoR (Bhulekh)</strong>
                    <small style={{ color: '#64748b' }}>For verifying landholding acreage and authenticating crop quota.</small>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={consentBank}
                    onChange={(e) => setConsentBank(e.target.checked)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Bank Account &amp; Passbook Proof (PFMS)</strong>
                    <small style={{ color: '#64748b' }}>For zero-delay MSP payment transfers directly to your bank account.</small>
                  </div>
                </label>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#1e40af', marginBottom: '16px' }}>
                🔒 <strong>Privacy Assurance:</strong> Your consent is digitally recorded. Documents are verified cryptographically and never shared with third parties.
              </div>

              <button
                type="button"
                className="fd-card-btn primary"
                disabled={isSyncing || (!consentAadhaar && !consentLand && !consentBank)}
                onClick={handleSyncDigiLocker}
                style={{ padding: '12px' }}
              >
                {isSyncing ? 'Authenticating with DigiLocker...' : 'Agree & Fetch Verified Documents →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Edit Profile Modal
          ========================================================================== */}
      {editModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '640px' }}>
            <div className="fd-modal-header">
              <h2>Edit Farmer Profile</h2>
              <button
                className="fd-modal-close"
                onClick={() => setEditModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="fd-modal-form">
              <div className="fd-modal-field">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                />
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Village *</label>
                  <input
                    type="text"
                    required
                    value={formState.village}
                    onChange={(e) => setFormState({ ...formState, village: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Tehsil *</label>
                  <input
                    type="text"
                    required
                    value={formState.tehsil}
                    onChange={(e) => setFormState({ ...formState, tehsil: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>District *</label>
                  <input
                    type="text"
                    required
                    value={formState.district}
                    onChange={(e) => setFormState({ ...formState, district: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formState.pincode}
                    onChange={(e) => setFormState({ ...formState, pincode: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Total Land Holding *</label>
                  <input
                    type="text"
                    required
                    value={formState.landHolding}
                    onChange={(e) => setFormState({ ...formState, landHolding: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Khasra / Survey Number *</label>
                  <input
                    type="text"
                    required
                    value={formState.khasraNo}
                    onChange={(e) => setFormState({ ...formState, khasraNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Primary Produce *</label>
                  <input
                    type="text"
                    required
                    value={formState.primaryProduce}
                    onChange={(e) => setFormState({ ...formState, primaryProduce: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Farmer Category *</label>
                  <input
                    type="text"
                    required
                    value={formState.farmerType}
                    onChange={(e) => setFormState({ ...formState, farmerType: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.bankName}
                    onChange={(e) => setFormState({ ...formState, bankName: e.target.value })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={formState.bankAccount}
                    onChange={(e) => setFormState({ ...formState, bankAccount: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-modal-grid-2">
                <div className="fd-modal-field">
                  <label>Bank IFSC Code *</label>
                  <input
                    type="text"
                    required
                    value={formState.ifscCode}
                    onChange={(e) => setFormState({ ...formState, ifscCode: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="fd-modal-field">
                  <label>Transport Vehicle Number</label>
                  <input
                    type="text"
                    value={formState.vehicleNumber || ''}
                    onChange={(e) => setFormState({ ...formState, vehicleNumber: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="fd-card-btn primary"
                style={{ padding: '12px', marginTop: '8px' }}
              >
                <CheckCircle2 size={16} /> Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
