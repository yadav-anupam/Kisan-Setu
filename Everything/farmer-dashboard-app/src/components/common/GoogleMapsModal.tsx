import React from 'react'
import { MapPin, Navigation, ExternalLink, X, ShieldCheck, Truck, Scale, Compass } from 'lucide-react'

export interface GoogleMapsModalProps {
  isOpen: boolean
  onClose: () => void
  centreName: string
  address?: string
  district?: string
  blockTehsil?: string
  agency?: string
}

export const GoogleMapsModal: React.FC<GoogleMapsModalProps> = ({
  isOpen,
  onClose,
  centreName,
  address,
  district = 'Uttar Pradesh',
  blockTehsil,
  agency,
}) => {
  if (!isOpen) return null

  // Format accurate query for Google Maps embed and navigation
  const fullAddress = `${centreName}, ${address || ''}, ${blockTehsil ? blockTehsil + ', ' : ''}${district}, Uttar Pradesh, India`
  const searchQuery = encodeURIComponent(fullAddress)
  const embedUrl = `https://maps.google.com/maps?q=${searchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`

  return (
    <div className="fd-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="fd-modal-card" style={{ maxWidth: '680px', width: '92vw', padding: '20px' }}>
        {/* Header */}
        <div className="fd-modal-header" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#dcfce7',
                color: '#16a34a',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'Manrope', fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Centre Location &amp; Mandi Route
              </h2>
              <small style={{ fontSize: '11px', color: '#64748b' }}>
                Google Maps GPS Navigation &amp; Gate Access
              </small>
            </div>
          </div>
          <button
            type="button"
            className="fd-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Centre Details Banner */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700, fontSize: '13px' }}>
              <MapPin size={15} color="#16a34a" /> {centreName}
            </div>
            <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '2px' }}>
              📍 {address || 'Mandi Yard'}, {district} {agency ? `• Agency: ${agency}` : ''}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-card-btn primary"
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none',
              }}
            >
              <Navigation size={13} /> Start GPS Directions
            </a>

            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fd-card-btn secondary"
              style={{
                padding: '6px 10px',
                fontSize: '11.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={13} /> Open App
            </a>
          </div>
        </div>

        {/* Live Embedded Google Maps View */}
        <div
          style={{
            width: '100%',
            height: '280px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1.5px solid #e2e8f0',
            position: 'relative',
            background: '#f8fafc',
            marginBottom: '14px',
          }}
        >
          <iframe
            title={`Google Map - ${centreName}`}
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Gate Traffic Flow & Yard Protocol */}
        <div
          style={{
            background: '#f8faf8',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#1e293b' }}>
            <ShieldCheck size={16} color="#16a34a" style={{ flexShrink: 0 }} />
            <div><strong>Gate 1 In:</strong> QR Gate Pass</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#1e293b' }}>
            <Truck size={16} color="#0d631b" style={{ flexShrink: 0 }} />
            <div><strong>Lane 2:</strong> Quality Assay</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: '#1e293b' }}>
            <Scale size={16} color="#16a34a" style={{ flexShrink: 0 }} />
            <div><strong>Scale Bay:</strong> Gross &amp; Tare</div>
          </div>
        </div>

        {/* Close CTA */}
        <button
          type="button"
          className="fd-card-btn secondary"
          style={{ width: '100%', padding: '10px' }}
          onClick={onClose}
        >
          Close Map View
        </button>
      </div>
    </div>
  )
}
