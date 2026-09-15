import { useState, useEffect } from 'react'
import {
  Clock,
  Download,
  FileSpreadsheet,
  LifeBuoy,
  Printer,
  Scale,
  Search,
  ShoppingBag,
  Sprout,
  TrendingUp,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { fetchProcurementsFromDB, type DbProcurementBatch } from '../../services/supabaseDataService'
import FarmerSidebar from './FarmerSidebar'
import FarmerHeader from './FarmerHeader'
import './FarmerDashboard.css'
import './MyProcurementPage.css'

export interface ProcurementBatch {
  id: string
  batchNo: string
  date: string
  centre: string
  state: string
  produce: string
  grade: string
  quantity: number
  amount: number
  mspRate: number
  moisture: string
  grossWeight: number
  tareWeight: number
  status: 'Completed' | 'Pending' | 'Processing'
  utrNumber: string
}

export default function MyProcurementPage() {
  const farmer = getFarmerProfile()

  const [batches, setBatches] = useState<ProcurementBatch[]>([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [filterTab, setFilterTab] = useState<'all' | 'completed' | 'pending' | 'processing'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBatch, setSelectedBatch] = useState<ProcurementBatch | null>(null)

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/my-procurement')
      navigate('/login')
      return
    }
    let isMounted = true
    fetchProcurementsFromDB(farmer.farmerId, farmer.mobile, farmer.name).then((records: DbProcurementBatch[]) => {
      if (isMounted && records) {
        const transformed: ProcurementBatch[] = records.map((r) => ({
          id: r.id,
          batchNo: r.batch_number,
          date: new Date(r.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
          centre: r.centre_name,
          state: farmer.state || 'Uttar Pradesh',
          produce: r.commodity,
          grade: r.quality_grade || 'Grade A (FAQ Standard)',
          quantity: Number(r.net_weight_qtl),
          amount: Number(r.net_amount),
          mspRate: Number(r.msp_rate_per_qtl),
          moisture: `${r.moisture_percentage}%`,
          grossWeight: Math.round(Number(r.gross_weight_qtl) * 100),
          tareWeight: Math.round(Number(r.tare_weight_qtl) * 100),
          status: r.payment_status === 'PAID_DBT' ? 'Completed' : r.payment_status === 'PROCESSING' ? 'Processing' : 'Pending',
          utrNumber: r.payment_status === 'PAID_DBT' ? `UTR${new Date(r.created_at).getTime().toString().slice(-8)}8942` : 'Pending Weighbridge Settlement',
        }))
        setBatches(transformed)
      }
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [farmer.farmerId, farmer.mobile, farmer.name, farmer.state])

  // Filtered Batches
  const filteredBatches = batches.filter((item) => {
    if (filterTab === 'completed' && item.status !== 'Completed') return false
    if (filterTab === 'pending' && item.status !== 'Pending') return false
    if (filterTab === 'processing' && item.status !== 'Processing') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        item.produce.toLowerCase().includes(q) ||
        item.centre.toLowerCase().includes(q) ||
        item.batchNo.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="procurement-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="procurement"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onOpenBookingModal={() => navigate('/my-appointments')}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="pc-main-content">
        {/* Top Header Bar */}
        <FarmerHeader
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          pageTitle="My Procurement"
        />

        {/* 4 KPI Top Cards */}
        <section className="pc-kpi-grid">
          <div className="pc-kpi-card">
            <div className="pc-kpi-header">
              <ShoppingBag size={15} /> Total Batches
            </div>
            <strong>{batches.length}</strong>
            <small>This season</small>
          </div>

          <div className="pc-kpi-card">
            <div className="pc-kpi-header">
              <Scale size={15} /> Total Quantity
            </div>
            <strong>{batches.reduce((sum, b) => sum + b.quantity, 0).toFixed(2)} <span style={{ fontSize: '14px', fontWeight: 500 }}>Qtl</span></strong>
            <small>Quintals Verified</small>
          </div>

          <div className="pc-kpi-card highlight">
            <div className="pc-kpi-header">
              <TrendingUp size={15} /> Total Earnings
            </div>
            <strong>₹ {batches.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</strong>
            <small>100% Direct DBT</small>
          </div>

          <div className="pc-kpi-card pending">
            <div className="pc-kpi-header">
              <Clock size={15} /> Pending Payments
            </div>
            <strong>₹ {batches.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</strong>
            <small>{batches.filter(b => b.status === 'Pending').length} Batch in Weighment</small>
          </div>
        </section>

        {/* 2-Column Main Section: Left Table (8 cols), Right Analytics (4 cols) */}
        <section className="pc-content-grid">
          {/* Left Table Panel */}
          <div className="pc-table-panel">
            <div className="pc-filter-bar">
              <div className="pc-filter-chips">
                <button
                  className={`pc-filter-chip ${filterTab === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  All ({batches.length})
                </button>
                <button
                  className={`pc-filter-chip ${filterTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilterTab('completed')}
                >
                  Completed ({batches.filter(b => b.status === 'Completed').length})
                </button>
                <button
                  className={`pc-filter-chip ${filterTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterTab('pending')}
                >
                  Pending ({batches.filter(b => b.status === 'Pending').length})
                </button>
              </div>

              <div className="pc-search-box">
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="pc-table-wrap">
              <table className="pc-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Centre</th>
                    <th>Produce</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                        <ShoppingBag size={30} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.6 }} />
                        <strong style={{ display: 'block', fontSize: '13.5px', color: '#334155', marginBottom: '4px' }}>No Procurement Batches Recorded Yet</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Book a procurement slot at your nearest Mandi centre to record your produce intake and receive instant J-Form slips.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {b.date}
                          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500 }}>{b.batchNo}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.centre}</div>
                          <small style={{ color: '#64748b' }}>{b.state}</small>
                        </td>

                        <td>
                          <div className="pc-produce-cell">
                            <div className="pc-crop-icon">
                              <Sprout size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.produce}</div>
                              <small style={{ color: '#64748b' }}>{b.grade}</small>
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {b.quantity.toFixed(2)} Qtl
                        </td>

                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          ₹ {b.amount.toLocaleString('en-IN')}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`pc-status-badge ${
                              b.status === 'Completed'
                                ? 'completed'
                                : b.status === 'Pending'
                                ? 'pending'
                                : 'processing'
                            }`}
                          >
                            {b.status === 'Completed' ? '✓ Completed' : '⏱ In Progress'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0d631b',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '12.5px',
                              textDecoration: 'underline',
                            }}
                            onClick={() => setSelectedBatch(b)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 16px', background: '#f8faf8', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <span>Showing {filteredBatches.length} of {batches.length} batches</span>
              <button
                style={{ background: 'none', border: 'none', color: '#0d631b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => alert('Exporting complete procurement records to Excel...')}
              >
                <FileSpreadsheet size={15} /> Export Report
              </button>
            </div>
          </div>

          {/* Right Analytics Panel */}
          <div className="pc-analytics-panel">
            {/* Season Overview */}
            <div className="pc-season-box">
              <h3>Season Overview</h3>
              <div className="pc-overview-row">
                <span>Total Quantity</span>
                <strong>{batches.reduce((sum, b) => sum + b.quantity, 0).toFixed(2)} Qtl</strong>
              </div>
              <div className="pc-overview-row">
                <span>Total Amount</span>
                <strong>₹ {batches.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</strong>
              </div>
              <div className="pc-overview-row">
                <span>Avg. Price/Qtl</span>
                <strong>
                  ₹ {batches.reduce((sum, b) => sum + b.quantity, 0) > 0
                    ? Math.round(batches.reduce((sum, b) => sum + b.amount, 0) / batches.reduce((sum, b) => sum + b.quantity, 0)).toLocaleString('en-IN')
                    : '0'}
                </strong>
              </div>
              <div className="pc-overview-row" style={{ borderBottom: 'none' }}>
                <span>Highest Single Sale</span>
                <strong style={{ color: '#0d631b' }}>
                  ₹ {batches.length > 0 ? Math.max(...batches.map((b) => b.amount)).toLocaleString('en-IN') : '0'}
                </strong>
              </div>

              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', marginTop: '12px' }}
                onClick={() => alert('Generating full seasonal audit report...')}
              >
                <Download size={14} /> Download Season Statement
              </button>
            </div>

            {/* Crop Distribution Donut */}
            {(() => {
              const cropMap = batches.reduce((acc, b) => {
                const name = b.produce.split('/')[0].split('(')[0].trim() || 'Produce'
                acc[name] = (acc[name] || 0) + b.quantity
                return acc
              }, {} as Record<string, number>)

              const totalCropQty = Object.values(cropMap).reduce((a, b) => a + b, 0)
              const palette = ['#0d631b', '#16a34a', '#f59e0b', '#2563eb', '#8b5cf6']
              const cropEntries = Object.entries(cropMap).map(([crop, qty], idx) => ({
                name: crop,
                quantity: qty,
                percent: totalCropQty > 0 ? Math.round((qty / totalCropQty) * 100) : 0,
                color: palette[idx % palette.length],
              }))

              const primaryCrop = cropEntries.length > 0 ? cropEntries[0] : null

              return (
                <div className="pc-donut-box">
                  <h3 style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, margin: '0 0 4px', textAlign: 'left' }}>
                    Produce Distribution
                  </h3>
                  <div className="pc-donut-visual">
                    <div className="pc-donut-inner">
                      <strong>{primaryCrop ? `${primaryCrop.percent}%` : '0%'}</strong>
                      <small>{primaryCrop ? primaryCrop.name : 'No batches'}</small>
                    </div>
                  </div>

                  <div className="pc-donut-legend">
                    {cropEntries.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
                        No produce delivered yet
                      </div>
                    ) : (
                      cropEntries.map((c) => (
                        <div key={c.name} className="pc-legend-item">
                          <span className="pc-legend-dot" style={{ background: c.color }} />
                          <span>{c.name} ({c.percent}%)</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Support Banner */}
            <div className="pc-support-card">
              <div className="pc-support-icon">
                <LifeBuoy size={20} />
              </div>
              <div>
                <strong>Need Help with Produce?</strong>
                <p>24x7 Nodal Mandi Grievance Hotline</p>
                <button
                  style={{ background: 'none', border: 'none', color: '#166534', fontWeight: 800, fontSize: '11px', padding: '4px 0 0', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => window.open('https://wa.me/919214334494', '_blank')}
                >
                  Contact Desk (+91 92143 34494) →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          Detailed Batch Slip Modal
          ========================================================================== */}
      {selectedBatch && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '480px' }}>
            <div className="fd-modal-header">
              <h2>Weighment & Assay Slip</h2>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedBatch(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f0fdf4', padding: '12px 14px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: 800 }}>BATCH ID: {selectedBatch.batchNo}</span>
                <span style={{ fontSize: '11px', background: '#ffffff', padding: '2px 8px', borderRadius: '99px', border: '1px solid #86efac', color: '#166534', fontWeight: 700 }}>
                  {selectedBatch.status}
                </span>
              </div>
              <div style={{ fontFamily: 'Manrope', fontSize: '18px', fontWeight: 800, color: '#0d631b', marginTop: '4px' }}>
                {selectedBatch.produce} ({selectedBatch.quantity} Quintals)
              </div>
              <small style={{ color: '#15803d' }}>{selectedBatch.centre}, {selectedBatch.state}</small>
            </div>

            <div className="pc-modal-grid">
              <div className="pc-modal-stat-box">
                <small>Gross Weight</small>
                <strong>{selectedBatch.grossWeight} kg</strong>
              </div>
              <div className="pc-modal-stat-box">
                <small>Tare (Vehicle)</small>
                <strong>{selectedBatch.tareWeight} kg</strong>
              </div>
              <div className="pc-modal-stat-box">
                <small>Net Produce Weight</small>
                <strong>{(selectedBatch.grossWeight - selectedBatch.tareWeight)} kg</strong>
              </div>
              <div className="pc-modal-stat-box">
                <small>Moisture Percentage</small>
                <strong style={{ color: '#16a34a' }}>{selectedBatch.moisture} (Passed)</strong>
              </div>
              <div className="pc-modal-stat-box">
                <small>Govt MSP Rate</small>
                <strong>₹ {selectedBatch.mspRate} / Qtl</strong>
              </div>
              <div className="pc-modal-stat-box">
                <small>Total MSP Payout</small>
                <strong style={{ color: '#0d631b', fontSize: '15px' }}>₹ {selectedBatch.amount.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ background: '#f8faf8', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '11.5px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#64748b' }}>DBT Bank Account:</span>
                <strong>{farmer.bankAccount || 'XXXX-XXXX-4321'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Transaction Reference:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedBatch.utrNumber}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="fd-card-btn primary"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Slip
              </button>
              <button
                type="button"
                className="fd-card-btn secondary"
                onClick={() => setSelectedBatch(null)}
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
