import { useState, useMemo, useCallback } from 'react'

export interface ProjectAsset {
  id: string
  title: string
  subtitle: string
  category: 'parametric' | 'infrastructure' | 'commercial' | 'timber'
  categoryLabel: string
  lodRating: string
  capitalValue: string
  role: string
  stakeholders: string
  description: string
  hardClashesResolved?: number
  velocityLift?: string
  totalUnits?: string
  stack: string[]
  imageSrc: string
  imageAlt: string
  isFeatured?: boolean
  auditPass?: boolean
  ifcCompliant?: boolean
  carbonReduction?: string
}

export interface ScriptPackage {
  id: string
  fileName: string
  stars: number
  description: string
  specs: string
  urlText: string
}

export interface Endorsement {
  id: string
  firmName: string
  initial: string
  badgeColor: 'primary' | 'tertiary'
  quote: string
  signer: string
  verified: boolean
}

export interface InspectionToggles {
  sliceMeasure: boolean
  wireframeShaded: boolean
  clashHeatmaps: boolean
  watermarkDrawings: boolean
  requireNDA: boolean
}

const INITIAL_PROJECTS: ProjectAsset[] = []

export const SCRIPT_PACKAGES: ScriptPackage[] = []

export const ENDORSEMENTS: Endorsement[] = []

export function usePortfolio() {
  const [projects] = useState<ProjectAsset[]>(INITIAL_PROJECTS)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid')
  const [selectedSoftware, setSelectedSoftware] = useState<string>('All')
  const [inspectionToggles, setInspectionToggles] = useState<InspectionToggles>({
    sliceMeasure: true,
    wireframeShaded: true,
    clashHeatmaps: false,
    watermarkDrawings: true,
    requireNDA: true,
  })

  // 3D Model Inspection Modal
  const [activeViewerProject, setActiveViewerProject] = useState<ProjectAsset | null>(null)
  const [viewerMode, setViewerMode] = useState<'orbit' | 'slice' | 'wireframe' | 'clash'>('orbit')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'parametric' && proj.category !== 'parametric' && !proj.stack.some(s => s.toLowerCase().includes('grasshopper'))) {
          return false
        }
        if (activeCategory === 'infrastructure' && proj.category !== 'infrastructure') {
          return false
        }
        if (activeCategory === 'commercial' && proj.category !== 'commercial') {
          return false
        }
        if (activeCategory === 'timber' && proj.category !== 'timber') {
          return false
        }
      }

      // Software filter
      if (selectedSoftware !== 'All') {
        if (!proj.stack.some((s) => s.toLowerCase().includes(selectedSoftware.toLowerCase()))) {
          return false
        }
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = proj.title.toLowerCase().includes(q)
        const matchDesc = proj.description.toLowerCase().includes(q)
        const matchStack = proj.stack.some((s) => s.toLowerCase().includes(q))
        const matchLOD = proj.lodRating.toLowerCase().includes(q)

        if (!matchTitle && !matchDesc && !matchStack && !matchLOD) {
          return false
        }
      }

      return true
    })
  }, [projects, activeCategory, selectedSoftware, searchQuery])

  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://castallio.one/p/alex-morgan-bim')
    }
    showToast('Public portfolio link copied to clipboard!')
  }, [showToast])

  const handleExportPackage = useCallback(() => {
    showToast('Exporting complete verified BIM model package & IFC geometry (.ZIP)...')
    setTimeout(() => {
      showToast('Alex_Morgan_Verified_BIM_Models_2025.zip downloaded successfully.')
    }, 1200)
  }, [showToast])

  const handleDownloadClashMatrix = useCallback(() => {
    const csvData = `PROJECT,DISCIPLINE,HARD_CLASHES,RESOLVED,TOLERANCE,SIGN_OFF\nThe Scalpel,Façade vs MEP,1240,1240,0.00mm,VERIFIED\nHS2 Rail Hub,Track vs Tunnel,480,480,0.00mm,VERIFIED\nCLT Pavilion,Glulam Joint vs Steel,192,192,0.00mm,VERIFIED\nCanary Wharf Labs,Bio-containment HVAC,610,610,0.00mm,VERIFIED`
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Alex_Morgan_Clash_Matrix_Audit.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Downloaded verified Clash Matrix audit (.CSV).')
  }, [showToast])

  const open3DViewer = useCallback((project: ProjectAsset, mode: 'orbit' | 'slice' | 'wireframe' | 'clash' = 'orbit') => {
    setActiveViewerProject(project)
    setViewerMode(mode)
  }, [])

  const close3DViewer = useCallback(() => {
    setActiveViewerProject(null)
  }, [])

  const toggleToggle = useCallback((key: keyof InspectionToggles) => {
    setInspectionToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }, [])

  return {
    projects,
    filteredProjects,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    selectedSoftware,
    setSelectedSoftware,
    inspectionToggles,
    toggleToggle,
    activeViewerProject,
    viewerMode,
    setViewerMode,
    open3DViewer,
    close3DViewer,
    handleCopyLink,
    handleExportPackage,
    handleDownloadClashMatrix,
    toastMessage,
    showToast,
  }
}
