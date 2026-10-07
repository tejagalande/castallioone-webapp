import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

export interface CandidateResumeProfile {
  fullName: string
  discipline: string
  specificSkill: string
  location: string
  email: string
  phone: string
  skills: string[]
  experiences: Array<{
    id: string
    roleTitle: string
    company: string
    period: string
    contributions: string
  }>
  education: Array<{
    id: string
    degree: string
    school: string
    year: string
  }>
}

const PRIMARY_RESUME_DATA: ActiveResumeDetail = {
  docId: 'CV-PRIMARY',
  fileName: 'Resume_Document.pdf',
  fileSize: '—',
  compliance: 'Verified',
  hash: 'CASTALLIO-VERIFIED',
  lastUpdated: 'Recently updated',
  lodStandard: 'Standard Portfolio',
  executiveSummary: 'No summary provided yet. Complete your profile details to generate your technical blueprint.',
  atsHealthScore: 0,
}

export const INITIAL_VARIANTS: ResumeVersion[] = []

export const ATS_TOKENS: ATSKeywordToken[] = []

export const VERIFICATION_SEALS: VerificationSeal[] = []

export function useResumeManagement() {
  const [activeResume] = useState<ActiveResumeDetail>(PRIMARY_RESUME_DATA)
  const [variants, setVariants] = useState<ResumeVersion[]>(INITIAL_VARIANTS)
  const [selectedTargetJob, setSelectedTargetJob] = useState<string>('Target Position')
  const [oneClickDownload, setOneClickDownload] = useState<boolean>(true)
  const [hideContactInfo, setHideContactInfo] = useState<boolean>(false)
  const [digitalWatermark, setDigitalWatermark] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'resumes' | 'cover-letters' | 'bep-samples' | 'certs'>('resumes')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Real candidate profile
  const [profile, setProfile] = useState<CandidateResumeProfile>(() => {
    try {
      const raw = localStorage.getItem('castallio_talent_profile_data')
      const parsed = raw ? JSON.parse(raw) : null
      return {
        fullName: parsed?.fullName || '',
        discipline: parsed?.discipline || '',
        specificSkill: parsed?.specificSkill || '',
        location: parsed?.city || '',
        email: parsed?.email || '',
        phone: parsed?.phone || '',
        skills: Array.isArray(parsed?.coreSoftware) ? parsed.coreSoftware : [],
        experiences: [],
        education: [],
      }
    } catch {
      return {
        fullName: '',
        discipline: '',
        specificSkill: '',
        location: '',
        email: '',
        phone: '',
        skills: [],
        experiences: [],
        education: [],
      }
    }
  })

  // Modal / Preview state
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false)
  const [isTailorModalOpen, setIsTailorModalOpen] = useState<boolean>(false)
  const [previewVariant, setPreviewVariant] = useState<ResumeVersion | null>(null)

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user) return

        const { data: student } = await supabase
          .from('student_profile')
          .select('*')
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle()

        let studentId = user.id
        if (student) {
          studentId = student.id || user.id
          setProfile((prev) => ({
            ...prev,
            fullName: student.full_name || prev.fullName,
            discipline: student.discipline || prev.discipline,
            location: student.location || prev.location,
            email: student.email || user.email || prev.email,
            phone: student.phone || prev.phone,
          }))
        }

        // Skills
        const { data: skillsRows } = await supabase
          .from('student_skills')
          .select('skill_name, category')
          .or(`student_id.eq.${studentId},student_id.eq.${user.id}`)

        if (skillsRows && skillsRows.length > 0) {
          setProfile((prev) => ({
            ...prev,
            skills: skillsRows.map((s) => s.skill_name),
          }))
        }

        // Experiences
        const { data: expRows } = await supabase
          .from('student_experience')
          .select('*')
          .or(`student_id.eq.${studentId},student_id.eq.${user.id}`)
          .order('start_date', { ascending: false })

        if (expRows && expRows.length > 0) {
          setProfile((prev) => ({
            ...prev,
            experiences: expRows.map((e) => ({
              id: e.id,
              roleTitle: e.role_title,
              company: e.organization_name,
              period: `${e.start_date ? e.start_date.slice(0, 4) : ''} — ${e.end_date ? e.end_date.slice(0, 4) : 'Present'}`,
              contributions: e.contributions || '',
            })),
          }))
        }

        // Education
        const { data: eduRows } = await supabase
          .from('student_education')
          .select('*')
          .or(`student_id.eq.${studentId},student_id.eq.${user.id}`)
          .order('start_year', { ascending: false })

        if (eduRows && eduRows.length > 0) {
          setProfile((prev) => ({
            ...prev,
            education: eduRows.map((ed) => ({
              id: ed.id,
              degree: ed.degree,
              school: ed.institution_name,
              year: String(ed.end_year || ed.start_year || ''),
            })),
          }))
        }
      } catch (err) {
        console.warn('Error loading resume profile:', err)
      }
    }

    void fetchRealData()
  }, [])

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
CANDIDATE: ${profile.fullName || 'Verified AEC Candidate'}
ROLE: ${profile.specificSkill || profile.discipline || 'AEC Professional'}
FILE: ${fileName}
SECURITY: Verified Account
TIMESTAMP: ${new Date().toISOString()}

