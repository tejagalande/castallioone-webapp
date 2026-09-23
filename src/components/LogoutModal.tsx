import React, { useState } from 'react'
import './LogoutModal.css'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  userName?: string
  role?: 'Employer' | 'Talent' | 'Professional'
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  role = 'User',
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await onConfirm()
    } finally {
      setIsLoggingOut(false)
      onClose()
    }
  }

  return (
    <div className="logout-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="logout-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-body">
          <div className="logout-icon-container">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          <h2 className="logout-modal-title">Sign Out of Castallio One?</h2>
          <p className="logout-modal-text">
            Are you sure you want to end your current session? You will need to sign back in
            to access your {role.toLowerCase()} dashboard, active workflows, and workspace tools.
          </p>

          {userName && (
            <div className="logout-user-badge">
              <span className="logout-user-dot" />
              <span>Signed in as: <strong>{userName}</strong> ({role})</span>
            </div>
          )}

          <div className="logout-modal-actions">
            <button
              type="button"
              className="logout-btn-cancel"
              onClick={onClose}
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              type="button"
              className="logout-btn-confirm"
              onClick={handleConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="logout-spinner" />
                  <span>Signing Out...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
