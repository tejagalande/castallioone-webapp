import { useState, useMemo, useCallback } from 'react'

export interface CourseModule {
  id: string
  title: string
  duration: string
  description?: string
  isCompleted?: boolean
}

export type CourseCategory =
  | 'all'
  | 'bim-iso'
  | 'computational'
  | 'vdc-coordination'
  | 'automation-api'

export type CourseLevel = 'All' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive'

export interface CourseItem {
  id: string
  title: string
  provider: string
  category: CourseCategory
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive'
  instructor: {
    name: string
    title: string
    initials: string
    organization?: string
  }
  stacks: string[]
  totalHours: number
  modulesCount: number
  rating: number
  reviewsCount: number
  certificateTitle: string
  description: string
  profileBoostImpact: string
  isFlagship?: boolean
  isEnrolled?: boolean
  progressPercent?: number
  accreditation?: string
  syllabus: CourseModule[]
}

export interface LearningPathStep {
  id: number
  title: string
  status: 'done' | 'in-progress' | 'locked' | 'capstone'
  progressPercent?: number
  subtext: string
  note: string
}

export interface LiveWorkshopSession {
  id: string
  title: string
  dateText: string
  timeText: string
  instructor: string
  instructorRole: string
  description: string
  seatsRemaining: number
  platform: string
  isReserved?: boolean
}

const LOCAL_STORAGE_COURSES_KEY = 'castallio_training_courses'
const LOCAL_STORAGE_WORKSHOP_KEY = 'castallio_training_workshop'

