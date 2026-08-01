import type {
  ApplicationInput,
  ApplicationRecord,
  LedgerEntryRecord,
  MemberRecord,
  Platform,
  RedemptionRecord,
  SubmissionRecord,
  SystemState,
  TaskClaimRecord,
} from '../types'

export const DEMO_MEMBER_ID = 'member-demo'
export const DAILY_TASK_ID = 'task-daily-brand-post'

const now = () => new Date().toISOString()
const id = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createSeedState(): SystemState {
  return {
    version: 1,
    applications: [
      {
        id: 'app-pending-seed',
        realName: '李晓',
        phone: '13800000002',
        platform: '小红书',
        profileUrl: 'https://www.xiaohongshu.com/user/profile/demo',
        inviteCodeUsed: 'BFY2026',
        source: 'invite',
        status: 'pending',
        note: '',
        createdAt: '2026-08-01T01:10:00.000Z',
        reviewedAt: null,
      },
    ],
    members: [
      {
        id: DEMO_MEMBER_ID,
        applicationId: 'app-demo',
        realName: '小伙伴',
        phone: '13800000001',
        platform: '抖音',
        profileUrl: 'https://www.douyin.com/user/demo',
        inviteCode: 'BFY2026',
        invitedByMemberId: null,
        referralRewardedAt: null,
        joinedAt: '2026-07-20T01:00:00.000Z',
      },
      {
        id: 'member-review-seed',
        applicationId: 'app-review-seed',
        realName: '周宁',
        phone: '13800000003',
        platform: '快手',
        profileUrl: 'https://www.kuaishou.com/profile/demo',
        inviteCode: 'BFY0003',
        invitedByMemberId: DEMO_MEMBER_ID,
        referralRewardedAt: null,
        joinedAt: '2026-07-30T01:00:00.000Z',
      },
    ],
    tasks: [
      {
        id: DAILY_TASK_ID,
        title: '宝肤语品牌内容发布',
        instructions: ['使用指定素材', '开启商业内容声明', '作品公开保留 7 天'],
        rewardPoints: 3,
        isActive: true,
        createdAt: '2026-07-20T01:00:00.000Z',
      },
    ],
    claims: [
      {
        id: 'claim-review-seed',
        memberId: 'member-review-seed',
        taskId: DAILY_TASK_ID,
        claimDate: localDateKey(),
        status: 'submitted',
        createdAt: '2026-08-01T02:00:00.000Z',
      },
    ],
    submissions: [
      {
        id: 'submission-review-seed',
        claimId: 'claim-review-seed',
        memberId: 'member-review-seed',
        taskId: DAILY_TASK_ID,
        workUrl: 'https://www.kuaishou.com/short-video/demo',
        status: 'pending',
        rewardPoints: 3,
        note: '',
        createdAt: '2026-08-01T02:15:00.000Z',
        reviewedAt: null,
      },
      {
        id: 'submission-history-1',
        claimId: 'claim-history-1',
        memberId: DEMO_MEMBER_ID,
        taskId: DAILY_TASK_ID,
        workUrl: 'https://www.douyin.com/video/history-1',
        status: 'approved',
        rewardPoints: 3,
        note: '',
        createdAt: '2026-07-31T02:15:00.000Z',
        reviewedAt: '2026-07-31T03:15:00.000Z',
      },
      {
        id: 'submission-history-2',
        claimId: 'claim-history-2',
        memberId: DEMO_MEMBER_ID,
        taskId: DAILY_TASK_ID,
        workUrl: 'https://www.douyin.com/video/history-2',
        status: 'approved',
        rewardPoints: 3,
        note: '',
        createdAt: '2026-07-30T02:15:00.000Z',
        reviewedAt: '2026-07-30T03:15:00.000Z',
      },
    ],
    ledger: [0, 1, 2, 3].map((offset) => ({
      id: `ledger-seed-${offset}`,
      memberId: DEMO_MEMBER_ID,
      points: 3,
      type: 'task_reward' as const,
      description: '品牌内容发布审核通过',
      referenceId: `history-${offset}`,
      createdAt: `2026-07-${28 + offset}T03:15:00.000Z`,
    })),
    redemptions: [],
  }
}

