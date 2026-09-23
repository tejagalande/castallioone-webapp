import React, { useState, useRef, useEffect, useCallback } from 'react'

interface YearPickerProps {
  id?: string
  value: string
  onChange: (year: string) => void
  onBlur?: () => void
  hasError?: boolean
}

export const YearPicker: React.FC<YearPickerProps> = ({
  id,
  value,
  onChange,
  onBlur,
  hasError,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  // Base decade on currently selected year or current year
  const initialYear = value ? parseInt(value, 10) : currentYear
  const [decadeStart, setDecadeStart] = useState(() => Math.floor(initialYear / 10) * 10)

  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false)
          onBlur?.()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, onBlur])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        onBlur?.()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onBlur])

  const handlePrevDecade = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setDecadeStart((prev) => Math.max(1800, prev - 10))
  }, [])

  const handleNextDecade = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setDecadeStart((prev) => Math.min(Math.floor(currentYear / 10) * 10, prev + 10))
  }, [currentYear])

  const handleSelectYear = (yearNum: number) => {
    onChange(yearNum.toString())
    setIsOpen(false)
    onBlur?.()
  }

  // Generate 12 years for the grid (from decadeStart to decadeStart + 11)
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i)

  return (
    <div className="year-picker-container" ref={containerRef}>
      <button
        type="button"
        id={id}
        className={`year-picker-trigger ${hasError ? 'has-error' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={value ? `Selected year: ${value}` : 'Select Establishment Year'}
      >
        <div className="year-picker-value">
          <svg className="calendar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={{ color: value ? '#111827' : '#9ca3af' }}>
            {value ? `${value} (Established)` : 'Choose establishment year...'}
          </span>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            color: '#6b7280',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="year-picker-popover" role="dialog" aria-modal="true" aria-label="Year Picker">
          <div className="year-picker-header">
            <button
              type="button"
              className="decade-btn"
              onClick={handlePrevDecade}
              disabled={decadeStart <= 1800}
              aria-label="Previous Decade"
            >
              &lsaquo;
            </button>
            <span className="decade-label">
              {decadeStart} &ndash; {decadeStart + 9}
            </span>
            <button
              type="button"
              className="decade-btn"
              onClick={handleNextDecade}
              disabled={decadeStart >= Math.floor(currentYear / 10) * 10}
              aria-label="Next Decade"
            >
              &rsaquo;
            </button>
          </div>

          <div className="year-grid">
            {years.map((y) => {
              const isFuture = y > currentYear
              const isSelected = value === y.toString()

              return (
                <button
                  key={y}
                  type="button"
                  className={`year-btn ${isSelected ? 'selected' : ''}`}
                  disabled={isFuture || y < 1800}
                  onClick={() => handleSelectYear(y)}
                  aria-pressed={isSelected}
                >
                  {y}
                </button>
              )
            })}
          </div>

          <div className="year-picker-shortcuts">
            <span style={{ fontSize: '11px', color: '#9ca3af', alignSelf: 'center', marginRight: '4px' }}>
              Quick:
            </span>
            {[currentYear, 2020, 2015, 2010, 2000, 1990].map((quickYear) => (
              <button
                key={quickYear}
                type="button"
                className="shortcut-chip"
                onClick={() => {
                  setDecadeStart(Math.floor(quickYear / 10) * 10)
                  handleSelectYear(quickYear)
                }}
              >
                {quickYear}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
