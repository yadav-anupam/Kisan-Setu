import { useState, useEffect } from 'react'
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  Search,
  MessageSquare,
} from 'lucide-react'
import { navigate } from '../../router'
import { getFarmerProfile } from '../../auth'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getGrievanceTickets,
  submitGrievanceTicket,
  type GrievanceTicket,
} from '../../services/staffDataService'
import FarmerSidebar from '../farmer/FarmerSidebar'
import StaffSidebar from '../staff/StaffSidebar'
import StaffHeader from '../staff/StaffHeader'
import '../farmer/FarmerDashboard.css'

export default function HelpSupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isStaff = isStaffAuthenticated()
  const activeFarmer = getFarmerProfile()
  const activeStaff = getStaffAuthSession()

  const [tickets, setTickets] = useState<GrievanceTicket[]>([])
  const [category, setCategory] = useState<any>('PAYMENT_DELAY')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [refToken, setRefToken] = useState('')
  const mandiCentre = isStaff ? activeStaff.centre_name : activeFarmer?.preferredMandi || 'Chiraigaon 1st at Gaurakala (FCS)'
  const [successTicket, setSuccessTicket] = useState<GrievanceTicket | null>(null)
  const [searchFaq, setSearchFaq] = useState('')

  useEffect(() => {
    setTickets(getGrievanceTickets())
  }, [])

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    const newTicket = submitGrievanceTicket({
      user_id: isStaff ? activeStaff.staff_id : activeFarmer?.farmerId || 'FARMER-GUEST',
      user_name: isStaff ? activeStaff.full_name : activeFarmer?.name || 'Farmer Ramesh Kumar',
      user_role: isStaff ? 'STAFF' : 'FARMER',
      mobile: isStaff ? activeStaff.mobile : activeFarmer?.mobile || '9214334494',
      category,
      reference_token: refToken.trim(),
      subject: subject.trim(),
      description: description.trim(),
      centre_name: mandiCentre,
    })

    setTickets(getGrievanceTickets())
    setSuccessTicket(newTicket)
    setSubject('')
    setDescription('')
    setRefToken('')
    setTimeout(() => setSuccessTicket(null), 6000)
  }

  const faqs = [
    {
      q: 'How long does DBT payment take after weighment?',
      a: 'Direct Benefit Transfers (DBT) are typically processed and released directly to the registered Aadhaar-linked bank account within 24 to 48 hours of quality approval.',
    },
    {
      q: 'What is the maximum allowed grain moisture limit for wheat?',
      a: 'As per Food Corporation of India (FCI) Fair Average Quality (FAQ) standards, the maximum moisture tolerance for wheat is 12.00%. If moisture exceeds 12%, a nominal moisture deduction applies.',
    },
    {
      q: 'Can I cancel or reschedule my booked procurement slot?',
      a: 'Yes, you can cancel or re-book your appointment slot up to 2 hours prior to your scheduled time window from the "My Appointments" page in your dashboard.',
    },
    {
      q: 'What documents should I bring to the APMC procurement centre?',
      a: 'Please carry your digital QR entry pass (on your smartphone or printed slip), government photo ID, bank account passbook copy, and land Khasra revenue record.',
    },
  ]

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.a.toLowerCase().includes(searchFaq.toLowerCase())
  )

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isStaff ? (
        <StaffSidebar
          activeTab="settings"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <FarmerSidebar
          activePage="help"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        {isStaff ? (
          <StaffHeader
            onToggleSidebar={() => setSidebarOpen(true)}
            pageTitle="Grievance Redressal &amp; Help Desk"
          />
        ) : (
          <header className="fd-top-navbar" style={{ background: '#ffffff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className="fd-mobile-toggle"
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ☰
              </button>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Help &amp; Grievance Redressal Support
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/farmer-dashboard')}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
            >
              ← Dashboard
            </button>
          </header>
        )}

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LifeBuoy size={22} color="#0d631b" />
              Kisan Setu Grievance Redressal &amp; Helpline
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
              Submit queries regarding DBT payments, gate passes, moisture assessments, or connect with APMC grievance officers.
            </p>
          </div>

          {/* Emergency Helpline Contacts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)', borderRadius: '16px', padding: '20px', color: '#ffffff', boxShadow: '0 4px 12px rgba(13, 99, 27, 0.2)' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>Toll-Free Kisan Procurement Helpline</span>
              <div style={{ fontSize: '22px', fontWeight: 800, margin: '6px 0 2px' }}>1800-180-1551</div>
              <small style={{ opacity: 0.9 }}>Toll-Free (Mon - Sat, 08:00 AM - 08:00 PM)</small>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Varanasi APMC Nodal Grievance Cell</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>+91 542 2508921</div>
              <small style={{ color: '#64748b' }}>Food &amp; Civil Supplies (FCS) Varanasi Division</small>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>PFMS / DBT Payment Helpdesk</span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px' }}>1800-118-111</div>
              <small style={{ color: '#64748b' }}>Direct Banking Transfer Inquiries</small>
            </div>
          </div>

          {/* Form + Ticket Tracker Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {/* Left: Grievance Submission Form */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="#0d631b" />
                Submit a Grievance or Dispute Ticket
              </h3>

              {successTicket && (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '10px', fontSize: '13px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} />
                  Ticket #{successTicket.ticket_number} submitted successfully! Our nodal officer will review within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmitTicket}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Issue Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="PAYMENT_DELAY">DBT Payment Delay / Pending</option>
                      <option value="MOISTURE_DISPUTE">Moisture / Quality Grade Dispute</option>
                      <option value="WEIGHMENT_DISCREPANCY">Tare / Gross Weighment Discrepancy</option>
                      <option value="TOKEN_ISSUE">Slot Booking / Token Issue</option>
                      <option value="GENERAL_SUPPORT">General Procurement Query</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                      Token / Batch Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A-42 or PR-UP-2026-1184"
                      value={refToken}
                      onChange={(e) => setRefToken(e.target.value)}
                      style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Subject / Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description of the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Detailed Grievance Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide specific details regarding your weighment batch, transaction date, or dispute..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0d631b',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(13, 99, 27, 0.2)',
                  }}
                >
                  <Send size={15} /> Submit Grievance to APMC Nodal Cell
                </button>
              </form>
            </div>

            {/* Right: Active Ticket Tracking Board */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0d631b" />
                Grievance Tickets Status Board
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>
                        {t.ticket_number}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: t.status === 'RESOLVED' ? '#dcfce7' : t.status === 'UNDER_REVIEW' ? '#fef3c7' : '#fee2e2',
                          color: t.status === 'RESOLVED' ? '#166534' : t.status === 'UNDER_REVIEW' ? '#92400e' : '#991b1b',
                        }}
                      >
                        {t.status === 'RESOLVED' ? '✓ Resolved' : t.status === 'UNDER_REVIEW' ? '● Under Review' : '○ Open'}
                      </span>
                    </div>

                    <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {t.subject}
                    </strong>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px' }}>
                      {t.description}
                    </p>

                    {t.resolution_notes && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#166534', marginTop: '6px' }}>
                        <strong>Nodal Officer Note:</strong> {t.resolution_notes}
                      </div>
                    )}
                    <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '6px' }}>
                      Submitted on: {new Date(t.created_at).toLocaleDateString('en-IN')}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions (FAQ) Section */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#0d631b" />
                Frequently Answered Questions (Procurement FAQ)
              </h3>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchFaq}
                  onChange={(e) => setSearchFaq(e.target.value)}
                  style={{ width: '100%', height: '34px', padding: '0 10px 0 32px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Q: {faq.q}
                  </strong>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
