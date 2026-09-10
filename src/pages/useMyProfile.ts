import { useState, useCallback } from 'react'

export interface SoftwareSkill {
  id: string
  name: string
  badgeLetter: string
  badgeColor: 'primary' | 'tertiary' | 'secondary' | 'neutral'
  score: number
  description: string
  statusLabel: string
  category: 'authoring' | 'computational' | 'standards'
}

export interface PortfolioProject {
  id: string
  title: string
  collaboration: string
  badge: string
  tag: string
  description: string
  stack: string[]
  imageSrc: string
  imageAlt: string
}

export interface ExperienceMilestone {
  id: string
  role: string
  period: string
  company: string
  location: string
  description: string
  tags: string[]
  active: boolean
}

export interface CredentialItem {
  id: string
  title: string
  issuer: string
  certNumber?: string
  verified: boolean
}

export interface AttachedDocument {
  id: string
  name: string
  meta: string
  size: string
  verifiedSample?: boolean
}

export interface ProfileData {
  id: string
  talentId: string
  fullName: string
  credentialsSuffix: string
  roleTitle: string
  availabilityStatus: string
  availabilityBadge: string
  lodRating: string
  location: string
  experienceYears: string
  salaryExpectation: string
  citizenshipStatus: string
  profileStrength: number
  searchImpressions: number
  searchImpressionsGrowth: string
  firmInquiries: number
  publicProfileUrl: string
  exclusiveDirectOffers: boolean
  targetRoles: string[]
  workModels: string[]
  targetSectors: string[]
  relocationMobility: string
}

const INITIAL_PROFILE: ProfileData = {
  id: 'alex-morgan-01',
  talentId: '08492-AM',
  fullName: 'Alex Morgan',
  credentialsSuffix: 'AIA Assoc., CanBIM Prof.',
  roleTitle: 'Senior BIM Coordinator & Computational Design Specialist',
  availabilityStatus: 'Actively Looking (Available in 2 weeks)',
  availabilityBadge: 'LOD-400 MASTER',
  lodRating: 'LOD-400',
  location: 'London, UK / Hybrid & Remote',
  experienceYears: '7+ Years Industry Experience',
  salaryExpectation: '£85,000 – £95,000 / yr',
  citizenshipStatus: 'UK Citizen, US H1-B Ready',
  profileStrength: 98,
  searchImpressions: 342,
  searchImpressionsGrowth: '+18%',
  firmInquiries: 14,
  publicProfileUrl: 'castallio.one/talent/alex-morgan-bim',
  exclusiveDirectOffers: true,
  targetRoles: [
    'Lead BIM Manager',
    'Computational Design Architect',
    'Head of Digital Practice',
  ],
  workModels: ['Remote (Preferred)', 'London (Hybrid ≤2d/wk)'],
  targetSectors: ['Large-Scale Rail Transit', 'Parametric Towers', 'Mass Timber (CLT)'],
  relocationMobility: 'Open to NYC, Zurich, Singapore (Visa sponsorship assistance required)',
}

