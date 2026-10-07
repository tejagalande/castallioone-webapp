import { type FC, type ChangeEvent } from 'react'
import { useMessages } from './useMessages'
import { ConversationSidebar } from './messages/ConversationSidebar'
import { ChatHeader } from './messages/ChatHeader'
import { MessageList } from './messages/MessageList'
import { MessageComposer } from './messages/MessageComposer'
import { ComposeInquiryModal } from './messages/ComposeInquiryModal'
import './Messages.css'

export interface MessagesProps {
  onNavigateToFindJobs?: () => void
  targetCompany?: { id?: string; name?: string } | null
  onClearTargetCompany?: () => void
}

export const Messages: FC<MessagesProps> = ({
  onNavigateToFindJobs,
  targetCompany,
  onClearTargetCompany,
}) => {
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
    loading,
    userRole,
    availableRecipients,
    hasAppliedPositions,
    isComposeModalOpen,
    setIsComposeModalOpen,
    handleSelectThread,
    handleSendMessage,
    handleStartInquiry,
    handleMarkAllRead,
    exportICS,
    toastMessage,
    showToast,
  } = useMessages({ targetCompany, onClearTargetCompany })

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const unreadMessagesCount = filteredConversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <main className="msg-network-root" aria-label="Messages Workspace">
      {/* Toast Alert */}
      {toastMessage && (
        <aside className="msg-live-toast" role="status" aria-live="polite">
          <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>
            info
          </span>
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="msg-content-container">
        {/* ── Page Header & Action Controls ── */}
        <header className="msg-header-row">
          <div className="msg-title-wrap">
            <h1 className="msg-title-headline">
              <span>Messages</span>
              {/* {unreadMessagesCount > 0 && (
                <span className="msg-badge-pill">{unreadMessagesCount} NEW</span>
              )} */}
            </h1>
            <p className="msg-subtitle">
              Direct real-time communication between AEC candidates and studios.
            </p>
          </div>

          <div className="msg-actions-group">
            {unreadMessagesCount > 0 && (
              <button
                type="button"
                className="btn-msg-secondary"
                onClick={handleMarkAllRead}
                title="Mark all conversations as read"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                  done_all
                </span>
                <span>Mark All Read</span>
              </button>
            )}

            {userRole === 'employer' && (
              <button
                type="button"
                className="btn-msg-primary"
                onClick={() => setIsComposeModalOpen(true)}
                title="Message Candidate"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
                  edit_square
                </span>
                <span>Message Candidate</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Main Two-Column Master-Detail Chat Layout ── */}
        <div className={`msg-workspace-layout ${selectedThread ? 'has-active-thread' : 'no-active-thread'}`}>
          {/* LEFT COLUMN: Conversation Directory */}
          <ConversationSidebar
            conversations={filteredConversations}
            selectedThreadId={selectedThreadId}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            loading={loading}
            onSelectThread={handleSelectThread}
            onFilterChange={setActiveFilter}
            onSearchChange={handleSearchChange}
          />

          {/* RIGHT COLUMN: Active Chat Workstation */}
          {loading ? (
            <section className="msg-chat-column" aria-label="Loading Active Conversation">
              <div className="msg-skeleton-chat-pane">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '16px', borderBottom: '1px solid rgba(194, 198, 213, 0.4)' }}>
                  <div className="msg-skeleton-avatar msg-skeleton-pulse" style={{ width: '48px', height: '48px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div className="msg-skeleton-pulse" style={{ height: '18px', width: '200px' }} />
                    <div className="msg-skeleton-pulse" style={{ height: '12px', width: '280px' }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>
                  <div className="msg-skeleton-pulse" style={{ height: '36px', width: '240px', borderRadius: '20px' }} />
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#00418f', fontSize: '12px', fontFamily: 'JetBrains Mono' }}>
                    <span className="msg-pulse-dot" />
                    CONNECTING CHAT PIPELINE...
                  </div>
                </div>
              </div>
            </section>
          ) : !selectedThread ? (
            <section className="msg-chat-column" aria-label="No Active Conversations">
              <div className="msg-empty-workspace">
                <span className="material-symbols-outlined msg-empty-icon" aria-hidden="true">
                  {userRole === 'talent' && !hasAppliedPositions ? 'lock' : 'forum'}
                </span>
                <h3 className="msg-empty-title">
                  {userRole === 'employer'
                    ? 'No Active Conversations'
                    : !hasAppliedPositions
                    ? 'Messaging Feature Locked'
                    : 'Your Studio Direct Inquiries'}
                </h3>
                <p className="msg-empty-desc">
                  {userRole === 'employer'
                    ? 'Direct conversations with candidate applicants will appear here once initiated or received.'
                    : !hasAppliedPositions
                    ? 'The messaging feature is enabled once you apply for a position. You can chat directly with companies where you have an active application.'
                    : 'Connect directly with hiring managers at companies you have applied to, review inbound studio inquiries, and coordinate technical interviews.'}
                </p>
                <div className="msg-empty-actions-row">
                  {userRole === 'talent' && !hasAppliedPositions ? (
                    onNavigateToFindJobs && (
                      <button
                        type="button"
                        className="btn-msg-primary"
                        onClick={onNavigateToFindJobs}
                      >
                        <span className="material-symbols-outlined">work</span>
                        <span>Browse Positions &amp; Apply to Unlock</span>
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-msg-primary"
                        onClick={() => setIsComposeModalOpen(true)}
                      >
                        <span className="material-symbols-outlined">edit_square</span>
                        <span>{userRole === 'employer' ? 'Message Candidate' : 'Start a Conversation'}</span>
                      </button>
                      {userRole !== 'employer' && onNavigateToFindJobs && (
                        <button
                          type="button"
                          className="btn-msg-secondary"
                          onClick={onNavigateToFindJobs}
                        >
                          <span className="material-symbols-outlined">work</span>
                          <span>Explore Jobs &amp; Studios</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="msg-chat-column" aria-label="Active Conversation Stream">
              <ChatHeader
                thread={selectedThread}
                onBack={() => handleSelectThread('')}
              />

              {/* Message History Pane */}
              <MessageList
                messages={selectedThread.messages}
                partnerAvatar={selectedThread.avatar}
                partnerName={selectedThread.name}
                onOpenSandboxModal={() => {}}
                onExportICS={exportICS}
                onShowToast={showToast}
              />

              {/* Message Composer Area */}
              <MessageComposer
                value={messageInput}
                onChange={setMessageInput}
                onSend={() => handleSendMessage()}
              />
            </section>
          )}
        </div>
      </div>

      {/* Compose Inquiry Modal */}
      <ComposeInquiryModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        availableRecipients={availableRecipients}
        userRole={userRole}
        onSubmit={handleStartInquiry}
      />
    </main>
  )
}

export default Messages
