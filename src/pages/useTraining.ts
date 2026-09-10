import { useState, useMemo, useCallback } from 'react'

export interface CourseModule {
  id: string
  title: string
  duration: string
  isCompleted?: boolean
}

export interface CourseItem {
  id: string
  title: string
  provider: string
  collaboration?: string
  isFlagship?: boolean
  isEnrolled?: boolean
  progressPercent?: number
  matchScore?: number
  matchReason?: string
  matchReasonType?: 'ai-gap' | 'compliance' | 'market-demand' | 'career-velocity'
  category: 'computational' | 'bim-iso' | 'vdc-synchro' | 'revit-python'
  stacks: string[]
  totalHours: number
  modulesCount: number
  cpdPoints: number
  rating: number
  reviewsCount: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive'
  instructor?: {
    name: string
    title: string
    initials: string
  }
  isFreeForPro: boolean
  isBuildingSmartCertified?: boolean
  hasSandbox?: boolean
  description?: string
  syllabus?: CourseModule[]
}

export interface LearningPathStep {
  id: number
  title: string
  status: 'done' | 'in-progress' | 'locked' | 'capstone'
  progressPercent?: number
  subtext: string
  note: string
}

export interface WorkshopSession {
  id: string
  title: string
  dateText: string
  instructor: string
  description: string
  seatsRemaining: number
  isFreeForPro: boolean
  isReserved?: boolean
}

export type CategoryFilter = 'all' | 'recommended' | 'computational' | 'bim-iso' | 'vdc-synchro' | 'revit-python'

