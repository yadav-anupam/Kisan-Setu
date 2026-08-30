import { useState, useRef, useCallback, useEffect } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  History,
  QrCode,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  validateQRToken,
  confirmBookingVerification,
  getVerificationHistory,
  getVerificationHistoryAsync,
  type BookingRecord,
  type StaffUser,
  type VerificationAuditLog,
} from '../../services/qrBookingService'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
} from '../../services/staffDataService'
import StaffSidebar from './StaffSidebar'
import StaffHeader from './StaffHeader'
import '../farmer/FarmerDashboard.css'
import './StaffQRScannerPage.css'

const mapStaffRole = (r: string): 'staff' | 'centre_operator' | 'admin' => {
  const low = (r || '').toLowerCase()
  if (low.includes('admin')) return 'admin'
  if (low.includes('operator')) return 'centre_operator'
  return 'staff'
}

export default function StaffQRScannerPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeStaff, setActiveStaff] = useState<StaffUser>(() => {
    const s = getStaffAuthSession()
    return {
      id: s.staff_id,
      name: s.full_name,
      role: mapStaffRole(s.role),
      centre_id: s.centre_id,
      centre_name: s.centre_name,
    }
  })

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/scanner')
      navigate('/staff/login')
      return
    }
    const s = getStaffAuthSession()
    setActiveStaff({
      id: s.staff_id,
      name: s.full_name,
      role: mapStaffRole(s.role),
      centre_id: s.centre_id,
      centre_name: s.centre_name,
    })
  }, [])

  // Scanner states
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Verification result modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [scanResult, setScanResult] = useState<{
    status: 'VALID' | 'ALREADY_VERIFIED' | 'CANCELLED' | 'EXPIRED' | 'NOT_FOUND' | 'INVALID_QR'
    booking?: BookingRecord
    message: string
  } | null>(null)

  // Audit history state
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [audits, setAudits] = useState<VerificationAuditLog[]>(() =>
    getVerificationHistory({ status: 'ALL', search: '' })
  )

  const refreshAudits = useCallback(async () => {
    try {
      const res = await getVerificationHistoryAsync({ status: filterStatus, search: searchQuery })
      setAudits(res)
    } catch {
      setAudits(getVerificationHistory({ status: filterStatus, search: searchQuery }))
    }
  }, [filterStatus, searchQuery])

  useEffect(() => {
    let isMounted = true
    getVerificationHistoryAsync({ status: filterStatus, search: searchQuery })
      .then((res) => {
        if (isMounted) setAudits(res)
      })
      .catch(() => {
        if (isMounted) setAudits(getVerificationHistory({ status: filterStatus, search: searchQuery }))
      })
    return () => {
      isMounted = false
    }
  }, [filterStatus, searchQuery])

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  // Camera Scanner Lifecycle
  const startCameraScanner = async () => {
    setCameraError(null)
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-target')
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        (decodedText) => {
          handleTokenDetected(decodedText)
          stopCameraScanner()
        },
        () => {
          // scanning frames
        }
      )
      setIsScanning(true)
    } catch (err: unknown) {
      setCameraError(
        err instanceof Error
          ? err.message
          : 'Camera access denied or unavailable. Please use manual code entry.'
      )
      setIsScanning(false)
    }
  }

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        setIsScanning(false)
      } catch {
        // ignore
      }
    }
  }

  // Handle Token Received (From Camera or Manual)
  const handleTokenDetected = async (rawToken: string) => {
    setIsValidating(true)
    const res = await validateQRToken(rawToken, activeStaff)
    setIsValidating(false)
    setScanResult({
      status: res.result,
      booking: res.booking,
      message: res.message,
    })
    setModalOpen(true)
    refreshAudits()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    let token = manualInput.trim()
    if (!token.startsWith('KS1|')) {
      token = `KS1|${token}`
    }
    handleTokenDetected(token)
  }

  // Confirm Verification
  const handleConfirmVerification = async () => {
    if (!scanResult?.booking?.id) return
    setIsVerifying(true)
    const res = await confirmBookingVerification(
      scanResult.booking.id,
      activeStaff,
      'Verified at Gate 2 Weighbridge Desk'
    )
    setIsVerifying(false)
    if (res.success && res.booking) {
      setScanResult({
        status: 'VALID',
        booking: res.booking,
        message: 'Booking successfully marked as VERIFIED.',
      })
    }
    refreshAudits()
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Sidebar */}
      <StaffSidebar
        activeTab="scanner"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Verification Hub Content */}
      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          pageTitle="Gate QR Verification Desk"
        />

        {/* 2-Column Grid */}
        <div className="st-grid">
          {/* Left Column: QR Camera Scanner & Manual Entry */}
          <div>
            <div className="st-scanner-card">
              <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                <span className="fd-section-badge" style={{ marginBottom: '8px' }}>
                  <ShieldCheck size={13} /> Digital Cryptographic Validator
                </span>
                <h2 style={{ fontFamily: 'Manrope', fontSize: '20px', fontWeight: 800, margin: '4px 0 6px' }}>
                  Scan Farmer Gate Pass QR
                </h2>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                  Point camera at the farmer's KS1 QR token. The system computes SHA-256 hash server-side to validate authenticity.
                </p>
              </div>

              {/* Viewfinder Frame */}
              <div className="st-viewfinder-container">
                <div
                  id="qr-reader-target"
                  style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                />

                {isScanning && <div className="st-laser-line" />}

                <div className="st-corner top-left" />
                <div className="st-corner top-right" />
                <div className="st-corner bottom-left" />
                <div className="st-corner bottom-right" />

                {!isScanning && (
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 8,
                      textAlign: 'center',
                      color: '#ffffff',
                      padding: '20px',
                    }}
                  >
                    <QrCode size={56} style={{ color: '#4ade80', margin: '0 auto 12px' }} />
                    <p style={{ fontSize: '13px', margin: '0 0 14px', color: '#cbd5e1' }}>
                      Camera is currently standby. Click below to activate live gate scanning.
                    </p>
                    <button
                      type="button"
                      className="fd-card-btn primary"
                      onClick={startCameraScanner}
                      style={{ padding: '10px 20px', fontSize: '13px' }}
                    >
                      <Camera size={16} /> Activate Camera Scanner
                    </button>
                  </div>
                )}
              </div>

              {/* Scanner Control Actions */}
              {isScanning && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="fd-card-btn secondary"
                    onClick={stopCameraScanner}
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    <CameraOff size={14} /> Stop Scanner
                  </button>
                </div>
              )}

              {/* Camera Error Message */}
              {cameraError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginTop: '12px',
                    color: '#991b1b',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Manual Entry Fallback Box */}
              <div className="st-manual-box">
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  ⌨️ Manual Code / Token Entry Fallback
                </strong>
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter Booking No. (e.g. KS-2026-000184) or Token"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    style={{
                      flex: 1,
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="fd-card-btn primary"
                    disabled={isValidating || !manualInput.trim()}
                    style={{ padding: '0 16px', height: '42px', fontSize: '12.5px' }}
                  >
                    {isValidating ? 'Validating...' : 'Verify →'}
                  </button>
                </form>
              </div>

              {/* Quick Simulation Test Presets */}
              <div style={{ marginTop: '16px', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  🧪 Quick Test Preset Scenarios:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="fd-card-btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleTokenDetected('KS1|demo-token-184')}
                  >
                    ✓ Test Valid (KS-2026-000184)
                  </button>
                  <button
                    type="button"
                    className="fd-card-btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleTokenDetected('KS1|demo-token-185')}
                  >
                    ⚠ Test Already Verified (185)
                  </button>
                  <button
                    type="button"
                    className="fd-card-btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleTokenDetected('KS1|demo-token-186')}
                  >
                    ⚠ Test Cancelled (186)
                  </button>
                  <button
                    type="button"
                    className="fd-card-btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => handleTokenDetected('KS1|fake-tampered-token-999')}
                  >
                    ✕ Test Fake / Invalid QR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Verification History Audit Log */}
          <div>
            <div className="st-scanner-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} color="#0d631b" />
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: 0 }}>
                    Gate Verification Audit Log
                  </h3>
                </div>
                <button
                  type="button"
                  className="fd-icon-btn"
                  onClick={refreshAudits}
                  title="Refresh Audit History"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Search & Filter Controls */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search booking or farmer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '34px',
                      padding: '0 10px 0 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['ALL', 'VALID', 'ALREADY_VERIFIED', 'CANCELLED', 'NOT_FOUND'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      style={{
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: filterStatus === st ? '1px solid #0d631b' : '1px solid #e2e8f0',
                        background: filterStatus === st ? '#f0fdf4' : '#ffffff',
                        color: filterStatus === st ? '#0d631b' : '#64748b',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => setFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Table */}
              <div style={{ width: '100%', overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
                <table className="st-audit-table">
                  <thead>
                    <tr>
                      <th>Booking</th>
                      <th>Time</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audits.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                          No audit records found.
                        </td>
                      </tr>
                    ) : (
                      audits.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.booking_number}</strong>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>
                              {item.farmer_name || 'Anonymous Scan'}
                            </small>
                          </td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(item.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 800,
                                background:
                                  item.result === 'VALID'
                                    ? '#dcfce7'
                                    : item.result === 'ALREADY_VERIFIED'
                                    ? '#fef3c7'
                                    : '#fee2e2',
                                color:
                                  item.result === 'VALID'
                                    ? '#166534'
                                    : item.result === 'ALREADY_VERIFIED'
                                    ? '#92400e'
                                    : '#991b1b',
                              }}
                            >
                              {item.result}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Booking Result Modal */}
      {modalOpen && scanResult && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '520px' }}>
            <div className="fd-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} color="#0d631b" />
                <h2 style={{ fontSize: '17px' }}>Verification Result</h2>
              </div>
              <button
                className="fd-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '8px 0' }}>
              {/* Status Header Badge */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {scanResult.status === 'VALID' && (
                  <div className="st-result-badge valid">
                    <CheckCircle2 size={16} />
                    <span>
                      {scanResult.booking?.verification_status === 'VERIFIED'
                        ? '✓ BOOKING VERIFIED'
                        : '✓ VALID BOOKING DETECTED'}
                    </span>
                  </div>
                )}

                {scanResult.status === 'ALREADY_VERIFIED' && (
                  <div className="st-result-badge already">
                    <AlertTriangle size={16} />
                    <span>⚠ ALREADY VERIFIED</span>
                  </div>
                )}

                {scanResult.status === 'CANCELLED' && (
                  <div className="st-result-badge cancelled">
                    <XCircle size={16} />
                    <span>⚠ BOOKING CANCELLED</span>
                  </div>
                )}

                {(scanResult.status === 'NOT_FOUND' || scanResult.status === 'INVALID_QR') && (
                  <div className="st-result-badge invalid">
                    <ShieldAlert size={16} />
                    <span>✕ INVALID / UNRECOGNIZED QR</span>
                  </div>
                )}
              </div>

              {/* Booking Details Card if Found */}
              {scanResult.booking ? (
                <div
                  style={{
                    background: '#f8faf8',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#64748b' }}>Booking Number:</span>
                    <strong style={{ fontFamily: 'Manrope', color: '#0f172a' }}>{scanResult.booking.booking_number}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>FARMER NAME</span>
                      <strong>{scanResult.booking.farmer_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>VEHICLE NUMBER</span>
                      <strong>{scanResult.booking.vehicle_number}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>COMMODITY</span>
                      <strong>{scanResult.booking.commodity}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>QUANTITY</span>
                      <strong>{scanResult.booking.quantity} Quintals</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>SLOT TIME</span>
                      <strong>{scanResult.booking.start_time} - {scanResult.booking.end_time}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>GATE TOKEN</span>
                      <strong style={{ color: '#0d631b' }}>{scanResult.booking.token_number}</strong>
                    </div>
                  </div>

                  {scanResult.booking.verified_at && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '11.5px', color: '#166534' }}>
                      ✓ Verified By: <strong>{scanResult.booking.verified_by_name || 'Rajesh Kumar'}</strong> at{' '}
                      {new Date(scanResult.booking.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '14px', background: '#f8faf8', borderRadius: '10px', marginBottom: '16px', color: '#64748b', fontSize: '13px' }}>
                  {scanResult.message}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {scanResult.status === 'VALID' && scanResult.booking?.verification_status === 'PENDING' && (
                  <button
                    type="button"
                    className="fd-card-btn primary"
                    onClick={handleConfirmVerification}
                    disabled={isVerifying}
                    style={{ flex: 1, padding: '12px', fontSize: '13.5px' }}
                  >
                    {isVerifying ? 'Verifying Booking...' : '✓ VERIFY BOOKING & GRANT GATE PASS'}
                  </button>
                )}

                <button
                  type="button"
                  className="fd-card-btn secondary"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '12px 20px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
