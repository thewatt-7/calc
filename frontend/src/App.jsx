import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? import.meta.env.VITE_DEV_API_URL || 'http://localhost:5001' : '')
).replace(/\/$/, '')

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant', baseMultiple: 2.1 },
  { value: 'service', label: 'Service Business', baseMultiple: 2.8 },
  { value: 'retail', label: 'Retail Store', baseMultiple: 2.2 },
  { value: 'ecommerce', label: 'E-commerce', baseMultiple: 3.1 },
  { value: 'manufacturing', label: 'Manufacturing', baseMultiple: 3.3 },
  { value: 'professional', label: 'Professional Practice', baseMultiple: 3.0 },
]

const initialForm = {
  businessName: '',
  businessType: 'service',
  yearsOperating: '',
  ownerInvolvement: 'full',
  employees: '',
  revenueTrend: 'stable',
  ownsRealEstate: 'no',
  annualRevenue: '',
  netIncome: '',
  ownerSalary: '',
  healthInsurance: '',
  retirementContributions: '',
  depreciation: '',
  amortization: '',
  interestExpense: '',
  personalExpenses: '',
  oneTimeExpenses: '',
  name: '',
}

const optionalAddBackFields = [
  'ownerSalary',
  'personalExpenses',
  'oneTimeExpenses',
  'healthInsurance',
  'retirementContributions',
  'depreciation',
  'amortization',
  'interestExpense',
]

const requiredFields = Object.keys(initialForm).filter((field) => !optionalAddBackFields.includes(field))

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const numberValue = (value) => Number(value || 0)
const calculatorPath = '/'
const resultsPath = '/results'

function Disclaimer({ className = '' }) {
  return (
    <p className={`disclaimer ${className}`.trim()}>
      This calculator is for educational purposes only and is not a formal appraisal, financial advice, or a
      guaranteed sale price.
    </p>
  )
}

function getValuation(form) {
  const type = businessTypes.find((item) => item.value === form.businessType) || businessTypes[0]
  const years = numberValue(form.yearsOperating)
  const employees = numberValue(form.employees)
  const sde =
    numberValue(form.netIncome) +
    numberValue(form.ownerSalary) +
    numberValue(form.healthInsurance) +
    numberValue(form.retirementContributions) +
    numberValue(form.depreciation) +
    numberValue(form.amortization) +
    numberValue(form.interestExpense) +
    numberValue(form.personalExpenses) +
    numberValue(form.oneTimeExpenses)

  const yearsAdjustment = years <= 2 ? -0.2 : years <= 5 ? 0 : years <= 10 ? 0.1 : 0.2

  const trendAdjustment = {
    growing: 0.15,
    stable: 0,
    declining: -0.15,
  }[form.revenueTrend]

  const ownerAdjustment = {
    absentee: 0.2,
    part: 0.1,
    full: 0,
  }[form.ownerInvolvement]

  const employeeAdjustment = employees <= 2 ? -0.1 : employees <= 10 ? 0 : 0.1
  const finalMultiple = Math.max(
    0,
    type.baseMultiple + yearsAdjustment + trendAdjustment + ownerAdjustment + employeeAdjustment,
  )
  const estimatedValue = Math.max(0, sde * finalMultiple)
  const low = estimatedValue * 0.9
  const high = estimatedValue * 1.1

  return {
    type,
    sde,
    low,
    high,
    midpoint: estimatedValue,
    multiple: finalMultiple,
    adjustments: {
      years: yearsAdjustment,
      revenueTrend: trendAdjustment,
      ownerInvolvement: ownerAdjustment,
      employees: employeeAdjustment,
    },
  }
}

