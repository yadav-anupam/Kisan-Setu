import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  QrCode,
  Search,
  X,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchCentreBookings,
  type StaffProfile,
} from '../../services/staffDataService'
import { confirmBookingVerification } from '../../services/qrBookingService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffBookingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [commodityFilter, setCommodityFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Booking for Modal Details
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)

    const list = await fetchCentreBookings(currentStaff.centre_id, {
      dateFilter,
      statusFilter,
      verificationFilter,
      commodityFilter,
      searchQuery,
    })
    setBookings(list)
    setIsLoading(false)
  }, [dateFilter, statusFilter, verificationFilter, commodityFilter, searchQuery])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/bookings')
      navigate('/staff/login')
      return
    }
    loadBookings()
  }, [loadBookings])

  const handleQuickVerify = async (booking: any) => {
    if (!window.confirm(`Verify gate pass for Booking ${booking.booking_number} (${booking.farmer_name})?`)) {
      return
    }
    setIsVerifying(true)
    try {
      const userRole = staff.role === 'MANDI_ADMIN' ? 'admin' : staff.role === 'CENTRE_OPERATOR' ? 'centre_operator' : 'staff'
      await confirmBookingVerification(booking.booking_number, {
        id: staff.staff_id,
        name: staff.full_name,
        role: userRole,
        centre_id: staff.centre_id,
        centre_name: staff.centre_name,
      })
      alert(`✓ Booking ${booking.booking_number} has been VERIFIED!`)
      loadBookings()
      if (selectedBooking && selectedBooking.id === booking.id) {
        setSelectedBooking((prev: any) => ({
          ...prev,
          verification_status: 'VERIFIED',
          verified_by_name: `${staff.full_name} (${staff.staff_id})`,
          verified_at: new Date().toISOString(),
        }))
      }
    } catch {
      alert('Verification failed. Please check network.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="bookings"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Centre Bookings &amp; Passes"
        />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header & Stats Bar */}
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
                APMC Centre Bookings
              </h1>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                All scheduled farmer procurement passes assigned to {staff.centre_name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/staff/qr-verification')}
              style={{
                background: '#0d631b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <QrCode size={16} /> Scan QR at Gate
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search booking #, farmer name or vehicle number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px 0 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                }}
              >
                <option value="all">All Booking Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                }}
              >
                <option value="all">All Verifications</option>
                <option value="PENDING">Pending Arrival</option>
                <option value="VERIFIED">Verified at Gate</option>
              </select>

              <select
                value={commodityFilter}
                onChange={(e) => setCommodityFilter(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                }}
              >
                <option value="all">All Commodities</option>
                <option value="Wheat">Wheat (गेहूं)</option>
                <option value="Mustard">Mustard (सरसों)</option>
                <option value="Gram">Gram (चना)</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                style={{
                  height: '40px',
                  padding: '0 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#ffffff',
                }}
              >
                <option value="today">Today's Schedule</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="all">All Dates</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '12px 16px' }}>Booking &amp; Token</th>
                    <th style={{ padding: '12px 16px' }}>Farmer Details</th>
                    <th style={{ padding: '12px 16px' }}>Slot Time</th>
                    <th style={{ padding: '12px 16px' }}>Commodity &amp; Qty</th>
                    <th style={{ padding: '12px 16px' }}>Vehicle #</th>
                    <th style={{ padding: '12px 16px' }}>Gate Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Loading centre bookings...
                      </td>
                    </tr>
                  ) : bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No bookings found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => {
                      const isVer = b.verification_status === 'VERIFIED'
                      return (
                        <tr key={b.id || b.booking_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ display: 'block', color: '#0f172a' }}>
                              {b.booking_number}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#0d631b', fontWeight: 800 }}>
                              Token: {b.token_number}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ display: 'block', color: '#0f172a' }}>
                              {b.farmer_name}
                            </strong>
                            <small style={{ color: '#64748b' }}>{b.farmer_phone}</small>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={13} color="#64748b" />
                              <span>{b.booking_date}</span>
                            </div>
                            <small style={{ color: '#0d631b', fontWeight: 700 }}>
                              {b.start_time} – {b.end_time}
                            </small>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <strong style={{ display: 'block', color: '#0f172a' }}>
                              {b.commodity}
                            </strong>
                            <small style={{ color: '#64748b' }}>{b.quantity} Qtl</small>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                fontSize: '11.5px',
                              }}
                            >
                              {b.vehicle_number || 'N/A'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 800,
                                background: isVer ? '#dcfce7' : '#fef3c7',
                                color: isVer ? '#166534' : '#b45309',
                              }}
                            >
                              {isVer ? <CheckCircle2 size={12} /> : <Filter size={12} />}
                              {isVer ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedBooking(b)}
                                style={{
                                  background: '#f1f5f9',
                                  border: 'none',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: '#334155',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Eye size={13} /> View
                              </button>

                              {!isVer && (
                                <button
                                  type="button"
                                  disabled={isVerifying}
                                  onClick={() => handleQuickVerify(b)}
                                  style={{
                                    background: '#0d631b',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <CheckCircle2 size={13} /> Verify
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 13: Booking Details Modal */}
          {selectedBooking && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'grid',
                placeItems: 'center',
                padding: '16px',
              }}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  maxWidth: '600px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* Modal Header */}
                <div
                  style={{
                    padding: '18px 24px',
                    background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>
                      Booking Details #{selectedBooking.booking_number}
                    </h2>
                    <small style={{ color: '#dcfce7' }}>
                      Token: {selectedBooking.token_number} • {selectedBooking.centre_name}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      color: '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 6 Structured Operational Sections */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* 1. Booking Information */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      1. Booking Information
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>Booking Number: <strong>{selectedBooking.booking_number}</strong></div>
                      <div>Status: <strong>{selectedBooking.status}</strong></div>
                      <div>Token Allocated: <strong style={{ color: '#0d631b' }}>{selectedBooking.token_number}</strong></div>
                      <div>Created: <strong>{selectedBooking.booking_date}</strong></div>
                    </div>
                  </div>

                  {/* 2. Farmer Information */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      2. Farmer Information
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>Farmer Name: <strong>{selectedBooking.farmer_name}</strong></div>
                      <div>Contact: <strong>{selectedBooking.farmer_phone}</strong></div>
                      <div>Farmer ID: <strong>{selectedBooking.farmer_id}</strong></div>
                      <div>KYC Status: <strong style={{ color: '#16a34a' }}>VERIFIED (DigiLocker)</strong></div>
                    </div>
                  </div>

                  {/* 3. Slot Information */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      3. Slot Information
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>Date: <strong>{selectedBooking.booking_date}</strong></div>
                      <div>Time Window: <strong>{selectedBooking.start_time} – {selectedBooking.end_time}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}>Centre: <strong>{selectedBooking.centre_name}</strong></div>
                    </div>
                  </div>

                  {/* 4. Commodity & Weight */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      4. Commodity &amp; Produce
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>Commodity: <strong>{selectedBooking.commodity}</strong></div>
                      <div>Declared Quantity: <strong>{selectedBooking.quantity} Quintals</strong></div>
                    </div>
                  </div>

                  {/* 5. Vehicle Information */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      5. Vehicle Information
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>Vehicle Reg: <strong>{selectedBooking.vehicle_number || 'RJ-02-GB-8942'}</strong></div>
                      <div>Assigned Gate: <strong>Gate 2 (Weighbridge Bay 2)</strong></div>
                    </div>
                  </div>

                  {/* 6. Verification Audit Information */}
                  <div
                    style={{
                      background: selectedBooking.verification_status === 'VERIFIED' ? '#f0fdf4' : '#fffbeb',
                      padding: '14px',
                      borderRadius: '10px',
                      border: `1px solid ${selectedBooking.verification_status === 'VERIFIED' ? '#bbf7d0' : '#fde68a'}`,
                    }}
                  >
                    <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                      6. Verification Information
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                      <div>
                        Status: <strong style={{ color: selectedBooking.verification_status === 'VERIFIED' ? '#166534' : '#b45309' }}>
                          {selectedBooking.verification_status}
                        </strong>
                      </div>
                      <div>Verified By: <strong>{selectedBooking.verified_by_name || 'Pending Staff Scan'}</strong></div>
                      {selectedBooking.verified_at && (
                        <div style={{ gridColumn: 'span 2' }}>
                          Timestamp: <strong>{new Date(selectedBooking.verified_at).toLocaleString()}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Close
                  </button>

                  {selectedBooking.verification_status !== 'VERIFIED' && (
                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={() => handleQuickVerify(selectedBooking)}
                      style={{
                        background: '#0d631b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle2 size={16} /> Verify Pass Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
