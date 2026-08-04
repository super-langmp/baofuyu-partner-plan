export const PLATFORMS = ['抖音', '小红书'] as const

export type Platform = (typeof PLATFORMS)[number]

export interface ApplicationInput {
  realName: string
  phone: string
  platform: Platform | ''
  inviteCode: string
  source: string
  honeypot: string
}

export interface ApplicationResult {
  id: string
  mode: 'cloud' | 'demo'
}

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'
export type RedemptionStatus = 'pending' | 'paid' | 'rejected'

export interface ApplicationRecord {
  id: string
  realName: string
  phone: string
  platform: Platform
  inviteCodeUsed: string | null
  source: string
  status: ApplicationStatus
  note: string
  createdAt: string
  reviewedAt: string | null
}

export interface MemberRecord {
  id: string
  applicationId: string
  realName: string
  phone: string
  platform: Platform
  inviteCode: string
  invitedByMemberId: string | null
  referralRewardedAt: string | null
  joinedAt: string
}

export interface TaskRecord {
  id: string
  title: string
  instructions: string[]
  rewardPoints: number
  isActive: boolean
  createdAt: string
}

export interface TaskClaimRecord {
  id: string
  memberId: string
  taskId: string
  claimDate: string
  status: 'claimed' | 'submitted' | 'completed' | 'rejected'
  createdAt: string
}

export interface SubmissionRecord {
  id: string
  claimId: string
  memberId: string
  taskId: string
  workUrl: string
  status: SubmissionStatus
  rewardPoints: number
  note: string
  createdAt: string
  reviewedAt: string | null
}

export interface LedgerEntryRecord {
  id: string
  memberId: string
  points: number
  type: 'task_reward' | 'referral_reward' | 'redemption_hold' | 'redemption_refund' | 'adjustment'
  description: string
  referenceId: string | null
  createdAt: string
}

export interface RedemptionRecord {
  id: string
  memberId: string
  points: number
  amount: number
  status: RedemptionStatus
  note: string
  createdAt: string
  reviewedAt: string | null
}

export interface SystemState {
  version: 1
  applications: ApplicationRecord[]
  members: MemberRecord[]
  tasks: TaskRecord[]
  claims: TaskClaimRecord[]
  submissions: SubmissionRecord[]
  ledger: LedgerEntryRecord[]
  redemptions: RedemptionRecord[]
}
