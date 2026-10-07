import { supabase } from './supabase'

export type WebPushEvent =
  | { event: 'application_status'; application_id: string; status: string }
  | { event: 'application_submitted'; application_id: string }
  | { event: 'interview_scheduled'; interview_id: string }
  | { event: 'interview_rescheduled'; interview_id: string }
  | { event: 'interview_cancelled'; interview_id: string }

/**
 * Fire-and-forget: asks the `web-notify` edge function to send a push and
 * record a notification row. Never throws and never blocks the user action.
 */
export function notifyEvent(payload: WebPushEvent): void {
  void supabase.functions.invoke('web-notify', { body: payload }).then(({ error }) => {
    if (error) console.warn('web-notify failed:', error.message)
  })
}

/** Statuses that should notify the candidate. */
export const NOTIFIABLE_STATUSES = new Set(['shortlisted', 'rejected', 'offered', 'hired'])
