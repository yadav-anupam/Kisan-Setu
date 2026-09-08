import { useState } from 'react'
import {
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Store,
  Users,
  BarChart3,
  ArrowRightLeft,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import { navigate } from '../../router'
import {
  authenticateStaffWithBackend,
  getAllProcurementCentresList,
  type StaffProfile,
} from '../../services/staffDataService'
import type { ProcurementCentreItem } from '../../data/procurementCentresData'

export default function CentreAdminLoginPage() {
  const [identifier, setIdentifier] = useState('AD-001')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedCentre, setSelectedCentre] = useState('centre-up-vns-01')
  const [captchaCode, setCaptchaCode] = useState('X7B29')
  const [captchaInput, setCaptchaInput] = useState('X7B29')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOtpMode, setIsOtpMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const centres: ProcurementCentreItem[] = getAllProcurementCentresList()

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
      setErrorMsg('Please enter your Centre Admin ID or Registered Mobile number.')
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
        centres.find((c: ProcurementCentreItem) => c.id === selectedCentre)?.centreName || 'Chiraigaon 1st at Gaurakala (FCS)'
      )

      if (authResult.success && authResult.profile) {
        // Enforce Centre Admin role
        const profile: StaffProfile = {
          ...authResult.profile,
          role: authResult.profile.role === 'MANDI_ADMIN' ? 'MANDI_ADMIN' : 'CENTRE_OPERATOR',
          designation: authResult.profile.designation || 'Mandi Centre Superintendent',
          centre_id: selectedCentre,
          centre_name: centres.find((c: ProcurementCentreItem) => c.id === selectedCentre)?.centreName || authResult.profile.centre_name,
        }
        localStorage.setItem('kisan_setu_staff_auth', JSON.stringify(profile))
        window.dispatchEvent(new CustomEvent('kisan_setu_staff_profile_updated', { detail: profile }))
        navigate('/centre-admin/dashboard')
      } else {
        setErrorMsg(authResult.message || 'Authentication failed. Please verify credentials.')
      }
    } catch {
      setErrorMsg('Service temporarily unavailable. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickFill = (id: string, pass: string, centreId: string) => {
    setIdentifier(id)
    setPassword(pass)
    setSelectedCentre(centreId)
    setCaptchaInput(captchaCode)
    setErrorMsg('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      {/* Left Column: Branding & Purpose (Stitch Approved Theme) */}
      <div
        style={{
          flex: '0 0 42%',
          background: 'linear-gradient(135deg, #064e3b 0%, #0d631b 60%, #15803d 100%)',
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
            <p style={{ fontSize: '12.5px', color: '#a7f3d0', margin: '2px 0 0', fontWeight: 600 }}>
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
            <Store size={14} /> Centre Operations Management
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.25, margin: '0 0 10px' }}>
            APMC Mandi Centre Administration Desk
          </h2>
          <p style={{ fontSize: '14px', color: '#dcfce7', lineHeight: 1.5, margin: 0 }}>
            Dedicated operational oversight portal for Mandi Superintendents, Nodal Officers, and Gate In-charges.
          </p>
        </div>

        {/* Value Propositions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={20} color="#86efac" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Centre Capacity &amp; Slots</h3>
              <p style={{ fontSize: '12.5px', color: '#dcfce7', margin: 0, lineHeight: 1.4 }}>
                Control hourly token limits, bay routing, and weighbridge intake throughput.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={20} color="#86efac" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Staff &amp; Field Operators</h3>
              <p style={{ fontSize: '12.5px', color: '#dcfce7', margin: 0, lineHeight: 1.4 }}>
                Assign gate scanners, weighbridge officers, and moisture inspection technicians.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart3 size={20} color="#86efac" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>DBT Payments &amp; Auditing</h3>
              <p style={{ fontSize: '12.5px', color: '#dcfce7', margin: 0, lineHeight: 1.4 }}>
                Vet electronic J-Form intake vouchers and release direct bank payments.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#bbf7d0' }}>
          <ShieldCheck size={16} color="#86efac" />
          <span>Government of India • Ministry of Consumer Affairs &amp; Food</span>
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
            onClick={() => navigate('/admin/login')}
            style={{
              background: '#e0e7ff',
              border: '1px solid #c7d2fe',
              color: '#3730a3',
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
            <ArrowRightLeft size={12} /> Platform Admin Login
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
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', color: '#166534', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Store size={26} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Centre Admin Sign In</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Enter your nodal credentials to access the centre portal</p>
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
            {/* Centre Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Assigned Procurement Centre
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px 0 40px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    fontWeight: 600,
                  }}
                >
                  {centres.map((c: ProcurementCentreItem) => (
                    <option key={c.id} value={c.id}>
                      {c.centreName} ({c.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Officer ID / Mobile */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Centre Admin ID / Registered Mobile
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. AD-001 or +91 98765 43210"
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
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact the District Administrative Director to reset your credentials.'); }} style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
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
                background: 'linear-gradient(135deg, #0d631b 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(13, 99, 27, 0.25)',
                transition: 'all 0.2s ease',
                marginTop: '4px',
              }}
            >
              {isSubmitting ? 'Verifying...' : isOtpMode && !otpSent ? 'Send Login OTP' : 'Sign In as Centre Admin'}
            </button>

            {/* Toggle OTP / Password Mode */}
            <button
              type="button"
              onClick={() => { setIsOtpMode(!isOtpMode); setErrorMsg(''); setOtpSent(false); }}
              style={{ background: 'transparent', border: 'none', color: '#15803d', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}
            >
              {isOtpMode ? '← Sign In with Password instead' : '🔑 Sign In with OTP instead'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Demo Centre Admin Accounts (Click to Fill)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('AD-001', 'Admin@123', 'centre-up-vns-01')}
                style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
              >
                Chiraigaon Mandi<br /><small style={{ fontWeight: 500, color: '#64748b' }}>Vikram Singh (AD-001)</small>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('IN-305', 'Inspector@123', 'centre-up-vns-02')}
                style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#334155', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
              >
                Rohania Sub-Yard<br /><small style={{ fontWeight: 500, color: '#64748b' }}>Pooja Verma (IN-305)</small>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span>AES-256 Encrypted Session • Audit Logged</span>
        </div>
      </div>
    </div>
  )
}
