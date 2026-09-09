import { useState, useEffect } from 'react'
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  HelpCircle,
  Search,
  MessageSquare,
  Phone,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from '../../router'
import { getFarmerProfile, isFarmerLoggedIn } from '../../auth'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getGrievanceTickets,
  submitGrievanceTicket,
  type GrievanceTicket,
} from '../../services/staffDataService'
import FarmerSidebar from '../farmer/FarmerSidebar'
import FarmerHeader from '../farmer/FarmerHeader'
import StaffSidebar from '../staff/StaffSidebar'
import CentreAdminSidebar from '../staff/CentreAdminSidebar'
import AdminSidebar from '../staff/AdminSidebar'
import StaffHeader from '../staff/StaffHeader'
import '../farmer/FarmerDashboard.css'
import './HelpSupportPage.css'

export default function HelpSupportPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { path } = useRouter()

  const isStaffAuth = isStaffAuthenticated()
  const activeStaff = getStaffAuthSession()
  const isFarmerAuth = isFarmerLoggedIn()
  const activeFarmer = getFarmerProfile()

  const isCentreAdmin =
    path.startsWith('/centre-admin') ||
    (!path.startsWith('/admin') && !path.startsWith('/staff') && isStaffAuth && (activeStaff.role === 'CENTRE_OPERATOR' || (activeStaff as any).role === 'CENTRE_ADMIN'))

  const isAdmin =
    path.startsWith('/admin') ||
    (!path.startsWith('/centre-admin') && !path.startsWith('/staff') && isStaffAuth && (activeStaff.role === 'MANDI_ADMIN' || (activeStaff as any).role === 'ADMIN'))

  const isStaff =
    path.startsWith('/staff') ||
    path.startsWith('/operator') ||
    (!path.startsWith('/admin') && !path.startsWith('/centre-admin') && isStaffAuth && !isFarmerAuth)

  const isStaffRole = isCentreAdmin || isAdmin || isStaff

  const [tickets, setTickets] = useState<GrievanceTicket[]>([])
  const [category, setCategory] = useState<any>('PAYMENT_DELAY')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [refToken, setRefToken] = useState('')
  const mandiCentre = isStaffRole ? activeStaff.centre_name : activeFarmer?.preferredMandi || 'Chiraigaon 1st at Gaurakala (FCS)'
  const [successTicket, setSuccessTicket] = useState<GrievanceTicket | null>(null)
  const [searchFaq, setSearchFaq] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTickets(getGrievanceTickets())
  }, [])

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSubmitting(true)

    const newTicket = submitGrievanceTicket({
      user_id: isStaffRole ? activeStaff.staff_id : activeFarmer?.farmerId || 'FARMER-GUEST',
      user_name: isStaffRole ? activeStaff.full_name : activeFarmer?.name || 'Farmer',
      user_role: isStaffRole ? 'STAFF' : 'FARMER',
      mobile: isStaffRole ? activeStaff.mobile : activeFarmer?.mobile || '9214334494',
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
    setSubmitting(false)
    setTimeout(() => setSuccessTicket(null), 7000)
  }

  const faqs = [
    {
      q: 'How long does DBT payment take after weighment?',
      a: 'DBT transfers are processed within 24â€“48 hours of quality approval. Payments are credited directly to the Aadhaar-linked bank account. Check "My Payments" for UTR reference.',
    },
    {
      q: 'What is the maximum moisture limit for wheat (FAQ standard)?',
      a: 'As per FCI FAQ standards, maximum moisture for wheat is 12.00%. If moisture exceeds 12%, a proportional deduction applies before the MSP rate is calculated.',
    },
    {
      q: 'Can I cancel or reschedule my booked procurement slot?',
      a: 'Yes â€” you can cancel or re-book up to 2 hours before your scheduled time window from the "My Appointments" page in your dashboard.',
    },
    {
      q: 'What documents should I bring to the APMC centre?',
      a: 'Bring your digital QR entry pass (on phone or printed), government photo ID, bank passbook copy, and land Khasra revenue record.',
    },
    {
      q: 'My QR token was scanned but still shows PENDING â€” why?',
      a: 'Scan status updates within 2â€“5 minutes. If PENDING persists beyond 15 minutes after gate entry, raise a TOKEN_ISSUE ticket with your booking reference number.',
    },
    {
      q: 'How do I check if my weighment is recorded correctly?',
      a: 'Navigate to "My Procurement" in your dashboard. Each weighment entry shows gross weight, tare weight, net weight, moisture %, and the operator who recorded it.',
    },
    {
      q: 'What if I disagree with the moisture or grade assessment?',
      a: 'Submit a MOISTURE_DISPUTE ticket immediately on this page, citing your batch reference. A second sample test will be conducted by the Quality Control officer.',
    },
    {
      q: 'What is the Kisan Credit Card (KCC) facility at the mandi?',
      a: 'Registered MSP farmers with active KCC can pledge their procurement voucher at the mandi desk for an advance credit. Contact the APMC office for KCC pledge forms.',
    },
  ]

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchFaq.toLowerCase()) ||
      f.a.toLowerCase().includes(searchFaq.toLowerCase())
  )

  const getTicketClass = (status: string) => {
    if (status === 'RESOLVED') return 'resolved'
    if (status === 'UNDER_REVIEW') return 'review'
    return 'open'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'RESOLVED') return 'âœ“ Resolved'
    if (status === 'UNDER_REVIEW') return 'â³ Under Review'
    return 'â—‹ Open'
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar activeTab="support" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : isAdmin ? (
        <AdminSidebar activeTab="support" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : isStaff ? (
        <StaffSidebar activeTab="support" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      ) : (
        <FarmerSidebar activePage="help" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="fd-main-content">
        {isStaffRole ? (
          <StaffHeader
            onToggleSidebar={() => setSidebarOpen(true)}
            pageTitle="Grievance Redressal & Help Desk"
          />
        ) : (
          <div style={{ padding: '0 16px', paddingTop: '16px' }}>
            <FarmerHeader
              onToggleSidebar={() => setSidebarOpen(true)}
              pageTitle="Help & Grievance Redressal"
            />
          </div>
        )}

        <main className="help-main">
          {/* Page title */}
          <div className="help-hero">
            <h1>
              <LifeBuoy size={20} color="#0d631b" />
              Kisan Setu Grievance Redressal &amp; Helpline
            </h1>
            <p>
              Submit queries regarding DBT payments, gate passes, moisture assessments, or connect with APMC grievance officers.
            </p>
          </div>

          {/* Helpline contacts */}
          <div className="help-helpline-grid">
            <div className="help-helpline-card-primary">
              <span className="help-helpline-label">Toll-Free Kisan Procurement Helpline</span>
              <a href="tel:18001801551" className="help-helpline-number">1800-180-1551</a>
              <span className="help-helpline-sub">
                <Phone size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Toll-Free Â· Monâ€“Sat, 8 AM â€“ 8 PM
              </span>
            </div>

            <div className="help-helpline-card">
              <span className="help-helpline-label">Varanasi APMC Nodal Grievance Cell</span>
              <a href="tel:+915422508921" className="help-helpline-number">+91 542 2508921</a>
              <span className="help-helpline-sub">Food &amp; Civil Supplies (FCS) Varanasi Division</span>
            </div>

            <div className="help-helpline-card">
              <span className="help-helpline-label">PFMS / DBT Payment Helpdesk</span>
              <a href="tel:1800118111" className="help-helpline-number">1800-118-111</a>
              <span className="help-helpline-sub">Direct Banking Transfer Inquiries</span>
            </div>
          </div>

          {/* Form + Ticket Tracker */}
          <div className="help-grid">
            {/* Left: Grievance Form */}
            <div className="help-card">
              <h3 className="help-card-title">
                <MessageSquare size={17} color="#0d631b" />
                Submit a Grievance or Dispute Ticket
              </h3>

              {successTicket && (
                <div style={{
                  padding: '12px 14px', background: '#f0fdf4',
                  border: '1px solid #bbf7d0', color: '#166534',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                  marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <CheckCircle2 size={17} />
                  Ticket #{successTicket.ticket_number} submitted! Our nodal officer will review within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmitTicket}>
                <div className="help-form-row">
                  <div>
                    <label className="help-form-label">Issue Category *</label>
                    <select
                      className="help-form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="PAYMENT_DELAY">DBT Payment Delay / Pending</option>
                      <option value="MOISTURE_DISPUTE">Moisture / Quality Grade Dispute</option>
                      <option value="WEIGHMENT_DISCREPANCY">Tare / Gross Weighment Discrepancy</option>
                      <option value="TOKEN_ISSUE">Slot Booking / Token Issue</option>
                      <option value="GENERAL_SUPPORT">General Procurement Query</option>
                    </select>
                  </div>
                  <div>
                    <label className="help-form-label">Token / Batch Reference No.</label>
                    <input
                      type="text"
                      className="help-form-input"
                      placeholder="e.g. A-42 or PR-UP-2026-1184"
                      value={refToken}
                      onChange={(e) => setRefToken(e.target.value)}
                    />
                  </div>
                </div>

                <div className="help-form-group">
                  <label className="help-form-label">Subject / Summary *</label>
                  <input
                    type="text"
                    required
                    className="help-form-input"
                    placeholder="Brief description of the issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="help-form-group">
                  <label className="help-form-label">Detailed Grievance Description *</label>
                  <textarea
                    required
                    rows={4}
                    className="help-form-textarea"
                    placeholder="Provide specific details â€” weighment batch, transaction date, dispute reason..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Submitter info chip */}
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: '8px', padding: '8px 12px', fontSize: '11.5px',
                  color: '#64748b', marginBottom: '14px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <FileText size={13} color="#94a3b8" />
                  Submitting as: <strong style={{ color: '#334155' }}>
                    {isStaffRole ? activeStaff.full_name : activeFarmer?.name || 'Farmer'}
                  </strong>
                  &nbsp;Â·&nbsp;{mandiCentre}
                </div>

                <button type="submit" className="help-submit-btn" disabled={submitting}>
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Grievance to APMC Nodal Cell'}
                </button>
              </form>
            </div>

            {/* Right: Ticket Status Board */}
            <div className="help-card">
              <h3 className="help-card-title">
                <Clock size={17} color="#0d631b" />
                Your Grievance Tickets
              </h3>

              <div className="help-ticket-list">
                {tickets.length === 0 ? (
                  <div className="help-ticket-empty">
                    <AlertCircle size={28} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
                    <strong style={{ display: 'block', color: '#64748b', marginBottom: '4px' }}>No tickets yet</strong>
                    Submit a grievance on the left to track your resolution status here.
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div key={t.id} className={`help-ticket-item ${getTicketClass(t.status)}`}>
                      <div className="help-ticket-header">
                        <span className="help-ticket-number">{t.ticket_number}</span>
                        <span className={`help-ticket-status ${getTicketClass(t.status)}`}>
                          {getStatusLabel(t.status)}
                        </span>
                      </div>
                      <strong style={{ fontSize: '13px', color: '#334155', display: 'block', marginBottom: '4px' }}>
                        {t.subject}
                      </strong>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px', lineHeight: 1.45 }}>
                        {t.description}
                      </p>
                      {t.resolution_notes && (
                        <div style={{
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          borderRadius: '6px', padding: '6px 10px',
                          fontSize: '11.5px', color: '#166534', marginTop: '6px',
                        }}>
                          <strong>Nodal Officer Note:</strong> {t.resolution_notes}
                        </div>
                      )}
                      <small style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '6px' }}>
                        Submitted: {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="help-faq-section">
            <div className="help-faq-header">
              <h3 className="help-card-title" style={{ margin: 0 }}>
                <HelpCircle size={17} color="#0d631b" />
                Frequently Asked Questions (Procurement FAQ)
              </h3>
              <div className="help-faq-search-wrap">
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  className="help-faq-search"
                  placeholder="Search questions..."
                  value={searchFaq}
                  onChange={(e) => setSearchFaq(e.target.value)}
                />
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No matching FAQs found for "{searchFaq}".
              </div>
            ) : (
              <div className="help-faq-grid">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="help-faq-item">
                    <p className="help-faq-q">Q: {faq.q}</p>
                    <p className="help-faq-a">{faq.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
