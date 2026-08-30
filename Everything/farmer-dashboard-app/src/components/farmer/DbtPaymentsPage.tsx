import { useState, useRef, useEffect } from 'react'
import {
  Bell,
  Building,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileSpreadsheet,
  Globe2,
  Info,
  LifeBuoy,
  Menu,
  PlusCircle,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { useLanguage } from '../../useLanguage'
import { getFarmerProfile, isFarmerLoggedIn, setRedirectAfterLogin } from '../../auth'
import { navigate } from '../../router'
import { fetchDbtPaymentsFromDB, type DbDbtPayment } from '../../services/supabaseDataService'
import FarmerSidebar from './FarmerSidebar'
import './FarmerDashboard.css'
import './DbtPaymentsPage.css'

export interface DbtTransaction {
  id: string
  day: string
  month: string
  year: string
  centre: string
  location: string
  produce: string
  grade: string
  quantity: number
  amount: number
  status: 'Paid' | 'Pending' | 'Failed'
  method: string
  utr: string
  accountNo: string
}

export default function DbtPaymentsPage() {
  const { currentLang, setLanguage, languages } = useLanguage()
  const farmer = getFarmerProfile()

  const [transactions, setTransactions] = useState<DbtTransaction[]>([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [filterTab, setFilterTab] = useState<'all' | 'paid' | 'pending' | 'failed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTx, setSelectedTx] = useState<DbtTransaction | null>(null)
  const [addBankModalOpen, setAddBankModalOpen] = useState(false)

  // Bank Form State
  const [newAccNo, setNewAccNo] = useState('')
  const [newIfsc, setNewIfsc] = useState('SBIN0001234')
  const [newBankName, setNewBankName] = useState('State Bank of India')

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isFarmerLoggedIn()) {
      setRedirectAfterLogin('/payments')
      navigate('/login')
      return
    }
    let isMounted = true
    fetchDbtPaymentsFromDB(farmer.farmerId || 'KS-FARM-2026-8942').then((records: DbDbtPayment[]) => {
      if (isMounted && records) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const transformed: DbtTransaction[] = records.map((r) => {
          const d = new Date(r.transfer_date || Date.now())
          return {
            id: r.id || r.payment_ref,
            day: d.getDate().toString().padStart(2, '0'),
            month: monthNames[d.getMonth()] || 'Aug',
            year: d.getFullYear().toString(),
            centre: 'Chiraigaon 1st at Gaurakala (FCS)',
            location: 'Varanasi, Uttar Pradesh',
            produce: r.commodity,
            grade: 'Grade A (FAQ Standard)',
            quantity: 40.0,
            amount: Number(r.amount),
            status: r.status === 'COMPLETED' ? 'Paid' : r.status === 'PROCESSING' ? 'Pending' : 'Failed',
            method: 'Direct DBT Bank Transfer (PFMS)',
            utr: r.utr_number,
            accountNo: `${r.bank_name} (•••• ${r.account_suffix})`,
          }
        })
        setTransactions(transformed)
      }
    }).catch(() => {})

    return () => {
      isMounted = false
    }
  }, [farmer.farmerId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredTransactions = transactions.filter((tx) => {
    if (filterTab === 'paid' && tx.status !== 'Paid') return false
    if (filterTab === 'pending' && tx.status !== 'Pending') return false
    if (filterTab === 'failed' && tx.status !== 'Failed') return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        tx.centre.toLowerCase().includes(q) ||
        tx.produce.toLowerCase().includes(q) ||
        tx.utr.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault()
    setAddBankModalOpen(false)
    alert(`Bank Account ${newAccNo} (${newBankName}) linked & verified for DBT transfers!`)
  }

  const activeLangObj = languages.find((l) => l.code === currentLang) || languages[0]

  return (
    <div className="dbt-payments-layout">
      {/* ==========================================================================
          Left Navigation Sidebar
          ========================================================================== */}
      <FarmerSidebar
        activePage="payments"
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ==========================================================================
          Main Content Area
          ========================================================================== */}
      <main className="pm-main-content">
        {/* Top Header Bar */}
        <header className="fd-topbar">
          <div className="fd-greeting">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="fd-icon-btn fd-mobile-toggle"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle Menu"
              >
                <Menu size={20} />
              </button>
              <h1>DBT &amp; Bank Payments</h1>
            </div>
            <p>Direct government MSP transfers linked with your PFMS &amp; Aadhaar bank account.</p>
          </div>

          <div className="fd-topbar-actions">
            {/* Language Selector Dropdown */}
            <div className="ks-lang-wrapper" ref={dropdownRef}>
              <button
                className={`ks-lang-btn ${langMenuOpen ? 'open' : ''}`}
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-label="Change Language"
              >
                <Globe2 size={14} />
                <span>{activeLangObj.nativeName}</span>
                <ChevronDown size={12} className="ks-lang-arrow" />
              </button>

              {langMenuOpen && (
                <div className="ks-lang-dropdown">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`ks-lang-option ${currentLang === lang.code ? 'selected' : ''}`}
                      onClick={() => {
                        setLanguage(lang.code)
                        setLangMenuOpen(false)
                      }}
                    >
                      <span className="ks-lang-native">{lang.nativeName}</span>
                      <span className="ks-lang-english">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              className="fd-icon-btn"
              onClick={() => alert('Payment alerts are active. Next settlement expected in 24h.')}
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="fd-notif-dot" />
            </button>

            {/* Farmer Avatar Pill */}
            <div
              className="fd-avatar-pill"
              onClick={() => navigate('/profile')}
              role="button"
              tabIndex={0}
              title="Open Farmer Profile"
            >
              <div className="fd-avatar-circle" style={{ overflow: 'hidden', padding: 0 }}>
                {farmer.profilePhoto ? (
                  <img
                    src={farmer.profilePhoto}
                    alt={farmer.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  farmer.name ? farmer.name.substring(0, 2).toUpperCase() : 'RK'
                )}
              </div>
              <span className="fd-avatar-name">{farmer.name.split(' ')[0] || 'Farmer'}</span>
            </div>
          </div>
        </header>

        {/* 4 KPI Top Cards */}
        <section className="pm-kpi-grid">
          <div className="pm-kpi-card highlight">
            <div className="pm-kpi-header">
              <TrendingUp size={15} /> Total Earnings
            </div>
            <strong>₹ {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}</strong>
            <small>This Season (All Batches)</small>
          </div>

          <div className="pm-kpi-card paid">
            <div className="pm-kpi-header">
              <CheckCircle2 size={15} /> Paid Amount
            </div>
            <strong>₹ {transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}</strong>
            <small>Direct Bank Credit (100% DBT)</small>
          </div>

          <div className="pm-kpi-card pending">
            <div className="pm-kpi-header">
              <Clock size={15} /> Pending Amount
            </div>
            <strong>₹ {transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}</strong>
            <small>{transactions.filter(t => t.status === 'Pending').length} Batch in Settlement</small>
          </div>

          <div className="pm-kpi-card transactions">
            <div className="pm-kpi-header">
              <ShieldCheck size={15} /> Total Transactions
            </div>
            <strong>{transactions.length}</strong>
            <small>PFMS Direct DBT Verified</small>
          </div>
        </section>

        {/* 2-Column Main Section: Left Table (1fr), Right Widgets (340px) */}
        <section className="pm-content-grid">
          {/* Left Table Panel */}
          <div className="pm-table-panel">
            <div className="pm-filter-bar">
              <div className="pm-filter-chips">
                <button
                  className={`pm-filter-chip ${filterTab === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterTab('all')}
                >
                  All Transactions ({transactions.length})
                </button>
                <button
                  className={`pm-filter-chip ${filterTab === 'paid' ? 'active' : ''}`}
                  onClick={() => setFilterTab('paid')}
                >
                  Paid ({transactions.filter(t => t.status === 'Paid').length})
                </button>
                <button
                  className={`pm-filter-chip ${filterTab === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilterTab('pending')}
                >
                  Pending ({transactions.filter(t => t.status === 'Pending').length})
                </button>
                <button
                  className={`pm-filter-chip ${filterTab === 'failed' ? 'active' : ''}`}
                  onClick={() => setFilterTab('failed')}
                >
                  Failed ({transactions.filter(t => t.status === 'Failed').length})
                </button>
              </div>

              <div className="pm-search-box">
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search by centre, UTR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="pm-table-wrap">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Centre</th>
                    <th>Produce</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th>Payment Method &amp; UTR</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'Manrope', fontSize: '16px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                          {tx.day}
                        </div>
                        <small style={{ color: '#64748b' }}>{tx.month} {tx.year}</small>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: '#0d631b' }}>{tx.centre}</div>
                        <small style={{ color: '#64748b' }}>{tx.location}</small>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sprout size={15} color="#16a34a" />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{tx.produce}</div>
                            <small style={{ color: '#64748b' }}>{tx.grade}</small>
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {tx.quantity.toFixed(2)} Qtl
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        ₹ {tx.amount.toLocaleString('en-IN')}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span
                          className={`pm-status-pill ${
                            tx.status === 'Paid'
                              ? 'paid'
                              : tx.status === 'Pending'
                              ? 'pending'
                              : 'failed'
                          }`}
                        >
                          {tx.status === 'Paid' ? '✓ Paid' : tx.status === 'Pending' ? '⏱ Pending' : '✕ Failed'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{tx.method}</div>
                        <small style={{ fontFamily: 'monospace', color: '#64748b' }}>{tx.utr}</small>
                      </td>

                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {tx.status === 'Failed' ? (
                          <button
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={() => alert('Initiating instant IFSC re-verification...')}
                          >
                            <RefreshCw size={12} /> Retry
                          </button>
                        ) : (
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0d631b',
                              fontWeight: 700,
                              cursor: 'pointer',
                              fontSize: '12px',
                              textDecoration: 'underline',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={() => setSelectedTx(tx)}
                          >
                            <Download size={13} /> View Slip
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '12px 16px', background: '#f8faf8', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <span>Showing {filteredTransactions.length} of {transactions.length} transaction entries</span>
              <button
                style={{ background: 'none', border: 'none', color: '#0d631b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => alert('Exporting full DBT payment records to Excel...')}
              >
                <FileSpreadsheet size={15} /> Export Statement
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar Widgets */}
          <div className="pm-right-widgets">
            {/* Payment Summary Widget */}
            <div className="pm-widget-box">
              <h3>Payment Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>Total MSP Earnings:</span>
                  <strong style={{ color: '#0f172a' }}>₹ 1,45,680</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>Total DBT Credited:</span>
                  <strong style={{ color: '#16a34a' }}>₹ 1,27,360</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>Pending Settlement:</span>
                  <strong style={{ color: '#f59e0b' }}>₹ 18,320</strong>
                </div>
              </div>

              <button
                className="fd-card-btn primary"
                onClick={() => alert('Downloading official annual MSP tax statement...')}
              >
                <Download size={14} /> Download Annual Statement
              </button>
            </div>

            {/* Linked Bank Accounts Widget */}
            <div className="pm-widget-box">
              <h3>Linked Bank Accounts</h3>
              <div className="pm-bank-card">
                <div className="pm-bank-icon">
                  <Building size={18} />
                </div>
                <div>
                  <strong>{farmer.bankName || 'State Bank of India'}</strong>
                  <p>A/C: {farmer.bankAccount || '**** 4321'}</p>
                </div>
                <span className="pm-bank-badge">DBT Default</span>
              </div>

              <div className="pm-bank-card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <div className="pm-bank-icon" style={{ borderColor: '#cbd5e1', color: '#475569' }}>
                  <Wallet size={18} />
                </div>
                <div>
                  <strong style={{ color: '#334155' }}>UPI Auto-Credit</strong>
                  <p style={{ color: '#64748b' }}>ramesh****@sbi</p>
                </div>
                <span className="pm-bank-badge" style={{ background: '#f1f5f9', color: '#475569' }}>Verified</span>
              </div>

              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', marginTop: '6px' }}
                onClick={() => setAddBankModalOpen(true)}
              >
                <PlusCircle size={14} /> Add / Update Bank Details
              </button>
            </div>

            {/* DBT 24-48h Guarantee */}
            <div className="pm-dbt-guarantee">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <ShieldCheck size={18} color="#93c5fd" />
                <strong style={{ margin: 0 }}>DBT 24-48h Guarantee</strong>
              </div>
              <p>
                Government MSP procurement funds are directly disbursed to your Aadhaar-seeded PFMS bank account within 24 to 48 hours.
              </p>
            </div>

            {/* Support Desk */}
            <div className="pm-widget-box" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <LifeBuoy size={18} color="#16a34a" />
                <strong style={{ fontSize: '13.5px', color: '#166534' }}>Payment Grievance Desk</strong>
              </div>
              <p style={{ fontSize: '11px', color: '#15803d', margin: '0 0 10px' }}>
                Have an inquiry regarding delayed transaction settlement?
              </p>
              <button
                className="fd-card-btn secondary"
                style={{ width: '100%', borderColor: '#86efac' }}
                onClick={() => window.open('https://wa.me/919214334494', '_blank')}
              >
                Contact Payment Support →
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          Transaction Receipt Modal
          ========================================================================== */}
      {selectedTx && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card" style={{ maxWidth: '480px' }}>
            <div className="fd-modal-header">
              <h2>DBT Payment Voucher</h2>
              <button
                className="fd-modal-close"
                onClick={() => setSelectedTx(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '16px', borderRadius: '14px', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Direct Benefit Transfer (DBT)
              </span>
              <div style={{ fontFamily: 'Manrope', fontSize: '32px', fontWeight: 800, color: '#0d631b', margin: '4px 0' }}>
                ₹ {selectedTx.amount.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11.5px', background: '#ffffff', padding: '2px 8px', borderRadius: '99px', border: '1px solid #86efac', color: '#166534', fontWeight: 700 }}>
                ✓ Credited via PFMS
              </span>
            </div>

            <div className="pm-receipt-box">
              <div className="pm-receipt-row">
                <span>Beneficiary Farmer:</span>
                <strong>{farmer.name || 'Ramesh Kumar Singh'}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Farmer ID:</span>
                <strong>{farmer.farmerId || 'KS-FARM-2026-8942'}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Procure Centre:</span>
                <strong>{selectedTx.centre}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Produce &amp; Weight:</span>
                <strong>{selectedTx.produce} ({selectedTx.quantity} Qtl)</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Bank Account:</span>
                <strong>{selectedTx.accountNo}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>UTR Reference:</span>
                <strong style={{ fontFamily: 'monospace', color: '#0d631b' }}>{selectedTx.utr}</strong>
              </div>
              <div className="pm-receipt-row">
                <span>Disbursement Date:</span>
                <strong>{selectedTx.day} {selectedTx.month} {selectedTx.year}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                className="fd-card-btn primary"
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print Voucher
              </button>
              <button
                type="button"
                className="fd-card-btn secondary"
                onClick={() => setSelectedTx(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Add / Update Bank Details Modal
          ========================================================================== */}
      {addBankModalOpen && (
        <div className="fd-modal-overlay">
          <div className="fd-modal-card">
            <div className="fd-modal-header">
              <h2>Link DBT Bank Account</h2>
              <button
                className="fd-modal-close"
                onClick={() => setAddBankModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBank} className="fd-modal-form">
              <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '11.5px', color: '#166534', display: 'flex', gap: '6px' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>The bank account must be Aadhaar-seeded for PFMS Direct Benefit Transfer payments.</span>
              </div>

              <div className="fd-modal-field">
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  disabled
                  value={farmer.name || 'Ramesh Kumar Singh'}
                />
              </div>

              <div className="fd-modal-field">
                <label>Bank Name *</label>
                <select
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda (BOB)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                </select>
              </div>

              <div className="fd-modal-field">
                <label>Bank Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter 11-16 digit Account Number"
                  value={newAccNo}
                  onChange={(e) => setNewAccNo(e.target.value)}
                />
              </div>

              <div className="fd-modal-field">
                <label>Bank IFSC Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SBIN0001234"
                  value={newIfsc}
                  onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                />
              </div>

              <button
                type="submit"
                className="fd-card-btn primary"
                style={{ padding: '12px', marginTop: '6px' }}
              >
                <ShieldCheck size={16} /> Verify with PFMS &amp; Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