export function balanceFor(state: SystemState, memberId: string) {
  return state.ledger.reduce((sum, entry) => entry.memberId === memberId ? sum + entry.points : sum, 0)
}

export function createApplicationRecord(input: ApplicationInput): ApplicationRecord {
  return {
    id: id('app'),
    realName: input.realName.trim(),
    phone: input.phone.trim(),
    platform: input.platform as Platform,
    profileUrl: input.profileUrl.trim(),
    inviteCodeUsed: input.inviteCode.trim().toUpperCase() || null,
    source: input.source,
    status: 'pending',
    note: '',
    createdAt: now(),
    reviewedAt: null,
  }
}

function makeInviteCode(application: ApplicationRecord, state: SystemState) {
  const base = `BFY${application.phone.slice(-4)}`
  let code = base
  let suffix = 1
  while (state.members.some((member) => member.inviteCode === code)) {
    code = `${base}${suffix}`
    suffix += 1
  }
  return code
}

export function approveApplication(state: SystemState, applicationId: string): SystemState {
  const application = state.applications.find((item) => item.id === applicationId)
  if (!application || application.status !== 'pending') return state

  const inviter = application.inviteCodeUsed
    ? state.members.find((member) => member.inviteCode === application.inviteCodeUsed)
    : undefined
  const reviewedAt = now()
  const member: MemberRecord = {
    id: id('member'),
    applicationId: application.id,
    realName: application.realName,
    phone: application.phone,
    platform: application.platform,
    profileUrl: application.profileUrl,
    inviteCode: makeInviteCode(application, state),
    invitedByMemberId: inviter?.id || null,
    referralRewardedAt: null,
    joinedAt: reviewedAt,
  }

  return {
    ...state,
    applications: state.applications.map((item) => item.id === applicationId ? { ...item, status: 'approved', reviewedAt } : item),
    members: [...state.members, member],
  }
}

export function rejectApplication(state: SystemState, applicationId: string, note = '账号暂不符合活动要求'): SystemState {
  const reviewedAt = now()
  return {
    ...state,
    applications: state.applications.map((item) => item.id === applicationId && item.status === 'pending'
      ? { ...item, status: 'rejected', note, reviewedAt }
      : item),
  }
}

export function claimDailyTask(state: SystemState, memberId: string, claimDate = localDateKey()): SystemState {
  const alreadyClaimed = state.claims.some((claim) => claim.memberId === memberId && claim.claimDate === claimDate)
  const task = state.tasks.find((item) => item.id === DAILY_TASK_ID && item.isActive)
  if (alreadyClaimed || !task) return state

  const claim: TaskClaimRecord = {
    id: id('claim'),
    memberId,
    taskId: task.id,
    claimDate,
    status: 'claimed',
    createdAt: now(),
  }
  return { ...state, claims: [...state.claims, claim] }
}

export function submitClaim(state: SystemState, claimId: string, workUrl: string): SystemState {
  const claim = state.claims.find((item) => item.id === claimId)
  const task = claim ? state.tasks.find((item) => item.id === claim.taskId) : undefined
  if (!claim || claim.status !== 'claimed' || !task) return state

  const submission: SubmissionRecord = {
    id: id('submission'),
    claimId: claim.id,
    memberId: claim.memberId,
    taskId: claim.taskId,
    workUrl,
    status: 'pending',
    rewardPoints: task.rewardPoints,
    note: '',
    createdAt: now(),
    reviewedAt: null,
  }
  return {
    ...state,
    claims: state.claims.map((item) => item.id === claimId ? { ...item, status: 'submitted' } : item),
    submissions: [submission, ...state.submissions],
  }
}

