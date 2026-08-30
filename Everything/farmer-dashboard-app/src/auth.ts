// Kisan Setu Authentication & Session Manager

export interface FarmerProfile {
  name: string
  mobile: string
  email?: string
  dob?: string
  gender?: string
  maritalStatus?: string
  farmerId: string
  state: string
  district: string
  village: string
  postOffice?: string
  tehsil?: string
  pincode?: string
  preferredMandi: string
  primaryProduce?: string
  landHolding?: string
  khasraNo?: string
  experience?: string
  farmerType?: string
  bankAccount: string
  bankName: string
  ifscCode?: string
  vehicleNumber?: string
  profilePhoto?: string
}

const DEFAULT_FARMER: FarmerProfile = {
  name: 'Ramesh Kumar Singh',
  mobile: '9214334494',
  email: 'rameshkumar@email.com',
  dob: '15 March 1988',
  gender: 'Male',
  maritalStatus: 'Married',
  farmerId: 'KS-FARM-2026-8942',
  state: 'Uttar Pradesh',
  district: 'Varanasi',
  village: 'Village Chiraigaon',
  postOffice: 'Chiraigaon Post',
  tehsil: 'Chiraigaon',
  pincode: '221112',
  preferredMandi: 'Chiraigaon 1st at Gaurakala (FCS)',
  primaryProduce: 'Wheat (गेहूं) & Mustard (सरसों)',
  landHolding: '3.5 Acre',
  khasraNo: '142/3 & 143/1',
  experience: '12 Years',
  farmerType: 'Small Farmer (Marginal)',
  bankAccount: 'XXXX-XXXX-4321',
  bankName: 'State Bank of India',
  ifscCode: 'SBIN0001234',
  vehicleNumber: 'UP-65-TC-8942',
}

const AUTH_STORAGE_KEY = 'kisan_setu_farmer_auth'
const PROFILE_STORAGE_KEY = 'kisan_setu_farmer_profile'
const REDIRECT_STORAGE_KEY = 'kisan_setu_redirect_after_login'

export function isFarmerLoggedIn(): boolean {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
}

export function loginFarmer(profile?: Partial<FarmerProfile>): void {
  localStorage.setItem(AUTH_STORAGE_KEY, 'true')
  const mergedProfile = { ...DEFAULT_FARMER, ...(profile || {}) }
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(mergedProfile))
  window.dispatchEvent(new CustomEvent('kisan_setu_profile_updated', { detail: mergedProfile }))
}

export function updateFarmerProfile(updates: Partial<FarmerProfile>): FarmerProfile {
  const current = getFarmerProfile()
  const merged = { ...current, ...updates }
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new CustomEvent('kisan_setu_profile_updated', { detail: merged }))
  return merged
}

export function logoutFarmer(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  localStorage.removeItem(PROFILE_STORAGE_KEY)
  sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
}

export function getFarmerProfile(): FarmerProfile {
  const saved = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (parsed.district === 'Alwar' || parsed.state === 'Rajasthan' || !parsed.preferredMandi || parsed.preferredMandi.includes('Alwar')) {
        parsed.state = 'Uttar Pradesh'
        parsed.district = 'Varanasi'
        parsed.village = 'Chiraigaon Tehsil'
        parsed.preferredMandi = 'Chiraigaon 1st at Gaurakala (FCS)'
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed))
      }
      return parsed
    } catch {
      return DEFAULT_FARMER
    }
  }
  return DEFAULT_FARMER
}

export function setRedirectAfterLogin(path: string): void {
  if (path && path !== '/login' && path !== '/register' && path !== '/') {
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, path)
  }
}

export function getAndClearRedirectAfterLogin(): string {
  const target = sessionStorage.getItem(REDIRECT_STORAGE_KEY) || '/farmer-dashboard'
  sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
  return target
}

export function hasPendingRedirect(): boolean {
  return !!sessionStorage.getItem(REDIRECT_STORAGE_KEY)
}

export function isFarmerDashboardPath(path: string): boolean {
  if (!path || path === '/' || path === '/about' || path === '/how-it-works' || path === '/for-farmers' || path === '/for-centres' || path === '/features' || path === '/contact' || path === '/login' || path === '/register' || path === '/farmer-login' || path === '/farmer-register') {
    return false
  }

  const farmerRoutes = [
    '/farmer-dashboard',
    '/dashboard',
    '/my-appointments',
    '/appointments',
    '/farmer-appointments',
    '/my-procurement',
    '/procurement',
    '/farmer-procurement',
    '/payments',
    '/dbt-payments',
    '/farmer-payments',
    '/history',
    '/farmer-history',
    '/notifications',
    '/farmer-notifications',
    '/profile',
    '/my-profile',
    '/farmer-profile',
    '/book-slot',
    '/slot-booking',
    '/farmer-booking',
    '/queue',
    '/live-queue',
    '/farmer-queue',
  ]

  return (
    farmerRoutes.includes(path) ||
    path.startsWith('/farmer') ||
    path.startsWith('/my-') ||
    path.startsWith('/queue') ||
    path.startsWith('/book') ||
    path.startsWith('/slot') ||
    path.startsWith('/procure') ||
    path.startsWith('/payment') ||
    path.startsWith('/dbt') ||
    path.startsWith('/profile') ||
    path.startsWith('/notif') ||
    path.startsWith('/history') ||
    path.startsWith('/dashboard')
  )
}
