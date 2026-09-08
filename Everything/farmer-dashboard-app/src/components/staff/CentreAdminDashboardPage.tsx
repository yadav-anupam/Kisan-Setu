import { useState, useEffect } from 'react'
import {
  Building2,
  Calendar,
  Clock,
  Scale,
  Sparkles,
  Package,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Megaphone,
  ArrowUpRight,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getProcurementBatches,
  fetchStaffDashboardKPIs,
  getCommodityPrices,
  getOfficialPriceAnnouncements,
  type StaffProfile,
  type PriceAnnouncementRecord,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import CentreAdminSidebar from './CentreAdminSidebar'
import './StaffQRScannerPage.css'

export default function CentreAdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [kpis, setKpis] = useState({
    todayBookings: 0,
    todayVerified: 0,
    pendingVerification: 0,
    currentQueue: 0,
    totalProcuredQtl: 0,
    pendingDbtAmount: 0,
    moisturePassRate: 100,
    activeCounters: 4,
    activeWeighbridges: 2,
  })
  const [batches, setBatches] = useState<any[]>([])
  const [prices] = useState(getCommodityPrices())
  const [priceAnnouncements, setPriceAnnouncements] = useState<PriceAnnouncementRecord[]>(getOfficialPriceAnnouncements)
  const [isLoading, setIsLoading] = useState(false)
  const [avgMoisture, setAvgMoisture] = useState('11.5')

  const loadData = () => {
    setIsLoading(true)
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    const allBatches = getProcurementBatches()
    const centreBatches = allBatches.filter(
      (b) =>
        !b.centre_name ||
        !currentStaff.centre_name ||
        b.centre_name.toLowerCase().includes(currentStaff.centre_name.toLowerCase()) ||
        currentStaff.centre_name.toLowerCase().includes(b.centre_name.toLowerCase())
    )
    setBatches(centreBatches)

    const totalQtl = centreBatches.reduce((sum, b) => sum + (Number(b.net_weight_qtl) || 0), 0)
    const pendingDbt = centreBatches
      .filter((b) => b.payment_status === 'PENDING_APPROVAL')
      .reduce((sum, b) => sum + (Number(b.net_amount) || 0), 0)

    const passedBatches = centreBatches.filter((b) => b.payment_status !== 'REJECTED').length
    const passRate = centreBatches.length > 0 ? Math.round((passedBatches / centreBatches.length) * 100) : 100

    const moistureMean =
      centreBatches.length > 0
        ? (centreBatches.reduce((s, b) => s + (Number(b.moisture_percentage) || 11.5), 0) / centreBatches.length).toFixed(1)
        : '11.5'
    setAvgMoisture(moistureMean)

    fetchStaffDashboardKPIs(currentStaff.centre_id)
      .then((data) => {
        setKpis({
          todayBookings: data.todayBookings || 0,
          todayVerified: data.todayVerified || 0,
          pendingVerification: data.pendingVerification || 0,
          currentQueue: data.currentQueue || 0,
          totalProcuredQtl: Math.round(totalQtl * 100) / 100,
          pendingDbtAmount: pendingDbt,
          moisturePassRate: passRate,
          activeCounters: 4,
          activeWeighbridges: 2,
        })
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/centre-admin/dashboard')
      navigate('/centre-admin/login')
      return
    }
    loadData()

    const handleRealtime = () => loadData()
    const handlePriceUpdate = () => {
      setPriceAnnouncements(getOfficialPriceAnnouncements())
    }
    window.addEventListener('kisan_setu_procurement_updated', handleRealtime)
    window.addEventListener('kisan_setu_booking_updated', handleRealtime)
    window.addEventListener('kisan_setu_official_price_announced', handlePriceUpdate)
    window.addEventListener('kisan_setu_msp_prices_updated', handlePriceUpdate)
    window.addEventListener('storage', handleRealtime)
    window.addEventListener('storage', handlePriceUpdate)

    return () => {
      window.removeEventListener('kisan_setu_procurement_updated', handleRealtime)
      window.removeEventListener('kisan_setu_booking_updated', handleRealtime)
      window.removeEventListener('kisan_setu_official_price_announced', handlePriceUpdate)
      window.removeEventListener('kisan_setu_msp_prices_updated', handlePriceUpdate)
      window.removeEventListener('storage', handleRealtime)
      window.removeEventListener('storage', handlePriceUpdate)
    }
  }, [])

  const pendingDbtBatches = batches.filter((b) => b.payment_status === 'PENDING_APPROVAL')

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <CentreAdminSidebar
        activeTab="dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Mandi Centre Operational Command"
        />

        <main style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
          {/* Official Gazette MSP Announcement Banner */}
          {priceAnnouncements.length > 0 && (() => {
            const latest = priceAnnouncements[0]
            return (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  border: latest.isPriceRaised ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: latest.isPriceRaised ? '#16a34a' : '#0284c7',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {latest.isPriceRaised ? <Sparkles size={20} /> : <Megaphone size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: latest.isPriceRaised ? '#dcfce7' : '#e0f2fe',
                          color: latest.isPriceRaised ? '#166534' : '#0369a1',
                        }}
                      >
                        {latest.isPriceRaised ? '🔥 Active Government MSP Hike' : '📢 Official MSP Price Notice'}
                      </span>
                      {latest.circularRef && (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Gazette: {latest.circularRef}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                        {latest.cropName} {latest.hindiName ? `(${latest.hindiName})` : ''}:
                      </span>
                      <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '15px' }}>
                        ₹{latest.newPrice}/Qtl
                      </span>
                      {latest.bonusPerQtl > 0 && (
                        <span style={{ fontSize: '11px', color: '#166534', background: '#bbf7d0', padding: '1px 6px', borderRadius: '6px', fontWeight: 700 }}>
                          +₹{latest.bonusPerQtl} State Bonus
                        </span>
                      )}
                      {latest.isPriceRaised && latest.percentageIncrease > 0 && (
                        <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                          <ArrowUpRight size={13} /> +₹{latest.newPrice - latest.oldPrice}/Qtl (+{latest.percentageIncrease}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Season: <strong style={{ color: '#0f172a' }}>{latest.effectiveSeason}</strong>
                </div>
              </div>
            )
          })()}

          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #0d631b 60%, #15803d 100%)',
              borderRadius: '20px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 8px 24px -6px rgba(13, 99, 27, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                <Building2 size={13} /> {staff.centre_name || 'Chiraigaon Mandi Centre (FCS)'}
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.3px' }}>
                Centre Administration &amp; Intake Command
              </h1>
              <p style={{ fontSize: '13px', color: '#dcfce7', margin: 0 }}>
                Supervising Nodal Officer: <strong>{staff.full_name} ({staff.staff_id})</strong> • Live Procurement Session 2026-27
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={loadData}
                disabled={isLoading}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Refresh Telemetry
              </button>
            </div>
          </div>

          {/* 6 Metric KPI Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* KPI 1 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>Today's Bookings</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{kpis.todayBookings}</div>
              <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                ✓ {kpis.todayVerified} Verified &amp; Intake Ready
              </div>
            </div>

            {/* KPI 2 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>Holding Yard Queue</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{kpis.currentQueue} Trolleys</div>
              <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
                ~22 min Avg Clearance
              </div>
            </div>

            {/* KPI 3 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>Today's Procurement</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{kpis.totalProcuredQtl} Qtl</div>
              <div style={{ fontSize: '11.5px', color: '#9333ea', fontWeight: 700, marginTop: '4px' }}>
                {(kpis.totalProcuredQtl / 10).toFixed(1)} MT Procured
              </div>
            </div>

            {/* KPI 4 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>Weighbridge Status</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{kpis.activeWeighbridges} Bays Online</div>
              <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700, marginTop: '4px' }}>
                Calibrated &amp; Operational
              </div>
            </div>

            {/* KPI 5 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>Moisture FAQ Rate</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{kpis.moisturePassRate}%</div>
              <div style={{ fontSize: '11.5px', color: '#ea580c', fontWeight: 700, marginTop: '4px' }}>
                Avg {avgMoisture}% Moisture (&le;12% FAQ)
              </div>
            </div>

            {/* KPI 6 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b' }}>DBT Release Ready</span>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IndianRupee size={17} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                ₹ {(kpis.pendingDbtAmount / 100000).toFixed(2)} L
              </div>
              <div style={{ fontSize: '11.5px', color: '#dc2626', fontWeight: 700, marginTop: '4px' }}>
                {pendingDbtBatches.length} Vouchers Awaiting Vetting
              </div>
            </div>
          </div>

          {/* Quick Operational Shortcuts */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
              Centre Operations &amp; Fast-Track Actions
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div
                onClick={() => navigate('/centre-admin/appointments')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Vet Farmer Appointments</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Daily slot pacing &amp; quotas</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                onClick={() => navigate('/centre-admin/token-management')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Live Queue &amp; Token Speed</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Manage bay calls &amp; pauses</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                onClick={() => navigate('/centre-admin/payments')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>DBT Payment Vetting</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Approve J-Form bank releases</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>

              <div
                onClick={() => navigate('/centre-admin/staff')}
                style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Centre Staff Roster</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>Assign scales &amp; gate officers</div>
                  </div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>
          </div>

          {/* 2-Column Operational Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            {/* Left: Pending J-Form Vouchers Awaiting DBT Approval */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Pending J-Form Procurement Vouchers
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Weighed and quality-tested batches awaiting administrative DBT payout release.
                  </p>
                </div>
                <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  {pendingDbtBatches.length} Vouchers
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingDbtBatches.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <CheckCircle2 size={28} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a' }}>All J-Form Vouchers Cleared</strong>
                    <span style={{ fontSize: '12px' }}>No procurement batches are currently pending superintendent DBT authorization.</span>
                  </div>
                ) : (
                  pendingDbtBatches.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      style={{
                        border: '1px solid #f1f5f9',
                        borderRadius: '12px',
                        padding: '14px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{b.farmer_name}</span>
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                            #{b.batch_number}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {b.commodity} • Net: <strong style={{ color: '#0f172a' }}>{b.net_weight_qtl} Qtl</strong> • Moisture: {b.moisture_percentage}%
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>
                          ₹ {b.net_amount.toLocaleString('en-IN')}
                        </div>
                        <button
                          onClick={() => navigate('/centre-admin/payments')}
                          style={{
                            marginTop: '4px',
                            padding: '4px 10px',
                            background: '#15803d',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Authorize &rarr;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Active Mandi MSP Price Master & Scale Telemetry */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Active Centre MSP Price Rates
                </h3>
                <button
                  onClick={() => navigate('/centre-admin/price-management')}
                  style={{ background: 'none', border: 'none', color: '#15803d', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  View All &rarr;
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prices.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f0fdf4',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {p.cropName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16a34a' }}>
                        {p.hindiName || 'Grade A'} • {p.season}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d' }}>
                        ₹ {p.mspPerQtl} / Qtl
                      </div>
                      {p.bonusPerQtl ? (
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>+₹{p.bonusPerQtl} State Bonus</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
