/**
 * Register Service Worker for Kisan Setu PWA
 */

export function registerPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Immediately update
          reg.update().catch(() => {})

          // Check for worker updates
          reg.onupdatefound = () => {
            const installingWorker = reg.installing
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[Kisan Setu PWA] New content is available.')
                  } else {
                    console.log('[Kisan Setu PWA] Content is cached for offline use.')
                  }
                }
              }
            }
          }
        })
        .catch((err) => {
          console.warn('[Kisan Setu PWA] Service worker registration failed:', err)
        })

      // Reload on controllerchange
      let refreshing = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true
          window.location.reload()
        }
      })
    })
  }
}
