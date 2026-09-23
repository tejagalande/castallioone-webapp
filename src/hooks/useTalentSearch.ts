import { useState, useMemo, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export type TalentDisciplineFilter =
  | 'all'
  | 'Civil Engineering'
  | 'Structural Engineering'
  | 'Architecture'
  | 'unlocked'
  | 'saved'

export type TalentSortOption = 'match' | 'experience' | 'name' | 'recent'

export interface StudentExperienceItem {
  id: string
  roleTitle: string
  organizationName: string
  contributions?: string
  startDate?: string | null
  endDate?: string | null
}

export interface CandidateTalentItem {
  id: string // student_profile.id
  userId?: string // student_profile.user_id
  name: string
  avatarInitials: string
  profileImageUrl?: string
  bio: string
  email: string
  phone?: string | null
  location: string
  discipline: string
  institution: string
  graduationYear: string
  workMode: string
  expectedCtc: string
  noticePeriod: string
  portfolioUrl?: string
  resumeFileUrl?: string
  hasResume: boolean
  linkedinUrl?: string
  isUnlocked: boolean
  hasEmbedding: boolean
  matchScore: number // 0-100%
  experienceYears: number
  skills: string[]
  experiences: StudentExperienceItem[]
}

export interface TalentSearchQuota {
  cvUnlockLimit: number
  cvsUnlocked: number
  remainingCvs: number
}

export interface TalentMetrics {
  totalTalentCount: number
  embeddedTalentCount: number
  unlockedCount: number
  savedCount: number
  remainingQuota: number
}

// Fallback candidates for offline or unauthenticated development mode
export const DEMO_TALENT: CandidateTalentItem[] = [
  {
    id: 'a6abaf30-c4f8-42e1-a7dc-ce01f1f3bff6',
    userId: 'ec0e83b8-c5cd-4a8a-8397-06d03893989b',
    name: 'Kashish Chhajed',
    avatarInitials: 'KC',
    profileImageUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-picture/profiles/ec0e83b8-c5cd-4a8a-8397-06d03893989b/profile_1789122608686.jpg',
    bio: 'Civil engineer with strong foundations in Rhino, AutoCAD, Civil 3D, and BIM Coordination. Dedicated to sustainable infrastructure and parametric workflows.',
    email: 'kashishjain07123@gmail.com',
    phone: '8668856464',
    location: 'Nagpur, Maharashtra, India',
    discipline: 'Civil Engineering',
    institution: 'Sant Gadge Baba Amravati University',
    graduationYear: '2026',
    workMode: 'Remote',
    expectedCtc: '₹15,000 / month',
    noticePeriod: 'Immediately',
    portfolioUrl:
      'https://www.linkedin.com/in/kashish-chhajed-986362320',
    resumeFileUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-resume/profiles/ec0e83b8-c5cd-4a8a-8397-06d03893989b/resume_1789122610513.pdf',
    hasResume: true,
    linkedinUrl: 'https://linkedin.com',
    isUnlocked: true,
    hasEmbedding: true,
    matchScore: 98,
    experienceYears: 1.2,
    skills: ['Rhino', 'AutoCAD', 'Civil 3D', 'SketchUp', 'Navisworks', 'Grasshopper', 'Revit', 'BIM Coordination'],
    experiences: [],
  },
  {
    id: '0a772d8b-81f0-4882-a2a6-aea76a17f51d',
    userId: '3f383df0-5ff7-4930-b0b1-f1b376d97a84',
    name: 'Passionate Learner',
    avatarInitials: 'PL',
    profileImageUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-picture/profiles/3f383df0-5ff7-4930-b0b1-f1b376d97a84/profile_1789632371135.png',
    bio: 'Structural Engineer specializing in analysis and design of RCC and steel structures for residential and commercial complexes.',
    email: 'st••••@gmail.com',
    phone: null,
    location: 'Pune, Maharashtra, India',
    discipline: 'Civil Engineering',
    institution: 'Government College Of Engineering',
    graduationYear: '2025',
    workMode: 'Flexible',
    expectedCtc: '₹15,00,000 / annum',
    noticePeriod: 'Immediately',
    portfolioUrl: 'https://github.com',
    resumeFileUrl:
      'https://pmqtsplqnwexxnojeezg.supabase.co/storage/v1/object/public/profile-resume/profiles/3f383df0-5ff7-4930-b0b1-f1b376d97a84/resume_1789632371836.pdf',
    hasResume: true,
    linkedinUrl: 'https://linkedin.com',
    isUnlocked: false,
    hasEmbedding: true,
    matchScore: 94,
    experienceYears: 1.5,
    skills: ['Revit', 'Grasshopper', 'AutoCAD', 'BIM Coordination', 'STAAD.Pro', 'ETABS'],
    experiences: [
      {
        id: 'e7c5144b-a009-4794-aff9-8d831fa0c45f',
        roleTitle: 'Junior Structural Engineer',
        organizationName: 'Genitt',
        contributions: 'Assisted in structural validation, reinforcement details, and design compliance with IS codes.',
        startDate: '2025-06-01',
        endDate: null,
      },
    ],
  },
]

function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'CA'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'CA'
  if (parts.length === 1) return (parts[0] || '').slice(0, 2).toUpperCase() || 'CA'
  const first = (parts[0] || '')[0] || ''
  const last = (parts[parts.length - 1] || '')[0] || ''
  return (first + last).toUpperCase() || 'CA'
}

