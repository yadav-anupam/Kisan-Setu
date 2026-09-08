import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Play,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import CentreAdminSidebar from './CentreAdminSidebar'
import './StaffQRScannerPage.css'

interface DigitalToken {
  tokenNo: string
  farmerName: string
  farmerMobile: string
  commodity: string
  estimatedQuantityQtl: number
  slotTime: string
  vehicleNo: string
  status: 'WAITING' | 'CALLED' | 'WEIGHMENT' | 'QUALITY' | 'COMPLETED' | 'CANCELLED'
  issuedAt: string
}

const mockTokens: DigitalToken[] = [
  {
    tokenNo: 'TKN-CHR-001',
    farmerName: 'Ramprasad Yadav',
    farmerMobile: '9876543210',
    commodity: 'Paddy (Grade A)',
    estimatedQuantityQtl: 45.0,
    slotTime: '08:00 - 09:00 AM',
    vehicleNo: 'UP 65 BT 9081',
    status: 'COMPLETED',
    issuedAt: '07:45 AM',
  },
  {
    tokenNo: 'TKN-CHR-002',
    farmerName: 'Shivnarayan Maurya',
    farmerMobile: '9876543211',
    commodity: 'Paddy (Common)',
    estimatedQuantityQtl: 60.0,
    slotTime: '09:00 - 10:00 AM',
    vehicleNo: 'UP 65 CX 4421',
    status: 'QUALITY',
    issuedAt: '08:30 AM',
  },
  {
    tokenNo: 'TKN-CHR-003',
    farmerName: 'Dinesh Chandra Patel',
    farmerMobile: '9876543212',
    commodity: 'Paddy (Common)',
    estimatedQuantityQtl: 38.5,
    slotTime: '10:00 - 11:00 AM',
    vehicleNo: 'UP 65 DP 1289',
    status: 'WEIGHMENT',
    issuedAt: '09:15 AM',
  },
  {
    tokenNo: 'TKN-CHR-004',
    farmerName: 'Ganga Ram Bind',
    farmerMobile: '9876543213',
    commodity: 'Paddy (Grade A)',
    estimatedQuantityQtl: 50.0,
    slotTime: '11:00 - 12:00 PM',
    vehicleNo: 'UP 65 EK 7712',
    status: 'CALLED',
    issuedAt: '09:40 AM',
  },
  {
    tokenNo: 'TKN-CHR-005',
    farmerName: 'Mukesh Kumar Singh',
    farmerMobile: '9876543214',
    commodity: 'Wheat',
    estimatedQuantityQtl: 75.0,
    slotTime: '12:00 - 01:00 PM',
    vehicleNo: 'UP 65 FK 3390',
    status: 'WAITING',
    issuedAt: '10:05 AM',
  },
  {
    tokenNo: 'TKN-CHR-006',
    farmerName: 'Brijesh Pandey',
    farmerMobile: '9876543215',
    commodity: 'Paddy (Grade A)',
    estimatedQuantityQtl: 42.0,
    slotTime: '01:00 - 02:00 PM',
    vehicleNo: 'UP 65 GH 6621',
    status: 'WAITING',
    issuedAt: '10:20 AM',
  },
]

