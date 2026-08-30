import { useState, useEffect, useCallback } from 'react'
import {
  BadgeCheck,
  MapPin,
  Search,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  fetchFarmersDirectory,
  type StaffProfile,
  type FarmerDirectoryItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import StaffSidebar from './StaffSidebar'
import './StaffQRScannerPage.css'

export default function StaffFarmersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [staff, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [farmers, setFarmers] = useState<FarmerDirectoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadFarmers = useCallback(async () => {
    setIsLoading(true)
    const currentStaff = getStaffAuthSession()
    setStaff(currentStaff)
    const list = await fetchFarmersDirectory(currentStaff.centre_id, searchQuery)
    setFarmers(list)
    setIsLoading(false)
  }, [searchQuery])

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/staff/farmers')
      navigate('/staff/login')
      return
    }
    loadFarmers()
  }, [loadFarmers])

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <StaffSidebar
        activeTab="farmers"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Registered Farmers Directory"
        />

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              APMC Farmers Directory
            </h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              KYC-verified farmers associated with {staff.centre_name}
            </p>
          </div>

          {/* Search Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search farmer by full name, Farmer ID (KS-FARM-...) or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px 0 36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Farmers Table */}
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
                    <th style={{ padding: '12px 16px' }}>Farmer ID &amp; Name</th>
                    <th style={{ padding: '12px 16px' }}>Village / Tehsil</th>
                    <th style={{ padding: '12px 16px' }}>Contact Number</th>
                    <th style={{ padding: '12px 16px' }}>Total Bookings</th>
                    <th style={{ padding: '12px 16px' }}>Gate Cleared</th>
                    <th style={{ padding: '12px 16px' }}>Last Visit</th>
                    <th style={{ padding: '12px 16px' }}>KYC Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Loading farmers directory...
                      </td>
                    </tr>
                  ) : farmers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No farmer profiles found matching "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    farmers.map((f) => (
                      <tr key={f.farmer_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <strong style={{ display: 'block', color: '#0f172a' }}>{f.name}</strong>
                          <span style={{ fontSize: '11px', color: '#0d631b', fontWeight: 800 }}>
                            {f.farmer_id}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="#64748b" />
                            <span>{f.village}, {f.district}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                          {f.mobile}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                          {f.totalBookings} Batches
                        </td>
                        <td style={{ padding: '14px 16px', color: '#16a34a', fontWeight: 700 }}>
                          {f.verifiedBookings} Verified
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>
                          {f.lastVisit}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              background: '#dcfce7',
                              color: '#166534',
                            }}
                          >
                            <BadgeCheck size={13} /> {f.kycStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
