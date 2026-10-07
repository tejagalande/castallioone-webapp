import { useState, type FC } from 'react'
import { getPushPermission, requestPushPermission } from '../lib/onesignal'

interface EnablePushButtonProps {
  className?: string
}

/**
 * Asks the browser for push permission (must run from a user click).
 * Hidden when push is unsupported or already enabled.
 */
export const EnablePushButton: FC<EnablePushButtonProps> = ({ className = 'btn-notif-secondary' }) => {
  const [permission, setPermission] = useState(getPushPermission())
  const [busy, setBusy] = useState(false)

  if (permission === 'unsupported' || permission === 'granted') return null

  const denied = permission === 'denied'

  const handleClick = async () => {
    setBusy(true)
    await requestPushPermission()
    setPermission(getPushPermission())
    setBusy(false)
  }

  return (
    <button
      type="button"
      id="enable-push-notifications-btn"
      className={className}
      onClick={handleClick}
      disabled={busy || denied}
      title={
        denied
          ? 'Notifications are blocked. Allow them from the lock icon in your browser address bar.'
          : 'Get instant browser alerts for your hiring activity'
      }
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {denied ? 'notifications_off' : 'notifications_active'}
      </span>
      <span>{denied ? 'Notifications Blocked' : busy ? 'Enabling…' : 'Enable Push Alerts'}</span>
    </button>
  )
}
