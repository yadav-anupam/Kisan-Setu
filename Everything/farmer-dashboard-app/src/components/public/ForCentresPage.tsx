import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FlaskConical,
  Scale,
  ShieldCheck,
  Sparkles,
  Users2,
  Zap,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './ForCentresPage.css'

const capabilityIcons = [Activity, Scale, FlaskConical, FileCheck2, Users2, BarChart3]

export default function ForCentresPage() {
  const { t } = useLanguage()
  const [activeBays, setActiveBays] = useState<number>(3)
  const [timePerVehicle, setTimePerVehicle] = useState<number>(8)

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
