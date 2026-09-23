import { type FC, type ChangeEvent } from 'react'
import type { ConversationThread, MessageFilterType } from './types'

interface ConversationSidebarProps {
  conversations: ConversationThread[]
  selectedThreadId: string
  activeFilter: MessageFilterType
  searchQuery: string
  loading?: boolean
  onSelectThread: (id: string) => void
  onFilterChange: (filter: MessageFilterType) => void
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const ConversationSidebar: FC<ConversationSidebarProps> = ({
  conversations,
  selectedThreadId,
  activeFilter,
  searchQuery,
  loading = false,
  onSelectThread,
  onFilterChange,
  onSearchChange,
}) => {
  const unreadCountTotal = conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0)
  const interviewsCount = conversations.reduce((acc, c) => acc + (c.hasInterviewTag ? 1 : 0), 0)

  return (
    <aside className="msg-dir-column" aria-label="Conversation Directory">
      {/* Search Input with shortcut hint */}
      <div className="msg-search-box">
        <span className="material-symbols-outlined msg-search-icon" aria-hidden="true">
          search
        </span>
        <input
          type="text"
          className="msg-search-input"
          placeholder="Search messages, studios, roles..."
          value={searchQuery}
          onChange={onSearchChange}
          aria-label="Search conversations"
        />
        <span className="msg-search-shortcut" aria-hidden="true">⌘K</span>
      </div>

      {/* Filter Pills */}
      <div className="msg-filter-pills" role="tablist" aria-label="Filter conversations">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'all'}
          className={`btn-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          All ({conversations.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'inbounds'}
          className={`btn-filter-pill ${activeFilter === 'inbounds' ? 'active' : ''}`}
          onClick={() => onFilterChange('inbounds')}
        >
          Inbounds {unreadCountTotal > 0 && <span className="filter-badge-count">{unreadCountTotal}</span>}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === 'interviews'}
          className={`btn-filter-pill ${activeFilter === 'interviews' ? 'active' : ''}`}
          onClick={() => onFilterChange('interviews')}
        >
          Interviews ({interviewsCount})
        </button>
      </div>

      {/* Conversation Item List */}
      <div className="msg-thread-list" role="list" tabIndex={0}>
        {loading ? (
          <div style={{ padding: '8px' }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="msg-skeleton-item">
                <div className="msg-skeleton-row">
                  <div className="msg-skeleton-avatar msg-skeleton-pulse" />
                  <div className="msg-skeleton-col">
                    <div className="msg-skeleton-pulse" style={{ height: '14px', width: '65%' }} />
                    <div className="msg-skeleton-pulse" style={{ height: '10px', width: '45%' }} />
                  </div>
                </div>
                <div className="msg-skeleton-pulse" style={{ height: '12px', width: '85%' }} />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#727784', fontSize: '13.5px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#c2c6d5', marginBottom: '8px' }}>
              chat_bubble_outline
            </span>
            <p style={{ margin: 0 }}>No conversations match your criteria.</p>
          </div>
        ) : (
          conversations.map((thread) => {
            const isSelected = thread.id === selectedThreadId
            return (
              <div
                key={thread.id}
                role="listitem"
                tabIndex={0}
                className={`msg-thread-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectThread(thread.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectThread(thread.id)
                  }
                }}
              >
                <div className="msg-thread-header">
                  <div className="msg-thread-user">
                    <div className="msg-avatar-wrap">
                      <img
                        src={thread.avatar}
                        alt={thread.name}
                        className="msg-avatar-img"
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget
                          img.onerror = null
                          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.name)}&background=00418f&color=fff`
                        }}
                      />
                    </div>
                    <div className="msg-user-meta">
                      <div className="msg-recruiter-name-row">
                        <span>{thread.name}</span>
                      </div>
                      <span className="msg-firm-name">{thread.firmOrSchool}</span>
                    </div>
                  </div>

                  <div className="msg-thread-time-badge">
                    <span className={`msg-time-label ${isSelected ? 'active' : ''}`}>
                      {thread.lastMessageTime}
                    </span>
                    {thread.unreadCount > 0 ? (
                      <span className="filter-badge-count" style={{ alignSelf: 'flex-end', marginTop: '2px' }}>
                        {thread.unreadCount}
                      </span>
                    ) : thread.fitLabel ? (
                      <span className={`msg-match-pill ${isSelected ? 'primary' : 'neutral'}`}>
                        {thread.fitLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span className="msg-thread-role">{thread.roleOrDiscipline}</span>
                  <p className="msg-thread-preview">{thread.lastMessage}</p>
                </div>

                <div className="msg-thread-footer">
                  {thread.tagBadgeText ? (
                    <span className={`msg-tag-badge ${thread.tagBadgeType || 'neutral'}`}>
                      {thread.hasInterviewTag && (
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">
                          calendar_today
                        </span>
                      )}
                      {thread.tagBadgeText}
                    </span>
                  ) : null}

                  {thread.hasAttachments && (
                    <span style={{ color: '#727784', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }} aria-hidden="true">
                        attach_file
                      </span>
                      {thread.attachmentCount || 1} files
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
