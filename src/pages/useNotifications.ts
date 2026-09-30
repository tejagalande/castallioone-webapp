import { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type NotificationType =
  | 'interview'
  | 'application'
  | 'message'
  | 'drive'
  | 'recommendation'
  | 'system'

export type NotificationPriority = 'urgent' | 'important' | 'normal'

export type NotificationFilterTab =
  | 'all'
  | 'unread'
  | 'interviews'
  | 'applications'
  | 'messages'
  | 'jobs'
  | 'system'

export interface NotificationMetadata {
  company_name?: string
  company_logo?: string
  role_title?: string
  action_url?: string
  action_label?: string
  target_tab?:
    | 'interviews'
    | 'applications'
    | 'messages'
    | 'find-jobs'
    | 'recommendation-jobs'
    | 'walk-in-drives'
    | 'my-profile'
  priority?: NotificationPriority
  interview_date?: string
  interview_time?: string
  interview_format?: string
  interview_id?: string
  application_id?: string
  application_status?: string
  salary_text?: string
  location?: string
  badge_text?: string
}

export interface NotificationItem {
  id: string
  user_id?: string | null
  title: string
  body: string
  type: NotificationType
  is_read: boolean
  metadata?: NotificationMetadata | null
  created_at: string
  job_id?: string | null
}

export interface NotificationPreferences {
  pushEnabled: boolean
  emailDigests: 'instant' | 'daily' | 'weekly' | 'off'
  interviewReminders: boolean
  applicationStatusUpdates: boolean
  recruiterDirectMessages: boolean
  jobRecommendations: boolean
  walkInDriveAlerts: boolean
  soundEnabled: boolean
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailDigests: 'instant',
  interviewReminders: true,
  applicationStatusUpdates: true,
  recruiterDirectMessages: true,
  jobRecommendations: true,
  walkInDriveAlerts: true,
  soundEnabled: true,
}

const LOCAL_STORAGE_CACHE_KEY = 'castallio_notifications_cache'
const LOCAL_STORAGE_PREFS_KEY = 'castallio_notifications_prefs'
export const NOTIFICATIONS_UPDATED_EVENT = 'castallio-notifications-updated'

// Fallback seed notifications representing authentic AEC talent recruitment workflow
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-seed-1',
    title: 'Technical Interview Defense Confirmed',
    body: 'Your technical defense round with Foster + Partners is scheduled for tomorrow at 11:30 AM via Google Meet. Architectural lead Marcus Vance will conduct the assessment.',
    type: 'interview',
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    metadata: {
      company_name: 'Foster + Partners',
      role_title: 'Senior BIM Coordinator & Computational Specialist',
      action_label: 'View Interview Defense',
      target_tab: 'interviews',
      priority: 'urgent',
      interview_time: '11:30 AM',
      interview_format: 'Google Meet',
    },
  },
  {
    id: 'notif-seed-2',
    title: 'Application Shortlisted by Studio Panel',
    body: 'Congratulations! Your application for Lead Computational Designer has been shortlisted by Arup India. The digital practice team has requested initial portfolio review.',
    type: 'application',
    is_read: false,
    created_at: new Date(Date.now() - 110 * 60 * 1000).toISOString(), // ~2 hours ago
    metadata: {
      company_name: 'Arup India',
      role_title: 'Lead Computational Designer & Parametric Architect',
      action_label: 'Track Application Status',
      target_tab: 'applications',
      application_status: 'Shortlisted',
      priority: 'important',
    },
  },
  {
    id: 'notif-seed-3',
    title: 'Direct Message from Digital Practice Director',
    body: '“Alex, we were impressed by your Tekla automated fabrication scripts. Are you available for a brief conversation regarding our new international airport transit package?”',
    type: 'message',
    is_read: false,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    metadata: {
      company_name: 'Mott MacDonald India',
      role_title: 'Head of Digital Engineering',
      action_label: 'Open Recruiter Chat',
      target_tab: 'messages',
      priority: 'important',
    },
  },
  {
    id: 'notif-seed-4',
    title: 'Walk-in Mega Recruitment Drive Invitation',
    body: 'You are invited to the L&T Construction Walk-in Drive for Senior BIM Modeling Engineers this Saturday at the Bangalore Technology Park campus. Fast-track badge ready.',
    type: 'drive',
    is_read: false,
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), // 18 hours ago
    metadata: {
      company_name: 'L&T Construction',
      role_title: 'Senior BIM Modeling Engineers',
      location: 'Bangalore Technology Park',
      action_label: 'View Walk-in Drive Pass',
      target_tab: 'walk-in-drives',
      priority: 'normal',
    },
  },
  {
    id: 'notif-seed-5',
    title: 'New High-Fit AI Recommendation (94% Compatibility)',
    body: 'A new opportunity for Senior VDC Specialist (₹16 - 22 LPA) in Mumbai matches your verified ISO 19650 and Navisworks clash mitigation stack.',
    type: 'recommendation',
    is_read: true,
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(), // Yesterday
    metadata: {
      company_name: 'Gensler India',
      role_title: 'Senior VDC Specialist & Project Lead',
      salary_text: '₹16 - 22 LPA',
      action_label: 'Explore Job Details',
      target_tab: 'find-jobs',
      priority: 'normal',
    },
  },
  {
    id: 'notif-seed-6',
    title: 'Profile Integrity Rating Boosted to All-Star (88%)',
    body: 'Your verified Autodesk Revit Professional credential and computational design project link have increased your recruiter visibility index by +42%.',
    type: 'system',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2 days ago
    metadata: {
      company_name: 'Castallio One Passport',
      action_label: 'Inspect Talent Passport',
      target_tab: 'my-profile',
      priority: 'normal',
    },
  },
  {
    id: 'notif-seed-7',
    title: 'Interview Slot Update: Structural Modeler Round',
    body: 'Buro Happold talent coordinator has confirmed the revised technical discussion slot for Friday at 02:00 PM via Microsoft Teams.',
    type: 'interview',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 86400 * 1000).toISOString(), // 3 days ago
    metadata: {
      company_name: 'Buro Happold',
      role_title: 'Senior Structural Modeler',
      interview_time: '02:00 PM',
      interview_format: 'Microsoft Teams',
      action_label: 'Review Session Schedule',
      target_tab: 'interviews',
      priority: 'urgent',
    },
  },
  {
    id: 'notif-seed-8',
    title: 'Application Dossier Downloaded by Employer',
    body: 'Stantec India downloaded your verified portfolio and BIM documentation sample sheets for internal project allocation assessment.',
    type: 'application',
    is_read: true,
    created_at: new Date(Date.now() - 5 * 86400 * 1000).toISOString(), // 5 days ago
    metadata: {
      company_name: 'Stantec India',
      role_title: 'BIM Coordination Lead',
      action_label: 'View Application History',
      target_tab: 'applications',
      application_status: 'Under Review',
      priority: 'normal',
    },
  },
]

