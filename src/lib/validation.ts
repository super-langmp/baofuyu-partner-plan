import type { ApplicationInput } from '../types'

const CHINA_MOBILE = /^1[3-9]\d{9}$/

export type ApplicationErrors = Partial<Record<keyof ApplicationInput | 'agreement', string>>

export function validateProfileUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateApplication(
  input: ApplicationInput,
  agreed: boolean,
): ApplicationErrors {
  const errors: ApplicationErrors = {}

  if (input.honeypot) errors.honeypot = '提交失败，请刷新页面后重试'
  if (input.realName.trim().length < 2) errors.realName = '请填写至少 2 个字的姓名'
  if (!CHINA_MOBILE.test(input.phone.trim())) errors.phone = '请填写正确的 11 位手机号'
  if (!input.platform) errors.platform = '请选择一个自媒体平台'
  if (input.inviteCode && !/^[A-Za-z0-9_-]{3,24}$/.test(input.inviteCode)) {
    errors.inviteCode = '邀请码应为 3–24 位字母、数字、下划线或短横线'
  }
  if (!agreed) errors.agreement = '请先阅读并同意活动规则和隐私说明'

  return errors
}
