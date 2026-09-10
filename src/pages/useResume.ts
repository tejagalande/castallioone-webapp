import { useState, useCallback } from 'react'

export interface ResumeVersion {
  id: string
  versionCode: string
  title: string
  targetFirms: string
  summary: string
  tags: string[]
  downloadsCount: number
  sharedCount: number
  atsScore: number
  lastModified: string
  isPrimary?: boolean
  fileSize: string
  compliance: string
}

export interface VerificationSeal {
  id: string
  title: string
  code: string
  issuer: string
}

export interface ATSKeywordToken {
  name: string
  matchPercent: number
  isHighPriority?: boolean
}

export interface ActiveResumeDetail {
  docId: string
  fileName: string
  fileSize: string
  compliance: string
  hash: string
  lastUpdated: string
  lodStandard: string
  executiveSummary: string
  atsHealthScore: number
}

const PRIMARY_RESUME_DATA: ActiveResumeDetail = {
  docId: 'CV-2024-V4.2',
  fileName: 'Alex_Morgan_BIM_Computational_CV_2024.pdf',
  fileSize: '2.4 MB',
  compliance: 'PDF/A-1b Compliant • SHA-256 Verified',
  hash: '9f82-a8c4-be12-44df-0091',
  lastUpdated: 'Updated 3 days ago',
  lodStandard: 'LOD 400 FABRICATION',
  executiveSummary:
    'Lead Architectural BIM Coordinator and Computational Engineer with 7+ years directing Level of Development (LOD 200 through LOD 500 As-Built) federation workflows on mega-scale civic infrastructure, commercial towers, and complex timber structures. Proven mastery in authoring project-wide BIM Execution Plans (BEP) in compliance with ISO 19650-1/2, establishing common data environments (Autodesk Construction Cloud, Dalux), automating spatial clash resolutions through algorithmic Dynamo and pyRevit pipelines, and federating multi-disciplinary IFC models for zero-variance contractor handover.',
  atsHealthScore: 98,
}

export const INITIAL_VARIANTS: ResumeVersion[] = [
  {
    id: 'v-1',
    versionCode: 'V2.1',
    title: 'Computational Façade & Parametric Specialist',
    targetFirms: 'Foster + Partners, Zaha Hadid Architects, BIG',
    summary:
      'Emphasizes algorithmic facade panelling, FEA stress modeling, Rhino.Inside, Python logic, and advanced solar insolation geometry.',
    tags: ['Grasshopper', 'Rhino.Inside', 'Python API'],
    downloadsCount: 48,
    sharedCount: 3,
    atsScore: 96,
    lastModified: 'Modified 5d ago',
    fileSize: '2.1 MB',
    compliance: 'ISO 19650-2',
  },
  {
    id: 'v-2',
    versionCode: 'V3.0',
    title: 'Infrastructure & Rail CDE / BEP Manager',
    targetFirms: 'Arup, AECOM, WSP, Mott MacDonald',
    summary:
      'Emphasizes ISO 19650-2 CDE governance, Civil 3D alignments, multi-million pound railway stations, and IFC openBIM standard compliance.',
    tags: ['Civil 3D', 'IFC4 openBIM', 'ACC CDE'],
    downloadsCount: 32,
    sharedCount: 2,
    atsScore: 94,
    lastModified: 'Modified 2w ago',
    fileSize: '2.5 MB',
    compliance: 'ISO 19650-1/2',
  },
  {
    id: 'v-3',
    versionCode: 'V1.8',
    title: 'Senior VDC & Site Clash Detection Lead',
    targetFirms: 'General Contractors (Balfour Beatty, Skanska, Mace, Multiplex)',
    summary:
      'Highlights constructability analysis, Synchro 4D time simulation, on-site laser scanning, and sub-trade MEP spatial coordination.',
    tags: ['Navisworks', 'Synchro 4D', 'Laser Point Cloud'],
    downloadsCount: 19,
    sharedCount: 1,
    atsScore: 91,
    lastModified: 'Modified 1mo ago',
    fileSize: '1.9 MB',
    compliance: 'COBie Certified',
  },
]

