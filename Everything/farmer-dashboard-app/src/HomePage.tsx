import {
  CalendarCheck,
  Clock3,
  IndianRupee,
  LogIn,
  PlayCircle,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
  Building2,
  Package,
} from 'lucide-react'
import heroFarmerImg from './assets/hero-farmer.png'
import Navbar from './Navbar'
import Footer from './Footer'
import { navigate } from './router'
import { useLanguage } from './useLanguage'
import './HomePage.css'

export default function HomePage() {
  const { t } = useLanguage()

  const impactStats = [
    { value: '48,562+', label: t.home.impactLabels.farmers, icon: Users },
    { value: '125+', label: t.home.impactLabels.centres, icon: Building2 },
    { value: '1,256+', label: t.home.impactLabels.appointments, icon: CalendarCheck },
    { value: '3,245+', label: t.home.impactLabels.procured, icon: Package },
    { value: '₹ 1.85 Cr+', label: t.home.impactLabels.payments, icon: IndianRupee },
  ]

  const trustCards = [
    {
      icon: Clock3,
      badgeBg: '#ffffff',
      iconColor: '#16a34a',
      border: '1px solid #e2e8f0',
      title: t.home.trustPoints[0]?.title || 'Reduce Waiting Time',
      desc: t.home.trustPoints[0]?.text || 'Smart queue management saves your time.',
    },
    {
      icon: TrendingUp,
      badgeBg: '#16a34a',
      iconColor: '#ffffff',
      border: 'none',
      title: t.home.trustPoints[1]?.title || 'Better Planning',
      desc: t.home.trustPoints[1]?.text || 'Book in advance and plan your visit better.',
    },
    {
      icon: Search,
      badgeBg: '#14532d',
      iconColor: '#ffffff',
      border: 'none',
      title: t.home.trustPoints[2]?.title || 'Complete Transparency',
      desc: t.home.trustPoints[2]?.text || 'All information and updates at your fingertips.',
    },
    {
      icon: ShieldCheck,
      badgeBg: '#ffffff',
      iconColor: '#16a34a',
      border: '1px solid #bbf7d0',
      title: t.home.trustPoints[3]?.title || 'Secure & Reliable',
      desc: t.home.trustPoints[3]?.text || 'Your data and payments are always safe.',
    },
  ]

  return (
    <div className="home-page" id="top">
      <Navbar activePath="/" />
      <main>
        {/* Hero Section */}
        <section className="ks-hero-section">
          <div className="ks-hero-container">
            {/* Left Hero Content */}
            <div className="ks-hero-left">
              <div className="ks-hero-kicker">
                <Sprout size={14} />
                <span>{t.home.heroKicker}</span>
              </div>

              <h1 className="ks-hero-title">
                {t.home.heroTitle1} <br />
                <span className="ks-hero-highlight">{t.home.heroTitle2}</span>
              </h1>

              <p className="ks-hero-desc">{t.home.heroDesc}</p>

              <div className="ks-hero-actions">
                <a
                  className="ks-btn-primary"
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/login')
                  }}
                >
                  <LogIn size={18} />
                  <span>Login Farmer</span>
                </a>
                <a
                  className="ks-btn-secondary"
                  href="/how-it-works"
                  onClick={(e) => {
                    e.preventDefault()
                    navigate('/how-it-works')
                  }}
                >
                  <PlayCircle size={18} />
                  <span>{t.home.howItWorksBtn}</span>
                </a>
              </div>
            </div>

            {/* Right Hero Graphic */}
            <div className="ks-hero-right">
              <div className="ks-hero-graphic-wrap">
                <img
                  src={heroFarmerImg}
                  alt="Kisan Setu Smart Farmer Procurement"
                  className="ks-hero-farmer-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Live Mandi Impact Bar */}
        <section className="ks-impact-bar-wrap">
          <div className="ks-impact-bar">
            {impactStats.map(({ value, label, icon: ImpactIcon }, idx) => (
              <div className="ks-impact-item" key={idx}>
                <div className="ks-impact-icon-circle">
                  <ImpactIcon size={20} />
                </div>
                <div className="ks-impact-info">
                  <strong>{value}</strong>
                  <small>{label}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Kisan Setu Section */}
        <section className="ks-trust-section">
          <div className="ks-section-container">
            <div className="ks-trust-box">
              <div className="ks-trust-header">
                <h2>{t.home.trustHeading}</h2>
              </div>

              <div className="ks-trust-grid">
                {trustCards.map((point, idx) => {
                  const TrustIcon = point.icon
                  return (
                    <div className="ks-trust-card" key={idx}>
                      <div
                        className="ks-trust-icon-badge"
                        style={{
                          background: point.badgeBg,
                          color: point.iconColor,
                          border: point.border,
                        }}
                      >
                        <TrustIcon size={20} />
                      </div>
                      <div className="ks-trust-text">
                        <h4>{point.title}</h4>
                        <p>{point.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