// Official Curated Courses Offered by Castallio (the training & certification academy)
const OFFICIAL_CASTALLIO_COURSES: CourseItem[] = [
  {
    id: 'crs-flagship-bim',
    title: 'Castallio Executive BIM Management & ISO 19650-2 Masterclass',
    provider: 'Castallio Academy',
    category: 'bim-iso',
    level: 'Executive',
    isFlagship: true,
    isEnrolled: false,
    instructor: {
      name: 'Ar. Marcus Vance',
      title: 'Global Head of BIM Practice & Castallio Fellow',
      initials: 'MV',
      organization: 'ex-Foster + Partners / Castallio Advisory',
    },
    stacks: ['ISO 19650-2', 'EIR & BEP Strategy', 'CDE Federation', 'COBie Auditing', 'OpenBIM IFC4'],
    totalHours: 18,
    modulesCount: 8,
    rating: 4.98,
    reviewsCount: 640,
    accreditation: 'buildingSMART & UK BIM Framework Aligned',
    certificateTitle: 'Castallio Certified ISO 19650 BIM Manager',
    profileBoostImpact: 'Boosts candidate search ranking by +35% for Senior BIM Coordinator and BIM Manager vacancies on Castallio One.',
    description:
      'The definitive professional program for AEC project leads. Master the practical setup of Common Data Environments (CDE), decomposition of Exchange Information Requirements (EIR), multi-discipline BEP compilation, and automated COBie schema validation across international commercial and healthcare infrastructure.',
    syllabus: [
      { id: 'm1', title: 'ISO 19650 Information Governance Framework & Delivery Cycles', duration: '2h 15m' },
      { id: 'm2', title: 'Authoring Pre-Award and Post-Award BIM Execution Plans (BEP)', duration: '2h 45m' },
      { id: 'm3', title: 'Common Data Environment (CDE) Workflow States & Metadata Structures', duration: '2h 30m' },
      { id: 'm4', title: 'Automated COBie Table Generation & Information Delivery Verification', duration: '2h 10m' },
      { id: 'm5', title: 'Federation Strategies across Architecture, Structure & MEP Systems', duration: '2h 50m' },
      { id: 'm6', title: 'Model View Definition (MVD) & IFC 4x3 Mapping Conventions', duration: '2h 00m' },
      { id: 'm7', title: 'Project Information Protocol Auditing & Legal Risk Mitigation', duration: '1h 50m' },
      { id: 'm8', title: 'Capstone: Airport Terminal Expansion Project Information Model Defense', duration: '1h 40m' },
    ],
  },
  {
    id: 'crs-computational-grasshopper',
    title: 'Computational BIM & Algorithmic Geometry with Grasshopper and Rhino.Inside',
    provider: 'Castallio Engineering Labs',
    category: 'computational',
    level: 'Advanced',
    isEnrolled: false,
    instructor: {
      name: 'Elena Rostova',
      title: 'Principal Computational Architect & Instructor',
      initials: 'ER',
      organization: 'Castallio Computational Studio',
    },
    stacks: ['Rhino 8', 'Grasshopper', 'Rhino.Inside Revit', 'Kangaroo 2', 'NURBS Rationalization'],
    totalHours: 16,
    modulesCount: 6,
    rating: 4.94,
    reviewsCount: 420,
    accreditation: 'Autodesk Authorized AEC Developer Network',
    certificateTitle: 'Castallio Certified Computational BIM Specialist',
    profileBoostImpact: 'High-priority skill tag requested by Tier-1 design practices including Zaha Hadid, Foster, and Gensler.',
    description:
      'Learn parametric panel rationalization, complex double-curved envelope fabrication, and seamless bidirectional data piping between Grasshopper and Autodesk Revit 2025 using headless Rhino.Inside workflows.',
    syllabus: [
      { id: 'cg-1', title: 'Mathematical Foundation of NURBS Curves & Surface Curvature', duration: '2h 30m' },
      { id: 'cg-2', title: 'Dynamic Form-Finding with Kangaroo 2 & Structural Relaxation', duration: '2h 45m' },
      { id: 'cg-3', title: 'GFRC & Metal Facade Panel Flattening & Fabrication Scheduling', duration: '2h 30m' },
      { id: 'cg-4', title: 'Rhino.Inside Revit Live Pipeline: Instantiating Native Revit Elements', duration: '3h 00m' },
      { id: 'cg-5', title: 'Clash Avoidance and Parameter Linking across Computational Blueprints', duration: '2h 45m' },
      { id: 'cg-6', title: 'Capstone Defense: High-Rise Canopy Optimization and Parameter Export', duration: '2h 30m' },
    ],
  },
  {
    id: 'crs-revit-python',
    title: 'Revit Plugin Development with pyRevit & Python for BIM Automation',
    provider: 'Castallio Academy',
    category: 'automation-api',
    level: 'Intermediate',
    isEnrolled: true,
    progressPercent: 65,
    instructor: {
      name: 'Devon Chen',
      title: 'Lead AEC Software Architect',
      initials: 'DC',
      organization: 'Castallio Automation Practice',
    },
    stacks: ['pyRevit', 'Python 3.10', 'Revit API', 'Custom UI Ribbons', 'WPF / XAML'],
    totalHours: 12,
    modulesCount: 5,
    rating: 4.89,
    reviewsCount: 385,
    certificateTitle: 'Castallio Certified AEC Automation Developer',
    profileBoostImpact: 'Accelerates talent matching by +28% for Digital Delivery Lead and Computational Specialist roles.',
    description:
      'Transition from visual Dynamo scripts into modular, production-ready Python plugins. Build firmwide custom ribbon interfaces, automate batch sheet generation, audit model parameter compliance, and export custom Excel/JSON deliverables.',
    syllabus: [
      { id: 'rp-1', title: 'Revit Database Architecture: Elements, Parameters & Filtered Collectors', duration: '2h 30m', isCompleted: true },
      { id: 'rp-2', title: 'pyRevit Environment Setup, Bundle Hierarchy & Extension Deployment', duration: '2h 15m', isCompleted: true },
      { id: 'rp-3', title: 'Developing Custom WPF/XAML Windows for Interactive User Input', duration: '2h 45m', isCompleted: true },
      { id: 'rp-4', title: 'Batch View Sheet Creation & Automated Titleblock Annotation', duration: '2h 30m', isCompleted: false },
      { id: 'rp-5', title: 'Packaging, Distributing & Version Controlling Plugins with Git', duration: '2h 00m', isCompleted: false },
    ],
  },
  {
    id: 'crs-vdc-synchro',
    title: '4D/5D VDC Construction Scheduling & Logistics in Synchro 4D and Navisworks',
    provider: 'Castallio Academy',
    category: 'vdc-coordination',
    level: 'Advanced',
    isEnrolled: false,
    instructor: {
      name: 'Sarah Jenkins',
      title: 'Director of Virtual Design & Construction',
      initials: 'SJ',
      organization: 'Castallio VDC Institute',
    },
    stacks: ['Synchro 4D Pro', 'Navisworks Manage', 'Primavera P6', 'Heavy Civil Phasing', 'LOD 400'],
    totalHours: 15,
    modulesCount: 6,
    rating: 4.86,
    reviewsCount: 310,
    certificateTitle: 'Castallio Certified 4D Construction Logistics Specialist',
    profileBoostImpact: 'Required credential for Tier-1 Contractor EPC projects and mega infrastructure bids on Castallio One.',
    description:
      'Bridging design models into physical construction sequence simulation. Master linking Primavera P6 schedule baselines, simulating tower crane clearances, visualizing site logistics zones, and resolving temporal spatial conflicts before groundbreaking.',
    syllabus: [
      { id: 'vs-1', title: 'Spatial Grid Federation & Schedule Parameter Mapping', duration: '2h 15m' },
      { id: 'vs-2', title: 'Primavera P6 Logic Tree Linking & Task Generation', duration: '2h 30m' },
      { id: 'vs-3', title: 'Crane Radius Analysis & Temporary Work Zone Safety Verification', duration: '2h 45m' },
      { id: 'vs-4', title: 'Dynamic 4D Clash Detection over Construction Timeline Milestones', duration: '2h 30m' },
      { id: 'vs-5', title: 'Earned Value Cost Tracking (5D) Associated to Model Quantities', duration: '2h 30m' },
      { id: 'vs-6', title: 'High-Fidelity 4D Animation Rendering for Client Stakeholder Reviews', duration: '2h 30m' },
    ],
  },
  {
    id: 'crs-openbim-ifc',
    title: 'OpenBIM Standards, IFC 4x3 Schema Architecture & BCF Coordination',
    provider: 'Castallio Academy',
    category: 'bim-iso',
    level: 'Intermediate',
    isEnrolled: false,
    instructor: {
      name: 'Dr. Julian Croft',
      title: 'Partner & Head of Applied R&D',
      initials: 'JC',
      organization: 'Castallio Academic Council',
    },
    stacks: ['OpenBIM', 'IFC 4x3', 'Solibri Model Checker', 'BCF 2.1', 'Speckle Streams'],
    totalHours: 10,
    modulesCount: 4,
    rating: 4.95,
    reviewsCount: 275,
    accreditation: 'buildingSMART International Certified Training Program',
    certificateTitle: 'Castallio Certified OpenBIM Professional',
    profileBoostImpact: 'Crucial for candidates pursuing UK, European, and Middle East rail and transit developments.',
    description:
      'Learn vendor-neutral interoperability through buildingSMART OpenBIM standards. Understand the modern IFC 4x3 spatial hierarchy for infrastructure, execute rule-based quality auditing in Solibri, and exchange cloud issue records with BCF.',
    syllabus: [
      { id: 'ob-1', title: 'Evolution of OpenBIM: Industry Foundation Classes (IFC) 2x3 to 4x3', duration: '2h 30m' },
      { id: 'ob-2', title: 'Creating Solibri Rule Sets for Spatial Integrity & Egress Compliance', duration: '2h 30m' },
      { id: 'ob-3', title: 'BCF 2.1 Cloud Integration with Revizto and BIM Track', duration: '2h 30m' },
      { id: 'ob-4', title: 'Speckle Data Connectors for Real-Time Heterogeneous Model Aggregation', duration: '2h 30m' },
    ],
  },
  {
    id: 'crs-structural-tekla',
    title: 'Advanced Structural Modeling, Tekla Structures & Automated LOD-400 Detailing',
    provider: 'Castallio Engineering Labs',
    category: 'vdc-coordination',
    level: 'Intermediate',
    isEnrolled: false,
    instructor: {
      name: 'Vikram Kulkarni',
      title: 'Chief Structural Modeling Specialist',
      initials: 'VK',
      organization: 'Castallio Structural Center',
    },
    stacks: ['Tekla Structures', 'Revit Structure', 'LOD 400 Steel', 'Bar Bending Schedules (BBS)', 'CNC DSTV'],
    totalHours: 14,
    modulesCount: 5,
    rating: 4.88,
    reviewsCount: 290,
    certificateTitle: 'Castallio Certified Structural Modeling Specialist',
    profileBoostImpact: 'Boosts candidate placement rate for Structural Engineering & Detailing consultancies on Castallio One.',
    description:
      'Produce fabrication-accurate structural steel connections, automated rebar placement, bar bending schedules, and direct CNC DSTV exports for precast and steel processing plants.',
    syllabus: [
      { id: 'st-1', title: 'Tekla Model Hierarchy, Profiles & Parametric Connection Components', duration: '2h 45m' },
      { id: 'st-2', title: '3D Rebar Detailing: Shape Codes, Couplers & Pour Management', duration: '2h 45m' },
      { id: 'st-3', title: 'Generating Automated Shop Drawings & Assembly Part Lists', duration: '2h 30m' },
      { id: 'st-4', title: 'Revit to Tekla Bidirectional Round-Trip Coordination', duration: '2h 45m' },
      { id: 'st-5', title: 'Exporting CNC Files and Quality Checking for Workshop Fabrication', duration: '3h 15m' },
    ],
  },
]

