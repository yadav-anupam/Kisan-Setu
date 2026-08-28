import { useState } from 'react'
import { Activity, ArrowDown, ArrowRight, Bell, CalendarDays, CircleHelp, Download, History, Home, Landmark, Languages, Leaf, LogOut, MapPin, Menu, PackageCheck, PlusCircle, Scale, Timer, UserRound, WalletCards, X } from 'lucide-react'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import PublicPage from './PublicPage'
import './App.css'

type Icon = typeof Home
type NavItem = { label: string; icon: Icon }

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home }, { label: 'My Appointments', icon: CalendarDays },
  { label: 'Book New Slot', icon: PlusCircle }, { label: 'Live Queue', icon: Activity },
  { label: 'My Procurement', icon: Leaf }, { label: 'Payments', icon: WalletCards },
  { label: 'History', icon: History }, { label: 'Notifications', icon: Bell },
  { label: 'Profile', icon: UserRound }, { label: 'Help & Support', icon: CircleHelp },
]
const stats = [
  { label: 'Total Procurements', value: '8', icon: PackageCheck },
  { label: 'Total Quantity', value: '247.50', unit: 'Qtl', icon: Scale },
  { label: 'Total Earnings', value: '₹ 1,45,680', icon: WalletCards },
  { label: 'Avg Waiting Time', value: '24', unit: 'min', icon: Timer },
  { label: 'Successful Payments', value: '8', icon: Landmark, positive: true },
]
const quickActions = [
  { label: 'Book New Slot', icon: PlusCircle }, { label: 'Find Centre', icon: MapPin },
  { label: 'My Procurement', icon: Leaf }, { label: 'Payments', icon: WalletCards },
]

function FarmerDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <main className="app-shell">
    <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button>
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <div className="content-area">
      <header className="topbar"><div><h1>Namaste, Ramesh Kumar</h1><p>Welcome back to your Kisan Setu dashboard.</p></div><div className="topbar-actions"><button className="icon-button" aria-label="Change language"><Languages size={19} /></button><button className="icon-button notification-button" aria-label="View notifications"><Bell size={19} /><span className="notification-dot" /></button><div className="avatar" aria-label="Ramesh Kumar">RK</div></div></header>
      <section className="top-cards"><NextAppointment /><QueueCard /><QuickActions /></section>
      <section className="stats-grid" aria-label="Procurement statistics">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
      <section className="lower-grid"><div className="panel journey-panel"><div className="panel-heading"><div><p className="eyebrow">Your current journey</p><h2>Procurement progress</h2></div><span className="status-pill success">On track</span></div><div className="journey-list">{['Appointment booked', 'Checked in at centre', 'Waiting in queue', 'Weighment', 'Payment'].map((step, index) => <div className={`journey-step ${index < 2 ? 'complete' : index === 2 ? 'active' : ''}`} key={step}><span className="step-marker">{index < 2 ? '✓' : index + 1}</span><div><strong>{step}</strong><small>{index < 2 ? 'Completed' : index === 2 ? 'In progress' : 'Pending'}</small></div></div>)}</div></div><div className="panel notice-panel"><div className="notice-icon"><Bell size={20} /></div><div><p className="eyebrow">Centre update</p><h2>Bring your documents</h2><p className="notice-copy">Please keep your Aadhaar card and bank details ready for your appointment.</p></div><button className="text-button">View details <ArrowRight size={16} /></button></div></section>
    </div>
  </main>
}
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) { return <>{open && <button className="scrim" aria-label="Close navigation" onClick={onClose} />}<aside className={`sidebar ${open ? 'open' : ''}`}><div className="brand-block"><Leaf size={30} /><div><strong>Kisan Setu</strong><span>Agri-Trust Platform</span></div><button className="close-menu" aria-label="Close navigation" onClick={onClose}><X size={20} /></button></div><nav>{navItems.map(({ label, icon: NavIcon }, index) => <div key={label} className={index === 7 ? 'nav-break' : ''}><button className={`nav-item ${index === 0 ? 'selected' : ''}`}><NavIcon size={19} /><span>{label}</span>{label === 'Notifications' && <b>3</b>}</button></div>)}<a className="nav-item logout-item" href="/"><LogOut size={19} /><span>Logout</span></a></nav><div className="sidebar-note"><strong>Smart Procurement</strong><p>Better farming for a better tomorrow.</p><button>Learn more <ArrowRight size={14} /></button></div></aside></> }
function NextAppointment() { return <div className="panel appointment-card"><div className="panel-heading"><h2>Next Appointment</h2><span className="status-pill">Upcoming</span></div><div className="appointment-detail"><div className="round-icon"><CalendarDays size={22} /></div><div><strong>Aug 28, 2026</strong><p>XYZ Procurement Centre</p></div></div><div className="detail-pairs"><div><small>Crop</small><strong>Wheat</strong></div><div><small>Quantity</small><strong>48 Quintal</strong></div></div><button className="secondary-button">View Live Queue <ArrowRight size={17} /></button></div> }
function QueueCard() { return <div className="panel queue-card"><div className="panel-heading"><h2>Live Queue Status</h2><span className="live-indicator" /></div><div className="token-row"><div><small>Current token</small><strong className="current-token">A-35</strong></div><div className="your-token"><small>Your token</small><strong>A-48</strong></div></div><div className="progress-meta"><span>Farmers ahead: <b>12</b></span><span>Est. wait: <b>32 min</b></span></div><div className="progress-track"><span /></div><div className="queue-tip"><Activity size={18} /><span>Queue is moving at normal pace. Please be ready with your documents.</span></div></div> }
function QuickActions() { return <div className="panel quick-card"><h2>Quick Actions</h2><div className="quick-grid">{quickActions.map(({ label, icon: ActionIcon }) => <button key={label} className="quick-action"><span><ActionIcon size={19} /></span><strong>{label}</strong></button>)}</div><button className="primary-button"><Download size={17} /> Download Receipt</button></div> }
function StatCard({ label, value, unit, icon: StatIcon, positive }: { label: string; value: string; unit?: string; icon: Icon; positive?: boolean }) { return <div className="stat-card"><div className="stat-label"><StatIcon size={17} /><span>{label}</span></div><strong className={positive ? 'positive' : ''}>{value}{unit && <small>{unit}</small>}</strong>{positive && <span className="stat-change"><ArrowDown size={13} /> on time</span>}</div> }
export default function App() {
  const path = window.location.pathname
  if (path.startsWith('/farmer/dashboard')) return <FarmerDashboard />
  if (path === '/login') return <LoginPage />
  if (path !== '/') return <PublicPage path={path} />
  return <HomePage />
}
