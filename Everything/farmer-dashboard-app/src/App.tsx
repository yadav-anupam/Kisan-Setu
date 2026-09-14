import HomePage from './HomePage'
import AboutPage from './components/public/AboutPage'
import HowItWorksPage from './components/public/HowItWorksPage'
import ForFarmersPage from './components/public/ForFarmersPage'
import ForCentresPage from './components/public/ForCentresPage'
import FeaturesPage from './components/public/FeaturesPage'
import ContactPage from './components/public/ContactPage'
import FarmerLoginPage from './components/auth/FarmerLoginPage'
import FarmerRegisterPage from './components/auth/FarmerRegisterPage'
import FarmerDashboard from './components/farmer/FarmerDashboard'
import MyAppointmentsPage from './components/farmer/MyAppointmentsPage'
import MyProcurementPage from './components/farmer/MyProcurementPage'
import DbtPaymentsPage from './components/farmer/DbtPaymentsPage'
import FarmerHistoryPage from './components/farmer/FarmerHistoryPage'
import FarmerNotificationsPage from './components/farmer/FarmerNotificationsPage'
import FarmerProfilePage from './components/farmer/FarmerProfilePage'
import LiveQueuePage from './components/farmer/LiveQueuePage'
import StaffLoginPage from './components/staff/StaffLoginPage'
import StaffDashboardPage from './components/staff/StaffDashboardPage'
import StaffQRScannerPage from './components/staff/StaffQRScannerPage'
import StaffBookingsPage from './components/staff/StaffBookingsPage'
import StaffQueuePage from './components/staff/StaffQueuePage'
import StaffSlotsPage from './components/staff/StaffSlotsPage'
import StaffFarmersPage from './components/staff/StaffFarmersPage'
import StaffVerificationHistoryPage from './components/staff/StaffVerificationHistoryPage'
import StaffReportsPage from './components/staff/StaffReportsPage'
import StaffProfilePage from './components/staff/StaffProfilePage'
import StaffSettingsPage from './components/staff/StaffSettingsPage'
import StaffManagementPage from './components/staff/StaffManagementPage'
import StaffWeighmentPage from './components/staff/StaffWeighmentPage'
import StaffQualityCheckPage from './components/staff/StaffQualityCheckPage'
import AdminPriceManagementPage from './components/staff/AdminPriceManagementPage'
import AdminCentresPage from './components/staff/AdminCentresPage'
import AdminAddCentrePage from './components/staff/AdminAddCentrePage'
import AdminCentreVerificationPage from './components/staff/AdminCentreVerificationPage'
import AdminCentreCategoriesPage from './components/staff/AdminCentreCategoriesPage'
import AdminUserRolesPage from './components/staff/AdminUserRolesPage'
import AdminDepartmentsPage from './components/staff/AdminDepartmentsPage'
import AdminSystemSettingsPage from './components/staff/AdminSystemSettingsPage'
import AdminLoginPage from './components/staff/AdminLoginPage'
import CentreAdminLoginPage from './components/staff/CentreAdminLoginPage'
import CentreAdminDashboardPage from './components/staff/CentreAdminDashboardPage'
import CentreAdminTokensPage from './components/staff/CentreAdminTokensPage'
import StaffPaymentsPage from './components/staff/StaffPaymentsPage'
import StaffAnnouncementsPage from './components/staff/StaffAnnouncementsPage'
import AdminDashboardPage from './components/staff/AdminDashboardPage'
import StaffGrievancePage from './components/staff/StaffGrievancePage'
import HelpSupportPage from './components/common/HelpSupportPage'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import RouteGuard from './components/common/RouteGuard'
import { useRouter } from './router'

