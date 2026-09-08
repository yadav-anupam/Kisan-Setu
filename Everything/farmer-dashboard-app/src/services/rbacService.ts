// =============================================================================
// Kisan Setu — Centralized Role-Based Access Control (RBAC) & Scope Guard
// =============================================================================

export type UserRole = 'FARMER' | 'STAFF' | 'CENTRE_ADMIN' | 'ADMIN'

export type AppPermission =
  // Farmer Specific
  | 'VIEW_OWN_PROFILE'
  | 'EDIT_OWN_PROFILE'
  | 'BOOK_SLOT'
  | 'VIEW_OWN_BOOKINGS'
  | 'CANCEL_OWN_BOOKING'
  | 'VIEW_OWN_PROCUREMENT'
  | 'VIEW_OWN_PAYMENTS'
  | 'VIEW_LIVE_QUEUE'
  | 'SUBMIT_GRIEVANCE'

  // Staff Specific (Field Operations)
  | 'SCAN_GATE_PASS'
  | 'VIEW_CENTRE_BOOKINGS'
  | 'VIEW_YARD_QUEUE'
  | 'CALL_NEXT_TOKEN'
  | 'UPDATE_YARD_QUEUE'
  | 'RECORD_WEIGHMENT'
  | 'RECORD_QUALITY_CHECK'
  | 'VIEW_CENTRE_FARMERS'
  | 'VIEW_CENTRE_SLOTS'
  | 'BROADCAST_ANNOUNCEMENT'

  // Centre Admin Specific (Single-Centre Governance)
  | 'MANAGE_CENTRE_TOKENS'
  | 'APPROVE_DBT_PAYMENTS'
  | 'MANAGE_CENTRE_STAFF'
  | 'MANAGE_CENTRE_PRICES'
  | 'VIEW_CENTRE_REPORTS'
  | 'VIEW_CENTRE_AUDIT_LOGS'
  | 'MANAGE_CENTRE_SETTINGS'

  // Administrative Admin Specific (State / District Governance)
  | 'MANAGE_ALL_CENTRES'
  | 'PROVISION_CENTRE'
  | 'VERIFY_CENTRES'
  | 'MANAGE_ALL_USERS'
  | 'MANAGE_USER_ROLES'
  | 'MANAGE_DEPARTMENTS'
  | 'MANAGE_GLOBAL_SETTINGS'
  | 'VIEW_GLOBAL_ANALYTICS'
  | 'VIEW_ALL_AUDIT_LOGS'

export interface AuthIdentity {
  id: string
  role: UserRole
  centre_id?: string
  centre_name?: string
  name: string
  mobile?: string
}

