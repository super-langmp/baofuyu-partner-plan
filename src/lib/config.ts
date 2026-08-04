export const siteConfig = {
  contactWechat: import.meta.env.VITE_CONTACT_WECHAT || '请替换为企业微信',
  companyName: import.meta.env.VITE_COMPANY_NAME || 'UGC内容伙伴计划',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '',
  rewardPerPost: 3,
  referralReward: 1,
  publicKeepDays: 30,
  payoutMinimum: 10,
}
