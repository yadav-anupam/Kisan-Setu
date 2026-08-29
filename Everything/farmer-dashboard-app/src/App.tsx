import HomePage from './HomePage'
import AboutPage from './components/public/AboutPage'
import HowItWorksPage from './components/public/HowItWorksPage'
import ForFarmersPage from './components/public/ForFarmersPage'
import ForCentresPage from './components/public/ForCentresPage'
import FeaturesPage from './components/public/FeaturesPage'
import ContactPage from './components/public/ContactPage'
import FarmerLoginPage from './components/auth/FarmerLoginPage'
import FarmerRegisterPage from './components/auth/FarmerRegisterPage'
import { useRouter } from './router'

export default function App() {
  const { path } = useRouter()

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

  return <HomePage />
}
