import { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getAllProcurementCentresList,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

interface VerificationRecord {
  id: string
  centreName: string
  district: string
  agency: string
  weighbridgeCalibExpiry: string
  moistureMeterCert: 'VALID' | 'PENDING' | 'EXPIRED'
  cctvStreamStatus: 'ONLINE' | 'INTERMITTENT' | 'OFFLINE'
  gunnyBagStock: number // minimum 25000 required
  complianceScore: number // percentage
  status: 'COMPLIANT' | 'AUDIT_REQUIRED' | 'EXPIRING_SOON' | 'SUSPENDED'
  lastAuditedBy: string
}

const STORAGE_KEY = 'kisan_setu_centre_verifications_v2'

function buildInitialRecords(): VerificationRecord[] {
  const centres = getAllProcurementCentresList()
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return centres.map((c, index) => {
    const isOdd = index % 2 === 1
    const isThird = index % 3 === 0
    return {
      id: `VER-2026-${String(index + 1).padStart(3, '0')}`,
      centreName: c.centreName,
      district: c.district,
      agency: c.agency,
      weighbridgeCalibExpiry: isOdd ? '2026-11-30' : isThird ? '2026-09-15' : '2027-02-28',
      moistureMeterCert: isThird ? 'PENDING' : 'VALID',
      cctvStreamStatus: isThird ? 'INTERMITTENT' : 'ONLINE',
      gunnyBagStock: isThird ? 18500 : 45000 + (index * 7200),
      complianceScore: isThird ? 78 : 95 + (index % 5),
      status: isThird ? 'EXPIRING_SOON' : 'COMPLIANT',
      lastAuditedBy: 'Divisional Inspector & APMC Board',
    }
  })
}

export default function AdminCentreVerificationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [records, setRecords] = useState<VerificationRecord[]>(buildInitialRecords)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionSuccess, setActionSuccess] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/centres/verification')
      navigate('/admin/login')
      return
    }
    setStaff(getStaffAuthSession())
    const initial = buildInitialRecords()
    setRecords(initial)
  }, [])

  const handleApprove = (id: string, name: string) => {
    setRecords((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'COMPLIANT' as const,
              moistureMeterCert: 'VALID' as const,
              complianceScore: Math.min(100, r.complianceScore + 15),
              weighbridgeCalibExpiry: '2027-03-31',
              lastAuditedBy: 'Administrative Command (Direct Approval)',
            }
          : r
      )
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      }
      return updated
    })
    setActionSuccess(`Verification & Calibration for "${name}" approved successfully for KMS 2026-27.`)
    setTimeout(() => setActionSuccess(''), 4000)
  }

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      r.centreName.toLowerCase().includes(search.toLowerCase()) ||
      r.district.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="centres"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Mandi Verification &amp; Statutory Compliance"
        />

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Top KPI row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Total Mandis Verified
                </span>
                <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                  92.4%
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
                {records.filter((r) => r.status === 'COMPLIANT').length} / {records.length}
              </div>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Active in KMS 2026–27</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Audit Flags
                </span>
                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                  Action Needed
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '8px' }}>
                {records.filter((r) => r.status === 'AUDIT_REQUIRED' || r.status === 'EXPIRING_SOON').length}
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Weighbridge or CCTV issues</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Avg Compliance Score
                </span>
                <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                  STATEWIDE
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e40af', marginTop: '8px' }}>
                {Math.round(records.reduce((acc, r) => acc + r.complianceScore, 0) / records.length)}%
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Statutory BIS &amp; W&amp;MD Rating</span>
            </div>
          </div>

          {actionSuccess && (
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
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div
            style={{
              background: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by centre name, district, or audit ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={15} color="#64748b" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Compliance States</option>
                <option value="COMPLIANT">Fully Compliant</option>
                <option value="EXPIRING_SOON">Expiring Soon (&lt; 30 Days)</option>
                <option value="AUDIT_REQUIRED">Audit Flagged / Non-Compliant</option>
              </select>
            </div>
          </div>

          {/* Records Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '14px 16px' }}>Procurement Centre &amp; ID</th>
                    <th style={{ padding: '14px 16px' }}>W&amp;MD Scale Stamping</th>
                    <th style={{ padding: '14px 16px' }}>Moisture Meter</th>
                    <th style={{ padding: '14px 16px' }}>CCTV Stream</th>
                    <th style={{ padding: '14px 16px' }}>Bags Buffer</th>
                    <th style={{ padding: '14px 16px' }}>Score</th>
                    <th style={{ padding: '14px 16px' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => {
                    const isCompliant = r.status === 'COMPLIANT'
                    const isExpiring = r.status === 'EXPIRING_SOON'

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.centreName}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {r.id} • {r.district} • <span style={{ fontWeight: 600 }}>{r.agency}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={13} color="#64748b" />
                            <span style={{ fontWeight: 600, color: isExpiring ? '#b45309' : '#0f172a' }}>
                              Exp: {r.weighbridgeCalibExpiry}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>Stamping Seal Valid</span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: r.moistureMeterCert === 'VALID' ? '#ecfdf5' : r.moistureMeterCert === 'PENDING' ? '#fef3c7' : '#fef2f2',
                              color: r.moistureMeterCert === 'VALID' ? '#059669' : r.moistureMeterCert === 'PENDING' ? '#b45309' : '#dc2626',
                            }}
                          >
                            {r.moistureMeterCert}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: r.cctvStreamStatus === 'ONLINE' ? '#16a34a' : r.cctvStreamStatus === 'INTERMITTENT' ? '#d97706' : '#dc2626',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: r.cctvStreamStatus === 'ONLINE' ? '#22c55e' : r.cctvStreamStatus === 'INTERMITTENT' ? '#f59e0b' : '#ef4444',
                              }}
                            />
                            {r.cctvStreamStatus}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', fontWeight: 600, color: r.gunnyBagStock < 20000 ? '#dc2626' : '#0f172a' }}>
                          {r.gunnyBagStock.toLocaleString('en-IN')} Bags
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 800, color: r.complianceScore >= 90 ? '#16a34a' : r.complianceScore >= 70 ? '#d97706' : '#dc2626' }}>
                            {r.complianceScore}%
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isCompliant ? '#ecfdf5' : isExpiring ? '#fffbeb' : '#fef2f2',
                              color: isCompliant ? '#065f46' : isExpiring ? '#92400e' : '#991b1b',
                            }}
                          >
                            {isCompliant ? 'COMPLIANT' : isExpiring ? 'EXPIRING' : 'FLAGGED AUDIT'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isCompliant ? (
                            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Certified
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApprove(r.id, r.centreName)}
                              style={{
                                padding: '6px 12px',
                                background: '#1e3a8a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Renew / Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