export default function App() {
  const formRef = useRef(null)
  const [form, setForm] = useState(initialForm)
  const [screen, setScreen] = useState('calculator')
  const [submitted, setSubmitted] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [advancedAddBacksOpen, setAdvancedAddBacksOpen] = useState(false)
  const [theme, setTheme] = useState(() => (
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  ))

  const valuation = useMemo(() => getValuation(form), [form])
  const isFieldMissing = (fieldName) => String(form[fieldName] ?? '').trim() === ''
  const firstMissingField = requiredFields.find(isFieldMissing)
  const showRequiredError = (fieldName) => submitted && isFieldMissing(fieldName)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncTheme = (event) => {
      setTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', syncTheme)

    return () => {
      mediaQuery.removeEventListener('change', syncTheme)
    }
  }, [])

  useEffect(() => {
    window.history.replaceState({ screen: 'calculator' }, '', calculatorPath)

    const handlePopState = (event) => {
      setSaveStatus('idle')
      setScreen(event.state?.screen === 'results' ? 'results' : 'calculator')
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [screen])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const focusField = (fieldName) => {
    const field = formRef.current?.elements.namedItem(fieldName)

    if (!field) return

    field.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field.focus({ preventScroll: true })
  }

  const handleCalculate = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    const invalidField = firstMissingField

    if (invalidField) {
      setSaveStatus('idle')
      focusField(invalidField)
      return
    }

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
            sde: valuation.sde,
            adjustments: valuation.adjustments,
          },
        }),
      })

      if (!response.ok) {
        const errorDetails = await response.json().catch(() => null)
        throw new Error(errorDetails?.message || 'Failed to save valuation lead', {
          cause: errorDetails,
        })
      }

      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save valuation lead', error.cause || error)
      setSaveStatus('error')
    }

    window.history.pushState({ screen: 'results' }, '', resultsPath)
    setScreen('results')
  }

  const resetCalculator = () => {
    if (screen === 'results' && window.history.state?.screen === 'results') {
      window.history.back()
      return
    }

    window.history.replaceState({ screen: 'calculator' }, '', calculatorPath)
    setScreen('calculator')
  }

  const clearForm = () => {
    setForm(initialForm)
    setSubmitted(false)
    setSaveStatus('idle')
    setAdvancedAddBacksOpen(false)
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <button className="nav-logo" onClick={resetCalculator} type="button">
            <span className="brand-mark">$</span>
            <span className="nav-logo-text">Business Value Estimator</span>
          </button>
        </div>
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

            <form className="calculator-panel fu1" noValidate onSubmit={handleCalculate} ref={formRef}>
              <div className="form-grid">
                <p className="required-note wide"><span>*</span> Required fields</p>

                <div className="form-section wide">
                  <p className="section-kicker">Step 1</p>
                  <h2>Business Information</h2>
                </div>

                <label>
                  <span className="required-label">Business name</span>
                  <input name="businessName" onChange={updateForm} placeholder="Main Street Cafe" required type="text" value={form.businessName} />
                  {showRequiredError('businessName') && <small>Business name is required.</small>}
                </label>

                <label>
                  <span className="required-label">Your name</span>
                  <input name="name" onChange={updateForm} placeholder="Alex Smith" required type="text" value={form.name} />
                  {showRequiredError('name') && <small>Your name is required.</small>}
                </label>

                <label>
                  <span className="required-label">Industry</span>
                  <select name="businessType" required value={form.businessType} onChange={updateForm}>
                    {businessTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="required-label">Years in business</span>
                  <input
                    min="0"
                    name="yearsOperating"
                    onChange={updateForm}
                    placeholder="6"
                    required
                    type="number"
                    value={form.yearsOperating}
                  />
                  {showRequiredError('yearsOperating') && <small>Years in business is required.</small>}
                </label>

                <label>
                  <span className="required-label">Owner involvement</span>
                  <select name="ownerInvolvement" required value={form.ownerInvolvement} onChange={updateForm}>
                    <option value="full">Full-Time Owner</option>
                    <option value="part">Part-Time Owner</option>
                    <option value="absentee">Absentee Owner</option>
                  </select>
                </label>

                <label>
                  <span className="required-label">Number of employees</span>
                  <input
                    min="0"
                    name="employees"
                    onChange={updateForm}
                    placeholder="8"
                    required
                    type="number"
                    value={form.employees}
                  />
                  {showRequiredError('employees') && <small>Number of employees is required.</small>}
                </label>

                <label>
                  <span className="required-label">Revenue trend</span>
                  <select name="revenueTrend" required value={form.revenueTrend} onChange={updateForm}>
                    <option value="growing">Growing</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                  </select>
                </label>

                <label>
                  <span className="required-label">Owns real estate?</span>
                  <select name="ownsRealEstate" required value={form.ownsRealEstate} onChange={updateForm}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                  <small className="field-note">Real estate is valued separately and is NOT included in this estimate.</small>
                </label>

                <div className="form-section wide">
                  <p className="section-kicker">Step 2</p>
                  <h2>Financial Information</h2>
                </div>

                <label>
                  <span className="required-label">Annual revenue</span>
                  <input
                    min="0"
                    name="annualRevenue"
                    onChange={updateForm}
                    placeholder="650000"
                    required
                    type="number"
                    value={form.annualRevenue}
                  />
                  {showRequiredError('annualRevenue') && <small>Revenue is required.</small>}
                </label>

                <label>
                  <span className="required-label">Net income</span>
                  <input
                    name="netIncome"
                    onChange={updateForm}
                    placeholder="95000"
                    required
                    type="number"
                    value={form.netIncome}
                  />
                  <small className="field-note">Use the Net Income (bottom line) from your most recent Profit &amp; Loss Statement.</small>
                  {showRequiredError('netIncome') && <small>Net income is required.</small>}
                </label>

                <div className="form-section wide">
                  <p className="section-kicker">Step 3</p>
                  <h2>Common Add-Backs</h2>
                </div>

                <label>
                  <span>Owner salary</span>
                  <input min="0" name="ownerSalary" onChange={updateForm} placeholder="65000" type="number" value={form.ownerSalary} />
                </label>

                <label>
                  <span>Personal expenses paid by business</span>
                  <input min="0" name="personalExpenses" onChange={updateForm} placeholder="15000" type="number" value={form.personalExpenses} />
                </label>

                <label>
                  <span>One-time / non-recurring expenses</span>
                  <input min="0" name="oneTimeExpenses" onChange={updateForm} placeholder="5000" type="number" value={form.oneTimeExpenses} />
                  <small className="field-note">Examples: legal fees, equipment repairs, accounting fees, personal vehicle, cell phone, or travel.</small>
                </label>

                <div className="advanced-addbacks wide">
                  <button
                    aria-expanded={advancedAddBacksOpen}
                    className="advanced-toggle"
                    onClick={() => setAdvancedAddBacksOpen((current) => !current)}
                    type="button"
                  >
                    <span>Advanced</span>
                    <span className="toggle-icon" aria-hidden="true">{advancedAddBacksOpen ? '-' : '+'}</span>
                  </button>

                  {advancedAddBacksOpen && (
                    <div className="advanced-grid">
                      <label>
                        <span>Health insurance</span>
                        <input min="0" name="healthInsurance" onChange={updateForm} placeholder="12000" type="number" value={form.healthInsurance} />
                      </label>

                      <label>
                        <span>Retirement contributions</span>
                        <input min="0" name="retirementContributions" onChange={updateForm} placeholder="8000" type="number" value={form.retirementContributions} />
                      </label>

                      <label>
                        <span>Depreciation</span>
                        <input min="0" name="depreciation" onChange={updateForm} placeholder="10000" type="number" value={form.depreciation} />
                      </label>

                      <label>
                        <span>Amortization</span>
                        <input min="0" name="amortization" onChange={updateForm} placeholder="3000" type="number" value={form.amortization} />
                      </label>

                      <label>
                        <span>Interest expense</span>
                        <input min="0" name="interestExpense" onChange={updateForm} placeholder="7000" type="number" value={form.interestExpense} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button className="primary-btn" disabled={saveStatus === 'saving'} type="submit">
                  {saveStatus === 'saving' ? 'Preparing Results' : 'Calculate Estimate'}
                </button>
                <button className="secondary-btn" disabled={saveStatus === 'saving'} onClick={clearForm} type="button">
                  Clear Form
                </button>
              </div>
              {saveStatus === 'saving' && (
                <div className="loading-estimate" aria-live="polite" role="status">
                  <div className="loading-calculator" aria-hidden="true">
                    <span className="calculator-screen" />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="loading-copy">
                    <strong>Calculating your estimate</strong>
                    <p>Reviewing the financials, add-backs, and valuation range.</p>
                    <div className="loading-track" aria-hidden="true">
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </form>

            <Disclaimer className="fu2" />
          </section>
        )}

        {screen === 'results' && (
          <section className="results-page">
            <button className="back" onClick={resetCalculator} type="button">Back to calculator</button>

            <div className="result-hero fu">
              <p className="eyebrow">Estimated valuation range</p>
              <h1>{currencyFormatter.format(valuation.low)} - {currencyFormatter.format(valuation.high)}</h1>
              <p>
                This estimate uses Seller&apos;s Discretionary Earnings multiplied by an adjusted industry multiple for a{' '}
                {valuation.type.label.toLowerCase()}.
              </p>
            </div>

            <div className="result-grid fu1">
              <article className="valuation-card featured">
                <span>Estimated business value</span>
                <strong>{currencyFormatter.format(valuation.midpoint)}</strong>
                <p>The displayed range is 10% below and above this estimate.</p>
              </article>

              <article className="valuation-card">
                <span>Calculated SDE</span>
                <strong>{currencyFormatter.format(valuation.sde)}</strong>
                <p>Net income plus owner add-backs entered in the calculator.</p>
              </article>

              <article className="valuation-card">
                <span>Final multiple used</span>
                <strong>{valuation.multiple.toFixed(2)}x</strong>
                <p>Base industry multiple adjusted for years, trend, owner involvement, and employee count.</p>
              </article>

              <article className="valuation-card">
                <span>Business type</span>
                <strong>{valuation.type.label}</strong>
                <p>Base multiple: {valuation.type.baseMultiple.toFixed(2)}x before quality adjustments.</p>
              </article>

              <article className="valuation-card">
                <span>Real estate</span>
                <strong>{form.ownsRealEstate === 'yes' ? 'Excluded' : 'Not included'}</strong>
                <p>Real estate is valued separately and is NOT included in this estimate.</p>
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
              </div>
              <div className="contact-actions">
                <a className="primary-btn" href="mailto:Zach.jordan@fcbb.com?subject=Professional business valuation estimate">
                  <span>Click to email</span>
                  <strong>Zach.jordan@fcbb.com</strong>
                </a>
                <a className="secondary-btn" href="tel:+17039671177">
                  <span>Tap to call</span>
                  <strong>703-967-1177</strong>
                </a>
              </div>
            </div>

            <Disclaimer className="fu3" />
          </section>
        )}
      </main>
    </>
  )
}
