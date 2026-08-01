import { ArrowDown, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { ApplicationModal } from '../components/ApplicationModal'
import { BrandMark } from '../components/BrandMark'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'
import { siteConfig } from '../lib/config'

type InfoPage = 'rules' | 'privacy' | null

export function LandingPage() {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [infoPage, setInfoPage] = useState<InfoPage>(null)

  const openApplication = () => setApplicationOpen(true)

  return (
    <div className="campaign-page">
      <Header />
      <main>
        <section className="campaign-hero page-shell" id="intro">
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
          <span>{siteConfig.companyName}</span>
        </div>
        <p>© 2026 宝肤语</p>
      </footer>

      <ApplicationModal open={applicationOpen} onClose={() => setApplicationOpen(false)} />
      <Modal
        open={infoPage !== null}
        title={infoPage === 'rules' ? '活动规则' : '隐私说明'}
        onClose={() => setInfoPage(null)}
      >
        {infoPage === 'rules' ? (
          <div className="info-copy">
            <p>年满 18 周岁且拥有正常使用中的公开自媒体账号，可提交报名。</p>
            <p>按任务要求使用指定素材、开启商业内容声明并公开保留 7 天，审核通过获得 3 积分。</p>
            <p>好友通过邀请码报名并完成首条有效任务后，推荐人获得 1 积分。1 积分等值 1 元，可按结算规则兑换。</p>
          </div>
        ) : (
          <div className="info-copy">
            <p>报名信息仅用于账号审核、任务通知、活动结算与风险控制。</p>
            <p>正式上线前，请将公司主体、数据保存期限、用户权利与联系方式替换为公司审核通过的完整文本。</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
