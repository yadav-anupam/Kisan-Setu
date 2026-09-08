import { useState, useEffect } from 'react'
import {
  Edit,
  CheckCircle2,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getCommodityPrices,
  updateCommodityPrice,
  type StaffProfile,
  type CommodityPriceItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function AdminPriceManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [prices, setPrices] = useState<CommodityPriceItem[]>([])
  const [editingItem, setEditingItem] = useState<CommodityPriceItem | null>(null)

  // Edit form state
  const [newPrice, setNewPrice] = useState<number | ''>('')
  const [newBonus, setNewBonus] = useState<number | ''>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/prices')
      navigate('/staff/login')
      return
    }
    setStaff(getStaffAuthSession())
    setPrices(getCommodityPrices())
  }, [])

  const handleOpenEdit = (item: CommodityPriceItem) => {
    setEditingItem(item)
    setNewPrice(item.mspPerQtl)
    setNewBonus(item.bonusPerQtl || 0)
  }

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || typeof newPrice !== 'number' || newPrice <= 0) return

    updateCommodityPrice(editingItem.id, newPrice, typeof newBonus === 'number' ? newBonus : 0)
    setPrices(getCommodityPrices())
    setSuccessMsg(`MSP rate for ${editingItem.cropName} updated to ₹${newPrice}/Qtl.`)
    setEditingItem(null)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const filteredPrices = prices.filter(
    (p) =>
      p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.season.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="settings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Government MSP &amp; Commodity Price Master"
        />

        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Minimum Support Price (MSP) Master Registry
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Manage government procurement benchmarks, state bonus subsidies, and Fair Average Quality (FAQ) tolerances.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> Official Season 2026-27
              </span>
            </div>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {/* Search bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
            }}
          >
            <div style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search crop or season..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Last updated by: <strong>{staff.full_name}</strong>
            </span>
          </div>

          {/* Prices Grid / Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Crop Commodity</th>
                  <th style={{ padding: '14px 18px' }}>Marketing Season</th>
                  <th style={{ padding: '14px 18px' }}>Base MSP / Qtl</th>
                  <th style={{ padding: '14px 18px' }}>State Bonus</th>
                  <th style={{ padding: '14px 18px' }}>Total Payout / Qtl</th>
                  <th style={{ padding: '14px 18px' }}>FAQ Moisture Limit</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((p) => {
                  const totalRate = p.mspPerQtl + (p.bonusPerQtl || 0)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{p.cropName}</strong>
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>{p.hindiName}</span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                          {p.season}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#334155' }}>
                        ₹{p.mspPerQtl.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', color: p.bonusPerQtl ? '#0d631b' : '#94a3b8', fontWeight: 600 }}>
                        {p.bonusPerQtl ? `+ ₹${p.bonusPerQtl}` : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, fontSize: '14.5px', color: '#0d631b' }}>
                        ₹{totalRate.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        Max {p.faqMoistureLimit}%
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit size={13} /> Edit MSP
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Edit MSP Modal */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Update MSP: {editingItem.cropName}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{editingItem.season}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePrice}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Government Base MSP Rate (₹ / Quintal) *
                </label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value ? parseFloat(e.target.value) : '')}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  State Government Bonus / Incentive (₹ / Quintal)
                </label>
                <input
                  type="number"
                  value={newBonus}
                  onChange={(e) => setNewBonus(e.target.value ? parseFloat(e.target.value) : '')}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Save &amp; Update MSP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
