import { useState, useMemo, useCallback } from 'react'

export interface PipelineStats {
  sourced: number
  applied: number
  shortlisted: number
  sandboxes: number
}

export interface RequisitionItem {
  id: string
  refCode: string
  title: string
  location: string
  salaryRange: string
  employmentType: string
  status: 'active' | 'draft' | 'interviewing' | 'closed'
  badges: string[]
  healthScore: number
  healthLabel?: string
  stack: string[]
  pipeline: PipelineStats
  createdDateText: string
  author?: string
  progressPercent?: number
  hiredCandidateName?: string
}

export interface LiveRadarAlert {
  id: string
  candidateName: string
  candidateRole: string
  matchScore: number
  targetRequisitionTitle: string
  timeAgo: string
  isSandboxCompleted?: boolean
}

export type JobSegmentFilter = 'all' | 'active' | 'draft' | 'interviewing' | 'closed'

const INITIAL_REQUISITIONS: RequisitionItem[] = [
  {
    id: 'req-1',
    refCode: 'REQ-F+P-8041',
    title: 'Lead Computational Façade Designer',
    location: 'London Riverside Studio (Hybrid)',
    salaryRange: '£125,000 - £155,000 / yr',
    employmentType: 'Permanent Position',
    status: 'active',
    badges: ['ACTIVE • INSTANT RADAR', 'LOD 400 FABRICATION', 'ISO 19650 LEVEL 2'],
    healthScore: 96,
    healthLabel: 'Optimal Funnel',
    stack: ['Revit API & pyRevit', 'Rhino 8 + Grasshopper', 'Speckle Systems', 'Solibri Checker'],
    pipeline: {
      sourced: 142,
      applied: 38,
      shortlisted: 18,
      sandboxes: 2,
    },
    createdDateText: 'Active 3d ago',
    author: 'Elena Rostova',
  },
  {
    id: 'req-2',
    refCode: 'REQ-F+P-7910',
    title: 'Senior VDC / Infrastructure BIM Lead (HS2 Phase 1)',
    location: 'Birmingham / London • Hybrid',
    salaryRange: '£95,000 - £115,000 / yr',
    employmentType: 'Full-time Permanent',
    status: 'interviewing',
    badges: ['ACTIVE • LIVE SYNDICATION', 'openBIM / IFC 4x3', 'COBie SPECIFIED'],
    healthScore: 91,
    healthLabel: '1 Offer Stage Pending',
    stack: ['Navisworks Manage', 'Synchro 4D', 'Civil 3D Alignment', 'Solibri Ruleset'],
    pipeline: {
      sourced: 96,
      applied: 24,
      shortlisted: 8,
      sandboxes: 1,
    },
    createdDateText: 'Active 1w ago',
    author: 'Dr. Julian Croft',
  },
  {
    id: 'req-3',
    refCode: 'REQ-F+P-8102',
    title: 'AEC Software Engineer & C# / Speckle Plugin Developer',
    location: 'Global Remote (Worldwide)',
    salaryRange: '$160,000 - $190,000 USD',
    employmentType: 'Remote Staff',
    status: 'active',
    badges: ['ACTIVE • GLOBAL REMOTE', 'C# / .NET 8', 'AUTODESK PLATFORM SERVICES (APS)'],
    healthScore: 98,
    healthLabel: '12 Git Repos Evaluated',
    stack: ['C#', '.NET 8', 'Speckle Core', 'Revit API', 'GraphQL'],
    pipeline: {
      sourced: 114,
      applied: 42,
      shortlisted: 12,
      sandboxes: 4,
    },
    createdDateText: 'Active 5d ago',
    author: 'Elena Rostova',
  },
  {
    id: 'req-4',
    refCode: 'REQ-F+P-8220',
    title: 'Parametric Urban Designer & Environmental Simulation Lead',
    location: 'Studio: London / Zurich',
    salaryRange: '£110,000 - £135,000 / yr',
    employmentType: 'Draft Requisition',
    status: 'draft',
    badges: ['DRAFT • PENDING COMP APPROVAL', 'LADYBUG / HONEYBEE'],
    healthScore: 75,
    healthLabel: 'Stage 03 Computational Stack Setup (75% Done)',
    stack: ['Rhino', 'Grasshopper', 'Ladybug', 'Honeybee', 'CityEngine'],
    progressPercent: 75,
    pipeline: {
      sourced: 0,
      applied: 0,
      shortlisted: 0,
      sandboxes: 0,
    },
    createdDateText: 'Created 2 days ago by Elena Rostova',
    author: 'Elena Rostova',
  },
  {
    id: 'req-5',
    refCode: 'REQ-F+P-7409',
    title: 'BIM Coordinator - Aviation Master Terminals',
    location: 'London Riverside Studio',
    salaryRange: '£90,000 - £110,000 / yr',
    employmentType: 'Fulfilled / Archived',
    status: 'closed',
    badges: ['FULFILLED • ARCHIVED'],
    healthScore: 100,
    healthLabel: 'Hired via Castallio Radar (Oct 2024)',
    hiredCandidateName: 'Alex Morgan (Current BIM Lead at Studio)',
    stack: ['Revit', 'Navisworks', 'BIM 360', 'COBie'],
    pipeline: {
      sourced: 85,
      applied: 32,
      shortlisted: 6,
      sandboxes: 1,
    },
    createdDateText: 'Fulfilled Oct 2024',
    author: 'Elena Rostova',
  },
]

