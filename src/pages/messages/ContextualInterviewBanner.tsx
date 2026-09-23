import { type FC } from 'react'
import type { ProposedInterview } from './types'

interface ContextualInterviewBannerProps {
  interview: ProposedInterview
  onProposeAlternate: () => void
  onAccept: () => void
  onExportICS: () => void
}

export const ContextualInterviewBanner: FC<ContextualInterviewBannerProps> = ({
  interview,
  onProposeAlternate,
  onAccept,
  onExportICS,
}) => {
  const isAccepted = interview.status === 'accepted'

  return (
    <aside className="msg-interview-banner" aria-label="Scheduled Technical Defense">
      <div className="msg-banner-info-wrap">
        <div className="msg-banner-icon-box">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            event_available
          </span>
        </div>
        <div className="msg-banner-text">
          <span className="msg-banner-title">
            INTERVIEW CONFIRMED: {interview.roleTitle}
          </span>
          <div className="msg-banner-schedule">
            <span className="msg-schedule-highlight">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                schedule
              </span>
              {interview.dateText}
            </span>
            <span style={{ color: '#c2c6d5' }}>•</span>
            <span>Panel: {interview.panel}</span>
            <span style={{ color: '#c2c6d5' }}>•</span>
            <span style={{ color: '#00418f', fontWeight: 600 }}>{interview.location}</span>
          </div>
        </div>
      </div>

      <div className="msg-banner-actions">
        <button
          type="button"
          className="btn-banner-sub"
          onClick={onProposeAlternate}
        >
          Propose Alternate Slot
        </button>

        {isAccepted ? (
          <button
            type="button"
            className="btn-banner-main"
            onClick={onExportICS}
            title="Download Calendar Invite (.ics)"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              calendar_add_on
            </span>
            <span>Add to Calendar</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn-banner-main"
            onClick={() => {
              onAccept()
              onExportICS()
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              check_circle
            </span>
            <span>Accept &amp; Sync Calendar</span>
          </button>
        )}
      </div>
    </aside>
  )
}