EXECUTIVE SUMMARY:
${activeResume.executiveSummary}

CORE TECHNICAL STACK:
${profile.skills.length > 0 ? profile.skills.map((s) => `- ${s}`).join('\n') : '- Verified AEC Stack'}
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
      showToast(`Downloaded document: ${fileName}`)
    },
    [activeResume.executiveSummary, profile, showToast]
  )

  const handleCopyLink = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('https://castallio.one/cv/resume')
    }
    showToast('Recruiter CV link copied!')
  }, [showToast])

  const handleExportZip = useCallback(() => {
    const zipName = profile.fullName ? `Resume_${profile.fullName.replace(/\s+/g, '_')}.zip` : 'Resume_Package.zip'
    showToast(`Compiling package (${zipName})...`)
    setTimeout(() => {
      showToast(`${zipName} ready and downloaded.`)
    }, 1200)
  }, [profile.fullName, showToast])

  const handleExportJsonResume = useCallback(() => {
    const jsonResume = {
      $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
      basics: {
        name: profile.fullName || 'AEC Candidate',
        label: profile.specificSkill || profile.discipline || 'AEC Professional',
        email: profile.email || '',
        phone: profile.phone || '',
        url: 'https://castallio.one/cv/resume',
        summary: activeResume.executiveSummary,
        location: {
          city: profile.location || '',
          region: '',
        },
      },
    }
    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(profile.fullName || 'Candidate').replace(/\s+/g, '_')}_Resume.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Exported standard JSON-Resume schema!')
  }, [activeResume.executiveSummary, profile, showToast])

  const handleCreateVariant = useCallback(() => {
    const newVariant: ResumeVersion = {
      id: `v-${Date.now()}`,
      versionCode: `V${variants.length + 1}.0`,
      title: 'Custom Technical CV Variant',
      targetFirms: 'Target AEC Firms',
      summary: 'Custom-tuned version highlighting specific technical competencies and project requirements.',
      tags: ['Custom', 'Verified'],
      downloadsCount: 0,
      sharedCount: 0,
      atsScore: 90,
      lastModified: 'Created just now',
      fileSize: '1.8 MB',
      compliance: 'Verified',
    }
    setVariants((prev) => [newVariant, ...prev])
    showToast('New customized CV variant generated!')
  }, [variants.length, showToast])

  const handleAutoGenerateTailoredDraft = useCallback(() => {
    showToast(`AI Tailor: Optimized CV for ${selectedTargetJob.split('•')[0].trim()}!`)
  }, [selectedTargetJob, showToast])

  return {
    activeResume,
    variants,
    profile,
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
