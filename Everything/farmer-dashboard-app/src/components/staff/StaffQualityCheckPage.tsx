import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  Droplets,
  FileCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchProcurementBatchesFromDB,
  saveQualityCheckBatch,
  getCommodityPrices,
  type StaffProfile,
  type ProcurementBatchItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function StaffQualityCheckPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [batches, setBatches] = useState<ProcurementBatchItem[]>([])
  const [selectedBatch, setSelectedBatch] = useState<ProcurementBatchItem | null>(null)

  // Quality check form state
  const [moisture, setMoisture] = useState<number | ''>('')
  const [foreignMatter, setForeignMatter] = useState<number | ''>('')
  const [damagedGrain, setDamagedGrain] = useState<number | ''>('')
  const [qualityGrade, setQualityGrade] = useState('Grade A (FAQ Standard)')
  const [deductionPercent, setDeductionPercent] = useState<number>(0)
  const [remarks, setRemarks] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    const s = getStaffAuthSession()
    setStaff(s)
    const all = await fetchProcurementBatchesFromDB()
    const targetCentre = s.centre_name
    const list = targetCentre && targetCentre !== 'ALL' 
      ? all.filter(b => b.centre_name && b.centre_name.toLowerCase().includes(targetCentre.toLowerCase()))
      : all
    setBatches(list)
    if (list.length > 0 && !selectedBatch) {
      setSelectedBatch(list[0])
      setMoisture(list[0].moisture_percentage || 11.4)
      setForeignMatter(list[0].foreign_matter_percentage || 0.4)
      setQualityGrade(list[0].quality_grade || 'Grade A (FAQ Standard)')
    }
  }, [selectedBatch])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || '/staff/quality-check')
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

  const prices = getCommodityPrices()
  const currentCropPrice = selectedBatch
    ? prices.find((p) => p.cropName.toLowerCase().includes(selectedBatch.commodity.toLowerCase().split(' ')[0])) || prices[0]
    : prices[0]

  const faqLimit = currentCropPrice.faqMoistureLimit || 12.0
  const isMoistureExceeded = typeof moisture === 'number' && moisture > faqLimit

  const handleSelectBatch = (b: ProcurementBatchItem) => {
    setSelectedBatch(b)
    setMoisture(b.moisture_percentage)
    setForeignMatter(b.foreign_matter_percentage)
    setQualityGrade(b.quality_grade)
    setRemarks(b.remarks || '')
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleSaveQuality = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) {
      setErrorMsg('Please select an intake batch.')
      return
    }
    if (typeof moisture !== 'number' || moisture < 0 || moisture > 35) {
      setErrorMsg('Please enter a valid moisture meter percentage (0 - 35%).')
      return
    }

    setErrorMsg('')
    setIsSubmitting(true)

    const res = await saveQualityCheckBatch({
      batch_number: selectedBatch.batch_number,
      moisture_percentage: moisture,
      foreign_matter_percentage: typeof foreignMatter === 'number' ? foreignMatter : 0.5,
      quality_grade: qualityGrade,
      deductions_percent: isMoistureExceeded ? deductionPercent : 0,
      remarks: remarks || `Moisture tested at ${moisture}%. Meets ${qualityGrade} criteria.`,
    })

    setIsSubmitting(false)
    if (res.success) {
      setSuccessMsg(`Quality inspection certified for batch ${selectedBatch.batch_number}!`)
      const all = await fetchProcurementBatchesFromDB()
      setBatches(all)
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.message || 'Failed to save quality assessment.')
    }
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="quality-check"
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
          activeTab="quality"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Grain Moisture &amp; Quality Inspection Station"
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
                Quality &amp; Moisture Analysis Station
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Verify Fair Average Quality (FAQ) standards, record digital moisture meter readings, and compute financial grading.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/staff/payments')}
                style={{
                  background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 16px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(13, 99, 27, 0.2)',
                }}
              >
                <BadgeCheck size={16} />
                Go to DBT Payment Approvals →
              </button>
            </div>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {/* Grid Layout: Batch Selector + Quality Inspection Console */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '24px', marginBottom: '28px' }}>
            {/* Left: Batches Awaiting Quality Check */}
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
                  <FileCheck size={17} color="#0d631b" />
                  Weighed Intake Batches
                </h3>
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                  {batches.length} ready
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '440px', overflowY: 'auto' }}>
                {batches.map((b) => {
                  const isSelected = selectedBatch?.batch_number === b.batch_number
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBatch(b)}
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
                        <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'monospace', color: '#0f172a' }}>
                          {b.batch_number}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: b.payment_status === 'PAID_DBT' ? '#dcfce7' : '#fef3c7',
                            color: b.payment_status === 'PAID_DBT' ? '#166534' : '#92400e',
                          }}
                        >
                          {b.quality_grade.split(' ')[0]}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                        {b.farmer_name} • <span style={{ color: '#0d631b' }}>{b.net_weight_qtl.toFixed(2)} Qtl</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        {b.commodity} • Token {b.token_number}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Inspection Console Form */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Droplets size={18} color="#0d631b" />
                  Grain Moisture &amp; FAQ Testing Console
                </h3>
                <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontWeight: 700, color: '#475569' }}>
                  FAQ Limit: {faqLimit}% Moisture
                </span>
              </div>

              {selectedBatch && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Batch &amp; Farmer</span>
                    <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a' }}>
                      {selectedBatch.batch_number} — {selectedBatch.farmer_name}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Net Weighment</span>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#0d631b' }}>
                      {selectedBatch.net_weight_qtl.toFixed(2)} Qtl
                    </strong>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveQuality}>
                {errorMsg && (
                  <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Moisture Meter Reading (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="e.g. 11.4"
                      value={moisture}
                      onChange={(e) => setMoisture(e.target.value ? parseFloat(e.target.value) : '')}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        borderRadius: '8px',
                        border: isMoistureExceeded ? '2px solid #ea580c' : '1.5px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 700,
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Foreign Matter / Impurities (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0.4"
                      value={foreignMatter}
                      onChange={(e) => setForeignMatter(e.target.value ? parseFloat(e.target.value) : '')}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Moisture Warning Banner if Exceeded */}
                {isMoistureExceeded && (
                  <div
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #ffedd5',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      marginBottom: '16px',
                      color: '#9a3412',
                      fontSize: '12.5px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                      <AlertTriangle size={16} color="#ea580c" />
                      <span>Moisture ({moisture}%) exceeds FAQ Maximum Tolerance ({faqLimit}%)</span>
                    </div>
                    <span>Suggested moisture deduction: </span>
                    <select
                      value={deductionPercent}
                      onChange={(e) => setDeductionPercent(parseFloat(e.target.value))}
                      style={{ marginLeft: '6px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fdba74', background: '#ffffff', fontSize: '12px', fontWeight: 700 }}
                    >
                      <option value="1.0">1.0% Value Deduction</option>
                      <option value="2.0">2.0% Value Deduction</option>
                      <option value="3.0">3.0% Value Deduction</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Quality Grade Certification *
                    </label>
                    <select
                      value={qualityGrade}
                      onChange={(e) => setQualityGrade(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="Grade A (FAQ Standard)">Grade A (FAQ Standard - Full MSP)</option>
                      <option value="Grade B (Standard)">Grade B (Standard Acceptable)</option>
                      <option value="Rejected (Below FAQ)">Rejected (Below FAQ Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Damaged / Shriveled Grain (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0.2"
                      value={damagedGrain}
                      onChange={(e) => setDamagedGrain(e.target.value ? parseFloat(e.target.value) : '')}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* Financial Summary Calculation Preview */}
                {selectedBatch && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>MSP Rate ({selectedBatch.commodity}):</span>
                      <strong>₹{selectedBatch.msp_rate_per_qtl} / Qtl</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Gross Valuation ({selectedBatch.net_weight_qtl} Qtl):</span>
                      <strong>₹{selectedBatch.gross_amount.toLocaleString('en-IN')}</strong>
                    </div>
                    {isMoistureExceeded && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#b91c1c' }}>
                        <span>Moisture Deduction ({deductionPercent}%):</span>
                        <strong>- ₹{Math.round(selectedBatch.gross_amount * (deductionPercent / 100)).toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '14.5px', color: '#0d631b' }}>
                      <strong>Final Approved Payable Amount:</strong>
                      <strong>
                        ₹
                        {isMoistureExceeded
                          ? Math.round(selectedBatch.gross_amount * (1 - deductionPercent / 100)).toLocaleString('en-IN')
                          : selectedBatch.gross_amount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedBatch}
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
                  <BadgeCheck size={17} />
                  {isSubmitting ? 'Certifying Quality...' : 'Certify Quality & Forward to DBT Approval'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

