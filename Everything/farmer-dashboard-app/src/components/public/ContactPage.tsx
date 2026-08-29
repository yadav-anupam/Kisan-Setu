import { useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { useLanguage } from '../../useLanguage'
import './ContactPage.css'

const channelIcons = [Headphones, Mail, MessageSquare, MapPin]

export default function ContactPage() {
  const { t } = useLanguage()
  const cp = t.contactPage

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    mandi: '',
    topic: 'slot',
    msg: '',
  })
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      const randomTicket = `KS-2026-${Math.floor(10000 + Math.random() * 90000)}`
      setSubmittedTicket(randomTicket)
      setIsSubmitting(false)
    }, 600)
  }

  return (
    <div className="contact-page">
      <Navbar activePath="/contact" />

      <main>
        {/* Hero Section */}
        <section className="contact-hero">
          <span className="contact-kicker">
            <Sparkles size={14} /> {cp.kicker}
          </span>
          <h1>
            {cp.title1} <em>{cp.title2}</em>
          </h1>
          <p>{cp.desc}</p>

          <div className="contact-hero-badges">
            <div className="cnt-badge">
              <Phone size={16} /> {cp.badges.tollFree}
            </div>
            <div className="cnt-badge">
              <Headphones size={16} /> {cp.badges.languages}
            </div>
            <div className="cnt-badge">
              <ShieldCheck size={16} /> {cp.badges.instant}
            </div>
            <div className="cnt-badge">
              <MessageSquare size={16} /> {cp.badges.whatsapp}
            </div>
          </div>
        </section>

        {/* 4 Direct Channels */}
        <section className="contact-channels-section">
          <div className="contact-container">
            <div className="contact-section-header">
              <h2>{cp.channelsHeading}</h2>
              <p>{cp.channelsSub}</p>
            </div>

            <div className="channels-grid">
              {cp.channels.map((ch, index) => {
                const ChannelIcon = channelIcons[index % channelIcons.length]
                let href = '#'
                let target = undefined
                let rel = undefined
                if (index === 0) href = 'tel:18001234567'
                if (index === 1) href = 'mailto:support@kisansetu.gov.in'
                if (index === 2) {
                  href = 'https://wa.me/919214334494'
                  target = '_blank'
                  rel = 'noopener noreferrer'
                }
                return (
                  <article className="channel-card" key={ch.title}>
                    <div className="channel-icon">
                      <ChannelIcon size={24} />
                    </div>
                    <h3>{ch.title}</h3>
                    <span className="channel-val">{ch.val}</span>
                    <p>{ch.sub}</p>
                    <a className="channel-action" href={href} target={target} rel={rel}>
                      {ch.action} <ArrowRight size={14} />
                    </a>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Interactive Grievance & Support Form */}
        <section className="contact-form-section">
          <div className="contact-container">
            <div className="contact-section-header">
              <h2>{cp.formHeading}</h2>
              <p>{cp.formSub}</p>
            </div>

            <div className="support-form-card">
              {submittedTicket ? (
                <div className="form-success-box">
                  <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto' }} />
                  <h3>{cp.formLabels.successTitle}</h3>
                  <p>{cp.formLabels.successDesc}</p>
                  <div style={{ marginBottom: '24px' }}>
                    <small style={{ display: 'block', color: '#526056', marginBottom: '6px', fontSize: '13px' }}>
                      {cp.formLabels.ticketLabel}
                    </small>
                    <span className="ticket-pill">{submittedTicket}</span>
                  </div>
                  <button
                    className="hero-primary"
                    onClick={() => {
                      setSubmittedTicket(null)
                      setFormData({ name: '', phone: '', mandi: '', topic: 'slot', msg: '' })
                    }}
                    style={{ cursor: 'pointer', border: 'none', margin: '0 auto' }}
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="form-grid">
                  <div className="form-field">
                    <label>{cp.formLabels.name} *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>{cp.formLabels.phone} *</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9214334494"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>{cp.formLabels.mandi} *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karnal Grain Market, Haryana"
                      className="form-input"
                      value={formData.mandi}
                      onChange={(e) => setFormData({ ...formData, mandi: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>{cp.formLabels.topic} *</label>
                    <select
                      className="form-select"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    >
                      {cp.topics.map((tItem) => (
                        <option key={tItem.id} value={tItem.id}>
                          {tItem.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field full">
                    <label>{cp.formLabels.msg} *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please explain the issue you are facing..."
                      className="form-textarea"
                      value={formData.msg}
                      onChange={(e) => setFormData({ ...formData, msg: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      cp.formLabels.submitting
                    ) : (
                      <>
                        <Send size={16} /> {cp.formLabels.submit}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Regional State Nodal Desks */}
        <section className="contact-zones-section">
          <div className="contact-container">
            <div className="contact-section-header">
              <h2>{cp.zonesHeading}</h2>
              <p>{cp.zonesSub}</p>
            </div>

            <div className="zones-grid">
              {cp.zones.map((z) => (
                <div className="zone-card" key={z.region}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '4px' }}>
                    <Building2 size={18} />
                    <h4>{z.region}</h4>
                  </div>
                  <span className="zone-states">{z.state}</span>
                  <div>
                    <Phone size={14} /> <span>{z.phone}</span>
                  </div>
                  <div>
                    <Mail size={14} /> <span>{z.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
