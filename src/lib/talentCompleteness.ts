export interface CompletenessItem {
  id: string
  label: string
  weight: number
  isDone: boolean
  category: 'identity' | 'academic' | 'preferences' | 'docs' | 'skills'
}

export interface CompletenessBreakdown {
  score: number
  tier: 'Draft' | 'Building' | 'Strong' | 'All-Star'
  tierColor: string
  items: CompletenessItem[]
  missingLabels: string[]
}

export interface TalentCompletenessInput {
  profileImage?: string | File | null
  profileImagePreview?: string | null
  fullName?: string | null
  email?: string | null
  contactNumber?: string | number | null
  city?: string | null
  instituteName?: string | null
  discipline?: string | null
  graduationYear?: string | null
  bio?: string | null
  workMode?: string | null
  preferredLocations?: string[] | null
  willingToRelocate?: string | boolean | null
  availability?: string | null
  employmentType?: string | null
  noticePeriod?: string | null
  resumeFile?: string | File | null
  resumeFileName?: string | null
  resumeUrl?: string | null
  expectedCtc?: string | null
  portfolioLink?: string | null
  linkedinLink?: string | null
  specificSkill?: string | null
  coreSoftware?: string[] | null
  technicalSkills?: string[] | null
  softSkills?: string[] | null
  isFresher?: boolean
  experiences?: Array<{ role?: string; organisation?: string }> | null
}

/**
 * Validates and calculates standardized profile completeness score (0 - 100%)
 * across 5 key pillars:
 * 1. Personal Identity & Contact (25%)
 * 2. Academic & Bio (15%)
 * 3. Work Preferences (20%)
 * 4. Documents & Links (15%)
 * 5. Technical Skills & Experience (25%)
 */
