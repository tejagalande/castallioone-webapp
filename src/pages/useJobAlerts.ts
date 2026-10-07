import { useState, useMemo, useCallback } from 'react'

export interface OpportunityMatch {
  id: string
  firmName: string
  fitScore: number
  salaryText: string
  locationText: string
  isTopMatch?: boolean
}

export interface JobAlertItem {
  id: string
  refCode: string
  title: string
  targetFirms: string
  isActive: boolean
  isInstant: boolean
  isPaused: boolean
  pausedText?: string
  matchBadge?: string
  isoBadge?: string
  locationType: string
  packageRange: string
  experienceLod: string
  velocityText: string
  stack: string[]
  recentMatches?: OpportunityMatch[]
  totalMatchesCount: number
  rateStructure?: string
  coreToolset?: string
  latestHit?: string
  techPrereqs?: string
  activeInbounds?: string
  updatedText?: string
  slackSyncLive?: boolean
  dormantCachedCount?: number
}

export interface DeliveryChannel {
  id: string
  icon: string
  title: string
  subtext: string
  status: 'CONFIGURED' | 'ENABLED' | 'OPERATIONAL' | 'ACTIVE'
}

export interface TrendingQuery {
  id: string
  name: string
  growth: string
}

export type FilterTab = 'all' | 'active' | 'paused' | 'instant'

const INITIAL_ALERTS: JobAlertItem[] = []

const INITIAL_CHANNELS: DeliveryChannel[] = []

const TRENDING_QUERIES: TrendingQuery[] = []

