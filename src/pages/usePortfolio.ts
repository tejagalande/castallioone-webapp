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

const INITIAL_PROJECTS: ProjectAsset[] = [
  {
    id: 'proj-scalpel',
    title: 'The Scalpel Commercial Tower — Façade Automation & Clash Resolution',
    subtitle: 'London, UK • Lead MEP & Façade BIM Coordinator (Foster + Partners Collab)',
    category: 'commercial',
    categoryLabel: 'Commercial High-Rise',
    lodRating: 'LOD 400 FABRICATION',
    capitalValue: '£180M',
    role: 'Lead MEP & Façade BIM Coordinator',
    stakeholders: 'Foster + Partners, Skanska, Arup',
    description:
      'Designed, audited, and coordinated a multi-tier unitized curtain wall system spanning 38 storeys in London\'s financial district. Automated structural penetration clearances with MEP services using Grasshopper algorithms and Navisworks XML batch scripts, directly generating manufacturing fabrication schedules.',
    hardClashesResolved: 1240,
    velocityLift: '42% Velocity Lift',
    totalUnits: '3,850 Units',
    stack: [
      'Revit 2024',
      'Rhino.Inside.Revit',
      'Grasshopper Parametric',
      'Navisworks Manage',
      'Python (pyRevit)',
      'Solibri Office',
    ],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBbIZk9cz9WDzmlOC10XjRz1uX3haPj-anK5nFB6WgdfTLNRREw0mnXs4rsk4IuWdn3PkyADuK2cBN2uC1N4hNZMTnGUJvjZfevUJ16l5Z75ewGd-L35rTyVsTuYKlXqXqVu2FPPkYu1DUSx7PfECYAvlrDSr0oqEkNpT_G1nB68iDLQRim7gGu1fLdhA6Piaogi1sVfkKwjQR9272ZlmZFcFrbOX14Cuu2TygiwZUw0AS2oUhSMt8SvQ',
    imageAlt: '3D architectural digital twin rendering of the Scalpel glass skyscraper façade with visible steel mullions',
    isFeatured: true,
    auditPass: true,
    ifcCompliant: true,
  },
  {
    id: 'proj-hs2',
    title: 'High-Speed Rail Interchange Transit Hub (HS2 Interchange)',
    subtitle: 'Role: Lead Infrastructure BEP & Common Data Environment (CDE) Manager • Grimshaw Architects / HS2',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure & Rail',
    lodRating: 'LOD 500 AS-BUILT',
    capitalValue: '£420M',
    role: 'Lead Infrastructure BEP & CDE Manager',
    stakeholders: '14 Multi-Disciplinary Consultancies',
    description:
      'Authored and enforced the Project BIM Execution Plan (BEP) for a mega-scale interchange. Synchronized civil alignment data with structural viaduct components, executing 4D construction staging in Synchro and managing ISO 19650 document containers on Bentley ProjectWise.',
    stack: ['Civil 3D', 'Solibri Office', 'Bentley ProjectWise', 'openBIM IFC4', 'Synchro 4D'],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDewM6gzVjK1Y_qi22XJZhQvqPNw80UaQtsfZ4qEx61HcwnwoWMZYseG4zON2RVOwXMIxKyssutB8DIjqsPypfoQ0-mGz9zQr3VIryjpd_P_x1EF17-_pcXd_pq1cywYHuToU4SfCxx_LlSIFtFPfmBNgd-XiJ26c-CmOJ2O0papydtCyHLbY4bJCYtC5Zv5vuGFvbRSNq_TDbzc_UF8E4lp5l-Rzc122dlJtF0_4S0EU9hzJhKfprn9g',
    imageAlt: 'Modern high-speed railway terminal roof canopy with sweeping structural timber trusses and civil track alignments',
    auditPass: true,
    ifcCompliant: true,
  },
  {
    id: 'proj-clt',
    title: 'Cross-Laminated Timber (CLT) Innovation Pavilion',
    subtitle: 'Role: Computational Façade & Geometry Specialist • Foster + Partners / Bath University',
    category: 'timber',
    categoryLabel: 'Timber & Sustainable',
    lodRating: 'LOD 350 PARAMETRIC',
    capitalValue: '£14M',
    role: 'Computational Façade & Geometry Specialist',
    stakeholders: 'Bath Uni & Research Labs, Foster + Partners',
    description:
      'Developed an algorithmic CNC milling automation script in Grasshopper and Karamba3D for double-curved glulam and CLT plates. Embedded full finite element analysis (FEA) and life cycle carbon telemetry directly into Revit shared parameters.',
    carbonReduction: '-54% vs Baseline',
    stack: ['Grasshopper', 'Karamba3D', 'Kangaroo Physics', 'Python Scripting', 'Revit'],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMNMEjQac93phXqPK5bmJdFo083Y2v_jRyxTPTe7epShsoGHr90STINVsYCmmjLGZvdNVKrHeC04WwCyY3OZ54upe2kBg_aU2WtZOGVY3bQExs9aO1aE4dSBrF-QTzfdSXe1A02aDbsYgjkO765-FDdjwzk1vbs6SEV3qzKtMLOzJbltV60xS77ZuHbVuYfoTyhMcxQ1LOaJXTqO4k47JdIt21aAajEg4HmChmc8f_yYWYGU8mSNHwGw',
    imageAlt: 'Close up architectural rendering of an organic parametric freeform cross laminated timber pavilion roof structure',
    auditPass: true,
    ifcCompliant: true,
  },
  {
    id: 'proj-canary',
    title: 'Canary Wharf Multi-Modal Life Sciences Complex',
    subtitle: 'Role: Senior VDC Coordinator • Balfour Beatty Construction',
    category: 'commercial',
    categoryLabel: 'Healthcare & Labs',
    lodRating: 'LOD 400 MEP',
    capitalValue: '£220M',
    role: 'Senior VDC Coordinator',
    stakeholders: 'Balfour Beatty, BDP, Canary Wharf Group',
    description:
      'Coordinated dense, heavy-service biological containment lab piping and high-velocity HVAC runs with strict vibration dampening tolerances. Directed weekly subcontractor clash forums in Autodesk Construction Cloud (ACC).',
    stack: [
      'Synchro 4D',
      'Navisworks Manage',
      'Autodesk Construction Cloud (ACC)',
      'Revit MEP',
      'SysQue',
    ],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAkrdPPkYV9hONoFsPgthBvd52HbWl4QabnkpX3DDCH2Gv8XmiOJAYMz0qrRtXT809YFHJ3X5tv3Fe2_6J0bgReKQ8RZQctKns2anmMC7-otK807hIH2zvuG9FsYhwxvw3YrEByy2LzAbkC_r2t2Y0lRHjJCGiUgn56qQQKZZt830gUlCp8W8HTS-Hc2pbHOE2rhMPzR0o_7_ApTyZg-jnFE1j5ATzHBsSTTAwDGW6BX9HunDwk5spLzQ',
    imageAlt: 'Intricate MEP mechanical room coordination model with color-coded ductwork and pharmaceutical piping',
    auditPass: true,
    ifcCompliant: true,
  },
]

