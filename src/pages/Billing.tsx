import { useState, type FC, type ChangeEvent, type FormEvent } from 'react'
import './Billing.css'
import { useBilling, extractPanFromGstin, type EnterpriseInvoiceItem } from './useBilling'

export interface BillingProps {
  onNavigateToSubscription?: () => void
  onNavigateToDashboard?: () => void
}

export const Billing: FC<BillingProps> = ({
  onNavigateToSubscription,
}) => {
  const {
    invoices,
    filteredInvoices,
    summaryMetrics,
    taxDetails,
    activePlanName,
    activePlanPrice,
    nextRenewalDate,
    searchQuery,
    setSearchQuery,
    yearFilter,
    setYearFilter,
    planTypeFilter,
    setPlanTypeFilter,
    selectedInvoice,
    setSelectedInvoice,
    isTaxModalOpen,
    setIsTaxModalOpen,
    isDownloadingZip,
    toastMessage,
    isLoading,
    handleSaveTaxDetails,
    handleExportCsv,
    handleDownloadInvoice,
    handleDownloadAllZip,
  } = useBilling()

  const [prevTaxDetails, setPrevTaxDetails] = useState(taxDetails)
  const [taxForm, setTaxForm] = useState({
    companyName: taxDetails.companyName,
    gstin: taxDetails.gstin,
    pan: taxDetails.pan,
    accountsEmail: taxDetails.accountsEmail,
    billingAddress: taxDetails.billingAddress,
  })

  if (prevTaxDetails !== taxDetails) {
    setPrevTaxDetails(taxDetails)
    setTaxForm({
      companyName: taxDetails.companyName,
      gstin: taxDetails.gstin,
      pan: taxDetails.pan,
      accountsEmail: taxDetails.accountsEmail,
      billingAddress: taxDetails.billingAddress,
    })
  }

  const handleTaxFormSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSaveTaxDetails({
      ...taxDetails,
      companyName: taxForm.companyName,
      gstin: taxForm.gstin,
      pan: taxForm.pan,
      accountsEmail: taxForm.accountsEmail,
      billingAddress: taxForm.billingAddress,
    })
  }

  const isFreePlan = activePlanName.toLowerCase().includes('free')

  return (
    <main className="billing-page-container" aria-label="Enterprise Billing & Tax Invoices">
      {/* Toast Notification */}
      {toastMessage && (
        <aside className="billing-live-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ color: '#38bdf8' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="billing-content-body">
        {/* ── 1. Page Header Bar ── */}
        <header className="billing-title-bar">
          <div>
            <div className="billing-badge-crumb">
              <span className="crumb-pill">Enterprise Studio</span>
              <span style={{ color: '#94a3b8' }}>•</span>
              {onNavigateToSubscription && (
                <button
                  type="button"
                  className="crumb-link"
                  onClick={onNavigateToSubscription}
                >
                  <span>Active Subscription ({activePlanName})</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    arrow_forward
                  </span>
                </button>
              )}
            </div>
            <h1 className="billing-title">Billing History &amp; GST Invoices</h1>
            <p className="billing-subtitle">
              Manage enterprise recruitment software licenses, export GST-compliant tax invoices (SAC 998311),
              reconcile 18% Input Tax Credit (ITC), and maintain corporate accounting records.
            </p>
          </div>

          <div className="billing-header-actions">
            <button
              type="button"
              className="btn-billing-primary"
              disabled={isDownloadingZip || invoices.length === 0}
              onClick={handleDownloadAllZip}
              title={invoices.length === 0 ? 'No invoices available to download' : 'Download all invoices as a ZIP'}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                folder_zip
              </span>
              <span>{isDownloadingZip ? 'Bundling Invoices...' : 'Download All Invoices (.ZIP)'}</span>
            </button>
          </div>
        </header>

        {/* ── 2. Financial Overview Cards (3 Cards) ── */}
        <section className="telemetry-cards-grid" aria-label="Financial Metrics Summary">
          {/* Card 1: Active Enterprise Plan */}
          <article className="billing-stat-card">
            <div className="stat-card-top">
              <div className="stat-card-header">
                <span>Active Recruitment Plan</span>
                <span className="stat-pill-active">
                  <span className="dot" /> Active
                </span>
              </div>
              <h2 className="stat-card-value-title">{activePlanName}</h2>
              <p className="stat-card-subvalue">{activePlanPrice}</p>
            </div>
            <div className="stat-card-bottom">
              <span>{isFreePlan ? 'Billing Cycle: Free Tier' : 'Auto-Renew: Monthly'}</span>
              <span>{isFreePlan ? 'Validity: Lifetime Free' : `Next Renewal: ${nextRenewalDate}`}</span>
            </div>
          </article>

          {/* Card 2: Total Fiscal Spend */}
          <article className="billing-stat-card cyan">
            <div className="stat-card-top">
              <div className="stat-card-header">
                <span>Total Spent (Fiscal YTD)</span>
                <span className="stat-pill-neutral">FY 2025-26</span>
              </div>
              <h2 className="stat-card-value-money">
                ₹{summaryMetrics.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="stat-card-subvalue" style={{ color: '#0284c7' }}>
                {summaryMetrics.count} {summaryMetrics.count === 1 ? 'Invoice' : 'Invoices'} Reconciled
              </p>
            </div>
            <div className="stat-card-bottom">
              <span>Recruitment &amp; CV Unlocks</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>0 Overdue Payments</span>
            </div>
          </article>

          {/* Card 3: 18% GST Input Tax Credit Claimable */}
          <article className="billing-stat-card green">
            <div className="stat-card-top">
              <div className="stat-card-header">
                <span>18% GST Input Credit (ITC)</span>
                <span className="stat-pill-active">
                  <span className="dot" /> 100% Claimable
                </span>
              </div>
              <h2 className="stat-card-value-money" style={{ color: '#059669' }}>
                ₹{summaryMetrics.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="stat-card-subvalue" style={{ color: '#059669' }}>
                SAC 998311 • GSTR-2B Ready
              </p>
            </div>
            <div className="stat-card-bottom">
              <span>Tax Base: ₹{summaryMetrics.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span style={{ fontWeight: 600, color: taxDetails.gstin ? '#059669' : '#64748b' }}>
                {taxDetails.gstin ? 'GSTIN Verified' : 'No GSTIN Provided'}
              </span>
            </div>
          </article>
        </section>

        {/* ── 3. Corporate GST Profile Strip ── */}
        <section className="billing-tax-profile-strip" aria-label="Corporate GSTIN Details">
          <div className="tax-profile-left">
            <div className="tax-profile-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                apartment
              </span>
            </div>
            <div className="tax-profile-details">
              <h3 className="tax-profile-title">
                <span>{taxDetails.companyName || 'Enterprise Account'}</span>
                {taxDetails.gstin ? (
                  <span className="stat-pill-active" style={{ fontSize: '10px' }}>
                    VERIFIED GSTIN
                  </span>
                ) : (
                  <span className="stat-pill-neutral" style={{ fontSize: '10px' }}>
                    NO GSTIN PROVIDED
                  </span>
                )}
              </h3>
              <div className="tax-profile-meta">
                <span>GSTIN: <strong>{taxDetails.gstin || 'Not Provided'}</strong></span>
                <span>•</span>
                <span>PAN: <strong>{taxDetails.pan || 'Not Provided'}</strong></span>
                <span>•</span>
                <span>SAC: <strong>998311</strong></span>
                <span>•</span>
                <span>Invoicing Contact: <strong>{taxDetails.accountsEmail || 'Not Provided'}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-billing-secondary"
            onClick={() => {
              setTaxForm({
                companyName: taxDetails.companyName,
                gstin: taxDetails.gstin,
                pan: taxDetails.pan,
                accountsEmail: taxDetails.accountsEmail,
                billingAddress: taxDetails.billingAddress,
              })
              setIsTaxModalOpen(true)
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              edit
            </span>
            <span>Edit Tax Details</span>
          </button>
        </section>

        {/* ── 4. Main Invoices Ledger Container ── */}
        <section className="ledger-card-container" aria-label="Subscription Invoices Ledger">
          {isLoading ? (
            <div className="billing-loading-state">
              <div className="billing-spinner" />
              <span>Loading billing history &amp; tax invoices...</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="billing-empty-state">
              <div className="billing-empty-icon-wrapper">
                <span className="material-symbols-outlined billing-empty-icon">receipt_long</span>
              </div>
              <h3 className="billing-empty-title">No Invoices or Billing History</h3>
              <p className="billing-empty-description">
                Your enterprise is currently on the <strong>{activePlanName}</strong>. No payment invoices or GST tax receipts have been generated yet. When you upgrade to a paid recruitment plan or purchase candidate CV unlock add-ons, your official GST-compliant tax invoices (SAC 998311) and GSTR-2B Input Tax Credit receipts will appear here.
              </p>
              <div className="billing-empty-actions">
                {onNavigateToSubscription && (
                  <button
                    type="button"
                    className="btn-billing-primary"
                    onClick={onNavigateToSubscription}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      rocket_launch
                    </span>
                    <span>View Subscription Plans</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn-billing-secondary"
                  onClick={() => {
                    setTaxForm({
                      companyName: taxDetails.companyName,
                      gstin: taxDetails.gstin,
                      pan: taxDetails.pan,
                      accountsEmail: taxDetails.accountsEmail,
                      billingAddress: taxDetails.billingAddress,
                    })
                    setIsTaxModalOpen(true)
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    badge
                  </span>
                  <span>Configure GST &amp; Tax Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="ledger-toolbar">
                <div className="ledger-search-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>
                    search
                  </span>
                  <input
                    id="billingLedgerSearch"
                    type="text"
                    className="ledger-search-input"
                    placeholder="Search invoice #, plan, date..."
                    value={searchQuery}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="ledger-filter-group">
                  {/* Year Filter */}
                  <div className="ledger-filter-pills">
                    <button
                      type="button"
                      className={`btn-filter-pill ${yearFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setYearFilter('ALL')}
                    >
                      All Years
                    </button>
                    <button
                      type="button"
                      className={`btn-filter-pill ${yearFilter === '2026' ? 'active' : ''}`}
                      onClick={() => setYearFilter('2026')}
                    >
                      2026
                    </button>
                    <button
                      type="button"
                      className={`btn-filter-pill ${yearFilter === '2025' ? 'active' : ''}`}
                      onClick={() => setYearFilter('2025')}
                    >
                      2025
                    </button>
                  </div>

                  {/* Plan Type Filter */}
                  <div className="ledger-filter-pills">
                    <button
                      type="button"
                      className={`btn-filter-pill ${planTypeFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setPlanTypeFilter('ALL')}
                    >
                      All Plans
                    </button>
                    <button
                      type="button"
                      className={`btn-filter-pill ${planTypeFilter === 'JOB_PLANS' ? 'active' : ''}`}
                      onClick={() => setPlanTypeFilter('JOB_PLANS')}
                    >
                      Job Plans
                    </button>
                    <button
                      type="button"
                      className={`btn-filter-pill ${planTypeFilter === 'CV_ADDONS' ? 'active' : ''}`}
                      onClick={() => setPlanTypeFilter('CV_ADDONS')}
                    >
                      CV Add-ons
                    </button>
                  </div>

                  {/* Export CSV */}
                  <button
                    type="button"
                    className="btn-billing-secondary"
                    style={{ padding: '7px 12px', fontSize: '12.5px' }}
                    onClick={handleExportCsv}
                    title="Export Ledger as CSV for accounting"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      table_view
                    </span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="ledger-table-wrap">
                <table className="ledger-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Billing Date</th>
                      <th>Plan &amp; Service Description</th>
                      <th>SAC Code</th>
                      <th className="text-right">Taxable (INR)</th>
                      <th className="text-right">18% GST</th>
                      <th className="text-right">Total (INR)</th>
                      <th>Payment Method</th>
                      <th>ITC Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '40px 24px', color: '#64748b' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94a3b8' }}>
                              search_off
                            </span>
                            <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
                              No matching invoices found
                            </p>
                            <p style={{ margin: 0, fontSize: '13px' }}>
                              No records match your search criteria or selected filters.
                            </p>
                            <button
                              type="button"
                              className="btn-billing-secondary"
                              style={{ marginTop: '8px', padding: '6px 14px' }}
                              onClick={() => {
                                setSearchQuery('')
                                setYearFilter('ALL')
                                setPlanTypeFilter('ALL')
                              }}
                            >
                              Reset Filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv: EnterpriseInvoiceItem) => (
                        <tr key={inv.id}>
                          <td className="td-id">{inv.id}</td>
                          <td className="td-mono" style={{ color: '#475569' }}>{inv.date}</td>
                          <td>
                            <div className="td-plan-title">{inv.plan}</div>
                            <div className="td-plan-desc">{inv.description}</div>
                          </td>
                          <td className="td-mono" style={{ color: '#64748b', fontSize: '12px' }}>{inv.sacCode}</td>
                          <td className="text-right td-mono" style={{ fontWeight: 600 }}>
                            ₹{inv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right td-mono" style={{ color: '#64748b' }}>
                            ₹{inv.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-right td-mono" style={{ fontWeight: 800, color: '#0f172a' }}>
                            ₹{inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span style={{ fontSize: '12.5px', color: '#475569' }}>
                              {inv.paymentMethod.label}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge-paid">
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                check
                              </span>
                              <span>{inv.itcStatus}</span>
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="table-action-btns">
                              <button
                                type="button"
                                className="btn-icon-action"
                                title="Download GST Tax Invoice"
                                onClick={() => handleDownloadInvoice(inv)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                                  download
                                </span>
                              </button>
                              <button
                                type="button"
                                className="btn-icon-action"
                                title="View Digital Receipt"
                                onClick={() => setSelectedInvoice(inv)}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                                  visibility
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <footer className="ledger-footer">
                <div style={{ color: '#64748b' }}>
                  Showing {summaryMetrics.count} {summaryMetrics.count === 1 ? 'Invoice' : 'Invoices'} • 100% Tax Compliant under Rule 46 of CGST Rules
                </div>
                <div className="footer-totals">
                  <div className="total-badge-box">
                    Taxable Base: <strong>₹{summaryMetrics.totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="total-badge-box">
                    Total GST (18%): <strong style={{ color: '#059669' }}>₹{summaryMetrics.totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="total-badge-box">
                    Gross Paid: <strong style={{ color: '#0056d2' }}>₹{summaryMetrics.totalGross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>

      {/* ── 5. Modal: View Digital Receipt ── */}
      {selectedInvoice && (
        <div
          className="billing-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="billing-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="billing-modal-header">
              <h3 className="billing-modal-title">GST Tax Invoice Receipt</h3>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close invoice preview modal"
              >
                ✕
              </button>
            </div>

            <div className="billing-modal-body">
              <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Invoice Number:</span>
                  <strong style={{ fontFamily: 'monospace', color: '#0056d2' }}>{selectedInvoice.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Invoice Date:</span>
                  <span>{selectedInvoice.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Billed Entity:</span>
                  <strong>{taxDetails.companyName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Client GSTIN:</span>
                  <span>{taxDetails.gstin}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>SAC Code:</span>
                  <span>{selectedInvoice.sacCode} (Recruitment &amp; Staffing)</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{selectedInvoice.plan}</span>
                  <strong>₹{selectedInvoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12.5px' }}>
                  <span>Central GST (CGST 9%):</span>
                  <span>₹{(selectedInvoice.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12.5px' }}>
                  <span>State GST (SGST 9%):</span>
                  <span>₹{(selectedInvoice.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed #cbd5e1', paddingTop: '8px', fontSize: '16px', fontWeight: 800 }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: '#0056d2' }}>₹{selectedInvoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} INR</span>
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#065f46' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>verified</span>
                <span>Input Tax Credit (ITC) Eligible under Section 16 of CGST Act.</span>
              </div>
            </div>

            <div className="billing-modal-footer">
              <button
                type="button"
                className="btn-billing-secondary"
                onClick={() => setSelectedInvoice(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-billing-primary"
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
                  download
                </span>
                <span>Download Official Tax Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Modal: Edit Corporate Tax & GST Profile ── */}
      {isTaxModalOpen && (
        <div
          className="billing-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsTaxModalOpen(false)}
        >
          <div
            className="billing-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleTaxFormSubmit}>
              <div className="billing-modal-header">
                <h3 className="billing-modal-title">Corporate Tax &amp; GST Details</h3>
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setIsTaxModalOpen(false)}
                  aria-label="Close tax profile modal"
                >
                  ✕
                </button>
              </div>

              <div className="billing-modal-body">
                <div className="billing-form-group">
                  <label className="billing-form-label">Registered Legal Entity Name:</label>
                  <input
                    type="text"
                    required
                    className="billing-form-input"
                    value={taxForm.companyName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxForm({ ...taxForm, companyName: e.target.value })}
                  />
                </div>

                <div className="billing-form-group">
                  <label className="billing-form-label">15-Digit Company GSTIN:</label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    className="billing-form-input"
                    value={taxForm.gstin}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value.toUpperCase().trim()
                      const derivedPan = extractPanFromGstin(val)
                      setTaxForm((prev) => ({
                        ...prev,
                        gstin: val,
                        pan: derivedPan || prev.pan,
                      }))
                    }}
                  />
                </div>

                <div className="billing-form-group">
                  <label className="billing-form-label">Company PAN:</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="billing-form-input"
                    value={taxForm.pan}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxForm({ ...taxForm, pan: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="billing-form-group">
                  <label className="billing-form-label">Invoicing &amp; Finance Email:</label>
                  <input
                    type="email"
                    required
                    className="billing-form-input"
                    value={taxForm.accountsEmail}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxForm({ ...taxForm, accountsEmail: e.target.value })}
                  />
                </div>

                <div className="billing-form-group">
                  <label className="billing-form-label">Registered Billing Address:</label>
                  <input
                    type="text"
                    className="billing-form-input"
                    value={taxForm.billingAddress}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setTaxForm({ ...taxForm, billingAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="billing-modal-footer">
                <button
                  type="button"
                  className="btn-billing-secondary"
                  onClick={() => setIsTaxModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-billing-primary"
                >
                  Save Tax Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
