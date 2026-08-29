import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Cloud,
  Cpu,
  FlaskConical,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './FeaturesPage.css'

const featureIcons = [CalendarCheck, Clock3, Scale, FlaskConical, Landmark, BarChart3]

export default function FeaturesPage() {
  const { t } = useLanguage()
  const fp = t.featuresPage

  return (
    <div className="features-page">
      <Navbar activePath="/features" />

      <main>
        {/* Hero Section */}
        <section className="features-hero">
          <span className="features-kicker">
            <Sparkles size={14} /> {fp.kicker}
          </span>
          <h1>
            {fp.title1} <em>{fp.title2}</em>
          </h1>
          <p>{fp.desc}</p>

          <div className="features-hero-badges">
            <div className="feat-badge">
              <Cpu size={16} /> {fp.badges.ai}
            </div>
            <div className="feat-badge">
              <Scale size={16} /> {fp.badges.scale}
            </div>
            <div className="feat-badge">
              <Zap size={16} /> {fp.badges.dbt}
            </div>
            <div className="feat-badge">
              <Cloud size={16} /> {fp.badges.cloud}
            </div>
          </div>
        </section>

        {/* Deep-Dive Grid */}
        <section className="features-grid-section">
          <div className="features-container">
            <div className="features-section-header">
              <h2>{fp.gridHeading}</h2>
              <p>{fp.gridSub}</p>
            </div>

            <div className="deep-features-grid">
              {fp.featuresList.map((item, index) => {
                const FeatureIcon = featureIcons[index % featureIcons.length]
                return (
                  <article className="deep-feature-card" key={item.title}>
                    <div className="deep-feature-icon">
                      <FeatureIcon size={24} />
                    </div>
                    <h3>{item.title}</h3>
                    <span className="card-subtitle">{item.subtitle}</span>
                    <p>{item.desc}</p>
                    <div className="deep-feature-bullets">
                      {item.bullets.map((b) => (
                        <div className="deep-bullet" key={b}>
                          <CheckCircle2 size={15} />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Security & Architecture Pillars */}
        <section className="arch-section">
          <div className="features-container">
            <div className="features-section-header">
              <h2>{fp.archHeading}</h2>
              <p>{fp.archSub}</p>
            </div>

            <div className="arch-grid">
              {fp.archPillars.map((p) => (
                <div className="arch-card" key={p.title}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '8px' }}>
                    <ShieldCheck size={20} />
                    <h4>{p.title}</h4>
                  </div>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="features-cta-section">
          <div className="features-cta-box">
            <h2>{fp.ctaTitle}</h2>
            <p>{fp.ctaDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="hero-primary"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', border: 'none', background: '#ffffff', color: '#0d631b' }}
              >
                {fp.ctaBookSlot} <ArrowRight size={16} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => navigate('/about')}
                style={{ cursor: 'pointer', background: 'transparent', color: '#ffffff', borderColor: '#ffffff' }}
              >
                {fp.ctaExploreHome}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
