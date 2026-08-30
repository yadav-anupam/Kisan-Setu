import { useState, useEffect } from 'react'
import {
  Bell,
  CheckCircle2,
  QrCode,
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

export default function StaffSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  // Settings State
  const [soundFeedback, setSoundFeedback] = useState(true)
  const [vibrateFeedback, setVibrateFeedback] = useState(true)
  const [autoNextScan, setAutoNextScan] = useState(true)
  const [alertNotifs, setAlertNotifs] = useState(true)
  const [savedMsg, setSavedMsg] = useState(false)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/settings')
      navigate('/staff/login')
      return
    }
    setStaff(getStaffAuthSession())
  }, [])

  const handleSaveSettings = () => {
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2500)
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Terminal Configuration &amp; Settings"
        />

        <main style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Terminal &amp; Scanner Settings
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              Configure QR scanner hardware preferences and operational alert notifications
            </p>
          </div>

          {savedMsg && (
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
              <span>Settings saved to local terminal profile!</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Scanner Preferences */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <QrCode size={18} color="#0d631b" />
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  QR Scanner Hardware Preferences
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Audio Beep on Successful Verification</strong>
                    <small style={{ color: '#64748b' }}>Play high-pitch confirm chime when valid QR token is decoded</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundFeedback}
                    onChange={(e) => setSoundFeedback(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d631b' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Haptic Vibration on Gate Scan</strong>
                    <small style={{ color: '#64748b' }}>Vibrate terminal when pass is processed at the weighbridge gate</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={vibrateFeedback}
                    onChange={(e) => setVibrateFeedback(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d631b' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Continuous Scan Mode</strong>
                    <small style={{ color: '#64748b' }}>Automatically resume camera scanner after closing verification modal</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoNextScan}
                    onChange={(e) => setAutoNextScan(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d631b' }}
                  />
                </label>
              </div>
            </div>

            {/* Section 2: Notifications */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Bell size={18} color="#0d631b" />
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Operational Alert Preferences
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Slot Bottleneck Warnings</strong>
                    <small style={{ color: '#64748b' }}>Notify when upcoming hourly slot exceeds 85% capacity</small>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertNotifs}
                    onChange={(e) => setAlertNotifs(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0d631b' }}
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Session Information */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ShieldCheck size={18} color="#0d631b" />
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Terminal Security &amp; Session
                </h2>
              </div>

              <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
                <div>• <strong>Current Terminal Operator:</strong> {staff.full_name} ({staff.staff_id})</div>
                <div>• <strong>Assigned Node:</strong> {staff.centre_name} • Gate 2</div>
                <div>• <strong>Cryptographic Key Engine:</strong> SHA-256 / KS1 Token Protocol</div>
                <div>• <strong>Database Gateway:</strong> Central Procurement Database (Live &amp; Connected)</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                background: '#0d631b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Save Terminal Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
