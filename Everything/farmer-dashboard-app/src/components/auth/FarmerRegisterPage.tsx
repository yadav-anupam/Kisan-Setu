import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Globe2,
  Lock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sprout,
  UserCheck,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import farmerHeroImg from '../../assets/hero-farmer.png'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './FarmerRegisterPage.css'

export default function FarmerRegisterPage() {
  const { currentLang, setLanguage, t, languages } = useLanguage()
  const fr = t.farmerRegister

  // Multi-step state: 1 | 2 | 3 | 4 (success)
  const [step, setStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [farmerId, setFarmerId] = useState('')

  // Form Fields State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    aadhaarLast4: '',
    state: 'Rajasthan',
    district: 'Alwar',
    village: '',
    landCategory: 'Small (1 - 2 Hectares)',
    khasraNo: '',
    crop: 'Wheat (गेहूं)',
    quantity: '50',
    preferredMandi: 'Alwar Central Grain Mandi',
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    bankName: 'State Bank of India (Auto-Verified)',
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      if (!formData.fullName || formData.mobile.length < 10) {
        alert('Please enter your full name and 10-digit mobile number')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.crop || !formData.quantity) {
        alert('Please select your crop and estimated quantity')
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (!formData.accountNumber || !formData.ifsc || !formData.pin) {
        alert('Please fill in bank account and create a 6-digit PIN')
        return
      }
      setIsSubmitting(true)
      setTimeout(() => {
        const generatedId = `KS-FARM-2026-${Math.floor(1000 + Math.random() * 9000)}`
        setFarmerId(generatedId)
        setIsSubmitting(false)
        setStep(4)
      }, 900)
    }
  }

  const handleQuickFill = () => {
    setFormData({
      fullName: 'Ramesh Kumar Singh',
      mobile: '9214334494',
      aadhaarLast4: '8942',
      state: 'Rajasthan',
      district: 'Alwar',
      village: 'Rampur Tehsil',
      landCategory: 'Small (1 - 2 Hectares)',
      khasraNo: 'KHA-104/89',
      crop: 'Wheat (गेहूं)',
      quantity: '65',
      preferredMandi: 'Alwar Central Grain Mandi',
      accountNumber: '392847291048',
      confirmAccount: '392847291048',
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India (DBT Verified)',
      pin: '123456',
      confirmPin: '123456',
    })
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
                <small>{t.brandTagline}</small>
              </div>
            </a>

            {/* Story Copy */}
            <div className="fr-story-copy">
              <h2>
                {fr.heroTitle1}
                <br />
                <em>{fr.heroTitle2}</em>
              </h2>
              <p>{fr.heroDesc}</p>

              {/* 4 Milestones Journey Steps */}
              <div className="fr-milestones-list">
                <div className={`fr-milestone-row ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                  <div className="fr-milestone-number">
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <div>
                    <strong>{fr.steps.step1}</strong>
                    <small>Name, Mobile & Location</small>
                  </div>
                </div>

                <div className={`fr-milestone-row ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                  <div className="fr-milestone-number">
                    {step > 2 ? '✓' : '2'}
                  </div>
                  <div>
                    <strong>{fr.steps.step2}</strong>
                    <small>Land, Crop & Mandi Centre</small>
                  </div>
                </div>

                <div className={`fr-milestone-row ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>
                  <div className="fr-milestone-number">
                    {step > 3 ? '✓' : '3'}
                  </div>
                  <div>
                    <strong>{fr.steps.step3}</strong>
                    <small>Bank Account & Security PIN</small>
                  </div>
                </div>

                <div className={`fr-milestone-row ${step === 4 ? 'active done' : ''}`}>
                  <div className="fr-milestone-number">
                    {step === 4 ? '✓' : '4'}
                  </div>
                  <div>
                    <strong>{fr.steps.step4}</strong>
                    <small>Instant Kisan ID Generated</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="fr-story-trust-banner">
              <ShieldCheck size={26} />
              <div>
                <strong>{fr.trustBanner}</strong>
                <small>{fr.trustSub}</small>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Right Side: Registration Multi-Step Form
            ========================================================================== */}
        <section className="fr-form-panel">
          {/* Top Utilities Bar */}
          <div className="fr-top-bar">
            <a
              href="/"
              className="fr-back-home"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <ArrowLeft size={16} /> Back to Home
            </a>

            <div className="fr-top-actions">
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

              {/* Need Help WhatsApp Link */}
              <a
                href="https://wa.me/919214334494"
                target="_blank"
                rel="noopener noreferrer"
                className="fr-help-btn"
              >
                <MessageSquare size={14} />
                <span>Need Help?</span>
              </a>
            </div>
          </div>

          {/* Form Content Card */}
          <div className="fr-card-wrap">
            {step < 4 && (
              <>
                {/* Progress Bar */}
                <div className="fr-progress-container">
                  <div className="fr-progress-labels">
                    <span>
                      {step === 1
                        ? fr.step1Title
                        : step === 2
                        ? fr.step2Title
                        : fr.step3Title}
                    </span>
                    <span>Step {step} of 3</span>
                  </div>
                  <div className="fr-progress-track">
                    <div
                      className="fr-progress-bar"
                      style={{ width: `${(step / 3) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="fr-step-header">
                  <h1>{fr.title}</h1>
                  <p>{fr.subtitle}</p>
                </div>
              </>
            )}

            {/* Step 1: Personal & Contact Details */}
            {step === 1 && (
              <form onSubmit={handleNext} className="fr-form">
                <div className="fr-field">
                  <label>{fr.fullNameLabel} *</label>
                  <div className="fr-input-wrap">
                    <span className="fr-input-icon"><UserCheck size={16} /></span>
                    <input
                      type="text"
                      required
                      placeholder={fr.fullNamePlaceholder}
                      className="fr-input"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fr-field-row">
                  <div className="fr-field">
                    <label>{fr.mobileLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-prefix">+91</span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        placeholder={fr.mobilePlaceholder}
                        className="fr-input"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="fr-field">
                    <label>{fr.aadhaarLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-icon"><ShieldCheck size={16} /></span>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        placeholder={fr.aadhaarPlaceholder}
                        className="fr-input"
                        value={formData.aadhaarLast4}
                        onChange={(e) => handleChange('aadhaarLast4', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="fr-field-row">
                  <div className="fr-field">
                    <label>{fr.stateLabel} *</label>
                    <div className="fr-input-wrap">
                      <select
                        className="fr-select"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      >
                        <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                        <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                        <option value="Punjab">Punjab (ਪੰਜਾਬ)</option>
                        <option value="Haryana">Haryana (हरियाणा)</option>
                        <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                        <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                        <option value="Telangana">Telangana (తెలంగాణ)</option>
                        <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                      </select>
                    </div>
                  </div>

                  <div className="fr-field">
                    <label>{fr.districtLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-icon"><MapPin size={16} /></span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alwar, Jaipur"
                        className="fr-input"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="fr-field">
                  <label>{fr.villageLabel}</label>
                  <div className="fr-input-wrap">
                    <span className="fr-input-icon"><Building2 size={16} /></span>
                    <input
                      type="text"
                      placeholder={fr.villagePlaceholder}
                      className="fr-input"
                      value={formData.village}
                      onChange={(e) => handleChange('village', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fr-actions-row">
                  <button type="submit" className="fr-next-btn">
                    {fr.nextStepBtn} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Land & Crop Information */}
            {step === 2 && (
              <form onSubmit={handleNext} className="fr-form">
                <div className="fr-field">
                  <label>{fr.landCategoryLabel} *</label>
                  <div className="fr-input-wrap">
                    <select
                      className="fr-select"
                      value={formData.landCategory}
                      onChange={(e) => handleChange('landCategory', e.target.value)}
                    >
                      <option value="Marginal (< 1 Hectare)">Marginal (&lt; 1 Hectare)</option>
                      <option value="Small (1 - 2 Hectares)">Small (1 - 2 Hectares)</option>
                      <option value="Medium (2 - 10 Hectares)">Medium (2 - 10 Hectares)</option>
                      <option value="Large (> 10 Hectares)">Large (&gt; 10 Hectares)</option>
                    </select>
                  </div>
                </div>

                <div className="fr-field">
                  <label>{fr.khasraLabel}</label>
                  <div className="fr-input-wrap">
                    <input
                      type="text"
                      placeholder={fr.khasraPlaceholder}
                      className="fr-input"
                      value={formData.khasraNo}
                      onChange={(e) => handleChange('khasraNo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fr-field-row">
                  <div className="fr-field">
                    <label>{fr.cropLabel} *</label>
                    <div className="fr-input-wrap">
                      <select
                        className="fr-select"
                        value={formData.crop}
                        onChange={(e) => handleChange('crop', e.target.value)}
                      >
                        <option value="Wheat (गेहूं)">Wheat (गेहूं)</option>
                        <option value="Paddy / Rice (धान)">Paddy / Rice (धान)</option>
                        <option value="Mustard (सरसों)">Mustard (सरसों)</option>
                        <option value="Gram / Chana (चना)">Gram / Chana (चना)</option>
                        <option value="Soybean (सोयाबीन)">Soybean (सोयाबीन)</option>
                        <option value="Cotton (कपास)">Cotton (कपास)</option>
                        <option value="Maize (मक्का)">Maize (मक्का)</option>
                      </select>
                    </div>
                  </div>

                  <div className="fr-field">
                    <label>{fr.quantityLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-icon"><Sprout size={16} /></span>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder={fr.quantityPlaceholder}
                        className="fr-input"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="fr-field">
                  <label>{fr.centreLabel} *</label>
                  <div className="fr-input-wrap">
                    <select
                      className="fr-select"
                      value={formData.preferredMandi}
                      onChange={(e) => handleChange('preferredMandi', e.target.value)}
                    >
                      <option value="Alwar Central Grain Mandi">Alwar Central Grain Mandi (Center #101)</option>
                      <option value="Khairthal Procurement Yard">Khairthal Procurement Yard (Center #102)</option>
                      <option value="Behror Agricultural Sub-Mandi">Behror Agricultural Sub-Mandi (Center #103)</option>
                      <option value="Ramgarh Krishak Seva Kendra">Ramgarh Krishak Seva Kendra (Center #104)</option>
                    </select>
                  </div>
                </div>

                <div className="fr-actions-row">
                  <button
                    type="button"
                    className="fr-prev-btn"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={16} /> {fr.prevStepBtn}
                  </button>
                  <button type="submit" className="fr-next-btn">
                    {fr.nextStepBtn} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Bank Account for DBT & PIN */}
            {step === 3 && (
              <form onSubmit={handleNext} className="fr-form">
                <div className="fr-field">
                  <label>{fr.bankAccountLabel} *</label>
                  <div className="fr-input-wrap">
                    <span className="fr-input-icon"><CreditCard size={16} /></span>
                    <input
                      type="password"
                      required
                      placeholder={fr.bankAccountPlaceholder}
                      className="fr-input"
                      value={formData.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="fr-field-row">
                  <div className="fr-field">
                    <label>{fr.ifscLabel} *</label>
                    <div className="fr-input-wrap">
                      <input
                        type="text"
                        required
                        placeholder={fr.ifscPlaceholder}
                        className="fr-input"
                        value={formData.ifsc}
                        onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>

                  <div className="fr-field">
                    <label>Bank Verification</label>
                    <div className="fr-verified-badge">
                      <CheckCircle2 size={13} /> DBT Active (PFMS Linked)
                    </div>
                  </div>
                </div>

                <div className="fr-field-row">
                  <div className="fr-field">
                    <label>{fr.pinLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-icon"><Lock size={16} /></span>
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        maxLength={12}
                        placeholder={fr.pinPlaceholder}
                        className="fr-input"
                        value={formData.pin}
                        onChange={(e) => handleChange('pin', e.target.value)}
                      />
                      <button
                        type="button"
                        className="fl-toggle-pw"
                        onClick={() => setShowPin(!showPin)}
                      >
                        {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="fr-field">
                    <label>{fr.confirmPinLabel} *</label>
                    <div className="fr-input-wrap">
                      <span className="fr-input-icon"><Lock size={16} /></span>
                      <input
                        type={showPin ? 'text' : 'password'}
                        required
                        placeholder={fr.confirmPinPlaceholder}
                        className="fr-input"
                        value={formData.confirmPin}
                        onChange={(e) => handleChange('confirmPin', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="fr-actions-row">
                  <button
                    type="button"
                    className="fr-prev-btn"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft size={16} /> {fr.prevStepBtn}
                  </button>
                  <button type="submit" className="fr-next-btn" disabled={isSubmitting}>
                    <CheckCircle2 size={17} />
                    {isSubmitting ? fr.registering : fr.registerBtn}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Registration Success Card */}
            {step === 4 && (
              <div className="fr-success-card">
                <div className="fr-success-icon">
                  <CheckCircle2 size={36} />
                </div>
                <h2>{fr.successTitle}</h2>
                <p>{fr.successSub}</p>

                <div className="fr-id-box">
                  <small>{fr.farmerIdLabel}</small>
                  <strong>{farmerId}</strong>
                </div>

                <button
                  type="button"
                  className="fr-next-btn"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/farmer-dashboard')}
                >
                  {fr.proceedToDashboard} <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Quick Demo Pre-fill Box (Only on Steps 1, 2, 3) */}
            {step < 4 && (
              <div className="fr-demo-box">
                <span>Test Demo Data: Ramesh Kumar (Alwar)</span>
                <button
                  type="button"
                  className="fr-demo-fill-btn"
                  onClick={handleQuickFill}
                >
                  {fr.quickFill}
                </button>
              </div>
            )}

            {/* Bottom Link to Login */}
            <div className="fr-bottom-links">
              <p className="fr-login-text">
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
              </p>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="fr-footer-bar">
            <span>© 2026 Kisan Setu • Department of Consumer Affairs</span>
          </div>
        </section>
      </div>
    </div>
  )
}
