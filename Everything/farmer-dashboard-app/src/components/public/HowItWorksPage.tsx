import { useState } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './HowItWorksPage.css'

const stepIcons = [CalendarCheck, Ticket, UserCheck, Clock3, Scale, BadgeCheck, FileCheck2, Landmark]

export default function HowItWorksPage() {
  const { t } = useLanguage()
  const [activeRole, setActiveRole] = useState<'farmer' | 'centre' | 'admin'>('farmer')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const h = t.howItWorks

  return (
    <div className="how-page">
      <Navbar activePath="/how-it-works" />

      <main>
        {/* Hero Section */}
        <section className="how-hero">
          <span className="how-kicker">
            <Sparkles size={14} /> {h.kicker}
          </span>
          <h1>
            {h.title1} <em>{h.title2}</em>
          </h1>
          <p>{h.desc}</p>

          <div className="how-hero-badges">
            <div className="how-badge">
              <CalendarCheck size={16} /> {h.badges.slot}
            </div>
            <div className="how-badge">
              <Scale size={16} /> {h.badges.weighment}
            </div>
            <div className="how-badge">
              <ShieldCheck size={16} /> {h.badges.security}
            </div>
            <div className="how-badge">
              <CircleDollarSign size={16} /> {h.badges.dbt}
            </div>
          </div>
        </section>

        {/* 8-Step Workflow Grid */}
        <section className="how-steps-section">
          <div className="how-container">
            <div className="how-section-header">
              <h2>{h.stepsHeading}</h2>
              <p>{h.stepsSub}</p>
            </div>

            <div className="steps-grid">
              {h.steps.map((item, index) => {
                const StepIcon = stepIcons[index % stepIcons.length]
                return (
                  <article className="step-card" key={item.step}>
                    <div className="step-card-header">
                      <span className="step-number">STAGE {item.step}</span>
                      <div className="step-icon-wrap">
                        <StepIcon size={22} />
                      </div>
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <span className="step-tag">
                      <CheckCircle2 size={13} /> {item.tag}
                    </span>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Role-Based Perspectives */}
        <section className="how-roles-section">
          <div className="how-section-header">
            <h2>{h.rolesHeading}</h2>
            <p>{h.rolesSub}</p>
          </div>

          <div className="roles-tabs">
            <button
              className={`role-tab-btn ${activeRole === 'farmer' ? 'active' : ''}`}
              onClick={() => setActiveRole('farmer')}
            >
              <Users size={16} /> {h.roleTabs.farmer}
            </button>
            <button
              className={`role-tab-btn ${activeRole === 'centre' ? 'active' : ''}`}
              onClick={() => setActiveRole('centre')}
            >
              <Building2 size={16} /> {h.roleTabs.centre}
            </button>
            <button
              className={`role-tab-btn ${activeRole === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveRole('admin')}
            >
              <ShieldCheck size={16} /> {h.roleTabs.admin}
            </button>
          </div>

          {activeRole === 'farmer' && (
            <div className="role-view-card">
              <div className="role-view-copy">
                <h3>{h.farmerView.title}</h3>
                <p>{h.farmerView.desc}</p>
                <div className="role-checklist">
                  {h.farmerView.bullets.map((bullet) => (
                    <div className="role-check-item" key={bullet}>
                      <CheckCircle2 size={18} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="role-preview-box">
                {h.farmerView.stats.map((st) => (
                  <div className="role-preview-stat" key={st.label}>
                    <strong>{st.label}</strong>
                    <span>{st.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRole === 'centre' && (
            <div className="role-view-card">
              <div className="role-view-copy">
                <h3>{h.centreView.title}</h3>
                <p>{h.centreView.desc}</p>
                <div className="role-checklist">
                  {h.centreView.bullets.map((bullet) => (
                    <div className="role-check-item" key={bullet}>
                      <CheckCircle2 size={18} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="role-preview-box">
                {h.centreView.stats.map((st) => (
                  <div className="role-preview-stat" key={st.label}>
                    <strong>{st.label}</strong>
                    <span>{st.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeRole === 'admin' && (
            <div className="role-view-card">
              <div className="role-view-copy">
                <h3>{h.adminView.title}</h3>
                <p>{h.adminView.desc}</p>
                <div className="role-checklist">
                  {h.adminView.bullets.map((bullet) => (
                    <div className="role-check-item" key={bullet}>
                      <CheckCircle2 size={18} />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="role-preview-box">
                {h.adminView.stats.map((st) => (
                  <div className="role-preview-stat" key={st.label}>
                    <strong>{st.label}</strong>
                    <span>{st.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="how-faq-section">
          <div className="how-container">
            <div className="how-section-header">
              <h2>{h.faqHeading}</h2>
              <p>{h.faqSub}</p>
            </div>

            <div className="faq-list">
              {h.faqs.map((faq, index) => (
                <div
                  className={`faq-item ${openFaq === index ? 'open' : ''}`}
                  key={faq.q}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={openFaq === index}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={20} />
                  </button>
                  {openFaq === index && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="how-cta-section">
          <div className="how-cta-box">
            <h2>{h.ctaTitle}</h2>
            <p>{h.ctaDesc}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                className="hero-primary"
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer', border: 'none', background: '#ffffff', color: '#0d631b' }}
              >
                {h.ctaBookBtn} <ArrowRight size={16} />
              </button>
              <button
                className="hero-secondary"
                onClick={() => navigate('/about')}
                style={{ cursor: 'pointer', background: 'transparent', color: '#ffffff', borderColor: '#ffffff' }}
              >
                {h.ctaLearnBtn}
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
