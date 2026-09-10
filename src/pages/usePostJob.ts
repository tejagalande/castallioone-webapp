import { useState, useMemo, useCallback } from 'react'

export interface ToolItem {
  id: string
  code: string
  name: string
  description: string
  level: string
  isMandatory: boolean
}

export interface CandidatePreview {
  id: string
  initials: string
  name: string
  skills: string
  fitScore: number
}

export interface PostJobFormData {
  title: string
  department: string
  workplaceModel: 'On-site' | 'Hybrid' | 'Remote'
  location: string
  employmentFramework: string
  bimLevels: string[]
  governanceProtocols: string[]
  sectors: string[]
  tools: ToolItem[]
  attachSandbox: boolean
  description: string
  currency: string
  minSalary: string
  maxSalary: string
  syndicateRiba: boolean
  vipHeadhunterPing: boolean
  stealthMode: boolean
}

const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 't-rvt',
    code: 'Rvt',
    name: 'Revit API & pyRevit Workflows',
    description: 'Custom C#/IronPython panelization ribbons & parameter pushes',
    level: 'Expert / Prod',
    isMandatory: true,
  },
  {
    id: 't-gh',
    code: 'GH',
    name: 'Rhino 8 + Grasshopper',
    description: 'Kangaroo Physics, Karamba FEA, Parametric clustering',
    level: 'Advanced',
    isMandatory: true,
  },
  {
    id: 't-spk',
    code: 'Spk',
    name: 'Speckle Systems / openBIM Streams',
    description: 'Cloud geometry diffing & multi-CAD data federation',
    level: 'Intermediate',
    isMandatory: false,
  },
  {
    id: 't-sol',
    code: 'Sol',
    name: 'Solibri & Navisworks Model Checker',
    description: 'Automated rule sets, BCF issue round-tripping',
    level: 'Advanced',
    isMandatory: true,
  },
]

const CANDIDATE_MATCHES: CandidatePreview[] = [
  { id: 'c-1', initials: 'AM', name: 'Alex Morgan', skills: 'pyRevit • Dynamo • IFC4', fitScore: 98 },
  { id: 'c-2', initials: 'DK', name: 'David Kim', skills: 'Rhino/GH • Karamba • C#', fitScore: 94 },
  { id: 'c-3', initials: 'EV', name: 'Elena V.', skills: 'ISO 19650 • Speckle • BEP', fitScore: 91 },
]

