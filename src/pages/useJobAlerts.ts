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

const INITIAL_ALERTS: JobAlertItem[] = [
  {
    id: 'alt-1',
    refCode: 'REF: ALT-8804-FACADE',
    title: 'Lead Computational Façade Specialist & BIM Director',
    targetFirms: 'Foster + Partners, Zaha Hadid Architects, BIG, Grimshaw',
    isActive: true,
    isInstant: true,
    isPaused: false,
    matchBadge: '98% TOP MATCH',
    isoBadge: 'ISO 19650 LEVEL 2',
    locationType: 'London / Hybrid (2d)',
    packageRange: '£120,000 - £160,000',
    experienceLod: '6+ Yrs • LOD 400-500',
    velocityText: 'Instant webhook push',
    stack: ['Rhino 8', 'Grasshopper', 'pyRevit', 'Revit API (C#)', 'Speckle'],
    recentMatches: [
      {
        id: 'm-1',
        firmName: 'Foster + Partners',
        fitScore: 98,
        salaryText: '£145,000',
        locationText: 'City of London',
        isTopMatch: true,
      },
      {
        id: 'm-2',
        firmName: 'ZHA CODE Lab',
        fitScore: 96,
        salaryText: '£135,000',
        locationText: 'Clerkenwell',
      },
      {
        id: 'm-3',
        firmName: 'Heatherwick Studio',
        fitScore: 93,
        salaryText: '£130,000',
        locationText: "King's Cross",
      },
    ],
    totalMatchesCount: 7,
  },
  {
    id: 'alt-2',
    refCode: 'REF: ALT-9112-INFRA',
    title: 'Senior VDC / BIM Infrastructure Coordinator (Rail & Transit)',
    targetFirms: 'HS2 Phase One, Crossrail Ops, Heathrow Terminal 2 Expansion, Skanska-Costain JV',
    isActive: true,
    isInstant: false,
    isPaused: false,
    isoBadge: 'OPENBIM / IFC4x3',
    locationType: 'London / Birmingham (Onsite/Hybrid)',
    packageRange: '£550 - £750 / day',
    experienceLod: '5+ Yrs • ISO 19650-2',
    velocityText: 'Daily digest (08:00 GMT)',
    stack: ['Navisworks', 'Solibri', 'Synchro 4D', 'Civil 3D'],
    rateStructure: '£550 - £750 / day (Inside IR35)',
    coreToolset: 'Navisworks, Solibri, Synchro 4D',
    latestHit: 'Grimshaw HS2 Lead (95%)',
    updatedText: 'Updated: 4h ago',
    totalMatchesCount: 4,
  },
  {
    id: 'alt-3',
    refCode: 'REF: ALT-7230-API',
    title: 'Parametric Automation Engineer & C# Revit Plugin Developer',
    targetFirms: 'Computational AEC Consultancies, APS/Autodesk Ecosystem Partners',
    isActive: true,
    isInstant: true,
    isPaused: false,
    isoBadge: 'GLOBAL REMOTE',
    locationType: 'Global Remote (UK/US/EU)',
    packageRange: '$160,000 - $195,000',
    experienceLod: '4+ Yrs • Cloud APIs',
    velocityText: 'Instant push & Slack sync',
    stack: ['C#', '.NET', 'Speckle', 'APS', 'Dynamo', 'Python'],
    rateStructure: '$160,000 - $195,000 (USD Global Payout)',
    techPrereqs: 'C#, .NET, Speckle, APS, Dynamo',
    activeInbounds: 'Arup Digital (97%), TT CORE (94%)',
    slackSyncLive: true,
    totalMatchesCount: 3,
  },
  {
    id: 'alt-4',
    refCode: 'REF: ALT-4019-TIMBER',
    title: 'Design Technology Specialist — Mass Timber & Sustainable FEA',
    targetFirms: 'Zurich / Geneva / London • Karamba3D, Ladybug/Honeybee, Embodied Carbon LCA modeling.',
    isActive: false,
    isInstant: false,
    isPaused: true,
    pausedText: 'PAUSED (Manually paused 3 days ago)',
    locationType: 'Zurich / Geneva / London',
    packageRange: 'CHF 130,000 - 155,000',
    experienceLod: '4+ Yrs • FEA & LCA',
    velocityText: 'Radar Dormant',
    stack: ['Karamba3D', 'Ladybug', 'Honeybee', 'Rhino', 'Grasshopper'],
    dormantCachedCount: 6,
    totalMatchesCount: 6,
  },
]

const INITIAL_CHANNELS: DeliveryChannel[] = [
  {
    id: 'ch-email',
    icon: 'mail',
    title: 'Email Digest (08:00 GMT)',
    subtext: 'active@alexmorgan.bim',
    status: 'CONFIGURED',
  },
  {
    id: 'ch-sms',
    icon: 'sms',
    title: 'Instant SMS Radar',
    subtext: '+44 7911 ••••21 (>95% Match)',
    status: 'ENABLED',
  },
  {
    id: 'ch-slack',
    icon: 'terminal',
    title: 'Slack Webhook Sync',
    subtext: '#bim-alerts-morgan',
    status: 'OPERATIONAL',
  },
  {
    id: 'ch-apply',
    icon: 'link',
    title: '1-Click Apply Token',
    subtext: 'Auto-attach BEP & Portfolio',
    status: 'ACTIVE',
  },
]

const TRENDING_QUERIES: TrendingQuery[] = [
  { id: 'tq-1', name: 'Speckle Systems + IFC4', growth: '+42% query growth' },
  { id: 'tq-2', name: 'Grasshopper Karamba Carbon FEA', growth: '+31% query growth' },
  { id: 'tq-3', name: 'pyRevit CI/CD Pipeline', growth: '+25% query growth' },
  { id: 'tq-4', name: 'ISO 19650 CDE Information Lead', growth: '+18% query growth' },
]

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
