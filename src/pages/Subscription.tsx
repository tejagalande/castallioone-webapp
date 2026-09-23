import { useState, type FC } from 'react'
import {
  useSubscription,
  type EnterprisePlan,
} from './useSubscription'
import './Subscription.css'

export interface SubscriptionProps {
  onNavigateToDashboard?: () => void
  onNavigateToBilling?: () => void
}

export const Subscription: FC<SubscriptionProps> = ({
  onNavigateToBilling,
  onNavigateToDashboard,
}) => {
  const {
    companyName,
    activePlanId,
    usage,
    jobPostingPlans,
    cvAddons,
    selectedPlanForGateway,
    setSelectedPlanForGateway,
    lastTransactionId,
    handleSelectPlan,
    handleConfirmSubscription,
    handleDownloadGstInvoice,
    toastMessage,
  } = useSubscription()

  // Gateway flow states
  const [gstinNumber, setGstinNumber] = useState<string>('')
  const [isGatewayLoading, setIsGatewayLoading] = useState<boolean>(false)
  const [isSuccessView, setIsSuccessView] = useState<boolean>(false)
  const [confirmedPlan, setConfirmedPlan] = useState<EnterprisePlan | null>(null)

  // Trigger third-party payment gateway
  const handleProceedToGateway = async () => {
    if (!selectedPlanForGateway) return
    setIsGatewayLoading(true)

    try {
      /* ═════════════════════════════════════════════════════════════════════
         THIRD-PARTY PAYMENT GATEWAY INTEGRATION HOOK
         When ready to connect live Razorpay / Cashfree / Stripe:
         const options = {
           key: process.env.VITE_RAZORPAY_KEY,
           amount: totalPayable * 100, // paise
           currency: 'INR',
           name: 'Castallio One',
           description: `${selectedPlanForGateway.name} Subscription`,
           handler: (response) => { ... },
           prefill: { email: user.email, contact: companyPhone }
         };
         const rzp = new window.Razorpay(options);
         rzp.open();
         ═════════════════════════════════════════════════════════════════════ */

      // Simulate gateway initialization and processing
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const result = await handleConfirmSubscription(
        selectedPlanForGateway,
        'upi',
        gstinNumber
      )

      if (result.success) {
        setConfirmedPlan(selectedPlanForGateway)
        setIsSuccessView(true)
      }
    } finally {
      setIsGatewayLoading(false)
    }
  }

  const handleReturnToPlans = () => {
    setSelectedPlanForGateway(null)
    setIsSuccessView(false)
    setConfirmedPlan(null)
  }

  // Progress calculations for quota bars
  const jobProgressPct = usage.jobPostLimit
    ? Math.min(100, Math.round((usage.jobsPosted / usage.jobPostLimit) * 100))
    : 15
  const cvProgressPct = usage.cvUnlockLimit
    ? Math.min(100, Math.round((usage.cvsUnlocked / usage.cvUnlockLimit) * 100))
    : 0

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 1: PAYMENT SUCCESS CONFIRMATION
  // ═══════════════════════════════════════════════════════════════════════════
  if (isSuccessView && confirmedPlan) {
    return (
      <main className="sub-enterprise-root" aria-label="Subscription Activated">
        <div className="sub-enterprise-container">
          <section className="sub-gateway-success-card">
            <div className="sub-success-icon-wrap">
              <span className="material-symbols-outlined">check_circle</span>
            </div>

            <h1 className="sub-success-title">Subscription Activated!</h1>
            <p className="sub-success-desc">
              Your payment has been verified via the secure gateway. Your enterprise account has been upgraded to the <strong>{confirmedPlan.name}</strong>.
            </p>

            <div className="sub-success-details-box">
              <div className="sub-tax-row">
                <span className="sub-tax-key">Plan Activated:</span>
                <span className="sub-tax-val">{confirmedPlan.name} ({confirmedPlan.category})</span>
              </div>
              <div className="sub-tax-row">
                <span className="sub-tax-key">Transaction Ref:</span>
                <span className="sub-tax-val" style={{ fontFamily: 'monospace' }}>
                  {lastTransactionId || 'TXN_GATEWAY_SETTLED'}
                </span>
              </div>
              <div className="sub-tax-row">
                <span className="sub-tax-key">Amount Settled:</span>
                <span className="sub-tax-val" style={{ color: '#0056d2' }}>
                  ₹{(confirmedPlan.price * 1.18).toFixed(2)} INR (18% GST Included)
                </span>
              </div>
              <div className="sub-tax-row">
                <span className="sub-tax-key">Enterprise Entity:</span>
                <span className="sub-tax-val">{companyName}</span>
              </div>
            </div>

            <div className="sub-success-actions-row">
              <button
                type="button"
                className="btn-success-primary"
                onClick={handleReturnToPlans}
              >
                Return to Plans &amp; Quotas
              </button>

              <button
                type="button"
                className="btn-success-secondary"
                onClick={handleDownloadGstInvoice}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  download
                </span>
                <span>Download GST Tax Invoice</span>
              </button>

              {onNavigateToDashboard && (
                <button
                  type="button"
                  className="btn-success-secondary"
                  onClick={onNavigateToDashboard}
                >
                  <span>Go to Dashboard</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 2: DEDICATED PAYMENT GATEWAY PAGE (Opened when user opted a plan)
  // ═══════════════════════════════════════════════════════════════════════════
  if (selectedPlanForGateway) {
    const baseAmt = selectedPlanForGateway.price
    const cgstAmt = Number((baseAmt * 0.09).toFixed(2))
    const sgstAmt = Number((baseAmt * 0.09).toFixed(2))
    const totalWithGst = (baseAmt + cgstAmt + sgstAmt).toFixed(2)

    return (
      <main className="sub-enterprise-root" aria-label="Payment Gateway Checkout">
        <div className="sub-enterprise-container">
          <div className="sub-gateway-root">
            {/* Top Navigation & Trust Bar */}
            <div className="sub-gateway-topbar">
              <button
                type="button"
                className="btn-gateway-back"
                onClick={() => setSelectedPlanForGateway(null)}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back to Subscription Plans</span>
              </button>

              <span className="sub-gateway-trust-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  lock
                </span>
                <span>256-BIT ENCRYPTED GATEWAY CHECKOUT</span>
              </span>
            </div>

            <div className="sub-gateway-layout">
              {/* Left Column: Order & Tax Breakdown */}
              <div className="sub-gateway-review-card">
                <div>
                  <span className="sub-card-category">{selectedPlanForGateway.category}</span>
                  <h2 style={{ margin: '4px 0 8px 0', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
                    Order &amp; Billing Summary
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    Review your subscription specifications and tax invoice details for <strong>{companyName}</strong>.
                  </p>
                </div>

                <div className="sub-gateway-plan-preview">
                  <div className="sub-gateway-plan-header">
                    <div>
                      <h3 className="sub-gateway-plan-title">{selectedPlanForGateway.name}</h3>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {selectedPlanForGateway.subtitle}
                      </span>
                    </div>
                    <span className="sub-gateway-plan-price">
                      {selectedPlanForGateway.priceDisplay}
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                        {selectedPlanForGateway.period}
                      </span>
                    </span>
                  </div>

                  <div className="sub-pills-row" style={{ margin: 0 }}>
                    <span className="sub-pill-badge">
                      <span className="material-symbols-outlined">
                        {selectedPlanForGateway.primaryBadge.icon === 'work' ? 'work_outline' : 'group'}
                      </span>
                      <span>{selectedPlanForGateway.primaryBadge.text}</span>
                    </span>

                    {selectedPlanForGateway.secondaryBadge && (
                      <span className="sub-pill-badge">
                        <span className="material-symbols-outlined">
                          {selectedPlanForGateway.secondaryBadge.icon === 'work' ? 'work_outline' : 'group'}
                        </span>
                        <span>{selectedPlanForGateway.secondaryBadge.text}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Itemized Invoicing Table */}
                <div className="sub-gateway-invoice-table">
                  <div className="sub-gateway-invoice-row">
                    <span>Base Taxable Amount:</span>
                    <strong style={{ color: '#0f172a' }}>₹{baseAmt.toLocaleString('en-IN')}.00</strong>
                  </div>
                  <div className="sub-gateway-invoice-row">
                    <span>Service SAC Code:</span>
                    <span>998311 (Recruitment &amp; IT Services)</span>
                  </div>
                  <div className="sub-gateway-invoice-row">
                    <span>Central GST (CGST 9%):</span>
                    <span>₹{cgstAmt.toFixed(2)}</span>
                  </div>
                  <div className="sub-gateway-invoice-row">
                    <span>State GST (SGST 9%):</span>
                    <span>₹{sgstAmt.toFixed(2)}</span>
                  </div>
                  <div className="sub-gateway-invoice-row total-row">
                    <span>Total Payable Amount:</span>
                    <span style={{ color: '#0056d2' }}>₹{totalWithGst} INR</span>
                  </div>
                </div>

                {/* GSTIN Claim Input */}
                <div className="sub-form-group">
                  <label className="sub-form-label">
                    Company GSTIN (For 18% Input Tax Credit):
                  </label>
                  <input
                    type="text"
                    className="sub-form-input"
                    placeholder="e.g. 27AAACC4451N1ZP"
                    value={gstinNumber}
                    onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                  />
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Invoices will reflect in your GSTR-2B under SAC code 998311.
                  </span>
                </div>
              </div>

              {/* Right Column: Third-Party Payment Gateway Integration Screen */}
              <div className="sub-gateway-terminal-card">
                <div>
                  <h3 className="sub-gateway-terminal-title">
                    <span className="material-symbols-outlined" style={{ color: '#0056d2' }}>
                      account_balance_wallet
                    </span>
                    <span>Payment Gateway</span>
                  </h3>
                  <p className="sub-gateway-terminal-desc">
                    All transactions are processed through authenticated third-party banking channels.
                  </p>
                </div>

                {/* Supported Payment Rails */}
                <div className="sub-gateway-rails-box">
                  <div className="sub-gateway-rail-badge">
                    <span className="material-symbols-outlined">qr_code_2</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Instant UPI</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>GPay, PhonePe, Paytm</div>
                    </div>
                  </div>

                  <div className="sub-gateway-rail-badge">
                    <span className="material-symbols-outlined">credit_card</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Cards</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Visa, MC, RuPay, Amex</div>
                    </div>
                  </div>

                  <div className="sub-gateway-rail-badge">
                    <span className="material-symbols-outlined">account_balance</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>NetBanking</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>All Indian Banks</div>
                    </div>
                  </div>

                  <div className="sub-gateway-rail-badge">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Corporate Billing</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Direct Invoicing</div>
                    </div>
                  </div>
                </div>

                {/* Integration Notice for Developers & Clients */}
                <div className="sub-gateway-placeholder-banner">
                  <div className="sub-gateway-banner-header">
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                      hub
                    </span>
                    <span>Third-Party Gateway Integration Ready</span>
                  </div>
                  <p className="sub-gateway-banner-text">
                    This screen triggers your payment gateway SDK (Razorpay / Cashfree / Stripe). You can simulate the checkout now to activate the subscription in your database.
                  </p>
                </div>

                {/* Gateway Launch Action */}
                <button
                  type="button"
                  className="btn-launch-gateway"
                  onClick={handleProceedToGateway}
                  disabled={isGatewayLoading}
                >
                  <span className="material-symbols-outlined">lock</span>
                  <span>
                    {isGatewayLoading
                      ? 'Connecting to Gateway...'
                      : `Proceed to Pay ₹${totalWithGst} via Gateway`}
                  </span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#059669' }}>
                    verified_user
                  </span>
                  <span>PCI-DSS Level 1 &amp; RBI Approved Security Standards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW 3: MAIN PLANS DIRECTORY (Default View)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <main className="sub-enterprise-root" aria-label="Enterprise Subscription & Recruitment Plans">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="sub-live-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="sub-enterprise-container">
        {/* ── 1. Enterprise Quota & Live Status Banner ── */}
        <header className="sub-quota-dashboard-card">
          <div className="sub-quota-left">
            <div className="sub-company-label-row">
              <h1 className="sub-company-title">{companyName}</h1>
              <span className="sub-active-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  verified
                </span>
                <span>Active: {usage.planName}</span>
              </span>
            </div>
            <p className="sub-quota-desc">
              Manage your firm's job postings, candidate search capabilities, and CV unlock quotas.
            </p>
          </div>

          <div className="sub-quota-counters-row">
            <div className="sub-counter-stat">
              <span className="sub-counter-label">Job Posts Quota</span>
              <span className="sub-counter-value">
                {usage.jobsPosted}
                <span className="sub-counter-total">
                  / {usage.jobPostLimit === null ? 'Unlimited' : usage.jobPostLimit}
                </span>
              </span>
              <div className="sub-progress-track">
                <div
                  className="sub-progress-fill"
                  style={{ width: `${jobProgressPct}%` }}
                />
              </div>
            </div>

            <div className="sub-counter-stat">
              <span className="sub-counter-label">CV Unlocks Quota</span>
              <span className="sub-counter-value">
                {usage.cvsUnlocked}
                <span className="sub-counter-total">/ {usage.cvUnlockLimit}</span>
              </span>
              <div className="sub-progress-track">
                <div
                  className="sub-progress-fill green"
                  style={{ width: `${cvProgressPct}%` }}
                />
              </div>
            </div>

            <div className="sub-quota-actions">
              <button
                type="button"
                className="btn-quota-action"
                onClick={handleDownloadGstInvoice}
                title="Download official GST tax invoice receipt"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#0056d2' }}>
                  receipt_long
                </span>
                <span>Download GST Invoice</span>
              </button>

              {onNavigateToBilling && (
                <button
                  type="button"
                  className="btn-quota-action"
                  onClick={onNavigateToBilling}
                  title="View past invoices and payment ledger"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    history
                  </span>
                  <span>Billing History</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── 2. SECTION 1: Job Posting Plans ── */}
        <section aria-labelledby="job-posting-plans-heading">
          <div className="sub-section-header">
            <span className="sub-section-pill-tag">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                workspace_premium
              </span>
              CORE SUBSCRIPTION TIERS
            </span>
            <h2 id="job-posting-plans-heading" className="sub-section-title">
              Job Posting Plans
            </h2>
            <p className="sub-section-subtitle">
              Publish verified opportunities, tap into specialized architectural talent, and scale your team.
            </p>
          </div>

          <div className="sub-plans-grid four-columns">
            {jobPostingPlans.map((plan: EnterprisePlan) => {
              const isCurrent = activePlanId === plan.id
              const isPopular = plan.id === 'professional'

              return (
                <article
                  key={plan.id}
                  className={`sub-card ${isCurrent ? 'is-active-tier' : ''} ${
                    isPopular ? 'featured-popular' : ''
                  }`}
                >
                  {/* Top Ribbon Banner if present */}
                  {plan.ribbon && (
                    <div className={`sub-card-ribbon ${plan.ribbon.variant}`}>
                      <span className="material-symbols-outlined sub-ribbon-icon">
                        star
                      </span>
                      <span>{plan.ribbon.text}</span>
                    </div>
                  )}

                  <div className="sub-card-content">
                    <span className="sub-card-category">{plan.category}</span>

                    <div className="sub-card-price-row">
                      <span className="sub-card-price-val">{plan.priceDisplay}</span>
                      {plan.period && (
                        <span className="sub-card-price-period">{plan.period}</span>
                      )}
                    </div>

                    <p className="sub-card-subtitle">{plan.subtitle}</p>

                    {/* Badge Chips Row */}
                    <div className="sub-pills-row">
                      <span className="sub-pill-badge">
                        <span className="material-symbols-outlined">
                          {plan.primaryBadge.icon === 'work' ? 'work_outline' : 'group'}
                        </span>
                        <span>{plan.primaryBadge.text}</span>
                      </span>

                      {plan.secondaryBadge && (
                        <span className="sub-pill-badge">
                          <span className="material-symbols-outlined">
                            {plan.secondaryBadge.icon === 'work' ? 'work_outline' : 'group'}
                          </span>
                          <span>{plan.secondaryBadge.text}</span>
                        </span>
                      )}
                    </div>

                    {/* Feature Checklist */}
                    <ul className="sub-checklist">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="sub-check-item">
                          <span className="sub-check-bullet">
                            <span className="material-symbols-outlined sub-check-icon">
                              check
                            </span>
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Button */}
                  <div className="sub-card-cta-wrap">
                    {isCurrent ? (
                      <button
                        type="button"
                        className="btn-plan-cta outline-current"
                        disabled
                        aria-label={`Current plan: ${plan.name}`}
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>Current Plan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-plan-cta solid-blue"
                        onClick={() => handleSelectPlan(plan)}
                        aria-label={`Select ${plan.name} plan`}
                      >
                        <span>{plan.buttonText}</span>
                        <span className="material-symbols-outlined btn-cta-arrow">
                          arrow_forward
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── 3. SECTION 2: CV Unlock Add-ons ── */}
        <section aria-labelledby="cv-addons-heading">
          <div className="sub-section-header">
            <span className="sub-section-pill-tag green">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                bolt
              </span>
              ON-DEMAND TALENT SOURCING
            </span>
            <h2 id="cv-addons-heading" className="sub-section-title">
              CV Unlock Add-ons
            </h2>
            <p className="sub-section-subtitle">
              Add CV unlocks to complement your job posting plan
            </p>
          </div>

          <div className="sub-addons-grid">
            {cvAddons.map((addon: EnterprisePlan) => {
              const isCurrent = activePlanId === addon.id
              const isBestValue = addon.id === 'professional_cv'

              return (
                <article
                  key={addon.id}
                  className={`sub-card ${isCurrent ? 'is-active-tier' : ''} ${
                    isBestValue ? 'featured-best-value' : ''
                  }`}
                >
                  {/* Top Ribbon Banner */}
                  {addon.ribbon && (
                    <div className={`sub-card-ribbon ${addon.ribbon.variant}`}>
                      <span className="material-symbols-outlined sub-ribbon-icon">
                        verified
                      </span>
                      <span>{addon.ribbon.text}</span>
                    </div>
                  )}

                  <div className="sub-card-content">
                    <span className="sub-card-category">{addon.category}</span>

                    <div className="sub-card-price-row">
                      <span className="sub-card-price-val">{addon.priceDisplay}</span>
                      {addon.period && (
                        <span className="sub-card-price-period">{addon.period}</span>
                      )}
                    </div>

                    <p className="sub-card-subtitle">{addon.subtitle}</p>

                    {/* Badge Chips Row */}
                    <div className="sub-pills-row">
                      <span className="sub-pill-badge">
                        <span className="material-symbols-outlined">
                          {addon.primaryBadge.icon === 'work' ? 'work_outline' : 'group'}
                        </span>
                        <span>{addon.primaryBadge.text}</span>
                      </span>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="sub-checklist">
                      {addon.features.map((feature: string, idx: number) => (
                        <li key={idx} className="sub-check-item">
                          <span className={`sub-check-bullet ${isBestValue ? 'green' : ''}`}>
                            <span className="material-symbols-outlined sub-check-icon">
                              check
                            </span>
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Action Button */}
                  <div className="sub-card-cta-wrap">
                    {isCurrent ? (
                      <button
                        type="button"
                        className="btn-plan-cta outline-current"
                        disabled
                        aria-label={`Current plan: ${addon.name}`}
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                        <span>Current Plan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-plan-cta solid-blue"
                        onClick={() => handleSelectPlan(addon)}
                        aria-label={`Select ${addon.name}`}
                      >
                        <span>{addon.buttonText}</span>
                        <span className="material-symbols-outlined btn-cta-arrow">
                          arrow_forward
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* ── 4. Enterprise Compliance, GST & Invoicing Strip ── */}
        <section className="sub-enterprise-banner" aria-label="Tax and Billing Compliance">
          <div className="sub-banner-left">
            <span className="sub-banner-badge">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                verified_user
              </span>
              <span>100% Tax Compliant • 18% GST Input Credit</span>
            </span>
            <h3 className="sub-banner-title">
              Instant GST Invoicing &amp; Input Tax Credit (ITC)
            </h3>
            <p className="sub-banner-text">
              All Castallio One recruitment subscriptions are fully eligible for 18% GST Input Tax Credit under SAC code 998311. Invoices are generated automatically with your firm's GSTIN and legal business name.
            </p>
          </div>

          <div className="sub-banner-right">
            <div className="sub-tax-row">
              <span className="sub-tax-key">Service Classification (SAC):</span>
              <span className="sub-tax-val">998311</span>
            </div>
            <div className="sub-tax-row">
              <span className="sub-tax-key">GST Tax Rate:</span>
              <span className="sub-tax-val">18% (9% CGST + 9% SGST)</span>
            </div>
            <div className="sub-tax-row">
              <span className="sub-tax-key">Input Tax Credit (ITC):</span>
              <span className="sub-tax-val" style={{ color: '#059669' }}>100% Claimable</span>
            </div>
          </div>
        </section>

        {/* ── 5. Frequently Asked Questions ── */}
        <section className="sub-faq-section" aria-label="Recruitment Subscription FAQ">
          <div className="sub-section-header">
            <h2 className="sub-section-title">Frequently Asked Questions</h2>
            <p className="sub-section-subtitle">
              Clear answers regarding job post limits, CV unlocks, and enterprise billing.
            </p>
          </div>

          <div className="sub-faq-grid">
            <article className="sub-faq-card">
              <h4 className="sub-faq-question">
                <span className="material-symbols-outlined">help_outline</span>
                <span>How do CV Unlocks work?</span>
              </h4>
              <p className="sub-faq-answer">
                Each CV unlock grants your studio full access to a candidate's complete verified profile, contact details (phone and verified email), uploaded portfolio, and verified architectural software credentials.
              </p>
            </article>

            <article className="sub-faq-card">
              <h4 className="sub-faq-question">
                <span className="material-symbols-outlined">add_circle_outline</span>
                <span>Can I stack CV Unlock add-ons with any plan?</span>
              </h4>
              <p className="sub-faq-answer">
                Yes! You can purchase Starter + CV (100 unlocks) or Professional + CV (200 unlocks) alongside your base Job Posting plan whenever you need extra candidate discovery bandwidth.
              </p>
            </article>

            <article className="sub-faq-card">
              <h4 className="sub-faq-question">
                <span className="material-symbols-outlined">receipt</span>
                <span>How do I claim GST Input Tax Credit (ITC)?</span>
              </h4>
              <p className="sub-faq-answer">
                Simply provide your 15-digit company GSTIN during checkout or in your Billing settings. Your invoice will be generated compliant with Indian GST rules and reflected in your GSTR-2B.
              </p>
            </article>

            <article className="sub-faq-card">
              <h4 className="sub-faq-question">
                <span className="material-symbols-outlined">autorenew</span>
                <span>Can I upgrade or change my plan mid-month?</span>
              </h4>
              <p className="sub-faq-answer">
                Yes, you can upgrade to a higher tier anytime. The new job posting and CV unlock quotas will be added to your account balance immediately.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  )
}
