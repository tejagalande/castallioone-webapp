import { useState, type FC } from 'react'

interface SandboxModalProps {
  isOpen: boolean
  onClose: () => void
  onShowToast: (msg: string) => void
}

export const SandboxModal: FC<SandboxModalProps> = ({ isOpen, onClose, onShowToast }) => {
  if (!isOpen) return null

  return (
    <div
      className="msg-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="msg-modal-window" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="msg-modal-header">
          <h3 className="msg-modal-title">3D WebGL Sandbox — Scalpel_Facade_Cluster.ghx</h3>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="msg-modal-body">
          <div className="sandbox-canvas-viewport">
            <div className="sandbox-wireframe-grid" />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#ffffff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#adc6ff', marginBottom: '8px' }}>
                view_in_ar
              </span>
              <div style={{ fontFamily: 'Hanken Grotesk', fontSize: '16px', fontWeight: 700 }}>
                Parametric Double-Curved Façade Mesh
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#c3d4ff', marginTop: '4px' }}>
                CANARY WHARF TOWER • LOD-400 VERIFIED
              </div>
            </div>

            <div className="sandbox-stats-overlay">
              <span>SPECKLE SYNC: 14ms (LIVE)</span>
              <span>SURFACE PANELS: 1,420 UNITS</span>
              <span>CLASH STATUS: 0 TOLERANCE DEFECTS</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ padding: '10px', borderRadius: '8px', background: '#f3f3f6', border: '1px solid #c2c6d5' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784', textTransform: 'uppercase' }}>
                Geometric Continuity:
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#00418f', marginTop: '2px' }}>
                G2 Curvature Continuous (NURBS)
              </div>
            </div>

            <div style={{ padding: '10px', borderRadius: '8px', background: '#f3f3f6', border: '1px solid #c2c6d5' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#727784', textTransform: 'uppercase' }}>
                Fabrication Feasibility:
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1c1e', marginTop: '2px' }}>
                94.2% Standard Flat Panels
              </div>
            </div>
          </div>
        </div>

        <div className="msg-modal-footer">
          <button
            type="button"
            className="btn-msg-secondary"
            onClick={onClose}
          >
            Close Sandbox
          </button>
          <button
            type="button"
            className="btn-msg-primary"
            onClick={() => {
              onShowToast('Speckle stream URL copied to clipboard.')
              onClose()
            }}
          >
            Copy Speckle Stream Link
          </button>
        </div>
      </div>
    </div>
  )
}

interface CallModalProps {
  isOpen: boolean
  callType: 'audio' | 'video'
  partnerName: string
  partnerFirm: string
  onClose: () => void
  onShowToast: (msg: string) => void
}

export const CallModal: FC<CallModalProps> = ({
  isOpen,
  callType,
  partnerName,
  partnerFirm,
  onClose,
  onShowToast,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="msg-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="msg-modal-window" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="msg-modal-header">
          <h3 className="msg-modal-title">
            {callType === 'video' ? 'Secure WebRTC Video Call' : 'Encrypted Audio Call'}
          </h3>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="msg-modal-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(0, 65, 143, 0.1)', color: '#00418f', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
              {callType === 'video' ? 'videocam' : 'call'}
            </span>
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontFamily: 'Hanken Grotesk' }}>
            Calling {partnerName}
          </h4>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#727784' }}>
            {partnerFirm} • Direct Defense Line
          </p>
          <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#00418f', background: 'rgba(0, 65, 143, 0.08)', padding: '6px 14px', borderRadius: '9999px' }}>
            <span className="msg-pulse-dot" />
            CONNECTING VIA SECURE 256-BIT STUN/TURN RELAY
          </div>
        </div>

        <div className="msg-modal-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="btn-msg-secondary"
            style={{ background: '#ffdad6', color: '#ba1a1a', borderColor: '#ffdad6' }}
            onClick={() => {
              onShowToast('Call ended.')
              onClose()
            }}
          >
            End Call
          </button>
        </div>
      </div>
    </div>
  )
}

interface RescheduleModalProps {
  isOpen: boolean
  partnerName: string
  partnerFirm: string
  onClose: () => void
  onSubmitReschedule: (text: string) => void
}

export const RescheduleModal: FC<RescheduleModalProps> = ({
  isOpen,
  partnerName,
  partnerFirm,
  onClose,
  onSubmitReschedule,
}) => {
  const [alternateDate, setAlternateDate] = useState<string>('2024-11-15')
  const [alternateTime, setAlternateTime] = useState<string>('10:00')

  if (!isOpen) return null

  return (
    <div
      className="msg-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="msg-modal-window" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="msg-modal-header">
          <h3 className="msg-modal-title">Propose Alternate Defense Slot</h3>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="msg-modal-body">
          <p style={{ margin: 0, fontSize: '13.5px', color: '#424753' }}>
            Propose a new date and time for your technical defense review with {partnerName} ({partnerFirm}).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
                Preferred Date:
              </label>
              <input
                type="date"
                value={alternateDate}
                onChange={(e) => setAlternateDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
                Preferred Time (GMT):
              </label>
              <input
                type="time"
                value={alternateTime}
                onChange={(e) => setAlternateTime(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontFamily: 'JetBrains Mono', color: '#727784', textTransform: 'uppercase', marginBottom: '6px' }}>
              Note to Panelist:
            </label>
            <textarea
              rows={3}
              defaultValue="Could we please move the defense call to this alternate slot? I want to ensure our live connection is fully benchmarked."
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #c2c6d5', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div className="msg-modal-footer">
          <button
            type="button"
            className="btn-msg-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-msg-primary"
            onClick={() => {
              onSubmitReschedule(`📅 Reschedule proposed for ${alternateDate} at ${alternateTime} GMT.`)
              onClose()
            }}
          >
            Submit Reschedule Request
          </button>
        </div>
      </div>
    </div>
  )
}
