import React, { useEffect, useState } from 'react'
import { useRouter, navigate } from '../../router'
import { isFarmerLoggedIn, getFarmerAuthIdentity, setRedirectAfterLogin } from '../../auth'
import { isStaffAuthenticated, getStaffAuthIdentity, getStaffAuthSession } from '../../services/staffDataService'
import { hasPermission, getRoleHomeRoute } from '../../services/rbacService'
import type { UserRole, AppPermission, AuthIdentity } from '../../services/rbacService'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  portal: 'FARMER' | 'STAFF' | 'CENTRE_ADMIN' | 'ADMIN'
  allowedRoles?: UserRole[]
  requiredPermission?: AppPermission
}

/**
 * RouteGuard Component
 * Enforces client-side authentication and role-based access control (RBAC).
 * Handles unauthenticated redirection with return URLs and 403 Forbidden screens.
 */
export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  portal,
  allowedRoles,
  requiredPermission,
}) => {
  const { path } = useRouter()
  const [isEvaluating, setIsEvaluating] = useState(true)

  // 1. Evaluate Authentication & Extract Identity
  let user: AuthIdentity | null = null
  let isAuthenticated = false

  if (portal === 'FARMER') {
    isAuthenticated = isFarmerLoggedIn()
    if (isAuthenticated) {
      user = getFarmerAuthIdentity()
    }
  } else {
    // Staff, Centre Admin, or Admin portals
    isAuthenticated = isStaffAuthenticated()
    if (isAuthenticated) {
      const session = getStaffAuthSession()
      if (session.status && ['INACTIVE', 'SUSPENDED', 'PENDING'].includes(session.status)) {
        isAuthenticated = false
        user = null
      } else {
        user = getStaffAuthIdentity()
      }
    }
  }

  useEffect(() => {
    setIsEvaluating(false)
    if (!isAuthenticated || !user) {
      // Save target path for post-login return
      if (portal === 'FARMER') {
        setRedirectAfterLogin(path)
        navigate('/login')
      } else if (portal === 'CENTRE_ADMIN') {
        sessionStorage.setItem('kisan_setu_staff_redirect', path)
        navigate('/centre-admin/login')
      } else if (portal === 'ADMIN') {
        sessionStorage.setItem('kisan_setu_staff_redirect', path)
        navigate('/admin/login')
      } else {
        sessionStorage.setItem('kisan_setu_staff_redirect', path)
        navigate('/staff/login')
      }
    }
  }, [isAuthenticated, user, portal, path])

  // 2. While evaluating or redirecting unauthenticated user, render loading indicator
  if (isEvaluating || !isAuthenticated || !user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  // 3. Evaluate Role-Based Authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const isRoleAllowed = allowedRoles.includes(user.role)
    if (!isRoleAllowed) {
      return (
        <UnauthorizedView
          user={user}
          reason={`Your account role (${user.role}) does not have clearance for this administrative portal.`}
        />
      )
    }
  }

  // 4. Evaluate Specific Permission Requirement (if supplied)
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return (
      <UnauthorizedView
        user={user}
        reason={`Required permission (${requiredPermission}) is missing from your active role profile.`}
      />
    )
  }

  // 5. Authorized - Render children
  return <>{children}</>
}

interface UnauthorizedViewProps {
  user: AuthIdentity
  reason: string
}

const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({ user, reason }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-red-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 mb-3">
          403 Access Forbidden
        </span>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h2>
        <p className="text-sm text-slate-600 mb-6">{reason}</p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-left mb-6 text-xs text-slate-600 space-y-1">
          <div><span className="font-semibold text-slate-700">Identified User:</span> {user.name} ({user.id})</div>
          <div><span className="font-semibold text-slate-700">Assigned Role:</span> <span className="font-mono text-emerald-700 font-semibold">{user.role}</span></div>
          {user.centre_name && (
            <div><span className="font-semibold text-slate-700">Assigned Centre:</span> {user.centre_name}</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(getRoleHomeRoute(user.role))}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to My Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
          >
            Public Portal
          </button>
        </div>
      </div>
    </div>
  )
}

export default RouteGuard

