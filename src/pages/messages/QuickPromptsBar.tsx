import { type FC } from 'react'

interface QuickPromptsBarProps {
  onQuickReply: (text: string) => void
  onOpenReschedule: () => void
  onOpenSandbox: () => void
}

export const QuickPromptsBar: FC<QuickPromptsBarProps> = ({
  onQuickReply,
  onOpenReschedule,
  onOpenSandbox,
}) => {
  return (
    <div className="msg-quick-prompts-bar" role="toolbar" aria-label="Quick response prompts">
      <span className="prompt-prefix-label">
        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#00418f' }} aria-hidden="true">
          bolt
        </span>
        Prompts:
      </span>
      <button
        type="button"
        className="btn-quick-prompt"
        onClick={() => onQuickReply("✓ I've accepted the calendar invite and confirmed the schedule.")}
      >
        ✓ I've accepted the calendar invite
      </button>
      <button
        type="button"
        className="btn-quick-prompt"
        onClick={onOpenReschedule}
      >
        📅 Could we reschedule to Friday 10:00 GMT?
      </button>
      <button
        type="button"
        className="btn-quick-prompt"
        onClick={() => onQuickReply('🔗 Sharing live IFC 4x3 federated link: https://speckle.castallio.one/streams/cw-tower-lod400')}
      >
        🔗 Sharing live IFC 4x3 federated link
      </button>
      <button
        type="button"
        className="btn-quick-prompt"
        onClick={onOpenSandbox}
      >
        📐 Launch 3D Sandbox preview
      </button>
    </div>
  )
}
