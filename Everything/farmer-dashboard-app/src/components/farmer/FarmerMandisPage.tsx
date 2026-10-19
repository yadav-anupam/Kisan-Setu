import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  MapPin,
  Search,
  Navigation,
  ShieldCheck,
  CalendarCheck,
  Crosshair,
  Compass,
  Clock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { navigate } from '../../router'
import FarmerHeader from './FarmerHeader'
import FarmerSidebar from './FarmerSidebar'
import InteractiveMandiMap from '../common/InteractiveMandiMap'
import {
  getAllMandiLocations,
  calculateHaversineDistanceKm,
  formatApproxDistance,
  getGoogleMapsDirectionsUrl,
  type MandiLocationRecord,
} from '../../services/mandiLocationService'
import './FarmerDashboard.css'

export default function FarmerMandisPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mandis, setMandis] = useState<MandiLocationRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [selectedMandiCode, setSelectedMandiCode] = useState<string | undefined>(undefined)
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split')

  // GPS User Location
  const [farmerCoords, setFarmerCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Load Mandis
  const loadMandis = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllMandiLocations({ activeOnly: true })
      setMandis(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMandis()
    const handleUpdate = () => loadMandis()
    window.addEventListener('kisan_setu_mandis_updated', handleUpdate)
    return () => window.removeEventListener('kisan_setu_mandis_updated', handleUpdate)
  }, [loadMandis])

  // Request Farmer GPS Location (Permission-Gated)
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your device or browser.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false)
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setFarmerCoords(coords)
      },
      (err) => {
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError(
            'Location permission was denied. You can still search mandis by district or PIN code above.'
          )
        } else {
          setLocationError('Unable to retrieve your GPS location. Please try again or search manually.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }

  // Filter & Sort Mandis (sorted by proximity if farmerCoords available)
  const filteredAndSortedMandis = useMemo(() => {
    let result = mandis.filter((m) => {
      // Mandi must be active
      if (!m.is_active) return false

      // Verified only condition (farmers see officially verified locations by default)
      if (verifiedOnly && m.verification_status !== 'VERIFIED') return false

      // District filter
      if (selectedDistrict !== 'ALL' && m.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false
      }

      // Search query filter (matches name, code, tehsil, village, pincode, landmark)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = m.name.toLowerCase().includes(q)
        const matchCode = m.centre_code.toLowerCase().includes(q)
        const matchTehsil = m.city_or_village.toLowerCase().includes(q)
        const matchDistrict = m.district.toLowerCase().includes(q)
        const matchPincode = m.pincode.includes(q)
        const matchLandmark = (m.landmark || '').toLowerCase().includes(q)
        const matchAddress = m.address.toLowerCase().includes(q)
        return (
          matchName ||
          matchCode ||
          matchTehsil ||
          matchDistrict ||
          matchPincode ||
          matchLandmark ||
          matchAddress
        )
      }

      return true
    })

    // If farmer location is permitted, compute distance and sort by closest
    if (farmerCoords) {
      return result.map((m) => {
        const distKm = calculateHaversineDistanceKm(
          farmerCoords.lat,
          farmerCoords.lng,
          m.latitude,
          m.longitude
        )
        return { ...m, computedDistanceKm: distKm }
      }).sort((a, b) => (a.computedDistanceKm ?? 9999) - (b.computedDistanceKm ?? 9999))
    }

    return result
  }, [mandis, verifiedOnly, selectedDistrict, searchQuery, farmerCoords])

  // Handle direct slot booking from mandi card
  const handleBookSlotAtMandi = (mandi: MandiLocationRecord) => {
    sessionStorage.setItem('kisan_setu_preselected_centre', mandi.centre_code)
    sessionStorage.setItem('kisan_setu_preselected_centre_name', mandi.name)
    navigate('/my-appointments')
  }

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <FarmerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activePage="appointments"
      />

      <div className="fd-main-content">
        <FarmerHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Verified Mandis &amp; Procurement Centres"
        />

        <main style={{ padding: '24px 20px', maxWidth: '1360px', margin: '0 auto' }}>
          {/* Top Banner & GPS Prompt */}
          <div
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(6, 78, 59, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={14} color="#86efac" /> Geotagged Government Gate Registry
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.25 }}>
                Find Nearby Verified Procurement Centres
              </h1>
              <p style={{ fontSize: '13.5px', margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
                Locate officially verified APMC mandi gates with verified GPS coordinates, weighbridge entrances, and real-time distance calculations for hassle-free crop delivery.
              </p>
            </div>

            {/* GPS Location Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={isLocating}
                style={{
                  background: farmerCoords ? '#ffffff' : '#f0fdf4',
                  color: farmerCoords ? '#065f46' : '#166534',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontWeight: 800,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isLocating ? 'wait' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Crosshair size={18} color="#059669" className={isLocating ? 'animate-spin' : ''} />
                {isLocating
                  ? 'Detecting GPS Location...'
                  : farmerCoords
                  ? 'GPS Location Active (Sorted by Distance)'
                  : 'Find Mandis Near My Location'}
              </button>

              <span style={{ fontSize: '11px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Distance is approximate straight-line. Never tracked in background.
              </span>
            </div>
          </div>

          {locationError && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <span>{locationError}</span>
            </div>
          )}

          {/* Search, Filter & Layout Controls */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search by mandi name, village, tehsil, or PIN code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 14px 0 40px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="ALL">All Districts</option>
                <option value="Varanasi">Varanasi</option>
                <option value="Chandauli">Chandauli</option>
                <option value="Ghazipur">Ghazipur</option>
                <option value="Jaunpur">Jaunpur</option>
              </select>

              {/* Verified Filter Checkbox */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#15803d',
                  background: '#f0fdf4',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ accentColor: '#16a34a', cursor: 'pointer' }}
                />
                <ShieldCheck size={16} /> Verified Mandis Only
              </label>

              {/* View Mode Switcher */}
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  borderRadius: '10px',
                  padding: '3px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  style={{
                    border: 'none',
                    background: viewMode === 'split' ? '#ffffff' : 'transparent',
                    color: viewMode === 'split' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'split' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Split View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    border: 'none',
                    background: viewMode === 'list' ? '#ffffff' : 'transparent',
                    color: viewMode === 'list' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Cards Only
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  style={{
                    border: 'none',
                    background: viewMode === 'map' ? '#ffffff' : 'transparent',
                    color: viewMode === 'map' ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Map Only
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            <span>
              Showing <strong style={{ color: '#0f172a' }}>{filteredAndSortedMandis.length}</strong>{' '}
              procurement {filteredAndSortedMandis.length === 1 ? 'centre' : 'centres'}
              {farmerCoords && ' ordered by proximity'}
            </span>
            {farmerCoords && (
              <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crosshair size={14} /> Distances calculated using current GPS coordinates
              </span>
            )}
          </div>

          {/* Main Layout Container */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #cbd5e1',
                  borderTopColor: '#16a34a',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ fontWeight: 600 }}>Loading verified mandi locations...</p>
            </div>
          ) : filteredAndSortedMandis.length === 0 ? (
            /* Clear Empty State (Requirement 4) */
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '48px 24px',
                textAlign: 'center',
                maxWidth: '600px',
                margin: '20px auto',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <MapPin size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                No Verified Mandis Found
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px' }}>
                We couldn't find any active, officially verified procurement centres matching your current filter. Try resetting your search or selecting a different district.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDistrict('ALL')
                  setVerifiedOnly(false)
                }}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  viewMode === 'map'
                    ? '1fr'
                    : viewMode === 'list'
                    ? '1fr'
                    : 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '24px',
                alignItems: 'start',
              }}
            >
              {/* Left Column: Interactive Leaflet Map */}
              {(viewMode === 'split' || viewMode === 'map') && (
                <div
                  style={{
                    position: viewMode === 'split' ? 'sticky' : 'relative',
                    top: viewMode === 'split' ? '20px' : 'auto',
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '12px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    height: viewMode === 'map' ? '680px' : '560px',
                  }}
                >
                  <InteractiveMandiMap
                    mode="directory"
                    mandis={filteredAndSortedMandis}
                    selectedMandiCode={selectedMandiCode}
                    farmerLocation={farmerCoords}
                    height="100%"
                    showSearch={false}
                    onSelectMandi={(m) => setSelectedMandiCode(m.centre_code)}
                    onBookSlot={handleBookSlotAtMandi}
                  />
                </div>
              )}

              {/* Right Column: Mandi Cards List */}
              {(viewMode === 'split' || viewMode === 'list') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredAndSortedMandis.map((mandi) => {
                    const isSelected = selectedMandiCode === mandi.centre_code
                    const isVerified = mandi.verification_status === 'VERIFIED'
                    const distKm = farmerCoords
                      ? calculateHaversineDistanceKm(
                          farmerCoords.lat,
                          farmerCoords.lng,
                          mandi.latitude,
                          mandi.longitude
                        )
                      : null
                    const directionsUrl = getGoogleMapsDirectionsUrl(
                      mandi.latitude,
                      mandi.longitude,
                      farmerCoords?.lat,
                      farmerCoords?.lng
                    )

                    return (
                      <div
                        key={mandi.id}
                        id={`mandi-card-${mandi.centre_code}`}
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid #16a34a' : '1px solid #e2e8f0',
                          padding: '20px',
                          boxShadow: isSelected
                            ? '0 6px 20px rgba(22, 163, 74, 0.15)'
                            : '0 2px 8px rgba(0,0,0,0.03)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Header: Name, Agency & Verified Badge */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span
                                style={{
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  border: '1px solid #bfdbfe',
                                }}
                              >
                                {mandi.agency || 'FCS'} • {mandi.centre_code.toUpperCase()}
                              </span>

                              {isVerified ? (
                                <span
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    border: '1px solid #bbf7d0',
                                  }}
                                  title="Physical GPS gate verified by APMC authorities"
                                >
                                  <ShieldCheck size={12} /> Verified Location
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Pending Verification
                                </span>
                              )}
                            </div>

                            <h3
                              style={{
                                fontSize: '16px',
                                fontWeight: 800,
                                color: '#0f172a',
                                margin: 0,
                                lineHeight: 1.3,
                              }}
                            >
                              {mandi.name}
                            </h3>
                          </div>

                          {/* Distance Pill if GPS Active */}
                          {distKm !== null && (
                            <div
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '10px',
                                padding: '6px 12px',
                                textAlign: 'right',
                                flexShrink: 0,
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: 800, color: '#166534' }}>
                                {formatApproxDistance(distKm)}
                              </div>
                              <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 600 }}>
                                Approx. straight-line
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Address & Landmark Details */}
                        <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                          <p style={{ margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <MapPin size={15} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>
                              {mandi.address || `${mandi.city_or_village}, ${mandi.district}`} (PIN: {mandi.pincode})
                            </span>
                          </p>

                          {mandi.landmark && (
                            <p style={{ margin: '0 0 4px', paddingLeft: '21px', color: '#64748b', fontSize: '12px' }}>
                              <strong>Landmark:</strong> {mandi.landmark}
                            </p>
                          )}

                          <p style={{ margin: 0, paddingLeft: '21px', color: '#64748b', fontSize: '12px' }}>
                            <strong>Accepted Commodities:</strong> {mandi.crops || 'Paddy / Wheat / Pulses'}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '10px',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '14px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {/* View on Map Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMandiCode(mandi.centre_code)
                                if (viewMode === 'list') setViewMode('split')
                              }}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Compass size={14} /> View on Map
                            </button>

                            {/* External Turn-by-Turn GPS Navigation */}
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                background: '#0f172a',
                                color: '#ffffff',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '12px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <Navigation size={14} color="#38bdf8" /> Get Directions <ExternalLink size={12} />
                            </a>
                          </div>

                          {/* Direct Slot Booking Action */}
                          <button
                            type="button"
                            onClick={() => handleBookSlotAtMandi(mandi)}
                            style={{
                              background: 'linear-gradient(135deg, #075a27 0%, #0d631b 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(13, 99, 27, 0.25)',
                            }}
                          >
                            <CalendarCheck size={15} /> Book Slot at this Mandi
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
