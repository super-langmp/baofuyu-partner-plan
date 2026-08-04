import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { ApplicationModal } from '../components/ApplicationModal'
import { BrandMark } from '../components/BrandMark'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'

type InfoPage = 'rules' | 'privacy' | 'ugc' | null

const infoTitles: Record<Exclude<InfoPage, null>, string> = {
  rules: '活动规则',
  privacy: '隐私说明',
  ugc: 'UGC内容伙伴计划',
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
        <h3>本网站不收集个人信息</h3>
        <p>本网站不设置报名表单，不要求提交姓名、手机号、身份证号、账号主页链接或其他个人信息，也不会在网站内保存、上传或向第三方提交个人信息。</p>
      </section>
      <section>
        <h4>关于扫码报名</h4>
        <p>页面仅展示企业微信二维码。是否扫码添加由你自主决定；扫码后将进入微信或企业微信环境，相关服务适用对应平台的服务规则与隐私政策，本网站不会读取或保存你的微信信息。</p>
      </section>
      <p className="policy-note">本计划仅面向年满 18 周岁的参与者。</p>
    </div>
  )
}

function InfoContent({ page }: { page: Exclude<InfoPage, null> }) {
  if (page === 'rules') return <ActivityRules />
  if (page === 'privacy') return <PrivacyNotice />
  return <div className="info-copy info-copy--message"><p>更多活动，敬请期待</p></div>
}

export function LandingPage() {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [infoPage, setInfoPage] = useState<InfoPage>(null)

  const openApplication = () => setApplicationOpen(true)

  return (
    <div className="campaign-page">
      <Header onJoin={openApplication} />
      <main>
        <section className="campaign-hero page-shell" id="intro">
          <div className="campaign-hero__copy">
            <h1>宝肤语品牌<br />内容伙伴计划</h1>
            <p className="campaign-hero__lead">发内容，攒积分，换生活费</p>
            <div className="campaign-hero__mark" aria-hidden="true">
              <img src={`${import.meta.env.BASE_URL}baofuyu-logo-copper.png`} alt="" />
            </div>
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
        </section>

        <section className="how-strip" id="how" aria-label="参与步骤">
          <div className="page-shell how-strip__inner">
            <span>01</span><strong>领素材</strong>
            <span>02</span><strong>发视频</strong>
            <span>03</span><strong>积分到账</strong>
          </div>
        </section>

      </main>

      <footer className="campaign-footer page-shell">
        <BrandMark />
        <div>
          <button type="button" onClick={() => setInfoPage('rules')}>活动规则</button>
          <button type="button" onClick={() => setInfoPage('privacy')}>隐私说明</button>
          <button type="button" onClick={() => setInfoPage('ugc')}>UGC内容伙伴计划</button>
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
