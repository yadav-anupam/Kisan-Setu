import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  BadgeCheck,
  Search,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getProcurementBatches,
  approveProcurementForDBT,
  type StaffProfile,
  type ProcurementBatchItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function StaffPaymentsPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [batches, setBatches] = useState<ProcurementBatchItem[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const loadData = useCallback(() => {
    const s = getStaffAuthSession()
    setStaff(s)
    const isSuperAdmin = s.role === 'ADMIN' && isAdmin
    setBatches(getProcurementBatches(isSuperAdmin ? undefined : s.centre_name))
  }, [isAdmin])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || (isAdmin ? '/admin/payments' : '/staff/payments'))
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }
    loadData()
  }, [loadData, pathname, isCentreAdmin, isAdmin])

  const handleApproveDBT = async (batchNumber: string) => {
    if (!window.confirm(`Approve Direct Benefit Transfer (DBT) release for batch ${batchNumber}?`)) {
      return
    }

    setIsProcessing(batchNumber)
    const res = await approveProcurementForDBT(batchNumber)
    setIsProcessing(null)

    if (res.success) {
      setSuccessMsg(`Payment Approved! ${res.message}`)
      setBatches(getProcurementBatches())
      setTimeout(() => setSuccessMsg(''), 5000)
    }
  }

  const filteredBatches = batches.filter((b) => {
    const matchStatus = statusFilter === 'ALL' || b.payment_status === statusFilter
    const matchSearch =
      b.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmer_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.commodity && b.commodity.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchStatus && matchSearch
  })

  const totalDisbursed = batches
    .filter((b) => b.payment_status === 'PAID_DBT')
    .reduce((sum, b) => sum + b.net_amount, 0)
  const pendingAmount = batches
    .filter((b) => b.payment_status === 'PENDING_APPROVAL')
    .reduce((sum, b) => sum + b.net_amount, 0)

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="procurement"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="payments"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="payments"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Procurement Intake Vouchers &amp; DBT Releases"
        />

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                DBT Payment Approvals &amp; Voucher Vetting
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Review verified weighment receipts, moisture deduction vouchers, and release Direct Benefit Transfers.
              </p>
            </div>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {/* KPI Cards Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total DBT Disbursed</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0d631b', marginTop: '4px' }}>
                ₹{totalDisbursed.toLocaleString('en-IN')}
              </div>
              <small style={{ color: '#64748b', fontSize: '12px' }}>Direct to farmer bank accounts</small>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Pending Approval Amount</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                ₹{pendingAmount.toLocaleString('en-IN')}
              </div>
              <small style={{ color: '#64748b', fontSize: '12px' }}>Awaiting administrator release</small>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Total Intake Batches</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {batches.length} Batches
              </div>
              <small style={{ color: '#64748b', fontSize: '12px' }}>Weighed and quality certified</small>
            </div>
          </div>

          {/* Filters Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search farmer name, batch number or crop..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff', fontWeight: 600 }}
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="PAID_DBT">DBT Released (Paid)</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Batches Table Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 18px' }}>Batch Details</th>
                    <th style={{ padding: '14px 18px' }}>Farmer &amp; Contact</th>
                    <th style={{ padding: '14px 18px' }}>Net Quantity</th>
                    <th style={{ padding: '14px 18px' }}>MSP Rate</th>
                    <th style={{ padding: '14px 18px' }}>Gross Value</th>
                    <th style={{ padding: '14px 18px' }}>Deductions</th>
                    <th style={{ padding: '14px 18px' }}>Net Payable DBT</th>
                    <th style={{ padding: '14px 18px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>No Direct Benefit Transfer (DBT) Records Found</p>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                            {searchQuery || statusFilter !== 'ALL'
                              ? 'No records match your selected filter criteria.'
                              : 'Batches will automatically appear here for PFMS DBT approval once weighment and assaying are completed.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((b) => {
                    const isPending = b.payment_status === 'PENDING_APPROVAL'
                    return (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '13px', display: 'block' }}>{b.batch_number}</strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{b.commodity}</span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <strong style={{ color: '#334155', display: 'block' }}>{b.farmer_name}</strong>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{b.farmer_phone}</span>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                          {b.net_weight_qtl.toFixed(2)} Qtl
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>
                          ₹{b.msp_rate_per_qtl}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                          ₹{b.gross_amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 18px', color: b.deductions > 0 ? '#b91c1c' : '#94a3b8' }}>
                          {b.deductions > 0 ? `- ₹${b.deductions.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0d631b', fontSize: '14px' }}>
                          ₹{b.net_amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: '12px',
                              background: b.payment_status === 'PAID_DBT' ? '#dcfce7' : '#fef3c7',
                              color: b.payment_status === 'PAID_DBT' ? '#166534' : '#92400e',
                            }}
                          >
                            {b.payment_status === 'PAID_DBT' ? '● DBT Released' : '○ Pending Approval'}
                          </span>
                          {b.utr_number && (
                            <small style={{ display: 'block', fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                              UTR: {b.utr_number}
                            </small>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {isPending ? (
                            <button
                              type="button"
                              disabled={isProcessing === b.batch_number}
                              onClick={() => handleApproveDBT(b.batch_number)}
                              style={{
                                background: '#0d631b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 2px 6px rgba(13, 99, 27, 0.2)',
                              }}
                            >
                              <BadgeCheck size={13} />
                              {isProcessing === b.batch_number ? 'Releasing...' : 'Approve DBT'}
                            </button>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#0d631b', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={14} /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
