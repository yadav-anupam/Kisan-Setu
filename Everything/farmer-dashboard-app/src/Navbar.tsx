import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe2, Leaf, Menu, UserRoundCheck, X } from 'lucide-react'
import { useLanguage } from './useLanguage'
import { navigate } from './router'
import logoImg from './assets/logo.png'
import './Navbar.css'

interface NavbarProps {
  activePath?: string
}

export default function Navbar({ activePath = '/' }: NavbarProps) {
  const { currentLang, setLanguage, t, languages } = useLanguage()
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.about, path: '/about' },
    { label: t.nav.howItWorks, path: '/how-it-works' },
    { label: t.nav.forFarmers, path: '/for-farmers' },
    { label: t.nav.forCentres, path: '/for-centres' },
    { label: t.nav.features, path: '/features' },
    { label: t.nav.contact, path: '/contact' },
  ]

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    navigate(path)
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="ks-navbar-wrapper">
      <header className="ks-navbar">
        {/* Brand & Logo */}
        <a className="ks-brand" href="/" onClick={(e) => handleNav(e, '/')}>
          {!imgError ? (
            <img
              src={logoImg}
              alt="Kisan Setu Logo"
              className="ks-brand-logo-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="ks-brand-fallback-icon">
              <Leaf size={24} />
            </div>
          )}
          <div className="ks-brand-text">
            <strong>{t.brandName}</strong>
            <small>{t.brandTagline}</small>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="ks-nav-links">
          {navItems.map((item) => {
            const isActive =
              item.path === activePath ||
              (item.path === '/' && (activePath === '' || activePath === '/'))
            return (
              <li className="ks-nav-item" key={item.path}>
                <a
                  className={`ks-nav-link ${isActive ? 'active' : ''}`}
                  href={item.path}
                  onClick={(e) => handleNav(e, item.path)}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ul>

        {/* Header Action Buttons */}
        <div className="ks-header-actions">
          {/* Language Selector Dropdown */}
          <div className="ks-lang-wrapper" ref={dropdownRef}>
            <button
              className={`ks-lang-btn ${langMenuOpen ? 'open' : ''}`}
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-label="Change Language"
              aria-expanded={langMenuOpen}
            >
              <Globe2 size={15} />
              <span>{activeLangObj.nativeName}</span>
              <ChevronDown size={13} className="ks-lang-arrow" />
            </button>

            {langMenuOpen && (
              <div className="ks-lang-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`ks-lang-option ${currentLang === lang.code ? 'selected' : ''}`}
                    onClick={() => {
                      setLanguage(lang.code)
                      setLangMenuOpen(false)
                    }}
                  >
                    <span className="ks-lang-native">{lang.nativeName}</span>
                    <span className="ks-lang-english">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login / Sign In CTA */}
          <a
            className="ks-login-cta"
            href="/login"
            onClick={(e) => handleNav(e, '/login')}
          >
            <UserRoundCheck size={16} />
            <span>{t.loginBtn}</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            className="ks-mobile-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="ks-mobile-drawer-backdrop"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="ks-mobile-drawer open">
            <div className="ks-drawer-header">
              <div className="ks-brand">
                <Leaf size={22} color="#0d631b" />
                <div className="ks-brand-text">
                  <strong>{t.brandName}</strong>
                  <small>{t.brandTagline}</small>
                </div>
              </div>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                }}
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="ks-drawer-nav">
              {navItems.map((item) => {
                const isActive =
                  item.path === activePath ||
                  (item.path === '/' && (activePath === '' || activePath === '/'))
                return (
                  <a
                    className={isActive ? 'active' : ''}
                    key={item.path}
                    href={item.path}
                    onClick={(e) => handleNav(e, item.path)}
                  >
                    {item.label}
                  </a>
                )
              })}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <a
                className="ks-login-cta"
                style={{ width: '100%', justifyContent: 'center' }}
                href="/login"
                onClick={(e) => handleNav(e, '/login')}
              >
                <UserRoundCheck size={16} />
                <span>{t.loginBtn}</span>
              </a>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