const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'crs-flagship',
    title: 'Advanced Computational BIM & pyRevit Plugin Engineering for Large-Scale Infrastructure',
    provider: 'Castallio Masterclass // Executive Series',
    isFlagship: true,
    isEnrolled: false,
    category: 'computational',
    level: 'Advanced',
    instructor: {
      name: 'Dr. Julian Croft',
      title: 'Partner & Head of Applied R&D, ex-Foster + Partners & Castallio Core Team',
      initials: 'JC',
    },
    stacks: ['Rhino.Inside', 'pyRevit', 'C# / .NET', 'IFC 4x3', 'Speckle Core'],
    totalHours: 18,
    modulesCount: 8,
    cpdPoints: 18,
    rating: 4.98,
    reviewsCount: 512,
    isFreeForPro: true,
    isBuildingSmartCertified: true,
    hasSandbox: true,
    description:
      'Deep-dive into custom C#/.NET Revit API plugins, Rhino.Inside Revit automation pipelines, and multi-tenant IFC 4x3 cloud schema synchronizations for Tier-1 airport and rail interchanges.',
    syllabus: [
      { id: 'm1', title: 'Revit API Internal Architecture & Transaction Management', duration: '2h 15m' },
      { id: 'm2', title: 'pyRevit Custom UI Ribbon & WPF XAML GUI Development', duration: '2h 45m' },
      { id: 'm3', title: 'Rhino.Inside Revit Headless Pipeline Orchestration', duration: '2h 30m' },
      { id: 'm4', title: 'IFC4x3 Alignment Schema Mapping for Rail Interchanges', duration: '2h 10m' },
      { id: 'm5', title: 'High-Performance Double-Curved Facade Panelization', duration: '2h 50m' },
      { id: 'm6', title: 'Multi-Tenant Cloud Data Streaming with Speckle 2.0', duration: '2h 00m' },
      { id: 'm7', title: 'CI/CD Unit Testing for Firmwide pyRevit Deployment', duration: '1h 50m' },
      { id: 'm8', title: 'Capstone: Airport Terminal B Geometry Automation Defense', duration: '1h 40m' },
    ],
  },
  {
    id: 'crs-1',
    title: 'Automated LOD-400 Façade Panelization & Clash Elimination',
    provider: 'Castallio Engineering Labs',
    collaboration: 'In Collaboration with Zaha Hadid Architects CODE',
    category: 'computational',
    level: 'Advanced',
    matchScore: 98,
    matchReason: 'Targeted to bridge your gap for Foster + Partners Lead Computational Designer role.',
    matchReasonType: 'ai-gap',
    stacks: ['Grasshopper', 'Kangaroo 2', 'Karamba FEA', 'GFRC Panel Schedules'],
    totalHours: 14,
    modulesCount: 6,
    cpdPoints: 12,
    rating: 4.9,
    reviewsCount: 340,
    isFreeForPro: true,
    hasSandbox: true,
    syllabus: [
      { id: 'c1-1', title: 'NURBS Surface Analysis and Curvature Rationalization', duration: '2h 30m' },
      { id: 'c1-2', title: 'Kangaroo 2 Dynamic Relaxation & Panel Flattening', duration: '2h 15m' },
      { id: 'c1-3', title: 'Karamba 3D Stress Distribution on Façade Substructures', duration: '2h 45m' },
      { id: 'c1-4', title: 'LOD-400 Fabrication Tolerances & CNC Export Automation', duration: '2h 30m' },
      { id: 'c1-5', title: 'Automated Clash Avoidance with Structural Mullions', duration: '2h 00m' },
      { id: 'c1-6', title: 'Interactive WebGL Client Presentation Defense', duration: '2h 00m' },
    ],
  },
  {
    id: 'crs-2',
    title: 'ISO 19650-2 CDE Implementation & Information Management Protocol',
    provider: 'Castallio Academy',
    collaboration: 'Approved by BRE Academy',
    category: 'bim-iso',
    level: 'Intermediate',
    isEnrolled: true,
    progressPercent: 64,
    matchReason: 'Required prerequisite for UK Tier-1 Rail (HS2 Phase 1) contracts.',
    matchReasonType: 'compliance',
    stacks: ['CDE Federation', 'EIR/BEP Creation', 'COBie Drop Tables', 'IFC 4x3 MVD'],
    totalHours: 10,
    modulesCount: 4,
    cpdPoints: 10,
    rating: 4.8,
    reviewsCount: 890,
    isFreeForPro: true,
    isBuildingSmartCertified: true,
    syllabus: [
      { id: 'c2-1', title: 'ISO 19650-1 & 2 Core Principles & Information Delivery Cycles', duration: '2h 30m', isCompleted: true },
      { id: 'c2-2', title: 'EIR Decomposition & Pre/Post Award BEP Development', duration: '2h 30m', isCompleted: true },
      { id: 'c2-3', title: 'Common Data Environment (CDE) Workflow States & Metadata', duration: '2h 30m', isCompleted: true },
      { id: 'c2-4', title: 'COBie Data Auditing & Schema Validation Checks', duration: '2h 30m', isCompleted: false },
    ],
  },
  {
    id: 'crs-3',
    title: 'Speckle 2.0 & OpenBIM Cloud Data Pipelines for AEC',
    provider: 'Castallio Innovation Hub',
    collaboration: 'OpenBIM Spec',
    category: 'computational',
    level: 'Intermediate',
    matchScore: 94,
    matchReason: 'Trending tool among your saved engineering practices (Buro Happold, SOM).',
    matchReasonType: 'market-demand',
    stacks: ['Speckle Server', 'GraphQL API', 'Python SDK', 'WebGL Model Delivery'],
    totalHours: 8,
    modulesCount: 3,
    cpdPoints: 8,
    rating: 4.95,
    reviewsCount: 210,
    isFreeForPro: true,
    hasSandbox: true,
    syllabus: [
      { id: 'c3-1', title: 'Speckle Architecture & Stream Management', duration: '2h 30m' },
      { id: 'c3-2', title: 'GraphQL Filtering & Automated Geometry Extraction', duration: '3h 00m' },
      { id: 'c3-3', title: 'Deploying Custom WebGL Model Review Portals', duration: '2h 30m' },
    ],
  },
  {
    id: 'crs-4',
    title: '4D Construction Simulation & Logistics in Synchro Pro & Navisworks',
    provider: 'Castallio Infrastructure Academy',
    collaboration: 'VDC Practice',
    category: 'vdc-synchro',
    level: 'Advanced',
    matchScore: 91,
    matchReason: 'Fast-track requirement for Senior VDC Coordinator and Project Lead classifications.',
    matchReasonType: 'career-velocity',
    stacks: ['Synchro 4D', 'Primavera P6 Link', 'Heavy Civil Phasing', 'Navisworks Manage'],
    totalHours: 16,
    modulesCount: 8,
    cpdPoints: 16,
    rating: 4.7,
    reviewsCount: 420,
    isFreeForPro: true,
    syllabus: [
      { id: 'c4-1', title: '3D Geometry Ingestion and Spatial Grid Alignment', duration: '2h 00m' },
      { id: 'c4-2', title: 'Primavera P6 & MS Project Resource Logic Integration', duration: '2h 00m' },
      { id: 'c4-3', title: 'Automated 4D Task Assignment by Parameter Rules', duration: '2h 00m' },
      { id: 'c4-4', title: 'Site Crane Radius Clearance & Equipment Simulation', duration: '2h 00m' },
      { id: 'c4-5', title: 'Clash Resolution Over Construction Timeline', duration: '2h 00m' },
      { id: 'c4-6', title: 'Earned Value S-Curve Analysis Linked to Model Elements', duration: '2h 00m' },
      { id: 'c4-7', title: 'High-Fidelity Rendered Phasing Sequence Animations', duration: '2h 00m' },
      { id: 'c4-8', title: 'Real-Time Site Logistics Defense for Project Stakeholders', duration: '2h 00m' },
    ],
  },
]

