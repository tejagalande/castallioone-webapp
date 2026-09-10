import { useState, useMemo, useCallback } from 'react'

export interface SavedJob {
  id: string
  title: string
  company: string
  companyInitials: string
  companyColor: 'primary' | 'secondary' | 'tertiary' | 'high'
  location: string
  workType: 'Hybrid' | 'Remote' | 'On-site'
  salary: string
  matchScore: number
  matchLabel: string
  savedDate: string
  closingBadge?: {
    text: string
    isUrgent: boolean
  }
  discipline: 'Structural' | 'BIM Mgmt' | 'Computational' | 'MEP' | 'Architecture'
  stack: string[]
  candidateNote?: string
  isClosingSoon?: boolean
}

export interface UpcomingDeadline {
  id: string
  company: string
  role: string
  daysLeftText: string
  urgency: 'critical' | 'moderate' | 'relaxed'
}

export interface SavedState {
  savedJobs: SavedJob[]
  searchQuery: string
  activeTab: 'saved' | 'archived' | 'companies'
  selectedDiscipline: string
  sortBy: 'closing-soonest' | 'highest-match' | 'recently-saved' | 'highest-comp'
  selectedJobIds: string[]
  activeNoteEditId: string | null
  noteDraft: string
  autoMatchAlerts: boolean
  alertCadence: 'daily' | 'realtime'
  appliedJobIds: string[]
  removedJobIds: string[]
  toastMessage: string | null
}

const INITIAL_SAVED_JOBS: SavedJob[] = [
  {
    id: 'job-1',
    title: 'Lead Computational Designer',
    company: 'Foster + Partners',
    companyInitials: 'F+P',
    companyColor: 'high',
    location: 'London, UK (Hybrid)',
    workType: 'Hybrid',
    salary: '$130,000 - $155,000 / yr',
    matchScore: 96,
    matchLabel: 'LOD Fit',
    savedDate: 'Saved 2 days ago',
    closingBadge: {
      text: 'Closing in 2d',
      isUrgent: true,
    },
    discipline: 'Computational',
    stack: ['Revit 2024', 'Grasshopper', 'Rhino.Inside', 'Python', 'Dynamo Core'],
    candidateNote:
      'Spoke with recruiter Sarah on LinkedIn; emphasized complex double-curved envelope automation using Rhino.Inside.',
    isClosingSoon: true,
  },
  {
    id: 'job-2',
    title: 'Senior BIM Manager - Infrastructure',
    company: 'Arup',
    companyInitials: 'ARUP',
    companyColor: 'primary',
    location: 'New York, NY (Hybrid)',
    workType: 'Hybrid',
    salary: '$145,000 - $170,000 / yr',
    matchScore: 94,
    matchLabel: 'CDE Match',
    savedDate: 'Saved Oct 22',
    closingBadge: {
      text: 'Actively Reviewing',
      isUrgent: false,
    },
    discipline: 'BIM Mgmt',
    stack: ['Revit', 'Navisworks Manage', 'Solibri Model Checker', 'IFC / openBIM', 'Civil 3D'],
    candidateNote:
      'Updated portfolio attachment with LOD 400 transit interchange coordination federated models.',
    isClosingSoon: false,
  },
  {
    id: 'job-3',
    title: 'Facade Engineering Specialist',
    company: 'Thornton Tomasetti',
    companyInitials: 'TT',
    companyColor: 'tertiary',
    location: 'San Francisco, CA (On-site)',
    workType: 'On-site',
    salary: '$120,000 - $140,000 / yr',
    matchScore: 89,
    matchLabel: 'FEA Fit',
    savedDate: 'Saved Oct 19',
    closingBadge: {
      text: 'Closing Nov 5',
      isUrgent: false,
    },
    discipline: 'Structural',
    stack: ['Rhino 8', 'Karamba3D', 'AutoCAD', 'Grasshopper'],
    candidateNote: undefined,
    isClosingSoon: false,
  },
  {
    id: 'job-4',
    title: 'Parametric Urban Planner',
    company: 'Gensler',
    companyInitials: 'G',
    companyColor: 'secondary',
    location: 'Chicago, IL (Remote)',
    workType: 'Remote',
    salary: '$110,000 - $135,000 / yr',
    matchScore: 87,
    matchLabel: 'GIS Fit',
    savedDate: 'Saved Oct 15',
    closingBadge: {
      text: 'Remote',
      isUrgent: false,
    },
    discipline: 'Computational',
    stack: ['ArcGIS Pro', 'Revit', 'Grasshopper', 'CityEngine'],
    candidateNote: undefined,
    isClosingSoon: false,
  },
  {
    id: 'job-5',
    title: 'MEP BIM Coordinator',
    company: 'Buro Happold',
    companyInitials: 'BH',
    companyColor: 'primary',
    location: 'Boston, MA (Hybrid)',
    workType: 'Hybrid',
    salary: '$115,000 - $138,000 / yr',
    matchScore: 91,
    matchLabel: 'MEP Fit',
    savedDate: 'Saved Oct 10',
    closingBadge: {
      text: 'Closing in 6d',
      isUrgent: false,
    },
    discipline: 'MEP',
    stack: ['Revit MEP', 'Navisworks', 'SysQue', 'AutoCAD MEP'],
    candidateNote: 'Highlighted clash detection expertise and HVAC pipe routing automation.',
    isClosingSoon: false,
  },
  {
    id: 'job-6',
    title: 'Senior Structural VDC Engineer',
    company: 'WSP Global',
    companyInitials: 'WSP',
    companyColor: 'tertiary',
    location: 'Seattle, WA (On-site)',
    workType: 'On-site',
    salary: '$128,000 - $152,000 / yr',
    matchScore: 88,
    matchLabel: 'Tekla Fit',
    savedDate: 'Saved Oct 08',
    closingBadge: {
      text: 'Closing Nov 12',
      isUrgent: false,
    },
    discipline: 'Structural',
    stack: ['Tekla Structures', 'Revit Structure', 'Navisworks', 'Robot Structural'],
    candidateNote: undefined,
    isClosingSoon: false,
  },
]