const LIVE_RADAR_ALERTS: LiveRadarAlert[] = [
  {
    id: 'ra-1',
    candidateName: 'David Kim',
    candidateRole: 'Senior Façade Engineer • Zaha Hadid Arch alumni',
    matchScore: 96,
    targetRequisitionTitle: 'Lead Computational Façade',
    timeAgo: '12m ago',
  },
  {
    id: 'ra-2',
    candidateName: 'Elena V. Kowalski',
    candidateRole: 'Computational BIM Specialist • Arup Berlin',
    matchScore: 94,
    targetRequisitionTitle: 'Completed 3D WebGL Sandbox',
    timeAgo: '34m ago',
    isSandboxCompleted: true,
  },
  {
    id: 'ra-3',
    candidateName: 'Marcus Thorne, PE',
    candidateRole: 'VDC Project Director • Skanska UK',
    matchScore: 97,
    targetRequisitionTitle: 'HS2 Infrastructure Lead',
    timeAgo: '1h 14m ago',
  },
]

export function useMyJobs(onPostNewJob?: () => void) {
  const [requisitions, setRequisitions] = useState<RequisitionItem[]>(INITIAL_REQUISITIONS)
  const [activeTab, setActiveTab] = useState<JobSegmentFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [radarAlerts] = useState<LiveRadarAlert[]>(LIVE_RADAR_ALERTS)

  // Modals state
  const [selectedReqForCandidates, setSelectedReqForCandidates] = useState<RequisitionItem | null>(null)
  const [isCandidatesModalOpen, setIsCandidatesModalOpen] = useState<boolean>(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Derived counts
  const totalCount = requisitions.length
  const activeCount = useMemo(() => requisitions.filter((r) => r.status === 'active').length, [requisitions])
  const draftCount = useMemo(() => requisitions.filter((r) => r.status === 'draft').length, [requisitions])
  const interviewingCount = useMemo(() => requisitions.filter((r) => r.status === 'interviewing').length, [requisitions])
  const closedCount = useMemo(() => requisitions.filter((r) => r.status === 'closed').length, [requisitions])

  // Filtered requisitions
  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((req) => {
      // Tab filter
      if (activeTab === 'active' && req.status !== 'active') return false
      if (activeTab === 'draft' && req.status !== 'draft') return false
      if (activeTab === 'interviewing' && req.status !== 'interviewing') return false
      if (activeTab === 'closed' && req.status !== 'closed') return false

      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = req.title.toLowerCase().includes(q)
        const matchRef = req.refCode.toLowerCase().includes(q)
        const matchLoc = req.location.toLowerCase().includes(q)
        const matchStack = req.stack.some((s) => s.toLowerCase().includes(q))
        if (!matchTitle && !matchRef && !matchLoc && !matchStack) return false
      }

      return true
    })
  }, [requisitions, activeTab, searchQuery])

  // Handlers
  const handlePauseRequisition = useCallback(
    (id: string) => {
      setRequisitions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? 'draft' : 'active' } : r))
      )
      showToast('Requisition radar status updated.')
    },
    [showToast]
  )

  const handleDuplicateRequisition = useCallback(
    (req: RequisitionItem) => {
      const duplicated: RequisitionItem = {
        ...req,
        id: `req-${Date.now()}`,
        refCode: `REQ-F+P-${Math.floor(1000 + Math.random() * 9000)}`,
        title: `${req.title} (Copy)`,
        status: 'draft',
        createdDateText: 'Duplicated just now',
        pipeline: { sourced: 0, applied: 0, shortlisted: 0, sandboxes: 0 },
      }
      setRequisitions((prev) => [duplicated, ...prev])
      showToast(`Duplicated "${req.title}" as new draft requisition.`)
    },
    [showToast]
  )

  const handleDiscardDraft = useCallback(
    (id: string) => {
      setRequisitions((prev) => prev.filter((r) => r.id !== id))
      showToast('Draft requisition discarded.')
    },
    [showToast]
  )

  const handleReopenRequisition = useCallback(
    (id: string) => {
      setRequisitions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'active', createdDateText: 'Re-opened today' } : r))
      )
      showToast('Requisition re-opened on active Talent Radar.')
    },
    [showToast]
  )

  const handleExportLedger = useCallback(
    (format: 'csv' | 'pdf') => {
      const exportContent = requisitions
        .map(
          (r) =>
            `${r.refCode},"${r.title}","${r.location}","${r.salaryRange}",${r.status.toUpperCase()},${r.pipeline.applied} APPLICANTS,${r.pipeline.shortlisted} SHORTLISTED`
        )
        .join('\n')

      const header = 'REQ_ID,TITLE,LOCATION,COMPENSATION,STATUS,APPLICANTS,SHORTLISTED\n'
      const blob = new Blob([header + exportContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Foster_Partners_AEC_Requisitions_${new Date().toISOString().slice(0, 10)}.${format === 'csv' ? 'csv' : 'txt'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setIsExportModalOpen(false)
      showToast(`Exported ${requisitions.length} requisitions as ${format.toUpperCase()} ledger!`)
    },
    [requisitions, showToast]
  )

  const handleOpenCandidates = useCallback((req: RequisitionItem) => {
    setSelectedReqForCandidates(req)
    setIsCandidatesModalOpen(true)
  }, [])

  return {
    requisitions,
    filteredRequisitions,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    radarAlerts,
    totalCount,
    activeCount,
    draftCount,
    interviewingCount,
    closedCount,
    selectedReqForCandidates,
    isCandidatesModalOpen,
    setIsCandidatesModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    toastMessage,
    showToast,
    handlePauseRequisition,
    handleDuplicateRequisition,
    handleDiscardDraft,
    handleReopenRequisition,
    handleExportLedger,
    handleOpenCandidates,
    onPostNewJob,
  }
}
