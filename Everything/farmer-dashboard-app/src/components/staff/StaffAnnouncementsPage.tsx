import { useState, useEffect } from 'react'
import {
  Megaphone,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  X,
  Volume2,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  type StaffProfile,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import CentreAdminSidebar from './CentreAdminSidebar'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'

export interface AnnouncementItem {
  id: string
  title: string
  message: string
  type: 'GENERAL' | 'URGENT' | 'BAY_UPDATE' | 'WEATHER'
  targetAudience: 'ALL' | 'WAITING_FARMERS' | 'STAFF'
  centreName: string
  createdBy: string
  createdAt: string
  isActive: boolean
}

const ANNOUNCEMENTS_STORAGE_KEY = 'kisan_setu_announcements_vault'

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'anc-1',
    title: 'Weighbridge Bay 2 Priority for Wheat Farmers',
    message: 'All tractor-trolleys loaded with Rabi Wheat please align in Lane 2 for rapid moisture testing.',
    type: 'BAY_UPDATE',
    targetAudience: 'WAITING_FARMERS',
    centreName: 'Chiraigaon 1st at Gaurakala (FCS)',
    createdBy: 'Rajesh Kumar (ST-102)',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    isActive: true,
  },
  {
    id: 'anc-2',
    title: 'Moisture FAQ Standards Notice (Max 12%)',
    message: 'Farmers are requested to ensure wheat grain moisture is within 12.0% FAQ limit to avoid deduction adjustments.',
    type: 'GENERAL',
    targetAudience: 'ALL',
    centreName: 'Chiraigaon 1st at Gaurakala (FCS)',
    createdBy: 'Suresh Meena (OP-401)',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isActive: true,
  },
  {
    id: 'anc-3',
    title: 'IMD Rain Advisory for Evening Shift',
    message: 'Scattered light showers anticipated around 17:30. Covered shed unloading prioritized for open trolleys.',
    type: 'WEATHER',
    targetAudience: 'ALL',
    centreName: 'Chiraigaon 1st at Gaurakala (FCS)',
    createdBy: 'Pooja Verma (IN-305)',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    isActive: true,
  },
]

export function getMandiAnnouncements(): AnnouncementItem[] {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return DEFAULT_ANNOUNCEMENTS
}

export function createMandiAnnouncement(item: Omit<AnnouncementItem, 'id' | 'createdAt' | 'isActive'>): AnnouncementItem {
  const current = getMandiAnnouncements()
  const newAnc: AnnouncementItem = {
    ...item,
    id: `anc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    isActive: true,
  }
  const updated = [newAnc, ...current]
  localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated))
  return newAnc
}

export default function StaffAnnouncementsPage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isCentreAdmin = pathname.startsWith('/centre-admin')
  const isAdmin = pathname.startsWith('/admin')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // New announcement form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<AnnouncementItem['type']>('GENERAL')
  const [targetAudience, setTargetAudience] = useState<AnnouncementItem['targetAudience']>('ALL')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', pathname || (isAdmin ? '/admin/announcements' : isCentreAdmin ? '/centre-admin/dashboard' : '/staff/announcements'))
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
    setAnnouncements(getMandiAnnouncements())
  }, [pathname, isCentreAdmin, isAdmin])

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return

    const newAnc = createMandiAnnouncement({
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience,
      centreName: staff.centre_name || 'All Mandi Yards',
      createdBy: `${staff.full_name} (${staff.staff_id})`,
    })

    setAnnouncements(getMandiAnnouncements())
    setIsCreateModalOpen(false)
    setTitle('')
    setMessage('')
    setSuccessMsg(`Announcement "${newAnc.title}" broadcasted to yard LED display & farmer feeds!`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const handleDeleteAnnouncement = (id: string) => {
    const updated = announcements.filter((a) => a.id !== id)
    setAnnouncements(updated)
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated))
  }

  const filteredAnnouncements = announcements

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {isCentreAdmin ? (
        <CentreAdminSidebar
          activeTab="dashboard"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : isAdmin ? (
        <AdminSidebar
          activeTab="announcements"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      ) : (
        <StaffSidebar
          activeTab="announcements"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Live Mandi Announcements &amp; Public Broadcast"
        />

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
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
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={22} color="#0d631b" />
                Live Yard Broadcast &amp; Public Announcements
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0' }}>
                Broadcast real-time audio/visual notifications to the mandi yard LED screen, weighbridge bays, and farmer mobile dashboards.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(13, 99, 27, 0.25)',
              }}
            >
              <Plus size={16} /> Broadcast New Announcement
            </button>
          </div>

          {successMsg && (
            <div style={{ padding: '12px 18px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              {successMsg}
            </div>
          )}

          {/* Announcements Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {filteredAnnouncements.map((a) => {
              const isUrgent = a.type === 'URGENT'
              const isBay = a.type === 'BAY_UPDATE'
              return (
                <div
                  key={a.id}
                  style={{
                    background: '#ffffff',
                    border: isUrgent ? '1.5px solid #fca5a5' : isBay ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '8px',
                          background: isUrgent ? '#fee2e2' : isBay ? '#dcfce7' : '#f1f5f9',
                          color: isUrgent ? '#991b1b' : isBay ? '#166534' : '#475569',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isUrgent ? <AlertCircle size={12} /> : <Volume2 size={12} />}
                        {a.type.replace('_', ' ')}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        title="Remove Announcement"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                      {a.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {a.message}
                    </p>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
                    <span>Target: <strong>{a.targetAudience.replace('_', ' ')}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      {/* Create Announcement Modal */}
      {isCreateModalOpen && (
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
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Broadcast Mandi Yard Announcement
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Announcement Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weighbridge Bay 3 Opened for Small Pickups"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Alert Category *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="BAY_UPDATE">Weighbridge Bay Update</option>
                    <option value="GENERAL">General Operational Notice</option>
                    <option value="URGENT">Urgent Yard Alert</option>
                    <option value="WEATHER">Weather Advisory</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Target Audience *
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    style={{ width: '100%', height: '40px', padding: '0 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', background: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="ALL">All (Farmers &amp; Staff)</option>
                    <option value="WAITING_FARMERS">Waiting Farmers in Yard</option>
                    <option value="STAFF">Mandi Staff &amp; Operators</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Broadcast Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter details for the public display board and farmer mobile notifications..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#0d631b', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
