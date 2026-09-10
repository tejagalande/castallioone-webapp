import { useState, useMemo, useCallback } from 'react'

export interface ChatAttachment {
  id: string
  name: string
  meta: string
  type: 'pdf' | 'ics' | 'ghx' | 'ifc'
  downloadUrl?: string
}

export interface ChatMessage {
  id: string
  sender: 'recruiter' | 'candidate'
  senderName: string
  senderAvatar?: string
  text: string
  time: string
  attachments?: ChatAttachment[]
  isVerifiedBadge?: boolean
}

export interface ProposedInterview {
  id: string
  roleTitle: string
  dateText: string
  duration: string
  location: string
  status: 'proposed' | 'accepted' | 'rescheduled'
}

export interface ConversationThread {
  id: string
  recruiterName: string
  recruiterAvatar: string
  recruiterRole: string
  firmName: string
  firmInitial: string
  roleTitle: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  isVerified: boolean
  matchScore: number
  salaryRange: string
  hasAttachments?: boolean
  attachmentCount?: number
  hasInterviewTag?: boolean
  interviewDetails?: ProposedInterview
  messages: ChatMessage[]
}

const INITIAL_CONVERSATIONS: ConversationThread[] = [
  {
    id: 'thread-elena',
    recruiterName: 'Elena Rostova',
    recruiterAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9tW3CfaejFMbBspVFmuB7UUBnWKfuJedba-9i85PDrJYoa_Sf-uoCuq6dA5qRt9E013sH3Qu1JER0VQMmHKhDY4uauw8TMp9uH_P70JU6oHQ5C122hoJs5IwNA5d5vwfXRF8D9p1DEfp4JDvcASiL6pUtQ6P4FuoE1SFjtzUH9u0JsUOe2U3-qzKoDTOVYhpZllbCRvHL3PUtByNw9HmL7vURTIdl6Q87rgaTeADhA8hhNImuHFqbg',
    recruiterRole: 'Lead Talent Acquisition // Global Computational Architecture Practice',
    firmName: 'Foster + Partners',
    firmInitial: 'F+P',
    roleTitle: 'Lead Computational Designer & Parametric Lead',
    lastMessage: 'Hi Alex, our computational practice team reviewed your Scalpel tower Grasshopper scripts...',
    lastMessageTime: '14m ago',
    unreadCount: 1,
    isOnline: true,
    isVerified: true,
    matchScore: 96,
    salaryRange: '£130k-£155k',
    hasAttachments: true,
    attachmentCount: 2,
    hasInterviewTag: true,
    interviewDetails: {
      id: 'int-elena-01',
      roleTitle: 'Lead Computational Designer & Parametric Lead',
      dateText: 'Thursday, Nov 7, 2024 @ 14:00 GMT',
      duration: '45 mins',
      location: 'Google Meet (Encrypted Video)',
      status: 'proposed',
    },
    messages: [
      {
        id: 'msg-1',
        sender: 'recruiter',
        senderName: 'Elena Rostova',
        senderAvatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9tW3CfaejFMbBspVFmuB7UUBnWKfuJedba-9i85PDrJYoa_Sf-uoCuq6dA5qRt9E013sH3Qu1JER0VQMmHKhDY4uauw8TMp9uH_P70JU6oHQ5C122hoJs5IwNA5d5vwfXRF8D9p1DEfp4JDvcASiL6pUtQ6P4FuoE1SFjtzUH9u0JsUOe2U3-qzKoDTOVYhpZllbCRvHL3PUtByNw9HmL7vURTIdl6Q87rgaTeADhA8hhNImuHFqbg',
        text: 'Hi Alex! Our Applied R&D and Computational Design practice leads reviewed your Castallio verified profile and your published Scalpel tower Grasshopper scripts. The LOD-400 double-curved façade rationalization and solar panel panelization nodes matched our upcoming Canary Wharf commercial tower scope precisely.',
        time: '13:42',
      },
      {
        id: 'msg-2',
        sender: 'recruiter',
        senderName: 'Elena Rostova',
        senderAvatar:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDV9tW3CfaejFMbBspVFmuB7UUBnWKfuJedba-9i85PDrJYoa_Sf-uoCuq6dA5qRt9E013sH3Qu1JER0VQMmHKhDY4uauw8TMp9uH_P70JU6oHQ5C122hoJs5IwNA5d5vwfXRF8D9p1DEfp4JDvcASiL6pUtQ6P4FuoE1SFjtzUH9u0JsUOe2U3-qzKoDTOVYhpZllbCRvHL3PUtByNw9HmL7vURTIdl6Q87rgaTeADhA8hhNImuHFqbg',
        text: 'I have attached our full role specification and the project brief. Would you be free for a 45-minute technical review call with our Partner of Computation this Thursday at 14:00 GMT?',
        time: '13:44',
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
            meta: 'Calendar sync invite',
            type: 'ics',
          },
        ],
      },
      {
        id: 'msg-3',
        sender: 'candidate',
        senderName: 'Alex Morgan',
        text: "Hi Elena, thank you! The Canary Wharf scope sounds incredible. Thursday at 14:00 GMT works perfectly for me. I've also uploaded the sanitized GHX cluster definitions and our IFC federated model schema for your computational review team to inspect ahead of our conversation.",
        time: '13:58',
        attachments: [
          {
            id: 'att-3',
            name: 'Alex_Scalpel_Façade_Nodes.ghx',
            meta: '8.2 MB • Grasshopper 1.0',
            type: 'ghx',
          },
        ],
      },
    ],
  },
  {
    id: 'thread-marcus',
    recruiterName: 'Marcus Vance',
    recruiterAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuApv01oKymcrfehZAM2EH8s-Q1aZZmVpgQPB6MVHVmokYd4g9sKIR3dxENlnsSmQvxa-S9RsqbagoKrZ-OrAs2ABuslTeqFv6t8NWAJAsKCXoCBFwUQstr6LKRuhn0Y4l4tz1SG074fbQUUJI7y8Qv4-6ADr8vHtiqr9s_grS8W8sC1xJ8a37bgMVTSKhN4n79mt5HJ3lET3bGJeB3qkgUhFUt7bKEjAJAuJHnLOKeprLzrWVcq0msc3A',
    recruiterRole: 'Design Technology Director',
    firmName: 'Grimshaw Architects',
    firmInitial: 'G',
    roleTitle: 'High-Speed Rail Interchange Transit Hub',
    lastMessage: 'Alex, your CDE management experience under ISO 19650-2 is exactly what we need...',
    lastMessageTime: '2h ago',
    unreadCount: 1,
    isOnline: true,
    isVerified: true,
    matchScore: 98,
    salaryRange: '£140k-£160k',
    messages: [
      {
        id: 'm-grimshaw-1',
        sender: 'recruiter',
        senderName: 'Marcus Vance',
        text: 'Alex, your CDE management experience under ISO 19650-2 is exactly what we need for our upcoming expansion.',
        time: '11:20',
      },
    ],
  },
  {
    id: 'thread-sarah',
    recruiterName: 'Sarah Jenkins',
    recruiterAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuASKn_SpSIVi47OBWOcnj41OrUACKUn3Xdshn1vFVWkArkhBTRNOiaX5tHKb515HtVWTMyqscrNuyc5OKCwfpF-ttfiVlX7gpSdRnbCc9OluEpsxr2M6dwqjGX_hKbdr_tv_e_wtFBSz-Zz3PaTgCWwRooBiAiE6vkTDimPVt9shTcRd19UD0iBODYRg-Irzn-gd-SXSRpjH7ZAtj_JkwScklNNgu5ApYDtTI5xDO8p1eYt2otmya6uQw',
    recruiterRole: 'Senior Technical Recruiter',
    firmName: 'Arup London',
    firmInitial: 'ARUP',
    roleTitle: 'Senior BIM Manager — Infrastructure',
    lastMessage: 'Thanks for sending through the CanBIM level 3 credentials. Hiring committee validated...',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    isVerified: true,
    matchScore: 94,
    salaryRange: '£125k-£145k',
    messages: [
      {
        id: 'm-arup-1',
        sender: 'recruiter',
        senderName: 'Sarah Jenkins',
        text: 'Thanks for sending through the CanBIM level 3 credentials. Hiring committee validated your portfolio.',
        time: 'Yesterday 16:45',
      },
    ],
  },
  {
    id: 'thread-david',
    recruiterName: 'David Kim',
    recruiterAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAP-yiZqO-ZikfjMEO1CImKO5n16LJYVjjcPA_cTCRWq4ABsl1nm_O7CkYyityuBfz-hb2VVr7uqOKjc0Uet_WTIsK7J1jRz0L-YdW1Svthkr_qJ6VA2N7bjwJWKN-VE9-s9rVD6g_Dm6kmaLpflcPgdbiZyoqWPwG1kCo9C2UpJg4alTNo6cZmfLtzDfB5uNdoeA1PZpZmooXsY7NXJsplAoaBOwfba8Xcp0S6M1Z26PWbhxLG38SbOw',
    recruiterRole: 'Head of VDC Construction',
    firmName: 'Balfour Beatty',
    firmInitial: 'BB',
    roleTitle: 'Synchro 4D Site Logistics Consultation',
    lastMessage: "The clash reduction metrics you showed on Canary Wharf are impressive. Let's touch base...",
    lastMessageTime: 'Oct 28',
    unreadCount: 0,
    isOnline: false,
    isVerified: true,
    matchScore: 89,
    salaryRange: '£115k-£135k',
    messages: [
      {
        id: 'm-bb-1',
        sender: 'recruiter',
        senderName: 'David Kim',
        text: "The clash reduction metrics you showed on Canary Wharf are impressive. Let's touch base next week.",
        time: 'Oct 28',
      },
    ],
  },
  {
    id: 'thread-claire',
    recruiterName: 'Claire Dupont',
    recruiterAvatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4tbdMT0oM_lfyGpxL0Euis-AgRgoALBicY-I-y-Pcduor0IYIsr6Tsx2xCUmHvrbku8PThAa-kc91FFa0YbaNxOCmdPyVjXPqYrt38rXuVCnS79N4AOfQtbZxt3c5dn1Gox2DxbdTqHoPjvdbS8Lc0AnjZrbpn3kXN6a5gC-bYa2ChVmQGK0wMzkWAHWdQYkse_qNgHLjOHzKwlsnUcybO0Qo2aRqDa8tso5JB0JTyHHHFMeZwQo0PQ',
    recruiterRole: 'Talent Lead',
    firmName: 'Zaha Hadid Architects',
    firmInitial: 'ZHA',
    roleTitle: 'Parametric Façade Scripting Specialist',
    lastMessage: 'We noticed your NURBS surface optimization repository. Are you open to relocating?',
    lastMessageTime: 'Oct 26',
    unreadCount: 0,
    isOnline: false,
    isVerified: true,
    matchScore: 92,
    salaryRange: '£120k-£140k',
    messages: [
      {
        id: 'm-zha-1',
        sender: 'recruiter',
        senderName: 'Claire Dupont',
        text: 'We noticed your NURBS surface optimization repository. Are you open to relocating to our London design cluster?',
        time: 'Oct 26',
      },
    ],
  },
]