export const ATS_TOKENS: ATSKeywordToken[] = [
  { name: 'Revit LOD-400', matchPercent: 100, isHighPriority: true },
  { name: 'ISO 19650-2 BEP', matchPercent: 100, isHighPriority: true },
  { name: 'Grasshopper Parametric', matchPercent: 96 },
  { name: 'Clash Detection Navisworks', matchPercent: 95 },
  { name: 'openBIM / IFC', matchPercent: 92 },
  { name: 'Python Automation', matchPercent: 88 },
]

export const VERIFICATION_SEALS: VerificationSeal[] = [
  { id: 'seal-1', title: 'BRE Academy ISO 19650', code: '#BRE-9482-UK', issuer: 'BRE Group' },
  { id: 'seal-2', title: 'Autodesk Certified Pro 2024', code: '#AC-88319-REV', issuer: 'Autodesk' },
  { id: 'seal-3', title: 'buildingSMART International', code: '#bSI-901-OP', issuer: 'buildingSMART' },
]

export function useResumeManagement() {
  const [activeResume] = useState<ActiveResumeDetail>(PRIMARY_RESUME_DATA)
  const [variants, setVariants] = useState<ResumeVersion[]>(INITIAL_VARIANTS)
  const [selectedTargetJob, setSelectedTargetJob] = useState<string>(
    'Lead Computational Designer • Foster + Partners (Saved)'
  )
  const [oneClickDownload, setOneClickDownload] = useState<boolean>(true)
  const [hideContactInfo, setHideContactInfo] = useState<boolean>(false)
  const [digitalWatermark, setDigitalWatermark] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters' | 'bep-samples' | 'certs'>('resumes')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal / Preview state
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false)
  const [isTailorModalOpen, setIsTailorModalOpen] = useState<boolean>(false)
  const [previewVariant, setPreviewVariant] = useState<ResumeVersion | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const handleDownloadPDF = useCallback(
    (fileName: string) => {
      const resumeContent = `CASTALLIO ONE // VERIFIED AEC RESUME EXPORT
=====================================================
CANDIDATE: Alex Morgan, M.Sc., AIA Assoc., CanBIM Prof.
ROLE: Senior BIM Coordinator & Computational VDC Specialist
FILE: ${fileName}
LOD LEVEL: LOD 400 Fabrication
SECURITY: UK/EU Level II
HASH: 9f82-a8c4-be12-44df-0091
TIMESTAMP: ${new Date().toISOString()}

EXECUTIVE SUMMARY:
${activeResume.executiveSummary}

CORE TECHNICAL STACK:
- Autodesk Revit 2024 (LOD 400, Dynamo Automation) - 98%
- Navisworks Manage (Clash Detective, 4D Phasing) - 95%
- Solibri Model Checker (Ruleset, COBie QA) - 92%
- Rhino + Grasshopper (Parametric Geometry) - 94%
- Python / pyRevit (Custom Automation Scripts) - 88%
- Autodesk Construction Cloud / ACC (CDE Lead) - 96%
- Synchro 4D (Construction Logistics Simulation) - 85%

PROJECT PORTFOLIO EXCERPT:
1. The Scalpel Commercial Tower (£180M) - LOD 400 MEP/Arch Coordination
2. Rail Interchange Transit Hub (£420M) - ISO 19650 BEP & Multi-Disciplinary CDE
3. CLT Innovation Pavilion (£14M) - Grasshopper to CNC Milling Tooling

VERIFIED ACCREDITATIONS:
- BRE Academy ISO 19650 Information Management (#BRE-9482-UK)
- Autodesk Certified Professional Revit 2024 (#AC-88319-REV)
- CanBIM Professional Level 3 (Canada BIM Council)
- buildingSMART openBIM Foundation Practitioner
`
      const blob = new Blob([resumeContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace('.pdf', '.txt')
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast(`Downloaded verified document: ${fileName}`)
    },
    [activeResume.executiveSummary, showToast]
  )

  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://castallio.one/cv/alex-morgan-bim')
    }
    showToast('Personalized recruiter CV link copied!')
  }, [showToast])

  const handleExportZip = useCallback(() => {
    showToast('Compiling complete BIM Portfolio & CV package (.ZIP)...')
    setTimeout(() => {
      showToast('BIM_AlexMorgan_Complete_Package_2024.zip ready and downloaded.')
    }, 1200)
  }, [showToast])

  const handleExportJsonResume = useCallback(() => {
    const jsonResume = {
      $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
      basics: {
        name: 'Alex Morgan',
        label: 'Senior BIM Coordinator & Computational VDC Specialist',
        email: 'alex.morgan@castallio.one',
        phone: '+44 20 7946 0912',
        url: 'https://castallio.one/talent/alex-morgan-bim',
        summary: activeResume.executiveSummary,
        location: {
          city: 'London',
          countryCode: 'GB',
          region: 'Greater London',
        },
      },
      skills: [
        { name: 'Autodesk Revit 2024', level: 'Master', keywords: ['LOD 400', 'Parametric'] },
        { name: 'Navisworks Manage', level: 'Expert', keywords: ['Clash Detection', 'Timeliner'] },
        { name: 'Grasshopper & Rhino', level: 'Master', keywords: ['Rhino.Inside', 'Parametric'] },
        { name: 'ISO 19650-2', level: 'Master', keywords: ['BEP', 'CDE Governance'] },
      ],
      education: [
        {
          institution: 'University College London (The Bartlett)',
          area: 'Architectural Computation',
          studyType: 'Master of Science (Distinction)',
          startDate: '2016-09-01',
          endDate: '2017-09-01',
        },
      ],
    }
    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Alex_Morgan_BIM_Resume.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Exported standard JSON-Resume schema.')
  }, [activeResume.executiveSummary, showToast])

  const handleCreateVariant = useCallback(() => {
    const newVariant: ResumeVersion = {
      id: `v-${Date.now()}`,
      versionCode: `V${(variants.length + 1).toFixed(1)}`,
      title: 'Digital Twin & Smart Asset VDC Manager',
      targetFirms: 'Engineering Consultancies (WSP, Jacobs, Buro Happold)',
      summary:
        'Focused on asset lifecycle COBie handover, digital twin telemetry sensor mapping, and openBIM IFC4.3 infrastructure.',
      tags: ['IFC4.3', 'COBie', 'IoT Twin'],
      downloadsCount: 0,
      sharedCount: 0,
      atsScore: 97,
      lastModified: 'Created just now',
      fileSize: '2.3 MB',
      compliance: 'ISO 19650-3',
    }
    setVariants((prev) => [newVariant, ...prev])
    showToast('New customized CV variant generated!')
  }, [variants.length, showToast])

  const handleAutoGenerateTailoredDraft = useCallback(() => {
    showToast(`AI Tailor: Optimized CV for ${selectedTargetJob.split('•')[0].trim()} with 98% LOD fit score!`)
  }, [selectedTargetJob, showToast])

  return {
    activeResume,
    variants,
    selectedTargetJob,
    setSelectedTargetJob,
    oneClickDownload,
    setOneClickDownload,
    hideContactInfo,
    setHideContactInfo,
    digitalWatermark,
    setDigitalWatermark,
    activeTab,
    setActiveTab,
    isFullscreenPreview,
    setIsFullscreenPreview,
    isTailorModalOpen,
    setIsTailorModalOpen,
    previewVariant,
    setPreviewVariant,
    handleDownloadPDF,
    handleCopyLink,
    handleExportZip,
    handleExportJsonResume,
    handleCreateVariant,
    handleAutoGenerateTailoredDraft,
    toastMessage,
    showToast,
  }
}