export const INITIAL_SOFTWARE_SKILLS: SoftwareSkill[] = [
  {
    id: 'revit',
    name: 'Autodesk Revit 2024',
    badgeLetter: 'R',
    badgeColor: 'primary',
    score: 98,
    description: 'LOD 400 + Dynamo Automation',
    statusLabel: 'VERIFIED EXPERT',
    category: 'authoring',
  },
  {
    id: 'navisworks',
    name: 'Navisworks Manage',
    badgeLetter: 'N',
    badgeColor: 'tertiary',
    score: 95,
    description: 'Clash Matrix & 4D Phasing',
    statusLabel: 'VERIFIED',
    category: 'authoring',
  },
  {
    id: 'solibri',
    name: 'Solibri Model Checker',
    badgeLetter: 'S',
    badgeColor: 'secondary',
    score: 90,
    description: 'Rule-based QA/QC & IFC Audit',
    statusLabel: 'VERIFIED',
    category: 'authoring',
  },
  {
    id: 'archicad',
    name: 'ArchiCAD 27',
    badgeLetter: 'A',
    badgeColor: 'neutral',
    score: 82,
    description: 'OpenBIM IFC Collaboration',
    statusLabel: 'ASSESSED',
    category: 'authoring',
  },
  {
    id: 'grasshopper',
    name: 'Grasshopper / Rhino',
    badgeLetter: 'G',
    badgeColor: 'primary',
    score: 94,
    description: 'Rhino.Inside.Revit API',
    statusLabel: 'EXPERT',
    category: 'computational',
  },
  {
    id: 'dynamo',
    name: 'Dynamo Studio',
    badgeLetter: 'D',
    badgeColor: 'primary',
    score: 89,
    description: 'Custom DesignScript / Nodes',
    statusLabel: 'ADVANCED',
    category: 'computational',
  },
  {
    id: 'python',
    name: 'Python & pyRevit',
    badgeLetter: 'P',
    badgeColor: 'primary',
    score: 85,
    description: 'Automated QA Scripting',
    statusLabel: 'PROFICIENT',
    category: 'computational',
  },
]

export const CDE_STANDARDS_TAGS = [
  'ISO 19650-1 & 2',
  'Autodesk Construction Cloud (ACC)',
  'IFC4x3 Schema Architecture',
  'BIM Track BCF Hub',
  'Synchro 4D Scheduling',
]

export const INITIAL_PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'The Scalpel Commercial Tower — London',
    collaboration: 'Foster + Partners Collab',
    badge: 'LOD 400',
    tag: 'Federated Coordination',
    description:
      'Acted as Lead LOD 400 Clash Coordinator & Façade Dynamo Automation engineer. Resolved over 1,200 structural-MEP geometric clashes across 38 storeys prior to fabrication sign-off.',
    stack: ['Revit 2024', 'Navisworks', 'Rhino.Inside', 'Dynamo'],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-63vwhYO2WHW_6PgHRdwBq2x_iCdKCNkPm8075nlF4TSmkjNk-ox2zurLmk1eK-FYC8apH486HoL0xDz4nV0FzXeJoNWcXENMu6nsha91FCbOUwSCxJGPnXGwDHGih4BAIj7aTED1GkxlNo3_xu-2rEdmlhWUu8B3vpZU0Fy8LIITWRJHpnJQjabAG5P9eL-gIg4fjsYy6mNvfKWoipiCYBnBviFHH1AI21V89MBYCrrVSRWZIKtxSw',
    imageAlt: 'Digital architectural rendering and BIM wireframe model of the Scalpel Commercial Tower in London',
  },
  {
    id: 'proj-2',
    title: 'High-Speed Rail Interchange Transit Hub',
    collaboration: 'Arup Infrastructure',
    badge: 'INFRASTRUCTURE',
    tag: 'ISO 19650 BEP Lead',
    description:
      'Authored the project BIM Execution Plan (BEP), supervised IFC4 spatial coordination across Civil 3D alignments, track geometry, and below-grade mechanical tunnels.',
    stack: ['Civil 3D', 'IFC openBIM', 'Solibri', 'ACC Hub'],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU_Xter6AXv0QMJYT-DJQNaajvXtO1P_rJuV-QuLhoL-JVjVvwHj81aii_O5LkQ3gC4ak2iIjyCKFHuVphXlztPfYjkBdH_bDayZyGK7moSXvilzuARDlO3dfO-O7IjdMnnBAnVM5qRgUJFpQdv-24mmjMYcu36YpER6uuetUU16XM6tzQl2pq6Lap-3l9oqgS0tUnBgqyOs7Wvl8J8Ylxj4Jp-nIcgjCKIVzMEF5bmHjFryE8rZ4kCQ',
    imageAlt: 'High-speed rail interchange station BIM 3D coordination model showing parametric tunnel alignments',
  },
  {
    id: 'proj-3',
    title: 'Cross-Laminated Timber (CLT) Innovation Pavilion',
    collaboration: 'Bath Uni & Research Labs',
    badge: 'TIMBER FEA',
    tag: 'Carbon & Structural FEA',
    description:
      'Algorithmic parametric modeler and carbon life-cycle analyst. Generated robotic timber fabrication tooling paths directly from Grasshopper and Karamba3D stress runs.',
    stack: ['Grasshopper', 'Karamba3D', 'Python Scripting'],
    imageSrc:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANVu9bOLIuAGH3nHXdzRTdP3CwYasjFE2X9I4q7IkIO3irO4H_HuCshU3WT-MC-2NKvUp4nWqUmevY0iBxOQSBAoK4ute3bVghyTD20p3LbXtOu2BKvs4YS6OPz2qDx8gGmNF3DYsTwDjswTwHhptHYEtZqeZXuKwF7XsDKMsMlNaat6UMZNnYqcgGKZ6YUI_kq27w3UbYZepLuJwGNns6sFkmK4meOPplqb7cqU9F_t-i5Qqyj5pjow',
    imageAlt: 'Parametric mass timber pavilion model in Rhino Grasshopper showing cross-laminated timber diagrid structure',
  },
]

