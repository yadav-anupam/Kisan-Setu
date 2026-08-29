import { ArrowRight, CheckCircle2, Landmark, Leaf, Scale, ShieldAlert, ShieldCheck, Timer, Users, XCircle } from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './AboutPage.css'

const pillarIcons = [Users, Scale, Timer, Landmark]

export default function AboutPage() {
  const { t } = useLanguage()

  const stats = [
    { value: '48,562+', label: t.home.impactLabels.farmers },
    { value: '125+', label: t.home.impactLabels.centres },
    { value: '1,256+', label: t.home.impactLabels.appointments },
    { value: '₹ 1.85 Cr+', label: t.home.impactLabels.payments },
  ]

  return (
    <div className="about-page">
      <Navbar activePath="/about" />

      <main>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-copy">
            <span className="about-kicker">
              <Leaf size={14} /> {t.about.kicker}
            </span>
            <h1>{t.about.title}</h1>
            <p>{t.about.desc}</p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button
                className="hero-primary"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {t.about.ctaHomeBtn} <ArrowRight size={16} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => navigate('/how-it-works')}
                style={{ cursor: 'pointer' }}
              >
                {t.home.howItWorksBtn}
              </button>
            </div>
          </div>

          <div className="about-hero-image-wrap">
            <div className="about-hero-image" />
            <div className="about-hero-floating-card">
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#dcfce7',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                  {t.about.badgeTitle}
                </strong>
                <small style={{ fontSize: '12px', color: '#526056' }}>
                  {t.about.badgeSub}
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars */}
        <section className="about-pillars">
          <div className="about-container">
            <div className="about-section-header">
              <h2>{t.about.pillarsHeading}</h2>
              <p>{t.about.pillarsSub}</p>
            </div>

            <div className="pillars-grid">
              {t.about.pillars.map(({ title, text }, index) => {
                const PillarIcon = pillarIcons[index % pillarIcons.length]
                return (
                  <article className="pillar-card" key={title}>
                    <div className="pillar-icon">
                      <PillarIcon size={26} />
                    </div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Problem vs Solution Comparison */}
        <section className="problem-solution">
          <div className="about-section-header">
            <h2>{t.about.problemsHeading}</h2>
            <p>{t.about.problemsSub}</p>
          </div>

          <div className="comparison-grid">
            <div className="comparison-col problem">
              <h3>
                <XCircle size={22} color="#dc2626" /> {t.about.mandiProblemsTitle}
              </h3>
              <div className="comparison-list">
                {t.about.problems.map((prob) => (
                  <div className="comparison-item" key={prob}>
                    <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{prob}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="comparison-col solution">
              <h3>
                <CheckCircle2 size={22} color="#16a34a" /> {t.about.solutionsTitle}
              </h3>
              <div className="comparison-list">
                {t.about.solutions.map((sol) => (
                  <div className="comparison-item" key={sol}>
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                    <span>{sol}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact Bar */}
        <section className="about-stats-bar">
          <div className="stats-flex">
            {stats.map(({ value, label }) => (
              <div className="stat-box" key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Box */}
        <section className="about-cta-section">
          <div className="about-cta-box">
            <h2>{t.about.ctaTitle}</h2>
            <p>{t.about.ctaDesc}</p>
            <div className="about-cta-buttons">
              <button
                className="hero-primary"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                {t.about.ctaHomeBtn} <ArrowRight size={16} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => navigate('/contact')}
                style={{ cursor: 'pointer' }}
              >
                {t.about.ctaHelpdeskBtn}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
