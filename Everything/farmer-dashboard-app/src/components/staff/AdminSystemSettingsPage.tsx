import { useState, useEffect } from 'react'
import {
  Shield,
  Clock,
  Save,
  CheckCircle2,
  Cpu,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function AdminSystemSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)

  // System Settings State
  const [activeSeason, setActiveSeason] = useState('Kharif Marketing Season 2026–27 (KMS 26)')
  const [seasonStartDate, setSeasonStartDate] = useState('2026-10-01')
  const [seasonEndDate, setSeasonEndDate] = useState('2027-02-28')
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState('250')
  const [maxMoisturePaddy, setMaxMoisturePaddy] = useState('17.0')
  const [maxMoistureWheat, setMaxMoistureWheat] = useState('12.0')
  const [weighbridgeToleranceKg, setWeighbridgeToleranceKg] = useState('10')
  const [dbtBatchInterval, setDbtBatchInterval] = useState('BATCH_6HR')
  const [smsGatewayActive, setSmsGatewayActive] = useState(true)
  const [biometricGateMandatory, setBiometricGateMandatory] = useState(true)
  const [autoOfflineSyncHours, setAutoOfflineSyncHours] = useState('48')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const STORAGE_KEY = 'kisan_setu_global_system_settings'

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/system-settings')
      navigate('/admin/login')
      return
    }
    setStaff(getStaffAuthSession())

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.activeSeason) setActiveSeason(parsed.activeSeason)
          if (parsed.seasonStartDate) setSeasonStartDate(parsed.seasonStartDate)
          if (parsed.seasonEndDate) setSeasonEndDate(parsed.seasonEndDate)
          if (parsed.geofenceRadiusMeters) setGeofenceRadiusMeters(parsed.geofenceRadiusMeters)
          if (parsed.maxMoisturePaddy) setMaxMoisturePaddy(parsed.maxMoisturePaddy)
          if (parsed.maxMoistureWheat) setMaxMoistureWheat(parsed.maxMoistureWheat)
          if (parsed.weighbridgeToleranceKg) setWeighbridgeToleranceKg(parsed.weighbridgeToleranceKg)
          if (parsed.dbtBatchInterval) setDbtBatchInterval(parsed.dbtBatchInterval)
          if (parsed.smsGatewayActive !== undefined) setSmsGatewayActive(parsed.smsGatewayActive)
          if (parsed.biometricGateMandatory !== undefined) setBiometricGateMandatory(parsed.biometricGateMandatory)
          if (parsed.autoOfflineSyncHours) setAutoOfflineSyncHours(parsed.autoOfflineSyncHours)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [])

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeSeason,
          seasonStartDate,
          seasonEndDate,
          geofenceRadiusMeters,
          maxMoisturePaddy,
          maxMoistureWheat,
          weighbridgeToleranceKg,
          dbtBatchInterval,
          smsGatewayActive,
          biometricGateMandatory,
          autoOfflineSyncHours,
        })
      )
    }
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 4000)
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Platform Global Configuration &amp; Core Settings"
        />

        <main style={{ padding: '24px', maxWidth: '1080px', margin: '0 auto' }}>
          {/* Header Action Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Statewide Procurement Parameters
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Adjust master operational thresholds, DBT batch disbursement rules, and hardware IoT tolerances.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
              }}
            >
              <Save size={15} /> Save Master Settings
            </button>
          </div>

          {saveSuccess && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                padding: '14px 18px',
                borderRadius: '8px',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>Platform global configuration synchronized and updated across all 268 mandis.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings}>
            {/* 1. Procurement Season & Cut-offs */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#dbeafe', color: '#1e40af', padding: '8px', borderRadius: '8px' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    1. Active Crop Marketing Season
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Mandatory operational dates for slot reservations and purchase window validity.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Active Procurement Season Title
                  </label>
                  <input
                    type="text"
                    value={activeSeason}
                    onChange={(e) => setActiveSeason(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Season Opening Date
                  </label>
                  <input
                    type="date"
                    value={seasonStartDate}
                    onChange={(e) => setSeasonStartDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Season Procurement Closure Date
                  </label>
                  <input
                    type="date"
                    value={seasonEndDate}
                    onChange={(e) => setSeasonEndDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Hardware IoT & Tolerances */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '8px' }}>
                  <Cpu size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    2. IoT Weighbridge &amp; Moisture Analysis Tolerances
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Governs automated reject criteria and tare weight consistency thresholds.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Max Moisture - Paddy FAQ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxMoisturePaddy}
                    onChange={(e) => setMaxMoisturePaddy(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Above this triggers mandatory deduction or return</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Max Moisture - Wheat FAQ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxMoistureWheat}
                    onChange={(e) => setMaxMoistureWheat(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Weighbridge Tare Drift (± Kg)
                  </label>
                  <input
                    type="number"
                    value={weighbridgeToleranceKg}
                    onChange={(e) => setWeighbridgeToleranceKg(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Gate Geo-Fence Radius (Meters)
                  </label>
                  <input
                    type="number"
                    value={geofenceRadiusMeters}
                    onChange={(e) => setGeofenceRadiusMeters(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. DBT & Security Protocols */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: '#ecfdf5', color: '#059669', padding: '8px', borderRadius: '8px' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    3. Direct Benefit Transfer (DBT) &amp; Security Mandates
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    PFMS batch interval dispatch and mandatory 2FA biometric gates.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    PFMS / NPCI DBT Dispatch Schedule
                  </label>
                  <select
                    value={dbtBatchInterval}
                    onChange={(e) => setDbtBatchInterval(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                  >
                    <option value="IMMEDIATE">Instant Individual Release (Real-Time)</option>
                    <option value="BATCH_6HR">Batch Every 6 Hours (Recommended)</option>
                    <option value="BATCH_24HR">Daily Midnight Batch Release (12:00 AM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Offline PWA Database Sync Window (Hours)
                  </label>
                  <input
                    type="number"
                    value={autoOfflineSyncHours}
                    onChange={(e) => setAutoOfflineSyncHours(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={biometricGateMandatory}
                      onChange={(e) => setBiometricGateMandatory(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Enforce Mandatory Aadhaar OTP / Biometric verification during gate check-in</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={smsGatewayActive}
                      onChange={(e) => setSmsGatewayActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Transmit CDAC e-Gov SMS alert at each procurement transition (Weighment &rarr; Quality &rarr; Payment)</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
