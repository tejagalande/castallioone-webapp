import { type FC, useEffect, useRef } from 'react'
import type { ChatMessage } from './types'

interface MessageListProps {
  messages: ChatMessage[]
  partnerAvatar: string
  partnerName: string
  onOpenSandboxModal: () => void
  onExportICS: () => void
  onShowToast: (msg: string) => void
}

export const MessageList: FC<MessageListProps> = ({
  messages,
  partnerAvatar,
  partnerName,
  onOpenSandboxModal,
  onExportICS,
  onShowToast,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="msg-history-pane" role="log" aria-label="Conversation message history">
      {/* Date Divider */}
      <div className="msg-security-divider">
        <div className="msg-divider-line" />
        <span className="msg-security-pill">
          TODAY
        </span>
        <div className="msg-divider-line" />
      </div>

      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#727784' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#adc6ff', marginBottom: '8px' }}>
            forum
          </span>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Start of conversation</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            Send an inquiry or interview proposal below to initiate communication.
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          if (msg.isMe) {
            return (
              <div key={msg.id} className="msg-bubble-group candidate">
                <div className="candidate-initials-avatar">
                  {msg.senderName.slice(0, 2).toUpperCase()}
                </div>
                <div className="msg-bubble-content candidate">
                  <div className="msg-bubble-sender-row" style={{ flexDirection: 'row-reverse' }}>
                    <span className="msg-bubble-sender-name">{msg.senderName}</span>
                    <span className="msg-bubble-time">{msg.time}</span>
                  </div>

                  <div className="msg-text-bubble candidate">
                    {msg.text.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>

                  {/* Candidate Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="candidate-attachments-row">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="candidate-attachment-chip">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '16px', color: '#00418f' }}
                          >
                            {att.type === 'pdf' ? 'verified' : 'terminal'}
                          </span>
                          <span style={{ fontWeight: 600 }}>{att.name}</span>
                          <span style={{ color: att.type === 'ghx' ? '#00418f' : '#727784' }}>
                            ({att.meta})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="msg-bubble-group">
              <img
                src={msg.senderAvatar || partnerAvatar}
                alt={msg.senderName || partnerName}
                className="msg-bubble-avatar"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget
                  img.onerror = null
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=00418f&color=fff`
                }}
              />
              <div className="msg-bubble-content">
                <div className="msg-bubble-sender-row">
                  <span className="msg-bubble-sender-name">{msg.senderName || partnerName}</span>
                  <span className="msg-bubble-time">{msg.time}</span>
                </div>

                <div className="msg-text-bubble">
                  {msg.text.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx}>{para}</p>
                  ))}
                </div>

                {/* Technical Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="msg-attachments-grid">
                    {msg.attachments.map((att) => (
                      <div key={att.id} className="msg-attachment-card">
                        <div className="msg-attachment-top">
                          <div className={`msg-attachment-icon-box ${att.type}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              {att.type === 'pdf'
                                ? 'picture_as_pdf'
                                : att.type === 'ics'
                                ? 'calendar_month'
                                : 'data_object'}
                            </span>
                          </div>
                          <div className="msg-attachment-details">
                            <span className="msg-attachment-filename" title={att.name}>
                              {att.name}
                            </span>
                            <span
                              className={`msg-attachment-meta ${
                                att.type === 'ghx' ? 'verified' : ''
                              }`}
                            >
                              {att.meta}
                            </span>
                          </div>
                        </div>

                        <div className="msg-attachment-action">
                          {att.type === 'pdf' && (
                            <button
                              type="button"
                              className="btn-attachment-action save"
                              onClick={() => onShowToast(`Downloaded ${att.name}`)}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                download
                              </span>
                              <span>Save</span>
                            </button>
                          )}
                          {att.type === 'ics' && (
                            <button
                              type="button"
                              className="btn-attachment-action sync"
                              onClick={onExportICS}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                add
                              </span>
                              <span>Sync</span>
                            </button>
                          )}
                          {att.type === 'ghx' && (
                            <button
                              type="button"
                              className="btn-attachment-action sandbox"
                              onClick={onOpenSandboxModal}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                visibility
                              </span>
                              <span>Sandbox</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
      <div ref={bottomRef} />
    </div>
  )
}
