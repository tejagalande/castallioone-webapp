import { useState, useMemo, useCallback } from 'react'

export interface InterviewPanelist {
  name: string
  title: string
}

export interface AgendaItem {
  id: string
  duration: string
  title: string
  description: string
}

export interface PreloadedAsset {
  id: string
  name: string
  type: 'pdf' | 'ghx' | 'cv'
  icon: string
}

export interface InterviewSession {
  id: string
  firmName: string
  firmInitial: string
  firmSubtitle: string
  isTier1: boolean
  sessionCode: string
  stageText: string
  roleTitle: string
  technicalFitScore: number
  scheduledDate: string
  scheduledTime: string
  panelists: InterviewPanelist[]
  agenda: AgendaItem[]
  assets: PreloadedAsset[]
  status: 'imminent' | 'confirmed' | 'pending-action' | 'completed'
  badgeLabel?: string
  verificationFocus?: string
  opensInText?: string
}

export interface PendingSlot {
  id: number
  dateText: string
  timeText: string
}

export interface CompletedInterview {
  id: string
  firmName: string
  statusBadge: string
  badgeColor: 'primary' | 'success'
  roleTitle: string
  dateText: string
  score: string
  summary: string
}

export interface DiagnosticItem {
  name: string
  status: string
  isOk: boolean
}

export interface DebriefFeedback {
  firmName: string
  panelName: string
  score: string
  quote: string
  author: string
}

export interface AvailabilityWindow {
  days: string
  hours: string
  minNotice: string
}

const INITIAL_UPCOMING_INTERVIEWS: InterviewSession[] = [
  {
    id: 'int-fp-01',
    firmName: 'Foster + Partners',
    firmInitial: 'F+P',
    firmSubtitle: 'Applied R&D Computation Studio • London HQ (Riverside)',
    isTier1: true,
    sessionCode: '#INT-FP-9821',
    stageText: 'Stage 03 / 04 • Technical Algorithm & LOD-400 Model Defense',
    roleTitle: 'Lead Computational Designer & Façade Specialist',
    technicalFitScore: 96.4,
    scheduledDate: 'Thursday, Nov 7, 2024',
    scheduledTime: '14:00 - 14:45 GMT (45 mins)',
    panelists: [
      { name: 'Elena Rostova', title: 'Head of Computational TA' },
      { name: 'Dr. Julian Croft', title: 'Partner, Applied R&D' },
    ],
    agenda: [
      {
        id: 'ag-1',
        duration: '15m',
        title: 'Grasshopper & pyRevit Automation Workflow',
        description: 'Candidate walkthrough of parametric skin script for The Scalpel Tower diagrid rationalization.',
      },
      {
        id: 'ag-2',
        duration: '20m',
        title: 'Live LOD-400 Panelization & Clash Script Defense',
        description: 'Live interactive test in WebGL sandbox. Rationalizing double-curved GFRC panels with fabrication tolerance.',
      },
      {
        id: 'ag-3',
        duration: '10m',
        title: 'ISO 19650 CDE & BEP Architecture',
        description: 'Interactive Q&A on multi-firm federated coordination protocols & schema mappings.',
      },
    ],
    assets: [
      { id: 'as-1', name: 'Foster_Technical_Panel_Brief.pdf', type: 'pdf', icon: 'picture_as_pdf' },
      { id: 'as-2', name: 'Scalpel_Facade_Cluster.ghx', type: 'ghx', icon: 'data_object' },
      { id: 'as-3', name: 'Alex_Morgan_Verified_CV_v4.2.pdf', type: 'cv', icon: 'check_circle' },
    ],
    status: 'imminent',
    badgeLabel: 'LIVE VIDEO + 3D SANDBOX',
    opensInText: 'Opens in 46h',
  },
  {
    id: 'int-ga-02',
    firmName: 'Grimshaw Architects',
    firmInitial: 'GA',
    firmSubtitle: 'Transit & Infrastructure Practice • London Studio',
    isTier1: true,
    sessionCode: '#INT-GA-4419',
    stageText: 'STAGE 02 / 03 • Cross-Disciplinary Coordination',
    roleTitle: 'Senior BIM Infrastructure Coordinator (HS2 Rail Interchange)',
    technicalFitScore: 94.2,
    scheduledDate: 'Mon, Nov 11, 2024',
    scheduledTime: '10:30 - 11:30 GMT (60m)',
    panelists: [
      { name: 'Marcus Vance', title: 'VDC Director, Transit & Rail' },
    ],
    agenda: [
      {
        id: 'ag-ga-1',
        duration: '30m',
        title: 'Solibri Model QA & Clash Matrix Validation',
        description: 'Deep dive into 4D federated model verification under ISO 19650-2 schema.',
      },
      {
        id: 'ag-ga-2',
        duration: '30m',
        title: 'CDE Simulation & Rail Clearance Audit',
        description: 'Verification of multi-discipline clearance envelopes and signal telemetry clash detection.',
      },
    ],
    assets: [
      { id: 'as-ga-1', name: 'Grimshaw_HS2_BIM_Spec.pdf', type: 'pdf', icon: 'picture_as_pdf' },
      { id: 'as-ga-2', name: 'CDE_Protocol_Summary.pdf', type: 'pdf', icon: 'picture_as_pdf' },
    ],
    status: 'confirmed',
    verificationFocus: 'ISO 19650 BEP Audit (Cross-Disciplinary Model QA)',
  },
]