const DEFAULT_PATH_STEPS: LearningPathStep[] = [
  {
    id: 1,
    title: 'ISO 19650 Information Management',
    status: 'done',
    progressPercent: 100,
    subtext: 'Completed',
    note: 'Verified Castallio Certificate added to your profile',
  },
  {
    id: 2,
    title: 'Revit API & Python Automation',
    status: 'in-progress',
    progressPercent: 65,
    subtext: 'In Progress (65%)',
    note: 'Current Module: Batch View & Sheet Creation',
  },
  {
    id: 3,
    title: 'Computational BIM & Rhino.Inside',
    status: 'locked',
    subtext: 'Next Up',
    note: 'Recommended for Senior Coordinator roles',
  },
  {
    id: 4,
    title: '4D VDC Simulation & Executive Defense',
    status: 'capstone',
    subtext: 'Capstone',
    note: 'Portfolio capstone verified by studio recruiters',
  },
]

const DEFAULT_WORKSHOP: LiveWorkshopSession = {
  id: 'ws-upcoming-façade',
  title: 'Algorithmic Façade Rationalization & Production Delivery Masterclass',
  dateText: 'Saturday, Nov 14',
  timeText: '04:30 PM – 06:30 PM IST',
  instructor: 'Dr. Julian Croft',
  instructorRole: 'Partner & Head of Applied R&D, ex-Foster + Partners',
  description:
    'Exclusive live masterclass hosted by Castallio Academy. Explore real project case studies from Foster + Partners and Grimshaw, troubleshooting live Grasshopper scripts and discussing portfolio readiness for international roles.',
  seatsRemaining: 24,
  platform: 'Live Video Session (Google Meet)',
  isReserved: false,
}

