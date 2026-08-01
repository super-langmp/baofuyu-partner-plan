import { describe, expect, it } from 'vitest'
import { validateApplication, validateProfileUrl } from './validation'

describe('validateProfileUrl', () => {
  it('accepts public http links and rejects arbitrary text', () => {
    expect(validateProfileUrl('https://www.douyin.com/user/example')).toBe(true)
    expect(validateProfileUrl('douyin user example')).toBe(false)
  })
})

describe('validateApplication', () => {
  it('requires the essential registration fields', () => {
    const errors = validateApplication(
      {
        realName: '',
        phone: '123',
        platform: '',
        profileUrl: '',
        inviteCode: '',
        source: 'direct',
        honeypot: '',
      },
      false,
    )

    expect(errors.realName).toBeTruthy()
    expect(errors.phone).toBeTruthy()
    expect(errors.platform).toBeTruthy()
    expect(errors.profileUrl).toBeTruthy()
    expect(errors.agreement).toBeTruthy()
  })
})
