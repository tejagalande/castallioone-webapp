import { useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'

export interface InterviewSession {
  id: string
  jobApplicationId?: string
  candidateId?: string
  candidateName: string
  candidateRole: string
  candidateAvatar?: string
  companyName: string
  interviewDate: string // YYYY-MM-DD
  interviewTime: string // e.g. "11:00 AM"
  interviewType: 'Technical Review' | 'Portfolio Deep-Dive' | 'Cultural Fit' | 'Final Round'
  locationType: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'In-Person' | 'Video Call'
  locationValue: string
  status: 'scheduled' | 'completed' | 'cancelled'
  interviewerNotes?: string
  score?: number // e.g. 92
  recommendation?: 'Strong Hire' | 'Hire' | 'Hold' | 'Decline'
  durationMinutes: number
  interviewerNames?: string[]
}

export interface CandidateOption {
  id: string
  name: string
  role: string
  avatar?: string
  applicationId?: string
}

export interface ScheduleInterviewPayload {
  candidateName: string
  candidateRole: string
  candidateId?: string
  jobApplicationId?: string
  interviewDate: string
  interviewTime: string
  interviewType: InterviewSession['interviewType']
  locationType: InterviewSession['locationType']
  locationValue: string
  notes?: string
}

export type InterviewTabFilter = 'all' | 'upcoming' | 'needs-feedback' | 'completed' | 'cancelled'

export function useInterviews() {
  const [interviews, setInterviews] = useState<InterviewSession[]>([])
  const [availableCandidates, setAvailableCandidates] = useState<CandidateOption[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<InterviewTabFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Modals
  const [selectedSessionForFeedback, setSelectedSessionForFeedback] = useState<InterviewSession | null>(null)
  const [selectedSessionForReschedule, setSelectedSessionForReschedule] = useState<InterviewSession | null>(null)
  const [isScheduleNewModalOpen, setIsScheduleNewModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }, [])

  // Main data fetcher
  const fetchInterviews = useCallback(async (isMounted = true) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        if (isMounted) {
          setInterviews([])
          setLoading(false)
        }
        return
      }

      // 1. Resolve Company (for employer account)
      let cId = user.user_metadata?.company_id || null
      let cName = user.user_metadata?.company_name || null

      if (!cId) {
        const { data: comp } = await supabase
          .from('companies')
          .select('id, name')
          .or(`owner_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle()
        if (comp) {
          cId = comp.id
          if (!cName) cName = comp.name
        }
      }

      // 2. Resolve Student Profile (for talent account)
      const { data: student } = await supabase
        .from('student_profile')
        .select('id, user_id, full_name, discipline, profile_image_url')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()

      // 3. Find jobs posted by this company or user
      let jobIds: string[] = []
      const jobTitleMap: Record<string, string> = {}
      const { data: postedJobs } = await supabase
        .from('create_job_post')
        .select('id, title, company_id')
        .or(`posted_by.eq.${user.id}${cId ? `,company_id.eq.${cId}` : ''}`)

      if (postedJobs && postedJobs.length > 0) {
        jobIds = postedJobs.map((j) => j.id)
        postedJobs.forEach((j) => {
          jobTitleMap[j.id] = j.title
        })
      }

      // 4. Find job applications related to these jobs or submitted by this student
      const appIds: string[] = []
      const appsCandidateMap: Record<string, string> = {}
      const appsJobMap: Record<string, string> = {}

      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select('id, job_id, candidate_id')
          .in('job_id', jobIds)

        if (apps && apps.length > 0) {
          apps.forEach((a) => {
            appIds.push(a.id)
            appsCandidateMap[a.id] = a.candidate_id
            appsJobMap[a.id] = a.job_id
          })
        }
      }

      if (student) {
        const { data: studentApps } = await supabase
          .from('job_applications')
          .select('id, job_id, candidate_id')
          .or(`candidate_id.eq.${user.id},candidate_id.eq.${student.id}`)

        if (studentApps && studentApps.length > 0) {
          studentApps.forEach((sa) => {
            if (!appIds.includes(sa.id)) appIds.push(sa.id)
            appsCandidateMap[sa.id] = sa.candidate_id
            appsJobMap[sa.id] = sa.job_id
          })
        }
      }

      // 5. Query interviews
      const orClauses: string[] = []
      if (cId) orClauses.push(`company_id.eq.${cId}`)
      if (appIds.length > 0) orClauses.push(`job_application_id.in.(${appIds.join(',')})`)
      orClauses.push(`candidate_id.eq.${user.id}`)
      if (student?.id) orClauses.push(`candidate_id.eq.${student.id}`)

      let ivsQuery = supabase
        .from('interviews')
        .select('*')
        .order('interview_date', { ascending: false })

      if (orClauses.length > 0) {
        ivsQuery = ivsQuery.or(orClauses.join(','))
      }

      const { data: dbIvs, error: ivsError } = await ivsQuery

      if (ivsError) {
        console.error('Error fetching interviews from Supabase:', ivsError)
      }

      const foundInterviews = dbIvs || []

      // 6. Gather all unique candidate IDs & application IDs to resolve names & avatars
      const candidateIdSet = new Set<string>()
      const missingAppIdSet = new Set<string>()
      const companyIdSet = new Set<string>()

      foundInterviews.forEach((iv) => {
        if (iv.candidate_id) candidateIdSet.add(iv.candidate_id)
        if (iv.job_application_id) {
          missingAppIdSet.add(iv.job_application_id)
          if (appsCandidateMap[iv.job_application_id]) {
            candidateIdSet.add(appsCandidateMap[iv.job_application_id])
          }
        }
        if (iv.company_id) companyIdSet.add(iv.company_id)
      })

      // Resolve unmapped applications
      const unmappedAppIds = Array.from(missingAppIdSet).filter((id) => !appsJobMap[id])
      if (unmappedAppIds.length > 0) {
        const { data: unmappedApps } = await supabase
          .from('job_applications')
          .select('id, job_id, candidate_id')
          .in('id', unmappedAppIds)

        if (unmappedApps && unmappedApps.length > 0) {
          const missingJobIds: string[] = []
          unmappedApps.forEach((a) => {
            appsCandidateMap[a.id] = a.candidate_id
            appsJobMap[a.id] = a.job_id
            if (a.candidate_id) candidateIdSet.add(a.candidate_id)
            if (a.job_id && !jobTitleMap[a.job_id]) missingJobIds.push(a.job_id)
          })

          if (missingJobIds.length > 0) {
            const { data: moreJobs } = await supabase
              .from('create_job_post')
              .select('id, title')
              .in('id', missingJobIds)
            if (moreJobs) {
              moreJobs.forEach((j) => {
                jobTitleMap[j.id] = j.title
              })
            }
          }
        }
      }

      // Query candidate profiles
      const candidatesMap: Record<string, { name: string; avatar?: string; discipline?: string }> = {}
      const candidateIdList = Array.from(candidateIdSet)
      if (candidateIdList.length > 0) {
        const { data: students } = await supabase
          .from('student_profile')
          .select('id, user_id, full_name, profile_image_url, discipline')
          .or(`id.in.(${candidateIdList.join(',')}),user_id.in.(${candidateIdList.join(',')})`)

        if (students) {
          students.forEach((st) => {
            const info = {
              name: st.full_name || 'Candidate',
              avatar: st.profile_image_url || undefined,
              discipline: st.discipline || 'Candidate',
            }
            if (st.id) candidatesMap[st.id] = info
            if (st.user_id) candidatesMap[st.user_id] = info
          })
        }
      }

      // Query company names
      const companyMap: Record<string, string> = {}
      const companyIdList = Array.from(companyIdSet)
      if (companyIdList.length > 0) {
        const { data: comps } = await supabase
          .from('companies')
          .select('id, name')
          .in('id', companyIdList)

        if (comps) {
          comps.forEach((c) => {
            if (c.name) companyMap[c.id] = c.name
          })
        }
      }

      // Map into InterviewSession[]
      const mapped: InterviewSession[] = foundInterviews.map((iv) => {
        const candId = iv.candidate_id || (iv.job_application_id ? appsCandidateMap[iv.job_application_id] : null)
        const candInfo = candId ? candidatesMap[candId] : null
        const jId = iv.job_application_id ? appsJobMap[iv.job_application_id] : null
        const roleTitle = (jId && jobTitleMap[jId]) || candInfo?.discipline || 'Applied Candidate'
        const compTitle = (iv.company_id && companyMap[iv.company_id]) || cName || 'Enterprise Studio'

        return {
          id: iv.id,
          jobApplicationId: iv.job_application_id || undefined,
          candidateId: iv.candidate_id || undefined,
          candidateName: candInfo?.name || iv.candidate_name || 'Applicant Candidate',
          candidateRole: roleTitle,
          candidateAvatar: candInfo?.avatar,
          companyName: compTitle,
          interviewDate: iv.interview_date,
          interviewTime: iv.interview_time || '10:00 AM',
          interviewType: (iv.interview_type as InterviewSession['interviewType']) || 'Technical Review',
          locationType: (iv.location_type as InterviewSession['locationType']) || 'Google Meet',
          locationValue: iv.location_value || 'https://meet.google.com/cas-interview',
          status: (iv.status as InterviewSession['status']) || 'scheduled',
          durationMinutes: 45,
          interviewerNames: ['Interview Panel'],
          interviewerNotes: iv.notes || undefined,
          score: iv.score ?? undefined,
          recommendation: iv.recommendation as InterviewSession['recommendation'] | undefined,
        }
      })

      // Also build available candidates for quick selection in modal
      const candidateOptions: CandidateOption[] = []
      Object.entries(appsCandidateMap).forEach(([appId, cIdVal]) => {
        const cInfo = candidatesMap[cIdVal]
        const jId = appsJobMap[appId]
        if (cInfo) {
          candidateOptions.push({
            id: cIdVal,
            name: cInfo.name,
            role: (jId && jobTitleMap[jId]) || cInfo.discipline || 'Candidate',
            avatar: cInfo.avatar,
            applicationId: appId,
          })
        }
      })

      if (isMounted) {
        setInterviews(mapped)
        setAvailableCandidates(candidateOptions)
      }
    } catch (err) {
      console.error('Failed to load interviews:', err)
      if (isMounted) setInterviews([])
    } finally {
      if (isMounted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      await fetchInterviews(isMounted)
    }
    void loadData()
    return () => {
      isMounted = false
    }
  }, [fetchInterviews])

  // Schedule New Interview Mutation
  const handleScheduleNewInterview = useCallback(
    async (payload: ScheduleInterviewPayload): Promise<boolean> => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user) {
          showToast('Please sign in to schedule an interview.')
          return false
        }

        // 1. Resolve company
        let cId = user.user_metadata?.company_id
        let cName = user.user_metadata?.company_name
        if (!cId) {
          const { data: comp } = await supabase
            .from('companies')
            .select('id, name')
            .or(`owner_id.eq.${user.id},id.eq.${user.id}`)
            .maybeSingle()
          if (comp) {
            cId = comp.id
            if (!cName) cName = comp.name
          }
        }

        // 2. Resolve matching candidate profile if ID not provided
        let matchedCandidateId = payload.candidateId || null
        let matchedAvatar: string | undefined = undefined

        if (!matchedCandidateId && payload.candidateName.trim()) {
          const { data: st } = await supabase
            .from('student_profile')
            .select('id, user_id, full_name, profile_image_url')
            .ilike('full_name', payload.candidateName.trim())
            .maybeSingle()

          if (st) {
            matchedCandidateId = st.user_id || st.id
            matchedAvatar = st.profile_image_url || undefined
          }
        }

        const insertRecord = {
          company_id: cId || null,
          candidate_id: matchedCandidateId,
          job_application_id: payload.jobApplicationId || null,
          interview_date: payload.interviewDate,
          interview_time: payload.interviewTime,
          interview_type: payload.interviewType,
          location_type: payload.locationType,
          location_value: payload.locationValue,
          status: 'scheduled',
          notes: payload.notes || undefined,
        }

        const { data: inserted, error } = await supabase
          .from('interviews')
          .insert(insertRecord)
          .select()
          .single()

        if (error) {
          console.error('Failed to schedule interview in Supabase:', error)
          showToast(`Failed to schedule interview: ${error.message}`)
          return false
        }

        const newSession: InterviewSession = {
          id: inserted?.id || `iv-${Date.now()}`,
          jobApplicationId: payload.jobApplicationId,
          candidateId: matchedCandidateId || undefined,
          candidateName: payload.candidateName,
          candidateRole: payload.candidateRole,
          candidateAvatar: matchedAvatar,
          companyName: cName || 'Enterprise Studio',
          interviewDate: payload.interviewDate,
          interviewTime: payload.interviewTime,
          interviewType: payload.interviewType,
          locationType: payload.locationType,
          locationValue: payload.locationValue,
          status: 'scheduled',
          durationMinutes: 45,
          interviewerNames: ['Interview Panel'],
          interviewerNotes: payload.notes,
        }

        setInterviews((prev) => [newSession, ...prev])
        showToast(`Interview successfully scheduled with ${payload.candidateName}!`)
        setIsScheduleNewModalOpen(false)
        return true
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error('Schedule error:', err)
        showToast(`Error scheduling interview: ${errorMsg || 'Unknown error'}`)
        return false
      }
    },
    [showToast]
  )

  // Reschedule an interview
  const handleReschedule = useCallback(
    async (sessionId: string, newDate: string, newTime: string, reason?: string) => {
      setInterviews((prev) =>
        prev.map((iv) => {
          if (iv.id === sessionId) {
            const updatedNotes = reason
              ? `${iv.interviewerNotes ? iv.interviewerNotes + ' • ' : ''}[Rescheduled]: ${reason}`
              : iv.interviewerNotes
            return { ...iv, interviewDate: newDate, interviewTime: newTime, interviewerNotes: updatedNotes }
          }
          return iv
        })
      )

      try {
        const updatePayload: Record<string, unknown> = {
          interview_date: newDate,
          interview_time: newTime,
          updated_at: new Date().toISOString(),
        }
        if (reason) {
          updatePayload.notes = reason
        }
        const { error } = await supabase
          .from('interviews')
          .update(updatePayload)
          .eq('id', sessionId)

        if (error) {
          console.error('Failed to update interview in DB:', error)
          showToast(`Warning: Rescheduled locally (${error.message})`)
          return
        }
      } catch (err) {
        console.error('Error updating interview in DB:', err)
      }

      showToast(`Interview rescheduled to ${newDate} at ${newTime}.`)
      setSelectedSessionForReschedule(null)
    },
    [showToast]
  )

  // Submit Feedback / Evaluation
  const handleSaveEvaluation = useCallback(
    async (sessionId: string, score: number, recommendation: InterviewSession['recommendation'], notes: string) => {
      setInterviews((prev) =>
        prev.map((iv) =>
          iv.id === sessionId
            ? { ...iv, status: 'completed', score, recommendation, interviewerNotes: notes }
            : iv
        )
      )

      try {
        const { error } = await supabase
          .from('interviews')
          .update({
            status: 'completed',
            score,
            recommendation,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sessionId)

        if (error) {
          console.error('Failed to save evaluation in DB:', error)
        }
      } catch (err) {
        console.error('Error saving interview evaluation:', err)
      }

      showToast('Interview scorecard and evaluation saved successfully.')
      setSelectedSessionForFeedback(null)
    },
    [showToast]
  )

  // Cancel Interview
  const handleCancelInterview = useCallback(
    async (sessionId: string) => {
      setInterviews((prev) =>
        prev.map((iv) => (iv.id === sessionId ? { ...iv, status: 'cancelled' } : iv))
      )

      try {
        const { error } = await supabase
          .from('interviews')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', sessionId)

        if (error) {
          console.error('Failed to cancel interview in DB:', error)
        }
      } catch (err) {
        console.error('Error cancelling interview:', err)
      }

      showToast('Interview round marked as cancelled.')
    },
    [showToast]
  )

  // Calendar .ics export
  const handleSyncCalendar = useCallback(() => {
    const upcoming = interviews.filter((i) => i.status === 'scheduled')
    if (upcoming.length === 0) {
      showToast('No upcoming scheduled interviews to export.')
      return
    }

    const events = upcoming
      .map(
        (iv) => `BEGIN:VEVENT
SUMMARY:Interview: ${iv.candidateName} - ${iv.candidateRole}
DESCRIPTION:Format: ${iv.interviewType} | Mode: ${iv.locationType} (${iv.locationValue})
LOCATION:${iv.locationValue}
STATUS:CONFIRMED
END:VEVENT`
      )
      .join('\n')

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Castallio One//Employer Interviews Calendar//EN
${events}
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'Castallio_Interviews_Schedule.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Interview calendar exported as Castallio_Interviews_Schedule.ics')
  }, [interviews, showToast])

  // Filtered interview list
  const filteredInterviews = useMemo(() => {
    return interviews.filter((iv) => {
      if (activeTab === 'upcoming' && iv.status !== 'scheduled') return false
      if (activeTab === 'completed' && iv.status !== 'completed') return false
      if (activeTab === 'cancelled' && iv.status !== 'cancelled') return false
      if (activeTab === 'needs-feedback' && (iv.status !== 'completed' || iv.score !== undefined)) return false

      if (formatFilter !== 'all' && iv.locationType !== formatFilter) return false
      if (roleFilter !== 'all' && !iv.candidateRole.toLowerCase().includes(roleFilter.toLowerCase())) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = iv.candidateName.toLowerCase().includes(q)
        const matchRole = iv.candidateRole.toLowerCase().includes(q)
        const matchType = iv.interviewType.toLowerCase().includes(q)
        if (!matchName && !matchRole && !matchType) return false
      }

      return true
    })
  }, [interviews, activeTab, formatFilter, roleFilter, searchQuery])

  // KPI Calculations
  const kpis = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const upcoming = interviews.filter((i) => i.status === 'scheduled')
    const today = upcoming.filter((i) => i.interviewDate === todayStr || i.interviewDate.includes('today'))
    const completed = interviews.filter((i) => i.status === 'completed')
    const needsFeedback = completed.filter((i) => !i.score)

    return {
      upcomingCount: upcoming.length,
      todayCount: today.length,
      needsFeedbackCount: needsFeedback.length,
      completedCount: completed.length,
    }
  }, [interviews])

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const set = new Set<string>()
    interviews.forEach((i) => set.add(i.candidateRole))
    return Array.from(set)
  }, [interviews])

  return {
    interviews,
    filteredInterviews,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    formatFilter,
    setFormatFilter,
    roleFilter,
    setRoleFilter,
    uniqueRoles,
    kpis,
    availableCandidates,
    selectedSessionForFeedback,
    setSelectedSessionForFeedback,
    selectedSessionForReschedule,
    setSelectedSessionForReschedule,
    isScheduleNewModalOpen,
    setIsScheduleNewModalOpen,
    toastMessage,
    showToast,
    handleScheduleNewInterview,
    handleReschedule,
    handleSaveEvaluation,
    handleCancelInterview,
    handleSyncCalendar,
    refreshInterviews: fetchInterviews,
  }
}
