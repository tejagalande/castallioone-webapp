import { useState, useMemo, type FC, type ChangeEvent, type FormEvent } from 'react'
import {
  useInterviews,
  type InterviewSession,
} from './useInterviews'
import { CustomSortDropdown, type SortOptionItem } from '../components/CustomSortDropdown'
import './Interviews.css'

export interface InterviewsProps {
  onNavigateToFindJobs?: () => void
}

const FORMAT_OPTIONS: SortOptionItem<string>[] = [
  { value: 'all', label: 'All Formats', icon: 'devices' },
  { value: 'Google Meet', label: 'Google Meet', icon: 'videocam' },
  { value: 'Microsoft Teams', label: 'Microsoft Teams', icon: 'groups' },
  { value: 'Zoom', label: 'Zoom', icon: 'video_call' },
  { value: 'In-Person', label: 'In-Person', icon: 'apartment' },
]

function formatTimeTo12Hour(time24: string): string {
  if (!time24) return ''
  const trimmed = time24.trim()
  if (/AM|PM/i.test(trimmed)) return trimmed
  const parts = trimmed.split(':')
  if (parts.length < 2) return time24
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1].slice(0, 2)
  if (isNaN(hours)) return time24
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

function parseTimeTo24Hour(timeStr: string): string {
  if (!timeStr) return '11:00'
  const trimmed = timeStr.trim()
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return '11:00'
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const ampm = match[3]?.toUpperCase()
  if (ampm === 'PM' && hours < 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

const QUICK_TIME_SLOTS = [
  { label: '09:00 AM', time24: '09:00' },
  { label: '10:30 AM', time24: '10:30' },
  { label: '11:30 AM', time24: '11:30' },
  { label: '02:00 PM', time24: '14:00' },
  { label: '03:30 PM', time24: '15:30' },
  { label: '05:00 PM', time24: '17:00' },
]

export const Interviews: FC<InterviewsProps> = ({ onNavigateToFindJobs }) => {
  const {
    interviews,
    filteredInterviews,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    formatFilter,
    setFormatFilter,
    roleFilter,
    setRoleFilter,
    uniqueRoles,
    kpis,
    availableCandidates,
    selectedSessionForFeedback,
    setSelectedSessionForFeedback,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    isScheduleNewModalOpen,
    setIsScheduleNewModalOpen,
    toastMessage,
    showToast,
    handleScheduleNewInterview,
    handleReschedule,
    handleSaveEvaluation,
    handleCancelInterview,
    handleSyncCalendar,
  } = useInterviews()

  const todayStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [prevFilterKey, setPrevFilterKey] = useState<string>('')
  const itemsPerPage = 5

  // Reset pagination to page 1 whenever search query or filters change
  const currentFilterKey = `${searchQuery}_${formatFilter}_${roleFilter}_${activeTab}`
  if (currentFilterKey !== prevFilterKey) {
    setPrevFilterKey(currentFilterKey)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const paginatedInterviews = useMemo(() => {
    return filteredInterviews.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredInterviews, startIndex, itemsPerPage])

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState<string>('')
  const [rescheduleTime, setRescheduleTime] = useState<string>('11:00')
  const [rescheduleReason, setRescheduleReason] = useState<string>('Candidate requested alternate slot')

  // Real-time Reschedule Validation
  const rescheduleValidation = useMemo(() => {
    if (!selectedSessionForReschedule) return { valid: false, error: null, warning: null }
    if (!rescheduleDate) {
      return { valid: false, error: 'Please choose a rescheduled interview date.', warning: null }
    }
    if (!rescheduleTime) {
      return { valid: false, error: 'Please select a valid time slot.', warning: null }
    }

    if (rescheduleDate < todayStr) {
      return {
        valid: false,
        error: 'The rescheduled date cannot be in the past. Please select today or an upcoming date.',
        warning: null,
      }
    }

    if (rescheduleDate === todayStr) {
      const now = new Date()
      const parts = rescheduleTime.split(':')
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10) || 0
      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const selectedMinutes = hours * 60 + minutes
      if (selectedMinutes <= currentMinutes + 10) {
        return {
          valid: false,
          error: "For today's sessions, please select a time slot at least 15 minutes ahead of current time.",
          warning: null,
        }
      }
    }

    const formatted12h = formatTimeTo12Hour(rescheduleTime)
    const originalTime24 = parseTimeTo24Hour(selectedSessionForReschedule.interviewTime)
    if (
      rescheduleDate === selectedSessionForReschedule.interviewDate &&
      (formatted12h === selectedSessionForReschedule.interviewTime ||
        rescheduleTime === originalTime24)
    ) {
      return {
        valid: false,
        error: 'The selected date and time slot match the current schedule. Please choose a different date or time.',
        warning: null,
      }
    }

    // Warnings (non-blocking)
    let warning: string | null = null
    const [hStr] = rescheduleTime.split(':')
    const h = parseInt(hStr, 10)
    if (h < 8 || h >= 20) {
      warning = 'Note: The selected time is outside standard business hours (8:00 AM – 8:00 PM).'
    } else {
      const d = new Date(rescheduleDate + 'T12:00:00')
      const day = d.getDay()
      if (day === 0 || day === 6) {
        warning = 'Note: The selected date falls on a weekend.'
      }
    }

    return { valid: true, error: null, warning }
  }, [selectedSessionForReschedule, rescheduleDate, rescheduleTime, todayStr])

  // Scorecard Form State
  const [evalScore, setEvalScore] = useState<number>(90)
  const [evalRecommendation, setEvalRecommendation] = useState<InterviewSession['recommendation']>('Hire')
  const [evalNotes, setEvalNotes] = useState<string>('')

  // New Interview Form State
  const [newCandidateName, setNewCandidateName] = useState<string>('')
  const [newCandidateRole, setNewCandidateRole] = useState<string>('Structural Engineer')
  const [newDate, setNewDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().slice(0, 10)
  })
  const [newTime, setNewTime] = useState<string>('11:00')
  const [newType, setNewType] = useState<InterviewSession['interviewType']>('Technical Review')
  const [newLocationType, setNewLocationType] = useState<InterviewSession['locationType']>('Google Meet')
  const [newLocationVal, setNewLocationVal] = useState<string>('https://meet.google.com/cas-interview')
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState<boolean>(false)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Open Reschedule Modal
  const openRescheduleModal = (session: InterviewSession) => {
    setSelectedSessionForReschedule(session)
    const initialDate = session.interviewDate >= todayStr ? session.interviewDate : todayStr
    setRescheduleDate(initialDate)
    setRescheduleTime(parseTimeTo24Hour(session.interviewTime))
    setRescheduleReason('Candidate requested alternate slot')
  }

  // Open Feedback Modal
  const openFeedbackModal = (session: InterviewSession) => {
    setSelectedSessionForFeedback(session)
    setEvalScore(session.score || 90)
    setEvalRecommendation(session.recommendation || 'Hire')
    setEvalNotes(session.interviewerNotes || '')
  }

  const roleOptions: SortOptionItem<string>[] = [
    { value: 'all', label: 'All Roles', icon: 'work' },
    ...uniqueRoles.map((r) => ({
      value: r,
      label: r,
      icon: 'badge',
    })),
  ]

  // Submit Reschedule
  const onSubmitReschedule = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSessionForReschedule || !rescheduleValidation.valid) return
    const formatted12h = formatTimeTo12Hour(rescheduleTime)
    handleReschedule(
      selectedSessionForReschedule.id,
      rescheduleDate,
      formatted12h,
      rescheduleReason.trim() || undefined
    )
  }

  // Submit Evaluation Scorecard
  const onSubmitEvaluation = (e: FormEvent) => {
    e.preventDefault()
    if (!selectedSessionForFeedback) return
    handleSaveEvaluation(
      selectedSessionForFeedback.id,
      evalScore,
      evalRecommendation,
      evalNotes
    )
  }

  return (
    <main className="interviews-page" aria-label="Interviews and Technical Assessments">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="int-toast" role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. Header Area ── */}
      <section className="int-header-area">
        <div>
          <div className="int-overline-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">
              event_available
            </span>
            <span>INTERVIEW OPERATIONS &amp; CANDIDATE EVALUATIONS</span>
          </div>
          <h1 className="int-header-title">Interviews &amp; Technical Rounds</h1>
          <p className="int-header-desc">
            Coordinate upcoming candidate rounds, manage video meeting links, and submit reviewer evaluation scorecards
            across all active requisitions.
          </p>
        </div>

        <div className="int-header-actions">
          <button
            type="button"
            className="btn-int-secondary"
            onClick={handleSyncCalendar}
            title="Export Calendar (.ics)"
          >
            <span className="material-symbols-outlined text-primary" aria-hidden="true">
              calendar_month
            </span>
            <span>Sync Calendar (.ics)</span>
          </button>

          <button
            type="button"
            className="btn-int-primary"
            onClick={() => setIsScheduleNewModalOpen(true)}
            title="Schedule a New Interview Round"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              add_circle
            </span>
            <span>Schedule New Interview</span>
          </button>
        </div>
      </section>

      {/* ── 2. 4 KPI Metrics Cards ── */}
      <section className="int-metrics-grid" aria-label="Interview Metrics">
        {/* KPI 1 */}
        <article className="int-metric-card">
          <div className="int-metric-top">
            <span className="int-metric-label">Upcoming Rounds</span>
            <div className="int-metric-icon-box">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                event_upcoming
              </span>
            </div>
          </div>
          <div className="int-metric-val-row">
            <span className="int-metric-num">{kpis.upcomingCount}</span>
            <span className="int-metric-subtext">Active Scheduled</span>
          </div>
          <p className="int-metric-desc">Candidates awaiting technical evaluation</p>
          <div className="int-metric-footer-pill">
            <span>STATUS:</span>
            <span style={{ color: '#00418f', fontWeight: 700 }}>PIPELINE ACTIVE</span>
          </div>
        </article>

        {/* KPI 2 */}
        <article className="int-metric-card">
          <div className="int-metric-top">
            <span className="int-metric-label">Today's Sessions</span>
            <div className="int-metric-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                today
              </span>
            </div>
          </div>
          <div className="int-metric-val-row">
            <span className="int-metric-num" style={{ color: '#1d4ed8' }}>
              {kpis.todayCount}
            </span>
            <span className="int-metric-subtext">Scheduled Today</span>
          </div>
          <p className="int-metric-desc">Live rounds scheduled on current date</p>
          <div className="int-metric-footer-pill">
            <span>AGENDA:</span>
            <span style={{ color: '#1d4ed8', fontWeight: 700 }}>
              {kpis.todayCount > 0 ? `${kpis.todayCount} PANELS READY` : 'NO SESSIONS TODAY'}
            </span>
          </div>
        </article>

        {/* KPI 3 */}
        <article className="int-metric-card">
          <div className="int-metric-top">
            <span className="int-metric-label">Pending Feedback</span>
            <div className="int-metric-icon-box" style={{ background: '#fffbeb', color: '#b45309' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                rate_review
              </span>
            </div>
          </div>
          <div className="int-metric-val-row">
            <span className="int-metric-num" style={{ color: '#b45309' }}>
              {kpis.needsFeedbackCount}
            </span>
            <span className="int-metric-subtext">Needs Review</span>
          </div>
          <p className="int-metric-desc">Completed sessions awaiting scorecard</p>
          <div className="int-metric-footer-pill">
            <span>SCORECARDS:</span>
            <span style={{ color: '#b45309', fontWeight: 700 }}>AWAITING INPUT</span>
          </div>
        </article>

        {/* KPI 4 */}
        <article className="int-metric-card">
          <div className="int-metric-top">
            <span className="int-metric-label">Completed Rounds</span>
            <div className="int-metric-icon-box" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                verified
              </span>
            </div>
          </div>
          <div className="int-metric-val-row">
            <span className="int-metric-num" style={{ color: '#15803d' }}>
              {kpis.completedCount}
            </span>
            <span className="int-metric-subtext">Evaluated</span>
          </div>
          <p className="int-metric-desc">Finished rounds with evaluation dossiers</p>
          <div className="int-metric-footer-pill">
            <span>DECISION ARCHIVE:</span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>LOGGED</span>
          </div>
        </article>
      </section>

      {/* ── 3. Filter Bar ── */}
      <section className="int-filter-bar" aria-label="Filter Sessions">
        <div className="int-tabs-row" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`int-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Scheduled Rounds ({interviews.filter((i) => i.status === 'scheduled').length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'completed'}
            className={`int-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span>Completed ({kpis.completedCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'cancelled'}
            className={`int-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            <span>Cancelled</span>
          </button>
        </div>

        <div className="int-controls-cluster">
          <div className="int-search-wrap">
            <span className="material-symbols-outlined int-search-icon" aria-hidden="true">
              search
            </span>
            <input
              type="text"
              placeholder="Search candidate, role, or format..."
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search interviews"
            />
          </div>

          {/* Enhanced Custom Format Dropdown */}
          <CustomSortDropdown
            value={formatFilter}
            options={FORMAT_OPTIONS}
            onChange={setFormatFilter}
            labelPrefix="Format:"
            id="format-filter-dropdown"
            align="right"
          />

          {/* Enhanced Custom Role Dropdown */}
          {uniqueRoles.length > 0 && (
            <CustomSortDropdown
              value={roleFilter}
              options={roleOptions}
              onChange={setRoleFilter}
              labelPrefix="Role:"
              id="role-filter-dropdown"
              align="right"
            />
          )}

          <button
            type="button"
            className="btn-int-secondary"
            style={{ padding: '8px 10px' }}
            title="Reset Filters"
            onClick={() => {
              setSearchQuery('')
              setFormatFilter('all')
              setRoleFilter('all')
              setActiveTab('all')
              showToast('Filters reset to default view.')
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
              filter_list
            </span>
          </button>
        </div>
      </section>

      {/* ── 4. Main 2-Column Grid (8 Cols List / 4 Cols Sidebar) ── */}
      <section className="int-workspace-grid">
        {/* LEFT COLUMN: INTERVIEW CARDS (8 Cols) */}
        <div className="int-cards-column">
          {loading ? (
            <div className="int-shimmer-container" aria-busy="true" aria-label="Loading scheduled interviews">
              <div className="int-shimmer-banner">
                <span className="material-symbols-outlined spin-icon" aria-hidden="true">
                  sync
                </span>
                <span>Syncing scheduled interview sessions, calendar slots &amp; candidate rounds...</span>
              </div>
              {[1, 2, 3].map((skeletonId) => (
                <article key={skeletonId} className="int-skeleton-card">
                  {/* Top row: tags, candidate title, and timing status badge */}
                  <div className="int-card-top-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="int-shimmer int-skeleton-pill" style={{ width: '90px', height: '22px' }} />
                        <div className="int-shimmer int-skeleton-pill" style={{ width: '130px', height: '22px' }} />
                        <div className="int-shimmer int-skeleton-pill" style={{ width: '80px', height: '22px' }} />
                      </div>
                      <div className="int-shimmer int-skeleton-bar" style={{ width: '220px', height: '26px', marginTop: '4px' }} />
                      <div className="int-shimmer int-skeleton-bar" style={{ width: '310px', height: '15px' }} />
                    </div>
                    {/* Status badge skeleton */}
                    <div className="int-shimmer" style={{ width: '140px', height: '52px', borderRadius: '10px' }} />
                  </div>

                  {/* Schedule Ribbon with 3 cells */}
                  <div className="int-schedule-ribbon">
                    <div className="int-schedule-cell">
                      <div className="int-shimmer int-skeleton-pill" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                      <div className="cell-info" style={{ gap: '6px' }}>
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '40px', height: '11px' }} />
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '90px', height: '14px' }} />
                      </div>
                    </div>
                    <div className="int-schedule-cell">
                      <div className="int-shimmer int-skeleton-pill" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                      <div className="cell-info" style={{ gap: '6px' }}>
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '55px', height: '11px' }} />
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '80px', height: '14px' }} />
                      </div>
                    </div>
                    <div className="int-schedule-cell">
                      <div className="int-shimmer int-skeleton-pill" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                      <div className="cell-info" style={{ gap: '6px' }}>
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '75px', height: '11px' }} />
                        <div className="int-shimmer int-skeleton-bar" style={{ width: '100px', height: '14px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Notes / Agenda brief skeleton */}
                  <div className="int-shimmer" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />

                  {/* Bottom action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '4px' }}>
                    <div className="int-shimmer int-skeleton-pill" style={{ width: '160px', height: '36px', borderRadius: '8px' }} />
                    <div className="int-shimmer int-skeleton-pill" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
                    <div className="int-shimmer int-skeleton-pill" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
                  </div>
                </article>
              ))}
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="int-empty-state">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#727784' }}>
                event_busy
              </span>
              <h3>No Interviews Found</h3>
              <p>No candidate interview sessions match your current filter criteria.</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn-int-primary"
                  onClick={() => {
                    setSearchQuery('')
                    setFormatFilter('all')
                    setRoleFilter('all')
                    setActiveTab('all')
                  }}
                >
                  Reset Filters
                </button>
                {onNavigateToFindJobs && (
                  <button
                    type="button"
                    className="btn-int-secondary"
                    onClick={onNavigateToFindJobs}
                  >
                    Browse Open Requisitions
                  </button>
                )}
              </div>
            </div>
          ) : (
            paginatedInterviews.map((session) => {
              const isScheduled = session.status === 'scheduled'
              const isCompleted = session.status === 'completed'
              const isCancelled = session.status === 'cancelled'

              return (
                <article key={session.id} className={`int-card ${session.status}`}>
                  <div className="int-top-accent-bar" aria-hidden="true" />

                  {/* Card Header & Metadata */}
                  <div className="int-card-top-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Status Badge */}
                        <span
                          className="int-stage-overline-pill"
                          style={{
                            background: isCompleted ? '#f0fdf4' : isCancelled ? '#eeeef0' : '#eff6ff',
                            color: isCompleted ? '#15803d' : isCancelled ? '#727784' : '#1d4ed8',
                            borderColor: isCompleted ? '#bbf7d0' : isCancelled ? '#c2c6d5' : '#bfdbfe',
                          }}
                        >
                          {isScheduled && (
                            <span className="int-pulse-dot" style={{ width: '6px', height: '6px', background: '#1d4ed8' }} aria-hidden="true" />
                          )}
                          {session.status.toUpperCase()}
                        </span>

                        {/* Interview Type Pill */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#eeeef0',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '11px',
                            color: '#1a1c1e',
                            fontWeight: 600,
                          }}
                        >
                          <span className="material-symbols-outlined text-primary" style={{ fontSize: '13px' }} aria-hidden="true">
                            assignment
                          </span>
                          {session.interviewType}
                        </span>

                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#727784' }}>
                          {session.durationMinutes} min round
                        </span>
                      </div>

                      {/* Candidate Avatar, Name & Role */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                        {session.candidateAvatar ? (
                          <img
                            src={session.candidateAvatar}
                            alt={session.candidateName}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1.5px solid #d8e2fd',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: '#eff4ff',
                              color: '#1d4ed8',
                              border: '1.5px solid #bfdbfe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '15px',
                              fontFamily: 'Inter, sans-serif',
                              flexShrink: 0,
                            }}
                          >
                            {(session.candidateName || 'C').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h2 className="int-card-firm-title" style={{ margin: 0 }}>{session.candidateName}</h2>
                          <p className="int-card-studio-line" style={{ margin: '2px 0 0 0' }}>
                            Applied for: <strong style={{ color: '#00418f' }}>{session.candidateRole}</strong> •{' '}
                            <span>{session.companyName}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Modern Clean Round Status & Timing */}
                    {isScheduled ? (
                      <div className="int-status-badge-clean">
                        <div className="int-status-tag">
                          <span className="int-status-dot-pulse" aria-hidden="true" />
                          <span className="int-status-tag-label">CONFIRMED ROUND</span>
                        </div>
                        <div className="int-timing-subline">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            schedule
                          </span>
                          <span>{session.interviewTime}</span>
                        </div>
                      </div>
                    ) : isCompleted ? (
                      <div className="int-status-badge-clean completed">
                        <div className="int-status-tag completed">
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#15803d' }}>
                            check_circle
                          </span>
                          <span className="int-status-tag-label" style={{ color: '#15803d' }}>
                            EVALUATED
                          </span>
                        </div>
                        {session.recommendation && (
                          <div className="int-timing-subline" style={{ color: '#15803d' }}>
                            <span>Decision: {session.recommendation}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="int-status-badge-clean cancelled">
                        <div className="int-status-tag cancelled">
                          <span className="int-status-tag-label" style={{ color: '#727784' }}>
                            CANCELLED
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Schedule Info Ribbon */}
                  <div className="int-schedule-ribbon">
                    <div className="int-schedule-cell">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        calendar_today
                      </span>
                      <div className="cell-info">
                        <span className="label">Date</span>
                        <span className="value">{session.interviewDate}</span>
                      </div>
                    </div>

                    <div className="int-schedule-cell">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        pace
                      </span>
                      <div className="cell-info">
                        <span className="label">Time Slot</span>
                        <span className="value">{session.interviewTime}</span>
                      </div>
                    </div>

                    <div className="int-schedule-cell">
                      <span className="material-symbols-outlined" aria-hidden="true">
                        videocam
                      </span>
                      <div className="cell-info">
                        <span className="label">Channel / Mode</span>
                        <span className="value" style={{ color: '#00418f' }}>
                          {session.locationType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interview Notes / Agenda Brief */}
                  {session.interviewerNotes && (
                    <div style={{ background: '#f3f3f6', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', textTransform: 'uppercase', display: 'block', marginBottom: '3px' }}>
                        {isCompleted ? 'Evaluation & Reviewer Notes' : 'Round Agenda & Assessment Brief'}
                      </span>
                      <p style={{ margin: 0, color: '#1a1c1e', lineHeight: 1.45 }}>{session.interviewerNotes}</p>
                    </div>
                  )}

                  {/* Actions Bottom Bar */}
                  <div className="int-card-actions-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {isScheduled && (
                        <>
                          <a
                            href={session.locationValue.startsWith('http') ? session.locationValue : '#'}
                            target={session.locationValue.startsWith('http') ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="btn-int-primary"
                            style={{ textDecoration: 'none' }}
                            title={`Join ${session.locationType}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              meeting_room
                            </span>
                            <span>Join Meeting Room ↗</span>
                          </a>

                          <button
                            type="button"
                            className="btn-int-secondary"
                            onClick={() => openFeedbackModal(session)}
                            title="Submit Evaluation Scorecard"
                          >
                            <span className="material-symbols-outlined text-primary" aria-hidden="true">
                              rate_review
                            </span>
                            <span>Submit Scorecard</span>
                          </button>

                          <button
                            type="button"
                            className="btn-int-secondary"
                            onClick={() => openRescheduleModal(session)}
                            title="Reschedule this session"
                          >
                            <span className="material-symbols-outlined text-primary" aria-hidden="true">
                              edit_calendar
                            </span>
                            <span>Reschedule</span>
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <button
                          type="button"
                          className="btn-int-secondary"
                          onClick={() => openFeedbackModal(session)}
                          title="View / Edit Evaluation Dossier"
                        >
                          <span className="material-symbols-outlined text-primary" aria-hidden="true">
                            assignment_turned_in
                          </span>
                          <span>View Evaluation Scorecard</span>
                        </button>
                      )}
                    </div>

                    {isScheduled && (
                      <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                        onClick={() => handleCancelInterview(session.id)}
                        title="Cancel this interview round"
                      >
                        Cancel Session
                      </button>
                    )}
                  </div>
                </article>
              )
            })
          )}

          {/* Pagination Navigation */}
          {!loading && filteredInterviews.length > 0 && (
            <nav className="int-pagination-nav" aria-label="Interviews pagination">
              <div className="int-pagination-info">
                Showing <strong>{startIndex + 1}</strong> –{' '}
                <strong>{Math.min(startIndex + itemsPerPage, filteredInterviews.length)}</strong> of{' '}
                <strong>{filteredInterviews.length}</strong> interview sessions
              </div>

              {totalPages > 1 && (
                <div className="int-pagination-controls">
                  <button
                    type="button"
                    className="int-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safeCurrentPage === 1}
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chevron_left
                    </span>
                    <span>Previous</span>
                  </button>

                  <div className="int-page-numbers-group">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`int-page-number-btn ${safeCurrentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={safeCurrentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="int-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </nav>
          )}
        </div>

        {/* RIGHT COLUMN: INTERVIEW DESK SIDEBAR (4 Cols) */}
        <aside className="int-sidebar-column">
          {/* Widget 1: Evaluation Standard Rubric */}
          <div className="int-sidebar-card">
            <div className="int-sidebar-header">
              <div className="int-sidebar-title">
                <span className="material-symbols-outlined" aria-hidden="true">
                  checklist
                </span>
                <span>Evaluation Rubric</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', background: '#d8e2ff', color: '#00418f', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                STANDARD
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#424753', lineHeight: 1.45 }}>
              Benchmark candidate competencies across standard architectural and engineering criteria:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="int-focus-item">
                <span style={{ fontWeight: 500 }}>Technical &amp; BIM Mastery</span>
                <span className="int-focus-priority High">Weight 40%</span>
              </div>
              <div className="int-focus-item">
                <span style={{ fontWeight: 500 }}>Project &amp; Code Execution</span>
                <span className="int-focus-priority High">Weight 30%</span>
              </div>
              <div className="int-focus-item">
                <span style={{ fontWeight: 500 }}>Communication &amp; Team Fit</span>
                <span className="int-focus-priority Medium">Weight 30%</span>
              </div>
            </div>
          </div>

          {/* Widget 3: Interview Hiring Tip */}
          <div className="int-sidebar-card" style={{ background: '#f8faff', borderColor: 'rgba(0, 88, 188, 0.2)' }}>
            <div className="int-sidebar-header">
              <div className="int-sidebar-title" style={{ color: '#00418f' }}>
                <span className="material-symbols-outlined" aria-hidden="true">
                  lightbulb
                </span>
                <span>Recruitment Velocity</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: 1.45 }}>
              Candidates respond <strong>2.8x faster</strong> when evaluation scorecards and next-stage decisions are logged
              within 24 hours of round completion.
            </p>
          </div>
        </aside>
      </section>

      {/* ── MODAL 1: Reschedule Round ── */}
      {selectedSessionForReschedule && (
        <div
          className="int-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedSessionForReschedule(null)}
        >
          <div className="int-modal-window" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="int-modal-header">
              <h3 className="int-modal-title">Reschedule Interview Round</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setSelectedSessionForReschedule(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmitReschedule} className="int-modal-body">
              {/* Candidate Info & Comparison Banner */}
              <div className="int-reschedule-compare">
                <div className="int-compare-box">
                  <span className="int-compare-label">Current Scheduled Slot</span>
                  <span className="int-compare-val">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#727784' }} aria-hidden="true">
                      event
                    </span>
                    <span>{selectedSessionForReschedule.interviewDate} • {selectedSessionForReschedule.interviewTime}</span>
                  </span>
                </div>
                <div className="int-compare-box">
                  <span className="int-compare-label">New Proposed Slot</span>
                  <span className="int-compare-val highlight">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#00418f' }} aria-hidden="true">
                      update
                    </span>
                    <span>{rescheduleDate || 'Select date'} • {formatTimeTo12Hour(rescheduleTime) || 'Select time'}</span>
                  </span>
                </div>
              </div>

              {/* Candidate & Round summary */}
              <div>
                <strong style={{ fontSize: '14.5px', color: '#1a1c1e' }}>
                  {selectedSessionForReschedule.candidateName}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#727784' }}>
                  {selectedSessionForReschedule.candidateRole} • {selectedSessionForReschedule.interviewType} ({selectedSessionForReschedule.durationMinutes} min round)
                </p>
              </div>

              {/* Date Input with min={todayStr} */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  New Date <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="date"
                  className="int-input-box"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />
              </div>

              {/* Time Picker Row with native input type="time" and 12-hour formatted badge */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                    New Time Slot <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  {rescheduleTime && (
                    <span className="int-time-preview-badge">
                      Selected: {formatTimeTo12Hour(rescheduleTime)}
                    </span>
                  )}
                </div>

                <div className="int-time-picker-row">
                  <div className="int-time-picker-wrapper">
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Quick Time Slots */}
                <div className="int-quick-slots-container">
                  <span className="int-quick-slots-label">Quick Pick Slots:</span>
                  <div className="int-quick-slots-grid">
                    {QUICK_TIME_SLOTS.map((slot) => {
                      const isActive = rescheduleTime === slot.time24
                      return (
                        <button
                          key={slot.time24}
                          type="button"
                          className={`int-quick-slot-chip ${isActive ? 'active' : ''}`}
                          onClick={() => setRescheduleTime(slot.time24)}
                        >
                          {slot.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Reason for Reschedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  Reason for Rescheduling
                </label>
                <select
                  className="int-input-box"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                >
                  <option value="Candidate requested alternate slot">Candidate requested alternate slot</option>
                  <option value="Interviewer / Panelist schedule conflict">Interviewer / Panelist schedule conflict</option>
                  <option value="Internal technical round alignment">Internal technical round alignment</option>
                  <option value="Urgent operational rescheduling">Urgent operational rescheduling</option>
                  <option value="Other / Mutual consensus">Other / Mutual consensus</option>
                </select>
              </div>

              {/* Validation Feedback: Error Banner */}
              {rescheduleValidation.error && (
                <div className="int-validation-alert error" role="alert">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    error
                  </span>
                  <span>{rescheduleValidation.error}</span>
                </div>
              )}

              {/* Validation Feedback: Warning Banner */}
              {!rescheduleValidation.error && rescheduleValidation.warning && (
                <div className="int-validation-alert warning" role="status">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    warning
                  </span>
                  <span>{rescheduleValidation.warning}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="int-modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-int-secondary"
                  onClick={() => setSelectedSessionForReschedule(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-int-primary"
                  disabled={!rescheduleValidation.valid}
                  style={!rescheduleValidation.valid ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  title={rescheduleValidation.error || 'Confirm updated schedule'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">
                    schedule_send
                  </span>
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Evaluation Scorecard Modal ── */}
      {selectedSessionForFeedback && (
        <div
          className="int-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedSessionForFeedback(null)}
        >
          <div className="int-modal-window" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="int-modal-header">
              <h3 className="int-modal-title">Candidate Evaluation Scorecard</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setSelectedSessionForFeedback(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmitEvaluation} className="int-modal-body">
              <div>
                <strong style={{ fontSize: '15px', color: '#1a1c1e' }}>
                  {selectedSessionForFeedback.candidateName}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#727784' }}>
                  {selectedSessionForFeedback.candidateRole} • {selectedSessionForFeedback.interviewType}
                </p>
              </div>

              {/* Overall Score (0-100) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  Overall Assessment Score (0 - 100): <strong>{evalScore}%</strong>
                </label>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={evalScore}
                  onChange={(e) => setEvalScore(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00418f' }}
                />
              </div>

              {/* Hiring Recommendation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  Hiring Recommendation
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['Strong Hire', 'Hire', 'Hold', 'Decline'] as InterviewSession['recommendation'][]).map(
                    (rec) => (
                      <button
                        key={rec}
                        type="button"
                        className={`int-tab-btn ${evalRecommendation === rec ? 'active' : ''}`}
                        onClick={() => setEvalRecommendation(rec)}
                        style={{ flex: 1, padding: '7px 4px', fontSize: '12px' }}
                      >
                        {rec}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Notes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  Reviewer Notes &amp; Observations
                </label>
                <textarea
                  className="int-input-box"
                  rows={4}
                  placeholder="Document candidate problem-solving, strengths, and alignment with requisition requirements..."
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="int-modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-int-secondary"
                  onClick={() => setSelectedSessionForFeedback(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-int-primary">
                  Save Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Schedule New Interview Modal ── */}
      {isScheduleNewModalOpen && (
        <div
          className="int-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsScheduleNewModalOpen(false)}
        >
          <div className="int-modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="int-modal-header">
              <h3 className="int-modal-title">Schedule New Candidate Interview</h3>
              <button
                type="button"
                className="btn-card-icon"
                onClick={() => setIsScheduleNewModalOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!newCandidateName.trim()) return
                setIsSubmittingSchedule(true)

                let formattedTime = newTime
                if (newTime && newTime.includes(':')) {
                  const [hStr, mStr] = newTime.split(':')
                  const h = parseInt(hStr, 10)
                  const m = mStr || '00'
                  const ampm = h >= 12 ? 'PM' : 'AM'
                  const h12 = h % 12 || 12
                  formattedTime = `${String(h12).padStart(2, '0')}:${m} ${ampm}`
                }

                const matched = availableCandidates.find(
                  (c) => c.name.toLowerCase() === newCandidateName.trim().toLowerCase()
                )

                const success = await handleScheduleNewInterview({
                  candidateName: newCandidateName.trim(),
                  candidateRole: newCandidateRole.trim() || 'Candidate',
                  candidateId: matched?.id,
                  jobApplicationId: matched?.applicationId,
                  interviewDate: newDate,
                  interviewTime: formattedTime,
                  interviewType: newType,
                  locationType: newLocationType,
                  locationValue: newLocationVal.trim(),
                })

                setIsSubmittingSchedule(false)
                if (success) {
                  setNewCandidateName('')
                  setNewCandidateRole('Structural Engineer')
                }
              }}
              className="int-modal-body"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>
                  Candidate Name{' '}
                  {availableCandidates.length > 0 && (
                    <span style={{ fontWeight: 400, color: '#727784', fontSize: '11px' }}>
                      (auto-suggests from applicants)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="int-input-box"
                  list="candidate-name-suggestions"
                  placeholder="e.g. Passionate Learner"
                  value={newCandidateName}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewCandidateName(val)
                    const matched = availableCandidates.find(
                      (c) => c.name.toLowerCase() === val.trim().toLowerCase()
                    )
                    if (matched && matched.role) {
                      setNewCandidateRole(matched.role)
                    }
                  }}
                  required
                />
                {availableCandidates.length > 0 && (
                  <datalist id="candidate-name-suggestions">
                    {availableCandidates.map((c) => (
                      <option key={c.id + (c.applicationId || '')} value={c.name}>
                        {c.role ? `${c.role}` : ''}
                      </option>
                    ))}
                  </datalist>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Applied Role</label>
                <input
                  type="text"
                  className="int-input-box"
                  placeholder="e.g. Structural Engineer"
                  value={newCandidateRole}
                  onChange={(e) => setNewCandidateRole(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Date</label>
                  <input
                    type="date"
                    className="int-input-box"
                    min={todayStr}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Time</label>
                  <input
                    type="time"
                    className="int-input-box"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Round Type</label>
                  <select
                    className="int-input-box"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as InterviewSession['interviewType'])}
                  >
                    <option value="Technical Review">Technical Review</option>
                    <option value="Portfolio Deep-Dive">Portfolio Deep-Dive</option>
                    <option value="Cultural Fit">Cultural Fit</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Meeting Mode</label>
                  <select
                    className="int-input-box"
                    value={newLocationType}
                    onChange={(e) => setNewLocationType(e.target.value as InterviewSession['locationType'])}
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Zoom">Zoom</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#1a1c1e' }}>Meeting Link / Address</label>
                <input
                  type="text"
                  className="int-input-box"
                  placeholder="https://meet.google.com/..."
                  value={newLocationVal}
                  onChange={(e) => setNewLocationVal(e.target.value)}
                  required
                />
              </div>

              <div className="int-modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-int-secondary"
                  onClick={() => setIsScheduleNewModalOpen(false)}
                  disabled={isSubmittingSchedule}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-int-primary" disabled={isSubmittingSchedule}>
                  {isSubmittingSchedule ? 'Scheduling Round...' : 'Schedule Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Interviews
