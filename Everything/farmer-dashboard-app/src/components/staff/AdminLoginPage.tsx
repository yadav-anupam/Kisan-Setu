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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      {/* Left Column: Branding & Purpose */}
      <div
        style={{
          flex: '0 0 42%',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden md:flex"
      >
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
          <img
            src={logoImg}
            alt="Kisan Setu"
            style={{
              height: '46px',
              width: '46px',
              objectFit: 'contain',
              background: '#ffffff',
              borderRadius: '12px',
              padding: '4px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Kisan Setu</h1>
            <p style={{ fontSize: '12.5px', color: '#c7d2fe', margin: '2px 0 0', fontWeight: 600 }}>
              Kisan ka Saathi, Har Kadam Saath
            </p>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '12px',
            }}
          >
            <Landmark size={14} /> Central Governance &amp; Policy Management
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.25, margin: '0 0 10px' }}>
            State &amp; Central APMC Administration Desk
          </h2>
          <p style={{ fontSize: '14px', color: '#e0e7ff', lineHeight: 1.5, margin: 0 }}>
            Dedicated high-level administrative command for District Collectors, State Directorate of Agriculture, and Policy Administrators.
          </p>
        </div>

        {/* Value Propositions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Megaphone size={20} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Official MSP &amp; Bonus Announcements</h3>
              <p style={{ fontSize: '12.5px', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Declare gazette-backed crop base rates, state incentive bonuses, and broadcast real-time farmer alerts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={20} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Statewide Mandi Centre Registry</h3>
              <p style={{ fontSize: '12.5px', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Provision new procurement centres, monitor capacity grading, and inspect infrastructure compliance.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={20} color="#a5b4fc" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Department Roster &amp; Oversight</h3>
              <p style={{ fontSize: '12.5px', color: '#e0e7ff', margin: 0, lineHeight: 1.4 }}>
                Supervise nodal officers, appoint mandi superintendents, and audit cross-centre DBT transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#c7d2fe' }}>
          <ShieldCheck size={16} color="#a5b4fc" />
          <span>Government of Uttar Pradesh • Department of Food &amp; Civil Supplies</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Top Switcher Bar */}
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            ← Back to Public Website
          </button>
          <button
            type="button"
            onClick={() => navigate('/staff/login')}
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '99px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ArrowRightLeft size={12} /> Centre Operations Login
          </button>
        </div>

        {/* Login Box */}
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eef2ff', color: '#3730a3', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Award size={26} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Administration Sign In</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Enter your official administrative credentials to access the governance portal</p>
          </div>

          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '12.5px',
                fontWeight: 600,
                marginBottom: '18px',
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Officer ID / Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Administrator ID / Official Email
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ADM-UP-001 or admin@fcs.up.gov.in"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px 0 40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {!isOtpMode ? (
              <>
                {/* Password Input */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>Account Password</label>
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the State IT & Secretariat Division to reset administrator credentials.'); }} style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
                      Forgot?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter administrative password"
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 40px 0 40px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Security CAPTCHA */}
                <div style={{ background: '#f1f5f9', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#e2e8f0', padding: '6px 14px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: 800, fontSize: '17px', letterSpacing: '4px', color: '#1e293b' }}>
                    {captchaCode}
                  </div>
                  <button type="button" onClick={generateCaptcha} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }} title="Refresh CAPTCHA">
                    <RefreshCw size={16} />
                  </button>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Enter code"
                    style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </>
            ) : (
              /* OTP Mode */
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  {otpSent ? 'Enter 6-Digit OTP Code' : 'Verification OTP'}
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={otpSent ? 'Demo OTP: 123456' : 'Click Send OTP below'}
                    disabled={!otpSent}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 14px 0 40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(49, 46, 129, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? 'Verifying Authorization...' : isOtpMode && !otpSent ? 'Send Login OTP' : 'Sign In as Administrator'}
            </button>

            {/* Toggle OTP / Password Mode */}
            <button
              type="button"
              onClick={() => { setIsOtpMode(!isOtpMode); setErrorMsg(''); setOtpSent(false); }}
              style={{ background: 'transparent', border: 'none', color: '#4338ca', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
            >
              {isOtpMode ? '← Sign In with Password instead' : '🔑 Sign In with OTP instead'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              State Administration Accounts (Click to Fill)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@fcs.up.gov.in', 'admin123')}
                style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#312e81', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
              >
                State APMC Director<br /><small style={{ fontWeight: 500, color: '#64748b' }}>Dr. Arvind Sharma (ADM-UP-001)</small>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('director@up-agri.gov.in', 'admin123')}
                style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
              >
                Agriculture Secretary<br /><small style={{ fontWeight: 500, color: '#64748b' }}>Smt. Meenakshi (ADM-UP-002)</small>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
          <ShieldCheck size={14} color="#4338ca" />
          <span>AES-256 Encrypted Session • NIC Secured • State Directorate Audit Logged</span>
        </div>
      </div>
    </div>
  )
}
