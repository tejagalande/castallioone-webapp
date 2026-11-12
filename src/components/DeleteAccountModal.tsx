import React, { useState, useEffect } from 'react'
import './DeleteAccountModal.css'

export interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  role: 'talent' | 'company'
  entityName?: string
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  role,
  entityName,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setConfirmationInput('')
      setErrorMessage(null)
      setIsDeleting(false)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen) return null

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE'

  const handleDelete = async () => {
    if (!isConfirmed || isDeleting) return

    setIsDeleting(true)
    setErrorMessage(null)

    try {
      await onConfirm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account. Please try again.'
      setErrorMessage(msg)
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="delete-modal-backdrop"
      onClick={() => {
        if (!isDeleting) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="delete-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="delete-modal-header">
          <div className="delete-icon-wrapper" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 id="delete-account-title" className="delete-modal-title">
            Delete {role === 'company' ? 'Company' : 'Talent'} Account?
          </h2>
          <p className="delete-modal-subtitle">
            This action is <strong>permanent</strong> and <strong>cannot be undone</strong>.
          </p>
        </div>

        <div className="delete-modal-body">
          {entityName && (
            <div className="delete-entity-badge">
              <span className="delete-entity-dot" />
              <span>
                Account: <strong>{entityName}</strong> ({role === 'company' ? 'Enterprise' : 'Talent'})
              </span>
            </div>
          )}

          <div className="delete-warning-box">
            <p className="delete-warning-heading">What will be permanently erased:</p>
            {role === 'company' ? (
              <ul className="delete-consequences-list">
                <li>Your company profile, verification records, and MSME/MCA documents.</li>
                <li>All active job posts, walk-in drives, and associated applications.</li>
                <li>Candidate conversation histories, interviews, and candidate shortlists.</li>
                <li>Active subscriptions will be immediately canceled without refund.</li>
              </ul>
            ) : (
              <ul className="delete-consequences-list">
                <li>Your candidate profile, resume PDF, and verified AEC credentials.</li>
                <li>All active job applications, interview schedules, and saved jobs.</li>
                <li>Direct messaging sessions and recruiter interaction history.</li>
                <li>Search discoverability for enterprise recruiters.</li>
              </ul>
            )}
          </div>

          <div className="delete-input-group">
            <label htmlFor="confirm-delete-input" className="delete-input-label">
              To confirm, type <span className="delete-match-code">DELETE</span> below:
            </label>
            <input
              id="confirm-delete-input"
              type="text"
              className="delete-text-input"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="Type DELETE"
              disabled={isDeleting}
              autoComplete="off"
              autoFocus
            />
          </div>

          {errorMessage && (
            <div className="delete-error-banner" role="alert">
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="btn-delete-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-delete-confirm"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="delete-spinner" />
                <span>Deleting Account...</span>
              </>
            ) : (
              'Permanently Delete Account'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

