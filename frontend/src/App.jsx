import { useMemo, useState } from 'react'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001' : '')
).replace(/\/$/, '')

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant', multiple: 2.1 },
  { value: 'service', label: 'Service Business', multiple: 2.8 },
  { value: 'retail', label: 'Retail Store', multiple: 2.2 },
  { value: 'ecommerce', label: 'E-commerce', multiple: 3.1 },
  { value: 'manufacturing', label: 'Manufacturing', multiple: 3.3 },
  { value: 'professional', label: 'Professional Practice', multiple: 3.0 },
]

const initialForm = {
  businessType: 'service',
  annualRevenue: '',
  annualProfit: '',
  yearsOperating: '',
  ownerHours: 'full',
  revenueTrend: 'stable',
  assets: '',
  name: '',
  email: '',
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const numberValue = (value) => Number(value || 0)

function getValuation(form) {
  const type = businessTypes.find((item) => item.value === form.businessType) || businessTypes[0]
  const revenue = numberValue(form.annualRevenue)
  const profit = numberValue(form.annualProfit)
  const years = numberValue(form.yearsOperating)
  const assets = numberValue(form.assets)

  const trendFactor = {
    declining: 0.82,
    stable: 1,
    growing: 1.18,
    fast: 1.34,
  }[form.revenueTrend]

  const ownerFactor = {
    full: 0.88,
    part: 1,
    manager: 1.14,
  }[form.ownerHours]

  const historyFactor = years >= 10 ? 1.12 : years >= 5 ? 1.04 : years >= 2 ? 0.96 : 0.82
  const profitValuation = profit * type.multiple * trendFactor * ownerFactor * historyFactor
  const revenueFloor = revenue * 0.22
  const assetSupport = assets * 0.55
  const midpoint = Math.max(profitValuation + assetSupport, revenueFloor + assetSupport)
  const low = midpoint * 0.86
  const high = midpoint * 1.16

  return {
    type,
    low,
    high,
    midpoint,
    multiple: type.multiple * trendFactor * ownerFactor * historyFactor,
  }
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [screen, setScreen] = useState('calculator')
  const [submitted, setSubmitted] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')

  const valuation = useMemo(() => getValuation(form), [form])
  const canCalculate = form.annualRevenue && form.annualProfit && form.yearsOperating

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleCalculate = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    setSaveStatus('idle')
    if (!canCalculate) return

    setSaveStatus('saving')

    try {
      const response = await fetch(`${API_BASE_URL}/api/valuations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          valuation: {
            low: valuation.low,
            high: valuation.high,
            midpoint: valuation.midpoint,
            multiple: valuation.multiple,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save valuation lead')
      }

      setSaveStatus('saved')
    } catch (error) {
      console.error(error)
      setSaveStatus('error')
    }

    setScreen('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetCalculator = () => {
    setScreen('calculator')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <nav className="nav">
        <button className="nav-logo" onClick={resetCalculator} type="button">
          <span className="brand-mark">$</span>
          <span className="nav-logo-text">Business Value Estimator</span>
        </button>
      </nav>

      <main className="page">
        {screen === 'calculator' && (
          <section className="calculator-page">
            <div className="intro fu">
              <p className="eyebrow">Broker-built first look</p>
              <h1>Estimate what your business could be worth.</h1>
              <p>
                Answer a few practical questions to get a quick valuation range. A broker can refine this with tax returns,
                add-backs, lease details, buyer demand, and local market comps.
              </p>
            </div>

            <form className="calculator-panel fu1" onSubmit={handleCalculate}>
              <div className="form-grid">
                <label>
                  <span>Business type</span>
                  <select name="businessType" value={form.businessType} onChange={updateForm}>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Annual revenue</span>
                  <input
                    min="0"
                    name="annualRevenue"
                    onChange={updateForm}
                    placeholder="650000"
                    type="number"
                    value={form.annualRevenue}
                  />
                  {submitted && !form.annualRevenue && <small>Revenue is required.</small>}
                </label>

                <label>
                  <span>Annual seller earnings</span>
                  <input
                    min="0"
                    name="annualProfit"
                    onChange={updateForm}
                    placeholder="140000"
                    type="number"
                    value={form.annualProfit}
                  />
                  {submitted && !form.annualProfit && <small>Seller earnings are required.</small>}
                </label>

                <label>
                  <span>Years operating</span>
                  <input
                    min="0"
                    name="yearsOperating"
                    onChange={updateForm}
                    placeholder="6"
                    type="number"
                    value={form.yearsOperating}
                  />
                  {submitted && !form.yearsOperating && <small>Years operating is required.</small>}
                </label>

                <label>
                  <span>Owner involvement</span>
                  <select name="ownerHours" value={form.ownerHours} onChange={updateForm}>
                    <option value="full">Owner runs daily operations</option>
                    <option value="part">Owner works part time</option>
                    <option value="manager">Manager-led operations</option>
                  </select>
                </label>

                <label>
                  <span>Revenue trend</span>
                  <select name="revenueTrend" value={form.revenueTrend} onChange={updateForm}>
                    <option value="declining">Declining</option>
                    <option value="stable">Stable</option>
                    <option value="growing">Growing</option>
                    <option value="fast">Growing quickly</option>
                  </select>
                </label>

                <label>
                  <span>Approximate assets</span>
                  <input
                    min="0"
                    name="assets"
                    onChange={updateForm}
                    placeholder="50000"
                    type="number"
                    value={form.assets}
                  />
                </label>

                <label>
                  <span>Your name</span>
                  <input name="name" onChange={updateForm} placeholder="Alex Smith" type="text" value={form.name} />
                </label>

                <label className="wide">
                  <span>Email</span>
                  <input name="email" onChange={updateForm} placeholder="alex@example.com" type="email" value={form.email} />
                </label>
              </div>

              <button className="primary-btn" disabled={saveStatus === 'saving'} type="submit">
                {saveStatus === 'saving' ? 'Saving Estimate' : 'Calculate Estimate'}
              </button>
              {saveStatus === 'saving' && <p className="form-status">Saving your estimate...</p>}
            </form>
          </section>
        )}

        {screen === 'results' && (
          <section className="results-page">
            <button className="back" onClick={resetCalculator} type="button">Back to calculator</button>

            <div className="result-hero fu">
              <p className="eyebrow">Estimated valuation range</p>
              <h1>{currencyFormatter.format(valuation.low)} - {currencyFormatter.format(valuation.high)}</h1>
              <p>
                This estimate is based on a blended range for a {valuation.type.label.toLowerCase()} using your earnings,
                revenue, operating history, asset support, and current trend.
              </p>
            </div>

            <div className="result-grid fu1">
              <article className="valuation-card featured">
                <span>Likely midpoint</span>
                <strong>{currencyFormatter.format(valuation.midpoint)}</strong>
                <p>Approximate adjusted multiple: {valuation.multiple.toFixed(1)}x seller earnings.</p>
              </article>

              <article className="valuation-card">
                <span>Business type</span>
                <strong>{valuation.type.label}</strong>
                <p>Different industries attract different buyer pools and financing expectations.</p>
              </article>

              <article className="valuation-card">
                <span>Next step</span>
                <strong>Professional estimate</strong>
                <p>A broker can review add-backs, leases, debt, equipment, inventory, and recent comparable sales.</p>
              </article>
            </div>

            <div className="contact-panel fu2">
              <div>
                <p className="eyebrow">Ready for a real broker opinion?</p>
                <h2>Ask for a professional estimate.</h2>
                <p>
                  Send this estimate to your friend and invite the business owner to schedule a conversation. Replace the
                  contact details here with the broker's real email and phone number.
                </p>
              </div>
              <div className="contact-actions">
                <a className="primary-btn" href="mailto:broker@example.com?subject=Professional business valuation estimate">
                  Email Broker
                </a>
                <a className="secondary-btn" href="tel:+15555550123">Call Broker</a>
              </div>
            </div>

            <p className="disclaimer fu3">
              This calculator is for educational purposes only and is not a formal appraisal, financial advice, or a
              guaranteed sale price.
            </p>
          </section>
        )}
      </main>
    </>
  )
}
