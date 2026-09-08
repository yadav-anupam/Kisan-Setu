import { useState, useEffect, useCallback } from 'react'
import {
  Scale,
  Printer,
  Truck,
  FileText,
  BadgeCheck,
  Sparkles,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchCentreQueue,
  getProcurementBatches,
  saveWeighmentBatch,
  type QueueItem,
  type ProcurementBatchItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function StaffWeighmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [selectedToken, setSelectedToken] = useState<QueueItem | null>(null)

  // Weighment form state
  const [grossWeight, setGrossWeight] = useState<number | ''>('')
  const [tareWeight, setTareWeight] = useState<number | ''>('')
  const [selectedBay, setSelectedBay] = useState('Bay 2 - Heavy Weighbridge')
  const [batches, setBatches] = useState<ProcurementBatchItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successBatch, setSuccessBatch] = useState<ProcurementBatchItem | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    const s = getStaffAuthSession()
    try {
      const q = await fetchCentreQueue(s.centre_id)
      setQueue(q)
      if (q.length > 0 && !selectedToken) {
        // Pick serving or first waiting token
        const active = q.find((item) => item.status === 'SERVING') || q[0]
        setSelectedToken(active)
      }
    } catch {
      // ignore
    }
    setBatches(getProcurementBatches())
  }, [selectedToken])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || '/staff/weighment')
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

  const netWeight =
    typeof grossWeight === 'number' && typeof tareWeight === 'number'
      ? Math.max(0, Math.round((grossWeight - tareWeight) * 100) / 100)
      : 0

  const handleRecordWeighment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedToken) {
      setErrorMsg('Please select an active token from the queue on the left.')
      return
    }

    if (typeof grossWeight !== 'number' || typeof tareWeight !== 'number') {
      setErrorMsg('Please enter valid numerical gross and tare weights.')
      return
    }

    if (grossWeight <= tareWeight) {
      setErrorMsg('Gross weight must be greater than Tare weight.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const res = await saveWeighmentBatch({
      token_number: selectedToken.token_number,
      booking_number: selectedToken.booking_number,
      farmer_id: `KS-FARM-${selectedToken.token_number}`,
      farmer_name: selectedToken.farmer_name,
      commodity: selectedToken.commodity || 'Wheat (गेहूं)',
      gross_weight_qtl: grossWeight,
      tare_weight_qtl: tareWeight,
      bay_id: selectedBay.split(' - ')[0],
    })

    setIsSubmitting(false)
    if (res.success && res.batch) {
      setSuccessBatch(res.batch)
      setBatches(getProcurementBatches())
    } else {
      setErrorMsg(res.message || 'Failed to record weighment.')
    }
  }

  const handlePrintSlip = () => {
    window.print()
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="weighment"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="centres"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="weighment"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Digital Weighbridge &amp; Gross/Tare Station"
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
                Weighbridge Terminal &amp; Tare Scale
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Capture calibrated gross and tare truck weights, calculate net grain volume, and issue official procurement slips.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/staff/quality-check')}
                style={{
                  background: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={15} color="#0d631b" />
                Go to Quality Check →
              </button>
            </div>
          </div>

          {/* Grid Layout: Active Token Selector + Live Scale Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '28px' }}>
            {/* Left: Queue Token Selector */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={17} color="#0d631b" />
                  Vehicles on Weighbridge
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px' }}>
                  {queue.length} in yard
                </span>
              </div>

              {queue.length === 0 ? (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No vehicles currently waiting on weighbridge.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {queue.map((item) => {
                    const isSelected = selectedToken?.token_number === item.token_number
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedToken(item)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #0d631b' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                            Token {item.token_number}
                          </span>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '6px',
                              background: item.status === 'SERVING' ? '#bfdbfe' : '#e2e8f0',
                              color: item.status === 'SERVING' ? '#1e40af' : '#475569',
                            }}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                          {item.farmer_name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          {item.commodity} • {item.counter_id || 'Bay 2'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right: Live Digital Scale Form */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={18} color="#0d631b" />
                  Calibrated Digital Weight Console
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                  Station: {selectedBay}
                </span>
              </div>

              {selectedToken ? (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Selected Vehicle</span>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>
                      Token {selectedToken.token_number} — {selectedToken.farmer_name}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Commodity</span>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0d631b' }}>
                      {selectedToken.commodity}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', background: '#fffbeb', color: '#92400e', borderRadius: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
                  ⚠️ Please select a vehicle token from the left queue to begin weighment.
                </div>
              )}

              <form onSubmit={handleRecordWeighment}>
                {errorMsg && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Weighbridge Bay *
                    </label>
                    <select
                      value={selectedBay}
                      onChange={(e) => setSelectedBay(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="Bay 1 - Small Trucks">Bay 1 - Small Trucks &amp; Pickups</option>
                      <option value="Bay 2 - Heavy Weighbridge">Bay 2 - Tractor Trolley (Heavy)</option>
                      <option value="Bay 3 - Multi-Axle Scale">Bay 3 - Multi-Axle Trucks</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Gross Weight (Vehicle + Produce) in Qtls *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 62.50"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value ? parseFloat(e.target.value) : '')}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Tare Weight (Empty Vehicle) in Qtls *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 17.50"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(e.target.value ? parseFloat(e.target.value) : '')}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Net Weight Display Box */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <small style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>Calculated Net Weight</small>
                      <div style={{ fontSize: '20px', fontWeight: 800 }}>{netWeight.toFixed(2)} Qtl</div>
                    </div>
                    <BadgeCheck size={26} opacity={0.9} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedToken}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0d631b',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
                  }}
                >
                  <FileText size={17} />
                  {isSubmitting ? 'Recording & Generating Slip...' : 'Save Weighment & Issue Official Slip'}
                </button>
              </form>
            </div>
          </div>

          {/* Today's Recorded Weighment Slips Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Today's Certified Weighment Slips
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Total Batches: {batches.length}</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 18px' }}>Slip Batch No</th>
                    <th style={{ padding: '12px 18px' }}>Farmer Details</th>
                    <th style={{ padding: '12px 18px' }}>Commodity</th>
                    <th style={{ padding: '12px 18px' }}>Gross Wt</th>
                    <th style={{ padding: '12px 18px' }}>Tare Wt</th>
                    <th style={{ padding: '12px 18px' }}>Net Weight</th>
                    <th style={{ padding: '12px 18px' }}>Payment Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Slip Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                        {b.batch_number}
                        <small style={{ display: 'block', color: '#64748b', fontSize: '11px', fontFamily: 'sans-serif' }}>Token {b.token_number}</small>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{b.farmer_name}</strong>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>{b.farmer_phone}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                        {b.commodity}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>{b.gross_weight_qtl.toFixed(2)} Qtl</td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>{b.tare_weight_qtl.toFixed(2)} Qtl</td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0d631b' }}>
                        {b.net_weight_qtl.toFixed(2)} Qtl
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
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSuccessBatch(b)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Printer size={13} /> View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================================
          Official Digital Weighment Slip Modal
          ====================================================================== */}
      {successBatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0d631b', fontWeight: 800 }}>
                Government of Uttar Pradesh • Department of Food &amp; Civil Supplies
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                Official Weighbridge Intake Receipt
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                {successBatch.centre_name}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Batch Number:</span>
                <strong style={{ display: 'block', color: '#0f172a', fontFamily: 'monospace' }}>{successBatch.batch_number}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Token Number:</span>
                <strong style={{ display: 'block', color: '#0f172a' }}>{successBatch.token_number}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Farmer Name:</span>
                <strong style={{ display: 'block', color: '#0f172a' }}>{successBatch.farmer_name}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Commodity:</span>
                <strong style={{ display: 'block', color: '#0d631b' }}>{successBatch.commodity}</strong>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Gross Weight (Tractor + Produce):</span>
                <strong>{successBatch.gross_weight_qtl.toFixed(2)} Qtl</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Tare Weight (Empty Vehicle):</span>
                <strong>{successBatch.tare_weight_qtl.toFixed(2)} Qtl</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontSize: '14px', color: '#0d631b' }}>
                <strong>Net Procurement Quantity:</strong>
                <strong>{successBatch.net_weight_qtl.toFixed(2)} Qtl</strong>
              </div>
            </div>

            <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '20px' }}>
              Weighed by: {successBatch.weighed_by_name} on {new Date(successBatch.weighed_at).toLocaleString('en-IN')}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSuccessBatch(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrintSlip}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Printer size={15} /> Print Weighment Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
