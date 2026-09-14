import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  IndianRupee,
  KeyRound,
  Lock,
  MessageSquare,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  UserCheck,
  Users,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import farmerHeroImg from '../../assets/hero-farmer.png'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import {
  loginFarmer,
  isFarmerLoggedIn,
  getAndClearRedirectAfterLogin,
  hasPendingRedirect,
} from '../../auth'
import {
  authenticateFarmerWithBackend,
  authenticateFarmerWithOtp,
} from '../../services/farmerAuthService'
import './FarmerLoginPage.css'

export default function FarmerLoginPage() {
  const { currentLang, setLanguage, t, languages } = useLanguage()
  const fl = t.farmerLogin

  // Login Mode: 'password' | 'otp'
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // OTP State
  const [otpSent, setOtpSent] = useState(false)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Auto-redirect if farmer is already logged in
  useEffect(() => {
    if (isFarmerLoggedIn()) {
      const target = getAndClearRedirectAfterLogin()
      navigate(target)
    }
  }, [])

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Timer countdown
  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000)
      return () => clearInterval(interval)
    }
  }, [otpSent, timer])

  const handleOtpDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1)
    }
    const newDigits = [...otpDigits]
    newDigits[index] = val
    setOtpDigits(newDigits)

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number')
      return
    }
    setErrorMessage('')
    setIsSubmitting(true)
    setTimeout(() => {
      setOtpSent(true)
      setTimer(30)
      setOtpDigits(['1', '2', '3', '4', '5', '6']) // Pre-fill OTP
      setIsSubmitting(false)
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      if (mode === 'password') {
        const res = await authenticateFarmerWithBackend(mobile, password)
        setIsSubmitting(false)
        if (res.success && res.farmer) {
          loginFarmer(res.farmer)
          const targetUrl = getAndClearRedirectAfterLogin()
          navigate(targetUrl)
        } else {
          setErrorMessage(res.message || 'Invalid mobile number or 6-digit PIN.')
        }
      } else {
        const otpStr = otpDigits.join('')
        const res = await authenticateFarmerWithOtp(mobile, otpStr)
        setIsSubmitting(false)
        if (res.success && res.farmer) {
          loginFarmer(res.farmer)
          const targetUrl = getAndClearRedirectAfterLogin()
          navigate(targetUrl)
        } else {
          setErrorMessage(res.message || 'OTP verification failed.')
        }
      }
    } catch (err: any) {
      setIsSubmitting(false)
      setErrorMessage(err?.message || 'Login failed. Please check your network and credentials.')
    }
  }


  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="farmer-login-page">
      <div className="fl-split-container">
        {/* ==========================================================================
            Left Side: Visual Branding & Farmer Trust Story
            ========================================================================== */}
        <section className="fl-story-panel">
          <div
            className="fl-story-bg-image"
            style={{ backgroundImage: `url(${farmerHeroImg})` }}
          />

          <div className="fl-story-content">
            {/* Logo */}
            <a href="/" className="fl-brand-header" onClick={(e) => { e.preventDefault(); navigate('/') }}>
              <img src={logoImg} alt="Kisan Setu Logo" className="fl-logo-img" />
              <div className="fl-brand-text">
                <strong>{t.brandName}</strong>
                <small>{t.brandTagline}</small>
              </div>
            </a>

            {/* Story Message */}
            <div className="fl-story-copy">
              <h2>
                {fl.heroTitle1}
                <br />
                <em>{fl.heroTitle2}</em>
              </h2>
              <p>{fl.heroDesc}</p>

              {/* 4 Feature Badges */}
              <div className="fl-badges-grid">
                <div className="fl-badge-item">
                  <div className="fl-badge-icon">
                    <CalendarCheck size={20} />
                  </div>
                  <span>{fl.badges.bookSlot}</span>
                </div>
                <div className="fl-badge-item">
                  <div className="fl-badge-icon">
                    <Users size={20} />
                  </div>
                  <span>{fl.badges.liveQueue}</span>
                </div>
                <div className="fl-badge-item">
                  <div className="fl-badge-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>{fl.badges.sellProduce}</span>
                </div>
                <div className="fl-badge-item">
                  <div className="fl-badge-icon">
                    <IndianRupee size={20} />
                  </div>
                  <span>{fl.badges.fairPayment}</span>
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className="fl-story-trust-banner">
              <ShieldCheck size={26} />
              <div>
                <strong>{fl.trustBanner}</strong>
                <small>{fl.trustSub}</small>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            Right Side: Login Form Panel
            ========================================================================== */}
        <section className="fl-form-panel">
          {/* Top Utilities Bar */}
          <div className="fl-top-bar">
            <a
              href="/"
              className="fl-back-home"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <ArrowLeft size={16} />
              <span className="fl-back-label">{t.farmerPortal?.common?.backHome || 'Back to Home'}</span>
            </a>

            <div className="fl-top-actions">
              {/* Need Help WhatsApp Link */}
              <a
                href="https://wa.me/919214334494"
                target="_blank"
                rel="noopener noreferrer"
                className="fl-help-btn"
                title={fl.needHelp}
              >
                <MessageSquare size={14} />
                <span className="fl-help-label">{fl.needHelp}</span>
              </a>

              {/* Language Selector */}
              <div className="fl-lang-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className={`fl-lang-btn ${langMenuOpen ? 'open' : ''}`}
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  aria-label="Change Language"
                >
                  <Globe2 size={15} className="fl-lang-globe" />
                  <span className="fl-lang-name">{activeLangObj.nativeName}</span>
                  <ChevronDown size={13} className={`fl-lang-arrow ${langMenuOpen ? 'open' : ''}`} />
                </button>

                {langMenuOpen && (
                  <div className="fl-lang-dropdown">
                    <div className="fl-lang-dropdown-header">
                      <span>Select Language / भाषा चुनें</span>
                    </div>
                    <div className="fl-lang-grid">
                      {languages.map((lang) => {
                        const isSelected = currentLang === lang.code
                        return (
                          <button
                            type="button"
                            key={lang.code}
                            className={`fl-lang-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setLanguage(lang.code)
                              setLangMenuOpen(false)
                            }}
                          >
                            <div className="fl-lang-option-text">
                              <span className="fl-lang-native">{lang.nativeName}</span>
                              <span className="fl-lang-english">{lang.name}</span>
                            </div>
                            {isSelected && <Check size={14} className="fl-lang-check" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Central Login Card */}
          <div className="fl-card-wrap">
            <div className="fl-welcome-header">
              <div className="fl-farmer-avatar">
                <UserCheck size={32} />
              </div>
              <h1>{fl.welcomeTitle}</h1>
              <p>{fl.welcomeSubtitle}</p>
            </div>

            {hasPendingRedirect() && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                <Lock size={15} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{t.farmerPortal?.common?.authRequired || 'Authentication Required: Please login to access Farmer Dashboard & Services.'}</span>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="fl-tabs">
              <button
                type="button"
                className={`fl-tab-btn ${mode === 'password' ? 'active' : ''}`}
                onClick={() => setMode('password')}
              >
                <KeyRound size={15} /> {fl.tabPassword}
              </button>
              <button
                type="button"
                className={`fl-tab-btn ${mode === 'otp' ? 'active' : ''}`}
                onClick={() => setMode('otp')}
              >
                <Smartphone size={15} /> {fl.tabOtp}
              </button>
            </div>

            {/* Login Forms */}
            <form onSubmit={handleSubmit} className="fl-form">
              {errorMessage && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '10px', padding: '10px 12px', fontSize: '12.5px', marginBottom: '12px', lineHeight: 1.4 }}>
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Mobile Number Field */}
              <div className="fl-field">
                <label>{fl.mobileLabel} *</label>
                <div className="fl-input-wrap">
                  <span className="fl-input-prefix">+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder={fl.mobilePlaceholder}
                    className="fl-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              {mode === 'password' ? (
                /* Password Field */
                <div className="fl-field">
                  <label>
                    <span>{fl.passwordLabel} *</span>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault()
                        alert('Password reset link sent to your registered mobile number.')
                      }}
                      className="fl-forgot-link"
                    >
                      {fl.forgotPassword}
                    </a>
                  </label>
                  <div className="fl-input-wrap">
                    <span className="fl-input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder={fl.passwordPlaceholder}
                      className="fl-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="fl-toggle-pw"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                /* OTP Verification Section */
                <div className="fl-field">
                  {!otpSent ? (
                    <button
                      type="button"
                      className="fl-submit-btn"
                      style={{ marginTop: '4px' }}
                      onClick={handleSendOtp}
                      disabled={isSubmitting}
                    >
                      <Smartphone size={16} />
                      {isSubmitting ? fl.sendingOtp : fl.sendOtpBtn}
                    </button>
                  ) : (
                    <>
                      <label>{fl.otpLabel} *</label>
                      <p style={{ fontSize: '12px', color: '#526056', margin: '0 0 8px' }}>
                        {fl.otpInstructions}
                      </p>

                      <div className="fl-otp-inputs">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`otp-input-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="fl-otp-digit"
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          />
                        ))}
                      </div>

                      <div className="fl-otp-timer-row">
                        <span>
                          {timer > 0 ? (
                            `${fl.resendIn} ${timer}${fl.seconds}`
                          ) : (
                            <span style={{ color: '#16a34a' }}>OTP Expired</span>
                          )}
                        </span>
                        <button
                          type="button"
                          className="fl-resend-btn"
                          disabled={timer > 0}
                          onClick={handleSendOtp}
                        >
                          {fl.resendOtp}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Submit Button */}
              {(mode === 'password' || otpSent) && (
                <button type="submit" className="fl-submit-btn" disabled={isSubmitting}>
                  <CheckCircle2 size={17} />
                  {isSubmitting
                    ? fl.loggingIn
                    : mode === 'password'
                    ? fl.loginBtn
                    : fl.verifyBtn}
                </button>
              )}
            </form>

            {/* Bottom Links */}
            <div className="fl-bottom-links">
              <p className="fl-register-text">
                {fl.newToPlatform}{' '}
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/register')
                  }}
                >
                  {fl.registerNow}
                </a>
              </p>

              <a
                href="/staff-login"
                className="fl-role-switcher"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/staff-login')
                }}
              >
                <Phone size={13} /> {fl.switchRole}
              </a>
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="fl-footer-bar">
            <span>{t.footer.copyright}</span>
          </div>
        </section>
      </div>
    </div>
  )
}