export function useTraining() {
  // Courses state with localStorage persistence
  const [courses, setCourses] = useState<CourseItem[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // fallback
    }
    return OFFICIAL_CASTALLIO_COURSES
  })

  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all')
  const [levelFilter, setLevelFilter] = useState<CourseLevel>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterEnrolledOnly, setFilterEnrolledOnly] = useState<boolean>(false)

  // Learning path & workshop
  const [pathSteps] = useState<LearningPathStep[]>(DEFAULT_PATH_STEPS)
  const [workshop, setWorkshop] = useState<LiveWorkshopSession>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_WORKSHOP_KEY)
      if (cached) return JSON.parse(cached)
    } catch {
      // fallback
    }
    return DEFAULT_WORKSHOP
  })

  // Modals state
  const [selectedCourseForPreview, setSelectedCourseForPreview] = useState<CourseItem | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)

  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<CourseItem | null>(null)
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 3800)
    return () => clearTimeout(timer)
  }, [])

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // 1. Enrolled filter
      if (filterEnrolledOnly && !c.isEnrolled) return false

      // 2. Category filter
      if (activeCategory !== 'all' && c.category !== activeCategory) return false

      // 3. Level filter
      if (levelFilter !== 'All' && c.level !== levelFilter) return false

      // 4. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim()
        const matchTitle = c.title.toLowerCase().includes(q)
        const matchInstructor = c.instructor.name.toLowerCase().includes(q)
        const matchDesc = c.description.toLowerCase().includes(q)
        const matchStacks = c.stacks.some((s) => s.toLowerCase().includes(q))
        const matchCert = c.certificateTitle.toLowerCase().includes(q)
        if (!matchTitle && !matchInstructor && !matchDesc && !matchStacks && !matchCert) {
          return false
        }
      }

      return true
    })
  }, [courses, filterEnrolledOnly, activeCategory, levelFilter, searchQuery])

  // Flagship course
  const flagshipCourse = useMemo(() => {
    return courses.find((c) => c.isFlagship) || courses[0]
  }, [courses])

  // Metrics
  const metrics = useMemo(() => {
    const enrolledCount = courses.filter((c) => c.isEnrolled).length
    const completedCount = courses.filter((c) => c.progressPercent === 100).length
    const totalHoursLearned = courses.reduce((acc, c) => {
      if (c.isEnrolled && c.progressPercent) {
        return acc + Math.round((c.totalHours * c.progressPercent) / 100)
      }
      return acc
    }, 0)

    return {
      activeTracks: enrolledCount > 0 ? enrolledCount : 1,
      completedCertifications: completedCount,
      totalHoursLearned: totalHoursLearned > 0 ? totalHoursLearned : 8,
      visibilityBoost: '+35%',
    }
  }, [courses])

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: courses.length,
      'bim-iso': courses.filter((c) => c.category === 'bim-iso').length,
      computational: courses.filter((c) => c.category === 'computational').length,
      'vdc-coordination': courses.filter((c) => c.category === 'vdc-coordination').length,
      'automation-api': courses.filter((c) => c.category === 'automation-api').length,
    }
  }, [courses])

  // Handlers
  const handleEnrollCourse = useCallback(
    (id: string) => {
      setCourses((prev) => {
        const updated = prev.map((c) => {
          if (c.id === id) {
            return {
              ...c,
              isEnrolled: true,
              progressPercent: c.progressPercent ?? 0,
            }
          }
          return c
        })
        try {
          localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(updated))
        } catch {
          // ignore
        }
        return updated
      })
      showToast('Enrolled in Castallio course! Your talent passport on Castallio One has been updated.')
    },
    [showToast]
  )

  const handleOpenPreview = useCallback((course: CourseItem) => {
    setSelectedCourseForPreview(course)
    setIsPreviewModalOpen(true)
  }, [])

  const handleOpenEnrollModal = useCallback((course: CourseItem) => {
    setSelectedCourseForEnroll(course)
    setIsEnrollModalOpen(true)
  }, [])

  const handleConfirmEnrollment = useCallback(() => {
    if (!selectedCourseForEnroll) return
    handleEnrollCourse(selectedCourseForEnroll.id)
    setIsEnrollModalOpen(false)
    setSelectedCourseForEnroll(null)
  }, [selectedCourseForEnroll, handleEnrollCourse])

  const handleReserveWorkshopSeat = useCallback(() => {
    if (workshop.isReserved) {
      showToast('You are already registered for this live Castallio masterclass!')
      return
    }
    const updated: LiveWorkshopSession = {
      ...workshop,
      seatsRemaining: Math.max(0, workshop.seatsRemaining - 1),
      isReserved: true,
    }
    setWorkshop(updated)
    try {
      localStorage.setItem(LOCAL_STORAGE_WORKSHOP_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    showToast('Seat reserved for Castallio Live Masterclass! Video meeting link will be dispatched to your notifications.')
  }, [workshop, showToast])

  const handleAddPath = useCallback(
    (courseTitle: string) => {
      showToast(`Added "${courseTitle}" to your active Castallio career specialization pathway.`)
    },
    [showToast]
  )

  return {
    courses,
    filteredCourses,
    flagshipCourse,
    activeCategory,
    setActiveCategory,
    levelFilter,
    setLevelFilter,
    searchQuery,
    setSearchQuery,
    filterEnrolledOnly,
    setFilterEnrolledOnly,
    pathSteps,
    workshop,
    selectedCourseForPreview,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    selectedCourseForEnroll,
    isEnrollModalOpen,
    setIsEnrollModalOpen,
    toastMessage,
    metrics,
    categoryCounts,
    showToast,
    handleEnrollCourse,
    handleOpenPreview,
    handleOpenEnrollModal,
    handleConfirmEnrollment,
    handleReserveWorkshopSeat,
    handleAddPath,
  }
}
