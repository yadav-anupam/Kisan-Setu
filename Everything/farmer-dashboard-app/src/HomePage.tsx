import {
  CalendarCheck,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  LogIn,
  Navigation,
  QrCode,
  Search,
  ShieldCheck,
  Sprout,
  Users,
  WalletCards,
} from 'lucide-react'
import heroFarmerImg from './assets/hero-farmer.png'
import Navbar from './Navbar'
import Footer from './Footer'
import { navigate } from './router'
import { useLanguage } from './useLanguage'
import './HomePage.css'

const benefitIcons = [Clock3, Navigation, Check, WalletCards]
const trustIcons = [Clock3, Search, Search, ShieldCheck]

export default function HomePage() {
  const { t } = useLanguage()

  const impactStats = [
    { value: '48,562+', label: t.home.impactLabels.farmers, icon: Users },
    { value: '125+', label: t.home.impactLabels.centres, icon: Navigation },
    { value: '1,256+', label: t.home.impactLabels.appointments, icon: CalendarCheck },
    { value: '3,245+', label: t.home.impactLabels.procured, icon: Sprout },
    { value: '₹ 1.85 Cr+', label: t.home.impactLabels.payments, icon: CircleDollarSign },
  ]

  return (
    <div className="home-page" id="top">
      <Navbar activePath="/" />
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-copy">
              <span className="hero-kicker">{t.home.heroKicker}</span>
              <h1>
                {t.home.heroTitle1}
                <br />
                <em>{t.home.heroTitle2}</em>
              </h1>
              <p>{t.home.heroDesc}</p>

              <div className="hero-buttons" style={{ maxWidth: '480px' }}>
                <a
                  className="hero-primary"
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                >
                  <LogIn size={16} /> Login Farmer
                </a>
                <a
                  className="hero-secondary"
                  href="/verify"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/verify')
                  }}
                  style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
                >
                  <QrCode size={16} /> Verify Token / Gate Pass
                </a>
              </div>

              <div className="mini-benefits" id="for-farmers">
                {t.home.benefits.map(({ title, text }, index) => {
                  const BenefitIcon = benefitIcons[index % benefitIcons.length]
                  return (
                    <div key={title}>
                      <BenefitIcon size={16} />
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Side: Original Quality Hero Illustration */}
            <div className="hero-illustration-wrap">
              <img
                src={heroFarmerImg}
                alt="Kisan Setu Smart Farmer Procurement"
                className="hero-farmer-illustration"
              />
            </div>
          </div>
        </section>

        {/* Live Mandi Impact Bar */}
        <section className="impact-bar" id="impact">
          {impactStats.map(({ value, label, icon: ImpactIcon }) => (
            <div key={label}>
              <ImpactIcon size={22} />
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          ))}
        </section>

        {/* Verification & Gate Pass Section */}
        <section className="verify-banner-section" id="verify">
          <div className="verify-banner-container">
            <div className="verify-banner-left">
              <div className="verify-badge">
                <ShieldCheck size={15} /> APMC Mandi Gate &amp; Token Verification
              </div>
              <h2>Verify Gate Pass, Weighment Slips &amp; Farmer Tokens</h2>
              <p>
                Staff officers and gate operators can scan QR codes or enter token numbers for instant gate clearance, moisture check logging, and weighment authentication.
              </p>
              <div className="verify-features-list">
                <div className="verify-feat-item">
                  <CheckCircle2 size={16} color="#16a34a" /> Instant QR Code Gate Scanner
                </div>
                <div className="verify-feat-item">
                  <CheckCircle2 size={16} color="#16a34a" /> Real-Time Gate Entry Clearance
                </div>
                <div className="verify-feat-item">
                  <CheckCircle2 size={16} color="#16a34a" /> Automated Electronic Weight &amp; Moisture Slip
                </div>
              </div>
            </div>

            <div className="verify-banner-right">
              <div className="verify-cta-card">
                <div className="verify-card-header">
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center' }}>
                    <QrCode size={20} />
                  </div>
                  <div>
                    <strong>Mandi Gate Officer Desk</strong>
                    <small>Real-Time APMC Verification</small>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px', lineHeight: 1.5 }}>
                  Verify incoming tractor trolleys, issue digital weighbridge tokens, and authenticate farmer quota.
                </p>
                <a
                  className="verify-main-btn"
                  href="/verify"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/verify')
                  }}
                >
                  <QrCode size={16} /> Open Verification Scanner →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Transparency */}
        <section className="trust-section">
          <h2>{t.home.trustHeading}</h2>
          <div className="trust-grid">
            {t.home.trustPoints.map(({ title, text }, index) => {
              const TrustIcon = trustIcons[index % trustIcons.length]
              return (
                <div key={title}>
                  <span className="trust-icon">
                    <TrustIcon size={16} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
