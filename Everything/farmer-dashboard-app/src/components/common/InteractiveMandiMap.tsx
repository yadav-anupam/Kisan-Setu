import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import {
  MapPin,
  Search,
  Crosshair,
} from 'lucide-react'
import {
  type MandiLocationRecord,
  searchAddressNominatim,
  reverseGeocodeNominatim,
  formatApproxDistance,
  getGoogleMapsDirectionsUrl,
  calculateHaversineDistanceKm,
} from '../../services/mandiLocationService'

// Custom SVG HTML Icons for Leaflet to ensure zero asset path issues
function createSvgPin(color: string, label: string = '', pulse: boolean = false): L.DivIcon {
  const pulseClass = pulse ? 'animate-ping' : ''
  const html = `
    <div style="position: relative; width: 34px; height: 42px; display: flex; align-items: center; justify-content: center;">
      ${
        pulse
          ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}; opacity: 0.3; transform: scale(1.4); animation: pulse 1.8s infinite;" class="${pulseClass}"></div>`
          : ''
      }
      <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 0C7.61116 0 0 7.61116 0 17C0 27.5 17 42 17 42C17 42 34 27.5 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}" filter="drop-shadow(0 3px 6px rgba(0,0,0,0.3))"/>
        <circle cx="17" cy="17" r="8" fill="#ffffff"/>
        ${
          label
            ? `<text x="17" y="21" font-size="9" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle">${label}</text>`
            : `<circle cx="17" cy="17" r="4.5" fill="${color}"/>`
        }
      </svg>
    </div>
  `
  return L.divIcon({
    html,
    className: 'custom-mandi-marker',
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  })
}

function createFarmerLocationPin(): L.DivIcon {
  const html = `
    <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #2563eb; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 16px; height: 16px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>
    </div>
  `
  return L.divIcon({
    html,
    className: 'custom-farmer-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

export interface InteractiveMandiMapProps {
  mode: 'picker' | 'directory'
  // Picker mode props
  latitude?: number
  longitude?: number
  onLocationChange?: (lat: number, lng: number, addressDetails?: any) => void
  pickerTitle?: string
  // Directory mode props
  mandis?: MandiLocationRecord[]
  selectedMandiCode?: string
  onSelectMandi?: (mandi: MandiLocationRecord) => void
  onBookSlot?: (mandi: MandiLocationRecord) => void
  onEditMandi?: (mandi: MandiLocationRecord) => void
  onVerifyMandi?: (mandi: MandiLocationRecord) => void
  farmerLocation?: { lat: number; lng: number } | null
  height?: string
  showSearch?: boolean
}

export default function InteractiveMandiMap({
  mode,
  latitude = 25.3176,
  longitude = 82.9739,
  onLocationChange,
  pickerTitle = 'Drag marker to Mandi Entrance Gate',
  mandis = [],
  selectedMandiCode,
  onSelectMandi,
  onBookSlot,
  onEditMandi: _onEditMandi,
  onVerifyMandi: _onVerifyMandi,
  farmerLocation,
  height = '480px',
  showSearch = true,
}: InteractiveMandiMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const pickerMarkerRef = useRef<L.Marker | null>(null)
  const directoryMarkersRef = useRef<Map<string, L.Marker>>(new Map())
  const farmerMarkerRef = useRef<L.Marker | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [locatingUser, setLocatingUser] = useState(false)
  const [activeAddressMsg, setActiveAddressMsg] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const initialCenter: [number, number] =
      mode === 'picker'
        ? [latitude || 25.3176, longitude || 82.9739]
        : farmerLocation
        ? [farmerLocation.lat, farmerLocation.lng]
        : mandis.length > 0
        ? [mandis[0].latitude, mandis[0].longitude]
        : [25.3176, 82.9739]

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: mode === 'picker' ? 14 : 11,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    // Standard OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors | Kisan Setu Geospatial',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Handle Picker Mode Marker & Click Placement
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || mode !== 'picker') return

    const lat = latitude || 25.3176
    const lng = longitude || 82.9739

    if (!pickerMarkerRef.current) {
      const pin = createSvgPin('#10b981', 'GATE', true)
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: pin,
        title: 'Mandi Entrance Gate',
      }).addTo(map)

      marker.bindTooltip('Mandi Entrance Gate (Drag to adjust)', {
        permanent: true,
        direction: 'top',
        offset: [0, -38],
      })

      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        handlePickerMove(pos.lat, pos.lng)
      })

      pickerMarkerRef.current = marker

      // Allow clicking map to place marker
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        handlePickerMove(e.latlng.lat, e.latlng.lng)
      })
    } else {
      const currentPos = pickerMarkerRef.current.getLatLng()
      if (
        Math.abs(currentPos.lat - lat) > 0.0001 ||
        Math.abs(currentPos.lng - lng) > 0.0001
      ) {
        pickerMarkerRef.current.setLatLng([lat, lng])
        map.panTo([lat, lng])
      }
    }
  }, [mode, latitude, longitude])

  const handlePickerMove = async (lat: number, lng: number) => {
    setActiveAddressMsg(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)} — Resolving address...`)
    try {
      const reverse = await reverseGeocodeNominatim(lat, lng)
      if (reverse) {
        setActiveAddressMsg(`${reverse.fullAddress}`)
        onLocationChange?.(lat, lng, reverse)
      } else {
        setActiveAddressMsg(`Gate Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        onLocationChange?.(lat, lng)
      }
    } catch {
      setActiveAddressMsg(`Gate Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      onLocationChange?.(lat, lng)
    }
  }

  // Handle Directory Mode Markers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || mode !== 'directory') return

    // Clear previous markers
    directoryMarkersRef.current.forEach((marker) => marker.remove())
    directoryMarkersRef.current.clear()

    const bounds = L.latLngBounds([])

    mandis.forEach((mandi) => {
      if (!mandi.latitude || !mandi.longitude) return

      const isVerified = mandi.verification_status === 'VERIFIED'
      const isRejected = mandi.verification_status === 'REJECTED'
      const pinColor = isVerified ? '#16a34a' : isRejected ? '#dc2626' : '#f59e0b'
      const pinIcon = createSvgPin(pinColor, isVerified ? '✓' : isRejected ? '✗' : '!')

      const marker = L.marker([mandi.latitude, mandi.longitude], {
        icon: pinIcon,
        title: mandi.name,
      }).addTo(map)

      // Calculate distance if farmer location is provided
      let distText = ''
      let distKm = 0
      if (farmerLocation) {
        distKm = calculateHaversineDistanceKm(
          farmerLocation.lat,
          farmerLocation.lng,
          mandi.latitude,
          mandi.longitude
        )
        distText = formatApproxDistance(distKm)
      }

      const directionsUrl = getGoogleMapsDirectionsUrl(
        mandi.latitude,
        mandi.longitude,
        farmerLocation?.lat,
        farmerLocation?.lng
      )

      // Rich Leaflet Popup Card
      const popupHtml = `
        <div style="font-family: inherit; min-width: 240px; max-width: 280px; padding: 4px 2px;">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <h4 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.3;">
              ${mandi.name}
            </h4>
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; text-transform: uppercase; white-space: nowrap; ${
              isVerified
                ? 'background: #dcfce7; color: #15803d;'
                : isRejected
                ? 'background: #fee2e2; color: #b91c1c;'
                : 'background: #fef3c7; color: #b45309;'
            }">
              ${mandi.verification_status.replace('_', ' ')}
            </span>
          </div>

          <p style="font-size: 11px; color: #475569; margin: 0 0 4px 0; line-height: 1.4;">
            📍 <strong>Address:</strong> ${mandi.address || mandi.city_or_village + ', ' + mandi.district}
          </p>

          ${
            mandi.landmark
              ? `<p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">🏛️ <strong>Landmark:</strong> ${mandi.landmark}</p>`
              : ''
          }

          ${
            distText
              ? `<div style="background: #eff6ff; color: #1e40af; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; display: inline-flex; align-items: center; gap: 4px;">
                  🚗 ${distText}
                </div>`
              : ''
          }

          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px; border-top: 1px solid #f1f5f9; padding-top: 8px;">
            <a 
              href="${directionsUrl}" 
              target="_blank" 
              rel="noreferrer" 
              style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #0f172a; color: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none; text-align: center;"
            >
              Get GPS Directions ↗
            </a>
            <button 
              id="mandi-popup-book-${mandi.centre_code}"
              style="display: flex; align-items: center; justify-content: center; gap: 6px; background: #16a34a; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; text-align: center;"
            >
              Book Slot at this Mandi
            </button>
          </div>
        </div>
      `

      const popup = L.popup({ maxWidth: 300 }).setContent(popupHtml)
      marker.bindPopup(popup)

      popup.on('add', () => {
        const bookBtn = document.getElementById(`mandi-popup-book-${mandi.centre_code}`)
        if (bookBtn) {
          bookBtn.onclick = () => {
            onBookSlot?.(mandi)
          }
        }
      })

      marker.on('click', () => {
        onSelectMandi?.(mandi)
      })

      bounds.extend([mandi.latitude, mandi.longitude])
      directoryMarkersRef.current.set(mandi.centre_code, marker)
    })

    // Fit bounds if markers exist and no specific selected mandi
    if (mandis.length > 0 && !selectedMandiCode) {
      if (farmerLocation) bounds.extend([farmerLocation.lat, farmerLocation.lng])
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [mode, mandis, farmerLocation, selectedMandiCode, onBookSlot, onSelectMandi])

  // Center on selected mandi if provided
  useEffect(() => {
    if (!selectedMandiCode || !mapInstanceRef.current) return
    const marker = directoryMarkersRef.current.get(selectedMandiCode)
    if (marker) {
      const latlng = marker.getLatLng()
      mapInstanceRef.current.setView(latlng, 15, { animate: true })
      marker.openPopup()
    }
  }, [selectedMandiCode])

  // Render Farmer Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (farmerMarkerRef.current) {
      farmerMarkerRef.current.remove()
      farmerMarkerRef.current = null
    }

    if (farmerLocation) {
      const marker = L.marker([farmerLocation.lat, farmerLocation.lng], {
        icon: createFarmerLocationPin(),
        title: 'Your Current Location',
        zIndexOffset: 1000,
      }).addTo(map)

      marker.bindTooltip('📍 Your Current Location', {
        permanent: false,
        direction: 'top',
        offset: [0, -14],
      })

      farmerMarkerRef.current = marker
    }
  }, [farmerLocation])

  // Address Search Autocomplete
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchQuery(val)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (!val || val.trim().length < 3) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    const timer = setTimeout(async () => {
      try {
        const results = await searchAddressNominatim(val, controller.signal)
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }

  const handleSelectSearchResult = (res: any) => {
    setSearchResults([])
    setSearchQuery(res.display_name)
    const map = mapInstanceRef.current
    if (!map) return

    map.setView([res.lat, res.lon], 16, { animate: true })

    if (mode === 'picker' && pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([res.lat, res.lon])
      handlePickerMove(res.lat, res.lon)
    }
  }

  // Current GPS Geolocation Trigger
  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false)
        const { latitude: userLat, longitude: userLng } = pos.coords
        const map = mapInstanceRef.current
        if (!map) return

        map.setView([userLat, userLng], 16, { animate: true })

        if (mode === 'picker' && pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([userLat, userLng])
          handlePickerMove(userLat, userLng)
        }
      },
      (err) => {
        setLocatingUser(false)
        console.warn('Geolocation permission error:', err.message)
        alert('Could not acquire your location. Please check browser GPS permissions.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    )
  }, [mode])

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      {/* Map Search & Control Overlay */}
      {showSearch && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 56,
            zIndex: 1000,
            maxWidth: '420px',
          }}
        >
          <div
            style={{
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '8px',
              background: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', gap: '8px' }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder={mode === 'picker' ? 'Search official address or village...' : 'Search mandis on map...'}
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  background: 'transparent',
                }}
              />
              {isSearching && (
                <div style={{ width: 14, height: 14, border: '2px solid #cbd5e1', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
            </div>

            {/* Autocomplete dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  background: '#ffffff',
                  borderTop: '1px solid #f1f5f9',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((res) => (
                  <button
                    key={res.place_id}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#334155',
                      border: 'none',
                      borderBottom: '1px solid #f8fafc',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <MapPin size={14} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {res.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GPS Current Location Control Button */}
      <button
        type="button"
        title="Locate with device GPS"
        onClick={handleUseCurrentLocation}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          color: locatingUser ? '#16a34a' : '#1e293b',
        }}
      >
        <Crosshair size={18} />
      </button>

      {/* Picker Guidance Banner */}
      {mode === 'picker' && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#34d399" />
            <span>{activeAddressMsg || pickerTitle}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Click map or drag pin
          </span>
        </div>
      )}

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