export function calculateTalentCompleteness(data: TalentCompletenessInput): CompletenessBreakdown {
  const contactStr = data.contactNumber ? String(data.contactNumber).replace(/\D/g, '') : ''
  const ctcDigits = data.expectedCtc ? String(data.expectedCtc).replace(/\D/g, '') : ''

  const items: CompletenessItem[] = [
    // 1. Personal Identity & Contact (25%)
    {
      id: 'profileImage',
      label: 'User profile image',
      weight: 5,
      isDone: Boolean(data.profileImage || data.profileImagePreview),
      category: 'identity',
    },
    {
      id: 'fullName',
      label: 'Full name',
      weight: 5,
      isDone: Boolean(data.fullName && data.fullName.trim().length >= 2),
      category: 'identity',
    },
    {
      id: 'email',
      label: 'Email address',
      weight: 5,
      isDone: Boolean(data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())),
      category: 'identity',
    },
    {
      id: 'contactNumber',
      label: 'Contact number',
      weight: 5,
      isDone: contactStr.length >= 10,
      category: 'identity',
    },
    {
      id: 'city',
      label: 'Current city',
      weight: 5,
      isDone: Boolean(data.city && data.city.trim().length >= 2),
      category: 'identity',
    },

    // 2. Academic & Bio (15%)
    {
      id: 'instituteName',
      label: 'Institute name',
      weight: 5,
      isDone: Boolean(data.instituteName && data.instituteName.trim().length >= 2),
      category: 'academic',
    },
    {
      id: 'discipline',
      label: 'AEC discipline',
      weight: 5,
      isDone: Boolean(data.discipline && data.discipline.trim().length > 0),
      category: 'academic',
    },
    {
      id: 'graduationYear',
      label: 'Graduation year',
      weight: 3,
      isDone: Boolean(data.graduationYear && data.graduationYear.trim().length >= 4),
      category: 'academic',
    },
    {
      id: 'bio',
      label: 'Professional bio',
      weight: 2,
      isDone: Boolean(data.bio && data.bio.trim().length >= 15),
      category: 'academic',
    },

    // 3. Work Preferences (20%)
    {
      id: 'workMode',
      label: 'Work mode',
      weight: 5,
      isDone: Boolean(data.workMode && data.workMode.trim().length > 0),
      category: 'preferences',
    },
    {
      id: 'preferredLocations',
      label: 'Preferred job locations',
      weight: 5,
      isDone: Boolean(data.preferredLocations && data.preferredLocations.length > 0),
      category: 'preferences',
    },
    {
      id: 'willingToRelocate',
      label: 'Relocation willingness',
      weight: 3,
      isDone: Boolean(
        data.willingToRelocate !== undefined &&
          data.willingToRelocate !== null &&
          data.willingToRelocate !== ''
      ),
      category: 'preferences',
    },
    {
      id: 'availability',
      label: 'Joining availability',
      weight: 3,
      isDone: Boolean(data.availability && data.availability.trim().length > 0),
      category: 'preferences',
    },
    {
      id: 'employmentType',
      label: 'Employment type',
      weight: 2,
      isDone: Boolean(data.employmentType && data.employmentType.trim().length > 0),
      category: 'preferences',
    },
    {
      id: 'noticePeriod',
      label: 'Notice period',
      weight: 2,
      isDone: Boolean(data.noticePeriod && data.noticePeriod.trim().length > 0),
      category: 'preferences',
    },

    // 4. Documents & Links (15%)
    {
      id: 'resumeFile',
      label: 'Resume PDF document',
      weight: 7,
      isDone: Boolean(data.resumeFile || data.resumeFileName || data.resumeUrl),
      category: 'docs',
    },
    {
      id: 'expectedCtc',
      label: 'Expected CTC',
      weight: 4,
      isDone: ctcDigits.length >= 4,
      category: 'docs',
    },
    {
      id: 'links',
      label: 'LinkedIn or Portfolio URL',
      weight: 4,
      isDone: Boolean(
        (data.linkedinLink && data.linkedinLink.trim().length > 0) ||
          (data.portfolioLink && data.portfolioLink.trim().length > 0)
      ),
      category: 'docs',
    },

    // 5. Technical Skills & Experience (25%)
    {
      id: 'specificSkill',
      label: 'Specific specialization skill',
      weight: 5,
      isDone: Boolean(data.specificSkill && data.specificSkill.trim().length >= 2),
      category: 'skills',
    },
    {
      id: 'coreSoftware',
      label: 'Core software mastery',
      weight: 5,
      isDone: Boolean(data.coreSoftware && data.coreSoftware.length >= 1),
      category: 'skills',
    },
    {
      id: 'technicalSkills',
      label: 'Technical skills',
      weight: 5,
      isDone: Boolean(data.technicalSkills && data.technicalSkills.length >= 1),
      category: 'skills',
    },
    {
      id: 'softSkills',
      label: 'Soft skills',
      weight: 5,
      isDone: Boolean(data.softSkills && data.softSkills.length >= 1),
      category: 'skills',
    },
    {
      id: 'experience',
      label: 'Experience or Fresher status',
      weight: 5,
      isDone: Boolean(
        data.isFresher ||
          (data.experiences &&
            data.experiences.some(
              (exp) => (exp.role || '').trim() && (exp.organisation || '').trim()
            ))
      ),
      category: 'skills',
    },
  ]

  const score = items.reduce((acc, curr) => (curr.isDone ? acc + curr.weight : acc), 0)
  const missingLabels = items.filter((i) => !i.isDone).map((i) => i.label)

  let tier: 'Draft' | 'Building' | 'Strong' | 'All-Star' = 'Draft'
  let tierColor = '#94a3b8'

  if (score >= 90) {
    tier = 'All-Star'
    tierColor = '#10b981'
  } else if (score >= 70) {
    tier = 'Strong'
    tierColor = '#00418f'
  } else if (score >= 40) {
    tier = 'Building'
    tierColor = '#f59e0b'
  }

  return {
    score,
    tier,
    tierColor,
    items,
    missingLabels,
  }
}
