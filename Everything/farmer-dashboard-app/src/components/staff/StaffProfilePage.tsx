import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
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

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = { ...staff, mobile, email }
    localStorage.setItem('kisan_setu_staff_auth', JSON.stringify(updated))
    setStaff(updated)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
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
        </main>
      </div>
    </div>
  )
}