export default function App() {
  const { path } = useRouter()

  const renderContent = () => {
    // =========================================================================
    // 1. PUBLIC AUTHENTICATION & INSTITUTIONAL PORTAL PAGES (UNPROTECTED)
    // =========================================================================
    if (path === '/admin/login' || path === '/admin-login' || path === '/administration/login') {
      return <AdminLoginPage />
    }

    if (path === '/centre-admin/login' || path === '/centre-admin-login') {
      return <CentreAdminLoginPage />
    }

    if (
      path === '/staff/login' ||
      path === '/staff-login' ||
      path === '/operator-login'
    ) {
      return <StaffLoginPage />
    }

    if (path === '/login' || path === '/farmer-login') {
      return <FarmerLoginPage />
    }

    if (path === '/register' || path === '/farmer-register') {
      return <FarmerRegisterPage />
    }

    if (path === '/about') {
      return <AboutPage />
    }

    if (path === '/how-it-works') {
      return <HowItWorksPage />
    }

    if (path === '/for-farmers') {
      return <ForFarmersPage />
    }

    if (path === '/for-centres') {
      return <ForCentresPage />
    }

    if (path === '/features') {
      return <FeaturesPage />
    }

    if (path === '/contact') {
      return <ContactPage />
    }

    // Help & Support (Dual-Role / Publicly accessible with adaptive features)
    if (path === '/help-support' || path === '/support' || path === '/help' || path === '/farmer-support') {
      return <HelpSupportPage />
    }

    // =========================================================================
    // 2. CENTRE ADMIN PORTAL ROUTES (CENTRE_ADMIN & ADMIN ROLES)
    // =========================================================================
    if (path === '/centre-admin/dashboard' || path === '/centre-admin' || path === '/centre-admin-dashboard') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <CentreAdminDashboardPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/slots' || path === '/centre-admin/slot-management') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN', 'STAFF']}>
          <StaffSlotsPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/token-management' || path === '/centre-admin/tokens') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <CentreAdminTokensPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/appointments' || path === '/centre-admin/bookings') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffBookingsPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/live-queue' || path === '/centre-admin/queue') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffQueuePage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/weighment') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffWeighmentPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/quality-check') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffQualityCheckPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/procurement' || path === '/centre-admin/payments') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffPaymentsPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/price-management' || path === '/centre-admin/prices') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <AdminPriceManagementPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/farmers') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffFarmersPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/staff') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffManagementPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/reports') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffReportsPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/audit-logs') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffVerificationHistoryPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/settings') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffSettingsPage />
        </RouteGuard>
      )
    }

    if (path === '/centre-admin/help-support' || path === '/centre-admin/support') {
      return (
        <RouteGuard portal="CENTRE_ADMIN" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffGrievancePage />
        </RouteGuard>
      )
    }

    // =========================================================================
    // 3. PLATFORM ADMINISTRATIVE GOVERNANCE ROUTES (ADMIN ONLY)
    // =========================================================================
    if (path === '/admin/centres/add' || path === '/admin/add-centre') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminAddCentrePage />
        </RouteGuard>
      )
    }

    if (path === '/admin/centres/verification' || path === '/admin/centre-verification') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminCentreVerificationPage />
        </RouteGuard>
      )
    }

    if (path === '/admin/centres/categories' || path === '/admin/centre-categories') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminCentreCategoriesPage />
        </RouteGuard>
      )
    }

    if (path === '/admin/users-roles' || path === '/admin/permissions') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminUserRolesPage />
        </RouteGuard>
      )
    }

    if (path === '/admin/staff/departments' || path === '/admin/departments') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminDepartmentsPage />
        </RouteGuard>
      )
    }

    if (path === '/admin/system-settings' || path === '/admin/global-settings') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminSystemSettingsPage />
        </RouteGuard>
      )
    }

    if (
      path === '/admin/dashboard' ||
      path === '/admin' ||
      path === '/admin-dashboard' ||
      path === '/staff/admin-dashboard'
    ) {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <AdminDashboardPage />
        </RouteGuard>
      )
    }

    if (path === '/admin/help-support' || path === '/admin/support' || path === '/admin/grievance') {
      return (
        <RouteGuard portal="ADMIN" allowedRoles={['ADMIN']}>
          <StaffGrievancePage />
        </RouteGuard>
      )
    }

    // =========================================================================
    // 4. FIELD STAFF & OPERATIONS ROUTES
    // =========================================================================
    // Gate Pass Operations (Accessible by Gate Staff, Centre Operator & Admin)
    if (
      path === '/staff/dashboard' ||
      path === '/staff-dashboard' ||
      path === '/operator-dashboard' ||
      path === '/staff'
    ) {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffDashboardPage />
        </RouteGuard>
      )
    }

    if (
      path === '/staff/qr-verification' ||
      path === '/staff/scanner' ||
      path === '/staff-verify' ||
      path === '/staff-scanner' ||
      path === '/staff-check-in'
    ) {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffQRScannerPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/bookings' || path === '/staff-bookings') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffBookingsPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/queue' || path === '/staff-queue') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffQueuePage />
        </RouteGuard>
      )
    }

    if (path === '/staff/slots' || path === '/staff-slots') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffSlotsPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/farmers' || path === '/staff-farmers' || path === '/admin/farmers') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffFarmersPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/announcements' || path === '/staff-announcements' || path === '/announcements' || path === '/admin/announcements') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffAnnouncementsPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/profile' || path === '/staff-profile' || path === '/admin/profile') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffProfilePage />
        </RouteGuard>
      )
    }

    if (path === '/staff/help-support' || path === '/staff/support' || path === '/staff/grievance' || path === '/staff/help') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['STAFF', 'CENTRE_ADMIN', 'ADMIN']}>
          <StaffGrievancePage />
        </RouteGuard>
      )
    }

    // Workstation & Operator/Admin-Only Authorized Features (Restricted from Gate Staff)
    if (path === '/staff/weighment' || path === '/staff-weighment' || path === '/weighment') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffWeighmentPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/quality-check' || path === '/staff-quality' || path === '/quality-check') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffQualityCheckPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/payments' || path === '/staff-payments' || path === '/staff/dbt-approvals' || path === '/admin/payments') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffPaymentsPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/prices' || path === '/staff-prices' || path === '/staff/price-management' || path === '/admin/prices') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <AdminPriceManagementPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/centres' || path === '/staff-centres' || path === '/admin/centres') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <AdminCentresPage />
        </RouteGuard>
      )
    }

    if (
      path === '/staff/management' ||
      path === '/staff-management' ||
      path === '/staff/team' ||
      path === '/staff/officers' ||
      path === '/admin/management' ||
      path === '/admin/staff' ||
      path === '/admin/users'
    ) {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffManagementPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/verification-history' || path === '/staff-history' || path === '/admin/verification-history' || path === '/admin/audit-logs') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffVerificationHistoryPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/reports' || path === '/staff-reports' || path === '/admin/reports') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffReportsPage />
        </RouteGuard>
      )
    }

    if (path === '/staff/settings' || path === '/staff-settings' || path === '/admin/settings') {
      return (
        <RouteGuard portal="STAFF" allowedRoles={['CENTRE_ADMIN', 'ADMIN']}>
          <StaffSettingsPage />
        </RouteGuard>
      )
    }

    // =========================================================================
    // 5. AUTHENTICATED FARMER PORTAL ROUTES (FARMER ROLE)
    // =========================================================================
    if (path === '/my-appointments' || path === '/farmer-appointments' || path === '/appointments') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <MyAppointmentsPage />
        </RouteGuard>
      )
    }

    if (path === '/procurement' || path === '/my-procurement' || path === '/farmer-procurement') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <MyProcurementPage />
        </RouteGuard>
      )
    }

    if (path === '/payments' || path === '/dbt-payments' || path === '/farmer-payments') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <DbtPaymentsPage />
        </RouteGuard>
      )
    }

    if (path === '/history' || path === '/farmer-history') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <FarmerHistoryPage />
        </RouteGuard>
      )
    }

    if (path === '/notifications' || path === '/farmer-notifications') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <FarmerNotificationsPage />
        </RouteGuard>
      )
    }

    if (path === '/profile' || path === '/farmer-profile' || path === '/my-profile') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <FarmerProfilePage />
        </RouteGuard>
      )
    }

    if (path === '/queue' || path === '/live-queue' || path === '/farmer-queue') {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <LiveQueuePage />
        </RouteGuard>
      )
    }

    if (
      path === '/farmer-dashboard' ||
      path === '/dashboard' ||
      path === '/book-slot' ||
      path === '/slot-booking' ||
      path === '/farmer-booking' ||
      path === '/farmer/slots' ||
      path === '/farmer/book-slot' ||
      path === '/farmer-slots' ||
      path === '/available-slots'
    ) {
      return (
        <RouteGuard portal="FARMER" allowedRoles={['FARMER']}>
          <FarmerDashboard />
        </RouteGuard>
      )
    }

    // Default Fallback
    return <HomePage />
  }

  return (
    <>
      {renderContent()}
      <PWAInstallPrompt />
    </>
  )
}