export const UPCOMING_DEADLINES: UpcomingDeadline[] = [
  {
    id: 'd-1',
    company: 'Foster + Partners',
    role: 'Lead Computational Designer',
    daysLeftText: '2d left',
    urgency: 'critical',
  },
  {
    id: 'd-2',
    company: 'Thornton Tomasetti',
    role: 'Facade Engineering Specialist',
    daysLeftText: '11d left',
    urgency: 'moderate',
  },
  {
    id: 'd-3',
    company: 'Gensler',
    role: 'Parametric Urban Planner',
    daysLeftText: '18d left',
    urgency: 'relaxed',
  },
]

export const ARCHIVED_JOBS: SavedJob[] = [
  {
    id: 'arch-1',
    title: 'VDC Modeling Specialist',
    company: 'Skidmore, Owings & Merrill (SOM)',
    companyInitials: 'SOM',
    companyColor: 'high',
    location: 'Chicago, IL',
    workType: 'Hybrid',
    salary: '$105,000 - $125,000 / yr',
    matchScore: 84,
    matchLabel: 'Archive',
    savedDate: 'Archived Sep 14',
    discipline: 'BIM Mgmt',
    stack: ['Revit', 'Navisworks', 'Enscape'],
  },
  {
    id: 'arch-2',
    title: 'Junior Computational Specialist',
    company: 'Zaha Hadid Architects',
    companyInitials: 'ZHA',
    companyColor: 'secondary',
    location: 'London, UK',
    workType: 'On-site',
    salary: '£45,000 - £55,000 / yr',
    matchScore: 80,
    matchLabel: 'Expired',
    savedDate: 'Expired Aug 30',
    discipline: 'Computational',
    stack: ['Maya', 'Rhino', 'Grasshopper'],
  },
  {
    id: 'arch-3',
    title: 'BIM Automation Engineer',
    company: 'Jacobs',
    companyInitials: 'JCB',
    companyColor: 'primary',
    location: 'Dallas, TX',
    workType: 'Remote',
    salary: '$118,000 - $135,000 / yr',
    matchScore: 90,
    matchLabel: 'Filled',
    savedDate: 'Filled Aug 15',
    discipline: 'BIM Mgmt',
    stack: ['C#', 'Revit API', 'Dynamo'],
  },
]

export interface SavedCompany {
  id: string
  name: string
  initials: string
  industry: string
  location: string
  openRolesCount: number
  verifiedBIM: boolean
  savedDate: string
}

export const SAVED_COMPANIES: SavedCompany[] = [
  {
    id: 'comp-1',
    name: 'Foster + Partners',
    initials: 'F+P',
    industry: 'Architecture & Integrated Design',
    location: 'London, UK / Global',
    openRolesCount: 8,
    verifiedBIM: true,
    savedDate: 'Saved 2 weeks ago',
  },
  {
    id: 'comp-2',
    name: 'Arup',
    initials: 'ARUP',
    industry: 'Multidisciplinary Engineering',
    location: 'London, UK / New York, NY',
    openRolesCount: 14,
    verifiedBIM: true,
    savedDate: 'Saved 1 month ago',
  },
  {
    id: 'comp-3',
    name: 'Thornton Tomasetti',
    initials: 'TT',
    industry: 'Structural & Facade Engineering',
    location: 'New York, NY / San Francisco, CA',
    openRolesCount: 5,
    verifiedBIM: true,
    savedDate: 'Saved 3 weeks ago',
  },
  {
    id: 'comp-4',
    name: 'Gensler',
    initials: 'G',
    industry: 'Global Architecture & Planning',
    location: 'San Francisco, CA / Global',
    openRolesCount: 19,
    verifiedBIM: true,
    savedDate: 'Saved 1 month ago',
  },
]