export function useMessages() {
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS)
  const [selectedThreadId, setSelectedThreadId] = useState<string>('thread-elena')
  const [activeFilter, setActiveFilter] = useState<'all' | 'inbounds' | 'interviews' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [messageInput, setMessageInput] = useState<string>('')
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current))
    }, 3500)
  }, [])

  const selectedThread = useMemo(() => {
    return conversations.find((c) => c.id === selectedThreadId) || conversations[0]
  }, [conversations, selectedThreadId])

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (activeFilter === 'inbounds' && c.unreadCount === 0) return false
      if (activeFilter === 'interviews' && !c.hasInterviewTag) return false

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        const matchName = c.recruiterName.toLowerCase().includes(q)
        const matchFirm = c.firmName.toLowerCase().includes(q)
        const matchRole = c.roleTitle.toLowerCase().includes(q)
        const matchLast = c.lastMessage.toLowerCase().includes(q)
        if (!matchName && !matchFirm && !matchRole && !matchLast) {
          return false
        }
      }

      return true
    })
  }, [conversations, activeFilter, searchQuery])

  const handleSelectThread = useCallback((id: string) => {
    setSelectedThreadId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }, [])

  const handleSendMessage = useCallback(
    (textToSend?: string) => {
      const text = textToSend || messageInput
      if (!text.trim()) return

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'candidate',
        senderName: 'Alex Morgan',
        text: text.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedThreadId
            ? {
                ...c,
                lastMessage: text.trim(),
                lastMessageTime: 'Just now',
                messages: [...c.messages, newMsg],
              }
            : c
        )
      )

      if (!textToSend) {
        setMessageInput('')
      }
      showToast('Encrypted message transmitted to recruiter.')
    },
    [messageInput, selectedThreadId, showToast]
  )

  const handleQuickReply = useCallback(
    (replyText: string) => {
      handleSendMessage(replyText)
    },
    [handleSendMessage]
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
    showToast("Interview accepted! Added to BIM Workspace Calendar.")
  }, [selectedThreadId, showToast])

  const handleMarkAllRead = useCallback(() => {
    setConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })))
    showToast('All message threads marked as read.')
  }, [showToast])

  const handleExportTranscripts = useCallback(() => {
    const thread = selectedThread
    const transcriptText = `CASTALLIO ONE // ENCRYPTED COMMS TRANSCRIPT\nFIRM: ${thread.firmName}\nRECRUITER: ${thread.recruiterName} (${thread.recruiterRole})\nCANDIDATE: Alex Morgan\nTIMESTAMP: ${new Date().toISOString()}\n\n` +
      thread.messages
        .map((m) => `[${m.time}] ${m.senderName}: ${m.text}`)
        .join('\n\n')

    const blob = new Blob([transcriptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${thread.firmName.replace(/[^a-zA-Z0-9]/g, '_')}_Transcript.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Exported transcripts for ${thread.firmName}.`)
  }, [selectedThread, showToast])

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
    isComposeModalOpen,
    setIsComposeModalOpen,
    handleSelectThread,
    handleSendMessage,
    handleQuickReply,
    handleAcceptInterview,
    handleMarkAllRead,
    handleExportTranscripts,
    toastMessage,
    showToast,
  }
}
