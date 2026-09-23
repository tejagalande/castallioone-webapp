export interface ChatAttachment {
  id: string
  name: string
  meta: string
  type: 'pdf' | 'ics' | 'ghx' | 'ifc'
  downloadUrl?: string
}

export interface ChatMessage {
  id: string
  senderId: string
  isMe: boolean
  senderName: string
  senderAvatar?: string
  text: string
  time: string
  createdAt: string
  attachments?: ChatAttachment[]
}

export interface ProposedInterview {
  id: string
  roleTitle: string
  dateText: string
  duration: string
  location: string
  panel: string
  status: 'scheduled' | 'proposed' | 'accepted' | 'rescheduled' | 'completed' | 'cancelled'
}

export interface ConversationThread {
  id: string
  partnerId: string // candidateId (if employer) or companyId (if talent)
  candidateId: string
  companyId: string
  name: string
  avatar: string
  roleOrDiscipline: string
  firmOrSchool: string
  lastMessage: string
  lastMessageTime: string
  lastMessageTimestamp: number
  unreadCount: number
  isOnline: boolean
  isVerified: boolean
  matchScore: number
  fitLabel?: string
  salaryRange?: string
  hasAttachments?: boolean
  attachmentCount?: number
  hasInterviewTag?: boolean
  tagBadgeText?: string
  tagBadgeType?: 'primary' | 'secondary' | 'neutral'
  interviewDetails?: ProposedInterview
  messages: ChatMessage[]
}

export type MessageFilterType = 'all' | 'inbounds' | 'interviews'

export interface RecipientOption {
  id: string
  candidateId: string
  companyId: string
  name: string
  subtitle: string
  avatar?: string
}
