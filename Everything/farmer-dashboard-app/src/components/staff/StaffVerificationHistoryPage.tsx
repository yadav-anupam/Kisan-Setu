import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import {
  getVerificationHistoryAsync,
  getVerificationHistory,
} from '../../services/qrBookingService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffVerificationHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [audits, setAudits] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadAudits = useCallback(async () => {
    setIsLoading(true)
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)

    try {
      const res = await getVerificationHistoryAsync({ status: filterStatus, search: searchQuery })
      setAudits(res)
    } catch {
      setAudits(getVerificationHistory({ status: filterStatus, search: searchQuery }))
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, searchQuery])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/verification-history')
      navigate('/staff/login')
      return
    }
    loadAudits()
  }, [loadAudits])

  const handleExportCSV = () => {
    if (audits.length === 0) return
    const headers = ['Booking Number', 'Farmer Name', 'Staff ID', 'Staff Name', 'Result', 'Scanned At', 'Remarks']
    const rows = audits.map((a) => [
      a.booking_number,
      a.farmer_name || 'N/A',
      a.staff_id,
      a.staff_name,
      a.result,
      new Date(a.scanned_at).toLocaleString(),
      a.remarks || '',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `verification_audit_log_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="history"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Cryptographic Verification Audit Log"
        />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Verification Audit Logs
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                Immutable SHA-256 cryptographic gate scan records for {staff.centre_name}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExportCSV}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#334155',
                }}
              >
                <Download size={15} /> Export CSV Log
              </button>

              <button
                type="button"
                onClick={loadAudits}
                style={{
                  background: '#0d631b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search by booking #, farmer name, staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px 0 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                }}
              >
                <option value="ALL">All Scan Results</option>
                <option value="VERIFIED">Verified (Clear Entry)</option>
                <option value="ALREADY_VERIFIED">Already Verified (Duplicate Scan)</option>
                <option value="INVALID">Invalid / Fake Token</option>
                <option value="CANCELLED">Cancelled Slot</option>
                <option value="EXPIRED">Expired Slot</option>
              </select>
            </div>
          </div>

          {/* Audit Records Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>Scan Timestamp</th>
                    <th style={{ padding: '12px 16px' }}>Booking Number</th>
                    <th style={{ padding: '12px 16px' }}>Farmer Name</th>
                    <th style={{ padding: '12px 16px' }}>Verifying Officer</th>
                    <th style={{ padding: '12px 16px' }}>Gate Result</th>
                    <th style={{ padding: '12px 16px' }}>Audit Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Loading verification audit trail...
                      </td>
                    </tr>
                  ) : audits.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No audit records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    audits.map((a, idx) => {
                      const isSuccess = a.result === 'VERIFIED'
                      const isDup = a.result === 'ALREADY_VERIFIED'
                      return (
                        <tr key={a.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px', color: '#64748b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} color="#94a3b8" />
                              <span>{new Date(a.scanned_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {a.booking_number}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                            {a.farmer_name || 'N/A'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ display: 'block', color: '#0f172a' }}>
                              {a.staff_name}
                            </strong>
                            <small style={{ color: '#64748b' }}>ID: {a.staff_id}</small>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                background: isSuccess ? '#dcfce7' : isDup ? '#fef3c7' : '#fee2e2',
                                color: isSuccess ? '#166534' : isDup ? '#b45309' : '#dc2626',
                              }}
                            >
                              {isSuccess ? (
                                <CheckCircle2 size={12} />
                              ) : isDup ? (
                                <ShieldAlert size={12} />
                              ) : (
                                <XCircle size={12} />
                              )}
                              {a.result}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                            {a.remarks || 'QR token signature matched sha256 server hash'}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
