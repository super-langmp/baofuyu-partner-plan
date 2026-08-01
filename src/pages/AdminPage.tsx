import { Check, RotateCcw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { BrandMark } from '../components/BrandMark'
import { demoStore, loadSystemState, subscribeSystemState } from '../lib/demoStore'
import { balanceFor } from '../lib/domain'

export function AdminPage() {
  const [state, setState] = useState(loadSystemState)

  useEffect(() => subscribeSystemState(() => setState(loadSystemState())), [])

  const pendingApplications = state.applications.filter((item) => item.status === 'pending')
  const pendingSubmissions = state.submissions.filter((item) => item.status === 'pending')
  const pendingRedemptions = state.redemptions.filter((item) => item.status === 'pending')

  const memberName = (memberId: string) => state.members.find((member) => member.id === memberId)?.realName || '未知用户'
  const taskName = (taskId: string) => state.tasks.find((task) => task.id === taskId)?.title || '未知任务'

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="page-shell admin-header__inner">
          <BrandMark />
          <strong>运营后台 · 演示模式</strong>
          <nav><a href="#/task-center">用户端</a><a href="#/">活动首页</a></nav>
        </div>
      </header>

      <main className="page-shell admin-main">
        <div className="admin-title">
          <div><span>ADMIN</span><h1>运营工作台</h1></div>
          <button type="button" onClick={() => demoStore.reset()}><RotateCcw size={16} />重置演示数据</button>
        </div>

        <section className="admin-stats" aria-label="关键数据">
          <div><span>待审报名</span><strong>{pendingApplications.length}</strong></div>
          <div><span>待审作品</span><strong>{pendingSubmissions.length}</strong></div>
          <div><span>待处理兑换</span><strong>{pendingRedemptions.length}</strong></div>
          <div><span>有效伙伴</span><strong>{state.members.length}</strong></div>
        </section>

        <AdminSection title="报名审核" count={pendingApplications.length} empty="暂无待审核报名">
          {pendingApplications.map((application) => (
            <article className="admin-row" key={application.id}>
              <div className="admin-row__main">
                <strong>{application.realName}</strong>
                <span>{application.platform} · {application.phone}</span>
                <a href={application.profileUrl} target="_blank" rel="noreferrer">查看账号主页</a>
              </div>
              <div className="admin-row__meta">
                <span>邀请码</span><strong>{application.inviteCodeUsed || '无'}</strong>
              </div>
              <div className="admin-actions">
                <button className="admin-action admin-action--approve" type="button" onClick={() => demoStore.approveApplication(application.id)}><Check size={17} />通过</button>
                <button className="admin-action" type="button" onClick={() => demoStore.rejectApplication(application.id)}><X size={17} />拒绝</button>
              </div>
            </article>
          ))}
        </AdminSection>

        <AdminSection title="作品审核" count={pendingSubmissions.length} empty="暂无待审核作品">
          {pendingSubmissions.map((submission) => (
            <article className="admin-row" key={submission.id}>
              <div className="admin-row__main">
                <strong>{memberName(submission.memberId)}</strong>
                <span>{taskName(submission.taskId)}</span>
                <a href={submission.workUrl} target="_blank" rel="noreferrer">打开作品链接</a>
              </div>
              <div className="admin-row__meta">
                <span>通过后增加</span><strong>+{submission.rewardPoints} 积分</strong>
              </div>
              <div className="admin-actions">
                <button className="admin-action admin-action--approve" type="button" onClick={() => demoStore.approveSubmission(submission.id)}><Check size={17} />通过</button>
                <button className="admin-action" type="button" onClick={() => demoStore.rejectSubmission(submission.id)}><X size={17} />拒绝</button>
              </div>
            </article>
          ))}
        </AdminSection>

        <AdminSection title="兑换处理" count={pendingRedemptions.length} empty="暂无待处理兑换">
          {pendingRedemptions.map((redemption) => (
            <article className="admin-row" key={redemption.id}>
              <div className="admin-row__main">
                <strong>{memberName(redemption.memberId)}</strong>
                <span>当前可用积分：{balanceFor(state, redemption.memberId)}</span>
              </div>
              <div className="admin-row__meta">
                <span>申请兑换</span><strong>{redemption.points} 积分 = ¥{redemption.amount}</strong>
              </div>
              <div className="admin-actions">
                <button className="admin-action admin-action--approve" type="button" onClick={() => demoStore.payRedemption(redemption.id)}><Check size={17} />确认已打款</button>
                <button className="admin-action" type="button" onClick={() => demoStore.rejectRedemption(redemption.id)}><X size={17} />退回积分</button>
              </div>
            </article>
          ))}
        </AdminSection>

        <section className="admin-section">
          <div className="admin-section__heading"><h2>积分台账</h2><span>{state.ledger.length}</span></div>
          <div className="ledger-table">
            {state.ledger.slice(0, 12).map((entry) => (
              <div key={entry.id}>
                <span>{memberName(entry.memberId)}</span>
                <span>{entry.description}</span>
                <strong className={entry.points >= 0 ? 'is-positive' : ''}>{entry.points >= 0 ? '+' : ''}{entry.points}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

interface AdminSectionProps {
  title: string
  count: number
  empty: string
  children: ReactNode
}

function AdminSection({ title, count, empty, children }: AdminSectionProps) {
  return (
    <section className="admin-section">
      <div className="admin-section__heading"><h2>{title}</h2><span>{count}</span></div>
      {count > 0 ? children : <p className="empty-state">{empty}</p>}
    </section>
  )
}