export function approveSubmission(state: SystemState, submissionId: string): SystemState {
  const submission = state.submissions.find((item) => item.id === submissionId)
  if (!submission || submission.status !== 'pending') return state

  const reviewedAt = now()
  const reward: LedgerEntryRecord = {
    id: id('ledger'),
    memberId: submission.memberId,
    points: submission.rewardPoints,
    type: 'task_reward',
    description: '品牌内容发布审核通过',
    referenceId: submission.id,
    createdAt: reviewedAt,
  }
  const member = state.members.find((item) => item.id === submission.memberId)
  const shouldRewardInviter = Boolean(member?.invitedByMemberId && !member.referralRewardedAt)
  const referralReward: LedgerEntryRecord | null = shouldRewardInviter && member?.invitedByMemberId ? {
    id: id('ledger'),
    memberId: member.invitedByMemberId,
    points: 1,
    type: 'referral_reward',
    description: `${member.realName}完成首条有效任务`,
    referenceId: member.id,
    createdAt: reviewedAt,
  } : null

  return {
    ...state,
    submissions: state.submissions.map((item) => item.id === submissionId ? { ...item, status: 'approved', reviewedAt } : item),
    claims: state.claims.map((item) => item.id === submission.claimId ? { ...item, status: 'completed' } : item),
    members: state.members.map((item) => item.id === member?.id && shouldRewardInviter ? { ...item, referralRewardedAt: reviewedAt } : item),
    ledger: referralReward ? [reward, referralReward, ...state.ledger] : [reward, ...state.ledger],
  }
}

export function rejectSubmission(state: SystemState, submissionId: string, note = '作品未满足任务规则'): SystemState {
  const reviewedAt = now()
  const submission = state.submissions.find((item) => item.id === submissionId)
  if (!submission || submission.status !== 'pending') return state
  return {
    ...state,
    submissions: state.submissions.map((item) => item.id === submissionId ? { ...item, status: 'rejected', note, reviewedAt } : item),
    claims: state.claims.map((item) => item.id === submission.claimId ? { ...item, status: 'rejected' } : item),
  }
}

export function requestRedemption(state: SystemState, memberId: string, points: number): SystemState {
  if (points < 10 || balanceFor(state, memberId) < points) return state
  const createdAt = now()
  const redemption: RedemptionRecord = {
    id: id('redemption'),
    memberId,
    points,
    amount: points,
    status: 'pending',
    note: '',
    createdAt,
    reviewedAt: null,
  }
  const hold: LedgerEntryRecord = {
    id: id('ledger'),
    memberId,
    points: -points,
    type: 'redemption_hold',
    description: '积分兑换申请',
    referenceId: redemption.id,
    createdAt,
  }
  return { ...state, redemptions: [redemption, ...state.redemptions], ledger: [hold, ...state.ledger] }
}

export function payRedemption(state: SystemState, redemptionId: string): SystemState {
  const reviewedAt = now()
  return {
    ...state,
    redemptions: state.redemptions.map((item) => item.id === redemptionId && item.status === 'pending'
      ? { ...item, status: 'paid', reviewedAt }
      : item),
  }
}

export function rejectRedemption(state: SystemState, redemptionId: string, note = '兑换申请未通过'): SystemState {
  const redemption = state.redemptions.find((item) => item.id === redemptionId)
  if (!redemption || redemption.status !== 'pending') return state
  const reviewedAt = now()
  const refund: LedgerEntryRecord = {
    id: id('ledger'),
    memberId: redemption.memberId,
    points: redemption.points,
    type: 'redemption_refund',
    description: '兑换未通过，积分退回',
    referenceId: redemption.id,
    createdAt: reviewedAt,
  }
  return {
    ...state,
    redemptions: state.redemptions.map((item) => item.id === redemptionId ? { ...item, status: 'rejected', note, reviewedAt } : item),
    ledger: [refund, ...state.ledger],
  }
}
