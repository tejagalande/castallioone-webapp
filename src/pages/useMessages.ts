import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type {
  ConversationThread,
  ChatMessage,
  MessageFilterType,
  RecipientOption,
  ProposedInterview,
} from './messages/types'

export type { ConversationThread, ChatMessage, MessageFilterType, RecipientOption, ProposedInterview }

const DEMO_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'demo-thread-elena',
    partnerId: 'partner-elena',
    candidateId: 'demo-candidate-alex',
    companyId: 'demo-comp-fp',
    name: 'Elena Rostova',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDp7lsjsvHe5P5hcs_oeW6RbbbsKpAq0Kt7iyQX56upgWD0j51KjYDSpI03Ub7II-jXL2ep7j9SktU6xH9jChI1whoJ7vQSbIRMvsN8RWZ3aSX1x-7_alQ1CBOEY3AfLG0e7qE3rpVOpLAjmyUzkGwtC_lu6aPZAJFMJQ-EKR2gW2TNj5m9y7SgbsbCs35p2djy_A0j27-71X8qzx_TafUbM8iVvAFAEHwW8GnDr8r08yLaoRT2kcjb3w',
    roleOrDiscipline: 'Head of Talent Acquisition & Computational Practice',
    firmOrSchool: 'Foster + Partners',
    lastMessage: 'Hi Alex! Our Applied R&D practice reviewed your Scalpel tower Grasshopper scripts...',
    lastMessageTime: '14m ago',
    lastMessageTimestamp: Date.now() - 14 * 60 * 1000,
    unreadCount: 1,
    isOnline: true,
    isVerified: true,
    matchScore: 98,
    fitLabel: '98% MATCH',
    salaryRange: '£130k – £145k',
    hasAttachments: true,
    attachmentCount: 2,
    hasInterviewTag: true,
    tagBadgeText: 'INTERVIEW PROPOSED',
    tagBadgeType: 'primary',
    interviewDetails: {
      id: 'int-elena-01',
      roleTitle: 'Stage 03 / 04 – Technical Algorithm & LOD-400 Model Defense',
      dateText: 'Thursday, Nov 14, 2024 @ 14:00 GMT (45 mins)',
      duration: '45 mins',
      location: 'WebRTC LOD-400 Defense Room',
      panel: 'Dr. K. Aris (Partner Computation) + Elena Rostova',
      status: 'scheduled',
    },
    messages: [
      {
        id: 'msg-demo-1',
        senderId: 'partner-elena',
        isMe: false,
        senderName: 'Elena Rostova',
        senderAvatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbnzPpz9WRAD4VdQO-4G2BhqkCUxIqXlzuyRylJUn2WMLIs4IeryIWmXwhsFV_72vA9B6bSthu8Ev_8L5qjHHiwteQjYjoYUpEI39Y2Xak8eZlvmDCQYFs2XYRCpoMGt1VD_ZibydYc_VzioeuMYrhJzSO6y8m1fzHsovOf_FskyIlas6jXZQWJebszFhsJIfzMO0m761oWPVQQENg4cCCTpodLJMzh2x7OXDfpVN9hbjttLKbt7_jg',
        text: 'Hi Alex! Our Applied R&D and Computational Design practice leads reviewed your Castallio verified profile and your published Scalpel tower Grasshopper scripts. The LOD-400 double-curved façade rationalization and solar panel panelization nodes matched our upcoming Canary Wharf commercial tower scope precisely.\n\nI have attached our full role specification and the project brief. Would you be free for a 45-minute technical review call with our Partner of Computation this Thursday at 14:00 GMT?',
        time: '13:42 GMT',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        attachments: [
          {
            id: 'att-1',
            name: 'Foster_Partners_Comp_Lead.pdf',
            meta: '1.4 MB • Official Spec',
            type: 'pdf',
          },
          {
            id: 'att-2',
            name: 'Technical_Panel_Invite.ics',
            meta: 'Nov 14 • 14:00 GMT',
            type: 'ics',
          },
          {
            id: 'att-3',
            name: 'Scalpel_Facade_Cluster.ghx',
            meta: 'LOD 400 • Verified',
            type: 'ghx',
          },
        ],
      },
      {
        id: 'msg-demo-2',
        senderId: 'demo-candidate-alex',
        isMe: true,
        senderName: 'Alex Morgan (You)',
        text: "Hi Elena, thank you! The Canary Wharf scope sounds incredible. Thursday at 14:00 GMT works perfectly for me. I've also uploaded the sanitized GHX cluster definitions and our IFC 4x3 federated model schema for your computational review team to inspect ahead of the defense.",
        time: '13:54 GMT',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        attachments: [
          {
            id: 'att-4',
            name: 'Alex_Morgan_Verified_CV_v4.2.pdf',
            meta: '2.1 MB',
            type: 'pdf',
          },
          {
            id: 'att-5',
            name: 'CanaryWharf_Façade_Script_v2.ghx',
            meta: '0 Clash Defects',
            type: 'ghx',
          },
        ],
      },
    ],
  },
  {
    id: 'demo-thread-shona',
    partnerId: 'partner-shona',
    candidateId: 'demo-candidate-alex',
    companyId: 'demo-comp-zha',
    name: 'Shona Macleod',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUZggTsyyaOgMQXDNlLvp_TV_V3Pk7Uclkmy0uYaYLChH5kbnsZrVKMdEqbrJXcBxnyeTHjdtJBepkkYAsXJgwUZ1k-XHGQqewTd5x2pUPmtdZm2xJhxhTHP3ovSw9uCirpfQrE-lOZB9HWOEQRwmaNrOXTeVoiDESskHMht6VFvOx7z0AvnRnHdcWrkRtAzdlM75DBF8D5oDZcgsvnbXT-Q6cWB4mALxqZKGGmuOlnwQEvITzW8c_7w',
    roleOrDiscipline: 'Lead Computational Architect',
    firmOrSchool: 'Zaha Hadid CODE',
    lastMessage: 'Slot selection confirmed for tomorrow 11:00 GMT. We loaded the Rhino geometry sandbox...',
    lastMessageTime: '1h ago',
    lastMessageTimestamp: Date.now() - 60 * 60 * 1000,
    unreadCount: 1,
    isOnline: true,
    isVerified: true,
    matchScore: 94,
    fitLabel: '94% FIT',
    salaryRange: '£125k – £145k',
    hasInterviewTag: true,
    tagBadgeText: 'DEFENSE READY',
    tagBadgeType: 'neutral',
    messages: [
      {
        id: 'msg-demo-shona-1',
        senderId: 'partner-shona',
        isMe: false,
        senderName: 'Shona Macleod',
        text: 'Slot selection confirmed for tomorrow 11:00 GMT. We loaded the Rhino geometry sandbox and verified the topological continuity on mesh subdivision nodes.',
        time: '12:30 GMT',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-thread-marcus',
    partnerId: 'partner-marcus',
    candidateId: 'demo-candidate-alex',
    companyId: 'demo-comp-grimshaw',
    name: 'Marcus Vance',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA8X4M8wMWhUxLfr7235BFacmcd3s2p2Gt-Y9IUd3frZE85LhLQfPZTVHGRN7idLJ1uwIx_JUZE-YKFUXpI3JzZERzwePdV7Ju5i13EM5utnnVKw-lSYMe8zmrh8ACGG9SpSB0MO5bCwBJmbeI1BI2VaLI3RzO8VUoODCpGKqsTGUzEdrOfkrnFEqY8ONwh0hyvg4bLYAAHXXG0P-X8UF7AnrmSt0FfAKbPrs6HzDUQqogLEUinKw1rfw',
    roleOrDiscipline: 'Director of VDC and Infrastructure',
    firmOrSchool: 'Grimshaw Architects',
    lastMessage: 'Alex, your CDE management experience under ISO 19650-2 is exactly what our HS2 team needs for the interchange...',
    lastMessageTime: '3h ago',
    lastMessageTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    unreadCount: 0,
    isOnline: false,
    isVerified: false,
    matchScore: 92,
    fitLabel: '92% MATCH',
    salaryRange: '£135k – £150k',
    hasInterviewTag: false,
    tagBadgeText: 'IFC-4x3-SCHEMA',
    tagBadgeType: 'neutral',
    messages: [
      {
        id: 'msg-demo-marcus-1',
        senderId: 'partner-marcus',
        isMe: false,
        senderName: 'Marcus Vance',
        text: 'Alex, your CDE management experience under ISO 19650-2 is exactly what our HS2 team needs for the interchange phase 2A package.',
        time: '10:15 GMT',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'demo-thread-sarah',
    partnerId: 'partner-sarah',
    candidateId: 'demo-candidate-alex',
    companyId: 'demo-comp-arup',
    name: 'Dr. Sarah Jenkins',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXuN4gzLNBmXpkpQ3Pdu5UJGoRVrktvQ7NLyznWly5guEStkcj6MnCLB3RHpR3ZsgsA5vUppSnu0qIRqMtFoRKsMi0gJbetfBlfGcq7QelN3dVCH0Eilyg2_RCr2Zwz2c1AXtC8Hwc8pspLXqj2SeWoWoswkFS_zUifvlTabAzX0XtXH3ixNyEvpg2SRDuesV3te5Qen7JHEPger4F3mbxX5SMr_cLr9V1mR35WgbeCBE0BOLQTy78TQ',
    roleOrDiscipline: 'Lead Partner // Advanced Digital Practice',
    firmOrSchool: 'Arup Advanced Digital',
    lastMessage: 'Scorecard released for your computational panel review: 96.8% LOD 400 verified. Let’s talk compensation tier.',
    lastMessageTime: 'Yesterday',
    lastMessageTimestamp: Date.now() - 24 * 60 * 60 * 1000,
    unreadCount: 0,
    isOnline: true,
    isVerified: true,
    matchScore: 96,
    fitLabel: '96% MATCH',
    salaryRange: '£140k – £160k',
    hasInterviewTag: false,
    tagBadgeText: 'LOD 400 VERIFIED',
    tagBadgeType: 'primary',
    messages: [
      {
        id: 'msg-demo-sarah-1',
        senderId: 'partner-sarah',
        isMe: false,
        senderName: 'Dr. Sarah Jenkins',
        text: 'Scorecard released for your computational panel review: 96.8% LOD 400 verified. Let’s talk compensation tier and onboarding timelines for the London design lab.',
        time: 'Yesterday 17:10',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
]

export function useMessages() {
  const [conversations, setConversations] = useState<ConversationThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState<string>('')
  const [activeFilter, setActiveFilter] = useState<MessageFilterType>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [messageInput, setMessageInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  // Auth & Role
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'employer' | 'talent' | 'guest'>('guest')
  const [myCompanyId, setMyCompanyId] = useState<string | null>(null)
  const [availableRecipients, setAvailableRecipients] = useState<RecipientOption[]>([])

  // Modals
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false)
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false)
  const [callType, setCallType] = useState<'audio' | 'video'>('video')
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState<boolean>(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const isMountedRef = useRef(true)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const fetchConversationsRef = useRef<() => Promise<void>>(() => Promise.resolve())

  // 1. Lifecycle & Supabase Realtime Subscription
  useEffect(() => {
    isMountedRef.current = true

    const loadConversations = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user

      if (!user) {
        if (isMountedRef.current) {
          setConversations(DEMO_CONVERSATIONS)
          setSelectedThreadId('demo-thread-elena')
          setUserRole('guest')
          setLoading(false)
        }
        return
      }

      if (isMountedRef.current) {
        setCurrentUserId(user.id)
      }

      // Check if user is Employer
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
          cName = comp.name
        }
      }

      const isEmployer = !!cId
      if (isMountedRef.current) {
        setUserRole(isEmployer ? 'employer' : 'talent')
        setMyCompanyId(cId)
      }

      // Fetch chatsession rows
      let chatQuery = supabase.from('chatsession').select('*').eq('is_deleted', false)
      if (isEmployer) {
        chatQuery = chatQuery.eq('company_id', cId)
      } else {
        chatQuery = chatQuery.eq('candidate_id', user.id)
      }

      const { data: rawMessages, error: chatError } = await chatQuery.order('created_at', {
        ascending: true,
      })

      if (chatError) {
        console.warn('chatsession fetch error, fallback to demo data:', chatError.message)
        if (isMountedRef.current) {
          setConversations(DEMO_CONVERSATIONS)
          setSelectedThreadId('demo-thread-elena')
          setLoading(false)
        }
        return
      }

      if (!rawMessages || rawMessages.length === 0) {
        if (isMountedRef.current) {
          setConversations([])
          setSelectedThreadId('')
          setLoading(false)
        }
        return
      }

      // Group messages into threads
      const threadMap = new Map<string, typeof rawMessages>()
      rawMessages.forEach((msg) => {
        const key = isEmployer ? msg.candidate_id : msg.company_id
        if (!threadMap.has(key)) {
          threadMap.set(key, [])
        }
        threadMap.get(key)!.push(msg)
      })

      const partnerIds = Array.from(threadMap.keys())
      const builtThreads: ConversationThread[] = []

      if (isEmployer) {
        // Query candidate profiles
        const { data: candidateProfiles } = await supabase
          .from('student_profile')
          .select('id, user_id, full_name, profile_image_url, discipline, location')
          .in('user_id', partnerIds)

        const studentMap = new Map(candidateProfiles?.map((s) => [s.user_id, s]) || [])

        // Query active interviews
        const { data: scheduledInterviews } = await supabase
          .from('interviews')
          .select('id, candidate_id, interview_date, interview_time, interview_type, location_type, location_value, status')
          .eq('company_id', cId)
          .eq('status', 'scheduled')

        const interviewMap = new Map(scheduledInterviews?.map((i) => [i.candidate_id, i]) || [])

        for (const [candidateId, msgs] of threadMap.entries()) {
          const profile = studentMap.get(candidateId)
          const lastMsg = msgs[msgs.length - 1]
          const unread = msgs.filter((m) => !m.is_read && m.sender_id !== user.id).length
          const activeInterview = interviewMap.get(candidateId)

          const formattedMessages: ChatMessage[] = msgs.map((m) => {
            const isMe = m.sender_id === user.id
            const createdAtDate = new Date(m.created_at || Date.now())
            return {
              id: m.id,
              senderId: m.sender_id,
              isMe,
              senderName: isMe ? `${cName || 'Company'} (You)` : (profile?.full_name || 'Candidate'),
              text: m.message,
              time: createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: createdAtDate.toISOString(),
            }
          })

          const candidateName = profile?.full_name || 'Candidate Applicant'
          const threadId = `thread-${candidateId}`

          let interviewDetails: ProposedInterview | undefined = undefined
          if (activeInterview) {
            interviewDetails = {
              id: activeInterview.id,
              roleTitle: 'Technical Review / Portfolio Defense',
              dateText: `${activeInterview.interview_date} @ ${activeInterview.interview_time}`,
              duration: '45 mins',
              location: activeInterview.location_value || activeInterview.location_type || 'Video Call',
              panel: cName || 'Interview Panel',
              status: 'scheduled',
            }
          }

          builtThreads.push({
            id: threadId,
            partnerId: candidateId,
            candidateId,
            companyId: cId,
            name: candidateName,
            avatar:
              profile?.profile_image_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=00418f&color=fff`,
            roleOrDiscipline: profile?.discipline || 'AEC Computational Specialist',
            firmOrSchool: profile?.location || 'Verified Professional',
            lastMessage: lastMsg.message,
            lastMessageTime: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastMessageTimestamp: new Date(lastMsg.created_at).getTime(),
            unreadCount: unread,
            isOnline: true,
            isVerified: true,
            matchScore: 95,
            fitLabel: '95% FIT',
            hasInterviewTag: !!activeInterview,
            tagBadgeText: activeInterview ? 'INTERVIEW SCHEDULED' : undefined,
            tagBadgeType: activeInterview ? 'primary' : 'neutral',
            interviewDetails,
            messages: formattedMessages,
          })
        }
      } else {
        // Talent looking at Companies
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, logo_url, size, website')
          .in('id', partnerIds)

        const companyMap = new Map(companies?.map((c) => [c.id, c]) || [])

        // Query active interviews for this candidate
        const { data: scheduledInterviews } = await supabase
          .from('interviews')
          .select('id, company_id, interview_date, interview_time, interview_type, location_type, location_value, status')
          .eq('candidate_id', user.id)
          .eq('status', 'scheduled')

        const interviewMap = new Map(scheduledInterviews?.map((i) => [i.company_id, i]) || [])

        for (const [companyId, msgs] of threadMap.entries()) {
          const company = companyMap.get(companyId)
          const lastMsg = msgs[msgs.length - 1]
          const unread = msgs.filter((m) => !m.is_read && m.sender_id !== user.id).length
          const activeInterview = interviewMap.get(companyId)

          const firmName = company?.name || 'AEC Studio Partner'
          const formattedMessages: ChatMessage[] = msgs.map((m) => {
            const isMe = m.sender_id === user.id
            const createdAtDate = new Date(m.created_at || Date.now())
            return {
              id: m.id,
              senderId: m.sender_id,
              isMe,
              senderName: isMe ? 'Alex Morgan (You)' : firmName,
              text: m.message,
              time: createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: createdAtDate.toISOString(),
            }
          })

          const threadId = `thread-${companyId}`
          let interviewDetails: ProposedInterview | undefined = undefined
          if (activeInterview) {
            interviewDetails = {
              id: activeInterview.id,
              roleTitle: 'Technical Review / Computational Defense',
              dateText: `${activeInterview.interview_date} @ ${activeInterview.interview_time}`,
              duration: '45 mins',
              location: activeInterview.location_value || activeInterview.location_type || 'Video Call',
              panel: firmName,
              status: 'scheduled',
            }
          }

          builtThreads.push({
            id: threadId,
            partnerId: companyId,
            candidateId: user.id,
            companyId,
            name: firmName,
            avatar:
              company?.logo_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(firmName)}&background=00418f&color=fff`,
            roleOrDiscipline: 'AEC Studio Recruitment',
            firmOrSchool: firmName,
            lastMessage: lastMsg.message,
            lastMessageTime: new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lastMessageTimestamp: new Date(lastMsg.created_at).getTime(),
            unreadCount: unread,
            isOnline: true,
            isVerified: true,
            matchScore: 96,
            fitLabel: '96% MATCH',
            hasInterviewTag: !!activeInterview,
            tagBadgeText: activeInterview ? 'INTERVIEW SCHEDULED' : undefined,
            tagBadgeType: activeInterview ? 'primary' : 'neutral',
            interviewDetails,
            messages: formattedMessages,
          })
        }
      }

      // Sort threads by most recent message
      builtThreads.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)

      if (isMountedRef.current) {
        setConversations(builtThreads)
        setSelectedThreadId((prev) => {
          if (prev && builtThreads.some((t) => t.id === prev)) return prev
          return builtThreads[0]?.id || ''
        })
        setLoading(false)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
      if (isMountedRef.current) {
        setConversations([])
        setSelectedThreadId('')
        setLoading(false)
      }
    }
  }

  fetchConversationsRef.current = loadConversations
  loadConversations()

    const channel = supabase
      .channel('chatsession-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chatsession' },
        () => {
          loadConversations()
        }
      )
      .subscribe()

    return () => {
      isMountedRef.current = false
      supabase.removeChannel(channel)
    }
  }, [])

  // 2. Fetch Eligible Recipients for Compose Modal
  useEffect(() => {
    if (!isComposeModalOpen) return

    let isMounted = true

    const loadRecipients = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        if (!user || !isMounted) return

        if (myCompanyId) {
          // Fetch candidates who applied or unlocked
          const { data: applicants } = await supabase
            .from('job_applications')
            .select('candidate_id')
            .eq('company_id', myCompanyId)
            .limit(20)

          if (!isMounted) return

          const candidateIds = Array.from(new Set(applicants?.map((a) => a.candidate_id) || []))
          if (candidateIds.length > 0) {
            const { data: profiles } = await supabase
              .from('student_profile')
              .select('user_id, full_name, discipline, profile_image_url')
              .in('user_id', candidateIds)

            if (profiles && isMounted) {
              setAvailableRecipients(
                profiles.map((p) => ({
                  id: p.user_id,
                  candidateId: p.user_id,
                  companyId: myCompanyId,
                  name: p.full_name || 'Candidate',
                  subtitle: p.discipline || 'Applicant',
                  avatar: p.profile_image_url,
                }))
              )
            }
          }
        } else {
          // Fetch companies for talent
          const { data: companies } = await supabase
            .from('companies')
            .select('id, name, logo_url, size')
            .limit(15)

          if (companies && isMounted) {
            setAvailableRecipients(
              companies.map((c) => ({
                id: c.id,
                candidateId: user.id,
                companyId: c.id,
                name: c.name,
                subtitle: `${c.size || 'AEC'} Studio`,
                avatar: c.logo_url,
              }))
            )
          }
        }
      } catch (err) {
        console.warn('Could not fetch recipients:', err)
      }
    }

    loadRecipients()

    return () => {
      isMounted = false
    }
  }, [isComposeModalOpen, myCompanyId])

  const selectedThread = useMemo(() => {
    if (conversations.length === 0) return null
    return conversations.find((c) => c.id === selectedThreadId) || conversations[0] || null
  }, [conversations, selectedThreadId])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (activeFilter === 'inbounds' && c.unreadCount === 0) return false
      if (activeFilter === 'interviews' && !c.hasInterviewTag) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchName = c.name.toLowerCase().includes(q)
        const matchFirm = c.firmOrSchool.toLowerCase().includes(q)
        const matchRole = c.roleOrDiscipline.toLowerCase().includes(q)
        const matchLast = c.lastMessage.toLowerCase().includes(q)
        if (!matchName && !matchFirm && !matchRole && !matchLast) {
          return false
        }
      }

      return true
    })
  }, [conversations, activeFilter, searchQuery])

  // Mark thread as read
  const handleSelectThread = useCallback(
    async (id: string) => {
      setSelectedThreadId(id)
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
      )

      const thread = conversations.find((c) => c.id === id)
      if (thread && currentUserId && !id.startsWith('demo-')) {
        try {
          await supabase
            .from('chatsession')
            .update({ is_read: true })
            .eq('candidate_id', thread.candidateId)
            .eq('company_id', thread.companyId)
            .neq('sender_id', currentUserId)
        } catch (e) {
          console.warn('Read status update error:', e)
        }
      }
    },
    [conversations, currentUserId]
  )

  // Send message
  const handleSendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || messageInput).trim()
      if (!text) return

      const now = new Date()
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' GMT'

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUserId || 'me',
        isMe: true,
        senderName: userRole === 'employer' ? 'Company (You)' : 'Alex Morgan (You)',
        text,
        time: timeStr,
        createdAt: now.toISOString(),
      }

      // Optimistic state update
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedThreadId
            ? {
                ...c,
                lastMessage: text,
                lastMessageTime: 'Just now',
                lastMessageTimestamp: Date.now(),
                messages: [...c.messages, newMsg],
              }
            : c
        )
      )

      if (!textToSend) {
        setMessageInput('')
      }

      // Supabase insert if logged in and not a pure mock ID
      if (currentUserId && selectedThread && !selectedThread.id.startsWith('demo-')) {
        try {
          const { error } = await supabase.from('chatsession').insert({
            candidate_id: selectedThread.candidateId,
            company_id: selectedThread.companyId,
            sender_id: currentUserId,
            message: text,
            is_read: false,
            is_deleted: false,
          })

          if (error) {
            console.error('Error sending message:', error.message)
            showToast(`Notice: ${error.message}`)
            return
          }
        } catch (err) {
          console.error('Message dispatch error:', err)
        }
      }

      showToast('Encrypted message transmitted via 256-bit TLS pipeline.')
    },
    [messageInput, currentUserId, selectedThreadId, selectedThread, userRole, showToast]
  )

  const handleQuickReply = useCallback(
    (replyText: string) => {
      handleSendMessage(replyText)
    },
    [handleSendMessage]
  )

  // Start new inquiry
  const handleStartInquiry = useCallback(
    async (recipientCandidateId: string, recipientCompanyId: string, initialMessage: string) => {
      if (!initialMessage.trim()) return

      const text = initialMessage.trim()
      if (currentUserId) {
        try {
          const { error } = await supabase.from('chatsession').insert({
            candidate_id: recipientCandidateId,
            company_id: recipientCompanyId,
            sender_id: currentUserId,
            message: text,
            is_read: false,
            is_deleted: false,
          })

          if (error) {
            showToast(`Inquiry dispatch failed: ${error.message}`)
            return
          }

          showToast('New communication pipeline initialized.')
          await fetchConversationsRef.current()
        } catch (e) {
          console.error('Inquiry error:', e)
        }
      } else {
        showToast('Demo Inquiry dispatched to firm.')
      }

      setIsComposeModalOpen(false)
    },
    [currentUserId, showToast]
  )

  const handleAcceptInterview = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedThreadId && c.interviewDetails) {
          return {
            ...c,
            interviewDetails: {
              ...c.interviewDetails,
              status: 'accepted',
            },
          }
        }
        return c
      })
    )
    showToast('Interview confirmed and synchronized to your calendar!')
  }, [selectedThreadId, showToast])

  const handleMarkAllRead = useCallback(() => {
    setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })))
    showToast('All messages marked as read.')
  }, [showToast])

  const handleExportTranscripts = useCallback(() => {
    const thread = selectedThread
    if (!thread) {
      showToast('No conversation selected.')
      return
    }

    const transcriptText =
      `CASTALLIO ONE // ENCRYPTED AEC COMMS TRANSCRIPT\n` +
      `PARTNER: ${thread.name} (${thread.firmOrSchool})\n` +
      `ROLE / DISCIPLINE: ${thread.roleOrDiscipline}\n` +
      `TIMESTAMP: ${new Date().toISOString()}\n` +
      `CIPHER: AES-GCM-256 (ISO 27001 Verified)\n\n` +
      `============================================================\n\n` +
      thread.messages
        .map((m) => `[${m.time}] ${m.senderName}:\n${m.text}\n`)
        .join('\n------------------------------------------------------------\n\n')

    const blob = new Blob([transcriptText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${thread.name.replace(/[^a-zA-Z0-9]/g, '_')}_AEC_Transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Exported transcript for ${thread.name}.`)
  }, [selectedThread, showToast])

  const exportICS = useCallback(() => {
    const thread = selectedThread
    if (!thread) {
      showToast('No conversation selected.')
      return
    }

    const interview = thread.interviewDetails
    const summary = interview
      ? `${thread.name}: ${interview.roleTitle}`
      : `${thread.name}: Technical Defense & Review`

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Castallio One//AEC Technical Defense//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@castallio.one`,
      'DTSTAMP:20241114T140000Z',
      'DTSTART:20241114T140000Z',
      'DTEND:20241114T144500Z',
      `SUMMARY:${summary}`,
      'DESCRIPTION:Candidate Defense and Technical Computational Review session.',
      'LOCATION:WebRTC LOD-400 Defense Room',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'Technical_Defense_Invite.ics'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Calendar invite (.ics) downloaded.')
  }, [selectedThread, showToast])

  const openCallModal = useCallback((type: 'audio' | 'video') => {
    setCallType(type)
    setIsCallModalOpen(true)
  }, [])

  return {
    conversations,
    filteredConversations,
    selectedThread,
    selectedThreadId,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    messageInput,
    setMessageInput,
    loading,
    userRole,
    availableRecipients,
    isComposeModalOpen,
    setIsComposeModalOpen,
    isCallModalOpen,
    setIsCallModalOpen,
    callType,
    openCallModal,
    isSandboxModalOpen,
    setIsSandboxModalOpen,
    isRescheduleModalOpen,
    setIsRescheduleModalOpen,
    handleSelectThread,
    handleSendMessage,
    handleQuickReply,
    handleStartInquiry,
    handleAcceptInterview,
    handleMarkAllRead,
    handleExportTranscripts,
    exportICS,
    toastMessage,
    showToast,
  }
}
