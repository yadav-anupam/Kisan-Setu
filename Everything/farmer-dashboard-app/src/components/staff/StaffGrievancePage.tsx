import { useState, useEffect } from 'react'
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  PhoneCall,
  ShieldCheck,
  X,
  FileText,
  ArrowRight,
  Filter,
} from 'lucide-react'
import {
  getStaffAuthSession,
  getGrievanceTickets,
  submitGrievanceTicket,
  updateGrievanceStatus,
  type GrievanceTicket,
  type StaffProfile,
} from '../../services/staffDataService'
import { useRouter } from '../../router'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function StaffGrievancePage() {
  const { path } = useRouter()
  const isCentreAdmin = path.startsWith('/centre-admin')
  const isAdmin = path.startsWith('/admin')

  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tickets, setTickets] = useState<GrievanceTicket[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'>('ALL')

  // Modals
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false)
  const [resolveModalTicket, setResolveModalTicket] = useState<GrievanceTicket | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [newStatus, setNewStatus] = useState<'OPEN' | 'UNDER_REVIEW' | 'RESOLVED'>('RESOLVED')

  // New Ticket Form State
  const [farmerName, setFarmerName] = useState('')
  const [farmerMobile, setFarmerMobile] = useState('')
  const [farmerId, setFarmerId] = useState('')
  const [category, setCategory] = useState<'PAYMENT_DELAY' | 'TOKEN_ISSUE' | 'MOISTURE_DISPUTE' | 'WEIGHMENT_DISCREPANCY' | 'GENERAL_SUPPORT'>('PAYMENT_DELAY')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM')
  const [refToken, setRefToken] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [successToast, setSuccessToast] = useState<string | null>(null)

  useEffect(() => {
    setStaff(getStaffAuthSession())
    setTickets(getGrievanceTickets())

    const handleUpdate = () => {
      setTickets(getGrievanceTickets())
    }
    window.addEventListener('kisan_setu_grievance_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_grievance_updated', handleUpdate)
  }, [])

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    const created = submitGrievanceTicket({
      user_id: farmerId.trim() || staff.staff_id,
      user_name: farmerName.trim() || staff.full_name,
      user_role: farmerName ? 'FARMER' : 'STAFF',
      mobile: farmerMobile.trim() || staff.mobile,
      category,
      priority,
      reference_token: refToken.trim(),
      subject: subject.trim(),
      description: description.trim(),
      centre_name: staff.centre_name,
    })

    setTickets(getGrievanceTickets())
    setNewTicketModalOpen(false)
    setFarmerName('')
    setFarmerMobile('')
    setFarmerId('')
    setSubject('')
    setDescription('')
    setRefToken('')
    setSuccessToast(`Ticket #${created.ticket_number} created successfully!`)
    setTimeout(() => setSuccessToast(null), 5000)
  }

  const handleUpdateTicketStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveModalTicket) return

    updateGrievanceStatus(resolveModalTicket.id, newStatus, resolutionNotes.trim())
    setTickets(getGrievanceTickets())
    setResolveModalTicket(null)
    setResolutionNotes('')
    setSuccessToast(`Ticket #${resolveModalTicket.ticket_number} status updated to ${newStatus}.`)
    setTimeout(() => setSuccessToast(null), 5000)
  }

  // Filtered list
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      t.ticket_number.toLowerCase().includes(q) ||
      t.user_name.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.reference_token && t.reference_token.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q))

    const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Metrics
  const totalCount = tickets.length
  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const reviewCount = tickets.filter((t) => t.status === 'UNDER_REVIEW').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length

  const renderSidebar = () => {
    if (isCentreAdmin) {
      return (
        <CentreAdminSidebar
          activeTab="support"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )
    }
    if (isAdmin) {
      return (
        <AdminSidebar
          activeTab="support"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )
    }
    return (
      <StaffSidebar
        activeTab="support"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    )
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {renderSidebar()}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle={isCentreAdmin ? 'Centre Grievance Redressal Cell' : isAdmin ? 'State Grievance Monitoring' : 'Mandi Grievance Helpdesk & Dispute Redressal'}
        />

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
          {/* Success Toast */}
          {successToast && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                color: '#065f46',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: 600,
                fontSize: '13.5px',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" />
                <span>{successToast}</span>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Top Header & Emergency Helpline Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Grievance &amp; Dispute Management Cell
              </h1>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: '4px 0 0' }}>
                Manage farmer complaints regarding weighments, moisture deductions, gate tokens, and DBT payout reconciliations at <strong>{staff.centre_name}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNewTicketModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #0d631b 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '11px 20px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(13, 99, 27, 0.25)',
              }}
            >
              <Plus size={16} />
              Register Grievance Ticket
            </button>
          </div>

          {/* 4 Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Registered</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>{totalCount}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Mandi operational issues</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.04)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Open / Awaiting Action</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{openCount}</div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Requires staff response</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.04)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Under Investigation</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>{reviewCount}</div>
              <div style={{ fontSize: '12px', color: '#f97316', marginTop: '4px' }}>Inspector / APMC assigned</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.04)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved / Closed</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>{resolvedCount}</div>
              <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px' }}>Redressal verified</div>
            </div>
          </div>

          {/* Emergency Escalation Contacts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)', color: '#ffffff', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', width: '42px', height: '42px', borderRadius: '10px', display: 'grid', placeItems: 'center' }}>
                <PhoneCall size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#bbf7d0' }}>Toll-Free Kisan Helpline</div>
                <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '0.5px' }}>1800-180-1551</div>
                <div style={{ fontSize: '11px', color: '#dcfce7' }}>Mon - Sat, 08:00 AM - 08:00 PM</div>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#f1f5f9', width: '42px', height: '42px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#334155' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>Varanasi APMC Nodal Cell</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>+91 542 2508921</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>FCS Mandi Division Varanasi</div>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: '#f1f5f9', width: '42px', height: '42px', borderRadius: '10px', display: 'grid', placeItems: 'center', color: '#334155' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>PFMS / DBT Payment Helpdesk</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>1800-118-111</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Ministry of Finance DBT Cell</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', minWidth: '280px', flex: 1 }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by ticket #, farmer name, mobile, token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#0f172a' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} color="#64748b" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: '#334155', background: '#ffffff', outline: 'none', fontWeight: 600 }}
                >
                  <option value="ALL">All Issue Categories</option>
                  <option value="PAYMENT_DELAY">DBT Payment Delay</option>
                  <option value="TOKEN_ISSUE">Gate QR &amp; Token Issue</option>
                  <option value="MOISTURE_DISPUTE">Moisture / Quality Dispute</option>
                  <option value="WEIGHMENT_DISCREPANCY">Weighbridge Discrepancy</option>
                  <option value="GENERAL_SUPPORT">General Assistance</option>
                </select>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                {(['ALL', 'OPEN', 'UNDER_REVIEW', 'RESOLVED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: selectedStatus === st ? 700 : 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedStatus === st ? '#ffffff' : 'transparent',
                      color: selectedStatus === st ? '#0f172a' : '#64748b',
                      boxShadow: selectedStatus === st ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st === 'ALL' ? 'All Status' : st === 'UNDER_REVIEW' ? 'Investigating' : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tickets Table / List */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <LifeBuoy size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: 0 }}>No Grievance Tickets Found</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  {searchQuery ? 'Try adjusting your search criteria or clear filters.' : 'There are currently no active tickets recorded in the system.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <th style={{ padding: '14px 18px' }}>Ticket #</th>
                      <th style={{ padding: '14px 18px' }}>Farmer / Requester</th>
                      <th style={{ padding: '14px 18px' }}>Category &amp; Subject</th>
                      <th style={{ padding: '14px 18px' }}>Priority</th>
                      <th style={{ padding: '14px 18px' }}>Status</th>
                      <th style={{ padding: '14px 18px' }}>Created</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => {
                      const isResolved = t.status === 'RESOLVED'
                      const isOpen = t.status === 'OPEN'

                      return (
                        <tr
                          key={t.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0d631b' }}>
                            {t.ticket_number}
                            {t.reference_token && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                                Ref: {t.reference_token}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.user_name}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {t.mobile} • <span style={{ textTransform: 'capitalize' }}>{t.user_role.toLowerCase()}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.subject}</div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.description}
                            </div>
                            {t.resolution_notes && (
                              <div style={{ fontSize: '11px', color: '#15803d', background: '#f0fdf4', padding: '3px 6px', borderRadius: '4px', marginTop: '4px', border: '1px solid #dcfce7' }}>
                                <strong>Resolution:</strong> {t.resolution_notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background:
                                  t.priority === 'CRITICAL'
                                    ? '#fee2e2'
                                    : t.priority === 'HIGH'
                                    ? '#ffedd5'
                                    : '#f1f5f9',
                                color:
                                  t.priority === 'CRITICAL'
                                    ? '#b91c1c'
                                    : t.priority === 'HIGH'
                                    ? '#c2410c'
                                    : '#475569',
                              }}
                            >
                              {t.priority || 'MEDIUM'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '3px 9px',
                                borderRadius: '99px',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                background: isResolved ? '#dcfce7' : isOpen ? '#fee2e2' : '#fed7aa',
                                color: isResolved ? '#166534' : isOpen ? '#991b1b' : '#9a3412',
                              }}
                            >
                              {isResolved ? <CheckCircle2 size={13} /> : isOpen ? <AlertCircle size={13} /> : <Clock size={13} />}
                              {isResolved ? 'Resolved' : isOpen ? 'Open' : 'Investigating'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                            {new Date(t.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setResolveModalTicket(t)
                                setNewStatus(t.status)
                                setResolutionNotes(t.resolution_notes || '')
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#334155',
                                cursor: 'pointer',
                              }}
                            >
                              Update Status
                              <ArrowRight size={13} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: Register New Grievance Ticket */}
      {newTicketModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Register Grievance / Dispute Ticket
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                  Create an official complaint record for tracking and resolution.
                </p>
              </div>
              <button
                onClick={() => setNewTicketModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Farmer / Officer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Contact Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9214334494"
                    value={farmerMobile}
                    onChange={(e) => setFarmerMobile(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Issue Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff' }}
                  >
                    <option value="PAYMENT_DELAY">DBT Payment Delay</option>
                    <option value="TOKEN_ISSUE">Gate QR &amp; Token Issue</option>
                    <option value="MOISTURE_DISPUTE">Moisture / Quality Dispute</option>
                    <option value="WEIGHMENT_DISCREPANCY">Weighbridge Discrepancy</option>
                    <option value="GENERAL_SUPPORT">General Support</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Escalation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Batch / Token Ref # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. KS-2609080001 or WB-BATCH-402"
                  value={refToken}
                  onChange={(e) => setRefToken(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Subject Summary</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Detailed Grievance Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the complaint details, officer involved, or discrepancy noted..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewTicketModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit &amp; Assign Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Update Ticket Status & Resolution Notes */}
      {resolveModalTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Update Ticket #{resolveModalTicket.ticket_number}
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                  {resolveModalTicket.user_name} • {resolveModalTicket.subject}
                </p>
              </div>
              <button
                onClick={() => setResolveModalTicket(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateTicketStatus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', background: '#ffffff', fontWeight: 600 }}
                >
                  <option value="OPEN">OPEN (Pending Review)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Investigating with Yard Officer)</option>
                  <option value="RESOLVED">RESOLVED (Complaint Closed)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Officer Resolution Notes / Action Taken</label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the resolution details, re-weighment result, or DBT reference..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setResolveModalTicket(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 2, padding: '10px', borderRadius: '10px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save &amp; Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
