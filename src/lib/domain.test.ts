import { describe, expect, it } from 'vitest'
import {
  approveApplication,
  approveSubmission,
  balanceFor,
  claimDailyTask,
  createSeedState,
  DEMO_MEMBER_ID,
  rejectRedemption,
  requestRedemption,
  submitClaim,
} from './domain'

describe('partner program domain flow', () => {
  it('rewards a post with 3 points and inviter once with 1 point', () => {
    let state = createSeedState()
    const inviterBefore = balanceFor(state, DEMO_MEMBER_ID)

    state = approveApplication(state, 'app-pending-seed')
    const newMember = state.members.find((member) => member.applicationId === 'app-pending-seed')
    expect(newMember?.invitedByMemberId).toBe(DEMO_MEMBER_ID)

    state = claimDailyTask(state, newMember!.id, '2026-08-02')
    const claim = state.claims.find((item) => item.memberId === newMember!.id)
    state = submitClaim(state, claim!.id, 'https://www.xiaohongshu.com/explore/test')
    const submission = state.submissions.find((item) => item.claimId === claim!.id)
    state = approveSubmission(state, submission!.id)

    expect(balanceFor(state, newMember!.id)).toBe(3)
    expect(balanceFor(state, DEMO_MEMBER_ID)).toBe(inviterBefore + 1)

    const afterDuplicateApproval = approveSubmission(state, submission!.id)
    expect(balanceFor(afterDuplicateApproval, DEMO_MEMBER_ID)).toBe(inviterBefore + 1)
  })

  it('holds points on redemption and returns them if rejected', () => {
    let state = createSeedState()
    expect(balanceFor(state, DEMO_MEMBER_ID)).toBe(12)

    state = requestRedemption(state, DEMO_MEMBER_ID, 12)
    expect(balanceFor(state, DEMO_MEMBER_ID)).toBe(0)
    const redemption = state.redemptions[0]

    state = rejectRedemption(state, redemption.id)
    expect(balanceFor(state, DEMO_MEMBER_ID)).toBe(12)
    expect(state.redemptions[0].status).toBe('rejected')
  })
})
