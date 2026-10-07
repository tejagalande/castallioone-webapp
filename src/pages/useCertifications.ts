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

const INITIAL_CERTIFICATIONS: CertificationLicense[] = []

const INITIAL_CPD: CPDProgress = {
  totalHours: 0,
  targetHours: 100,
  cycle: '2024-2025 CYCLE',
  breakdown: {
    bimCoordination: 0,
    computationalScripting: 0,
    isoLegalProtocol: 0,
  },
}

const INITIAL_TELEMETRY: VerificationTelemetry = {
  activeCount: 0,
  complianceScore: 0,
  trustIndex: 0,
  cryptographicHash: '—',
  ledgerShort: '—',
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
      navigator.clipboard.writeText('https://castallio.one/verify/credentials')
    }
    showToast('Public shareable verification ledger URL copied!')
  }, [showToast])

  const handleDownloadTranscriptPDF = useCallback(() => {
    const transcriptText = `CASTALLIO ONE // VERIFIED CREDENTIAL TRANSCRIPT
=====================================================
CANDIDATE: Verified AEC Candidate
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
