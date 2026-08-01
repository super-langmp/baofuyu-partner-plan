export const siteConfig = {
  contactWechat: import.meta.env.VITE_CONTACT_WECHAT || '请替换为企业微信',
  companyName: import.meta.env.VITE_COMPANY_NAME || '请替换为公司主体名称',
  supportPhone: import.meta.env.VITE_SUPPORT_PHONE || '',
  rewardPerPost: 3,
  referralReward: 1,
  publicKeepDays: 7,
  payoutMinimum: 10,
}
