import { useState, useMemo, useCallback } from 'react'

export interface CertificationLicense {
  id: string
  title: string
  issuingBody: string
  location: string
  certNumber: string
  tierLabel: string
  status: 'verified' | 'expiring' | 'expired'
  issueDate: string
  validUntil: string
  accreditationType: string
  ledgerHash: string
  category: 'bim-cde' | 'parametric' | 'institutions' | 'safety'
  scoreAchieved?: string
  apiSyncStatus: string
  competencies: string[]
  pdfUrl?: string
  hasDirectApiSync?: boolean
  daysRemaining?: number
  renewalActionRequired?: boolean
  renewalNotes?: string
}

export interface CPDProgress {
  totalHours: number
  targetHours: number
  cycle: string
  breakdown: {
    bimCoordination: number
    computationalScripting: number
    isoLegalProtocol: number
  }
}

export interface VerificationTelemetry {
  activeCount: number
  complianceScore: number
  trustIndex: number
  cryptographicHash: string
  ledgerShort: string
}

const INITIAL_CERTIFICATIONS: CertificationLicense[] = [
  {
    id: 'cert-bre',
    title: 'BRE Academy — ISO 19650 Information Management Lead',
    issuingBody: 'BRE Global Academy',
    location: 'Watford, UK',
    certNumber: 'BRE-IM-94820-UK',
    tierLabel: 'TIER 1 GLOBAL STANDARD',
    status: 'verified',
    issueDate: 'Oct 24, 2022',
    validUntil: 'Oct 24, 2025',
    accreditationType: 'Professional Lead',
    ledgerHash: '0x8F4AE39120BC84F9B91C771',
    category: 'bim-cde',
    apiSyncStatus: 'Automated API verification via BRE Credential Registry',
    competencies: [
      'ISO 19650-1 / -2',
      'CDE Workflow Architecture',
      'BEP Authoring',
      'MIDP & TIDP Matrices',
      'EIR Alignment',
      'Information Handover (COBie)',
    ],
    hasDirectApiSync: true,
  },
  {
    id: 'cert-autodesk',
    title: 'Autodesk Certified Professional — Revit Architecture 2024',
    issuingBody: 'Autodesk Inc. via Certiport',
    location: 'San Francisco, CA',
    certNumber: 'AC-REVIT-2024-88319',
    tierLabel: 'VENDOR EXPERT',
    status: 'verified',
    issueDate: 'Jan 15, 2024',
    validUntil: 'Release Tier 2024',
    accreditationType: 'Vendor Certification',
    ledgerHash: '0x3C91004A81BC2210FA98124',
    category: 'parametric',
    scoreAchieved: '960 / 1000 (96%)',
    apiSyncStatus: 'Sync status: Live token validated 2 hours ago (Credly Synced)',
    competencies: [
      'Parametric Family Fabrication',
      'Multi-discipline Worksets',
      'Clash Resolution',
      'Dynamo Visual Scripting',
      'Design Options & Phasing',
    ],
    hasDirectApiSync: true,
  },
  {
    id: 'cert-bsi',
    title: 'buildingSMART International — openBIM Professional Foundation',
    issuingBody: 'buildingSMART International',
    location: 'London / Worldwide',
    certNumber: 'BSI-PCERT-2023-441',
    tierLabel: 'OPENBIM CERTIFIED',
    status: 'verified',
    issueDate: 'May 11, 2023',
    validUntil: 'May 11, 2026',
    accreditationType: 'openBIM Practitioner',
    ledgerHash: '0x992BCA129984BC8120FF456',
    category: 'bim-cde',
    apiSyncStatus: 'Standard ISO 16739-1:2018 conformity audited',
    competencies: [
      'IFC4 Schema Architecture',
      'BCF Issue Tracking',
      'Model View Definitions (MVD)',
      'Information Delivery Manual (IDM)',
    ],
    hasDirectApiSync: true,
  },
  {
    id: 'cert-canbim',
    title: 'CanBIM Professional Certification — Level 3 (CP)',
    issuingBody: 'Building Transformations / CanBIM',
    location: 'Toronto, Canada',
    certNumber: 'CANBIM-L3-0941',
    tierLabel: 'NATIONAL COUNCIL',
    status: 'verified',
    issueDate: 'Aug 19, 2021',
    validUntil: 'Aug 19, 2025',
    accreditationType: 'Level 3 Senior Coordination',
    ledgerHash: '0x77A199BC44D120AA888123C',
    category: 'institutions',
    apiSyncStatus: 'CanBIM certified council reviewer authenticated',
    competencies: [
      'VDC Field Coordination',
      'LOD 400 Trade Coordination',
      'Multi-Consultant Conflict Resolution',
      'Navisworks Coordination',
    ],
    hasDirectApiSync: false,
  },
  {
    id: 'cert-mcneel',
    title: 'Rhino & Grasshopper Level 2 Specialist (McNeel Europe)',
    issuingBody: 'Robert McNeel & Associates',
    location: 'Barcelona, Spain',
    certNumber: 'MCN-GH-8201',
    tierLabel: 'COMPUTATIONAL EXPERT',
    status: 'verified',
    issueDate: 'Nov 14, 2022',
    validUntil: 'Lifetime / No expiration',
    accreditationType: 'Computational Design Track',
    ledgerHash: '0x44BC201A9876543210FEDCBA',
    category: 'parametric',
    apiSyncStatus: 'Issued Nov 2022 • No expiration • Computational Design Track',
    competencies: [
      'NURBS Surface Topology',
      'Kangaroo Physics Simulation',
      'Ladybug Environmental Solar Study',
      'Rhino.Inside Revit API',
    ],
    hasDirectApiSync: true,
  },
  {
    id: 'cert-cscs',
    title: 'Safety & Site Protocol — CSCS Professionally Qualified Person (PQP)',
    issuingBody: 'Construction Skills Certification Scheme (CITB)',
    location: 'UK Nationwide',
    certNumber: 'CSCS-PQP-449102',
    tierLabel: 'ON-SITE HEALTH & SAFETY',
    status: 'expiring',
    issueDate: 'Jan 01, 2020',
    validUntil: 'Dec 31, 2024',
    daysRemaining: 65,
    accreditationType: 'Site Qualified Person',
    ledgerHash: '0x123456789ABCDEF012345678',
    category: 'safety',
    renewalActionRequired: true,
    renewalNotes:
      'Your card expires on Dec 31, 2024. Submit your updated professional membership audit to CITB to prevent site audit downtime.',
    apiSyncStatus: 'CITB Card Checker Database synchronized',
    competencies: [
      'UK Construction Site Health & Safety',
      'CDM 2015 Regulations',
      'Site Risk Assessment',
      'Laser Scanning Site Safety',
    ],
    hasDirectApiSync: true,
  },
]

