import { useState } from 'react'
import { CalendarCheck, Check, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, FileText, Globe2, Leaf, Menu, Navigation, PlayCircle, Search, ShieldCheck, Sprout, Ticket, Users, WalletCards, X } from 'lucide-react'
import './HomePage.css'

type Icon = typeof Leaf
type Feature = { title: string; text: string; icon: Icon; tone: string }

const journey = [
  { title: 'Book Slot Online', text: 'Choose centre, date & time', icon: CalendarCheck },
  { title: 'Get Token', text: 'Receive your token instantly', icon: Ticket },
  { title: 'Live Queue Updates', text: 'Track your queue in real-time', icon: Navigation },
  { title: 'Procurement', text: 'Hassle-free & transparent', icon: FileText },
  { title: 'Payment', text: 'Get paid directly to your account', icon: CircleDollarSign },
]
const features: Feature[] = [
  { title: 'Book Your Slot', text: 'Choose your nearest centre, date and time slot easily.', icon: CalendarCheck, tone: 'green' },
  { title: 'Live Queue Tracking', text: 'Track your token and estimated waiting time in real-time.', icon: Users, tone: 'blue' },
  { title: 'Procurement Status', text: 'Know your procurement progress at every step.', icon: FileText, tone: 'violet' },
  { title: 'Secure Payments', text: 'Receive payments directly in your bank account.', icon: WalletCards, tone: 'orange' },
  { title: 'History & Records', text: 'View your past procurements, payments and receipts.', icon: FileText, tone: 'teal' },
]
const benefits = [
  { title: 'Save Time', text: 'Avoid long waiting', icon: Clock3 },
  { title: 'Real-time Updates', text: 'Get live queue status', icon: Navigation },
  { title: 'Transparent', text: 'Track process clearly', icon: Check },
  { title: 'Timely Payments', text: 'Receive securely', icon: WalletCards },
]
const impact = [
  { value: '48,562+', label: 'Registered Farmers', icon: Users }, { value: '125+', label: 'Procurement Centres', icon: Navigation },
  { value: '1,256+', label: 'Appointments Today', icon: CalendarCheck }, { value: '3,245+', label: 'Quintal Procured Today', icon: Sprout }, { value: '₹ 1.85 Cr+', label: 'Payments Completed', icon: CircleDollarSign },
]
const trustPoints = [
  { title: 'Reduce Waiting Time', text: 'Smart queue management saves your time.', icon: Clock3 }, { title: 'Better Planning', text: 'Book in advance and plan your visit better.', icon: Search },
  { title: 'Complete Transparency', text: 'All information and updates at your fingertips.', icon: Search }, { title: 'Secure & Reliable', text: 'Your data and payments are always safe.', icon: ShieldCheck },
]
const publicNav = [
  { label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }, { label: 'How It Works', path: '/how-it-works' },
  { label: 'For Farmers', path: '/for-farmers' }, { label: 'For Centres', path: '/for-centres' }, { label: 'Features', path: '/features' }, { label: 'Contact Us', path: '/contact' },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  return <div className="home-page">
    <header className="home-header"><a className="home-brand" href="/"><Leaf size={29} fill="currentColor" /><span><strong>Kisan Setu</strong><small>Procurement Platform</small></span></a><nav className={menuOpen ? 'mobile-open' : ''}>{publicNav.map((item, index) => <a className={index === 0 ? 'active' : ''} key={item.label} href={item.path}>{item.label}</a>)}<button className="mobile-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button></nav><div className="header-actions"><button className="language-button"><Globe2 size={14} /> English <ChevronRight size={13} /></button><a className="login-button" href="/login"><Users size={16} /> Login / Sign In</a><button className="home-menu" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={21} /></button></div></header>
    <main>
      <section className="hero-section"><div className="hero-image" /><div className="hero-overlay" /><div className="hero-content"><div className="hero-copy"><span className="hero-kicker">Smart Procurement. Happy Farmers.</span><h1>Digital Procurement,<br /><em>Better Farming</em></h1><p>A smart platform for farmers to book slots, avoid long queues, track procurement status and get timely payments - all in one place.</p><div className="hero-buttons"><a className="hero-primary" href="/farmer/dashboard"><CalendarCheck size={17} /> Book Your Slot</a><a className="hero-secondary" href="/how-it-works"><PlayCircle size={17} /> How It Works</a></div><div className="mini-benefits">{benefits.map(({ title, text, icon: BenefitIcon }) => <div key={title}><BenefitIcon size={17} /><strong>{title}</strong><small>{text}</small></div>)}</div></div><JourneyCard /></div></section>
      <section className="impact-bar">{impact.map(({ value, label, icon: ImpactIcon }) => <div key={label}><ImpactIcon size={23} /><strong>{value}</strong><small>{label}</small></div>)}</section>
      <section className="capabilities" id="features"><h2>What You Can Do</h2><div className="feature-row"><button className="carousel-arrow" aria-label="Previous"><ChevronLeft size={18} /></button>{features.map(({ title, text, icon: FeatureIcon, tone }) => <article className="feature-card" key={title}><span className={`feature-icon ${tone}`}><FeatureIcon size={21} /></span><h3>{title}</h3><p>{text}</p></article>)}<button className="carousel-arrow" aria-label="Next"><ChevronRight size={18} /></button></div></section>
      <section className="trust-section"><h2>Why Choose Kisan Setu?</h2><div className="trust-grid">{trustPoints.map(({ title, text, icon: TrustIcon }, index) => <div key={title}><span className={`trust-icon trust-${index}`}><TrustIcon size={18} /></span><div><strong>{title}</strong><p>{text}</p></div></div>)}</div></section>
    </main><Footer />
  </div>
}

function JourneyCard() { return <aside className="journey-card"><h2>Your Journey, Simplified</h2><div className="journey-items">{journey.map(({ title, text, icon: JourneyIcon }) => <div key={title}><span><JourneyIcon size={14} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div></aside> }
function Footer() { return <footer className="home-footer"><div className="footer-brand"><div className="home-brand"><Leaf size={29} fill="currentColor" /><span><strong>Kisan Setu</strong><small>Procurement Platform</small></span></div><p>A Government of India initiative to empower farmers with a transparent, efficient and technology-driven procurement system.</p><div className="socials"><span>f</span><span>●</span><span>▶</span><span>◎</span></div></div><div><h3>Quick Links</h3><a>Home</a><a>About Us</a><a>How It Works</a><a>For Farmers</a><a>For Centres</a><a>Features</a></div><div><h3>Important Links</h3><a>FAQs</a><a>Help & Support</a><a>Privacy Policy</a><a>Terms & Conditions</a><a>Disclaimer</a></div><div><h3>Contact Us</h3><a>☎ &nbsp;1800-123-4567</a><a>✉ &nbsp;support@kisansetu.gov.in</a><a>⌖ &nbsp;Krishi Bhawan, New Delhi - 110001</a></div><div className="copyright">© 2024 Kisan Setu. All rights reserved.</div></footer> }
