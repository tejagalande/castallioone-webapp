import { useState, type FC } from 'react'
import type { RecipientOption } from './types'

interface ComposeInquiryModalProps {
  isOpen: boolean
  onClose: () => void
  availableRecipients: RecipientOption[]
  userRole: 'employer' | 'talent' | 'guest'
  onSubmit: (candidateId: string, companyId: string, message: string) => void
}

export const ComposeInquiryModal: FC<ComposeInquiryModalProps> = ({
  isOpen,
  onClose,
  availableRecipients,
  userRole,
  onSubmit,
}) => {
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('')
  const [customSubject, setCustomSubject] = useState<string>('Parametric Facade Optimization & LOD-400 Coordination')
  const [messageBody, setMessageBody] = useState<string>('')

  if (!isOpen) return null

  const effectiveRecipientId = selectedRecipientId || (availableRecipients[0]?.id ?? '')

  const handleDispatch = () => {
    const selected = availableRecipients.find((r) => r.id === effectiveRecipientId) || availableRecipients[0]
    if (!selected) {
      onClose()
      return
    }

    const fullMessage = customSubject ? `[Subject: ${customSubject}]\n\n${messageBody}` : messageBody
    onSubmit(selected.candidateId, selected.companyId, fullMessage)
    setMessageBody('')
  }

  return (
    <div
      className="msg-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="msg-modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="msg-modal-header">
          <h3 className="msg-modal-title">
            {userRole === 'employer' ? 'Message Candidate Applicant' : 'Compose Direct AEC Inquiry'}
          </h3>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="msg-modal-body">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
              {userRole === 'employer' ? 'Candidate Recipient:' : 'Target AEC Firm / Practice:'}
            </label>
            {availableRecipients.length > 0 ? (
              <select
                value={effectiveRecipientId}
                onChange={(e) => setSelectedRecipientId(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '14px', fontFamily: 'inherit' }}
              >
                {availableRecipients.map((rec) => (
                  <option key={rec.id} value={rec.id}>
                    {rec.name} ({rec.subtitle})
                  </option>
                ))}
              </select>
            ) : userRole === 'talent' ? (
              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#64748b', marginBottom: '4px' }}>
                  lock
                </span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Messaging Unlocks Upon Application
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                  You can chat with companies once you apply for their open positions. Explore positions in Find Jobs and submit an application to start chatting.
                </p>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                No active candidate applicants found.
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
              Inquiry Topic / Requisition:
            </label>
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              placeholder="e.g. LOD-400 Technical Review Scope"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
              Encrypted Message:
            </label>
            <textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={5}
              placeholder="Introduce capabilities, verified LOD-400 scripts, or inquiry notes..."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0, 65, 143, 0.05)', border: '1px solid rgba(0, 65, 143, 0.15)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#00418f' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              lock
            </span>
            <span>Mutual ISO 27001 NDA token will automatically be attached to this transmission.</span>
          </div>
        </div>

        <div className="msg-modal-footer">
          <button
            type="button"
            className="btn-msg-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-msg-primary"
            onClick={handleDispatch}
            disabled={availableRecipients.length === 0}
            title={availableRecipients.length === 0 ? 'Apply to a position first to message a studio' : 'Send inquiry'}
          >
            {availableRecipients.length === 0 ? 'Apply to a Studio First' : 'Dispatch Transmission'}
          </button>
        </div>
      </div>
    </div>
  )
}