const COMPLETED_INTERVIEWS: CompletedInterview[] = [
  {
    id: 'past-1',
    firmName: 'Arup',
    statusBadge: 'PASSED 96%',
    badgeColor: 'primary',
    roleTitle: 'Senior Computational Specialist',
    dateText: 'Oct 28',
    score: '96%',
    summary: 'Passed technical coding & Rhino.Inside integration panel with distinction.',
  },
  {
    id: 'past-2',
    firmName: 'Balfour Beatty',
    statusBadge: 'OFFER EXTENDED',
    badgeColor: 'success',
    roleTitle: 'VDC Integration Lead',
    dateText: 'Oct 14',
    score: '98%',
    summary: '4D Synchro construction sequencing and clash reduction presentation approved.',
  },
  {
    id: 'past-3',
    firmName: 'BDP',
    statusBadge: 'PASSED 92%',
    badgeColor: 'primary',
    roleTitle: 'BIM Execution Manager',
    dateText: 'Sep 30',
    score: '92%',
    summary: 'ISO 19650 Common Data Environment strategy review validated.',
  },
  {
    id: 'past-4',
    firmName: 'Kohn Pedersen Fox (KPF)',
    statusBadge: 'PASSED 95%',
    badgeColor: 'primary',
    roleTitle: 'Parametric Geometry Lead',
    dateText: 'Sep 18',
    score: '95%',
    summary: 'Complex double curved surface rationalization algorithm approved.',
  },
  {
    id: 'past-5',
    firmName: 'WSP',
    statusBadge: 'PASSED 91%',
    badgeColor: 'primary',
    roleTitle: 'Digital Engineering Specialist',
    dateText: 'Aug 29',
    score: '91%',
    summary: 'Automated quantity takeoff Dynamo scripts verified by engineering committee.',
  },
]

export function useInterviews() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'action-required' | 'past' | 'all'>('upcoming')
  const [formatFilter, setFormatFilter] = useState<'all' | '3d-model-defense' | 'tier-1'>('all')
  const [selectedZhaSlot, setSelectedZhaSlot] = useState<number>(1)
  const [isZhaConfirmed, setIsZhaConfirmed] = useState<boolean>(false)
  const [selectedTimezone, setSelectedTimezone] = useState<string>('Europe/London (GMT / UTC+0)')

  // Modals state
  const [isMockModalOpen, setIsMockModalOpen] = useState<boolean>(false)
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState<boolean>(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false)
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState<CompletedInterview | null>(null)

  // Simulation test state
  const [diagStep, setDiagStep] = useState<number>(0)
  const [isTestingDiag, setIsTestingDiag] = useState<boolean>(false)

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const zhaSlots: PendingSlot[] = useMemo(
    () => [
      { id: 1, dateText: 'Wed, Nov 13', timeText: '11:00 - 11:45 GMT' },
      { id: 2, dateText: 'Thu, Nov 14', timeText: '15:00 - 15:45 GMT' },
      { id: 3, dateText: 'Fri, Nov 15', timeText: '09:30 - 10:15 GMT' },
    ],
    []
  )

  const handleConfirmZhaSlot = useCallback(() => {
    const slot = zhaSlots.find((s) => s.id === selectedZhaSlot) || zhaSlots[0]
    setIsZhaConfirmed(true)
    showToast(`Slot confirmed for ${slot.dateText} (${slot.timeText})! Synced with ZHA CODE Lab.`)
  }, [selectedZhaSlot, zhaSlots, showToast])

  const handleSyncCalendar = useCallback(() => {
    showToast('Synchronized 2 upcoming interview sessions with Google & Outlook Calendar.')
  }, [showToast])

  const handleDownloadIcs = useCallback((sessionTitle: string) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Castallio One//AEC Interview Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${sessionTitle}
DESCRIPTION:Castallio One Verified AEC Technical Assessment & LOD-400 Defense
LOCATION:Castallio Encrypted WebGL Live Room
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sessionTitle.replace(/[^a-zA-Z0-9]/g, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Downloaded .ics calendar invite for ${sessionTitle}`)
  }, [showToast])

  const runFullDiagnostics = useCallback(() => {
    setIsTestingDiag(true)
    setDiagStep(1)
    setTimeout(() => setDiagStep(2), 700)
    setTimeout(() => setDiagStep(3), 1400)
    setTimeout(() => setDiagStep(4), 2100)
    setTimeout(() => {
      setIsTestingDiag(false)
      showToast('All 4 system diagnostic checks verified: 100% Operational (60 FPS, 18ms Latency).')
    }, 2800)
  }, [showToast])

  return {
    activeTab,
    setActiveTab,
    formatFilter,
    setFormatFilter,
    selectedZhaSlot,
    setSelectedZhaSlot,
    isZhaConfirmed,
    selectedTimezone,
    setSelectedTimezone,
    zhaSlots,
    upcomingInterviews: INITIAL_UPCOMING_INTERVIEWS,
    completedInterviews: COMPLETED_INTERVIEWS,
    isMockModalOpen,
    setIsMockModalOpen,
    isDiagnosticsModalOpen,
    setIsDiagnosticsModalOpen,
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    selectedFeedbackItem,
    setSelectedFeedbackItem,
    diagStep,
    isTestingDiag,
    toastMessage,
    showToast,
    handleConfirmZhaSlot,
    handleSyncCalendar,
    handleDownloadIcs,
    runFullDiagnostics,
  }
}