export function useJobAlerts() {
  const [alerts, setAlerts] = useState<JobAlertItem[]>(INITIAL_ALERTS)
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [precisionThreshold, setPrecisionThreshold] = useState<number>(92)
  const [channels, setChannels] = useState<DeliveryChannel[]>(INITIAL_CHANNELS)

  // Calibration checkboxes
  const [strictIso, setStrictIso] = useState<boolean>(true)
  const [requireSalary, setRequireSalary] = useState<boolean>(true)
  const [excludeHeadhunters, setExcludeHeadhunters] = useState<boolean>(true)
  const [tier1Only, setTier1Only] = useState<boolean>(false)

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState<boolean>(false)
  const [isMatchesModalOpen, setIsMatchesModalOpen] = useState<boolean>(false)
  const [selectedAlertForMatches, setSelectedAlertForMatches] = useState<JobAlertItem | null>(null)

  // New alert form data
  const [newRoleTitle, setNewRoleTitle] = useState<string>('')
  const [newTargetFirms, setNewTargetFirms] = useState<string>('')
  const [newPackageRange, setNewPackageRange] = useState<string>('£120,000 - £150,000')
  const [newLocationType, setNewLocationType] = useState<string>('London / Hybrid')
  const [newStackTags, setNewStackTags] = useState<string>('Rhino, Grasshopper, Revit')
  const [newIsInstant, setNewIsInstant] = useState<boolean>(true)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Derived counts
  const activeCount = useMemo(() => alerts.filter((a) => a.isActive).length, [alerts])
  const pausedCount = useMemo(() => alerts.filter((a) => !a.isActive).length, [alerts])
  const instantCount = useMemo(() => alerts.filter((a) => a.isInstant && a.isActive).length, [alerts])

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Tab filter
      if (activeFilterTab === 'active' && !alert.isActive) return false
      if (activeFilterTab === 'paused' && alert.isActive) return false
      if (activeFilterTab === 'instant' && (!alert.isInstant || !alert.isActive)) return false

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = alert.title.toLowerCase().includes(q)
        const matchFirms = alert.targetFirms.toLowerCase().includes(q)
        const matchStack = alert.stack.some((s) => s.toLowerCase().includes(q))
        if (!matchTitle && !matchFirms && !matchStack) return false
      }

      return true
    })
  }, [alerts, activeFilterTab, searchQuery])

  // Handlers
  const handleToggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const newActive = !a.isActive
          return {
            ...a,
            isActive: newActive,
            isPaused: !newActive,
            pausedText: newActive ? undefined : 'PAUSED (Manually paused just now)',
            velocityText: newActive ? (a.isInstant ? 'Instant webhook push' : 'Daily digest') : 'Radar Dormant',
          }
        }
        return a
      })
    )
    showToast('Alert trigger status updated.')
  }, [showToast])

  const handlePauseAll = useCallback(() => {
    const allPaused = alerts.every((a) => !a.isActive)
    const nextState = allPaused // if all paused, resume all; otherwise pause all
    setAlerts((prev) =>
      prev.map((a) => ({
        ...a,
        isActive: nextState,
        isPaused: !nextState,
        pausedText: nextState ? undefined : 'PAUSED (Bulk paused)',
        velocityText: nextState ? (a.isInstant ? 'Instant webhook push' : 'Daily digest') : 'Radar Dormant',
      }))
    )
    showToast(nextState ? 'All opportunity triggers resumed!' : 'All opportunity triggers paused.')
  }, [alerts, showToast])

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    showToast('Alert configuration removed from radar.')
  }, [showToast])

  const handleCreateAlert = useCallback(() => {
    if (!newRoleTitle.trim()) {
      showToast('Please enter a role title for the alert.')
      return
    }

    const tags = newStackTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newAlert: JobAlertItem = {
      id: `alt-${Date.now()}`,
      refCode: `REF: ALT-${Math.floor(1000 + Math.random() * 9000)}-CUSTOM`,
      title: newRoleTitle.trim(),
      targetFirms: newTargetFirms.trim() || 'Tier-1 AEC Design Practices',
      isActive: true,
      isInstant: newIsInstant,
      isPaused: false,
      matchBadge: 'NEW RADAR ACTIVE',
      isoBadge: 'ISO 19650 READY',
      locationType: newLocationType.trim(),
      packageRange: newPackageRange.trim(),
      experienceLod: '4+ Yrs • LOD 350-500',
      velocityText: newIsInstant ? 'Instant webhook push' : 'Daily digest',
      stack: tags.length > 0 ? tags : ['Rhino', 'Grasshopper', 'Revit'],
      totalMatchesCount: 2,
      recentMatches: [
        {
          id: `m-new-1`,
          firmName: 'Arup Applied Research',
          fitScore: 97,
          salaryText: newPackageRange.trim(),
          locationText: newLocationType.trim(),
          isTopMatch: true,
        },
      ],
    }

    setAlerts((prev) => [newAlert, ...prev])
    setIsCreateModalOpen(false)
    setNewRoleTitle('')
    setNewTargetFirms('')
    showToast('New algorithmic radar created and activated!')
  }, [newRoleTitle, newTargetFirms, newPackageRange, newLocationType, newStackTags, newIsInstant, showToast])

  const handleAddTrendingTag = useCallback((tagName: string) => {
    setSearchQuery(tagName)
    showToast(`Filtered radar feed for: "${tagName}"`)
  }, [showToast])

  const handleReindex = useCallback(() => {
    showToast(`Talent Graph re-indexed with ${precisionThreshold}% precision threshold!`)
  }, [precisionThreshold, showToast])

  const handleSendTestDispatch = useCallback(() => {
    showToast('Test push dispatch sent to email digest and Slack webhook.')
  }, [showToast])

  const handleViewMatches = useCallback((alert: JobAlertItem) => {
    setSelectedAlertForMatches(alert)
    setIsMatchesModalOpen(true)
  }, [])

  return {
    alerts,
    filteredAlerts,
    activeFilterTab,
    setActiveFilterTab,
    searchQuery,
    setSearchQuery,
    precisionThreshold,
    setPrecisionThreshold,
    channels,
    setChannels,
    strictIso,
    setStrictIso,
    requireSalary,
    setRequireSalary,
    excludeHeadhunters,
    setExcludeHeadhunters,
    tier1Only,
    setTier1Only,
    activeCount,
    pausedCount,
    instantCount,
    trendingQueries: TRENDING_QUERIES,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isChannelsModalOpen,
    setIsChannelsModalOpen,
    isMatchesModalOpen,
    setIsMatchesModalOpen,
    selectedAlertForMatches,
    newRoleTitle,
    setNewRoleTitle,
    newTargetFirms,
    setNewTargetFirms,
    newPackageRange,
    setNewPackageRange,
    newLocationType,
    setNewLocationType,
    newStackTags,
    setNewStackTags,
    newIsInstant,
    setNewIsInstant,
    toastMessage,
    showToast,
    handleToggleAlert,
    handlePauseAll,
    handleDeleteAlert,
    handleCreateAlert,
    handleAddTrendingTag,
    handleReindex,
    handleSendTestDispatch,
    handleViewMatches,
  }
}
