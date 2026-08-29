import { useEffect, useState } from 'react'

const getNormalizedPath = () => {
  let p = window.location.pathname
  // Strip repository basename if hosted on GitHub Pages (e.g. /Kisan-Setu/about -> /about)
  if (p.startsWith('/Kisan-Setu')) {
    p = p.replace(/^\/Kisan-Setu/, '')
  }
  if (!p || p === '') {
    return '/'
  }
  return p
}

export function navigate(path: string) {
  const isGhPages = window.location.pathname.startsWith('/Kisan-Setu')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const targetUrl = isGhPages ? `/Kisan-Setu${cleanPath === '/' ? '/' : cleanPath}` : cleanPath
  window.history.pushState({}, '', targetUrl)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useRouter() {
  const [path, setPath] = useState(getNormalizedPath())

  useEffect(() => {
    const onLocationChange = () => {
      setPath(getNormalizedPath())
    }

    window.addEventListener('popstate', onLocationChange)
    return () => window.removeEventListener('popstate', onLocationChange)
  }, [])

  return { path }
}
