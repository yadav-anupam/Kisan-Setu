import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Scale,
  Truck,
  Volume2,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchCentreQueue,
  updateQueueItemStatus,
  type StaffProfile,
  type QueueItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffQueuePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [selectedBay, setSelectedBay] = useState('Bay 2')
  const [announcementMsg, setAnnouncementMsg] = useState('')

  const loadQueue = useCallback(async () => {
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    const list = await fetchCentreQueue(currentStaff.centre_id)
    setQueue(list)
  }, [])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/queue')
      navigate('/staff/login')
      return
    }
    loadQueue()
  }, [loadQueue])

  const waitingCount = queue.filter((q) => q.status === 'WAITING').length
  const servingCount = queue.filter((q) => q.status === 'SERVING' || q.status === 'PROCESSING').length
  const completedCount = queue.filter((q) => q.status === 'COMPLETED').length

  const handleCallNext = async () => {
    const nextWaiting = queue.find((q) => q.status === 'WAITING')
    if (!nextWaiting) {
      alert('No more farmers waiting in queue.')
      return
    }

    await updateQueueItemStatus(nextWaiting.id, 'SERVING', selectedBay)
    setAnnouncementMsg(`Calling Token ${nextWaiting.token_number} (${nextWaiting.farmer_name}) to Weighbridge ${selectedBay}`)
    loadQueue()
  }

  const handleAction = async (item: QueueItem, action: QueueItem['status']) => {
    await updateQueueItemStatus(item.id, action, selectedBay)
    loadQueue()
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="queue"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Live Mandi Queue Manager"
        />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Weighbridge Queue &amp; Token Dispatch
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                Control live vehicle call sequences and weighbridge bay allocation for {staff.centre_name}
              </p>
            </div>

            {/* Operator Bay Selector & Call Next */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={selectedBay}
                onChange={(e) => setSelectedBay(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: '#ffffff',
                }}
              >
                <option value="Bay 1">Bay 1 (Gross Weighbridge)</option>
                <option value="Bay 2">Bay 2 (Gate 2 Main)</option>
                <option value="Bay 3">Bay 3 (Express Grain)</option>
                <option value="Bay 4">Bay 4 (Tare Outflow)</option>
              </select>

              <button
                type="button"
                onClick={handleCallNext}
                style={{
                  background: '#0d631b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(13,99,27,0.25)',
                }}
              >
                <Volume2 size={17} /> Call Next Token
              </button>
            </div>
          </div>

          {announcementMsg && (
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#166534',
                fontWeight: 700,
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Volume2 size={18} />
                <span>{announcementMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setAnnouncementMsg('')}
                style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Queue Statistics Cards */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Truck size={15} color="#2563eb" /> Current Queue
              </div>
              <strong style={{ display: 'block', fontSize: '28px', color: '#2563eb', margin: '8px 0 2px' }}>
                {queue.length}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>Total tokens loaded</small>
            </div>

            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Scale size={15} color="#16a34a" /> Currently Serving
              </div>
              <strong style={{ display: 'block', fontSize: '28px', color: '#16a34a', margin: '8px 0 2px' }}>
                {servingCount}
              </strong>
              <small style={{ color: '#166534', fontSize: '11px', fontWeight: 700 }}>Active at weighbridges</small>
            </div>

            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <Clock size={15} color="#eab308" /> Waiting Vehicles
              </div>
              <strong style={{ display: 'block', fontSize: '28px', color: '#ca8a04', margin: '8px 0 2px' }}>
                {waitingCount}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>In staging lane</small>
            </div>

            <div className="fd-stat-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                <CheckCircle2 size={15} color="#0d631b" /> Completed Today
              </div>
              <strong style={{ display: 'block', fontSize: '28px', color: '#0d631b', margin: '8px 0 2px' }}>
                {completedCount + 74}
              </strong>
              <small style={{ color: '#64748b', fontSize: '11px' }}>Batches cleared</small>
            </div>
          </section>

          {/* Queue Sequence Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Live Weighbridge Sequence
                </h2>
                <small style={{ color: '#64748b' }}>Real-time state synced across driver displays</small>
              </div>
              <button
                type="button"
                onClick={loadQueue}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={13} /> Refresh
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>Token #</th>
                    <th style={{ padding: '12px 16px' }}>Booking Number</th>
                    <th style={{ padding: '12px 16px' }}>Farmer Name</th>
                    <th style={{ padding: '12px 16px' }}>Slot Time</th>
                    <th style={{ padding: '12px 16px' }}>Commodity</th>
                    <th style={{ padding: '12px 16px' }}>Bay Assigned</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Operator Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const isServing = item.status === 'SERVING' || item.status === 'PROCESSING'
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: isServing ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <strong style={{ fontSize: '15px', color: '#0d631b' }}>
                            {item.token_number}
                          </strong>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                          {item.booking_number}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                          {item.farmer_name}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {item.slot_time}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {item.commodity}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '11.5px' }}>
                            {item.counter_id}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background:
                                item.status === 'SERVING'
                                  ? '#dcfce7'
                                  : item.status === 'PROCESSING'
                                  ? '#e0e7ff'
                                  : item.status === 'COMPLETED'
                                  ? '#f1f5f9'
                                  : item.status === 'HELD'
                                  ? '#fee2e2'
                                  : '#fef3c7',
                              color:
                                item.status === 'SERVING'
                                  ? '#166534'
                                  : item.status === 'PROCESSING'
                                  ? '#3730a3'
                                  : item.status === 'COMPLETED'
                                  ? '#64748b'
                                  : item.status === 'HELD'
                                  ? '#dc2626'
                                  : '#b45309',
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {item.status === 'WAITING' && (
                              <button
                                type="button"
                                onClick={() => handleAction(item, 'SERVING')}
                                style={{
                                  background: '#0d631b',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Call to Bay
                              </button>
                            )}

                            {item.status === 'SERVING' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item, 'PROCESSING')}
                                  style={{
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Start Weighing
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAction(item, 'COMPLETED')}
                                  style={{
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Complete
                                </button>
                              </>
                            )}

                            {item.status === 'PROCESSING' && (
                              <button
                                type="button"
                                onClick={() => handleAction(item, 'COMPLETED')}
                                style={{
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 12px',
                                  fontSize: '11.5px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                }}
                              >
                                ✓ Finish Weighment
                              </button>
                            )}

                            {item.status !== 'COMPLETED' && item.status !== 'HELD' && (
                              <button
                                type="button"
                                onClick={() => handleAction(item, 'HELD')}
                                style={{
                                  background: '#fff1f2',
                                  color: '#e11d48',
                                  border: '1px solid #ffe4e6',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Hold
                              </button>
                            )}

                            {item.status === 'HELD' && (
                              <button
                                type="button"
                                onClick={() => handleAction(item, 'WAITING')}
                                style={{
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Recall
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
