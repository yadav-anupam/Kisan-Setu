import { useState } from 'react'
import {
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Navigation,
  PlayCircle,
  Search,
  ShieldCheck,
  Sprout,
  Users,
  WalletCards,
} from 'lucide-react'
import heroFarmerImg from './assets/hero-farmer.png'
import Navbar from './Navbar'
import Footer from './Footer'
import { useLanguage } from './useLanguage'
import './HomePage.css'

const benefitIcons = [Clock3, Navigation, Check, WalletCards]
const featureConfig = [
  { icon: CalendarCheck, tone: 'green' },
  { icon: Users, tone: 'blue' },
  { icon: FileText, tone: 'violet' },
  { icon: WalletCards, tone: 'orange' },
  { icon: FileText, tone: 'teal' },
]
const trustIcons = [Clock3, Search, Search, ShieldCheck]

export default function HomePage() {
  const { t } = useLanguage()
  const [carouselIndex, setCarouselIndex] = useState(0)

  const featureItems = t.home.features.map((f, i) => ({
    ...f,
    icon: featureConfig[i % featureConfig.length].icon,
    tone: featureConfig[i % featureConfig.length].tone,
  }))

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? featureItems.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === featureItems.length - 1 ? 0 : prev + 1))
  }

  const visibleFeatures = [
    ...featureItems.slice(carouselIndex),
    ...featureItems.slice(0, carouselIndex),
  ]

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault()
    if (targetId === '#top' || targetId === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.querySelector(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

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
              <div className="hero-buttons">
                <a
                  className="hero-primary"
                  href="#features"
                  onClick={(e) => handleNavClick(e, '#features')}
                >
                  <CalendarCheck size={16} /> {t.home.bookSlotBtn}
                </a>
                <a
                  className="hero-secondary"
                  href="#features"
                  onClick={(e) => handleNavClick(e, '#features')}
                >
                  <PlayCircle size={16} /> {t.home.howItWorksBtn}
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

        {/* Capabilities Showcase */}
        <section className="capabilities" id="features">
          <h2>{t.home.featuresHeading}</h2>
          <div className="feature-row">
            <button className="carousel-arrow" onClick={handlePrev} aria-label="Previous">
              <ChevronLeft size={16} />
            </button>

            {visibleFeatures.slice(0, 5).map((feature) => {
              const Icon = feature.icon
              return (
                <div className="feature-card" key={feature.title}>
                  <div className={`feature-icon ${feature.tone}`}>
                    <Icon size={20} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              )
            })}

            <button className="carousel-arrow" onClick={handleNext} aria-label="Next">
              <ChevronRight size={16} />
            </button>
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