const LEARNING_PATH_STEPS: LearningPathStep[] = [
  {
    id: 1,
    title: 'Step 1: ISO 19650 Lead',
    status: 'done',
    progressPercent: 100,
    subtext: 'Done',
    note: 'BRE Academy credential verified on-chain',
  },
  {
    id: 2,
    title: 'Step 2: pyRevit & Automation',
    status: 'in-progress',
    progressPercent: 70,
    subtext: '70%',
    note: 'Current Module: Dynamo-to-C# migration',
  },
  {
    id: 3,
    title: 'Step 3: OpenBIM Architecture',
    status: 'locked',
    subtext: 'Locked',
    note: 'Requires completion of Step 2',
  },
  {
    id: 4,
    title: 'Step 4: VDC Leadership Defense',
    status: 'capstone',
    subtext: 'Capstone',
    note: 'Live jury defense with global BIM leaders',
  },
]

const INITIAL_WORKSHOP: WorkshopSession = {
  id: 'ws-1',
  title: 'Algorithmic Façade Rationalization AMA',
  dateText: 'NOV 14 • 17:00 GMT',
  instructor: 'Dr. Julian Croft (Partner & Head of Applied R&D)',
  description: 'Direct interactive session with Dr. Julian Croft. Live model troubleshooting and portfolio review.',
  seatsRemaining: 42,
  isFreeForPro: true,
  isReserved: false,
}

