import { type FC } from 'react'
import type { ConversationThread } from './types'

interface ChatHeaderProps {
  thread: ConversationThread
  onBack?: () => void
}

export const ChatHeader: FC<ChatHeaderProps> = ({ thread, onBack }) => {
  return (
    <header className="msg-chat-header">
      <div className="msg-chat-recruiter-profile">
        {onBack && (
          <button
            type="button"
            className="btn-msg-mobile-back"
            onClick={onBack}
            aria-label="Back to conversations list"
            title="Back to messages"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
          </button>
        )}
        <div className="msg-chat-avatar-wrap">
          <img
            src={thread.avatar}
            alt={thread.name}
            className="msg-chat-avatar-img"
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget
              img.onerror = null
              img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.name)}&background=00418f&color=fff`
            }}
          />
          {thread.isOnline && <span className="msg-chat-online-pip" title="Active now" />}
        </div>

        <div className="msg-chat-details">
          <div className="msg-chat-name-row">
            <h2 className="msg-chat-recruiter-name">{thread.name}</h2>
            {thread.fitLabel && (
              <span className="msg-match-pill-header">{thread.fitLabel}</span>
            )}
          </div>

          <p className="msg-chat-role-text">
            {thread.roleOrDiscipline} • <strong>{thread.firmOrSchool}</strong>
          </p>
        </div>
      </div>
    </header>
  )
}
