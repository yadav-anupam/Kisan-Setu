import { useState, useEffect, useRef } from 'react'
import {
  Menu,
  Globe2,
  ChevronDown,
  Bell,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import { getFarmerProfile, type FarmerProfile } from '../../auth'
import { useLanguage } from '../../useLanguage'
import './FarmerHeader.css'

interface FarmerHeaderProps {
  onToggleSidebar?: () => void
  pageTitle?: string
  pageSubtitle?: string
  showBadges?: boolean
  showNamaste?: boolean
}

export default function FarmerHeader({
  onToggleSidebar,
  pageTitle,
  pageSubtitle,
  showBadges = false,
  showNamaste = false,
}: FarmerHeaderProps) {
  const [farmer, setFarmer] = useState<FarmerProfile>(getFarmerProfile)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { currentLang, setLanguage, languages } = useLanguage()

  useEffect(() => {
    const handleProfileUpdate = () => {
      setFarmer(getFarmerProfile())
    }
    window.addEventListener('kisan_setu_profile_updated', handleProfileUpdate)
    window.addEventListener('kisan_setu_farmer_updated', handleProfileUpdate)
    return () => {
      window.removeEventListener('kisan_setu_profile_updated', handleProfileUpdate)
      window.removeEventListener('kisan_setu_farmer_updated', handleProfileUpdate)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]
  const displayName = farmer.name || 'Farmer'

  return (
    <header className="farmer-topbar">
      <div className="farmer-topbar-left">
        <div className="farmer-topbar-title-row">
          {onToggleSidebar && (
            <button
              type="button"
              className="farmer-mobile-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={18} />
            </button>
          )}

          {showNamaste ? (
            <h1 className="farmer-topbar-title">
              <span className="farmer-namaste-text">Namaste,</span>{' '}
              <span className="farmer-name-text">{farmer.name || 'Farmer'}</span>
            </h1>
          ) : (
            <h1 className="farmer-topbar-title">{pageTitle || 'Farmer Dashboard'}</h1>
          )}
        </div>

        {pageSubtitle && (
          <p className="farmer-topbar-subtitle">{pageSubtitle}</p>
        )}

        {showBadges && (
          <div className="farmer-topbar-badges">
            <span className="farmer-badge-loc">
              <MapPin size={12} className="farmer-meta-icon" />
              {farmer.district ? `${farmer.district}, ${farmer.state}` : 'Uttar Pradesh'}
            </span>
            {farmer.farmerId && (
              <span className="farmer-badge-id">
                <ShieldCheck size={11} className="farmer-meta-icon" />
                {farmer.farmerId}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="farmer-topbar-right">
        {/* Language Selector Dropdown */}
        <div className="farmer-lang-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`farmer-lang-btn ${langMenuOpen ? 'open' : ''}`}
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            aria-label="Change Language"
          >
            <Globe2 size={14} className="farmer-lang-globe" />
            <span className="farmer-lang-label">{activeLangObj.nativeName}</span>
            <ChevronDown size={12} className="farmer-lang-arrow" />
          </button>

          {langMenuOpen && (
            <div className="farmer-lang-menu">
              {languages.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  className={`farmer-lang-item ${currentLang === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    setLanguage(lang.code)
                    setLangMenuOpen(false)
                  }}
                >
                  <span className="farmer-lang-native">{lang.nativeName}</span>
                  <span className="farmer-lang-eng">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="farmer-notif-btn"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          title="View Notifications"
        >
          <Bell size={16} />
          <span className="farmer-notif-dot" />
        </button>

        {/* Farmer Avatar Pill */}
        <div
          className="farmer-avatar-pill"
          onClick={() => navigate('/profile')}
          role="button"
          tabIndex={0}
          title="Open Farmer Profile"
        >
          <div className="farmer-avatar-circle">
            {farmer.profilePhoto ? (
              <img
                src={farmer.profilePhoto}
                alt={farmer.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'RK'
            )}
          </div>
          <div className="farmer-avatar-info">
            <span className="farmer-avatar-name">{displayName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