// -----------------------------------------------------------------------------
// Role Hierarchy & Permissions Matrix
// -----------------------------------------------------------------------------
const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  FARMER: [
    'VIEW_OWN_PROFILE',
    'EDIT_OWN_PROFILE',
    'BOOK_SLOT',
    'VIEW_OWN_BOOKINGS',
    'CANCEL_OWN_BOOKING',
    'VIEW_OWN_PROCUREMENT',
    'VIEW_OWN_PAYMENTS',
    'VIEW_LIVE_QUEUE',
    'SUBMIT_GRIEVANCE',
  ],

  STAFF: [
    'VIEW_LIVE_QUEUE',
    'SUBMIT_GRIEVANCE',
    'SCAN_GATE_PASS',
    'VIEW_CENTRE_BOOKINGS',
    'VIEW_YARD_QUEUE',
    'CALL_NEXT_TOKEN',
    'UPDATE_YARD_QUEUE',
    'VIEW_CENTRE_FARMERS',
    'VIEW_CENTRE_SLOTS',
    'BROADCAST_ANNOUNCEMENT',
    'VIEW_OWN_PROFILE',
  ],

  CENTRE_ADMIN: [
    // Inherits Staff capabilities
    'VIEW_LIVE_QUEUE',
    'SUBMIT_GRIEVANCE',
    'SCAN_GATE_PASS',
    'VIEW_CENTRE_BOOKINGS',
    'VIEW_YARD_QUEUE',
    'CALL_NEXT_TOKEN',
    'UPDATE_YARD_QUEUE',
    'RECORD_WEIGHMENT',
    'RECORD_QUALITY_CHECK',
    'VIEW_CENTRE_FARMERS',
    'VIEW_CENTRE_SLOTS',
    'BROADCAST_ANNOUNCEMENT',
    // Centre Admin Authority
    'MANAGE_CENTRE_TOKENS',
    'APPROVE_DBT_PAYMENTS',
    'MANAGE_CENTRE_STAFF',
    'MANAGE_CENTRE_PRICES',
    'VIEW_CENTRE_REPORTS',
    'VIEW_CENTRE_AUDIT_LOGS',
    'MANAGE_CENTRE_SETTINGS',
  ],

  ADMIN: [
    // Inherits all staff & centre admin capabilities
    'VIEW_LIVE_QUEUE',
    'SUBMIT_GRIEVANCE',
    'SCAN_GATE_PASS',
    'VIEW_CENTRE_BOOKINGS',
    'VIEW_YARD_QUEUE',
    'CALL_NEXT_TOKEN',
    'UPDATE_YARD_QUEUE',
    'RECORD_WEIGHMENT',
    'RECORD_QUALITY_CHECK',
    'VIEW_CENTRE_FARMERS',
    'VIEW_CENTRE_SLOTS',
    'BROADCAST_ANNOUNCEMENT',
    'MANAGE_CENTRE_TOKENS',
    'APPROVE_DBT_PAYMENTS',
    'MANAGE_CENTRE_STAFF',
    'MANAGE_CENTRE_PRICES',
    'VIEW_CENTRE_REPORTS',
    'VIEW_CENTRE_AUDIT_LOGS',
    'MANAGE_CENTRE_SETTINGS',
    // Macro Administrative Authority
    'MANAGE_ALL_CENTRES',
    'PROVISION_CENTRE',
    'VERIFY_CENTRES',
    'MANAGE_ALL_USERS',
    'MANAGE_USER_ROLES',
    'MANAGE_DEPARTMENTS',
    'MANAGE_GLOBAL_SETTINGS',
    'VIEW_GLOBAL_ANALYTICS',
    'VIEW_ALL_AUDIT_LOGS',
  ],
}

/**
 * Evaluates whether a role possesses a specific capability permission.
 */
export function hasPermission(role: UserRole | string | undefined, permission: AppPermission): boolean {
  if (!role) return false
  const normalizedRole = normalizeRole(role)
  const permissions = ROLE_PERMISSIONS[normalizedRole] || []
  return permissions.includes(permission)
}

/**
 * Normalizes legacy role strings into strictly typed UserRole.
 */
export function normalizeRole(roleStr: string): UserRole {
  const upper = (roleStr || '').toUpperCase().trim()
  if (upper === 'ADMIN' || upper === 'DISTRICT_ADMIN' || upper === 'STATE_ADMIN') {
    return 'ADMIN'
  }
  if (upper === 'CENTRE_ADMIN' || upper === 'MANDI_ADMIN') {
    return 'CENTRE_ADMIN'
  }
  if (upper === 'STAFF' || upper === 'CENTRE_OPERATOR' || upper === 'OPERATOR') {
    return 'STAFF'
  }
  return 'FARMER'
}

/**
 * Enforces centre-level scoping and multi-tenant isolation.
 * ADMIN can access all centres. CENTRE_ADMIN and STAFF can only access their assigned centre.
 */
export function canAccessCentre(user: AuthIdentity | null | undefined, targetCentreIdOrName: string): boolean {
  if (!user) return false
  if (user.role === 'ADMIN') return true
  if (!targetCentreIdOrName) return true

  const userCentre = (user.centre_id || user.centre_name || '').toLowerCase()
  const target = targetCentreIdOrName.toLowerCase()

  return userCentre.includes(target) || target.includes(userCentre)
}

/**
 * Enforces ownership access on farmer-scoped resources (IDOR / BOLA Prevention).
 * Farmers can only access resources matching their own farmerId. Staff/Admin can access within centre scope.
 */
export function canAccessFarmerResource(
  user: AuthIdentity | null | undefined,
  resourceFarmerId: string,
  resourceCentreIdOrName?: string
): boolean {
  if (!user) return false
  if (user.role === 'ADMIN') return true

  if (user.role === 'FARMER') {
    return user.id === resourceFarmerId
  }

  // Staff and Centre Admin check centre scope
  if (resourceCentreIdOrName) {
    return canAccessCentre(user, resourceCentreIdOrName)
  }

  return true
}
