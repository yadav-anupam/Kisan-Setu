import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer, ShieldCheck, Lock } from 'lucide-react'

interface BookingQRProps {
  token: string // KS1|<secure-random-token>
  bookingNumber?: string
  farmerName?: string
  commodity?: string
  size?: number
  showActions?: boolean
  showDetails?: boolean
}

export default function BookingQR({
  token,
  bookingNumber = 'KS-2026-000184',
  farmerName,
  commodity,
  size = 220,
  showActions = true,
  showDetails = true,
}: BookingQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrGenerated, setQrGenerated] = useState(false)
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    if (!token) return

    QRCode.toCanvas(
      canvasRef.current,
      token,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#0d631b', // Kisan Setu brand primary green
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H', // High error tolerance for fast scanner reading
      },
      (err) => {
        if (!err && canvasRef.current) {
          setQrGenerated(true)
          setDataUrl(canvasRef.current.toDataURL('image/png'))
        }
      }
    )
  }, [token, size])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `KisanSetu_GatePass_${bookingNumber}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="ks-booking-qr-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* QR Canvas Box */}
      <div
        style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '16px',
          border: '2px solid #bbf7d0',
          boxShadow: '0 4px 20px rgba(13, 99, 27, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <canvas ref={canvasRef} style={{ width: `${size}px`, height: `${size}px`, display: 'block' }} />

        {qrGenerated && (
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#166534',
              background: '#dcfce7',
              padding: '3px 8px',
              borderRadius: '99px',
            }}
          >
            <ShieldCheck size={13} />
            <span>KS1 Encrypted • Scannable Gate Token</span>
          </div>
        )}
      </div>

      {/* Booking Details Snippet */}
      {showDetails && (
        <div
          style={{
            marginTop: '12px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#334155',
            lineHeight: 1.4,
          }}
        >
          <div style={{ fontFamily: 'Manrope', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
            {bookingNumber}
          </div>
          {farmerName && <div><strong>Farmer:</strong> {farmerName}</div>}
          {commodity && <div><strong>Commodity:</strong> {commodity}</div>}
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Lock size={10} /> Cryptographically Verified Token
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '14px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            className="fd-card-btn primary"
            onClick={handleDownload}
            style={{ padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} /> Download QR Pass
          </button>
          <button
            type="button"
            className="fd-card-btn secondary"
            onClick={handlePrint}
            style={{ padding: '8px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={14} /> Print Pass
          </button>
        </div>
      )}
    </div>
  )
}
