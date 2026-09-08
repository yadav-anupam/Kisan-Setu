import { useState, useEffect } from 'react'
import {
  Layers,
  CheckCircle2,
  Edit2,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

interface CentreCategory {
  id: string
  name: string
  code: string
  type: 'PRINCIPAL_YARD' | 'SUB_YARD' | 'PACS_COOP' | 'SEASONAL_PURCHASE' | 'SILO_TERMINAL'
  description: string
  totalCount: number
  avgDailyQuotaMT: number
  mandiCessPercent: number
  settlementSlaHours: number
  badgeColor: string
}

const initialCategories: CentreCategory[] = [
  {
    id: 'cat-1',
    name: 'Principal APMC Market Yards (PMY)',
    code: 'PMY-GRADE-A',
    type: 'PRINCIPAL_YARD',
    description: 'Major state regulated Mandi yards with dual electronic weighbridges, multi-commodity trade, and automated testing labs.',
    totalCount: 24,
    avgDailyQuotaMT: 450,
    mandiCessPercent: 1.5,
    settlementSlaHours: 24,
    badgeColor: '#1d4ed8',
  },
  {
    id: 'cat-2',
    name: 'Sub-Market Yards (SMY)',
    code: 'SMY-GRADE-B',
    type: 'SUB_YARD',
    description: 'Secondary feeder procurement yards mapped under mother APMC mandis for block-level decentralization.',
    totalCount: 56,
    avgDailyQuotaMT: 200,
    mandiCessPercent: 1.5,
    settlementSlaHours: 48,
    badgeColor: '#0d9488',
  },
  {
    id: 'cat-3',
    name: 'PACS / Primary Co-operative Centres',
    code: 'PACS-VILLAGE',
    type: 'PACS_COOP',
    description: 'Village-level primary agricultural cooperative society branches operating direct MSP paddy/wheat purchase counters.',
    totalCount: 142,
    avgDailyQuotaMT: 90,
    mandiCessPercent: 0.5,
    settlementSlaHours: 48,
    badgeColor: '#15803d',
  },
  {
    id: 'cat-4',
    name: 'Seasonal Temporary MSP Counters',
    code: 'TEMP-SEASON',
    type: 'SEASONAL_PURCHASE',
    description: 'Procurement centres deployed on short-term lease during peak harvesting season (Oct-Jan / Apr-Jun).',
    totalCount: 38,
    avgDailyQuotaMT: 60,
    mandiCessPercent: 0.0,
    settlementSlaHours: 72,
    badgeColor: '#b45309',
  },
  {
    id: 'cat-5',
    name: 'Mega Bulk Silo & Modern Depots (FCI / CWC)',
    code: 'SILO-MODERN',
    type: 'SILO_TERMINAL',
    description: 'Automated steel silo complexes with pneumatic grain intake, continuous sampling, and high-speed rail sidings.',
    totalCount: 8,
    avgDailyQuotaMT: 1200,
    mandiCessPercent: 1.0,
    settlementSlaHours: 24,
    badgeColor: '#6d28d9',
  },
]

export default function AdminCentreCategoriesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [categories, setCategories] = useState<CentreCategory[]>(initialCategories)
  const [editingCategory, setEditingCategory] = useState<CentreCategory | null>(null)
  const [saveToast, setSaveToast] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/centres/categories')
      navigate('/admin/login')
      return
    }
    setStaff(getStaffAuthSession())
  }, [])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return

    setCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? editingCategory : c))
    )
    setSaveToast(`Category rules for "${editingCategory.name}" updated successfully.`)
    setEditingCategory(null)
    setTimeout(() => setSaveToast(''), 4000)
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="centres"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Procurement Centre Classification &amp; Categories"
        />

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Top Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                <Layers size={14} color="#93c5fd" /> Institutional Classification Engine
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>
                Procurement Yard Classification &amp; Fee Mandates
              </h1>
              <p style={{ fontSize: '13px', color: '#c7d2fe', margin: 0, maxWidth: '640px' }}>
                Define regulatory tiers, daily capacity baselines, APMC cess percentages, and DBT payment SLA protocols across all 268 state-mapped purchase nodes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>268</div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Total Nodes</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>5</div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Active Tiers</div>
              </div>
            </div>
          </div>

          {saveToast && (
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
              <span>{saveToast}</span>
            </div>
          )}

          {/* Categories Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        background: `${cat.badgeColor}15`,
                        color: cat.badgeColor,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.4px',
                      }}
                    >
                      {cat.code}
                    </span>
                    <button
                      onClick={() => setEditingCategory(cat)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        color: '#475569',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Edit2 size={13} /> Edit Tier
                    </button>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                    {cat.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', margin: '0 0 16px 0' }}>
                    {cat.description}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      background: '#f8fafc',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>Active Centres:</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{cat.totalCount}</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Daily Intake Cap:</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{cat.avgDailyQuotaMT} MT</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>APMC Mandi Cess:</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{cat.mandiCessPercent}%</div>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>DBT Payment SLA:</span>
                      <div style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>&le; {cat.settlementSlaHours} hrs</div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span>Regulatory Authority: State Mandi Board</span>
                  <span style={{ fontWeight: 700, color: '#1e40af' }}>Tier Active</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Category Modal */}
          {editingCategory && (
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
                  maxWidth: '520px',
                  padding: '24px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Edit Category: {editingCategory.name}
                  </h3>
                  <button
                    onClick={() => setEditingCategory(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSave}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Category Description
                    </label>
                    <textarea
                      rows={3}
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Avg Daily Quota (MT)
                      </label>
                      <input
                        type="number"
                        value={editingCategory.avgDailyQuotaMT}
                        onChange={(e) => setEditingCategory({ ...editingCategory, avgDailyQuotaMT: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Mandi Cess (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingCategory.mandiCessPercent}
                        onChange={(e) => setEditingCategory({ ...editingCategory, mandiCessPercent: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Payment Settlement SLA (Hours)
                      </label>
                      <input
                        type="number"
                        value={editingCategory.settlementSlaHours}
                        onChange={(e) => setEditingCategory({ ...editingCategory, settlementSlaHours: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      style={{ padding: '8px 16px', borderRadius: '6px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ padding: '8px 18px', borderRadius: '6px', background: '#1e3a8a', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Save Rule Changes
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
