import { useState, useRef, useEffect, type FC, type KeyboardEvent } from 'react'
import type { ApplicationDBStatus } from '../hooks/useApplicants'
import './CandidateStatusDropdown.css'

export interface StatusConfigItem {
  value: ApplicationDBStatus
  label: string
  shortLabel: string
  icon: string
  color: string
  bg: string
  borderColor: string
  description?: string
}

export const STATUS_CONFIG: Record<ApplicationDBStatus, StatusConfigItem> = {
  new: {
    value: 'new',
    label: 'New',
    shortLabel: 'New',
    icon: 'fiber_new',
    color: '#1d4ed8',
    bg: '#eff6ff',
    borderColor: '#bfdbfe',
    description: 'Awaiting initial review',
  },
  in_review: {
    value: 'in_review',
    label: 'In Review',
    shortLabel: 'In Review',
    icon: 'hourglass_top',
    color: '#b45309',
    bg: '#fffbeb',
    borderColor: '#fde68a',
    description: 'Active candidate screening',
  },
  shortlisted: {
    value: 'shortlisted',
    label: 'Shortlisted',
    shortLabel: 'Shortlisted',
    icon: 'star',
    color: '#047857',
    bg: '#ecfdf5',
    borderColor: '#a7f3d0',
    description: 'Selected for evaluation',
  },
  scheduled: {
    value: 'scheduled',
    label: 'Scheduled',
    shortLabel: 'Scheduled',
    icon: 'videocam',
    color: '#6d28d9',
    bg: '#f5f3ff',
    borderColor: '#ddd6fe',
    description: 'Interview scheduled',
  },
  rejected: {
    value: 'rejected',
    label: 'Rejected',
    shortLabel: 'Rejected',
    icon: 'cancel',
    color: '#b91c1c',
    bg: '#fef2f2',
    borderColor: '#fecaca',
    description: 'Application declined',
  },
  offered: {
    value: 'offered',
    label: 'Offer Extended',
    shortLabel: 'Offered',
    icon: 'local_offer',
    color: '#0e7490',
    bg: '#ecfeff',
    borderColor: '#a5f3fc',
    description: 'Formal employment offer pending',
  },
  hired: {
    value: 'hired',
    label: 'Hired',
    shortLabel: 'Hired',
    icon: 'verified',
    color: '#15803d',
    bg: '#f0fdf4',
    borderColor: '#bbf7d0',
    description: 'Candidate accepted position',
  },
}

export const STATUS_OPTIONS: StatusConfigItem[] = [
  STATUS_CONFIG.new,
  STATUS_CONFIG.in_review,
  STATUS_CONFIG.shortlisted,
  STATUS_CONFIG.scheduled,
  STATUS_CONFIG.rejected,
]

interface CandidateStatusDropdownProps {
  value: ApplicationDBStatus
  onChange: (newStatus: ApplicationDBStatus) => void
  disabled?: boolean
  candidateName?: string
  id?: string
}

export const CandidateStatusDropdown: FC<CandidateStatusDropdownProps> = ({
  value,
  onChange,
  disabled = false,
  candidateName,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentConfig = STATUS_CONFIG[value] || STATUS_CONFIG.in_review

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const curIdx = STATUS_OPTIONS.findIndex((o) => o.value === value)
        const nextIdx = (curIdx + 1) % STATUS_OPTIONS.length
        onChange(STATUS_OPTIONS[nextIdx].value)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const curIdx = STATUS_OPTIONS.findIndex((o) => o.value === value)
        const prevIdx = (curIdx - 1 + STATUS_OPTIONS.length) % STATUS_OPTIONS.length
        onChange(STATUS_OPTIONS[prevIdx].value)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
  }

  const handleSelect = (newStatus: ApplicationDBStatus) => {
    if (newStatus !== value) {
      onChange(newStatus)
    }
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className={`status-dropdown-root ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
      onKeyDown={handleKeyDown}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className={`status-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Change status for ${candidateName || 'candidate'}, currently ${currentConfig.label}`}
        title={`Change status (currently ${currentConfig.label})`}
      >
        <span
          className="status-dot-indicator"
          style={{ background: currentConfig.color }}
          aria-hidden="true"
        />
        <span className="status-trigger-label">
          <span className="status-label-prefix">Status:</span>{' '}
          <strong className="status-label-value">{currentConfig.shortLabel}</strong>
        </span>
        <span
          className={`material-symbols-outlined status-trigger-chevron ${isOpen ? 'rotated' : ''}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className="status-dropdown-menu"
          role="listbox"
          aria-label="Application Stage Options"
        >
          <div className="status-menu-header">
            <span>PIPELINE STAGE</span>
          </div>

          <div className="status-menu-items">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`status-menu-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div
                    className="status-item-icon-box"
                    style={{ background: opt.bg, color: opt.color, borderColor: opt.borderColor }}
                    aria-hidden="true"
                  >
                    <span className="material-symbols-outlined">{opt.icon}</span>
                  </div>

                  <div className="status-item-text">
                    <div className="status-item-title-row">
                      <span className="status-item-title">{opt.label}</span>
                      {isSelected && (
                        <span
                          className="material-symbols-outlined status-item-check"
                          aria-hidden="true"
                        >
                          check
                        </span>
                      )}
                    </div>
                    {opt.description && (
                      <span className="status-item-desc">{opt.description}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
