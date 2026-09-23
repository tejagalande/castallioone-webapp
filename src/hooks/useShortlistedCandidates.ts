import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type ShortlistDisciplineCategory =
  | 'all'
  | 'Civil & Structural'
  | 'Architecture'
  | 'BIM / VDC'
  | 'Computational Design'
  | 'Other'

export type ShortlistSortOption =
  | 'match'
  | 'recent'
  | 'immediate'
  | 'experience'
  | 'name'

export interface StudentExperienceItem {
  id: string
  roleTitle: string
  organizationName: string
  contributions?: string
  startDate?: string | null
  endDate?: string | null
}

export interface ApplicantInterviewInfo {
  id: string
  interviewDate: string
  interviewTime: string
  interviewType: string
  locationType: string
  locationValue: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface ShortlistedCandidateItem {
  id: string // job_applications.id
  applicationId: string
  candidateId: string // auth.users.id
  studentProfileId: string
  name: string
  avatarInitials: string
  profileImageUrl?: string
  email: string
  phone?: string | null
  role: string // applied job title
  jobId: string | null
  jobTitle: string
  jobLocation: string
  location: string
  discipline: string
  institution: string
  graduationYear: string
  expectedCtc: string
  noticePeriod: string
  isAvailableImmediately: boolean
  workMode: string
  matchScore: number // 0-100%
  skills: string[]
  experiences: StudentExperienceItem[]
  experienceYears: number
  interviews: ApplicantInterviewInfo[]
  hasScheduledInterview: boolean
  resumeFileUrl?: string
  hasResume: boolean
  portfolioUrl?: string
  linkedinUrl?: string
  isStarred: boolean
  stageStatus: string
  appliedAt: string
  appliedDateLabel: string
  bio: string
}

export interface JobFilterItem {
  id: string
  title: string
  count: number
}

export interface ScheduleInterviewPayload {
  candidateId: string
  jobApplicationId: string
  interviewDate: string
  interviewTime: string
  interviewType: 'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit' | 'Final Discussion'
  locationType: 'Video Call' | 'In-Person'
  locationValue: string
}

// Fallback candidates for offline or demo sessions
export const DEMO_SHORTLISTED: ShortlistedCandidateItem[] = [
  {
    id: 'app-demo-1',
    applicationId: 'app-demo-1',
    candidateId: 'cand-demo-1',
    studentProfileId: 'sp-demo-1',
    name: 'Elena Rostova',
    avatarInitials: 'ER',
    profileImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDyKryCT770wlxFlcpH7L03D-PMFrZemZwPpiR-7f2FQ2nf9vAUxUJQIZP_WGcH8OUcBixRQLcthBLNV2YnrALR55fk1Sf9AlVO5QGMfn6NykJBdrNVD3THa3fe2yhE4MLv5yCg8hK3Hujsjf93qy3jao1HJgl9iXXpggpx_8bStlpjU61KaVnTiLcqnmG235w6sOfyTjTjuiG5GW9BKVzTL0BMtQeY7yK8RpINzKmmavstKdL0BXAudg',
    email: 'elena.rostova@parametric-aec.co.uk',
    phone: '+44 20 7946 0912',
    role: 'Lead Computational Façade Specialist',
    jobId: 'job-1',
    jobTitle: 'Senior BIM Coordinator',
    jobLocation: 'London, UK (Hybrid)',
    location: 'London, UK',
    discipline: 'Computational Design',
    institution: 'Architectural Association London',
    graduationYear: '2023',
    expectedCtc: '£68,000 / yr',
    noticePeriod: 'Immediately',
    isAvailableImmediately: true,
    workMode: 'Hybrid',
    matchScore: 98,
    skills: ['Rhino 8 + Grasshopper', 'pyRevit / IronPython', 'Speckle 2.0 Pipeline', 'Karamba FEA Structural', 'Revit'],
    experiences: [
      {
        id: 'exp-1',
        roleTitle: 'Parametric Envelope Designer',
        organizationName: 'Foster + Partners Applied R&D',
        contributions: 'Automated 4,200 unique parametric GFRC cassettes with zero self-intersection tolerances.',
        startDate: '2023-01-01',
        endDate: null,
      },
    ],
    experienceYears: 4.5,
    interviews: [
      {
        id: 'iv-1',
        interviewDate: '2026-09-28',
        interviewTime: '14:30',
        interviewType: 'Portfolio Deep-Dive',
        locationType: 'Video Call',
        locationValue: 'https://meet.google.com/aec-demo-castallio',
        status: 'scheduled',
      },
    ],
    hasScheduledInterview: true,
    resumeFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasResume: true,
    portfolioUrl: 'https://elena-rostova-parametric.io',
    linkedinUrl: 'https://linkedin.com',
    isStarred: true,
    stageStatus: 'shortlisted',
    appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    appliedDateLabel: 'Applied 3d ago',
    bio: 'Lead computational designer specializing in double-curved envelope scripting and automated geometric coordination.',
  },
  {
    id: 'app-demo-2',
    applicationId: 'app-demo-2',
    candidateId: 'cand-demo-2',
    studentProfileId: 'sp-demo-2',
    name: 'Marcus Thorne, PE',
    avatarInitials: 'MT',
    profileImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBY_DKyWH65azgvxLy21JdiblZGqho6L2aV7IfYJBwQ3ZsmQjrg_Kcajr8_VkBXlm9YJkE8KGEIkbfzFJw9zB1sskChnBEj5qKzlT3bPJRB_BB3h7H3AOsrpcsNhZv2mrILe1bw-l_4TWnXBXuWE4_1Y-OvTV54n1y3M6PgLvx2gqmLa5fW1sMggKrAf1A36sUZpFxov8dDpMA9OfOftk5DYvlVh_b5xQzZ6XaeTRD6L9ukLi7cUtZYSQ',
    email: 'marcus.thorne.pe@infra-vdc.com',
    phone: '+44 121 496 0184',
    role: 'Director of VDC & Rail Infrastructure',
    jobId: 'job-1',
    jobTitle: 'Senior BIM Coordinator',
    jobLocation: 'London, UK (Hybrid)',
    location: 'Birmingham, UK',
    discipline: 'BIM / VDC',
    institution: 'University of Cambridge',
    graduationYear: '2021',
    expectedCtc: '£75,000 / yr',
    noticePeriod: '15 Days',
    isAvailableImmediately: false,
    workMode: 'On-site',
    matchScore: 95,
    skills: ['Synchro 4D Phasing', 'Navisworks Manage', 'Civil 3D Alignment API', 'Solibri Rail Rulesets', 'IFC 4x3'],
    experiences: [
      {
        id: 'exp-2',
        roleTitle: 'VDC Lead',
        organizationName: 'Grimshaw Rail Projects',
        contributions: '4D sequencing simulations across 36 route kilometers without kinematic clearance disputes.',
        startDate: '2022-03-01',
        endDate: null,
      },
    ],
    experienceYears: 6.0,
    interviews: [],
    hasScheduledInterview: false,
    resumeFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasResume: true,
    portfolioUrl: 'https://marcusthorne-vdc.com',
    linkedinUrl: 'https://linkedin.com',
    isStarred: true,
    stageStatus: 'shortlisted',
    appliedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    appliedDateLabel: 'Applied 5d ago',
    bio: 'Extensive background in mega-infrastructure rail VDC, 4D simulation phasing, and automated Solibri clash matrices.',
  },
  {
    id: 'app-demo-3',
    applicationId: 'app-demo-3',
    candidateId: 'cand-demo-3',
    studentProfileId: 'sp-demo-3',
    name: 'Kashish Chhajed',
    avatarInitials: 'KC',
    profileImageUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-picture/profiles/ec0e83b8-c5cd-4a8a-8397-06d03893989b/profile_1789122608686.jpg',
    email: 'kashishjain07123@gmail.com',
    phone: '8668856464',
    role: 'Civil & Structural Design Engineer',
    jobId: 'job-2',
    jobTitle: 'Structural Revit Specialist',
    jobLocation: 'Chicago, IL (Hybrid)',
    location: 'Nagpur, India',
    discipline: 'Civil & Structural',
    institution: 'Sant Gadge Baba Amravati University',
    graduationYear: '2025',
    expectedCtc: '₹12,00,000 / yr',
    noticePeriod: 'Immediately',
    isAvailableImmediately: true,
    workMode: 'Remote',
    matchScore: 94,
    skills: ['Rhino', 'AutoCAD', 'Civil 3D', 'Revit Structure', 'Tekla', 'BIM Coordination', 'Grasshopper'],
    experiences: [
      {
        id: 'exp-3',
        roleTitle: 'Structural Intern / Modeler',
        organizationName: 'AEC Infra Design Studio',
        contributions: 'Developed parametric structural detail models and shop drawings for pre-cast elements.',
        startDate: '2024-06-01',
        endDate: '2024-12-01',
      },
    ],
    experienceYears: 2.1,
    interviews: [],
    hasScheduledInterview: false,
    resumeFileUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-resume/profiles/ec0e83b8-c5cd-4a8a-8397-06d03893989b/resume_1789122610513.pdf',
    hasResume: true,
    portfolioUrl: 'https://linkedin.com',
    linkedinUrl: 'https://linkedin.com',
    isStarred: false,
    stageStatus: 'shortlisted',
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    appliedDateLabel: 'Applied 2d ago',
    bio: 'Civil engineer with strong foundations in Rhino, AutoCAD, Civil 3D, and BIM Coordination. Dedicated to sustainable infrastructure.',
  },
  {
    id: 'app-demo-4',
    applicationId: 'app-demo-4',
    candidateId: 'cand-demo-4',
    studentProfileId: 'sp-demo-4',
    name: 'Shona Macleod',
    avatarInitials: 'SM',
    profileImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP5CyjtzMLKSnC5r5U5vXsCb6MKg3Q64rpIG9LVxJuvMWsh4iXKMwW8mVnzTwi5WBW7G80nZYok0MaZKCq5K3ORJ6qmPU5YMmamt0ekLUFXZOsVbuSRs4pRYNOxOuUyIIPynGhAIZwlucOrVij_BaHpGaU67BzmBJcobcs00HVuDU8Oae7g-yXMVlPbe5FPlhvg-91tx0M_dz627iC-m5EVwa6p2T4s4N_BVkBbi3Av3wS7JX_lsS5Ow',
    email: 'shona.macleod@sustain-arch.org',
    phone: '+44 131 496 0773',
    role: 'Parametric Urbanism & Environmental Simulation Lead',
    jobId: 'job-3',
    jobTitle: 'Computational Design Specialist',
    jobLocation: 'San Francisco, CA (Hybrid)',
    location: 'Edinburgh, UK',
    discipline: 'Architecture',
    institution: 'University of Edinburgh',
    graduationYear: '2022',
    expectedCtc: '£64,000 / yr',
    noticePeriod: 'Immediately',
    isAvailableImmediately: true,
    workMode: 'Hybrid',
    matchScore: 92,
    skills: ['Grasshopper Ladybug Tools', 'ClimateStudio Daylight', 'Radiance Solar Simulation', 'Python AEC Carbon Parser', 'Revit'],
    experiences: [
      {
        id: 'exp-4',
        roleTitle: 'Environmental Modeler',
        organizationName: 'Buro Happold',
        contributions: 'Parametric whole-life carbon and thermal comfort scripts optimized for BREEAM credits.',
        startDate: '2023-04-01',
        endDate: null,
      },
    ],
    experienceYears: 3.8,
    interviews: [],
    hasScheduledInterview: false,
    resumeFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    hasResume: true,
    portfolioUrl: 'https://shonamacleod.arch',
    linkedinUrl: 'https://linkedin.com',
    isStarred: false,
    stageStatus: 'shortlisted',
    appliedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    appliedDateLabel: 'Applied 6d ago',
    bio: 'Key specialist for whole-life embodied carbon calculation and microclimate simulations for zero-carbon architecture.',
  },
]

function getInitials(name: string): string {
  if (!name) return 'CA'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function useShortlistedCandidates() {
  const [candidates, setCandidates] = useState<ShortlistedCandidateItem[]>(DEMO_SHORTLISTED)
  const [loading, setLoading] = useState<boolean>(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>('Enterprise Studio')

  // Filters
  const [selectedDiscipline, setSelectedDiscipline] = useState<ShortlistDisciplineCategory>('all')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortOption, setSortOption] = useState<ShortlistSortOption>('match')

  // Checkbox multi-selection
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set())

  // Modals
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false)
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false)
  const [activeCandidateForSchedule, setActiveCandidateForSchedule] = useState<ShortlistedCandidateItem | null>(null)
  const [activeCandidateForMessage, setActiveCandidateForMessage] = useState<ShortlistedCandidateItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3800)
  }, [])

  // 1. Fetch real shortlisted candidates from Supabase
  const loadShortlistedData = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        setCandidates(DEMO_SHORTLISTED)
        setLoading(false)
        return
      }

      // Fetch company record
      const { data: comp } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (comp) {
        setCompanyId(comp.id)
        setCompanyName(comp.name || 'Enterprise Studio')
      }

      // Query via RPC web_get_company_applicants
      const { data: rpcData, error: rpcError } = await supabase.rpc('web_get_company_applicants', {
        p_company_id: comp?.id || null,
      })

      if (rpcError || !rpcData || !rpcData.applicants) {
        console.warn('Could not retrieve candidates via RPC, retaining demo shortlisted profiles:', rpcError?.message)
        setCandidates(DEMO_SHORTLISTED)
        setLoading(false)
        return
      }

      const allApplicants = (rpcData.applicants as Array<Record<string, unknown>>) || []

      // Filter candidates that are shortlisted OR starred
      const shortlistedRows = allApplicants.filter((row) => {
        const status = String(row.status || '').toLowerCase()
        const isStarred = Boolean(row.is_starred)
        return status === 'shortlisted' || (isStarred && status !== 'rejected')
      })

      // If no applicants are shortlisted yet, show demo candidates so tab is never blank
      if (shortlistedRows.length === 0) {
        setCandidates(DEMO_SHORTLISTED)
        setLoading(false)
        return
      }

      const mapped: ShortlistedCandidateItem[] = shortlistedRows.map((row) => {
        const student = (row.candidate as Record<string, unknown>) || {}
        const job = (row.job as Record<string, unknown>) || { title: 'General Applicant', location: 'Remote' }

        const rawSkills = student.skills || []
        const skillsList: string[] = Array.isArray(rawSkills)
          ? rawSkills
              .map((s) => {
                if (typeof s === 'string') return s
                if (typeof s === 'object' && s !== null && 'skill_name' in s) {
                  return (s as { skill_name?: string }).skill_name || ''
                }
                return String(s)
              })
              .filter(Boolean)
          : []

        const rawExperiences = (student.experiences as Array<Record<string, unknown>>) || []
        const experiencesList: StudentExperienceItem[] = rawExperiences.map((exp) => ({
          id: String(exp.id || Math.random()),
          roleTitle: String(exp.role_title || 'Design Specialist'),
          organizationName: String(exp.organization_name || 'Studio'),
          contributions: String(exp.contributions || ''),
          startDate: (exp.start_date as string) || null,
          endDate: (exp.end_date as string) || null,
        }))

        const rawInterviews = (row.interviews as Array<Record<string, unknown>>) || []
        const interviewsList: ApplicantInterviewInfo[] = rawInterviews.map((iv) => ({
          id: String(iv.id),
          interviewDate: String(iv.interview_date || ''),
          interviewTime: String(iv.interview_time || ''),
          interviewType: String(iv.interview_type || 'Technical Review'),
          locationType: String(iv.location_type || 'Video Call'),
          locationValue: String(iv.location_value || ''),
          status: (iv.status as 'scheduled' | 'completed' | 'cancelled') || 'scheduled',
        }))

        const hasScheduled = interviewsList.some((iv) => iv.status === 'scheduled')
        const appliedDate = row.applied_at ? new Date(row.applied_at as string) : new Date()
        const daysAgo = Math.max(0, Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)))
        const daysAgoLabel = daysAgo === 0 ? 'Applied today' : `Applied ${daysAgo}d ago`
        const fullName = String(student.full_name || 'AEC Candidate')
        const rawNotice = String(student.notice_period || 'Immediately')
        const isAvailImmediate = rawNotice.toLowerCase().includes('immediate') || rawNotice.toLowerCase().includes('10 day')

        // Infer discipline
        const rawDiscipline = String(student.discipline || '')
        let discCategory: string = 'Other'
        if (/civil|struct/i.test(rawDiscipline) || /civil|struct/i.test(String(job.title || ''))) {
          discCategory = 'Civil & Structural'
        } else if (/arch/i.test(rawDiscipline) || /arch/i.test(String(job.title || ''))) {
          discCategory = 'Architecture'
        } else if (/bim|vdc|coord/i.test(rawDiscipline) || /bim|vdc/i.test(String(job.title || ''))) {
          discCategory = 'BIM / VDC'
        } else if (/comput|param|script|rhino/i.test(rawDiscipline) || /comput|param/i.test(String(job.title || ''))) {
          discCategory = 'Computational Design'
        }

        const resumeUrl = (student.resume_file_url as string) || undefined

        return {
          id: String(row.id),
          applicationId: String(row.id),
          candidateId: String(row.candidate_id || ''),
          studentProfileId: String(student.id || ''),
          name: fullName,
          avatarInitials: getInitials(fullName),
          profileImageUrl: (student.profile_image_url as string) || undefined,
          email: String(student.email || 'candidate@castallio.com'),
          phone: student.phone ? String(student.phone) : null,
          role: String(job.title || 'Specialist'),
          jobId: (row.job_id as string) || null,
          jobTitle: String(job.title || 'General Opening'),
          jobLocation: String(job.location || 'Remote'),
          location: String(student.location || 'India'),
          discipline: discCategory,
          institution: String(student.institution || 'Engineering Institute'),
          graduationYear: String(student.graduation_year || '2024'),
          expectedCtc: student.expected_ctc ? `₹${student.expected_ctc}` : 'Negotiable',
          noticePeriod: rawNotice,
          isAvailableImmediately: isAvailImmediate,
          workMode: String(student.work_mode || 'Flexible'),
          matchScore: (row.match_score as number) ?? (85 + (skillsList.length % 14)),
          skills: skillsList.length > 0 ? skillsList : ['Revit', 'AutoCAD', 'Civil 3D'],
          experiences: experiencesList,
          experienceYears: Math.max(1, experiencesList.length * 1.5),
          interviews: interviewsList,
          hasScheduledInterview: hasScheduled,
          resumeFileUrl: resumeUrl,
          hasResume: Boolean(resumeUrl),
          portfolioUrl: (student.portfolio_url as string) || undefined,
          linkedinUrl: (student.linkedin_url as string) || undefined,
          isStarred: Boolean(row.is_starred),
          stageStatus: String(row.status || 'shortlisted'),
          appliedAt: (row.applied_at as string) || new Date().toISOString(),
          appliedDateLabel: daysAgoLabel,
          bio: String(student.bio || 'Qualified professional registered on Castallio One.'),
        }
      })

      setCandidates(mapped)
    } catch (err) {
      console.error('Exception loading shortlisted candidates:', err)
      setCandidates(DEMO_SHORTLISTED)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadShortlistedData()
  }, [loadShortlistedData])

  // 2. Dynamic list of jobs shortlisted candidates applied to
  const jobsList: JobFilterItem[] = useMemo(() => {
    const map = new Map<string, { title: string; count: number }>()
    candidates.forEach((c) => {
      const jId = c.jobId || 'general'
      const jTitle = c.jobTitle || 'General Opening'
      if (!map.has(jId)) {
        map.set(jId, { title: jTitle, count: 1 })
      } else {
        const curr = map.get(jId)!
        curr.count += 1
      }
    })
    return Array.from(map.entries()).map(([id, val]) => ({
      id,
      title: val.title,
      count: val.count,
    }))
  }, [candidates])

  // 3. Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        // Discipline tab filter
        if (selectedDiscipline !== 'all' && c.discipline !== selectedDiscipline) {
          return false
        }

        // Job filter
        if (selectedJobId && (c.jobId || 'general') !== selectedJobId) {
          return false
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = c.name.toLowerCase().includes(q)
          const matchRole = c.role.toLowerCase().includes(q)
          const matchJob = c.jobTitle.toLowerCase().includes(q)
          const matchLoc = c.location.toLowerCase().includes(q)
          const matchSkills = c.skills.some((s) => s.toLowerCase().includes(q))
          if (!matchName && !matchRole && !matchJob && !matchLoc && !matchSkills) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        if (sortOption === 'match') return b.matchScore - a.matchScore
        if (sortOption === 'recent') return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        if (sortOption === 'immediate') return (b.isAvailableImmediately ? 1 : 0) - (a.isAvailableImmediately ? 1 : 0)
        if (sortOption === 'experience') return b.experienceYears - a.experienceYears
        if (sortOption === 'name') return a.name.localeCompare(b.name)
        return 0
      })
  }, [candidates, selectedDiscipline, selectedJobId, searchQuery, sortOption])

  // Multi-select helpers
  const isAllSelected = useMemo(() => {
    if (filteredCandidates.length === 0) return false
    return filteredCandidates.every((c) => selectedCandidateIds.has(c.id))
  }, [filteredCandidates, selectedCandidateIds])

  const toggleSelectAll = useCallback(() => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev)
      if (isAllSelected) {
        filteredCandidates.forEach((c) => next.delete(c.id))
      } else {
        filteredCandidates.forEach((c) => next.add(c.id))
      }
      return next
    })
  }, [filteredCandidates, isAllSelected])

  const toggleCandidateSelect = useCallback((id: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // 4. Mutation: Remove from shortlist (reverts status to 'in_review' in PostgreSQL)
  const removeFromShortlist = useCallback(
    async (applicationId: string) => {
      // Optimistic update
      setCandidates((prev) => prev.filter((c) => c.applicationId !== applicationId))
      setSelectedCandidateIds((prev) => {
        const next = new Set(prev)
        next.delete(applicationId)
        return next
      })

      showNotification('Candidate moved back to active review pipeline.')

      try {
        const { error } = await supabase
          .from('job_applications')
          .update({
            status: 'in_review',
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId)

        if (error) {
          console.error('Error updating status in Supabase:', error.message)
        }
      } catch (err) {
        console.error('Error in removeFromShortlist:', err)
      }
    },
    [showNotification]
  )

  // 5. Mutation: Toggle priority star in PostgreSQL
  const toggleStarCandidate = useCallback(
    async (applicationId: string) => {
      const target = candidates.find((c) => c.applicationId === applicationId)
      if (!target) return
      const nextStarred = !target.isStarred

      setCandidates((prev) =>
        prev.map((c) => (c.applicationId === applicationId ? { ...c, isStarred: nextStarred } : c))
      )

      showNotification(nextStarred ? 'Candidate marked as priority star.' : 'Priority star removed.')

      try {
        const { error } = await supabase
          .from('job_applications')
          .update({
            is_starred: nextStarred,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId)

        if (error) {
          console.error('Error toggling star in Supabase:', error.message)
        }
      } catch (err) {
        console.error('Error in toggleStarCandidate:', err)
      }
    },
    [candidates, showNotification]
  )

  // 6. Mutation: Schedule an Interview in PostgreSQL
  const scheduleInterview = useCallback(
    async (payload: ScheduleInterviewPayload): Promise<boolean> => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user

        if (!user) {
          // Demo mode mock insertion
          setCandidates((prev) =>
            prev.map((c) => {
              if (c.applicationId === payload.jobApplicationId) {
                const newIv: ApplicantInterviewInfo = {
                  id: `iv-${Date.now()}`,
                  interviewDate: payload.interviewDate,
                  interviewTime: payload.interviewTime,
                  interviewType: payload.interviewType,
                  locationType: payload.locationType,
                  locationValue: payload.locationValue,
                  status: 'scheduled',
                }
                return {
                  ...c,
                  interviews: [...c.interviews, newIv],
                  hasScheduledInterview: true,
                }
              }
              return c
            })
          )
          showNotification(`Interview scheduled with candidate for ${payload.interviewDate} at ${payload.interviewTime}.`)
          setShowScheduleModal(false)
          setActiveCandidateForSchedule(null)
          return true
        }

        const { data: inserted, error } = await supabase
          .from('interviews')
          .insert({
            candidate_id: payload.candidateId,
            company_id: companyId,
            job_application_id: payload.jobApplicationId,
            interview_date: payload.interviewDate,
            interview_time: payload.interviewTime,
            interview_type: payload.interviewType,
            location_type: payload.locationType,
            location_value: payload.locationValue,
            status: 'scheduled',
          })
          .select()
          .single()

        if (error) {
          console.error('Error scheduling interview in Supabase:', error.message)
          showNotification(`Could not schedule interview: ${error.message}`)
          return false
        }

        // Also update application status to 'scheduled'
        await supabase
          .from('job_applications')
          .update({
            status: 'scheduled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.jobApplicationId)

        // Optimistic local state update
        setCandidates((prev) =>
          prev.map((c) => {
            if (c.applicationId === payload.jobApplicationId) {
              const newIv: ApplicantInterviewInfo = {
                id: inserted.id,
                interviewDate: payload.interviewDate,
                interviewTime: payload.interviewTime,
                interviewType: payload.interviewType,
                locationType: payload.locationType,
                locationValue: payload.locationValue,
                status: 'scheduled',
              }
              return {
                ...c,
                interviews: [...c.interviews, newIv],
                hasScheduledInterview: true,
              }
            }
            return c
          })
        )

        showNotification(`Interview scheduled successfully with candidate for ${payload.interviewDate}.`)
        setShowScheduleModal(false)
        setActiveCandidateForSchedule(null)
        return true
      } catch (err) {
        console.error('Error in scheduleInterview:', err)
        showNotification('An unexpected error occurred while scheduling interview.')
        return false
      }
    },
    [companyId, showNotification]
  )

  // 7. Export Dossier CSV
  const exportDossierCSV = useCallback(() => {
    const exportPool =
      selectedCandidateIds.size > 0
        ? filteredCandidates.filter((c) => selectedCandidateIds.has(c.id))
        : filteredCandidates

    if (exportPool.length === 0) {
      showNotification('No candidates selected for export.')
      return
    }

    const headers = [
      'Candidate ID',
      'Name',
      'Applied Job',
      'Discipline',
      'Location',
      'Experience Years',
      'Notice Period',
      'Expected CTC',
      'Match Score',
      'Top Skills',
      'Resume Link',
      'Portfolio Link',
    ]

    const rows = exportPool.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.jobTitle}"`,
      `"${c.discipline}"`,
      `"${c.location}"`,
      `${c.experienceYears} yrs`,
      `"${c.noticePeriod}"`,
      `"${c.expectedCtc}"`,
      `${c.matchScore}%`,
      `"${c.skills.slice(0, 5).join('; ')}"`,
      `"${c.resumeFileUrl || 'N/A'}"`,
      `"${c.portfolioUrl || 'N/A'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Shortlisted_Candidates_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification(`Downloaded Dossier CSV for ${exportPool.length} shortlisted candidates.`)
  }, [filteredCandidates, selectedCandidateIds, showNotification])

  // 8. Upcoming scheduled interviews list
  const upcomingInterviews = useMemo(() => {
    const list: Array<{
      id: string
      candidateName: string
      role: string
      date: string
      time: string
      type: string
      location: string
    }> = []

    candidates.forEach((c) => {
      c.interviews.forEach((iv) => {
        if (iv.status === 'scheduled') {
          list.push({
            id: iv.id,
            candidateName: c.name,
            role: c.role,
            date: iv.interviewDate,
            time: iv.interviewTime,
            type: iv.interviewType,
            location: iv.locationValue || iv.locationType,
          })
        }
      })
    })

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [candidates])

  // Key metrics
  const metrics = useMemo(() => {
    const total = candidates.length
    const immediate = candidates.filter((c) => c.isAvailableImmediately).length
    const withResume = candidates.filter((c) => c.hasResume).length
    const withInterview = candidates.filter((c) => c.hasScheduledInterview).length
    const avgMatch = total > 0 ? Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / total) : 0

    return {
      total,
      immediate,
      immediatePct: total > 0 ? Math.round((immediate / total) * 100) : 0,
      withResume,
      resumePct: total > 0 ? Math.round((withResume / total) * 100) : 0,
      withInterview,
      avgMatch,
    }
  }, [candidates])

  // Global ⌘K / Ctrl+K listener for quick search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const input = document.getElementById('shortlistSearchInput')
        if (input) input.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    candidates,
    filteredCandidates,
    loading,
    companyName,
    metrics,
    jobsList,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedJobId,
    setSelectedJobId,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    selectedCandidateIds,
    isAllSelected,
    toggleSelectAll,
    toggleCandidateSelect,
    removeFromShortlist,
    toggleStarCandidate,
    scheduleInterview,
    exportDossierCSV,
    upcomingInterviews,
    showMatrixModal,
    setShowMatrixModal,
    showScheduleModal,
    setShowScheduleModal,
    activeCandidateForSchedule,
    setActiveCandidateForSchedule,
    activeCandidateForMessage,
    setActiveCandidateForMessage,
    toastMessage,
    showNotification,
    refreshShortlist: loadShortlistedData,
  }
}