export const SCRIPT_PACKAGES: ScriptPackage[] = [
  {
    id: 'script-1',
    fileName: 'FaçadeClashMaster.py',
    stars: 48,
    description: 'pyRevit batch script resolving curtain wall bracket intersections against primary steel framing.',
    specs: '840 LOC • PYTHON 3.9',
    urlText: 'View on Castallio Vault',
  },
  {
    id: 'script-2',
    fileName: 'BEP_ParameterAuditor.dyn',
    stars: 32,
    description: 'Dynamo automated graph auditing 45,000+ IFC parameters against UK National BIM Annex naming schemas.',
    specs: '124 NODES • DYNAMO 2.19',
    urlText: 'View on GitHub',
  },
]

export const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'end-grimshaw',
    firmName: 'Grimshaw Architects',
    initial: 'G',
    badgeColor: 'primary',
    quote:
      '"Alex spearheaded the HS2 interchange CDE with flawless ISO-19650 adherence across 14 distinct engineering consultancies."',
    signer: 'Design Technology Director • Verified via SSO',
    verified: true,
  },
  {
    id: 'end-fp',
    firmName: 'Foster + Partners',
    initial: 'F',
    badgeColor: 'tertiary',
    quote:
      '"Exceptional computational geometry mastery. The automated clash scripts saved months of detailing during tender preparation."',
    signer: 'Partner / Head of Façades • Verified',
    verified: true,
  },
]

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