export function useSavedJobs() {
  const [jobs, setJobs] = useState<SavedJob[]>(INITIAL_SAVED_JOBS)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'saved' | 'archived' | 'companies'>('saved')
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'closing-soonest' | 'highest-match' | 'recently-saved' | 'highest-comp'>('closing-soonest')
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [activeNoteEditId, setActiveNoteEditId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState<string>('')
  const [autoMatchAlerts, setAutoMatchAlerts] = useState<boolean>(true)
  const [alertCadence, setAlertCadence] = useState<'daily' | 'realtime'>('daily')
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  // Filtered & Sorted Active Saved Jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Discipline filter
        if (selectedDiscipline !== 'All' && job.discipline !== selectedDiscipline) {
          return false
        }

        // Search query filter (search title, company, stack, location)
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase()
          const matchesTitle = job.title.toLowerCase().includes(q)
          const matchesCompany = job.company.toLowerCase().includes(q)
          const matchesLocation = job.location.toLowerCase().includes(q)
          const matchesStack = job.stack.some((s) => s.toLowerCase().includes(q))
          const matchesNote = job.candidateNote?.toLowerCase().includes(q) ?? false

          if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesStack && !matchesNote) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'highest-match') {
          return b.matchScore - a.matchScore
        }
        if (sortBy === 'closing-soonest') {
          if (a.isClosingSoon && !b.isClosingSoon) return -1
          if (!a.isClosingSoon && b.isClosingSoon) return 1
          return b.matchScore - a.matchScore
        }
        if (sortBy === 'highest-comp') {
          // crude sort based on first number in salary
          return b.salary.localeCompare(a.salary)
        }
        // recently-saved
        return 0
      })
  }, [jobs, selectedDiscipline, searchQuery, sortBy])

  // Select all or toggle single job
  const toggleSelectAll = useCallback(() => {
    if (selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0) {
      setSelectedJobIds([])
    } else {
      setSelectedJobIds(filteredJobs.map((j) => j.id))
    }
  }, [selectedJobIds.length, filteredJobs])

  const toggleSelectJob = useCallback((id: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  // Note management
  const startEditingNote = useCallback(
    (job: SavedJob) => {
      setActiveNoteEditId(job.id)
      setNoteDraft(job.candidateNote || '')
    },
    []
  )

  const cancelEditingNote = useCallback(() => {
    setActiveNoteEditId(null)
    setNoteDraft('')
  }, [])

  const saveNote = useCallback(
    (jobId: string) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, candidateNote: noteDraft.trim() || undefined } : j))
      )
      setActiveNoteEditId(null)
      setNoteDraft('')
      showToast('Candidate log updated successfully.')
    },
    [noteDraft, showToast]
  )

  // Remove / Unsave Job
  const removeSavedJob = useCallback(
    (jobId: string, title: string) => {
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      setSelectedJobIds((prev) => prev.filter((id) => id !== jobId))
      showToast(`Removed "${title}" from saved opportunities.`)
    },
    [showToast]
  )

  // Quick Apply handler
  const handleQuickApply = useCallback(
    (jobId: string, title: string) => {
      if (appliedJobIds.includes(jobId)) {
        showToast(`You have already applied for ${title}.`)
        return
      }
      setAppliedJobIds((prev) => [...prev, jobId])
      showToast(`Application submitted for ${title}! Recruiter notified.`)
    },
    [appliedJobIds, showToast]
  )

  // Bulk Apply
  const handleBulkApply = useCallback(() => {
    if (selectedJobIds.length === 0) {
      showToast('Please select at least one job first.')
      return
    }
    setAppliedJobIds((prev) => Array.from(new Set([...prev, ...selectedJobIds])))
    showToast(`Quick applications sent to ${selectedJobIds.length} bookmarked positions!`)
    setSelectedJobIds([])
  }, [selectedJobIds, showToast])

  // Export Specs handler
  const handleExportSpecs = useCallback(
    (job: SavedJob) => {
      const data = `CASTALLIO ONE // POSITION EXPORT SPEC
--------------------------------------------
ROLE: ${job.title}
FIRM: ${job.company}
LOCATION: ${job.location}
COMPENSATION: ${job.salary}
MATCH SCORE: ${job.matchScore}% (${job.matchLabel})
REQUIRED TECH STACK: ${job.stack.join(', ')}
NOTES: ${job.candidateNote || 'None'}
EXPORT TIMESTAMP: ${new Date().toISOString()}
`
      const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${job.company.replace(/[^a-zA-Z0-9]/g, '_')}_Spec.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showToast(`Exported specs for ${job.title}.`)
    },
    [showToast]
  )

  return {
    jobs,
    filteredJobs,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedDiscipline,
    setSelectedDiscipline,
    sortBy,
    setSortBy,
    selectedJobIds,
    toggleSelectAll,
    toggleSelectJob,
    activeNoteEditId,
    noteDraft,
    setNoteDraft,
    startEditingNote,
    cancelEditingNote,
    saveNote,
    removeSavedJob,
    handleQuickApply,
    handleBulkApply,
    handleExportSpecs,
    appliedJobIds,
    autoMatchAlerts,
    setAutoMatchAlerts,
    alertCadence,
    setAlertCadence,
    toastMessage,
    showToast,
  }
}
