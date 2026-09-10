import type { FC } from 'react'
import './Messages.css'
import {
  useMessages,
  type ConversationThread,
  type ChatMessage,
} from './useMessages'

interface MessagesProps {
  onNavigateToFindJobs?: () => void
}

const Messages: FC<MessagesProps> = () => {
  const {
    filteredConversations,
    selectedThread,
    selectedThreadId,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    messageInput,
    setMessageInput,
    isComposeModalOpen,
    setIsComposeModalOpen,
    handleSelectThread,
    handleSendMessage,
    handleQuickReply,
    handleAcceptInterview,
    handleMarkAllRead,
    handleExportTranscripts,
    toastMessage,
    showToast,
  } = useMessages()

  return (
    <div className="messages-page">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="msg-toast" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* 1. System Telemetry Strip */}
      <section className="msg-telemetry-bar" aria-label="AEC Communications Network Telemetry">
        <div className="telemetry-left">
          <span className="telemetry-pill-lead">
            <span className="pulse-primary" aria-hidden="true" />
            TALENT_WORKSPACE // COMMS-NETWORK-V2.4
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#39464f', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }} aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            ENCRYPTED AEC CHAT STREAM
          </span>
          <span style={{ color: '#c2c6d5' }}>•</span>
          <span style={{ color: '#1a1c1e' }}>
            DIRECT FIRM PIPELINE: <strong style={{ color: '#00418f' }}>ACTIVE</strong>
          </span>
        </div>

        <div className="telemetry-right">
          <span className="response-rate-chip">
            RESPONSE RATE: 96.4%
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }} aria-hidden="true">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </span>
          <span style={{ color: '#727784' }}>LATENCY: 42ms</span>
        </div>
      </section>

      {/* 2. Header & Action Row */}
      <header className="msg-header-row">
        <div className="msg-title-block">
          <div className="msg-title-line">
            <h1 className="msg-main-title">Messages & Direct Inquiries</h1>
            <span className="new-badge-pill">3 NEW</span>
          </div>
          <p className="msg-subtext">
            Real-time communication with AEC recruiters, BIM managers, and project directors across active opportunities.
          </p>
        </div>

        <div className="msg-action-ribbon">
          <button
            type="button"
            className="btn-msg-action"
            onClick={handleMarkAllRead}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Mark All Read
          </button>

          <button
            type="button"
            className="btn-msg-action"
            onClick={handleExportTranscripts}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Transcripts
          </button>

          <button
            type="button"
            className="btn-msg-primary"
            onClick={() => setIsComposeModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            Compose Inquiry
          </button>
        </div>
      </header>

      {/* 3. Status Summary Strip (4 Cards) */}
      <section className="msg-metrics-strip" aria-label="Chat Statistics">
        <div className="metric-chat-card">
          <div>
            <span className="lbl">Active Chats</span>
            <span className="val">7 Threads</span>
          </div>
          <div className="metric-icon-square" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
            </svg>
          </div>
        </div>

        <div className="metric-chat-card">
          <div>
            <span className="lbl">Interviews</span>
            <span className="val secondary">2 Scheduled</span>
          </div>
          <div className="metric-icon-square" style={{ background: '#ffdad6', color: '#ba1a1a' }} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
        </div>

        <div className="metric-chat-card">
          <div>
            <span className="lbl">Avg Response</span>
            <span className="val">18 min</span>
          </div>
          <div className="metric-icon-square" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>

        <div className="metric-chat-card">
          <div>
            <span className="lbl">NDA Status</span>
            <span className="val primary">Tier-1 Encrypted</span>
          </div>
          <div className="metric-icon-square" style={{ background: '#d8e2ff', color: '#00418f' }} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        </div>
      </section>

      {/* 4. Main Split Content Area */}
      <main className="msg-split-workstation">
        {/* MASTER PANE: Conversation & Inbound Directory */}
        <section className="msg-directory-pane" aria-label="Conversation Directory">
          <div className="dir-header-bar">
            <div className="dir-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="dir-title-text">Conversations</span>
                <span className="new-badge-pill" style={{ fontSize: '9.5px', padding: '1px 6px' }}>3 NEW</span>
              </div>
              <button
                type="button"
                className="btn-icon-copy"
                title="Filter conversations"
                onClick={() => showToast('Filter options active.')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }} aria-hidden="true">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
              </button>
            </div>

            <div className="dir-search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search messages, firms, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter threads"
              />
            </div>

            <div className="dir-filter-pills" role="tablist">
              <button
                type="button"
                className={`dir-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All (7)
              </button>
              <button
                type="button"
                className={`dir-pill-btn ${activeFilter === 'inbounds' ? 'active' : ''}`}
                onClick={() => setActiveFilter('inbounds')}
              >
                Inbounds (4)
              </button>
              <button
                type="button"
                className={`dir-pill-btn ${activeFilter === 'interviews' ? 'active' : ''}`}
                onClick={() => setActiveFilter('interviews')}
              >
                Interviews •
              </button>
              <button
                type="button"
                className={`dir-pill-btn ${activeFilter === 'archived' ? 'active' : ''}`}
                onClick={() => setActiveFilter('archived')}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="threads-scroll-container">
            {filteredConversations.map((thread: ConversationThread) => {
              const isSelected = thread.id === selectedThreadId

              return (
                <div
                  key={thread.id}
                  className={`thread-list-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectThread(thread.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectThread(thread.id)
                    }
                  }}
                  aria-selected={isSelected}
                >
                  <div className="thread-top-line">
                    <div className="thread-avatar-meta">
                      <div className="thread-avatar-frame">
                        <img src={thread.recruiterAvatar} alt={thread.recruiterName} />
                        {thread.isOnline && <span className="online-dot" aria-hidden="true" />}
                      </div>
                      <div className="thread-name-block">
                        <span className="thread-recruiter-name">
                          {thread.recruiterName}
                          {thread.isVerified && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2.5" style={{ width: '13px', height: '13px' }} aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className="thread-firm-pill">{thread.firmName}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span className="thread-time-badge">{thread.lastMessageTime}</span>
                      {thread.hasInterviewTag && (
                        <span className="new-badge-pill" style={{ background: '#ffdad6', color: '#ba1a1a', fontSize: '9px', marginTop: '2px' }}>
                          INTERVIEW
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="thread-role-title">{thread.roleTitle}</p>
                  <p className="thread-preview-text">{thread.lastMessage}</p>

                  <div className="thread-footer-tags">
                    {thread.hasAttachments && (
                      <span style={{ color: '#00418f', fontWeight: 600 }}>
                        📎 {thread.attachmentCount} Files •
                      </span>
                    )}
                    <span>ISO-19650</span>
                    <span>•</span>
                    <strong style={{ color: '#00418f' }}>{thread.matchScore}% Match</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* DETAIL PANE: Active Single Chat Session */}
        <section className="msg-chat-pane" aria-label={`Conversation with ${selectedThread.recruiterName}`}>
          {/* Active Chat Header */}
          <div className="chat-header-bar">
            <div className="chat-recruiter-details">
              <div className="chat-avatar-frame">
                <img src={selectedThread.recruiterAvatar} alt={selectedThread.recruiterName} />
                {selectedThread.isOnline && <span className="online-dot" aria-hidden="true" />}
              </div>
              <div className="chat-info-column">
                <div className="chat-name-row">
                  <h2 className="chat-name-text">{selectedThread.recruiterName}</h2>
                  <span className="thread-firm-pill">{selectedThread.firmName}</span>
                  <span className="new-badge-pill" style={{ background: '#d8e2ff', color: '#00418f', fontSize: '10px' }}>
                    {selectedThread.matchScore}% MATCH • {selectedThread.salaryRange}
                  </span>
                </div>
                <p className="chat-role-subline">
                  {selectedThread.recruiterRole} • <strong style={{ color: '#00418f' }}>Active now</strong>
                </p>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                className="btn-chat-tool"
                onClick={() => showToast(`Starting encrypted AEC video call with ${selectedThread.recruiterName}...`)}
                title="Start Direct AEC Video Call"
                aria-label="Start Video Call"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </button>
              <button
                type="button"
                className="btn-chat-tool"
                onClick={() => showToast(`Connecting audio session...`)}
                title="Audio Conference Call"
                aria-label="Start Audio Call"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </button>
              <button
                type="button"
                className="btn-chat-tool"
                onClick={() => showToast(`Opening synchronized 3D Model viewer...`)}
                title="Open Live IFC Model Synchronizer"
                aria-label="3D Model Synchronizer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Pinned Interview Callout if Present */}
          {selectedThread.interviewDetails && (
            <div className="pinned-interview-callout">
              <div className="callout-inner-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div className="callout-icon-box" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="callout-text-block">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="new-badge-pill" style={{ background: '#ba1a1a', fontSize: '9.5px' }}>
                        {selectedThread.interviewDetails.status === 'accepted' ? 'INTERVIEW CONFIRMED' : 'INTERVIEW PROPOSED'}
                      </span>
                      <strong style={{ fontSize: '13px', color: '#1a1c1e' }}>{selectedThread.interviewDetails.roleTitle}</strong>
                    </div>
                    <p style={{ fontSize: '12px', color: '#424753', margin: '4px 0 0' }}>
                      <strong style={{ color: '#00418f' }}>{selectedThread.interviewDetails.dateText}</strong> ({selectedThread.interviewDetails.duration}) • {selectedThread.interviewDetails.location}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {selectedThread.interviewDetails.status === 'accepted' ? (
                    <span className="btn-msg-action" style={{ background: '#d8e2ff', color: '#00418f', fontWeight: 700 }}>
                      ✓ Confirmed on Calendar
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-msg-primary"
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                        onClick={handleAcceptInterview}
                      >
                        Accept & Add to Calendar
                      </button>
                      <button
                        type="button"
                        className="btn-msg-action"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                        onClick={() => handleQuickReply('Could we reschedule to Friday 10:00 GMT?')}
                      >
                        Propose Time
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chronological Message Stream */}
          <div className="chat-messages-stream">
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', color: '#727784', background: '#f3f3f6', padding: '4px 12px', borderRadius: '12px', border: '1px solid #e2e2e5' }}>
                TODAY, 13:42 GMT • MUTUAL AEC NDA SECURED
              </span>
            </div>

            {selectedThread.messages.map((msg: ChatMessage) => {
              const isCandidate = msg.sender === 'candidate'

              return (
                <div
                  key={msg.id}
                  className={`msg-row-wrapper ${isCandidate ? 'candidate' : 'recruiter'}`}
                >
                  <div className="msg-bubble-box">
                    <div className="msg-bubble-author-line">
                      <span className="name">{msg.senderName}</span>
                      <span className="time">{msg.time}</span>
                    </div>

                    <div className="msg-bubble-card">
                      {msg.text}
                    </div>

                    {/* Attachments if any */}
                    {msg.attachments && (
                      <div className="attachments-grid-row">
                        {msg.attachments.map((att) => (
                          <div
                            className="attachment-download-card"
                            key={att.id}
                            onClick={() => showToast(`Downloading ${att.name}...`)}
                          >
                            <div className="att-card-left">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '20px', height: '20px' }} aria-hidden="true">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              <div style={{ minWidth: 0 }}>
                                <p className="att-name">{att.name}</p>
                                <p className="att-spec">{att.meta}</p>
                              </div>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '16px', height: '16px' }} aria-hidden="true">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Action Reply Pills */}
          <div className="quick-replies-bar">
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784', fontWeight: 700 }}>
              QUICK REPLIES:
            </span>
            <button
              type="button"
              className="quick-reply-pill"
              onClick={() => handleQuickReply("✨ I've accepted the calendar invite")}
            >
              ✨ I've accepted the calendar invite
            </button>
            <button
              type="button"
              className="quick-reply-pill"
              onClick={() => handleQuickReply('📅 Could we reschedule to Friday 10:00 GMT?')}
            >
              📅 Could we reschedule to Friday 10:00 GMT?
            </button>
            <button
              type="button"
              className="quick-reply-pill"
              onClick={() => handleQuickReply('🔗 Sharing live IFC 4x3 federated link')}
            >
              🔗 Sharing live IFC 4x3 federated link
            </button>
          </div>

          {/* Rich Message Composer */}
          <div className="chat-composer-wrap">
            <div className="composer-input-box">
              <textarea
                className="composer-textarea"
                rows={2}
                placeholder="Type a secure message, attach BIM model parameters, or paste Grasshopper script snippets..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />

              <div className="composer-tools-bottom">
                <div className="composer-attachment-tools">
                  <button
                    type="button"
                    className="btn-composer-icon"
                    title="Attach IFC / Revit / BIM Model"
                    onClick={() => showToast('Attached sanitized IFC model schema.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-composer-icon"
                    title="Attach Grasshopper / Python script"
                    onClick={() => showToast('Attached Dynamo parameter graph.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-composer-icon"
                    title="Attach PDF portfolio or BEP certificate"
                    onClick={() => showToast('Attached PDF transcript.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-composer-icon"
                    title="Insert verified ISO 19650 badge"
                    onClick={() => showToast('Embedded ISO 19650 Lead badge verification stamp.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-composer-icon"
                    title="Record voice note"
                    onClick={() => showToast('Voice note recorder initialized.')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="btn-msg-primary"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() => handleSendMessage()}
                  >
                    Send
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }} aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="composer-meta-footer">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00418f" strokeWidth="2" style={{ width: '13px', height: '13px' }} aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                256-bit AEC TLS Encrypted Channel • Castallio Shield Active
              </span>
              <span>LATENCY: 38ms</span>
            </div>
          </div>
        </section>
      </main>

      {/* Compose Inquiry Modal */}
      {isComposeModalOpen && (
        <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="compose-title">
          <div className="profile-modal-dialog" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 id="compose-title">Compose Direct Firm Inquiry</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsComposeModalOpen(false)}
                aria-label="Close dialog"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-form-group">
                <label className="modal-label">Select Recipient Firm / Recruiter</label>
                <select className="modal-input">
                  <option value="elena">Elena Rostova • Foster + Partners (Lead Comp Designer)</option>
                  <option value="marcus">Marcus Vance • Grimshaw Architects (HS2 Rail Lead)</option>
                  <option value="sarah">Sarah Jenkins • Arup London (Senior BIM Manager)</option>
                  <option value="david">David Kim • Balfour Beatty (4D Synchro)</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Inquiry Subject / Target Role</label>
                <input
                  type="text"
                  className="modal-input"
                  defaultValue="Technical Inbound // Alex Morgan LOD 400 Coordination Profile"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-label">Initial Message</label>
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder="Introduce yourself, mention key BIM disciplines and certified ISO 19650 protocols..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-msg-action"
                onClick={() => setIsComposeModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-msg-primary"
                onClick={() => {
                  setIsComposeModalOpen(false)
                  showToast('Direct Inquiry transmitted through Castallio Verified Channel.')
                }}
              >
                Transmit Inquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
