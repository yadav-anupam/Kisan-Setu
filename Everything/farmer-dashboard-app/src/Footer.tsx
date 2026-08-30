import {
  ChevronRight,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from 'lucide-react'
import logoImg from './assets/logo.png'
import { navigate } from './router'
import { useLanguage } from './useLanguage'
import './Footer.css'

export default function Footer() {
  const { t } = useLanguage()

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    navigate(path)
  }

  return (
    <footer className="ks-universal-footer">
      <div className="ks-footer-tricolor" />

      <div className="ks-footer-container">
        {/* 4 Main Footer Columns */}
        <div className="ks-footer-grid">
          {/* Brand & Overview */}
          <div className="ks-footer-brand-col">
            <a href="/" className="ks-footer-brand" onClick={(e) => handleNav(e, '/')}>
              <img src={logoImg} alt="Kisan Setu Logo" className="ks-footer-logo-img" />
              <div className="ks-footer-brand-text">
                <strong>{t.brandName}</strong>
                <small>{t.brandTagline}</small>
              </div>
            </a>
            <p className="ks-footer-desc">{t.footer.desc}</p>
            <div className="ks-footer-socials">
              <a href="#" className="ks-social-icon" aria-label="Facebook">f</a>
              <a href="#" className="ks-social-icon" aria-label="Twitter">𝕏</a>
              <a href="#" className="ks-social-icon" aria-label="YouTube">▶</a>
              <a href="#" className="ks-social-icon" aria-label="Instagram">◎</a>
              <a href="#" className="ks-social-icon" aria-label="LinkedIn">in</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="ks-footer-col">
            <h3>{t.footer.quickLinks}</h3>
            <div className="ks-footer-links">
              <a href="/" onClick={(e) => handleNav(e, '/')}>
                <ChevronRight size={13} /> {t.nav.home}
              </a>
              <a href="/about" onClick={(e) => handleNav(e, '/about')}>
                <ChevronRight size={13} /> {t.nav.about}
              </a>
              <a href="/how-it-works" onClick={(e) => handleNav(e, '/how-it-works')}>
                <ChevronRight size={13} /> {t.nav.howItWorks}
              </a>
              <a href="/for-farmers" onClick={(e) => handleNav(e, '/for-farmers')}>
                <ChevronRight size={13} /> {t.nav.forFarmers}
              </a>
              <a href="/for-centres" onClick={(e) => handleNav(e, '/for-centres')}>
                <ChevronRight size={13} /> {t.nav.forCentres}
              </a>
              <a href="/features" onClick={(e) => handleNav(e, '/features')}>
                <ChevronRight size={13} /> {t.nav.features}
              </a>
            </div>
          </div>

          {/* Important Government Links */}
          <div className="ks-footer-col">
            <h3>{t.footer.importantLinks}</h3>
            <div className="ks-footer-links">
              <a href="/about" onClick={(e) => handleNav(e, '/about')}>
                <ChevronRight size={13} /> Official Mandate
              </a>
              <a href="/for-farmers" onClick={(e) => handleNav(e, '/for-farmers')}>
                <ChevronRight size={13} /> MSP Calculator
              </a>
              <a href="/for-centres" onClick={(e) => handleNav(e, '/for-centres')}>
                <ChevronRight size={13} /> Mandi Simulator
              </a>
              <a href="/staff/login" onClick={(e) => handleNav(e, '/staff/login')} style={{ color: '#86efac', fontWeight: 700 }}>
                <ChevronRight size={13} /> Staff &amp; APMC Desk Login
              </a>
              <a href="/contact" onClick={(e) => handleNav(e, '/contact')}>
                <ChevronRight size={13} /> {t.nav.contact}
              </a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="ks-footer-col">
            <h3>{t.footer.contactUs}</h3>
            <div className="ks-footer-links">
              <a href="tel:18001234567" className="ks-footer-contact-item">
                <Phone size={14} />
                <span>{t.footer.tollFree}</span>
              </a>
              <a href="https://wa.me/919214334494" target="_blank" rel="noopener noreferrer" className="ks-footer-contact-item">
                <MessageSquare size={14} />
                <span>WhatsApp: +91 92143 34494</span>
              </a>
              <a href="mailto:support@kisansetu.gov.in" className="ks-footer-contact-item">
                <Mail size={14} />
                <span>support@kisansetu.gov.in</span>
              </a>
              <a href="/contact" onClick={(e) => handleNav(e, '/contact')} className="ks-footer-contact-item">
                <MapPin size={14} />
                <span>{t.footer.address}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="ks-footer-bottom">
          <div className="ks-copyright-text">{t.footer.copyright}</div>
        </div>
      </div>
    </footer>
  )
}