export default function CentreAdminTokensPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [tokens, setTokens] = useState<DigitalToken[]>(mockTokens)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Manual token issuance modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [farmerName, setFarmerName] = useState('')
  const [farmerMobile, setFarmerMobile] = useState('')
  const [commodity, setCommodity] = useState('Paddy (Grade A)')
  const [quantity, setQuantity] = useState('40')
  const [vehicleNo, setVehicleNo] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/centre-admin/token-management')
      navigate('/centre-admin/login')
      return
    }
    setStaff(getStaffAuthSession())
  }, [])

  const handleIssueTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!farmerName.trim() || !farmerMobile.trim()) return

    const newToken: DigitalToken = {
      tokenNo: `TKN-CHR-${String(tokens.length + 1).padStart(3, '0')}`,
      farmerName: farmerName.trim(),
      farmerMobile: farmerMobile.trim(),
      commodity,
      estimatedQuantityQtl: parseFloat(quantity) || 40,
      slotTime: 'Walk-In Priority Slot',
      vehicleNo: vehicleNo.trim() || 'Tractor-Trolley',
      status: 'WAITING',
      issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setTokens([newToken, ...tokens])
    setIsIssueModalOpen(false)
    setFarmerName('')
    setFarmerMobile('')
    setVehicleNo('')
    setToastMsg(`Token ${newToken.tokenNo} issued to farmer ${newToken.farmerName}. Printed to slip dispenser.`)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const handleCallToken = (tokenNo: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.tokenNo === tokenNo ? { ...t, status: 'CALLED' } : t))
    )
    setToastMsg(`Token ${tokenNo} broadcasted to Public PA System & Yard Display Screen.`)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const filteredTokens = tokens.filter((t) => {
    const matchSearch =
      t.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      t.farmerMobile.includes(search) ||
      t.tokenNo.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <CentreAdminSidebar
        activeTab="token-management"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle={`${staff.centre_name || 'Chiraigaon Centre'} — Token Desk`}
        />

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header Controls */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#065f46', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <ShieldCheck size={14} color="#059669" /> Single-Centre Token Dispenser &amp; Queue Control
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Daily Mandi Token Dispatch &amp; Yard Callboard
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Manage pre-booked online appointments and issue instant walk-in slip tokens with live gate synchronization.
              </p>
            </div>

            <button
              onClick={() => setIsIssueModalOpen(true)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #064e3b 0%, #15803d 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(21, 128, 61, 0.25)',
              }}
            >
              <Plus size={16} /> Issue Walk-In Token
            </button>
          </div>

          {toastMsg && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                padding: '14px 18px',
                borderRadius: '8px',
                color: '#065f46',
                fontWeight: 600,
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={18} color="#059669" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>TOTAL TOKENS TODAY</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{tokens.length}</div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>CURRENTLY CALLED</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {tokens.filter((t) => t.status === 'CALLED').length}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706' }}>AT WEIGHBRIDGE / LAB</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                {tokens.filter((t) => t.status === 'WEIGHMENT' || t.status === 'QUALITY').length}
              </div>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>COMPLETED &amp; BILLED</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {tokens.filter((t) => t.status === 'COMPLETED').length}
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div
            style={{
              background: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search token #, farmer name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Filter size={15} color="#64748b" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Token States</option>
                <option value="WAITING">Waiting in Yard</option>
                <option value="CALLED">Called to Scale</option>
                <option value="WEIGHMENT">At Weighbridge</option>
                <option value="QUALITY">Quality Testing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Tokens List */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '14px 18px' }}>Token # &amp; Time</th>
                    <th style={{ padding: '14px 18px' }}>Farmer Details</th>
                    <th style={{ padding: '14px 18px' }}>Commodity &amp; Qty</th>
                    <th style={{ padding: '14px 18px' }}>Vehicle #</th>
                    <th style={{ padding: '14px 18px' }}>Current Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.map((t) => (
                    <tr key={t.tokenNo} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#064e3b', fontSize: '14px' }}>{t.tokenNo}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Issued: {t.issuedAt} • {t.slotTime}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.farmerName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>+91 {t.farmerMobile}</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.commodity}</div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>~ {t.estimatedQuantityQtl} Quintals</div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                          {t.vehicleNo}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800,
                            background:
                              t.status === 'COMPLETED'
                                ? '#ecfdf5'
                                : t.status === 'CALLED'
                                ? '#fef3c7'
                                : t.status === 'WEIGHMENT' || t.status === 'QUALITY'
                                ? '#eff6ff'
                                : '#f1f5f9',
                            color:
                              t.status === 'COMPLETED'
                                ? '#059669'
                                : t.status === 'CALLED'
                                ? '#b45309'
                                : t.status === 'WEIGHMENT' || t.status === 'QUALITY'
                                ? '#1d4ed8'
                                : '#64748b',
                          }}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {t.status === 'WAITING' ? (
                          <button
                            onClick={() => handleCallToken(t.tokenNo)}
                            style={{
                              padding: '6px 12px',
                              background: '#15803d',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Play size={12} /> Call to Scale
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Printing official duplicate slip for ${t.tokenNo}`)}
                            style={{
                              padding: '6px 10px',
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Printer size={12} /> Re-Print
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Issue Modal */}
          {isIssueModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  width: '100%',
                  maxWidth: '480px',
                  padding: '24px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Issue Walk-In Token Slip
                  </h3>
                  <button
                    onClick={() => setIsIssueModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleIssueTokenSubmit}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Farmer Full Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Verma"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Farmer Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={farmerMobile}
                      onChange={(e) => setFarmerMobile(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Commodity
                      </label>
                      <select
                        value={commodity}
                        onChange={(e) => setCommodity(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      >
                        <option value="Paddy (Common)">Paddy (Common)</option>
                        <option value="Paddy (Grade A)">Paddy (Grade A)</option>
                        <option value="Wheat">Wheat</option>
                        <option value="Mustard">Mustard</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Est. Quantity (Qtl)
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Vehicle / Trolley Registration #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UP 65 BT 1234"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsIssueModalOpen(false)}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 20px', borderRadius: '6px', background: '#15803d', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Issue &amp; Print Slip
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
