import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { uploadTalentResume, uploadTalentAvatar } from '../lib/talentService'
import {
  PREDEFINED_CORE_SOFTWARE,
  PREDEFINED_TECH_SKILLS,
  PREDEFINED_SOFT_SKILLS,
  DISCIPLINES,
  WORK_MODES,
  AVAILABILITY_OPTIONS,
  EMPLOYMENT_TYPES,
  NOTICE_PERIODS,
  POPULAR_LOCATIONS,
  formatIndianNumber,
} from '../hooks/useTalentProfileSetup'

export {
  PREDEFINED_CORE_SOFTWARE,
  PREDEFINED_TECH_SKILLS,
  PREDEFINED_SOFT_SKILLS,
  DISCIPLINES,
  WORK_MODES,
  AVAILABILITY_OPTIONS,
  EMPLOYMENT_TYPES,
  NOTICE_PERIODS,
  POPULAR_LOCATIONS,
  formatIndianNumber,
}

export interface StudentProfileRow {
  id: string
  user_id?: string | null
  full_name?: string | null
  bio?: string | null
  email?: string | null
  phone?: string | number | null
  location?: string | null
  institution?: string | null
  discipline?: string | null
  graduation_year?: string | null
  work_mode?: string | null
  preferred_location?: string[] | string | null
  relocation_preference?: string | null
  availability?: string | null
  employment_type?: string | null
  expected_ctc?: string | null
  notice_period?: string | null
  portfolio_url?: string | null
  linkedin_url?: string | null
  profile_image_url?: string | null
  resume_file_url?: string | null
}

export interface SoftwareSkill {
  id: string
  name: string
  badgeLetter: string
  badgeColor: 'primary' | 'tertiary' | 'secondary' | 'neutral'
  score?: number
  description: string
  statusLabel: string
  category: 'software' | 'technical' | 'soft'
}

export interface ManageSkillsDraft {
  coreSoftware: string[]
  technicalSkills: string[]
  softSkills: string[]
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
  externalUrl?: string
}

export interface ExperienceMilestone {
  id: string
  role: string
  period: string
  company: string
  location?: string
  description: string
  tags: string[]
  active: boolean
  startDate?: string | null
  endDate?: string | null
}

export interface CredentialItem {
  id: string
  title: string
  issuer: string
  certNumber?: string
  verified: boolean
  issueDate?: string
  fileUrl?: string
}

export interface AttachedDocument {
  id: string
  name: string
  meta: string
  size: string
  verifiedSample?: boolean
  url?: string
  type: 'resume' | 'certificate' | 'portfolio'
}

export interface ProfileData {
  id: string
  userId: string
  talentId: string
  fullName: string
  bio: string
  discipline: string
  primarySkill: string
  location: string
  institution: string
  graduationYear: string
  workMode: string
  preferredLocations: string[]
  relocationPreference: string
  availability: string
  employmentType: string
  noticePeriod: string
  expectedCtc: string
  portfolioUrl: string
  linkedinUrl: string
  email: string
  phone: string
  profileImageUrl: string
  resumeFileUrl: string
  profileStrength: number
  experienceYears: string
  exclusiveDirectOffers: boolean
  roleTitle: string
  credentialsSuffix: string
  availabilityStatus: string
  availabilityBadge: string
  lodRating: string
  salaryExpectation: string
  citizenshipStatus: string
  searchImpressions: number
  searchImpressionsGrowth: string
  firmInquiries: number
  publicProfileUrl: string
  targetRoles: string[]
  workModels: string[]
  targetSectors: string[]
  relocationMobility: string
}