export const INITIAL_EXPERIENCE: ExperienceMilestone[] = [
  {
    id: 'exp-1',
    role: 'Senior BIM Coordinator',
    period: '2022 — PRESENT',
    company: 'Grimshaw Architects',
    location: 'London Headquarters',
    description:
      'Leading federated BIM coordination and clash detection matrices across 14 trade disciplines for international aviation and mega commercial developments. Reduced RFI turnaround by 35% through custom Dynamo automation scripts and weekly federated Solibri reviews.',
    tags: ['Aviation BIM', 'Trade Coordination', 'BCF Workflows'],
    active: true,
  },
  {
    id: 'exp-2',
    role: 'Computational BIM Specialist',
    period: '2019 — 2022',
    company: 'Foster + Partners',
    location: 'London',
    description:
      'Automated curtain wall façade panel generation and parametric rationalization reducing architectural detailing time by 40%. Interfaced Grasshopper scripts directly into Revit documentation sets via Rhino.Inside.',
    tags: ['Façade Automation', 'Grasshopper', 'Rhino.Inside'],
    active: false,
  },
  {
    id: 'exp-3',
    role: 'VDC Assistant Engineer',
    period: '2017 — 2019',
    company: 'Balfour Beatty Construction',
    location: 'UK Infrastructure Unit',
    description:
      'Site engineering coordination, laser scan to BIM verification (Point Cloud registration), and 4D construction schedule simulation in Synchro for civil groundworks.',
    tags: ['4D Synchro', 'Point Cloud QA', 'Laser Scan'],
    active: false,
  },
]

export const INITIAL_CREDENTIALS: CredentialItem[] = [
  {
    id: 'cred-1',
    title: 'ISO-19650 Information Management',
    issuer: 'BRE Academy · Cert #BRE-9482',
    verified: true,
  },
  {
    id: 'cred-2',
    title: 'Autodesk Certified Professional',
    issuer: 'Revit Architecture & Structure 2024',
    verified: true,
  },
  {
    id: 'cred-3',
    title: 'buildingSMART Professional (openBIM)',
    issuer: 'Certified Individual Practitioner',
    verified: true,
  },
  {
    id: 'cred-4',
    title: 'University of Bath — M.Sc. Architectural Computation',
    issuer: 'Graduated with Distinction · 2017',
    verified: true,
  },
]

export const INITIAL_DOCUMENTS: AttachedDocument[] = [
  {
    id: 'doc-1',
    name: 'Alex_Morgan_BIM_CV_2024.pdf',
    meta: 'Updated 3d ago',
    size: '2.4 MB',
  },
  {
    id: 'doc-2',
    name: 'LOD400_Sample_Coordination_v2.pdf',
    meta: 'Verified Matrix',
    size: '6.8 MB',
    verifiedSample: true,
  },
  {
    id: 'doc-3',
    name: 'Verified_BEP_Template_ISO19650.pdf',
    meta: 'Authoring Sample',
    size: '1.1 MB',
    verifiedSample: true,
  },
]

