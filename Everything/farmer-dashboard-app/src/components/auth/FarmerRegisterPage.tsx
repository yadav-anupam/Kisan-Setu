import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import farmerHeroImg from '../../assets/hero-farmer.png'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import { loginFarmer, getAndClearRedirectAfterLogin } from '../../auth'
import {
  ALL_PROCUREMENT_CENTRES,
  VARANASI_PROCUREMENT_CENTRES,
  CHANDAULI_PROCUREMENT_CENTRES,
  GHAZIPUR_PROCUREMENT_CENTRES,
  JAUNPUR_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import './FarmerRegisterPage.css'

export default function FarmerRegisterPage() {
  const { currentLang, setLanguage, t, languages } = useLanguage()
  const fr = t.farmerRegister

  // Multi-step state: 1 | 2 | 3 | 4 (success)
  const [step, setStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [farmerId, setFarmerId] = useState('')

  // DigiLocker Consent Modal & Sync State
  const [digiConsentOpen, setDigiConsentOpen] = useState(false)
  const [isDigiSyncing, setIsDigiSyncing] = useState(false)
  const [isDigiVerified, setIsDigiVerified] = useState(false)
  const [consentAadhaar, setConsentAadhaar] = useState(true)
  const [consentLand, setConsentLand] = useState(true)
  const [consentBank, setConsentBank] = useState(true)

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '1988-03-15',
    gender: 'Male',
    maritalStatus: 'Married',
    aadhaarLast4: '',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    tehsil: 'Chiraigaon',
    village: '',
    postOffice: '',
    pincode: '221112',
    landCategory: 'Small (1 - 2 Hectares)',
    landHolding: '3.50 Acres',
    khasraNo: '',
    experience: '12 Years',
    crop: 'Wheat (गेहूं)',
    quantity: '50',
    preferredMandi: ALL_PROCUREMENT_CENTRES[0].centreName,
    bankName: 'State Bank of India',
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    vehicleNumber: '',
    pin: '',
    confirmPin: '',
  })

  const [showPin, setShowPin] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }))
  }

  // Handle DigiLocker 1-Click Verification & Consent Auto-Fill
  const handleDigiLockerConsent = () => {
    setIsDigiSyncing(true)
    setTimeout(() => {
      setIsDigiSyncing(false)
      setIsDigiVerified(true)
      setFormData({
        fullName: 'Ramesh Kumar Singh',
        mobile: '9214334494',
        email: 'ramesh.singh@email.com',
        dob: '1988-03-15',
        gender: 'Male',
        maritalStatus: 'Married',
        aadhaarLast4: '8942',
        state: 'Uttar Pradesh',
        district: 'Varanasi',
        tehsil: 'Chiraigaon',
        village: 'Village Chiraigaon',
        postOffice: 'Chiraigaon Post',
        pincode: '221112',
        landCategory: 'Small (1 - 2 Hectares)',
        landHolding: '3.50 Acres (1.41 Hectares)',
        khasraNo: '142/3 & 143/1',
        experience: '12 Years',
        crop: 'Wheat (गेहूं)',
        quantity: '65',
        preferredMandi: 'Chiraigaon 1st at Gaurakala (FCS)',
        bankName: 'State Bank of India',
        accountNumber: '392847291048',
        confirmAccount: '392847291048',
        ifsc: 'SBIN0001234',
        vehicleNumber: 'UP-65-TC-8942',
        pin: '123456',
        confirmPin: '123456',
      })
      setDigiConsentOpen(false)
      alert('DigiLocker verified! Aadhaar, Land Khasra (3.50 Acres), and SBI DBT Bank account auto-filled.')
    }, 1000)
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!formData.fullName || formData.mobile.length < 10) {
        alert('Please enter your full name and 10-digit mobile number')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.village || !formData.khasraNo) {
        alert('Please fill in your village and land khasra survey number')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!formData.accountNumber || !formData.ifsc || !formData.pin) {
        alert('Please fill in bank account and create a 6-digit PIN')
        return
      }
      if (formData.pin !== formData.confirmPin) {
        alert('6-digit PIN and confirmation PIN do not match')
        return
      }
      setIsSubmitting(true)
      setTimeout(() => {
        const generatedId = `KS-FARM-2026-${Math.floor(1000 + Math.random() * 9000)}`
        setFarmerId(generatedId)
        loginFarmer({
          name: formData.fullName || 'Ramesh Kumar Singh',
          mobile: formData.mobile || '9214334494',
          email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@email.com`,
          dob: formData.dob || '15 March 1988',
          gender: formData.gender || 'Male',
          maritalStatus: formData.maritalStatus || 'Married',
          farmerId: generatedId,
          state: formData.state,
          district: formData.district,
          tehsil: formData.tehsil || 'Chiraigaon',
          village: formData.village || 'Village Chiraigaon',
          postOffice: formData.postOffice || 'Chiraigaon Post',
          pincode: formData.pincode || '221112',
          preferredMandi: formData.preferredMandi,
          primaryProduce: formData.crop,
          landHolding: formData.landHolding || '3.5 Acre',
          khasraNo: formData.khasraNo || '142/3',
          experience: formData.experience || '12 Years',
          farmerType: formData.landCategory || 'Small Farmer (Marginal)',
          bankAccount: formData.accountNumber || 'XXXX-XXXX-4321',
          bankName: formData.bankName || 'State Bank of India',
          ifscCode: formData.ifsc || 'SBIN0001234',
          vehicleNumber: formData.vehicleNumber || 'UP-65-TC-8942',
        })
        setIsSubmitting(false)
        setStep(4)
      }, 900)
    }
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="farmer-reg-page">
      <div className="fr-split-container">
        {/* ==========================================================================
            Left Side: Visual Branding & Milestones
            ========================================================================== */}
        <section className="fr-story-panel">
          <div
            className="fr-story-bg-image"
            style={{ backgroundImage: `url(${farmerHeroImg})` }}
          />

          <div className="fr-story-content">
            {/* Logo */}
            <a href="/" className="fr-brand-header" onClick={(e) => { e.preventDefault(); navigate('/') }}>
              <img src={logoImg} alt="Kisan Setu Logo" className="fr-logo-img" />
              <div className="fr-brand-text">
                <strong>{t.brandName}</strong>
                <small>National Agri-Procurement Portal</small>
              </div>
            </a>

            {/* Story Copy */}
            <div className="fr-story-copy">
              <div className="fr-story-badge">
                <ShieldCheck size={14} /> Official APMC &amp; MSP Platform
              </div>
              <h2 className="fr-story-title">
                Direct Selling, Instant Gate Entry &amp; Guaranteed DBT Payments
              </h2>
              <p className="fr-story-desc">
                Register once with Aadhaar or DigiLocker to book digital tokens, monitor live weighbridge queues, and receive 100% fair MSP settlements directly in your bank account.
              </p>
            </div>

            {/* Milestones Vertical Steps */}
            <div className="fr-milestones-list">
              <div className={`fr-milestone-item ${step >= 1 ? 'active' : ''}`}>
                <div className="fr-milestone-icon">1</div>
                <div className="fr-milestone-body">
                  <strong>DigiLocker Identity &amp; Profile</strong>
                  <p>Aadhaar e-KYC and farmer contact details.</p>
                </div>
              </div>

              <div className={`fr-milestone-item ${step >= 2 ? 'active' : ''}`}>
                <div className="fr-milestone-icon">2</div>
                <div className="fr-milestone-body">
                  <strong>Landholding &amp; Khasra Records</strong>
                  <p>Certified Bhulekh land survey numbers &amp; produce.</p>
                </div>
              </div>

              <div className={`fr-milestone-item ${step >= 3 ? 'active' : ''}`}>
                <div className="fr-milestone-icon">3</div>
                <div className="fr-milestone-body">
                  <strong>Aadhaar-Seeded Bank &amp; Passbook Proof</strong>
                  <p>Direct Benefit Transfer (DBT) setup via PFMS.</p>
                </div>
              </div>
            </div>

            {/* Trust Pill */}
            <div className="fr-trust-pill">
              <UserCheck size={16} /> 2.4+ Lakh Farmers Verified across 450+ APMC Mandis
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Right Side: Registration Wizard Form
            ========================================================================== */}
        <section className="fr-form-panel">
          {/* Top Bar: Back & Language */}
          <div className="fr-top-nav">
            <button
              type="button"
              className="fr-back-link"
              onClick={() => {
                if (step > 1 && step < 4) setStep(step - 1)
                else navigate('/')
              }}
            >
              <ArrowLeft size={16} />
              <span>{step > 1 && step < 4 ? 'Back to Previous Step' : 'Back to Home'}</span>
            </button>

            {/* Language Selector */}
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
          </div>

          {/* Progress Bar (Steps 1-3) */}
          {step < 4 && (
            <div className="fr-progress-bar">
              <div className="fr-step-line" />
              <div className={`fr-step-node ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="fr-step-circle">{step > 1 ? '✓' : '1'}</div>
                <span className="fr-step-label">Personal</span>
              </div>
              <div className={`fr-step-node ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="fr-step-circle">{step > 2 ? '✓' : '2'}</div>
                <span className="fr-step-label">Land &amp; Crop</span>
              </div>
              <div className={`fr-step-node ${step === 3 ? 'active' : ''}`}>
                <div className="fr-step-circle">3</div>
                <span className="fr-step-label">Bank &amp; Docs</span>
              </div>
            </div>
          )}

          {/* DigiLocker Fast Track Banner */}
          {step < 4 && (
            <div className="fr-digilocker-fast-card">
              <div className="fr-digi-left">
                <div className="fr-digi-badge-icon">
                  <Lock size={18} />
                </div>
                <div className="fr-digi-text">
                  <h4>⚡ Fast-Track Registration via DigiLocker</h4>
                  <p>
                    {isDigiVerified
                      ? '✓ Verified: Aadhaar, Land Khasra & Bank linked.'
                      : 'Provide 1-click consent to auto-verify Aadhaar, Khasra & Bank.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="fr-digi-cta-btn"
                onClick={() => setDigiConsentOpen(true)}
              >
                {isDigiVerified ? 'Re-Sync DigiLocker' : 'Consent & Auto-Fill →'}
              </button>
            </div>
          )}

          {/* ====================================================================
              Step 1: Personal & Identity Details
              ==================================================================== */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <h3 className="fr-form-title">{fr.step1Title}</h3>
              <p className="fr-form-sub">Enter your legal personal details as verified on government identification records.</p>

              <div className="fr-field-group">
                <label>{fr.fullNameLabel} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar Singh"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                />
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.mobileLabel} *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={formData.mobile}
                    onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="fr-field-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                  />
                </div>
                <div className="fr-field-group">
                  <label>Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  >
                    <option value="Married">Married</option>
                    <option value="Unmarried">Unmarried</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="fr-field-group">
                  <label>{fr.aadhaarLabel} *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="Last 4 digits"
                    value={formData.aadhaarLast4}
                    onChange={(e) => handleChange('aadhaarLast4', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button type="submit" className="fr-btn-submit">
                {fr.nextStepBtn} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ====================================================================
              Step 2: Residential Address & Landholdings
              ==================================================================== */}
          {step === 2 && (
            <form onSubmit={handleNext}>
              <h3 className="fr-form-title">Address &amp; Landholdings</h3>
              <p className="fr-form-sub">Provide your registered village, revenue circle, and land survey credentials.</p>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.stateLabel} *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  >
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>
                <div className="fr-field-group">
                  <label>{fr.districtLabel} *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  >
                    <option value="Varanasi">Varanasi</option>
                    <option value="Chandauli">Chandauli</option>
                    <option value="Ghazipur">Ghazipur</option>
                    <option value="Jaunpur">Jaunpur</option>
                    <option value="Mirzapur">Mirzapur</option>
                  </select>
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>Tehsil / Sub-District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chiraigaon / Pindra / Sadar"
                    value={formData.tehsil}
                    onChange={(e) => handleChange('tehsil', e.target.value)}
                  />
                </div>
                <div className="fr-field-group">
                  <label>{fr.villageLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Village Gaurakala"
                    value={formData.village}
                    onChange={(e) => handleChange('village', e.target.value)}
                  />
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>Post Office</label>
                  <input
                    type="text"
                    placeholder="e.g. Chiraigaon Post"
                    value={formData.postOffice}
                    onChange={(e) => handleChange('postOffice', e.target.value)}
                  />
                </div>
                <div className="fr-field-group">
                  <label>PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    value={formData.pincode}
                    onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.landCategoryLabel} *</label>
                  <select
                    value={formData.landCategory}
                    onChange={(e) => handleChange('landCategory', e.target.value)}
                  >
                    <option value="Marginal (< 1 Hectare)">Marginal (&lt; 1 Hectare)</option>
                    <option value="Small (1 - 2 Hectares)">Small (1 - 2 Hectares)</option>
                    <option value="Semi-Medium (2 - 4 Hectares)">Semi-Medium (2 - 4 Hectares)</option>
                    <option value="Medium (4 - 10 Hectares)">Medium (4 - 10 Hectares)</option>
                    <option value="Large (> 10 Hectares)">Large (&gt; 10 Hectares)</option>
                  </select>
                </div>
                <div className="fr-field-group">
                  <label>Total Landholding (Acres) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3.50 Acres"
                    value={formData.landHolding}
                    onChange={(e) => handleChange('landHolding', e.target.value)}
                  />
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.khasraLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 142/3 & 143/1"
                    value={formData.khasraNo}
                    onChange={(e) => handleChange('khasraNo', e.target.value)}
                  />
                </div>
                <div className="fr-field-group">
                  <label>Farming Experience *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 12 Years"
                    value={formData.experience}
                    onChange={(e) => handleChange('experience', e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="fr-btn-submit">
                {fr.nextStepBtn} <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* ====================================================================
              Step 3: Mandi, Bank Details & Document Verification
              ==================================================================== */}
          {step === 3 && (
            <form onSubmit={handleNext}>
              <h3 className="fr-form-title">{fr.step3Title}</h3>
              <p className="fr-form-sub">Select your preferred procurement centre and link your Aadhaar-seeded bank account for instant DBT credit.</p>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.cropLabel} *</label>
                  <select
                    value={formData.crop}
                    onChange={(e) => handleChange('crop', e.target.value)}
                  >
                    <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                    <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                    <option value="Gram (चना)">Gram (चना)</option>
                    <option value="Paddy (धान)">Paddy (धान)</option>
                    <option value="Barley (जौ)">Barley (जौ)</option>
                  </select>
                </div>
                <div className="fr-field-group">
                  <label>{fr.quantityLabel} (Qtl) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                  />
                </div>
              </div>

              <div className="fr-field-group">
                <label>{fr.centreLabel} ({ALL_PROCUREMENT_CENTRES.length} UP Centres Available) *</label>
                <select
                  value={formData.preferredMandi}
                  onChange={(e) => handleChange('preferredMandi', e.target.value)}
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

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>Bank Name *</label>
                  <select
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                  >
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Baroda UP Bank">Baroda UP Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Union Bank of India">Union Bank of India</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                  </select>
                </div>
                <div className="fr-field-group">
                  <label>{fr.ifscLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SBIN0001234"
                    value={formData.ifsc}
                    onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.bankAccountLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                  />
                </div>
                <div className="fr-field-group">
                  <label>Confirm Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Re-enter Account Number"
                    value={formData.confirmAccount}
                    onChange={(e) => handleChange('confirmAccount', e.target.value)}
                  />
                </div>
              </div>

              <div className="fr-field-group">
                <label>Transport Vehicle / Tractor Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UP-65-TC-8942"
                  value={formData.vehicleNumber}
                  onChange={(e) => handleChange('vehicleNumber', e.target.value.toUpperCase())}
                />
              </div>

              {/* Create PIN */}
              <div className="fr-field-row">
                <div className="fr-field-group">
                  <label>{fr.pinLabel} *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={6}
                      placeholder="6-digit security PIN"
                      value={formData.pin}
                      onChange={(e) => handleChange('pin', e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                      type="button"
                      className="fr-pin-toggle"
                      onClick={() => setShowPin(!showPin)}
                      aria-label="Toggle PIN Visibility"
                    >
                      {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="fr-field-group">
                  <label>{fr.confirmPinLabel} *</label>
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={6}
                    placeholder="Re-enter 6-digit PIN"
                    value={formData.confirmPin}
                    onChange={(e) => handleChange('confirmPin', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="fr-btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} className="animate-spin" />
                    Generating Verified Farmer ID...
                  </span>
                ) : (
                  <>
                    Complete Registration &amp; Issue Farmer ID <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ====================================================================
              Step 4: Success & Farmer ID Generated
              ==================================================================== */}
          {step === 4 && (
            <div className="fr-success-card">
              <div className="fr-success-icon">
                <CheckCircle2 size={38} />
              </div>
              <h3 className="fr-form-title">{fr.successTitle}</h3>
              <p className="fr-form-sub">{fr.successSub}</p>

              <div className="fr-id-box">
                <small>{fr.farmerIdLabel}</small>
                <strong>{farmerId}</strong>
                <span className="pf-doc-badge" style={{ marginTop: '6px' }}>
                  <BadgeCheck size={12} /> DigiLocker Verified Account
                </span>
              </div>

              <button
                type="button"
                className="fr-btn-submit"
                onClick={() => {
                  const targetUrl = getAndClearRedirectAfterLogin()
                  navigate(targetUrl)
                }}
              >
                {fr.proceedToDashboard} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Bottom Login Link */}
          {step < 4 && (
            <div className="fr-bottom-links">
              <span className="fr-login-text">
                {fr.alreadyRegistered}{' '}
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                >
                  {fr.loginLink}
                </a>
              </span>
            </div>
          )}

          {/* Footer Copyright */}
          <div className="fr-footer-bar">
            <span>{t.footer.copyright} • Ministry of Agriculture &amp; Farmers Welfare</span>
          </div>
        </section>
      </div>

      {/* ==========================================================================
          DigiLocker Consent & Auto-Fill Modal
          ========================================================================== */}
      {digiConsentOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '520px' }}>
            <div className="fd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', display: 'grid', placeItems: 'center' }}>
                  <Lock size={15} />
                </div>
                <h2 style={{ fontSize: '17px' }}>DigiLocker Fast-Track Consent</h2>
              </div>
              <button
                className="fd-modal-close"
                onClick={() => setDigiConsentOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '6px 0' }}>
              <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
                Provide consent to fetch verified digital proofs directly from DigiLocker repository for instant farmer onboarding:
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
                    <small style={{ color: '#64748b' }}>Fetches verified name, phone, and e-KYC certificate.</small>
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
                    <small style={{ color: '#64748b' }}>Fetches certified 3.50 Acres landholding in Alwar district.</small>
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
                    <small style={{ color: '#64748b' }}>Links verified SBI account for 100% direct DBT MSP settlements.</small>
                  </div>
                </label>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#1e40af', marginBottom: '16px' }}>
                🔒 <strong>Govt Digital Security:</strong> Data is fetched via DigiLocker API gateways with SHA-256 digital signature encryption.
              </div>

              <button
                type="button"
                className="fd-card-btn primary"
                disabled={isDigiSyncing || (!consentAadhaar && !consentLand && !consentBank)}
                onClick={handleDigiLockerConsent}
                style={{ padding: '12px' }}
              >
                {isDigiSyncing ? 'Authenticating with DigiLocker...' : 'Give Consent & Auto-Fill Registration Form →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
