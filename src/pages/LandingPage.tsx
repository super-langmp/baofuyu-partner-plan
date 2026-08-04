import { ArrowDown, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { ApplicationModal } from '../components/ApplicationModal'
import { BrandMark } from '../components/BrandMark'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'

type InfoPage = 'rules' | 'privacy' | 'ugc' | 'career' | null

const infoTitles: Record<Exclude<InfoPage, null>, string> = {
  rules: '活动规则',
  privacy: '隐私说明',
  ugc: 'UGC内容伙伴计划',
  career: '向hr推荐自己',
}

function ActivityRules() {
  return (
    <div className="info-copy policy-copy">
      <section>
        <h3>发文费用及奖励政策</h3>
        <h4>一、基本费用</h4>
        <p>抖音与小红书两平台同时发布，一套内容共 6 元；部分素材根据任务要求仅发布抖音。</p>
        <ul>
          <li>作品审核通过后当日结算。</li>
          <li>发布后需公开保留 30 天，不得删除或隐藏。</li>
        </ul>
      </section>

      <section>
        <h4>二、额外奖励</h4>
        <ol className="policy-list">
          <li>
            <strong>内容保留奖励</strong>
            <p>帖子公开保留满一个月，每篇奖励 1 元。</p>
          </li>
          <li>
            <strong>点赞数奖励</strong>
            <ul className="policy-tier-list">
              <li>≥ 50 赞，奖励 1 元</li>
              <li>≥ 100 赞，奖励 3 元</li>
              <li>≥ 500 赞，奖励 20 元</li>
              <li>≥ 1000 赞，奖励 50 元</li>
            </ul>
          </li>
          <li>
            <strong>评论区维护奖励</strong>
            <p>点赞超过 50 的帖子，完成评论区维护，包括删除差评、删除同行截流评论并进行互动回复，奖励 1 元。</p>
          </li>
          <li>
            <strong>新人推荐奖励</strong>
            <p>每成功推荐 1 位新人完成发帖，奖励 1 元。</p>
          </li>
        </ol>
      </section>

      <p className="policy-note">发布内容应遵守相应平台规则，并按任务要求完成商业内容声明。奖励以平台后台可核验数据及审核结果为准。</p>
    </div>
  )
}

function PrivacyNotice() {
  return (
    <div className="info-copy policy-copy">
      <section>
        <h3>我们如何处理你的信息</h3>
        <p>本网站的报名入口仅展示企业微信二维码，不会通过网页表单收集姓名、手机号或账号主页链接。</p>
      </section>
      <section>
        <h4>扫码报名后的信息处理</h4>
        <p>当你主动添加企业微信并发起沟通时，我们可能根据报名和任务需要，向你询问姓名、联系方式、抖音或小红书账号等必要信息，用于报名审核、任务通知、作品审核、奖励统计、结算及必要的客户服务。</p>
      </section>
      <section>
        <h4>保存与保护</h4>
        <p>我们只在实现上述目的所需的最短期限内保存信息，并采取合理安全措施防止未经授权的访问、泄露、篡改或丢失。法律法规另有要求的除外，相关目的完成后将删除或匿名化处理。</p>
      </section>
      <section>
        <h4>共享与公开</h4>
        <p>我们不会出售你的个人信息，也不会将其用于与本计划无关的营销。仅在完成必要服务、履行法定义务或取得你的另行同意时，才会在最小必要范围内提供相关信息。</p>
      </section>
      <section>
        <h4>你的权利</h4>
        <p>你可以申请查询、更正或删除个人信息，也可以撤回同意。请发送邮件至 <a className="info-link" href="mailto:2330027631@qq.com">2330027631@qq.com</a> 联系我们。撤回同意不影响撤回前已经完成的处理活动。</p>
      </section>
      <p className="policy-note">本计划仅面向年满 18 周岁的参与者。添加企业微信并发送“报名”即表示你已阅读并理解本隐私说明。</p>
    </div>
  )
}

function InfoContent({ page }: { page: Exclude<InfoPage, null> }) {
  if (page === 'rules') return <ActivityRules />
  if (page === 'privacy') return <PrivacyNotice />
  if (page === 'ugc') return <div className="info-copy info-copy--message"><p>更多活动，敬请期待</p></div>

  return (
    <div className="info-copy info-copy--message">
      <p>hr邮箱：<a className="info-link" href="mailto:2330027631@qq.com">2330027631@qq.com</a></p>
    </div>
  )
}

export function LandingPage() {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [infoPage, setInfoPage] = useState<InfoPage>(null)

  const openApplication = () => setApplicationOpen(true)

  return (
    <div className="campaign-page">
      <Header />
      <main>
        <section className="campaign-hero page-shell" id="intro">
          <div className="campaign-hero__mark" aria-hidden="true">
            <img src={`${import.meta.env.BASE_URL}baofuyu-logo-copper.png`} alt="" />
          </div>
          <div className="campaign-hero__copy">
            <h1>宝肤语品牌<br />内容伙伴计划</h1>
            <p className="campaign-hero__lead">发内容，攒积分，换生活费</p>
            <div className="reward-rail" aria-label="活动奖励">
              <div><span>发 1 条</span><strong>+3 积分</strong></div>
              <div><span>1 积分</span><strong>= 1 元</strong></div>
              <div><span>邀请好友</span><strong>+1 积分</strong></div>
            </div>
            <button className="button button--black campaign-hero__cta" type="button" onClick={openApplication}>
              立即加入 <ArrowRight size={20} />
            </button>
            <p className="campaign-hero__trust">0 押金 · 0 会费 · 工作日可接</p>
          </div>
          <a className="campaign-hero__scroll" href="#how" aria-label="继续了解参与方式"><ArrowDown size={21} /></a>
        </section>

        <section className="how-strip" id="how" aria-label="参与步骤">
          <div className="page-shell how-strip__inner">
            <span>01</span><strong>领素材</strong>
            <span>02</span><strong>发视频</strong>
            <span>03</span><strong>积分到账</strong>
          </div>
        </section>

        <section className="points-section page-shell">
          <div className="points-section__title">
            <p>积分能做什么？</p>
            <h2>直接兑换生活费</h2>
          </div>
          <div className="points-wallet" aria-label="积分钱包预览">
            <div className="points-wallet__top">
              <span>我的积分</span>
              <strong>12</strong>
              <em>= ¥12 可兑换</em>
            </div>
            <div className="points-wallet__task">
              <div>
                <span>今日任务</span>
                <strong>品牌内容发布</strong>
              </div>
              <b>+3</b>
            </div>
            <ul>
              <li><Check size={18} />指定素材</li>
              <li><Check size={18} />按规则发布</li>
              <li><Check size={18} />审核后到账</li>
            </ul>
          </div>
        </section>

        <section className="join-section" id="join">
          <div className="page-shell join-section__inner">
            <h2>一条内容，3 积分。</h2>
            <button className="button button--white" type="button" onClick={openApplication}>
              立即加入 <ArrowRight size={20} />
            </button>
          </div>
        </section>
      </main>

      <footer className="campaign-footer page-shell">
        <BrandMark />
        <div>
          <button type="button" onClick={() => setInfoPage('rules')}>活动规则</button>
          <button type="button" onClick={() => setInfoPage('privacy')}>隐私说明</button>
          <button type="button" onClick={() => setInfoPage('ugc')}>UGC内容伙伴计划</button>
          <button type="button" onClick={() => setInfoPage('career')}>向hr推荐自己</button>
        </div>
        <p>© 2026 宝肤语</p>
      </footer>

      <ApplicationModal open={applicationOpen} onClose={() => setApplicationOpen(false)} />
      <Modal
        open={infoPage !== null}
        title={infoPage ? infoTitles[infoPage] : ''}
        onClose={() => setInfoPage(null)}
      >
        {infoPage ? <InfoContent page={infoPage} /> : null}
      </Modal>
    </div>
  )
}
