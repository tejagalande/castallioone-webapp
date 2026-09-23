import { type FC } from 'react'
import type { ConversationThread } from './types'

interface ChatHeaderProps {
  thread: ConversationThread
}

export const ChatHeader: FC<ChatHeaderProps> = ({ thread }) => {
  return (
    <header className="msg-chat-header">
      <div className="msg-chat-recruiter-profile">
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
        </div>

        <div className="msg-chat-details">
          <div className="msg-chat-name-row">
            <h2 className="msg-chat-recruiter-name">{thread.name}</h2>
          </div>

          <p className="msg-chat-role-text">
            {thread.roleOrDiscipline} • <strong>{thread.firmOrSchool}</strong>
          </p>
        </div>
      </div>
    </header>
  )
}
