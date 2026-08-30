import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import logoImg from '../../assets/logo.png'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function PWAInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(checkIsStandalone)

  useEffect(() => {
    if (isInstalled) {
      return
    }

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('ks_pwa_prompt_dismissed')
    if (dismissed === 'true') {
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPromptEvent(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Also listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsVisible(false)
      setIsInstalled(true)
      console.log('[Kisan Setu PWA] Successfully installed on user device!')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [isInstalled])

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      // Fallback instructions for iOS or unsupported desktop
      alert(
        'To install Kisan Setu:\n\n• On iPhone/iPad: Tap the Share icon (⬆️) and select "Add to Home Screen".\n• On Chrome/Android: Tap browser menu (⋮) and select "Install app".'
      )
      return
    }

    installPromptEvent.prompt()
    const choice = await installPromptEvent.userChoice
    if (choice.outcome === 'accepted') {
      setIsVisible(false)
    }
    setInstallPromptEvent(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('ks_pwa_prompt_dismissed', 'true')
  }

  if (isInstalled || !isVisible) {
    return null
  }

  return (
    <aside
      className="pwa-install-banner"
      aria-label="Install Kisan Setu Application"
      style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        left: '16px',
        maxWidth: '440px',
        margin: '0 auto',
        background: '#0d631b',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '14px 16px',
        boxShadow: '0 12px 36px rgba(13, 99, 27, 0.35)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        animation: 'slideUpBanner 0.4s ease-out',
        border: '1px solid #15803d',
      }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pwa-btn-install:hover {
          background: #dcfce7 !important;
          color: #0d631b !important;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <img
          src={logoImg}
          alt="Kisan Setu Logo"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '4px',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <strong style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.2px' }}>
              Install Kisan Setu App
            </strong>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                background: '#22c55e',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              PWA FAST
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#dcfce7', margin: '2px 0 0', lineHeight: 1.25 }}>
            किसान सेतु ऐप इंस्टॉल करें • Offline Access &amp; Gate Passes
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          type="button"
          className="pwa-btn-install"
          onClick={handleInstallClick}
          style={{
            background: '#ffffff',
            color: '#0d631b',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s ease',
          }}
        >
          <Download size={14} /> Install
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          aria-label="Dismiss installation"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  )
}
