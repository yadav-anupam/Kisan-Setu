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
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import { isFarmerLoggedIn, setRedirectAfterLogin, isFarmerDashboardPath } from './auth'
import { useRouter } from './router'

export default function App() {
  const { path } = useRouter()

  const renderContent = () => {
    // 1. Staff & Operator Portal Routes
    if (path === '/staff/login' || path === '/staff-login' || path === '/operator-login') {
      return <StaffLoginPage />
    }

    if (
      path === '/staff/dashboard' ||
      path === '/staff-dashboard' ||
      path === '/operator-dashboard' ||
      path === '/staff'
    ) {
      return <StaffDashboardPage />
    }

    if (
      path === '/staff/qr-verification' ||
      path === '/staff/scanner' ||
      path === '/staff-verify' ||
      path === '/staff-scanner' ||
      path === '/staff-check-in'
    ) {
      return <StaffQRScannerPage />
    }

    if (path === '/staff/bookings' || path === '/staff-bookings') {
      return <StaffBookingsPage />
    }

    if (path === '/staff/queue' || path === '/staff-queue') {
      return <StaffQueuePage />
    }

    if (path === '/staff/slots' || path === '/staff-slots') {
      return <StaffSlotsPage />
    }

    if (path === '/staff/farmers' || path === '/staff-farmers') {
      return <StaffFarmersPage />
    }

    if (path === '/staff/verification-history' || path === '/staff-history') {
      return <StaffVerificationHistoryPage />
    }

    if (path === '/staff/reports' || path === '/staff-reports') {
      return <StaffReportsPage />
    }

    if (path === '/staff/profile' || path === '/staff-profile') {
      return <StaffProfilePage />
    }

    if (path === '/staff/settings' || path === '/staff-settings') {
      return <StaffSettingsPage />
    }

    // 2. Public Institutional Pages
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

    if (path === '/login' || path === '/farmer-login') {
      return <FarmerLoginPage />
    }

    if (path === '/register' || path === '/farmer-register') {
      return <FarmerRegisterPage />
    }

    // 3. Strict Universal Guard for ALL Farmer Dashboard Routes & Services
    if (isFarmerDashboardPath(path)) {
      if (!isFarmerLoggedIn()) {
        setRedirectAfterLogin(path)
        return <FarmerLoginPage />
      }
    }

    // 4. Authenticated Farmer Routes
    if (path === '/my-appointments' || path === '/farmer-appointments' || path === '/appointments') {
      return <MyAppointmentsPage />
    }

    if (path === '/procurement' || path === '/my-procurement' || path === '/farmer-procurement') {
      return <MyProcurementPage />
    }

    if (path === '/payments' || path === '/dbt-payments' || path === '/farmer-payments') {
      return <DbtPaymentsPage />
    }

    if (path === '/history' || path === '/farmer-history') {
      return <FarmerHistoryPage />
    }

    if (path === '/notifications' || path === '/farmer-notifications') {
      return <FarmerNotificationsPage />
    }

    if (path === '/profile' || path === '/farmer-profile' || path === '/my-profile') {
      return <FarmerProfilePage />
    }

    if (path === '/queue' || path === '/live-queue' || path === '/farmer-queue') {
      return <LiveQueuePage />
    }

    if (
      path === '/farmer-dashboard' ||
      path === '/dashboard' ||
      path === '/book-slot' ||
      path === '/slot-booking' ||
      path === '/farmer-booking'
    ) {
      return <FarmerDashboard />
    }

    // Fallback to Home
    return <HomePage />
  }

  return (
    <>
      {renderContent()}
      <PWAInstallPrompt />
    </>
  )
}
