import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Search,
  X,
  Megaphone,
  TrendingUp,
  Landmark,
  FileText,
  ArrowUpRight,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getCommodityPrices,
  getOfficialPriceAnnouncements,
  announceOfficialMSPPrice,
  type StaffProfile,
  type CommodityPriceItem,
  type PriceAnnouncementRecord,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export default function AdminPriceManagementPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [prices, setPrices] = useState<CommodityPriceItem[]>([])
  const [announcements, setAnnouncements] = useState<PriceAnnouncementRecord[]>([])

  // Modal State
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false)
  const [selectedCropId, setSelectedCropId] = useState('')
  const [newPrice, setNewPrice] = useState<number | ''>('')
  const [newBonus, setNewBonus] = useState<number | ''>(0)
  const [circularRef, setCircularRef] = useState('')
  const [notes, setNotes] = useState('')
  const [broadcastNotice, setBroadcastNotice] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = () => {
    setPrices(getCommodityPrices())
    setAnnouncements(getOfficialPriceAnnouncements())
  }

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem(
        'kisan_setu_staff_redirect',
        pathname || (isAdmin ? '/admin/prices' : isCentreAdmin ? '/centre-admin/price-management' : '/staff/prices')
      )
      if (isCentreAdmin) {
        navigate('/centre-admin/login')
      } else if (isAdmin) {
        navigate('/admin/login')
      } else {
        navigate('/staff/login')
      }
      return
    }
    setStaff(getStaffAuthSession())
    loadData()

    const handleRealtime = () => loadData()
    window.addEventListener('kisan_setu_msp_prices_updated', handleRealtime)
    window.addEventListener('kisan_setu_official_price_announced', handleRealtime)
    window.addEventListener('storage', handleRealtime)

    return () => {
      window.removeEventListener('kisan_setu_msp_prices_updated', handleRealtime)
      window.removeEventListener('kisan_setu_official_price_announced', handleRealtime)
      window.removeEventListener('storage', handleRealtime)
    }
  }, [pathname, isCentreAdmin, isAdmin])

  const handleOpenAnnounce = (item?: CommodityPriceItem) => {
    const target = item || prices[0]
    if (target) {
      setSelectedCropId(target.id)
      setNewPrice(target.mspPerQtl)
      setNewBonus(target.bonusPerQtl || 0)
      setCircularRef(`UP-AGRI/MSP-REV/${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}/${Math.floor(10 + Math.random() * 90)}`)
      setNotes(`Official State procurement rate revision for ${target.cropName} to maximize farmer remuneration and ensure price security.`)
      setIsAnnounceModalOpen(true)
    }
  }

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCropId || typeof newPrice !== 'number' || newPrice <= 0) return

    const res = announceOfficialMSPPrice({
      cropId: selectedCropId,
      newPrice,
      bonusPerQtl: typeof newBonus === 'number' ? newBonus : 0,
      circularRef: circularRef.trim(),
      notes: notes.trim(),
      announcedBy: `${staff.full_name} (${staff.role || 'APMC Admin'})`,
    })

    if (res) {
      loadData()
      setIsAnnounceModalOpen(false)
      const isHike = res.isPriceRaised
      setSuccessMsg(
        isHike
          ? `🎉 Official MSP Hike Announced: ${res.cropName} revised to ₹${res.newPrice}/Qtl (+₹${res.bonusPerQtl} Bonus)! Broadcast sent to all farmers & centres.`
          : `📢 Official Government MSP Declared: ${res.cropName} set to ₹${res.newPrice}/Qtl.`
      )
      setTimeout(() => setSuccessMsg(''), 6000)
    }
  }

  const activeCrop = prices.find((p) => p.id === selectedCropId) || prices[0]
  const oldRate = activeCrop ? activeCrop.mspPerQtl + (activeCrop.bonusPerQtl || 0) : 0
  const currentTotalRate = (typeof newPrice === 'number' ? newPrice : 0) + (typeof newBonus === 'number' ? newBonus : 0)
  const isRateRaised = currentTotalRate > oldRate
  const diffRate = currentTotalRate - oldRate

  const filteredPrices = prices.filter(
    (p) =>
      p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.season.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="prices"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="prices"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="prices"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Government MSP &amp; Commodity Price Master"
        />

        <main style={{ padding: '24px', maxWidth: '1360px', margin: '0 auto' }}>
          {/* Top Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #075a27 0%, #0d631b 60%, #15803d 100%)',
              borderRadius: '20px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '22px',
              boxShadow: '0 8px 24px -4px rgba(13, 99, 27, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  <Landmark size={13} /> Official APMC Governance &amp; Price Authority
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(254, 240, 138, 0.25)', color: '#fef08a', border: '1px solid rgba(254, 240, 138, 0.3)', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
                  ● Season 2026-27 Active
                </span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
                Official Minimum Support Price (MSP) Master Registry
              </h1>
              <p style={{ fontSize: '13px', color: '#dcfce7', margin: 0 }}>
                Declare, revise, and broadcast legally binding procurement benchmarks, state incentive bonuses, and FAQ quality standards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAnnounce()}
              style={{
                background: '#ffffff',
                color: '#075a27',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 20px',
                fontWeight: 800,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <Megaphone size={16} /> Announce Official MSP Price
            </button>
          </div>

          {successMsg && (
            <div style={{ padding: '14px 20px', background: '#f0fdf4', border: '1.5px solid #86efac', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13.5px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 6px rgba(22, 101, 52, 0.08)' }}>
              <CheckCircle2 size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Latest Price Announcements Bulletin Card */}
          {announcements.length > 0 && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1.5px solid #fde68a',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#d97706', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    LATEST OFFICIAL GAZETTE DECLARATION
                  </span>
                  <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 700 }}>
                    Order Ref: {announcements[0].circularRef || 'UP-AGRI/2026/08'}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#92400e' }}>
                  Announced: {new Date(announcements[0].announcedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#78350f', margin: '0 0 4px' }}>
                    {announcements[0].cropName} Official MSP: ₹{announcements[0].newPrice}/Qtl
                    {announcements[0].bonusPerQtl > 0 && ` (+₹${announcements[0].bonusPerQtl} State Incentive Bonus)`}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                    {announcements[0].notes || 'Approved by State APMC Directorate. Active across all 58 Mandis.'}
                  </p>
                </div>

                {announcements[0].isPriceRaised && (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800, fontSize: '13px' }}>
                    <TrendingUp size={16} /> Rate Increased (+₹{announcements[0].newPrice - announcements[0].oldPrice}/Qtl • +{announcements[0].percentageIncrease}%)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search bar & Metadata */}
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
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search commodity (Wheat, Paddy, Mustard)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', height: '38px', padding: '0 12px 0 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', color: '#64748b' }}>
              <span>Total Commodities: <strong>{prices.length} Registered</strong></span>
              <span>•</span>
              <span>Logged Authority: <strong>{staff.full_name}</strong></span>
            </div>
          </div>

          {/* Prices Grid / Table */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              marginBottom: '28px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, fontSize: '11.5px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Crop Commodity</th>
                  <th style={{ padding: '14px 18px' }}>Marketing Season</th>
                  <th style={{ padding: '14px 18px' }}>Base MSP / Qtl</th>
                  <th style={{ padding: '14px 18px' }}>State Incentive Bonus</th>
                  <th style={{ padding: '14px 18px' }}>Total Effective Payout / Qtl</th>
                  <th style={{ padding: '14px 18px' }}>FAQ Moisture Tolerance</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Official Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.map((p) => {
                  const totalRate = p.mspPerQtl + (p.bonusPerQtl || 0)
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div>
                            <strong style={{ color: '#0f172a', display: 'block', fontSize: '13.5px' }}>{p.cropName}</strong>
                            <span style={{ fontSize: '11.5px', color: '#64748b' }}>{p.hindiName}</span>
                          </div>
                          {((p.bonusPerQtl || 0) > 0) && (
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 800 }}>
                              +Bonus
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600 }}>
                          {p.season}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#334155' }}>
                        ₹{p.mspPerQtl.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', color: p.bonusPerQtl ? '#0d631b' : '#94a3b8', fontWeight: 700 }}>
                        {p.bonusPerQtl ? `+ ₹${p.bonusPerQtl}` : '—'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, fontSize: '15px', color: '#0d631b' }}>
                        ₹{totalRate.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        Max {p.faqMoistureLimit}%
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenAnnounce(p)}
                          style={{
                            background: '#0d631b',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 1px 3px rgba(13,99,27,0.2)',
                          }}
                        >
                          <Megaphone size={13} /> Announce / Revise
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Official Gazette Declarations History */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#0d631b" />
                Gazette Declaration &amp; Price Revision History
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Official APMC Broadcast Archive</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{anc.cropName}</strong>
                      <span style={{ background: anc.isPriceRaised ? '#dcfce7' : '#e0f2fe', color: anc.isPriceRaised ? '#166534' : '#0369a1', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800 }}>
                        {anc.isPriceRaised ? `▲ Raised +₹${anc.newPrice - anc.oldPrice}/Qtl (+${anc.percentageIncrease}%)` : 'Declared Rate'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Ref: {anc.circularRef}</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                      Effective: <strong>₹{anc.newPrice}/Qtl</strong> (Base) + <strong>₹{anc.bonusPerQtl}/Qtl</strong> (State Bonus) = <strong style={{ color: '#0d631b' }}>₹{anc.newPrice + anc.bonusPerQtl}/Qtl Total</strong> • {anc.effectiveSeason}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Announced by: <strong>{anc.announcedBy}</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(anc.announcedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Official MSP Announcement Modal */}
      {isAnnounceModalOpen && (
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
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0d631b', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <Megaphone size={14} /> Official Government Declaration
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                  Announce &amp; Revise Official MSP Price
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnounceModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Select Crop Commodity *
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => {
                    setSelectedCropId(e.target.value)
                    const c = prices.find((p) => p.id === e.target.value)
                    if (c) {
                      setNewPrice(c.mspPerQtl)
                      setNewBonus(c.bonusPerQtl || 0)
                    }
                  }}
                  style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', fontWeight: 700, background: '#ffffff', boxSizing: 'border-box' }}
                >
                  {prices.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.cropName} ({p.season}) — Current: ₹{p.mspPerQtl}/Qtl
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Government Base MSP (₹ / Qtl) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value ? parseFloat(e.target.value) : '')}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    State Incentive Bonus (₹ / Qtl)
                  </label>
                  <input
                    type="number"
                    value={newBonus}
                    onChange={(e) => setNewBonus(e.target.value ? parseFloat(e.target.value) : '')}
                    style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 700, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Real-time Rate Increase Calculation Preview Box */}
              <div
                style={{
                  background: isRateRaised ? '#f0fdf4' : '#f8fafc',
                  border: `1.5px solid ${isRateRaised ? '#86efac' : '#cbd5e1'}`,
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                      Effective Total Payout
                    </span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: isRateRaised ? '#166534' : '#0f172a' }}>
                      ₹{currentTotalRate.toLocaleString('en-IN')}/Qtl
                    </div>
                  </div>
                  {isRateRaised ? (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={13} /> +₹{diffRate}/Qtl Raised
                      </span>
                      <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                        +₹{(diffRate * 100).toLocaleString('en-IN')} extra gain per 100 Qtl
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Benchmark Standard</span>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Gazette Order / APMC Circular Ref No.
                </label>
                <input
                  type="text"
                  value={circularRef}
                  onChange={(e) => setCircularRef(e.target.value)}
                  placeholder="e.g. UP-AGRI/MSP-REV/2026-27/09"
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Official Justification / Remuneration Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on bonus incentives, FAQ moisture standards, and procurement targets..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '12.5px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="broadcastCheck"
                  checked={broadcastNotice}
                  onChange={(e) => setBroadcastNotice(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="broadcastCheck" style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                  Broadcast High-Priority Notice to Farmers, Centre Operators &amp; Mandi Terminals
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAnnounceModalOpen(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, padding: '11px', borderRadius: '10px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(13,99,27,0.3)' }}
                >
                  <Megaphone size={16} /> Broadcast Official MSP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

