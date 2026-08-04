import { Check, CircleDollarSign, Clipboard, Copy, FileCheck2, Gift, Wallet } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useMemo, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { Modal } from '../components/Modal'
import { demoStore, loadSystemState, subscribeSystemState } from '../lib/demoStore'
import { balanceFor, DAILY_TASK_ID, DEMO_MEMBER_ID, localDateKey } from '../lib/domain'
import { validateProfileUrl } from '../lib/validation'

const fallbackInviteCode = 'BFY2026'

export function MemberCenter() {
  const [state, setState] = useState(loadSystemState)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [message, setMessage] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [payoutOpen, setPayoutOpen] = useState(false)

  useEffect(() => subscribeSystemState(() => setState(loadSystemState())), [])

  const member = state.members.find((item) => item.id === DEMO_MEMBER_ID)
  const inviteCode = member?.inviteCode || fallbackInviteCode
  const task = state.tasks.find((item) => item.id === DAILY_TASK_ID)
  const todayClaim = state.claims.find((claim) => (
    claim.memberId === DEMO_MEMBER_ID
    && claim.taskId === DAILY_TASK_ID
    && claim.claimDate === localDateKey()
  ))
  const memberSubmissions = state.submissions.filter((submission) => submission.memberId === DEMO_MEMBER_ID)
  const availablePoints = balanceFor(state, DEMO_MEMBER_ID)
  const pendingPoints = memberSubmissions
    .filter((submission) => submission.status === 'pending')
    .reduce((sum, submission) => sum + submission.rewardPoints, 0)
  const pendingRedemption = state.redemptions.some((redemption) => (
    redemption.memberId === DEMO_MEMBER_ID && redemption.status === 'pending'
  ))

  const inviteLink = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`
    return `${base}?ref=${inviteCode}#/`
  }, [inviteCode])

  const claimTask = () => {
    demoStore.claimTask(DEMO_MEMBER_ID)
    setMessage('今日任务已领取。发布后，把作品链接提交回来。')
  }

  const submitWork = () => {
    if (!validateProfileUrl(submissionUrl)) {
      setMessage('请粘贴以 http:// 或 https:// 开头的公开作品链接。')
      return
    }
    if (!todayClaim) return
    demoStore.submitClaim(todayClaim.id, submissionUrl)
    setMessage('提交成功，等待管理员审核。')
  }

  const openInvite = async () => {
    const dataUrl = await QRCode.toDataURL(inviteLink, {
      width: 360,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
    })
    setQrDataUrl(dataUrl)
    setInviteOpen(true)
  }

  const copyInvite = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setMessage('邀请链接已复制。')
    setInviteOpen(false)
  }

  const requestPayout = () => {
    demoStore.requestRedemption(DEMO_MEMBER_ID, availablePoints)
    setPayoutOpen(false)
    setMessage('兑换申请已提交，等待管理员处理。')
  }

  return (
    <div className="member-page">
      <header className="member-header">
        <div className="page-shell member-header__inner">
          <BrandMark />
          <nav aria-label="任务中心导航">
            <a className="is-active" href="#today">任务中心</a>
            <a href="#submissions">我的提交</a>
            <button type="button" onClick={openInvite}>邀请好友</button>
            <a href="#points">积分明细</a>
          </nav>
          <a className="member-header__exit" href="#/">返回首页</a>
        </div>
      </header>

      <main className="page-shell member-main">
        {message ? (
          <div className="member-notice" role="status">
            {message}
            <button type="button" onClick={() => setMessage('')}>关闭</button>
          </div>
        ) : null}

        <section className="member-intro">
          <div><span>任务中心</span><h1>今天，赚 3 积分。</h1></div>
          <button className="points-summary" id="points" type="button" onClick={() => setPayoutOpen(true)}>
            <span>可兑换积分</span><strong>{availablePoints}</strong><em>= ¥{availablePoints}</em>
          </button>
        </section>

        <section className="today-task" id="today">
          <div className="today-task__number">01</div>
          <div className="today-task__main">
            <div className="today-task__heading">
              <div><span>今日任务</span><h2>{task?.title || '宝肤语品牌内容发布'}</h2></div>
              <strong>+{task?.rewardPoints || 3} 积分</strong>
            </div>
            <div className="today-task__requirements">
              {(task?.instructions || ['使用指定素材', '开启商业内容声明', '作品公开保留 30 天']).map((instruction) => (
                <span key={instruction}><Check size={17} />{instruction}</span>
              ))}
            </div>
            {!todayClaim ? (
              <button className="button button--black" type="button" onClick={claimTask}>领取今日任务</button>
            ) : todayClaim.status === 'claimed' ? (
              <div className="submit-work">
                <label htmlFor="work-url">作品链接</label>
                <div>
                  <input id="work-url" value={submissionUrl} onChange={(event) => setSubmissionUrl(event.target.value)} placeholder="https://" />
                  <button type="button" onClick={submitWork}>提交审核</button>
                </div>
              </div>
            ) : (
              <div className="task-submitted"><FileCheck2 size={20} />{todayClaim.status === 'completed' ? '审核通过，积分已到账' : todayClaim.status === 'rejected' ? '作品未通过审核' : '作品审核中'}</div>
            )}
          </div>
        </section>

        <section className="member-grid">
          <div className="submission-list" id="submissions">
            <div className="section-heading"><h2>最近提交</h2><span>待审核 {pendingPoints} 积分</span></div>
            {memberSubmissions.length === 0 ? <p className="empty-state">还没有提交记录</p> : memberSubmissions.map((submission) => (
              <div className="submission-row" key={submission.id}>
                <span>{new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(submission.createdAt))}</span>
                <strong>{submission.status === 'approved' ? '审核通过' : submission.status === 'pending' ? '审核中' : '未通过'}</strong>
                <b>+{submission.rewardPoints}</b>
              </div>
            ))}
          </div>
          <aside className="invite-panel">
            <Gift size={26} />
            <h2>邀请好友</h2>
            <p>好友完成首条有效任务</p>
            <strong>你得 +1 积分</strong>
            <button className="button button--black" type="button" onClick={openInvite}>生成邀请二维码</button>
          </aside>
        </section>
      </main>

      <nav className="mobile-tabbar" aria-label="移动端任务导航">
        <a className="is-active" href="#today"><Clipboard size={20} /><span>任务</span></a>
        <a href="#submissions"><FileCheck2 size={20} /><span>提交</span></a>
        <button type="button" onClick={openInvite}><Gift size={20} /><span>邀请</span></button>
        <button type="button" onClick={() => setPayoutOpen(true)}><Wallet size={20} /><span>积分</span></button>
      </nav>

      <Modal open={inviteOpen} title="邀请好友，+1 积分" onClose={() => setInviteOpen(false)}>
        <div className="invite-modal">
          {qrDataUrl ? <img src={qrDataUrl} alt="专属邀请二维码" /> : null}
          <strong>邀请码：{inviteCode}</strong>
          <button className="button button--black button--wide" type="button" onClick={copyInvite}><Copy size={18} />复制邀请链接</button>
          <p>好友完成首条审核通过的任务后，奖励到账。</p>
        </div>
      </Modal>

      <Modal open={payoutOpen} title="兑换积分" onClose={() => setPayoutOpen(false)}>
        <div className="payout-modal">
          <CircleDollarSign size={42} />
          <span>本次可兑换</span>
          <strong>{availablePoints} 积分 = ¥{availablePoints}</strong>
          <button className="button button--black button--wide" type="button" onClick={requestPayout} disabled={pendingRedemption || availablePoints < 10}>
            {pendingRedemption ? '申请已提交' : availablePoints < 10 ? '至少 10 积分可兑换' : '确认兑换'}
          </button>
          <p>管理员确认后完成打款。</p>
        </div>
      </Modal>
    </div>
  )
}