const INITIAL_CPD: CPDProgress = {
  totalHours: 84,
  targetHours: 100,
  cycle: '2024-2025 CYCLE',
  breakdown: {
    bimCoordination: 42,
    computationalScripting: 26,
    isoLegalProtocol: 16,
  },
}

const INITIAL_TELEMETRY: VerificationTelemetry = {
  activeCount: 6,
  complianceScore: 99.4,
  trustIndex: 100,
  cryptographicHash: '0x8F4AE39120BC84F9B91C771',
  ledgerShort: '0x8F4A...B91C',
}

export function useCertifications() {
  const [certifications, setCertifications] = useState<CertificationLicense[]>(INITIAL_CERTIFICATIONS)
  const [cpdProgress, setCpdProgress] = useState<CPDProgress>(INITIAL_CPD)
  const [telemetry] = useState<VerificationTelemetry>(INITIAL_TELEMETRY)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<'tier' | 'recent' | 'validity'>('tier')
  const [recruiterSSOAudit, setRecruiterSSOAudit] = useState<boolean>(true)
  const [embedWatermark, setEmbedWatermark] = useState<boolean>(true)
  const [includeRegistryUrls, setIncludeRegistryUrls] = useState<boolean>(true)
  const [requireNDAForSerials, setRequireNDAForSerials] = useState<boolean>(false)

  // Modals & toast
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
  const [isLogCPDModalOpen, setIsLogCPDModalOpen] = useState<boolean>(false)
  const [inspectCert, setInspectCert] = useState<CertificationLicense | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Cert form draft
  const [newCertTitle, setNewCertTitle] = useState<string>('')
  const [newCertIssuer, setNewCertIssuer] = useState<string>('')
  const [newCertId, setNewCertId] = useState<string>('')

  // CPD log draft
  const [logHours, setLogHours] = useState<number>(4)
  const [logCategory, setLogCategory] = useState<'bim' | 'comp' | 'legal'>('bim')
  const [logTitle, setLogTitle] = useState<string>('')

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const filteredCertifications = useMemo(() => {
    return certifications.filter((cert) => {
      // Filter tab
      if (activeFilter === 'bim-cde' && cert.category !== 'bim-cde') return false
      if (activeFilter === 'parametric' && cert.category !== 'parametric') return false
      if (activeFilter === 'institutions' && cert.category !== 'institutions') return false
      if (activeFilter === 'expiring' && cert.status !== 'expiring') return false

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchTitle = cert.title.toLowerCase().includes(q)
        const matchIssuer = cert.issuingBody.toLowerCase().includes(q)
        const matchId = cert.certNumber.toLowerCase().includes(q)
        const matchComp = cert.competencies.some((c) => c.toLowerCase().includes(q))
        if (!matchTitle && !matchIssuer && !matchId && !matchComp) {
          return false
        }
      }

      return true
    })
  }, [certifications, activeFilter, searchQuery])

  const handleCopyLedgerHash = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(telemetry.cryptographicHash)
    }
    showToast('Cryptographic ledger hash copied!')
  }, [telemetry.cryptographicHash, showToast])

  const handleCopyShareLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://castallio.one/verify/alex-morgan-vdc')
    }
    showToast('Public shareable verification ledger URL copied!')
  }, [showToast])

  const handleDownloadTranscriptPDF = useCallback(() => {
    const transcriptText = `CASTALLIO ONE // VERIFIED CREDENTIAL TRANSCRIPT
=====================================================
CANDIDATE: Alex Morgan, M.Sc., AIA Assoc., CanBIM Prof.
LEDGER HASH: ${telemetry.cryptographicHash}
COMPLIANCE SCORE: ${telemetry.complianceScore}% (ISO 19650 Level 2)
TRUST INDEX: 100/100
TIMESTAMP: ${new Date().toISOString()}

VERIFIED LICENSES & CERTIFICATIONS:
1. BRE Academy — ISO 19650 Information Management Lead (#BRE-IM-94820-UK)
   - Status: Active (Expires Oct 2025)
   - Scope: CDE Architecture, BEP Authoring, EIR/COBie Handover
2. Autodesk Certified Professional — Revit Architecture 2024 (#AC-REVIT-2024-88319)
   - Status: Active (96% Pass Score)
   - Scope: Parametric Family Fabrication, Dynamo Visual Scripting
3. buildingSMART International — openBIM Foundation (#BSI-PCERT-2023-441)
   - Status: Active (Expires May 2026)
   - Scope: IFC4 Schema, BCF Issue Management, MVDs
4. CanBIM Professional Certification — Level 3 (#CANBIM-L3-0941)
   - Status: Active (Expires Aug 2025)
   - Scope: VDC Coordination, LOD 400 Conflict Resolution
5. Robert McNeel & Associates — Rhino & Grasshopper Level 2 (#MCN-GH-8201)
   - Status: Active (Lifetime)
   - Scope: NURBS Surfaces, Kangaroo Physics, Rhino.Inside
6. CITB — CSCS Professionally Qualified Person (#CSCS-PQP-449102)
   - Status: Renewal Required (Dec 31, 2024)

CONTINUING PROFESSIONAL DEVELOPMENT (CPD):
- Total Earned: ${cpdProgress.totalHours} / ${cpdProgress.targetHours} Hours (${Math.round((cpdProgress.totalHours / cpdProgress.targetHours) * 100)}%)
`
    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Alex_Morgan_Verified_Transcript_2025.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Downloaded authenticated transcript PDF.')
  }, [telemetry, cpdProgress, showToast])

  const handleDownloadSingleCert = useCallback(
    (cert: CertificationLicense) => {
      const data = `CASTALLIO ONE // VERIFIED CREDENTIAL CERTIFICATE\nCERTIFICATE: ${cert.title}\nISSUER: ${cert.issuingBody}\nSERIAL: ${cert.certNumber}\nLEDGER HASH: ${cert.ledgerHash}\nVALIDITY: ${cert.issueDate} - ${cert.validUntil}`
      const blob = new Blob([data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cert.certNumber}_Certificate.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast(`Downloaded signed certificate for ${cert.title}`)
    },
    [showToast]
  )

  const handleRenewCSCS = useCallback(() => {
    showToast('Redirected to CITB Online Portal for PQP card renewal.')
  }, [showToast])

  const handleAddCertSubmit = useCallback(() => {
    if (!newCertTitle.trim()) {
      showToast('Please enter certification title.')
      return
    }
    const newCert: CertificationLicense = {
      id: `cert-${Date.now()}`,
      title: newCertTitle,
      issuingBody: newCertIssuer || 'Professional Body',
      location: 'Global',
      certNumber: newCertId || `CW-${Math.floor(10000 + Math.random() * 90000)}`,
      tierLabel: 'VERIFIED CREDENTIAL',
      status: 'verified',
      issueDate: 'Just Now',
      validUntil: '2027',
      accreditationType: 'Professional License',
      ledgerHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}...`,
      category: 'bim-cde',
      apiSyncStatus: 'Direct API Verified',
      competencies: ['AEC Standard Protocol', 'Professional Ethics', 'Quality Assurance'],
      hasDirectApiSync: true,
    }
    setCertifications((prev) => [newCert, ...prev])
    setIsAddModalOpen(false)
    setNewCertTitle('')
    setNewCertIssuer('')
    setNewCertId('')
    showToast(`Added and verified "${newCert.title}"!`)
  }, [newCertTitle, newCertIssuer, newCertId, showToast])

  const handleLogCPDSubmit = useCallback(() => {
    if (!logTitle.trim()) {
      showToast('Please enter CPD activity description.')
      return
    }
    setCpdProgress((prev) => {
      const nextTotal = Math.min(prev.targetHours, prev.totalHours + logHours)
      return {
        ...prev,
        totalHours: nextTotal,
        breakdown: {
          ...prev.breakdown,
          bimCoordination:
            logCategory === 'bim'
              ? prev.breakdown.bimCoordination + logHours
              : prev.breakdown.bimCoordination,
          computationalScripting:
            logCategory === 'comp'
              ? prev.breakdown.computationalScripting + logHours
              : prev.breakdown.computationalScripting,
          isoLegalProtocol:
            logCategory === 'legal'
              ? prev.breakdown.isoLegalProtocol + logHours
              : prev.breakdown.isoLegalProtocol,
        },
      }
    })
    setIsLogCPDModalOpen(false)
    setLogTitle('')
    showToast(`Logged ${logHours} CPD hours for "${logTitle}"!`)
  }, [logTitle, logHours, logCategory, showToast])

  return {
    certifications,
    filteredCertifications,
    cpdProgress,
    telemetry,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    recruiterSSOAudit,
    setRecruiterSSOAudit,
    embedWatermark,
    setEmbedWatermark,
    includeRegistryUrls,
    setIncludeRegistryUrls,
    requireNDAForSerials,
    setRequireNDAForSerials,
    isAddModalOpen,
    setIsAddModalOpen,
    isLogCPDModalOpen,
    setIsLogCPDModalOpen,
    inspectCert,
    setInspectCert,
    newCertTitle,
    setNewCertTitle,
    newCertIssuer,
    setNewCertIssuer,
    newCertId,
    setNewCertId,
    logHours,
    setLogHours,
    logCategory,
    setLogCategory,
    logTitle,
    setLogTitle,
    handleCopyLedgerHash,
    handleCopyShareLink,
    handleDownloadTranscriptPDF,
    handleDownloadSingleCert,
    handleRenewCSCS,
    handleAddCertSubmit,
    handleLogCPDSubmit,
    toastMessage,
    showToast,
  }
}