export function useMyProfile() {
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false)
  const [activeViewerProject, setActiveViewerProject] = useState<PortfolioProject>(INITIAL_PORTFOLIO_PROJECTS[0])
  const [skills] = useState<SoftwareSkill[]>(INITIAL_SOFTWARE_SKILLS)
  const [documents, setDocuments] = useState<AttachedDocument[]>(INITIAL_DOCUMENTS)
  const [credentials, setCredentials] = useState<CredentialItem[]>(INITIAL_CREDENTIALS)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit draft state
  const [editForm, setEditForm] = useState<ProfileData>(INITIAL_PROFILE)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const handleCopyPublicUrl = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://${profile.publicProfileUrl}`)
    }
    showToast('Public talent passport URL copied to clipboard!')
  }, [profile.publicProfileUrl, showToast])

  const toggleExclusiveOffers = useCallback(() => {
    setProfile((prev) => {
      const nextVal = !prev.exclusiveDirectOffers
      showToast(nextVal ? 'Direct recruiter offers enabled.' : 'Direct recruiter offers paused.')
      return { ...prev, exclusiveDirectOffers: nextVal }
    })
  }, [showToast])

  const startEditProfile = useCallback(() => {
    setEditForm(profile)
    setIsEditingProfile(true)
  }, [profile])

  const cancelEditProfile = useCallback(() => {
    setIsEditingProfile(false)
  }, [])

  const saveProfileChanges = useCallback(() => {
    setProfile(editForm)
    setIsEditingProfile(false)
    showToast('Profile & BIM credentials updated successfully.')
  }, [editForm, showToast])

  const openModelViewer = useCallback((project?: PortfolioProject) => {
    if (project) {
      setActiveViewerProject(project)
    }
    setIsViewerOpen(true)
  }, [])

  const closeModelViewer = useCallback(() => {
    setIsViewerOpen(false)
  }, [])

  const handleUploadDocument = useCallback(() => {
    const dummyNames = [
      'BIM_Execution_Plan_Scalpel_2024.pdf',
      'Dynamo_Automation_Script_Index.pdf',
      'Structural_Clash_Matrix_LOD400.pdf',
    ]
    const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)]
    const newDoc: AttachedDocument = {
      id: `doc-${Date.now()}`,
      name: randomName,
      meta: 'Uploaded just now',
      size: '3.2 MB',
      verifiedSample: true,
    }
    setDocuments((prev) => [newDoc, ...prev])
    showToast(`Uploaded "${randomName}" to verified attachments.`)
  }, [showToast])

  const handleDownloadDoc = useCallback((docName: string) => {
    const content = `CASTALLIO ONE // VERIFIED DOCUMENT EXPORT\nFILE: ${docName}\nTALENT: Alex Morgan (ID #08492-AM)\nTIMESTAMP: ${new Date().toISOString()}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = docName.replace('.pdf', '.txt')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Downloaded ${docName}`)
  }, [showToast])

  const handleAddAssessment = useCallback(() => {
    showToast('New BIM Skill Assessment module initialized (IFC4.3 & ISO 19650).')
  }, [showToast])

  const handleAddCredential = useCallback(() => {
    const newCred: CredentialItem = {
      id: `cred-${Date.now()}`,
      title: 'CanBIM Professional Certification Level 3',
      issuer: 'Canada BIM Council · Verified 2024',
      verified: true,
    }
    setCredentials((prev) => [...prev, newCred])
    showToast('Added CanBIM Professional credential to verified portfolio.')
  }, [showToast])

  return {
    profile,
    editForm,
    setEditForm,
    isEditingProfile,
    startEditProfile,
    cancelEditProfile,
    saveProfileChanges,
    skills,
    documents,
    credentials,
    isViewerOpen,
    activeViewerProject,
    openModelViewer,
    closeModelViewer,
    handleCopyPublicUrl,
    toggleExclusiveOffers,
    handleUploadDocument,
    handleDownloadDoc,
    handleAddAssessment,
    handleAddCredential,
    toastMessage,
    showToast,
  }
}