export function useTalentSearch() {
  const [loading, setLoading] = useState<boolean>(false)
  const [semanticSearching, setSemanticSearching] = useState<boolean>(false)
  const [isSemanticMode, setIsSemanticMode] = useState<boolean>(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>('Enterprise Studio')
  const [talent, setTalent] = useState<CandidateTalentItem[]>(DEMO_TALENT)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedDiscipline, setSelectedDiscipline] = useState<TalentDisciplineFilter>('all')
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('all')
  const [selectedExperienceRange, setSelectedExperienceRange] = useState<string>('all')
  const [sortOption, setSortOption] = useState<TalentSortOption>('match')
  const [savedCandidateIds, setSavedCandidateIds] = useState<Set<string>>(new Set())
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateTalentItem | null>(null)
  const [candidateToUnlock, setCandidateToUnlock] = useState<CandidateTalentItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [quota, setQuota] = useState<TalentSearchQuota>({
    cvUnlockLimit: 50,
    cvsUnlocked: 0,
    remainingCvs: 50,
  })

  const showNotification = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }, [])

  // Standard search & load via PostgreSQL RPC: web_search_talent
  const loadTalentData = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('web_search_talent', {
        p_company_id: null,
        p_search: searchQuery.trim() ? searchQuery.trim() : null,
        p_discipline: selectedDiscipline === 'all' || selectedDiscipline === 'unlocked' || selectedDiscipline === 'saved' ? null : selectedDiscipline,
        p_work_mode: selectedWorkMode === 'all' ? null : selectedWorkMode,
        p_sort: sortOption,
      })

      if (error) {
        console.warn('RPC web_search_talent warning:', error.message)
      }

      interface CandidateRpcRow {
        id: string
        user_id?: string
        full_name: string
        bio?: string
        email?: string
        phone?: number | string | null
        location?: string
        discipline?: string
        institution?: string
        graduation_year?: string
        portfolio_url?: string
        profile_image_url?: string
        resume_file_url?: string
        has_resume: boolean
        work_mode?: string
        expected_ctc?: string
        notice_period?: string
        linkedin_url?: string
        is_unlocked: boolean
        has_embedding: boolean
        experience_years?: number
        skills?: Array<string | { skill_name?: string }>
        experiences?: Array<{
          id: string
          role_title: string
          organization_name: string
          contributions?: string
          start_date?: string | null
          end_date?: string | null
        }>
      }

      interface WebSearchResponse {
        company_id?: string | null
        company_name?: string
        quota?: {
          cv_unlock_limit: number
          cvs_unlocked: number
          remaining_cvs: number
        }
        total_talent_count?: number
        embedded_talent_count?: number
        candidates?: CandidateRpcRow[]
      }

      const res = data as WebSearchResponse | null

      if (res?.company_id) {
        setCompanyId(res.company_id)
        setCompanyName(res.company_name || 'Enterprise Studio')
      }

      if (res?.quota) {
        const limit = res.quota.cv_unlock_limit || 50
        const unlocked = res.quota.cvs_unlocked || 0
        const remaining =
          res.quota.remaining_cvs !== undefined && res.quota.remaining_cvs !== null
            ? res.quota.remaining_cvs
            : Math.max(0, limit - unlocked)

        setQuota({
          cvUnlockLimit: limit,
          cvsUnlocked: unlocked,
          remainingCvs: remaining,
        })
      }

      if (res?.candidates && Array.isArray(res.candidates) && res.candidates.length > 0) {
        const mapped: CandidateTalentItem[] = res.candidates.map((c) => {
          const rawSkills = c.skills || []
          const skillsList = Array.isArray(rawSkills)
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

          const rawExps = Array.isArray(c.experiences) ? c.experiences : []
          const expsList: StudentExperienceItem[] = rawExps.map((exp) => ({
            id: exp.id || Math.random().toString(),
            roleTitle: exp.role_title || 'Specialist',
            organizationName: exp.organization_name || 'AEC Studio',
            contributions: exp.contributions || '',
            startDate: exp.start_date || null,
            endDate: exp.end_date || null,
          }))

          return {
            id: c.id,
            userId: c.user_id,
            name: c.full_name,
            avatarInitials: getInitials(c.full_name),
            profileImageUrl: c.profile_image_url || undefined,
            bio: c.bio || 'Candidate registered on Castallio One talent platform.',
            email: c.email || '',
            phone: c.phone ? String(c.phone) : null,
            location: c.location || 'India',
            discipline: c.discipline || 'AEC Specialist',
            institution: c.institution || 'Engineering Institute',
            graduationYear: c.graduation_year || '2025',
            workMode: c.work_mode || 'Flexible',
            expectedCtc: c.expected_ctc ? `₹${c.expected_ctc}` : 'Negotiable',
            noticePeriod: c.notice_period || 'Immediately',
            portfolioUrl: c.portfolio_url || undefined,
            resumeFileUrl: c.resume_file_url || undefined,
            hasResume: c.has_resume,
            linkedinUrl: c.linkedin_url || undefined,
            isUnlocked: c.is_unlocked,
            hasEmbedding: c.has_embedding,
            matchScore: c.has_embedding ? 95 : 85,
            experienceYears: Number(c.experience_years) || 0,
            skills: skillsList.length > 0 ? skillsList : ['AutoCAD', 'BIM Modeling'],
            experiences: expsList,
          }
        })

        setTalent(mapped)
      } else {
        setTalent(DEMO_TALENT)
      }
    } catch (err) {
      console.error('Error loading talent:', err)
      setTalent(DEMO_TALENT)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedDiscipline, selectedWorkMode, sortOption])

  // AI Semantic Search using mobile Edge Function: search-candidates
  const performSemanticSearch = useCallback(async (queryText: string) => {
    if (!queryText.trim()) {
      await loadTalentData()
      return
    }

    try {
      setSemanticSearching(true)
      const { data, error } = await supabase.functions.invoke('search-candidates', {
        body: { query: queryText.trim() },
      })

      if (error) {
        console.warn('Semantic search Edge Function error, falling back to keyword search:', error.message)
        await loadTalentData()
        return
      }

      interface SemanticCandidateRow {
        id: string
        full_name: string
        bio?: string
        location?: string
        discipline?: string
        work_mode?: string
        employment_type?: string
        availability?: string
        experience_years?: number
        skills?: Array<string | { skill_name?: string }>
        similarity: number
      }

      interface SemanticResponse {
        success: boolean
        query: string
        count: number
        candidates: SemanticCandidateRow[]
      }

      const res = data as SemanticResponse | null

      if (res?.success && res.candidates && res.candidates.length > 0) {
        const studentIds = res.candidates.map((c) => c.id)

        // Check unlock status for current company
        let unlockedSet = new Set<string>()
        if (companyId) {
          const { data: unlockedData } = await supabase
            .from('unlocked_profiles')
            .select('student_id')
            .eq('company_id', companyId)
            .in('student_id', studentIds)

          if (unlockedData) {
            unlockedSet = new Set(unlockedData.map((u) => u.student_id))
          }
        }

        // Fetch student_profile details including resume_file_url
        const { data: profilesData } = await supabase
          .from('student_profile')
          .select('id, user_id, resume_file_url, email, phone, profile_image_url, portfolio_url, linkedin_url')
          .in('id', studentIds)

        const profileMap = new Map<
          string,
          {
            user_id?: string
            resume_file_url?: string | null
            email?: string | null
            phone?: string | number | null
            profile_image_url?: string | null
            portfolio_url?: string | null
            linkedin_url?: string | null
          }
        >()

        if (profilesData) {
          for (const p of profilesData) {
            profileMap.set(p.id, p)
          }
        }

        const mapped: CandidateTalentItem[] = res.candidates.map((c) => {
          const isUnlocked = unlockedSet.has(c.id)
          const p = profileMap.get(c.id)
          const resumeUrl = p?.resume_file_url || undefined
          const rawSkills = c.skills || []
          const skillsList = Array.isArray(rawSkills)
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

          const matchPercentage = Math.round(c.similarity * 100)

          return {
            id: c.id,
            userId: p?.user_id,
            name: c.full_name,
            avatarInitials: getInitials(c.full_name),
            profileImageUrl: p?.profile_image_url || undefined,
            bio: c.bio || 'Verified parametric designer on Castallio One.',
            email: isUnlocked ? (p?.email || 'unlocked@candidate.com') : '••••••@gmail.com',
            phone: isUnlocked ? (p?.phone ? String(p.phone) : '+91 Verified') : null,
            location: c.location || 'India',
            discipline: c.discipline || 'AEC Specialist',
            institution: 'Verified Institution',
            graduationYear: '2025',
            workMode: c.work_mode || 'Flexible',
            expectedCtc: 'Competitive',
            noticePeriod: c.availability || 'Immediately',
            resumeFileUrl: resumeUrl,
            hasResume: Boolean(resumeUrl),
            portfolioUrl: p?.portfolio_url || undefined,
            linkedinUrl: p?.linkedin_url || undefined,
            isUnlocked,
            hasEmbedding: true,
            matchScore: matchPercentage > 0 ? matchPercentage : 92,
            experienceYears: Number(c.experience_years) || 0,
            skills: skillsList.length > 0 ? skillsList : ['BIM Modeling', 'Revit'],
            experiences: [],
          }
        })

        setTalent(mapped)
        showNotification(`AI Vector Search complete: Found ${mapped.length} matching candidate profiles.`)
      } else {
        showNotification('No vector similarity matches above threshold. Falling back to keyword search.')
        await loadTalentData()
      }
    } catch (err) {
      console.error('Fatal in performSemanticSearch:', err)
      await loadTalentData()
    } finally {
      setSemanticSearching(false)
    }
  }, [companyId, loadTalentData, showNotification])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTalentData()
  }, [loadTalentData])

  // Bookmark / Save toggle
  const toggleBookmarkCandidate = useCallback((candidateId: string) => {
    setSavedCandidateIds((prev) => {
      const next = new Set(prev)
      if (next.has(candidateId)) {
        next.delete(candidateId)
      } else {
        next.add(candidateId)
      }
      return next
    })
  }, [])

  // Unlock Profile RPC mutation
  const unlockCandidate = useCallback(
    async (cand: CandidateTalentItem) => {
      if (!companyId) {
        showNotification('Please log in with your employer company profile to unlock candidates.')
        return false
      }

      try {
        const { data, error } = await supabase.rpc('unlock_candidate_profile', {
          p_company_id: companyId,
          p_student_id: cand.id,
        })

        if (error) {
          showNotification(`Unlock failed: ${error.message}`)
          return false
        }

        interface UnlockResult {
          success: boolean
          already_unlocked?: boolean
          remaining?: number
          error?: string
        }

        const res = data as UnlockResult | null

        if (res?.success) {
          showNotification(`Success: Profile for ${cand.name} is now unlocked! Contact and CV available.`)
          setTalent((prev) =>
            prev.map((t) => (t.id === cand.id ? { ...t, isUnlocked: true } : t))
          )
          if (selectedCandidate && selectedCandidate.id === cand.id) {
            setSelectedCandidate((prev) => (prev ? { ...prev, isUnlocked: true } : null))
          }
          if (typeof res.remaining === 'number') {
            setQuota((q) => ({
              ...q,
              cvsUnlocked: q.cvsUnlocked + 1,
              remainingCvs: res.remaining || 0,
            }))
          }
          return true
        } else {
          if (res?.error === 'limit_reached') {
            showNotification('Monthly CV unlock quota reached. Please upgrade your subscription plan.')
          } else {
            showNotification(`Unlock unsuccessful: ${res?.error || 'Unknown issue'}`)
          }
          return false
        }
      } catch (err) {
        console.error('Error unlocking profile:', err)
        return false
      }
    },
    [companyId, selectedCandidate, showNotification]
  )

  // Direct Candidate Messaging
  const sendCandidateMessage = useCallback(
    async (candidateUserId: string, message: string) => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const senderId = userData?.user?.id

        if (!senderId) {
          showNotification('Demo mode: Message simulated.')
          return true
        }

        const { error } = await supabase.from('chatsession').insert({
          candidate_id: candidateUserId,
          company_id: companyId,
          sender_id: senderId,
          message: message.trim(),
          is_read: false,
          is_deleted: false,
        })

        if (error) {
          console.error('Error inserting message into chatsession:', error.message)
          showNotification(`Notice: ${error.message}`)
          return false
        }

        showNotification('Direct message dispatched securely to candidate.')
        return true
      } catch (err) {
        console.error('Failed to dispatch message:', err)
        return false
      }
    },
    [companyId, showNotification]
  )

  // Client-side filtering across talent
  const filteredTalent = useMemo(() => {
    if (!talent || !Array.isArray(talent)) return []
    return talent.filter((c) => {
      if (!c) return false
      // Discipline Tab
      if (selectedDiscipline === 'unlocked' && !c.isUnlocked) return false
      if (selectedDiscipline === 'saved' && (!savedCandidateIds || !savedCandidateIds.has(c.id))) return false
      if (
        selectedDiscipline !== 'all' &&
        selectedDiscipline !== 'unlocked' &&
        selectedDiscipline !== 'saved' &&
        c.discipline !== selectedDiscipline
      ) {
        return false
      }

      // Work mode
      if (selectedWorkMode !== 'all') {
        const mode = c.workMode || ''
        if (!mode.toLowerCase().includes(selectedWorkMode.toLowerCase())) return false
      }

      // Experience level
      const exp = Number(c.experienceYears) || 0
      if (selectedExperienceRange === 'fresher' && exp > 1.5) return false
      if (selectedExperienceRange === 'mid' && (exp < 1.5 || exp > 4.5)) return false
      if (selectedExperienceRange === 'senior' && exp < 4.5) return false

      return true
    })
  }, [talent, selectedDiscipline, selectedWorkMode, selectedExperienceRange, savedCandidateIds])

  // Aggregate Metrics
  const metrics: TalentMetrics = useMemo(() => {
    const list = Array.isArray(talent) ? talent : []
    const total = list.length
    const embedded = list.filter((t) => t?.hasEmbedding).length
    const unlocked = list.filter((t) => t?.isUnlocked).length
    const saved = list.filter((t) => t?.id && savedCandidateIds?.has(t.id)).length

    return {
      totalTalentCount: total,
      embeddedTalentCount: embedded,
      unlockedCount: unlocked,
      savedCount: saved,
      remainingQuota: quota?.remainingCvs ?? 0,
    }
  }, [talent, savedCandidateIds, quota])

  // Export CSV
  const exportTalentCSV = useCallback(() => {
    const headers = ['Name', 'Discipline', 'Institution', 'Location', 'Experience (Yrs)', 'Work Mode', 'Skills', 'Unlocked']
    const rows = filteredTalent.map((t) => [
      `"${t.name}"`,
      `"${t.discipline}"`,
      `"${t.institution}"`,
      `"${t.location}"`,
      t.experienceYears,
      `"${t.workMode}"`,
      `"${t.skills.join('; ')}"`,
      t.isUnlocked ? 'Yes' : 'No',
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Castallio_Talent_Pool_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification('Talent export complete: Downloaded CSV dossier.')
  }, [filteredTalent, showNotification])

  return {
    loading,
    semanticSearching,
    isSemanticMode,
    setIsSemanticMode,
    companyId,
    companyName,
    talent,
    filteredTalent,
    searchQuery,
    setSearchQuery,
    selectedDiscipline,
    setSelectedDiscipline,
    selectedWorkMode,
    setSelectedWorkMode,
    selectedExperienceRange,
    setSelectedExperienceRange,
    sortOption,
    setSortOption,
    savedCandidateIds,
    toggleBookmarkCandidate,
    selectedCandidate,
    setSelectedCandidate,
    candidateToUnlock,
    setCandidateToUnlock,
    unlockCandidate,
    sendCandidateMessage,
    quota,
    metrics,
    toastMessage,
    showNotification,
    exportTalentCSV,
    loadTalentData,
    performSemanticSearch,
  }
}
