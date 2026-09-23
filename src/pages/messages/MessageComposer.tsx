import { type FC, type KeyboardEvent } from 'react'

interface MessageComposerProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
}

export const MessageComposer: FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="msg-composer-area">
      <div className="msg-input-wrapper">
        <textarea
          className="msg-textarea"
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message input text"
          rows={2}
        />

        <div className="msg-composer-send-group">
          <button
            type="button"
            className="btn-msg-send"
            onClick={onSend}
            disabled={!value.trim()}
            aria-label="Send message"
          >
            <span>Send</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">
              send
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