export function usePostJob(onSuccess?: () => void) {
  const [currentStep, setCurrentStep] = useState<number>(2)

  // Section 1: Overview
  const [title, setTitle] = useState<string>('Lead Computational Façade Designer')
  const [department, setDepartment] = useState<string>('Applied Research & Development (CODE / Applied R&D)')
  const [workplaceModel, setWorkplaceModel] = useState<'On-site' | 'Hybrid' | 'Remote'>('Hybrid')
  const [location, setLocation] = useState<string>('London Riverside Studio / Battersea & Canary Wharf')
  const [employmentFramework, setEmploymentFramework] = useState<string>('Full-time Permanent (Studio Staff)')

  // Section 2: BIM & Standards
  const [bimLevels, setBimLevels] = useState<string[]>([
    'BIM Level 2 (ISO 19650)',
    'openBIM / IFC 4x3 Core',
    'LOD 400 Fabrication Ready',
  ])
  const [governanceProtocols, setGovernanceProtocols] = useState<string[]>([
    'ISO 19650-2 CDE Protocols',
    'EIR & BEP Authoring Expertise',
    'COBie Drop Standards (UK Annex)',
    'Automated Clash Tolerances (< 5mm)',
  ])
  const [sectors, setSectors] = useState<string[]>([
    'Complex Parametric Envelopes',
    'Super-Tall Commercial',
    'Aviation & Master Terminals',
  ])
  const [newSectorInput, setNewSectorInput] = useState<string>('')
  const [isAddingSector, setIsAddingSector] = useState<boolean>(false)

  // Section 3: Toolchain
  const [tools, setTools] = useState<ToolItem[]>(DEFAULT_TOOLS)
  const [attachSandbox, setAttachSandbox] = useState<boolean>(true)

  // Section 4: Scope
  const [descViewMode, setDescViewMode] = useState<'markdown' | 'bep' | 'preview'>('markdown')
  const [description, setDescription] = useState<string>(
    `Foster + Partners Applied R&D studio is seeking a Lead Computational Façade Specialist to spearhead automated panelization workflows for flagship international projects. Applicant must demonstrate verified pyRevit scripting, Grasshopper algorithmic design, and automated clash clearance under ISO 19650-2 protocols.

Key Responsibilities:
- Author and maintain parametric computational pipelines transferring complex NURBS façade envelopes into fabrication-ready LOD 400 BIM assemblies.
- Develop custom Revit/Rhino plugins via C# / IronPython to automate IFC 4x3 export schedules.
- Coordinate directly with structural and building services teams within the Common Data Environment (CDE).`
  )

  // Section 5: Compensation
  const [currency, setCurrency] = useState<string>('GBP (£) - United Kingdom')
  const [minSalary, setMinSalary] = useState<string>('£125,000')
  const [maxSalary, setMaxSalary] = useState<string>('£155,000')

  // Right Column: Syndication
  const [syndicateRiba, setSyndicateRiba] = useState<boolean>(true)
  const [vipHeadhunterPing, setVipHeadhunterPing] = useState<boolean>(true)
  const [stealthMode, setStealthMode] = useState<boolean>(false)

  // Modals
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false)
  const [isPublishSuccessModalOpen, setIsPublishSuccessModalOpen] = useState<boolean>(false)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Dynamic Requisition Health Score Calculation
  const healthScore = useMemo(() => {
    let score = 20
    if (minSalary && maxSalary) score += 15
    if (governanceProtocols.length >= 2) score += 20
    if (tools.length >= 3) score += 25
    if (attachSandbox) score += 16
    return Math.min(100, score)
  }, [minSalary, maxSalary, governanceProtocols, tools, attachSandbox])

  // Handlers
  const handleToggleBimLevel = useCallback((level: string) => {
    setBimLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    )
  }, [])

  const handleToggleProtocol = useCallback((protocol: string) => {
    setGovernanceProtocols((prev) =>
      prev.includes(protocol) ? prev.filter((p) => p !== protocol) : [...prev, protocol]
    )
  }, [])

  const handleAddSector = useCallback(() => {
    if (newSectorInput.trim()) {
      setSectors((prev) => [...prev, newSectorInput.trim()])
      setNewSectorInput('')
      setIsAddingSector(false)
      showToast(`Added sector: ${newSectorInput.trim()}`)
    }
  }, [newSectorInput, showToast])

  const handleRemoveSector = useCallback((sectorName: string) => {
    setSectors((prev) => prev.filter((s) => s !== sectorName))
  }, [])

  const handleToggleToolMandatory = useCallback((id: string) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isMandatory: !t.isMandatory } : t))
    )
    showToast('Toolchain requirement status updated.')
  }, [showToast])

  const handleEnhanceWithBep = useCallback(() => {
    const bepAddition = `\n\nISO 19650 BEP Milestones:
- Compliance with UK BIM Framework Information Protocol (Edition 3).
- Model Exchange in OpenBIM IFC4x3 Add2 format bi-weekly.
- Maximum allowable clash envelope: 5mm for secondary structural connections.`
    setDescription((prev) => prev + bepAddition)
    showToast('Enhanced requisition with ISO 19650 BEP specification clauses!')
  }, [showToast])

  const handleSaveDraft = useCallback(() => {
    showToast('Requisition draft saved to Foster + Partners Talent Vault.')
  }, [showToast])

  const handleSaveTemplate = useCallback(() => {
    showToast('Requisition saved as custom template "AEC Computational Lead (F+P)".')
  }, [showToast])

  const handlePublishRequisition = useCallback(() => {
    setIsPublishSuccessModalOpen(true)
    showToast('Requisition published! Pushing instant alerts to 18 verified candidates.')
    if (onSuccess) {
      setTimeout(() => {
        onSuccess()
      }, 2500)
    }
  }, [onSuccess, showToast])

  return {
    currentStep,
    setCurrentStep,
    title,
    setTitle,
    department,
    setDepartment,
    workplaceModel,
    setWorkplaceModel,
    location,
    setLocation,
    employmentFramework,
    setEmploymentFramework,
    bimLevels,
    handleToggleBimLevel,
    governanceProtocols,
    handleToggleProtocol,
    sectors,
    newSectorInput,
    setNewSectorInput,
    isAddingSector,
    setIsAddingSector,
    handleAddSector,
    handleRemoveSector,
    tools,
    handleToggleToolMandatory,
    attachSandbox,
    setAttachSandbox,
    descViewMode,
    setDescViewMode,
    description,
    setDescription,
    currency,
    setCurrency,
    minSalary,
    setMinSalary,
    maxSalary,
    setMaxSalary,
    syndicateRiba,
    setSyndicateRiba,
    vipHeadhunterPing,
    setVipHeadhunterPing,
    stealthMode,
    setStealthMode,
    candidateMatches: CANDIDATE_MATCHES,
    healthScore,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isPublishSuccessModalOpen,
    setIsPublishSuccessModalOpen,
    toastMessage,
    showToast,
    handleEnhanceWithBep,
    handleSaveDraft,
    handleSaveTemplate,
    handlePublishRequisition,
  }
}
