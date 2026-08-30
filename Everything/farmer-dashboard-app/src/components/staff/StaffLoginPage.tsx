import { useState } from 'react'
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  QrCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import logoImg from '../../assets/logo.png'
import farmerHeroImg from '../../assets/hero-farmer.png'
import { navigate } from '../../router'
import { authenticateStaffWithBackend } from '../../services/staffDataService'
import {
  VARANASI_PROCUREMENT_CENTRES,
  CHANDAULI_PROCUREMENT_CENTRES,
  GHAZIPUR_PROCUREMENT_CENTRES,
  JAUNPUR_PROCUREMENT_CENTRES,
} from '../../data/procurementCentresData'
import './StaffQRScannerPage.css'

export default function StaffLoginPage() {
  const [staffId, setStaffId] = useState('ST-102')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedMandi, setSelectedMandi] = useState('Chiraigaon 1st at Gaurakala (FCS)')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      if (!staffId.trim()) {
        setErrorMsg('Please enter your Staff / Operator ID.')
        setIsLoading(false)
        return
      }

      const res = await authenticateStaffWithBackend(staffId, password, selectedMandi)
      if (res.success && res.profile) {
        const target = sessionStorage.getItem('kisan_setu_staff_redirect') || '/staff/dashboard'
        sessionStorage.removeItem('kisan_setu_staff_redirect')
        navigate(target)
      } else {
        setErrorMsg(res.message || 'Authentication failed. Please check your credentials.')
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="farmer-login-page">
      <div className="fl-split-container">
        {/* Left Side: Staff Institutional Branding */}
        <section
          className="fl-story-panel"
          style={{ background: 'linear-gradient(180deg, #075a27 0%, #0d631b 100%)' }}
        >
          <div
            className="fl-story-bg-image"
            style={{ backgroundImage: `url(${farmerHeroImg})` }}
          />

          <div className="fl-story-content">
            {/* Logo */}
            <a
              href="/"
              className="fl-brand-header"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
            >
              <img src={logoImg} alt="Kisan Setu Logo" className="fl-logo-img" />
              <div className="fl-brand-text">
                <strong>Kisan Setu</strong>
                <small>Staff &amp; Operator Portal</small>
              </div>
            </a>

            {/* Story Copy */}
            <div className="fl-story-copy">
              <div className="fl-story-badge" style={{ background: 'rgba(255,255,255,0.18)' }}>
                <ShieldCheck size={14} /> Official APMC Verification Desk
              </div>
              <h2 style={{ fontSize: '28px', lineHeight: 1.3, margin: '14px 0 10px', color: '#ffffff' }}>
                Secure APMC Gate &amp; Weighbridge Operations
              </h2>
              <p className="fl-story-desc">
                Authorize farmer entry, validate cryptographic QR tokens against secure central registry hashes, manage dynamic weighbridge bays, and audit grain deliveries.
              </p>
            </div>

            {/* Trust Pill */}
            <div className="fl-trust-pill">
              <BadgeCheck size={16} /> 58 Official Procurement Centres Active across Uttar Pradesh
            </div>
          </div>
        </section>

        {/* Right Side: Staff Login Card */}
        <section className="fl-form-panel">
          <div className="fl-card-wrap">
            <div className="fl-welcome-header">
              <div className="fl-farmer-avatar" style={{ background: '#f0fdf4', color: '#0d631b' }}>
                <QrCode size={30} />
              </div>
              <h1>Staff Operator Login</h1>
              <p>Sign in to access your assigned APMC Mandi Verification Desk.</p>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#dc2626',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="fl-field-group">
                <label>Assigned APMC Mandi *</label>
                <select
                  value={selectedMandi}
                  onChange={(e) => setSelectedMandi(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    outline: 'none',
                    background: '#ffffff',
                  }}
                >
                  <optgroup label="Varanasi District Procurement Centres (43 Centres)">
                    {VARANASI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Chandauli District Procurement Centres (5 Centres)">
                    {CHANDAULI_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Ghazipur District Procurement Centres (5 Centres)">
                    {GHAZIPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Jaunpur District Procurement Centres (5 Centres)">
                    {JAUNPUR_PROCUREMENT_CENTRES.map((c) => (
                      <option key={c.id} value={c.centreName}>
                        {c.centreName} — {c.blockTehsil} ({c.agency})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="fl-field-group" style={{ marginTop: '14px' }}>
                <label>Staff / Operator ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ST-102 or OP-401"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div className="fl-field-group" style={{ marginTop: '14px' }}>
                <label>Security PIN / Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 40px 0 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="fl-submit-btn"
                disabled={isLoading}
                style={{
                  marginTop: '20px',
                  background: '#0d631b',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  height: '48px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Lock size={16} />
                {isLoading ? 'Verifying Credentials...' : 'Sign In to Desk'}
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11.5px', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 700 }}>
                <span>Quick Fill Official Staff Accounts:</span>
                <span style={{ color: '#0d631b' }}>Pass: 123456</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('ST-102')
                    setPassword('123456')
                    setSelectedMandi('Chiraigaon 1st at Gaurakala (FCS)')
                    setErrorMsg('')
                  }}
                  style={{ padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#166534', cursor: 'pointer' }}
                >
                  🛡️ ST-102 (Gate)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('OP-401')
                    setPassword('123456')
                    setSelectedMandi('Chiraigaon 1st at Gaurakala (FCS)')
                    setErrorMsg('')
                  }}
                  style={{ padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1e40af', cursor: 'pointer' }}
                >
                  📋 OP-401 (Inspector)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStaffId('AD-001')
                    setPassword('123456')
                    setSelectedMandi('Chiraigaon 1st at Gaurakala (FCS)')
                    setErrorMsg('')
                  }}
                  style={{ padding: '6px 4px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: '1px solid #fbcfe8', background: '#fdf2f8', color: '#9d174d', cursor: 'pointer' }}
                >
                  🏢 AD-001 (Admin)
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{ background: 'none', border: 'none', color: '#0d631b', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                ← Switch to Farmer Portal
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
