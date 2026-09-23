import { useState, useRef, useEffect, type FC, type KeyboardEvent } from 'react'
import './CustomSortDropdown.css'

export interface SortOptionItem<T extends string> {
  value: T
  label: string
  icon?: string
  description?: string
}

export interface CustomSortDropdownProps<T extends string> {
  value: T
  options: SortOptionItem<T>[]
  onChange: (value: T) => void
  labelPrefix?: string
  ariaLabel?: string
  id?: string
  align?: 'left' | 'right'
}

export const CustomSortDropdown = <T extends string>({
  value,
  options,
  onChange,
  labelPrefix = 'Sort:',
  ariaLabel = 'Sort options',
  id = 'custom-sort-dropdown',
  align = 'right',
}: CustomSortDropdownProps<T>): ReturnType<FC> => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value)
        const nextIndex = (currentIndex + 1) % options.length
        onChange(options[nextIndex].value)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
      } else {
        const currentIndex = options.findIndex((opt) => opt.value === value)
        const prevIndex = (currentIndex - 1 + options.length) % options.length
        onChange(options[prevIndex].value)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        setIsOpen(true)
      }
    }
  }

  const handleSelectOption = (optValue: T) => {
    onChange(optValue)
    setIsOpen(false)
  }

  return (
    <div
      ref={dropdownRef}
      className={`cs-dropdown-container ${isOpen ? 'is-open' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        className={`cs-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="material-symbols-outlined cs-trigger-icon" aria-hidden="true">
          sort
        </span>
        <span className="cs-trigger-label-group">
          <span className="cs-trigger-prefix">{labelPrefix}</span>
          <span className="cs-trigger-value">{selectedOption?.label}</span>
        </span>
        <span
          className={`material-symbols-outlined cs-trigger-chevron ${isOpen ? 'rotated' : ''}`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`cs-dropdown-menu ${align === 'left' ? 'align-left' : 'align-right'}`}
          role="listbox"
          aria-labelledby={id}
        >
          <div className="cs-dropdown-header">
            <span className="cs-dropdown-header-title">Sort Criteria</span>
            <span className="material-symbols-outlined cs-header-icon" aria-hidden="true">
              tune
            </span>
          </div>

          <div className="cs-dropdown-list">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`cs-dropdown-item ${isSelected ? 'selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectOption(option.value)}
                >
                  <div className="cs-item-left">
                    {option.icon && (
                      <span className="cs-item-icon-box" aria-hidden="true">
                        <span className="material-symbols-outlined cs-item-icon">
                          {option.icon}
                        </span>
                      </span>
                    )}
                    <div className="cs-item-text">
                      <span className="cs-item-label">{option.label}</span>
                      {option.description && (
                        <span className="cs-item-desc">{option.description}</span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="material-symbols-outlined cs-item-check" aria-hidden="true">
                      check
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
