import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  updateStaffProfile,
  updateStaffPassword,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwdMsg, setPwdMsg] = useState<{ text: string; isError: boolean } | null>(null)
  const [isPwdSubmitting, setIsPwdSubmitting] = useState(false)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/profile')
      navigate('/staff/login')
      return
    }
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    setMobile(currentStaff.mobile || '')
    setEmail(currentStaff.email || '')
  }, [])

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateStaffProfile({ mobile, email })
    setStaff((prev) => ({ ...prev, mobile, email }))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdMsg(null)

    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'New password and confirm password do not match.', isError: true })
      return
    }
    if (newPassword.length < 4) {
      setPwdMsg({ text: 'New password must be at least 4 characters.', isError: true })
      return
    }

    setIsPwdSubmitting(true)
    try {
      const res = await updateStaffPassword(staff.staff_id, oldPassword, newPassword)
      setIsPwdSubmitting(false)
      if (res.success) {
        setPwdMsg({ text: res.message, isError: false })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPwdMsg({ text: res.message, isError: true })
      }
    } catch (err: any) {
      setIsPwdSubmitting(false)
      setPwdMsg({ text: err?.message || 'Error updating password.', isError: true })
    }
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="profile"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Staff Officer Profile"
        />

        <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Staff Profile &amp; APMC Assignment
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              Official government procurement credentials and terminal authorization
            </p>
          </div>

          {isSaved && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '20px',
                color: '#166534',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Contact information updated successfully!</span>
            </div>
          )}

          {/* Profile Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            {/* Top Banner */}
            <div
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#0d631b',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '24px',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {staff.full_name?.charAt(0) || 'S'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                    {staff.full_name}
                  </h2>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                    }}
                  >
                    {staff.role}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#dcfce7' }}>
                  {staff.designation} • ID: {staff.staff_id}
                </p>
              </div>
            </div>

            {/* Profile Fields */}
            <div style={{ padding: '24px' }}>
              <form onSubmit={handleSaveContact}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Official Staff ID (Read-only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staff.staff_id}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        color: '#64748b',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Role &amp; Privilege (Server Enforced)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staff.role}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        color: '#64748b',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Assigned APMC Centre (Read-only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staff.centre_name}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        color: '#64748b',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      Designation / Department (Read-only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={staff.designation}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontSize: '13px',
                        color: '#64748b',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Official Mobile Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Government Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck size={18} color="#0d631b" />
                  <span>
                    <strong>Security Notice:</strong> Staff role and Mandi assignment changes require APMC Administrator authorization (AD-001) via role-based access policies.
                  </span>
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#0d631b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>

          {/* Security & Password Change Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
              marginTop: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', background: '#fafafa' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Security &amp; Password Management
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Update your security password for official terminal authorization
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              {pwdMsg && (
                <div
                  style={{
                    background: pwdMsg.isError ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${pwdMsg.isError ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    color: pwdMsg.isError ? '#b91c1c' : '#166534',
                    fontSize: '12.5px',
                    fontWeight: 700,
                  }}
                >
                  {pwdMsg.isError ? '⚠️ ' : '✅ '}
                  {pwdMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 4 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPwdSubmitting}
                  style={{
                    background: '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 24px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  {isPwdSubmitting ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