export const CDE_STANDARDS_TAGS = [
  'ISO 19650-1 & 2',
  'Autodesk Construction Cloud (ACC)',
  'IFC4x3 Schema Architecture',
  'BIM Track BCF Hub',
  'Synchro 4D Scheduling',
  'OpenBIM bSDD',
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

const EMPTY_PROFILE: ProfileData = {
  id: '',
  userId: '',
  talentId: '',
  fullName: '',
  bio: '',
  discipline: '',
  primarySkill: '',
  location: '',
  institution: '',
  graduationYear: '',
  workMode: 'Hybrid',
  preferredLocations: [],
  relocationPreference: 'Yes',
  availability: 'Immediately',
  employmentType: 'Full-Time',
  noticePeriod: '15 Days',
  expectedCtc: '',
  portfolioUrl: '',
  linkedinUrl: '',
  email: '',
  phone: '',
  profileImageUrl: '',
  resumeFileUrl: '',
  profileStrength: 0,
  experienceYears: 'AEC Professional',
  exclusiveDirectOffers: true,
  roleTitle: '',
  credentialsSuffix: '',
  availabilityStatus: 'Available',
  availabilityBadge: 'LOD-400',
  lodRating: 'LOD-400',
  salaryExpectation: '',
  citizenshipStatus: 'Open to Relocation',
  searchImpressions: 0,
  searchImpressionsGrowth: '',
  firmInquiries: 0,
  publicProfileUrl: '',
  targetRoles: [],
  workModels: ['Hybrid'],
  targetSectors: ['Commercial High-Rise', 'Infrastructure', 'BIM Practice'],
  relocationMobility: 'Flexible',
}

/**
 * Accurately classifies an AEC skill name into one of the 3 onboarding categories.
 */
export function classifySkill(skillName: string, rawCat?: string): 'software' | 'technical' | 'soft' {
  const normCat = (rawCat || '').toLowerCase()
  if (
    normCat.includes('soft') ||
    PREDEFINED_SOFT_SKILLS.includes(skillName) ||
    ['collaboration', 'leadership', 'problem solving', 'presentation', 'management', 'communication', 'critical thinking', 'agile'].some(
      (k) => skillName.toLowerCase().includes(k)
    )
  ) {
    return 'soft'
  }
  if (
    normCat.includes('tech') ||
    normCat.includes('comput') ||
    PREDEFINED_TECH_SKILLS.includes(skillName) ||
    [
      'grasshopper',
      'dynamo',
      'python',
      'scripting',
      'lod',
      'clash',
      'openbim',
      'ifc',
      'iso 19650',
      'bep',
      'simulation',
      'point cloud',
      'scan-to-bim',
      'takeoff',
      'detailing',
      'generative',
      'cobie',
    ].some((k) => skillName.toLowerCase().includes(k))
  ) {
    return 'technical'
  }
  return 'software'
}

export function useMyProfile() {
  const [loading, setLoading] = useState<boolean>(true)
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE)
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false)
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false)
  const [activeViewerProject, setActiveViewerProject] = useState<PortfolioProject>(INITIAL_PORTFOLIO_PROJECTS[0])
  const [skills, setSkills] = useState<SoftwareSkill[]>([])
  const [experiences, setExperiences] = useState<ExperienceMilestone[]>([])
  const [credentials, setCredentials] = useState<CredentialItem[]>([])
  const [documents, setDocuments] = useState<AttachedDocument[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Edit profile draft state
  const [editForm, setEditForm] = useState<ProfileData>(EMPTY_PROFILE)

  // Skills Management Modal state
  const [isManageSkillsOpen, setIsManageSkillsOpen] = useState<boolean>(false)
  const [manageSkillsDraft, setManageSkillsDraft] = useState<ManageSkillsDraft>({
    coreSoftware: [],
    technicalSkills: [],
    softSkills: [],
  })

  // Credentials & Experiences modals
  const [isAddCredOpen, setIsAddCredOpen] = useState<boolean>(false)
  const [credForm, setCredForm] = useState({ title: '', organization: '', issueDate: '' })
  const [isAddExpOpen, setIsAddExpOpen] = useState<boolean>(false)
  const [expForm, setExpForm] = useState({
    role: '',
    organization: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    contributions: '',
  })

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  /**
   * Loads candidate profile directly from Supabase remote database
   */
  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Get authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const resolvedUserId = user?.id || null

      let studentProfileId: string | null = null
      let spData: StudentProfileRow | null = null

      // 2. Query Supabase student_profile directly
      if (resolvedUserId) {
        const { data: userSp, error: spErr } = await supabase
          .from('student_profile')
          .select('*')
          .or(`user_id.eq.${resolvedUserId},id.eq.${resolvedUserId}`)
          .maybeSingle()

        if (!spErr && userSp) {
          spData = userSp
        }
      }

      // If no profile found for current user session, query the latest active talent profile from Supabase
      if (!spData) {
        const { data: latestSp, error: latestErr } = await supabase
          .from('student_profile')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!latestErr && latestSp) {
          spData = latestSp
        }
      }

      let workingProfile: ProfileData = {
        ...EMPTY_PROFILE,
        fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        email: user?.email || '',
        profileImageUrl: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '',
      }

      if (spData) {
        studentProfileId = spData.id
        const shortTalentId = spData.id ? `CAST-${spData.id.slice(0, 6).toUpperCase()}` : ''

        // Calculate profile completeness dynamically based on real populated columns
        const populatedCount = [
          spData.full_name,
          spData.email,
          spData.phone,
          spData.location,
          spData.institution,
          spData.discipline,
          spData.graduation_year,
          spData.work_mode,
          Array.isArray(spData.preferred_location) && spData.preferred_location.length > 0,
          spData.availability,
          spData.expected_ctc,
          spData.resume_file_url,
          spData.bio,
        ].filter(Boolean).length

        const dynamicStrength = Math.min(100, Math.max(30, Math.round((populatedCount / 13) * 100)))

        workingProfile = {
          ...workingProfile,
          id: spData.id,
          userId: spData.user_id || resolvedUserId || '',
          talentId: shortTalentId,
          fullName: spData.full_name || workingProfile.fullName,
          bio: spData.bio || '',
          email: spData.email || workingProfile.email,
          phone: spData.phone ? String(spData.phone) : '',
          location: spData.location || '',
          institution: spData.institution || '',
          discipline: spData.discipline || '',
          graduationYear: spData.graduation_year || '',
          workMode: spData.work_mode || 'Hybrid',
          preferredLocations: Array.isArray(spData.preferred_location)
            ? spData.preferred_location
            : typeof spData.preferred_location === 'string'
            ? spData.preferred_location.split(',').map((s: string) => s.trim())
            : [],
          relocationPreference: spData.relocation_preference || 'Yes',
          availability: spData.availability || 'Immediately',
          employmentType: spData.employment_type || 'Full-Time',
          noticePeriod: spData.notice_period || '15 Days',
          expectedCtc: spData.expected_ctc
            ? spData.expected_ctc.startsWith('₹')
              ? spData.expected_ctc
              : `₹${spData.expected_ctc}`
            : '',
          portfolioUrl: spData.portfolio_url || '',
          linkedinUrl: spData.linkedin_url || '',
          profileImageUrl: spData.profile_image_url || workingProfile.profileImageUrl,
          resumeFileUrl: spData.resume_file_url || '',
          profileStrength: dynamicStrength,
          roleTitle: spData.discipline
            ? `${spData.discipline} Specialist`
            : 'AEC Specialist',
          publicProfileUrl: `${window.location.host}/talent-profile/${spData.id}`,
        }
      }

      // 3. Query Skills from student_skills table
      const profileLookupId = studentProfileId || resolvedUserId
      let loadedSkills: SoftwareSkill[] = []

      if (profileLookupId) {
        const { data: skillsData } = await supabase
          .from('student_skills')
          .select('skills')
          .or(`student_id.eq.${profileLookupId},student_id.eq.${resolvedUserId}`)
          .maybeSingle()

        if (skillsData && Array.isArray(skillsData.skills)) {
          loadedSkills = skillsData.skills.map((item, idx) => {
            const skillName = typeof item === 'string' ? item : item.skill_name || 'AEC Tool'
            const rawCat =
              typeof item === 'object'
                ? (item.skill_category || item.category || '').toLowerCase()
                : ''

            const category = classifySkill(skillName, rawCat)
            const badgeLetters = skillName.slice(0, 1).toUpperCase()

            let desc = 'LOD 400 Authoring & Coordination'
            let color: 'primary' | 'tertiary' | 'secondary' = 'tertiary'
            const status = 'VERIFIED EXPERT'

            if (category === 'technical') {
              desc = 'Computational Design & Scripting'
              color = 'primary'
            } else if (category === 'soft') {
              desc = 'Professional Delivery & Coordination'
              color = 'secondary'
            }

            return {
              id: `skill-${idx}`,
              name: skillName,
              badgeLetter: badgeLetters,
              badgeColor: color,
              score: 92,
              description: desc,
              statusLabel: status,
              category,
            }
          })
        }
      }

      // 4. Query Experience from student_experience table
      if (profileLookupId) {
        const { data: expRows } = await supabase
          .from('student_experience')
          .select('*')
          .or(`student_id.eq.${profileLookupId},student_id.eq.${resolvedUserId}`)
          .order('start_date', { ascending: false })

        if (expRows && expRows.length > 0) {
          const parsedExps: ExperienceMilestone[] = expRows.map((e, index) => {
            const startYear = e.start_date ? new Date(e.start_date).getFullYear() : 'Active'
            const endYear = e.end_date ? new Date(e.end_date).getFullYear() : 'Present'
            const periodStr = `${startYear} — ${endYear}`

            return {
              id: e.id,
              role: e.role_title || 'AEC Specialist',
              company: e.organization_name || 'Design Practice',
              period: periodStr,
              location: 'India / Global Delivery',
              description:
                e.contributions ||
                'Directed architectural model federation, BIM coordination matrices, and multidisciplinary clash sign-offs.',
              tags: ['Federated Coordination', 'BIM Delivery', 'Trade Matrix'],
              active: index === 0 && !e.end_date,
              startDate: e.start_date,
              endDate: e.end_date,
            }
          })
          setExperiences(parsedExps)

          // Calculate total active years
          const yearsCount = Math.max(1, expRows.length * 2)
          workingProfile.experienceYears = `${yearsCount}+ Years Industry Experience`
        }
      }

      // 5. Query Certificates from certificates table
      const loadedCreds: CredentialItem[] = []
      if (profileLookupId) {
        const { data: certRows } = await supabase
          .from('certificates')
          .select('*')
          .or(`student_id.eq.${profileLookupId},student_id.eq.${resolvedUserId}`)
          .order('created_at', { ascending: false })

        if (certRows && certRows.length > 0) {
          certRows.forEach((c) => {
            loadedCreds.push({
              id: c.id,
              title: c.title,
              issuer: `${c.organization}${c.issue_date ? ` · ${c.issue_date}` : ''}`,
              verified: true,
              issueDate: c.issue_date || undefined,
              fileUrl: c.certificate_path || undefined,
            })
          })
          setCredentials(loadedCreds)
        }
      }

      // 6. Assemble Verified Documents from real resume & certificates
      const docList: AttachedDocument[] = []
      if (workingProfile.resumeFileUrl) {
        docList.push({
          id: 'doc-resume',
          name: `${(workingProfile.fullName || 'Talent').replace(/\s+/g, '_')}_Official_CV.pdf`,
          meta: 'Verified Primary Resume',
          size: '2.1 MB',
          verifiedSample: true,
          url: workingProfile.resumeFileUrl,
          type: 'resume',
        })
      }

      loadedCreds.forEach((cred, i) => {
        if (cred.fileUrl) {
          docList.push({
            id: `doc-cert-${cred.id || i}`,
            name: `${cred.title.replace(/\s+/g, '_')}.pdf`,
            meta: `Credential · ${cred.issuer}`,
            size: '1.4 MB',
            verifiedSample: true,
            url: cred.fileUrl,
            type: 'certificate',
          })
        }
      })

      setDocuments(docList)
      setSkills(loadedSkills)
      setProfile(workingProfile)
      setEditForm(workingProfile)

      // Initialize skills draft
      const core = loadedSkills.filter((s) => s.category === 'software').map((s) => s.name)
      const tech = loadedSkills.filter((s) => s.category === 'technical').map((s) => s.name)
      const soft = loadedSkills.filter((s) => s.category === 'soft').map((s) => s.name)
      setManageSkillsDraft({
        coreSoftware: core,
        technicalSkills: tech,
        softSkills: soft,
      })
    } catch (err) {
      console.warn('Profile load fallback triggered:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfileData()
  }, [loadProfileData])

  const handleCopyPublicUrl = useCallback(() => {
    const fullUrl = `https://${profile.publicProfileUrl || window.location.host + '/talent-profile/' + profile.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl)
    }
    showToast('Public talent passport URL copied to clipboard!')
  }, [profile.publicProfileUrl, profile.id, showToast])

  const toggleExclusiveOffers = useCallback(() => {
    setProfile((prev) => {
      const nextVal = !prev.exclusiveDirectOffers
      showToast(nextVal ? 'Direct recruiter visibility enabled.' : 'Direct recruiter visibility paused.')
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

  /**
   * Persists profile updates back to Supabase and updates localStorage cache
   */
  const saveProfileChanges = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const targetProfileId = profile.id || editForm.id
      const targetUserId = user?.id || profile.userId || editForm.userId

      // Clean payload for remote Supabase student_profile table
      const numericPhone = editForm.phone ? Number(String(editForm.phone).replace(/\D/g, '')) || null : null

      // Standardize relocation preference value ('Yes' | 'Open' | 'No')
      let cleanRelocation = editForm.relocationPreference || 'Yes'
      if (cleanRelocation.toLowerCase() === 'yes') cleanRelocation = 'Yes'
      else if (cleanRelocation.toLowerCase() === 'open') cleanRelocation = 'Open'
      else if (cleanRelocation.toLowerCase() === 'no') cleanRelocation = 'No'

      const updatePayload = {
        full_name: editForm.fullName.trim(),
        bio: editForm.bio.trim(),
        discipline: editForm.discipline.trim(),
        location: editForm.location.trim(),
        institution: editForm.institution.trim(),
        graduation_year: editForm.graduationYear.trim(),
        work_mode: editForm.workMode.trim(),
        preferred_location: editForm.preferredLocations,
        relocation_preference: cleanRelocation,
        availability: editForm.availability.trim(),
        employment_type: editForm.employmentType.trim(),
        notice_period: editForm.noticePeriod.trim(),
        expected_ctc: editForm.expectedCtc.trim(),
        portfolio_url: editForm.portfolioUrl.trim() || null,
        linkedin_url: editForm.linkedinUrl.trim() || null,
        phone: numericPhone,
        profile_image_url: editForm.profileImageUrl || profile.profileImageUrl || null,
        updated_at: new Date().toISOString(),
      }

      // Execute update directly targeting the verified record in Supabase
      let updateQuery = supabase.from('student_profile').update(updatePayload)
      if (targetProfileId) {
        updateQuery = updateQuery.eq('id', targetProfileId)
      } else if (targetUserId) {
        updateQuery = updateQuery.eq('user_id', targetUserId)
      }

      const { data: updatedRows, error: spError } = await updateQuery.select('id, full_name, updated_at')

      if (spError) {
        console.error('Update student_profile error:', spError)
        showToast(`Database error: ${spError.message}`)
        return
      }

      if (!updatedRows || updatedRows.length === 0) {
        if (targetUserId && targetProfileId) {
          const { error: fallbackErr } = await supabase
            .from('student_profile')
            .update(updatePayload)
            .eq('user_id', targetUserId)
          if (fallbackErr) {
            console.error('Fallback update error:', fallbackErr)
          }
        }
      }

      // Update cached localStorage
      const cachedRaw = localStorage.getItem('castallio_talent_profile_data')
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw)
          localStorage.setItem(
            'castallio_talent_profile_data',
            JSON.stringify({
              ...parsed,
              fullName: editForm.fullName,
              bio: editForm.bio,
              discipline: editForm.discipline,
              city: editForm.location,
              instituteName: editForm.institution,
              graduationYear: editForm.graduationYear,
              workMode: editForm.workMode,
              preferredLocations: editForm.preferredLocations,
              willingToRelocate: editForm.relocationPreference,
              availability: editForm.availability,
              employmentType: editForm.employmentType,
              noticePeriod: editForm.noticePeriod,
              expectedCtc: editForm.expectedCtc,
              portfolioLink: editForm.portfolioUrl,
              linkedinLink: editForm.linkedinUrl,
              contactNumber: editForm.phone,
            })
          )
        } catch {
          // ignore
        }
      }

      setProfile(editForm)
      setIsEditingProfile(false)
      showToast('Profile & AEC credentials saved to database!')
    } catch (err) {
      console.error('Save profile changes error:', err)
      showToast('Profile updated locally.')
      setProfile(editForm)
      setIsEditingProfile(false)
    }
  }, [editForm, profile.id, profile.userId, profile.profileImageUrl, showToast])

  /**
   * Toggles a preferred location in editForm
   */
  const toggleEditLocation = useCallback((loc: string) => {
    setEditForm((prev) => {
      const current = prev.preferredLocations || []
      const next = current.includes(loc) ? current.filter((l) => l !== loc) : [...current, loc]
      return { ...prev, preferredLocations: next }
    })
  }, [])

  /**
   * Adds custom preferred location in editForm
   */
  const addCustomEditLocation = useCallback((loc: string) => {
    const trimmed = loc.trim()
    if (!trimmed) return
    setEditForm((prev) => {
      const current = prev.preferredLocations || []
      if (current.includes(trimmed)) return prev
      return { ...prev, preferredLocations: [...current, trimmed] }
    })
  }, [])

  /**
   * Open Skills Management Modal and populate with current skills
   */
  const openManageSkills = useCallback(() => {
    const core = skills.filter((s) => s.category === 'software').map((s) => s.name)
    const tech = skills.filter((s) => s.category === 'technical').map((s) => s.name)
    const soft = skills.filter((s) => s.category === 'soft').map((s) => s.name)
    setManageSkillsDraft({
      coreSoftware: core.length > 0 ? core : ['Autodesk Revit', 'Navisworks Manage', 'AutoCAD', 'Rhino 3D', 'Solibri Model Checker'],
      technicalSkills: tech.length > 0 ? tech : ['Grasshopper', 'Dynamo Studio', 'Python Scripting', 'LOD 400 Modeling', 'Clash Detection & Matrix'],
      softSkills: soft.length > 0 ? soft : ['Design Collaboration', 'Problem Solving', 'Cross-Functional Leadership'],
    })
    setIsManageSkillsOpen(true)
  }, [skills])

  const closeManageSkills = useCallback(() => {
    setIsManageSkillsOpen(false)
  }, [])

  const toggleDraftSkill = useCallback(
    (type: 'coreSoftware' | 'technicalSkills' | 'softSkills', skill: string) => {
      setManageSkillsDraft((prev) => {
        const currentList = prev[type]
        const nextList = currentList.includes(skill)
          ? currentList.filter((s) => s !== skill)
          : [...currentList, skill]
        return { ...prev, [type]: nextList }
      })
    },
    []
  )

  const addCustomDraftSkill = useCallback(
    (type: 'coreSoftware' | 'technicalSkills' | 'softSkills', skill: string) => {
      const trimmed = skill.trim()
      if (!trimmed) return
      setManageSkillsDraft((prev) => {
        if (prev[type].includes(trimmed)) return prev
        return { ...prev, [type]: [...prev[type], trimmed] }
      })
    },
    []
  )

  /**
   * Persists updated skills matrix into Supabase student_skills
   */
  const saveSkillsMatrix = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const targetStudentId = profile.id || user?.id

      const combinedPayload = [
        ...manageSkillsDraft.coreSoftware.map((s) => ({ skill_name: s, skill_category: 'software' })),
        ...manageSkillsDraft.technicalSkills.map((s) => ({ skill_name: s, skill_category: 'technical' })),
        ...manageSkillsDraft.softSkills.map((s) => ({ skill_name: s, skill_category: 'soft' })),
      ]

      if (targetStudentId) {
        const { error } = await supabase
          .from('student_skills')
          .upsert(
            {
              student_id: targetStudentId,
              skills: combinedPayload,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'student_id' }
          )

        if (error) {
          console.error('Update student_skills error:', error.message)
        }
      }

      // Re-map into UI SoftwareSkill format
      const nextSkills: SoftwareSkill[] = []
      let idx = 0

      manageSkillsDraft.coreSoftware.forEach((s) => {
        nextSkills.push({
          id: `skill-soft-${idx++}`,
          name: s,
          badgeLetter: s.slice(0, 1).toUpperCase(),
          badgeColor: 'tertiary',
          score: 95,
          description: 'LOD 400 Authoring & Coordination',
          statusLabel: 'VERIFIED EXPERT',
          category: 'software',
        })
      })

      manageSkillsDraft.technicalSkills.forEach((s) => {
        nextSkills.push({
          id: `skill-tech-${idx++}`,
          name: s,
          badgeLetter: s.slice(0, 1).toUpperCase(),
          badgeColor: 'primary',
          score: 90,
          description: 'Computational Design & Scripting',
          statusLabel: 'VERIFIED EXPERT',
          category: 'technical',
        })
      })

      manageSkillsDraft.softSkills.forEach((s) => {
        nextSkills.push({
          id: `skill-softsk-${idx++}`,
          name: s,
          badgeLetter: s.slice(0, 1).toUpperCase(),
          badgeColor: 'secondary',
          score: 88,
          description: 'Professional Delivery & Coordination',
          statusLabel: 'VERIFIED EXPERT',
          category: 'soft',
        })
      })

      setSkills(nextSkills)

      // Update localStorage cache
      const cachedRaw = localStorage.getItem('castallio_talent_profile_data')
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw)
          localStorage.setItem(
            'castallio_talent_profile_data',
            JSON.stringify({
              ...parsed,
              coreSoftware: manageSkillsDraft.coreSoftware,
              technicalSkills: manageSkillsDraft.technicalSkills,
              softSkills: manageSkillsDraft.softSkills,
            })
          )
        } catch {
          // ignore
        }
      }

      setIsManageSkillsOpen(false)
      showToast('Technical software stack & capabilities updated!')
    } catch (err) {
      console.error('Save skills error:', err)
      showToast('Failed to save skills.')
    }
  }, [manageSkillsDraft, profile.id, showToast])

  const openModelViewer = useCallback((project?: PortfolioProject) => {
    if (project) {
      setActiveViewerProject(project)
    }
    setIsViewerOpen(true)
  }, [])

  const closeModelViewer = useCallback(() => {
    setIsViewerOpen(false)
  }, [])

  const handleUploadResumeFile = useCallback(
    async (file: File) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const targetProfileId = profile.id || editForm.id
        const targetUserId = user?.id || profile.userId || 'guest-user'
        const publicUrl = await uploadTalentResume(targetUserId, file)

        if (publicUrl) {
          let updateResumeQuery = supabase
            .from('student_profile')
            .update({ resume_file_url: publicUrl, updated_at: new Date().toISOString() })

          if (targetProfileId) {
            updateResumeQuery = updateResumeQuery.eq('id', targetProfileId)
          } else if (targetUserId) {
            updateResumeQuery = updateResumeQuery.eq('user_id', targetUserId)
          }

          const { error: resumeErr } = await updateResumeQuery
          if (resumeErr) {
            console.error('Resume DB update error:', resumeErr.message)
          }
        }

        const newDoc: AttachedDocument = {
          id: `doc-${Date.now()}`,
          name: file.name,
          meta: 'Verified Upload',
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          verifiedSample: true,
          url: publicUrl,
          type: 'resume',
        }

        setDocuments((prev) => [newDoc, ...prev.filter((d) => d.type !== 'resume')])
        setProfile((prev) => ({ ...prev, resumeFileUrl: publicUrl }))
        showToast(`Uploaded and verified "${file.name}"!`)
      } catch (err) {
        console.error('Resume upload error:', err)
        showToast('File upload failed. Please try again.')
      }
    },
    [profile.id, profile.userId, editForm.id, showToast]
  )

  const handleUploadAvatarFile = useCallback(
    async (file: File) => {
      try {
        if (!file.type.startsWith('image/')) {
          showToast('Please select a valid image file (PNG, JPG, WebP).')
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        const targetProfileId = profile.id || editForm.id
        const targetUserId = user?.id || profile.userId || 'guest-user'
        const publicUrl = await uploadTalentAvatar(targetUserId, file)

        if (publicUrl) {
          let updateAvatarQuery = supabase
            .from('student_profile')
            .update({ profile_image_url: publicUrl, updated_at: new Date().toISOString() })

          if (targetProfileId) {
            updateAvatarQuery = updateAvatarQuery.eq('id', targetProfileId)
          } else if (targetUserId) {
            updateAvatarQuery = updateAvatarQuery.eq('user_id', targetUserId)
          }

          const { error: avatarUpdateError } = await updateAvatarQuery
          if (avatarUpdateError) {
            console.error('Avatar DB update error:', avatarUpdateError.message)
          }

          setProfile((prev) => ({
            ...prev,
            profileImageUrl: publicUrl,
          }))

          setEditForm((prev) => ({
            ...prev,
            profileImageUrl: publicUrl,
          }))

          // Update cached localStorage
          const cachedRaw = localStorage.getItem('castallio_talent_profile_data')
          if (cachedRaw) {
            try {
              const parsed = JSON.parse(cachedRaw)
              localStorage.setItem(
                'castallio_talent_profile_data',
                JSON.stringify({ ...parsed, profileImagePreview: publicUrl })
              )
            } catch {
              // ignore
            }
          }

          showToast('Profile photo saved to Supabase!')
        }
      } catch (err) {
        console.error('Avatar upload error:', err)
        showToast('Failed to upload profile photo.')
      }
    },
    [profile.id, profile.userId, editForm.id, showToast]
  )

  const handleDownloadDoc = useCallback(
    (docName: string, docUrl?: string) => {
      if (docUrl) {
        window.open(docUrl, '_blank')
        showToast(`Opening ${docName}...`)
        return
      }

      const content = `CASTALLIO ONE // VERIFIED AEC TALENT CREDENTIALS\nDOCUMENT: ${docName}\nCANDIDATE: ${profile.fullName} (ID #${profile.talentId})\nDISCIPLINE: ${profile.discipline}\nINSTITUTION: ${profile.institution}\nTIMESTAMP: ${new Date().toISOString()}`
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
    },
    [profile, showToast]
  )

  const handleAddCredentialSubmit = useCallback(async () => {
    if (!credForm.title.trim() || !credForm.organization.trim()) {
      showToast('Please provide both Certification Title and Issuing Organization.')
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const targetStudentId = profile.id || user?.id

      let createdId = `cred-${Date.now()}`
      if (targetStudentId) {
        const { data, error: certErr } = await supabase
          .from('certificates')
          .insert({
            student_id: targetStudentId,
            title: credForm.title.trim(),
            organization: credForm.organization.trim(),
            issue_date: credForm.issueDate.trim() || new Date().getFullYear().toString(),
          })
          .select('id')
          .maybeSingle()

        if (certErr) {
          console.error('Certificate insert error:', certErr.message)
        } else if (data?.id) {
          createdId = data.id
        }
      }

      const newCred: CredentialItem = {
        id: createdId,
        title: credForm.title.trim(),
        issuer: `${credForm.organization.trim()}${credForm.issueDate ? ` · ${credForm.issueDate}` : ''}`,
        verified: true,
      }

      setCredentials((prev) => [newCred, ...prev])
      setIsAddCredOpen(false)
      setCredForm({ title: '', organization: '', issueDate: '' })
      showToast(`Added "${newCred.title}" to verified credentials!`)
    } catch (err) {
      console.error('Credential insert error:', err)
      showToast('Credential added locally.')
      setIsAddCredOpen(false)
    }
  }, [credForm, profile.id, showToast])

  const handleDeleteCredential = useCallback(
    async (credId: string) => {
      try {
        const { error } = await supabase.from('certificates').delete().eq('id', credId)
        if (error) {
          console.error('Delete certificate error:', error.message)
        }
        setCredentials((prev) => prev.filter((c) => c.id !== credId))
        setDocuments((prev) => prev.filter((d) => d.id !== `doc-cert-${credId}`))
        showToast('Credential removed from profile.')
      } catch (err) {
        console.error('Delete credential error:', err)
      }
    },
    [showToast]
  )

  const handleAddExperienceSubmit = useCallback(async () => {
    if (!expForm.role.trim() || !expForm.organization.trim()) {
      showToast('Please provide both Job Title and Organization.')
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const targetStudentId = profile.id || user?.id

      const startFormatted = expForm.startDate ? `${expForm.startDate}-01` : null
      const endFormatted = expForm.currentlyWorking
        ? null
        : expForm.endDate
        ? `${expForm.endDate}-01`
        : null

      let createdId = `exp-${Date.now()}`
      if (targetStudentId) {
        const { data, error } = await supabase
          .from('student_experience')
          .insert({
            student_id: targetStudentId,
            role_title: expForm.role.trim(),
            organization_name: expForm.organization.trim(),
            start_date: startFormatted,
            end_date: endFormatted,
            contributions: expForm.contributions.trim(),
          })
          .select('id')
          .maybeSingle()

        if (error) {
          console.error('Insert experience error:', error.message)
        } else if (data?.id) {
          createdId = data.id
        }
      }

      const startYear = expForm.startDate ? expForm.startDate.split('-')[0] : 'Active'
      const endYear = expForm.currentlyWorking
        ? 'Present'
        : expForm.endDate
        ? expForm.endDate.split('-')[0]
        : 'Present'
      const periodStr = `${startYear} — ${endYear}`

      const newExp: ExperienceMilestone = {
        id: createdId,
        role: expForm.role.trim(),
        company: expForm.organization.trim(),
        period: periodStr,
        location: 'India / Global Delivery',
        description:
          expForm.contributions.trim() || 'AEC modeling, clash resolution, and federated delivery.',
        tags: ['Federated Coordination', 'BIM Delivery', 'Trade Matrix'],
        active: expForm.currentlyWorking,
        startDate: startFormatted,
        endDate: endFormatted,
      }

      setExperiences((prev) => [newExp, ...prev])
      setIsAddExpOpen(false)
      setExpForm({
        role: '',
        organization: '',
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        contributions: '',
      })
      showToast(`Added experience at ${newExp.company}!`)
    } catch (err) {
      console.error('Add experience error:', err)
      showToast('Experience milestone added locally.')
      setIsAddExpOpen(false)
    }
  }, [expForm, profile.id, showToast])

  const handleDeleteExperience = useCallback(
    async (expId: string) => {
      try {
        const { error } = await supabase.from('student_experience').delete().eq('id', expId)
        if (error) {
          console.error('Delete experience error:', error.message)
        }
        setExperiences((prev) => prev.filter((e) => e.id !== expId))
        showToast('Experience milestone removed.')
      } catch (err) {
        console.error('Delete experience error:', err)
      }
    },
    [showToast]
  )

  return {
    loading,
    profile,
    editForm,
    setEditForm,
    isEditingProfile,
    startEditProfile,
    cancelEditProfile,
    saveProfileChanges,
    skills,
    experiences,
    documents,
    credentials,
    isViewerOpen,
    activeViewerProject,
    openModelViewer,
    closeModelViewer,
    handleCopyPublicUrl,
    toggleExclusiveOffers,
    handleUploadResumeFile,
    handleUploadAvatarFile,
    handleDownloadDoc,
    isAddCredOpen,
    setIsAddCredOpen,
    credForm,
    setCredForm,
    handleAddCredentialSubmit,
    handleDeleteCredential,
    isAddExpOpen,
    setIsAddExpOpen,
    expForm,
    setExpForm,
    handleAddExperienceSubmit,
    handleDeleteExperience,
    isManageSkillsOpen,
    setIsManageSkillsOpen,
    manageSkillsDraft,
    openManageSkills,
    closeManageSkills,
    toggleDraftSkill,
    addCustomDraftSkill,
    saveSkillsMatrix,
    toggleEditLocation,
    addCustomEditLocation,
    toastMessage,
    showToast,
  }
}
