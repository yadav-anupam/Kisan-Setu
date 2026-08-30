import { useState } from 'react'
import {
  ArrowRight,
  Calculator,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Headphones,
  Landmark,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Ticket,
  XCircle,
} from 'lucide-react'
import Navbar from '../../Navbar'
import Footer from '../../Footer'
import { navigate } from '../../router'
import { useLanguage } from '../../useLanguage'
import './ForFarmersPage.css'

const benefitIcons = [CalendarCheck, Ticket, Scale, Landmark, FileCheck2, Headphones]

const MSP_RATES: Record<string, { name: string; rate: number }> = {
  wheat: { name: 'Wheat (गेहूं) - RMS 2026-27', rate: 2425 },
  paddy_common: { name: 'Paddy Common (धान सामान्य) - KMS 2026-27', rate: 2300 },
  paddy_grade_a: { name: 'Paddy Grade A (धान ग्रेड-ए)', rate: 2320 },
  mustard: { name: 'Mustard / Rapeseed (सरसों)', rate: 5950 },
  gram: { name: 'Gram / Chana (चना)', rate: 5650 },
  soybean: { name: 'Soybean (सोयाबीन)', rate: 4892 },
  cotton: { name: 'Cotton Medium Staple (कपास)', rate: 7121 },
}

export default function ForFarmersPage() {
  const { t } = useLanguage()
  const [selectedCrop, setSelectedCrop] = useState('wheat')
  const [quantity, setQuantity] = useState<number>(50)

  const f = t.forFarmers
  const currentCropObj = MSP_RATES[selectedCrop] || MSP_RATES.wheat
  const totalPayout = (currentCropObj.rate * quantity).toLocaleString('en-IN')

  return (
    <div className="farmers-page">
      <Navbar activePath="/for-farmers" />

      <main>
        {/* Hero Section */}
        <section className="farmers-hero">
          <span className="farmers-kicker">
            <Sparkles size={14} /> {f.kicker}
          </span>
          <h1>
            {f.title1} <em>{f.title2}</em>
          </h1>
          <p>{f.desc}</p>

          <div className="farmers-hero-badges">
            <div className="farmers-badge">
              <CalendarCheck size={16} /> {f.badges.slots}
            </div>
            <div className="farmers-badge">
              <ShieldCheck size={16} /> {f.badges.msp}
            </div>
            <div className="farmers-badge">
              <Scale size={16} /> {f.badges.scale}
            </div>
            <div className="farmers-badge">
              <CircleDollarSign size={16} /> {f.badges.dbt}
            </div>
          </div>
        </section>

        {/* Core Benefits */}
        <section className="farmers-benefits-section">
          <div className="farmers-container">
            <div className="farmers-section-header">
              <h2>{f.benefitsHeading}</h2>
              <p>{f.benefitsSub}</p>
            </div>

            <div className="farmers-benefits-grid">
              {f.benefits.map((item, index) => {
                const BenefitIcon = benefitIcons[index % benefitIcons.length]
                return (
                  <article className="farmer-benefit-card" key={item.title}>
                    <div className="farmer-benefit-icon">
                      <BenefitIcon size={24} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* Traditional Mandi vs Kisan Setu Comparison */}
        <section className="farmers-container" style={{ padding: '80px 4%' }}>
          <div className="farmers-section-header">
            <h2>{f.comparisonHeading}</h2>
            <p>{f.comparisonSub}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '24px', padding: '36px 30px' }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 800, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px' }}>
                <XCircle size={22} color="#dc2626" /> {f.traditionalTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {f.traditionalPoints.map((pt) => (
                  <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14.5px', color: '#7f1d1d', lineHeight: 1.5 }}>
                    <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '2px solid #86efac', borderRadius: '24px', padding: '36px 30px' }}>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '20px', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 20px' }}>
                <CheckCircle2 size={22} color="#16a34a" /> {f.kisanSetuTitle}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {f.kisanSetuPoints.map((pt) => (
                  <div key={pt} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14.5px', color: '#14532d', lineHeight: 1.5 }}>
                    <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#16a34a' }} />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive MSP Calculator */}
        <section className="farmers-calc-section">
          <div className="farmers-section-header">
            <h2>{f.calcHeading}</h2>
            <p>{f.calcSub}</p>
          </div>

          <div className="calc-card">
            <div className="calc-inputs">
              <div className="calc-field">
                <label>{f.calcCropLabel}</label>
                <select
                  className="calc-select"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                >
                  {Object.entries(MSP_RATES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} (₹{info.rate} / Qtl)
                    </option>
                  ))}
                </select>
              </div>

              <div className="calc-field">
                <label>{f.calcQtyLabel}</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="calc-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '13px', fontWeight: 600 }}>
                <Calculator size={16} /> Official Gazette Minimum Support Price (MSP) 2026-27
              </div>
            </div>

            <div className="calc-results-box">
              <div className="calc-result-item">
                <span>{f.calcMspRateLabel}:</span>
                <strong>₹ {currentCropObj.rate} / Quintal</strong>
              </div>
              <div className="calc-result-item">
                <span>{f.calcQtyLabel}:</span>
                <strong>{quantity} Quintals</strong>
              </div>
              <div className="calc-result-payout">
                <small>{f.calcTotalPayoutLabel}</small>
                <strong>₹ {totalPayout}</strong>
              </div>
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#dcfce7' }}>
                <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} /> {f.calcDbtLabel}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="farmers-cta-section">
          <div className="farmers-cta-box">
            <h2>{f.ctaTitle}</h2>
            <p>{f.ctaDesc}</p>
            <button
              className="hero-primary"
              onClick={() => navigate('/farmer-dashboard')}
              style={{ cursor: 'pointer', border: 'none', margin: '0 auto' }}
            >
              {f.ctaBookSlot} <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
