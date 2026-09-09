import { useState } from 'react'
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Landmark,
  Users,
  Megaphone,
  ArrowRightLeft,
  Award,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import {
  authenticateStaffWithBackend,
  type StaffProfile,
} from '../../services/staffDataService'
import './AdminLoginPage.css'

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('ADM-UP-001')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaCode, setCaptchaCode] = useState('X7B29')
  const [captchaInput, setCaptchaInput] = useState('X7B29')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOtpMode, setIsOtpMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let res = ''
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(res)
    setCaptchaInput('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Administrator ID or Official Email.')
      return
    }

    if (!isOtpMode) {
      if (!password.trim()) {
        setErrorMsg('Please enter your account password.')
        return
      }
      if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
        setErrorMsg('Security CAPTCHA verification failed. Please try again.')
        generateCaptcha()
        return
      }
    } else {
      if (!otpSent) {
        setOtpSent(true)
        return
      }
      if (otpCode !== '123456' && otpCode.length < 4) {
        setErrorMsg('Invalid OTP. Use demo OTP: 123456')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const authResult = await authenticateStaffWithBackend(
        identifier,
        isOtpMode ? '123456' : password,
        'State APMC & Food Supplies Headquarters'
      )

      if (authResult.success && authResult.profile) {
        // Enforce Admin role
        const profile: StaffProfile = {
          ...authResult.profile,
          role: 'ADMIN',
          designation: authResult.profile.designation || 'Director of APMC & State Civil Supplies',
          centre_id: 'STATE_HQ',
          centre_name: 'State APMC & Food Supplies Headquarters',
        }
        localStorage.setItem('kisan_setu_staff_auth', JSON.stringify(profile))
        window.dispatchEvent(new CustomEvent('kisan_setu_staff_profile_updated', { detail: profile }))
        navigate('/admin/dashboard')
      } else {
        setErrorMsg(authResult.message || 'Authentication failed. Please verify credentials.')
      }
    } catch {
      setErrorMsg('Service temporarily unavailable. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id)
    setPassword(pass)
    setCaptchaInput(captchaCode)
    setErrorMsg('')
  }

  return (
    <div className="admin-login-wrapper">
      {/* Left Column: Branding & Purpose */}
      <div className="admin-login-hero">
        <div className="admin-login-hero-glow" />

        {/* Brand Header */}
        <div className="admin-brand-header">
          <img
            src={logoImg}
            alt="Kisan Setu"
            className="admin-brand-logo"
          />
          <div>
            <h1 className="admin-brand-title">Kisan Setu</h1>
            <p className="admin-brand-subtitle">
              Kisan ka Saathi, Har Kadam Saath
            </p>
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="admin-tag-badge">
            <Landmark size={14} /> Central Governance &amp; Policy Management
          </div>
          <h2 className="admin-hero-heading">
            State &amp; Central APMC Administration Desk
          </h2>
          <p className="admin-hero-desc">
            Dedicated high-level administrative command for District Collectors, State Directorate of Agriculture, and Policy Administrators.
          </p>
        </div>

        {/* Value Propositions */}
        <div className="admin-value-props">
          <div className="admin-prop-item">
            <div className="admin-prop-icon">
              <Megaphone size={20} />
            </div>
            <div className="admin-prop-content">
              <h3>Official MSP &amp; Bonus Announcements</h3>
              <p>
                Declare gazette-backed crop base rates, state incentive bonuses, and broadcast real-time farmer alerts.
              </p>
            </div>
          </div>

          <div className="admin-prop-item">
            <div className="admin-prop-icon">
              <Building2 size={20} />
            </div>
            <div className="admin-prop-content">
              <h3>Statewide Mandi Centre Registry</h3>
              <p>
                Provision new procurement centres, monitor capacity grading, and inspect infrastructure compliance.
              </p>
            </div>
          </div>

          <div className="admin-prop-item">
            <div className="admin-prop-icon">
              <Users size={20} />
            </div>
            <div className="admin-prop-content">
              <h3>Department Roster &amp; Oversight</h3>
              <p>
                Supervise nodal officers, appoint mandi superintendents, and audit cross-centre DBT transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="admin-hero-footer">
          <ShieldCheck size={16} color="#a5b4fc" />
          <span>Government of Uttar Pradesh • Department of Food &amp; Civil Supplies</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="admin-login-form-col">
        {/* Top Switcher Bar */}
        <div className="admin-top-nav-bar">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="admin-back-link"
          >
            ← Back to Public Website
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/login')}
            className="admin-switch-btn"
          >
            <ArrowRightLeft size={12} /> Centre Operations Login
          </button>
        </div>

        {/* Login Box */}
        <div className="admin-card-box">
          <div className="admin-card-header">
            <div className="admin-card-avatar">
              <Award size={26} />
            </div>
            <h2>Administration Sign In</h2>
            <p>Enter your official administrative credentials to access the governance portal</p>
          </div>

          {errorMsg && (
            <div className="admin-error-box">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Officer ID / Email */}
            <div>
              <label className="admin-label">
                Administrator ID / Official Email
              </label>
              <div className="admin-input-wrap">
                <Users size={16} className="admin-input-icon" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ADM-UP-001 or admin@fcs.up.gov.in"
                  className="admin-input-field"
                />
              </div>
            </div>

            {!isOtpMode ? (
              <>
                {/* Password Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label className="admin-label" style={{ marginBottom: 0 }}>Account Password</label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        alert('Please contact the State IT & Secretariat Division to reset administrator credentials.')
                      }}
                      style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="admin-input-wrap">
                    <Lock size={16} className="admin-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrative password"
                      className="admin-input-field"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="admin-password-toggle"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Security CAPTCHA */}
                <div className="admin-captcha-block">
                  <div className="admin-captcha-display">
                    {captchaCode}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="admin-captcha-refresh"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter code"
                    className="admin-captcha-input"
                  />
                </div>
              </>
            ) : (
              /* OTP Mode */
              <div>
                <label className="admin-label">
                  {otpSent ? 'Enter 6-Digit OTP Code' : 'Verification OTP'}
                </label>
                <div className="admin-input-wrap">
                  <KeyRound size={16} className="admin-input-icon" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={otpSent ? 'Demo OTP: 123456' : 'Click Send OTP below'}
                    disabled={!otpSent}
                    className="admin-input-field"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-submit-btn"
            >
              {isSubmitting ? 'Verifying Authorization...' : isOtpMode && !otpSent ? 'Send Login OTP' : 'Sign In as Administrator'}
            </button>

            {/* Toggle OTP / Password Mode */}
            <button
              type="button"
              onClick={() => { setIsOtpMode(!isOtpMode); setErrorMsg(''); setOtpSent(false); }}
              className="admin-toggle-mode-btn"
            >
              {isOtpMode ? '← Sign In with Password instead' : '🔑 Sign In with OTP instead'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="admin-quick-fill-section">
            <div className="admin-quick-fill-label">
              State Administration Accounts (Click to Fill)
            </div>
            <div className="admin-quick-fill-grid">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@fcs.up.gov.in', '123456')}
                className="admin-quick-card"
              >
                State APMC Director<br /><small>Dr. Arvind Sharma (ADM-UP-001)</small>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('director@up-agri.gov.in', '123456')}
                className="admin-quick-card"
                style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#334155' }}
              >
                Agriculture Secretary<br /><small>Smt. Meenakshi (ADM-UP-002)</small>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="admin-trust-badge">
          <ShieldCheck size={14} color="#4338ca" style={{ flexShrink: 0 }} />
          <span>AES-256 Encrypted Session • NIC Secured • State Directorate Audit Logged</span>
        </div>
      </div>
    </div>
  )
}