export function useTraining() {
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES)
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterFreeForPro, setFilterFreeForPro] = useState<boolean>(false)
  const [filterBuildingSmart, setFilterBuildingSmart] = useState<boolean>(false)
  const [filterUnder10h, setFilterUnder10h] = useState<boolean>(false)
  const [filterWithSandbox, setFilterWithSandbox] = useState<boolean>(false)

  // Learning path state
  const [pathSteps] = useState<LearningPathStep[]>(LEARNING_PATH_STEPS)
  const [workshop, setWorkshop] = useState<WorkshopSession>(INITIAL_WORKSHOP)

  // Modals state
  const [selectedCourseForPreview, setSelectedCourseForPreview] = useState<CourseItem | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false)
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState<boolean>(false)
  const [creditCodeInput, setCreditCodeInput] = useState<string>('')

  // Terminal state for sandbox
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'TERMINAL // POD-ALPHA-04 [INITIALIZED]',
    'LATENCY: 14ms • NVIDIA RTX 4090 CLOUD GPU ACTIVE',
    '$ import pyrevit.forms as forms',
    '$ speckle_client.authenticate_session(AUTH_TOKEN)',
    '>> Geometry stream linked: IFC4x3_AIRPORT_TERMINAL_B.ifc',
  ])

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Category filter
      if (activeCategory === 'recommended' && (!c.matchScore || c.matchScore < 90)) return false
      if (activeCategory === 'computational' && c.category !== 'computational') return false
      if (activeCategory === 'bim-iso' && c.category !== 'bim-iso') return false
      if (activeCategory === 'vdc-synchro' && c.category !== 'vdc-synchro') return false
      if (activeCategory === 'revit-python' && c.category !== 'computational') return false

      // Quick filter chips
      if (filterFreeForPro && !c.isFreeForPro) return false
      if (filterBuildingSmart && !c.isBuildingSmartCertified) return false
      if (filterUnder10h && c.totalHours >= 10) return false
      if (filterWithSandbox && !c.hasSandbox) return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = c.title.toLowerCase().includes(q)
        const matchProvider = c.provider.toLowerCase().includes(q)
        const matchStack = c.stacks.some((s) => s.toLowerCase().includes(q))
        const matchDesc = c.description?.toLowerCase().includes(q)
        const matchInstructor = c.instructor?.name.toLowerCase().includes(q)
        if (!matchTitle && !matchProvider && !matchStack && !matchDesc && !matchInstructor) {
          return false
        }
      }

      return true
    })
  }, [
    courses,
    activeCategory,
    filterFreeForPro,
    filterBuildingSmart,
    filterUnder10h,
    filterWithSandbox,
    searchQuery,
  ])

  // Handlers
  const handleEnrollCourse = useCallback(
    (id: string) => {
      setCourses((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              isEnrolled: true,
              progressPercent: c.progressPercent ?? 0,
            }
          }
          return c
        })
      )
      showToast('Successfully enrolled! Course workspace & syllabus added to dashboard.')
    },
    [showToast]
  )

  const handleOpenPreview = useCallback((course: CourseItem) => {
    setSelectedCourseForPreview(course)
    setIsPreviewModalOpen(true)
  }, [])

  const handleReserveWorkshopSeat = useCallback(() => {
    if (workshop.isReserved) {
      showToast('Seat already reserved for Live Workshop on Nov 14.')
      return
    }
    setWorkshop((prev) => ({
      ...prev,
      seatsRemaining: Math.max(0, prev.seatsRemaining - 1),
      isReserved: true,
    }))
    showToast('Seat reserved for Algorithmic Façade Rationalization AMA! Added to calendar.')
  }, [workshop.isReserved, showToast])

  const handleLaunchSandbox = useCallback(() => {
    setIsSandboxModalOpen(true)
    setTerminalLines((prev) => [
      ...prev,
      `>> [${new Date().toLocaleTimeString()}] Spawning cloud WebGL viewport for user Alex Morgan...`,
      '>> WebGL 2.0 Shader pipeline loaded. Ready for real-time Revit/Grasshopper streaming.',
    ])
    showToast('Sandbox modeling environment active on RTX 4090 Cloud Pod.')
  }, [showToast])

  const handleRedeemCredit = useCallback(() => {
    if (!creditCodeInput.trim()) {
      showToast('Please enter a valid voucher or enterprise training code.')
      return
    }
    setIsCreditModalOpen(false)
    setCreditCodeInput('')
    showToast(`Redeemed credit voucher "${creditCodeInput.toUpperCase()}": 150 CR added!`)
  }, [creditCodeInput, showToast])

  const handleAddPath = useCallback((courseTitle: string) => {
    showToast(`Added "${courseTitle}" to your active BIM Director learning path.`)
  }, [showToast])

  return {
    courses,
    filteredCourses,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    filterFreeForPro,
    setFilterFreeForPro,
    filterBuildingSmart,
    setFilterBuildingSmart,
    filterUnder10h,
    setFilterUnder10h,
    filterWithSandbox,
    setFilterWithSandbox,
    pathSteps,
    workshop,
    selectedCourseForPreview,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isCreditModalOpen,
    setIsCreditModalOpen,
    isSandboxModalOpen,
    setIsSandboxModalOpen,
    creditCodeInput,
    setCreditCodeInput,
    terminalLines,
    toastMessage,
    showToast,
    handleEnrollCourse,
    handleOpenPreview,
    handleReserveWorkshopSeat,
    handleLaunchSandbox,
    handleRedeemCredit,
    handleAddPath,
  }
}
