import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FlaskConical,
  MapPin,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Users2,
  Zap,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import { ALL_PROCUREMENT_CENTRES } from '../../data/procurementCentresData'
import './ForCentresPage.css'

const capabilityIcons = [Activity, Scale, FlaskConical, FileCheck2, Users2, BarChart3]

export default function ForCentresPage() {
  const { t } = useLanguage()
  const [activeBays, setActiveBays] = useState<number>(3)
  const [timePerVehicle, setTimePerVehicle] = useState<number>(8)

  // Directory Filters
  const [districtFilter, setDistrictFilter] = useState<'ALL' | 'Varanasi' | 'Chandauli' | 'Ghazipur' | 'Jaunpur'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('ALL')

  const filteredCentres = ALL_PROCUREMENT_CENTRES.filter((centre) => {
    const matchesDistrict = districtFilter === 'ALL' || centre.district === districtFilter
    const matchesAgency = agencyFilter === 'ALL' || centre.agency === agencyFilter
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      centre.centreName.toLowerCase().includes(q) ||
      centre.blockTehsil.toLowerCase().includes(q) ||
      centre.address.toLowerCase().includes(q) ||
      centre.district.toLowerCase().includes(q) ||
      centre.agency.toLowerCase().includes(q)
    return matchesDistrict && matchesAgency && matchesSearch
  })

  const c = t.forCentres

  // Throughput calculations
  const vehiclesPerHour = Math.round((60 / timePerVehicle) * activeBays)
  const dailyVehicles = vehiclesPerHour * 10
  const dailyQuintals = (dailyVehicles * 45).toLocaleString('en-IN') // Avg 45 quintals per tractor/trolley

  return (
    <div className="centres-page">
      <Navbar activePath="/for-centres" />

      <main>
        {/* Hero Section */}
        <section className="centres-hero">
          <span className="centres-kicker">
            <Sparkles size={14} /> {c.kicker}
          </span>
          <h1>
            {c.title1} <em>{c.title2}</em>
          </h1>
          <p>{c.desc}</p>

          <div className="centres-hero-badges">
            <div className="centres-badge">
              <Zap size={16} /> {c.badges.antiRush}
            </div>
            <div className="centres-badge">
              <Scale size={16} /> {c.badges.scales}
            </div>
            <div className="centres-badge">
              <FileCheck2 size={16} /> {c.badges.paperless}
            </div>
            <div className="centres-badge">
              <Cpu size={16} /> {c.badges.efficiency}
            </div>
          </div>
        </section>

        {/* 6 Capabilities Modules */}
        <section className="centres-capabilities-section">
          <div className="centres-container">
            <div className="centres-section-header">
              <h2>{c.capabilitiesHeading}</h2>
              <p>{c.capabilitiesSub}</p>
            </div>

            <div className="centres-capabilities-grid">
              {c.capabilities.map((item, index) => {
                const CapIcon = capabilityIcons[index % capabilityIcons.length]
                return (
                  <article className="centre-capability-card" key={item.title}>
                    <div className="centre-capability-icon">
                      <CapIcon size={24} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Operational Metrics */}
        <section className="centres-metrics-section">
          <div className="centres-container">
            <div className="centres-section-header">
              <h2>{c.metricsHeading}</h2>
              <p>{c.metricsSub}</p>
            </div>

            <div className="centres-metrics-grid">
              {c.metrics.map((m) => (
                <div className="centre-metric-box" key={m.label}>
                  <strong>{m.val}</strong>
                  <span>{m.label}</span>
                  <small>{m.sub}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Throughput Simulator */}
        <section className="centres-sim-section">
          <div className="centres-container">
            <div className="centres-section-header">
              <h2>{c.simHeading}</h2>
              <p>{c.simSub}</p>
            </div>

            <div className="sim-card">
              <div className="sim-inputs">
                <div className="sim-field">
                  <label>
                    <span>{c.simScalesLabel}:</span>
                    <strong style={{ color: '#0d631b' }}>{activeBays} Active Weighbridges</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={activeBays}
                    className="sim-slider"
                    onChange={(e) => setActiveBays(Number(e.target.value))}
                  />
                </div>

                <div className="sim-field">
                  <label>
                    <span>{c.simTimeLabel}:</span>
                    <strong style={{ color: '#0d631b' }}>{timePerVehicle} Mins / Vehicle</strong>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="20"
                    value={timePerVehicle}
                    className="sim-slider"
                    onChange={(e) => setTimePerVehicle(Number(e.target.value))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
                  <ShieldCheck size={16} /> Real-Time Anti-Rush Load Balancing Algorithm
                </div>
              </div>

              <div className="sim-results-box">
                <div className="sim-result-item">
                  <span>{c.simHourlyCapacity}:</span>
                  <strong>{vehiclesPerHour} Vehicles / Hr</strong>
                </div>
                <div className="sim-result-item">
                  <span>Daily Processed Vehicles:</span>
                  <strong>~{dailyVehicles} Vehicles</strong>
                </div>
                <div className="sim-result-payout">
                  <small>{c.simDailyThroughput}</small>
                  <strong>{dailyQuintals} Qtl</strong>
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: '#dcfce7' }}>
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> Zero Roadside Gridlock Guaranteed
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Official Procurement Centres Directory */}
        <section style={{ padding: '60px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div className="centres-container">
            <div className="centres-section-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                <Building2 size={14} /> Uttar Pradesh Government Notification
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>
                Official Government Procurement Centres (2026–27)
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '680px', margin: '0 auto' }}>
                Direct MSP intake locations across Varanasi, Chandauli, Ghazipur &amp; Jaunpur districts for Paddy, Bajara, Makka &amp; Wheat (FCS, PCF, PCU, Mandi Samiti, FCI).
              </p>
            </div>

            {/* District Selector & Agency Filter Bar */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                marginBottom: '20px',
                background: '#ffffff',
                padding: '18px 20px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Row 1: District Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Select District:</span>
                <button
                  type="button"
                  onClick={() => setDistrictFilter('ALL')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: districtFilter === 'ALL' ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                    background: districtFilter === 'ALL' ? '#0d631b' : '#f8fafc',
                    color: districtFilter === 'ALL' ? '#ffffff' : '#334155',
                  }}
                >
                  All Districts ({ALL_PROCUREMENT_CENTRES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDistrictFilter('Varanasi')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: districtFilter === 'Varanasi' ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                    background: districtFilter === 'Varanasi' ? '#0d631b' : '#f8fafc',
                    color: districtFilter === 'Varanasi' ? '#ffffff' : '#334155',
                  }}
                >
                  Varanasi (43)
                </button>
                <button
                  type="button"
                  onClick={() => setDistrictFilter('Chandauli')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: districtFilter === 'Chandauli' ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                    background: districtFilter === 'Chandauli' ? '#0d631b' : '#f8fafc',
                    color: districtFilter === 'Chandauli' ? '#ffffff' : '#334155',
                  }}
                >
                  Chandauli (5)
                </button>
                <button
                  type="button"
                  onClick={() => setDistrictFilter('Ghazipur')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: districtFilter === 'Ghazipur' ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                    background: districtFilter === 'Ghazipur' ? '#0d631b' : '#f8fafc',
                    color: districtFilter === 'Ghazipur' ? '#ffffff' : '#334155',
                  }}
                >
                  Ghazipur (5)
                </button>
                <button
                  type="button"
                  onClick={() => setDistrictFilter('Jaunpur')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: districtFilter === 'Jaunpur' ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                    background: districtFilter === 'Jaunpur' ? '#0d631b' : '#f8fafc',
                    color: districtFilter === 'Jaunpur' ? '#ffffff' : '#334155',
                  }}
                >
                  Jaunpur (5)
                </button>
              </div>

              {/* Row 2: Search Box & Agency Filters */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search centre, block (e.g. Chandauli, Chakia, Chiraigaon), or village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px 0 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ALL', 'FCS', 'PCF', 'PCU', 'Mandi Samiti', 'FCI'].map((ag) => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => setAgencyFilter(ag)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: agencyFilter === ag ? '1.5px solid #0d631b' : '1px solid #cbd5e1',
                        background: agencyFilter === ag ? '#0d631b' : '#ffffff',
                        color: agencyFilter === ag ? '#ffffff' : '#334155',
                      }}
                    >
                      {ag === 'ALL' ? 'All Agencies' : ag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Centres Table */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '14px 16px', width: '45px' }}>#</th>
                      <th style={{ padding: '14px 16px' }}>District</th>
                      <th style={{ padding: '14px 16px' }}>Procurement Centre Name</th>
                      <th style={{ padding: '14px 16px' }}>Block / Tehsil</th>
                      <th style={{ padding: '14px 16px' }}>Agency</th>
                      <th style={{ padding: '14px 16px' }}>Eligible MSP Crops</th>
                      <th style={{ padding: '14px 16px' }}>Village / Address</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCentres.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                          No procurement centres match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCentres.map((centre) => {
                        const agencyColors: Record<string, { bg: string; text: string }> = {
                          FCS: { bg: '#e0f2fe', text: '#0369a1' },
                          PCF: { bg: '#fef3c7', text: '#92400e' },
                          PCU: { bg: '#f3e8ff', text: '#6b21a8' },
                          'Mandi Samiti': { bg: '#dcfce7', text: '#166534' },
                          FCI: { bg: '#fee2e2', text: '#991b1b' },
                        }
                        const col = agencyColors[centre.agency] || { bg: '#f1f5f9', text: '#475569' }

                        return (
                          <tr
                            key={centre.id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <td style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: 700 }}>
                              {centre.sNo}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0d631b' }}>
                              {centre.district}
                            </td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building2 size={16} color="#0d631b" />
                                <span>{centre.centreName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                              {centre.blockTehsil}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span
                                style={{
                                  background: col.bg,
                                  color: col.text,
                                  padding: '3px 9px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  display: 'inline-block',
                                }}
                              >
                                {centre.agency}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                              {centre.crops}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#64748b' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={13} color="#94a3b8" />
                                <span>{centre.address}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span
                                style={{
                                  background: '#f0fdf4',
                                  color: '#166534',
                                  border: '1px solid #bbf7d0',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                }}
                              >
                                {centre.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => navigate('/appointments')}
                                style={{
                                  background: '#0d631b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Book Slot →
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="centres-cta-section">
          <div className="centres-cta-box">
            <h2>{c.ctaTitle}</h2>
            <p>{c.ctaDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="hero-primary"
                onClick={() => navigate('/login')}
                style={{ cursor: 'pointer', border: 'none', background: '#ffffff', color: '#0d631b' }}
              >
                {c.ctaPortalBtn} <ArrowRight size={16} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => navigate('/contact')}
                style={{ cursor: 'pointer', background: 'transparent', color: '#ffffff', borderColor: '#ffffff' }}
              >
                Centre Support Helpdesk
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
