import { Check, ChevronLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { submitApplication } from '../lib/application'
import { validateApplication, type ApplicationErrors } from '../lib/validation'
import { PLATFORMS, type ApplicationInput, type ApplicationResult, type Platform } from '../types'
import { Modal } from './Modal'

interface ApplicationModalProps {
  open: boolean
  onClose: () => void
}

function referralFromUrl() {
  const params = new URLSearchParams(window.location.search)
  return (params.get('ref') || '').slice(0, 24).toUpperCase()
}

const initialInput: ApplicationInput = {
  realName: '',
  phone: '',
  platform: '',
  profileUrl: '',
  inviteCode: referralFromUrl(),
  source: document.referrer || 'direct',
  honeypot: '',
}

export function ApplicationModal({ open, onClose }: ApplicationModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [input, setInput] = useState<ApplicationInput>(initialInput)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<ApplicationErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ApplicationResult | null>(null)
  const platformLabel = useMemo(() => input.platform || '未选择', [input.platform])

  const setField = <K extends keyof ApplicationInput>(key: K, value: ApplicationInput[K]) => {
    setInput((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const next = () => {
    const nextErrors = validateApplication(input, agreed)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setStep(2)
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      const applicationResult = await submitApplication(input)
      setResult(applicationResult)
    } catch {
      setErrors({ agreement: '暂时无法提交，请稍后重试或联系活动客服' })
      setStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} title={result ? '报名已提交' : '加入伙伴计划'} onClose={onClose}>
      {result ? (
        <div className="application-success">
          <span className="application-success__icon"><Check size={28} /></span>
          <strong>我们会尽快审核你的账号</strong>
          <p>{result.mode === 'demo' ? '当前为演示模式，信息已保存在本机。配置 Supabase 后即可正式收集报名。' : '审核结果会通过你填写的手机号通知。'}</p>
          <a className="button button--black" href="#/task-center" onClick={onClose}>体验任务中心</a>
        </div>
      ) : step === 1 ? (
        <form className="application-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <label>
              <span>姓名</span>
              <input value={input.realName} onChange={(event) => setField('realName', event.target.value)} placeholder="真实姓名" autoComplete="name" />
              {errors.realName ? <small>{errors.realName}</small> : null}
            </label>
            <label>
              <span>手机号</span>
              <input value={input.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="11 位手机号" inputMode="tel" autoComplete="tel" />
              {errors.phone ? <small>{errors.phone}</small> : null}
            </label>
          </div>
          <fieldset>
            <legend>选择你的平台</legend>
            <div className="platform-options">
              {PLATFORMS.map((platform) => (
                <button
                  className={input.platform === platform ? 'is-selected' : ''}
                  key={platform}
                  type="button"
                  onClick={() => setField('platform', platform as Platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
            {errors.platform ? <small>{errors.platform}</small> : null}
          </fieldset>
          <label>
            <span>账号主页链接</span>
            <input value={input.profileUrl} onChange={(event) => setField('profileUrl', event.target.value)} placeholder="https://" inputMode="url" />
            {errors.profileUrl ? <small>{errors.profileUrl}</small> : null}
          </label>
          <label>
            <span>邀请码 <em>选填</em></span>
            <input value={input.inviteCode} onChange={(event) => setField('inviteCode', event.target.value.toUpperCase())} placeholder="好友的邀请码" />
            {errors.inviteCode ? <small>{errors.inviteCode}</small> : null}
          </label>
          <label className="form-honeypot" aria-hidden="true">
            <span>公司</span>
            <input tabIndex={-1} autoComplete="off" value={input.honeypot} onChange={(event) => setField('honeypot', event.target.value)} />
          </label>
          <label className="agreement-row">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>我已阅读并同意活动规则和隐私说明</span>
          </label>
          {errors.agreement ? <small className="form-error">{errors.agreement}</small> : null}
          <button className="button button--black button--wide" type="button" onClick={next}>下一步</button>
          <p className="form-trust">0 押金 · 0 会费 · 不要求购买产品</p>
        </form>
      ) : (
        <div className="application-confirm">
          <button className="text-button" type="button" onClick={() => setStep(1)}><ChevronLeft size={18} />返回修改</button>
          <div className="application-confirm__row"><span>姓名</span><strong>{input.realName}</strong></div>
          <div className="application-confirm__row"><span>手机号</span><strong>{input.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</strong></div>
          <div className="application-confirm__row"><span>平台</span><strong>{platformLabel}</strong></div>
          <p>提交后进入审核，审核通过即可领取工作日任务。</p>
          <button className="button button--black button--wide" type="button" onClick={submit} disabled={submitting}>
            {submitting ? '正在提交…' : '确认提交'}
          </button>
        </div>
      )}
    </Modal>
  )
}
