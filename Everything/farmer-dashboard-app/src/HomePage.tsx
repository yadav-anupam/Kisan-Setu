import {
  CalendarCheck,
  Check,
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