export function formatRelativeTime(dateString: string): string {
  try {
    const timestamp = new Date(dateString).getTime()
    if (isNaN(timestamp)) return dateString

    const now = Date.now()
    const diffMs = now - timestamp
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    const date = new Date(timestamp)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  } catch {
    return dateString
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Fallback
    }
    return SEED_NOTIFICATIONS
  })

  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | NotificationPriority>('all')
  const [selectedNotificationForDetail, setSelectedNotificationForDetail] = useState<NotificationItem | null>(null)
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [referenceTimestamp] = useState<number>(() => Date.now())

  // Notification Preferences
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PREFS_KEY)
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) }
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCES
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const t = setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3800)
    return () => clearTimeout(t)
  }, [])

  // Sync unread count to localStorage and dispatch event for sidebar badge
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length
  }, [notifications])

  const notifyCountUpdated = useCallback((count: number) => {
    try {
      localStorage.setItem('castallio_unread_notifications_count', String(count))
      window.dispatchEvent(
        new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, { detail: { unreadCount: count } })
      )
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    notifyCountUpdated(unreadCount)
  }, [unreadCount, notifyCountUpdated])

  // Persist notifications cache
  const persistNotifications = useCallback((items: NotificationItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [])

  // Fetch real notifications from Supabase
  const loadNotifications = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      const resolvedUserId = user?.id || localStorage.getItem('castallio_user_id')

      if (resolvedUserId) {
        const { data: dbData, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', resolvedUserId)
          .order('created_at', { ascending: false })

        if (!error && dbData && dbData.length > 0) {
          const mapped: NotificationItem[] = dbData.map((row) => ({
            id: String(row.id),
            user_id: row.user_id,
            title: row.title || 'Notification Alert',
            body: row.body || '',
            type: (row.type as NotificationType) || 'system',
            is_read: Boolean(row.is_read),
            metadata: row.metadata || null,
            created_at: row.created_at || new Date().toISOString(),
            job_id: row.job_id || null,
          }))

          setNotifications(mapped)
          persistNotifications(mapped)
          return
        }
      }

      // If user is guest or db table has no rows yet, use cached or fallback seed
      const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed)
          return
        }
      }

      setNotifications(SEED_NOTIFICATIONS)
      persistNotifications(SEED_NOTIFICATIONS)
    } catch (err) {
      console.warn('Notifications load fallback:', err)
      setNotifications(SEED_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }, [persistNotifications])

  useEffect(() => {
    let isCancelled = false

    const runInitialLoad = async () => {
      await loadNotifications()
      if (!isCancelled) {
        setLoading(false)
      }
    }

    runInitialLoad()

    return () => {
      isCancelled = true
    }
  }, [loadNotifications])

  // Mark a single notification as read
  const handleMarkAsRead = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      setNotifications((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
        persistNotifications(updated)
        return updated
      })

      // Attempt Supabase DB update if authenticated
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      } catch {
        // handled in local state
      }
    },
    [persistNotifications]
  )

  // Toggle Read / Unread
  const handleToggleRead = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      let nextStatus = false
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id)
        if (!target) return prev
        nextStatus = !target.is_read
        const updated = prev.map((item) =>
          item.id === id ? { ...item, is_read: nextStatus } : item
        )
        persistNotifications(updated)
        return updated
      })

      try {
        await supabase.from('notifications').update({ is_read: nextStatus }).eq('id', id)
      } catch {
        // handled
      }
    },
    [persistNotifications]
  )

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, is_read: true }))
      persistNotifications(updated)
      return updated
    })

    showToast('All notifications marked as read.')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
      }
    } catch {
      // handled
    }
  }, [persistNotifications, showToast])

  // Delete a notification
  const handleDeleteNotification = useCallback(
    async (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      setNotifications((prev) => {
        const updated = prev.filter((item) => item.id !== id)
        persistNotifications(updated)
        return updated
      })

      if (selectedNotificationForDetail?.id === id) {
        setSelectedNotificationForDetail(null)
      }

      showToast('Notification removed.')

      try {
        await supabase.from('notifications').delete().eq('id', id)
      } catch {
        // handled
      }
    },
    [persistNotifications, selectedNotificationForDetail, showToast]
  )

  // Clear all read notifications
  const handleClearAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.filter((item) => !item.is_read)
      persistNotifications(updated)
      return updated
    })
    showToast('Read notifications cleared.')
  }, [persistNotifications, showToast])

  // Save Preferences
  const handleSavePreferences = useCallback(
    (newPrefs: NotificationPreferences) => {
      setPreferences(newPrefs)
      try {
        localStorage.setItem(LOCAL_STORAGE_PREFS_KEY, JSON.stringify(newPrefs))
      } catch {
        // ignore
      }
      setIsPreferencesModalOpen(false)
      showToast('Notification delivery preferences updated successfully.')
    },
    [showToast]
  )

  // Simulate/Send Test Notification
  const handleSendTestNotification = useCallback(() => {
    const testTitles = [
      {
        title: 'New Recruiter Portfolio Inquiry',
        body: 'Foster + Partners Studio Lead sent an urgent inquiry regarding your parametric computational script dossier.',
        type: 'message' as NotificationType,
        company: 'Foster + Partners',
        tab: 'messages' as const,
        priority: 'urgent' as NotificationPriority,
      },
      {
        title: 'Live Walk-in Drive Tomorrow Morning',
        body: 'Bangalore Metro Rail Phase 3 Walk-in Drive badge has been validated for candidate entry at 10:00 AM.',
        type: 'drive' as NotificationType,
        company: 'BMRC / L&T',
        tab: 'walk-in-drives' as const,
        priority: 'important' as NotificationPriority,
      },
      {
        title: 'New AI Job Match: Lead BIM Coordinator',
        body: 'A newly approved requisition (₹18 - 25 LPA) has been matched to your verified Dynamo and ISO 19650 skills.',
        type: 'recommendation' as NotificationType,
        company: 'Mott MacDonald India',
        tab: 'find-jobs' as const,
        priority: 'normal' as NotificationPriority,
      },
    ]

    const picked = testTitles[Math.floor(Math.random() * testTitles.length)]
    const newNotif: NotificationItem = {
      id: `notif-test-${Date.now()}`,
      title: picked.title,
      body: picked.body,
      type: picked.type,
      is_read: false,
      created_at: new Date().toISOString(),
      metadata: {
        company_name: picked.company,
        action_label: 'View Immediate Details',
        target_tab: picked.tab,
        priority: picked.priority,
      },
    }

    setNotifications((prev) => {
      const updated = [newNotif, ...prev]
      persistNotifications(updated)
      return updated
    })

    showToast(`Test notification simulated: "${picked.title}"`)
  }, [persistNotifications, showToast])

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Tab filter
      if (activeTab === 'unread' && item.is_read) return false
      if (activeTab === 'interviews' && item.type !== 'interview') return false
      if (activeTab === 'applications' && item.type !== 'application') return false
      if (activeTab === 'messages' && item.type !== 'message') return false
      if (activeTab === 'jobs' && item.type !== 'recommendation' && item.type !== 'drive') return false
      if (activeTab === 'system' && item.type !== 'system') return false

      // 2. Priority filter
      if (priorityFilter !== 'all') {
        const itemPriority = item.metadata?.priority || 'normal'
        if (itemPriority !== priorityFilter) return false
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchBody = item.body.toLowerCase().includes(query)
        const matchCompany = (item.metadata?.company_name || '').toLowerCase().includes(query)
        const matchRole = (item.metadata?.role_title || '').toLowerCase().includes(query)
        const matchType = item.type.toLowerCase().includes(query)
        if (!matchTitle && !matchBody && !matchCompany && !matchRole && !matchType) return false
      }

      return true
    })
  }, [notifications, activeTab, priorityFilter, searchQuery])

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.is_read).length,
      interviews: notifications.filter((n) => n.type === 'interview').length,
      applications: notifications.filter((n) => n.type === 'application').length,
      messages: notifications.filter((n) => n.type === 'message').length,
      jobs: notifications.filter((n) => n.type === 'recommendation' || n.type === 'drive').length,
      system: notifications.filter((n) => n.type === 'system').length,
    }
  }, [notifications])

  // Metrics
  const metrics = useMemo(() => {
    const total = notifications.length
    const unread = notifications.filter((n) => !n.is_read).length
    const urgent = notifications.filter((n) => n.metadata?.priority === 'urgent' && !n.is_read).length
    const todayCutoff = referenceTimestamp - 24 * 60 * 60 * 1000
    const todayCount = notifications.filter((n) => new Date(n.created_at).getTime() >= todayCutoff).length

    return {
      total,
      unread,
      urgent,
      todayCount,
    }
  }, [notifications, referenceTimestamp])

  return {
    notifications,
    filteredNotifications,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    selectedNotificationForDetail,
    setSelectedNotificationForDetail,
    isPreferencesModalOpen,
    setIsPreferencesModalOpen,
    preferences,
    toastMessage,
    unreadCount,
    tabCounts,
    metrics,
    handleMarkAsRead,
    handleToggleRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleClearAllRead,
    handleSavePreferences,
    handleSendTestNotification,
    loadNotifications,
    showToast,
  }
}
