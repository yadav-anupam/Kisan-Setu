import { useEffect, useState } from 'react'

const getNormalizedPath = () => {
  // 1. Check if an SPA redirect parameter is present in search (e.g. ?/staff/dashboard)
  if (typeof window !== 'undefined' && window.location.search && window.location.search.startsWith('?/')) {
    const raw = window.location.search.slice(2).split('&')[0]
    let path = '/' + raw.replace(/^\/+/, '')
    if (path.startsWith('/Kisan-Setu')) {
      path = path.replace(/^\/Kisan-Setu/, '') || '/'
    }
    return path
  }

  // 2. Check if a hash fragment is used (e.g. #/staff/dashboard)
  if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
    let hashPath = window.location.hash.slice(1)
    if (hashPath.startsWith('/Kisan-Setu')) {
      hashPath = hashPath.replace(/^\/Kisan-Setu/, '') || '/'
    }
    return hashPath || '/'
  }

  let p = typeof window !== 'undefined' ? window.location.pathname : '/'
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
  const isGhPages = typeof window !== 'undefined' && window.location.pathname.startsWith('/Kisan-Setu')
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
