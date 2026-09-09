import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  ShieldCheck,
  Scale,
  IndianRupee,
  Download,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import {
  fetchAdminMacroMetrics,
  type AdminMacroMetrics,
} from '../../services/supabaseDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'
import './AdminDashboardPage.css'

export default function AdminDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [timeRange, setTimeRange] = useState<'Today' | 'Week' | 'Season'>('Today')
  const [districtFilter, setDistrictFilter] = useState('ALL')
  const [metrics, setMetrics] = useState<AdminMacroMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      setStaff(getStaffAuthSession())
      const data = await fetchAdminMacroMetrics(districtFilter, timeRange)
      setMetrics(data)
    } catch (err) {
      console.error('Failed to load admin metrics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [districtFilter, timeRange])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/dashboard')
      navigate('/admin/login')
      return
    }
    loadData()

    // Real-time synchronization listeners
    const handleRealtimeUpdate = () => {
      loadData()
    }

    window.addEventListener('kisan_setu_procurement_updated', handleRealtimeUpdate)
    window.addEventListener('kisan_setu_booking_updated', handleRealtimeUpdate)
    window.addEventListener('kisan_setu_staff_vault_updated', handleRealtimeUpdate)
    window.addEventListener('kisan_setu_prices_updated', handleRealtimeUpdate)
    window.addEventListener('storage', handleRealtimeUpdate)

    return () => {
      window.removeEventListener('kisan_setu_procurement_updated', handleRealtimeUpdate)
      window.removeEventListener('kisan_setu_booking_updated', handleRealtimeUpdate)
      window.removeEventListener('kisan_setu_staff_vault_updated', handleRealtimeUpdate)
      window.removeEventListener('kisan_setu_prices_updated', handleRealtimeUpdate)
      window.removeEventListener('storage', handleRealtimeUpdate)
    }
  }, [loadData])

  const handleExportReport = () => {
    if (!metrics) return

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'District,Centres,Intake_Qtl,Avg_Wait_Mins,Congestion_Level,Active_Queue\n' +
      metrics.districtBreakdown
        .map(
          (d) =>
            `"${d.district}",${d.centreCount},${d.intakeQtl},${d.avgWaitMins},"${d.congestion}",${d.activeQueueCount}`
        )
        .join('\n') +
      '\n\n' +
      'Commodity,Quantity_Qtl,Share_Percentage\n' +
      metrics.commodityBreakdown
        .map((c) => `"${c.label}",${c.quantityQtl},${c.sharePercentage}%`)
        .join('\n') +
      '\n\n' +
      'Total_Active_Centres,Total_Registered_Farmers,Total_Appointed_Officers,Total_Tonnage_Qtl,Total_DBT_Disbursed_INR,Pending_DBT_INR\n' +
      `${metrics.centresCount},${metrics.farmersCount},${metrics.staffCount},${metrics.totalTonnageQtl},${metrics.totalDisbursedAmount},${metrics.pendingDbtAmount}\n`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `KisanSetu_Admin_District_Report_${districtFilter}_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const centresCount = metrics?.centresCount ?? 0
  const farmersCount = metrics?.farmersCount ?? 0
  const staffCount = metrics?.staffCount ?? 0
  const totalTonnageQtl = metrics?.totalTonnageQtl ?? 0
  const totalDisbursedAmount = metrics?.totalDisbursedAmount ?? 0
  const avgTurnaroundMins = metrics?.avgTurnaroundMins ?? 14.2
  const pipeline = metrics?.pipeline ?? {
    gateCheckIn: 0,
    weighbridgeLogged: 0,
    qualityCertified: 0,
    vouchersGenerated: 0,
    dbtSettled: 0,
  }
  const districtBreakdown = metrics?.districtBreakdown ?? []
  const commodityBreakdown = metrics?.commodityBreakdown ?? []

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="dashboard"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Administrative Master Intelligence &amp; District Overview"
        />

        <main className="admin-dashboard-container">
          {/* Top Welcome Action Bar */}
          <div className="admin-dash-header">
            <div className="admin-dash-header-left">
              <div className="admin-dash-meta-tags">
                <span className="admin-tag-gov">
                  STATE / DISTRICT GOVERNANCE
                </span>
                <span className="admin-tag-backend">
                  <Activity size={12} />
                  {metrics?.backendType || 'Statewide APMC Central Grid'}
                </span>
                <span className="admin-tag-user">
                  Logged in: <strong>{staff.full_name} ({staff.role})</strong>
                </span>
              </div>
              <h1 className="admin-dash-title">
                Kisan Setu Administrative Command Center
              </h1>
              <p className="admin-dash-subtitle">
                Macro-level telemetry, procurement throughput, financial DBT tracking, and yard queue health across Eastern Uttar Pradesh.
              </p>
            </div>

            <div className="admin-dash-controls">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="admin-dash-select"
              >
                <option value="ALL">All Districts ({centresCount} Mandis)</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Chandauli">Chandauli</option>
                <option value="Ghazipur">Ghazipur</option>
                <option value="Jaunpur">Jaunpur</option>
              </select>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as 'Today' | 'Week' | 'Season')}
                className="admin-dash-select"
              >
                <option value="Today">Today's Intake</option>
                <option value="Week">This Week</option>
                <option value="Season">Full Season (2026-27)</option>
              </select>

              <button
                type="button"
                onClick={loadData}
                disabled={isLoading}
                className="admin-dash-btn-refresh"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                type="button"
                onClick={handleExportReport}
                className="admin-dash-btn-export"
              >
                <Download size={15} /> Export CSV
              </button>
            </div>
          </div>
          {/* Top 6 Macro KPI Metric Cards */}
          <div className="admin-dash-kpi-grid">
            {/* Card 1: Active Centres */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Active Procurement Centres
                </span>
                <div className="admin-dash-kpi-value">
                  {centresCount}
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#166534' }}>
                  <ArrowUpRight size={13} /> {districtFilter === 'ALL' ? 'Statewide Network' : `${districtFilter} District`}
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                <Building2 size={20} />
              </div>
            </div>

            {/* Card 2: Registered Producers */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Registered Farmers
                </span>
                <div className="admin-dash-kpi-value">
                  {farmersCount}
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#166534' }}>
                  <ArrowUpRight size={13} /> Active KYC Verified
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                <Users size={20} />
              </div>
            </div>

            {/* Card 3: Staff & Officers */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Appointed Officers
                </span>
                <div className="admin-dash-kpi-value">
                  {staffCount}
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#475569' }}>
                  Across 4 Operational Sections
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                <ShieldCheck size={20} />
              </div>
            </div>

            {/* Card 4: Total Tonnage */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Grain Procured (Qtl)
                </span>
                <div className="admin-dash-kpi-value" style={{ color: '#0d631b' }}>
                  {totalTonnageQtl.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Qtl
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#166534' }}>
                  <ArrowUpRight size={13} /> FAQ Certified
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#ffedd5', color: '#c2410c' }}>
                <Scale size={20} />
              </div>
            </div>

            {/* Card 5: Total DBT Disbursed */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Total DBT Disbursed
                </span>
                <div className="admin-dash-kpi-value" style={{ color: '#0d631b', fontSize: '22px' }}>
                  ₹ {(totalDisbursedAmount / 100000).toFixed(2)} Lakh
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#166534' }}>
                  Direct to Bank (PFMS)
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#dcfce7', color: '#166534' }}>
                <IndianRupee size={20} />
              </div>
            </div>

            {/* Card 6: Average Gate Turnaround */}
            <div className="admin-dash-kpi-card">
              <div className="admin-dash-kpi-info">
                <span className="admin-dash-kpi-label">
                  Avg Turnaround Time
                </span>
                <div className="admin-dash-kpi-value">
                  {avgTurnaroundMins} min
                </div>
                <span className="admin-dash-kpi-sub" style={{ color: '#166534' }}>
                  -65% vs unmanaged yards
                </span>
              </div>
              <div className="admin-dash-kpi-icon" style={{ background: '#f1f5f9', color: '#334155' }}>
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Complete Procurement Progress Pipeline Ribbon */}
          <div className="admin-dash-card-box" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#0d631b" />
                Statewide Real-Time Procurement Intake Pipeline
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                Live Across All {centresCount} Procurement Centres
              </span>
            </div>

            <div className="admin-dash-pipeline-grid">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>1. Gate Check-In</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {pipeline.gateCheckIn} {pipeline.gateCheckIn === 1 ? 'Arrival' : 'Arrivals'}
                </div>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>✓ QR Validated</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>2. Weighbridge Scale</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {pipeline.weighbridgeLogged} Weighed
                </div>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>● Gross &amp; Tare Logged</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>3. Quality &amp; Moisture</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {pipeline.qualityCertified} Batches
                </div>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>✓ FAQ Certified</span>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>4. Intake Vouchers</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                  {pipeline.vouchersGenerated} Vouchers
                </div>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>✓ Billed at MSP</span>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>5. DBT Bank Release</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0d631b', margin: '4px 0' }}>
                  {pipeline.dbtSettled} Settled
                </div>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>✓ UTR Confirmed</span>
              </div>
            </div>
          </div>

          {/* Grid Layout: Multi-District Telemetry + Commodity Breakdown */}
          <div className="admin-dash-telemetry-grid">
            {/* Left: District Breakdown Table */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="#0d631b" />
                  District Mandi Throughput &amp; Yard Congestion
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Live Database Telemetry</span>
              </div>

              {/* Desktop & Tablet Table */}
              <div className="admin-dash-table-wrap">
                <table className="admin-dash-district-table">
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 14px' }}>District</th>
                      <th style={{ padding: '10px 14px' }}>Centres</th>
                      <th style={{ padding: '10px 14px' }}>Intake</th>
                      <th style={{ padding: '10px 14px' }}>Avg Wait Time</th>
                      <th style={{ padding: '10px 14px' }}>Yard Congestion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          No district records available.
                        </td>
                      </tr>
                    ) : (
                      districtBreakdown.map((row) => (
                        <tr key={row.district} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>{row.district}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{row.centreCount} Centres</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0d631b' }}>{row.intakeQtl} Qtl</td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>{row.avgWaitMins} mins</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                background:
                                  row.congestion === 'Optimal (Low)'
                                    ? '#dcfce7'
                                    : row.congestion === 'Medium Load'
                                    ? '#fef3c7'
                                    : '#fee2e2',
                                color:
                                  row.congestion === 'Optimal (Low)'
                                    ? '#166534'
                                    : row.congestion === 'Medium Load'
                                    ? '#92400e'
                                    : '#991b1b',
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 800,
                              }}
                            >
                              ● {row.congestion}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile District Cards (shown below 600px) */}
              <div className="admin-dash-district-cards-mobile">
                {districtBreakdown.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No district records available.
                  </div>
                ) : (
                  districtBreakdown.map((row) => (
                    <div key={row.district} className="admin-dash-district-card">
                      <div className="admin-dash-district-card-header">
                        <span className="admin-dash-district-card-name">{row.district}</span>
                        <span
                          style={{
                            background:
                              row.congestion === 'Optimal (Low)'
                                ? '#dcfce7'
                                : row.congestion === 'Medium Load'
                                ? '#fef3c7'
                                : '#fee2e2',
                            color:
                              row.congestion === 'Optimal (Low)'
                                ? '#166534'
                                : row.congestion === 'Medium Load'
                                ? '#92400e'
                                : '#991b1b',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                          }}
                        >
                          ● {row.congestion}
                        </span>
                      </div>

                      <div className="admin-dash-district-card-grid">
                        <div className="admin-dash-district-stat-item">
                          <span className="admin-dash-district-stat-label">Centres</span>
                          <span className="admin-dash-district-stat-val">{row.centreCount}</span>
                        </div>
                        <div className="admin-dash-district-stat-item">
                          <span className="admin-dash-district-stat-label">Intake</span>
                          <span className="admin-dash-district-stat-val" style={{ color: '#0d631b' }}>{row.intakeQtl} Qtl</span>
                        </div>
                        <div className="admin-dash-district-stat-item">
                          <span className="admin-dash-district-stat-label">Avg Wait</span>
                          <span className="admin-dash-district-stat-val">{row.avgWaitMins}m</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Commodity Share Donut / Progress Breakdown */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#0d631b" />
                    Crop Procurement Breakdown
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Season 2026-27</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {commodityBreakdown.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No crop procurement recorded yet.
                    </div>
                  ) : (
                    commodityBreakdown.map((item) => (
                      <div key={item.commodity}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                          <strong style={{ color: '#0f172a' }}>{item.label}</strong>
                          <span style={{ color: item.color, fontWeight: 800 }}>
                            {item.sharePercentage}% ({item.quantityQtl} Qtl)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.max(item.sharePercentage, item.quantityQtl > 0 ? 3 : 0)}%`,
                              height: '100%',
                              background: item.color,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Active Government MSP Benchmark</span>
                <button
                  type="button"
                  onClick={() => navigate('/admin/prices')}
                  style={{ background: 'none', border: 'none', color: '#0d631b', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Manage MSP Rates →
                </button>
              </div>
            </div>
          </div>

          {/* Quick Administrative Actions Grid */}
          <div className="admin-dash-card-box">
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#0d631b" />
              Administrative Governance Shortcuts
            </h3>

            <div className="admin-dash-shortcuts-grid">
              <button
                type="button"
                onClick={() => navigate('/admin/management')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Users size={18} color="#0d631b" />
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Appoint Officers &amp; Staff</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Assign mandis, grant operator roles, and manage 4 operational sections.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/prices')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <IndianRupee size={18} color="#0d631b" />
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Government MSP Master</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Update official purchase rates, state incentives, and FAQ moisture limits.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/centres')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <Building2 size={18} color="#0d631b" />
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Register Purchase Depot</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Add new PACS, PCF, or FCI procurement centres with district geofences.
                </p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/payments')}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <CheckCircle2 size={18} color="#0d631b" />
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>Approve DBT Vouchers</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Review verified weighment slips and release direct bank payments.
                </p>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
