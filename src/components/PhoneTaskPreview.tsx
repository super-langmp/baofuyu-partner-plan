import { CheckCircle2, Clock3, Download, ShieldCheck } from 'lucide-react'

export function PhoneTaskPreview() {
  return (
    <div className="phone-preview" aria-label="今日任务界面预览">
      <div className="phone-preview__speaker" aria-hidden="true" />
      <div className="phone-preview__screen">
        <div className="phone-preview__status">
          <span>9:41</span>
          <span className="phone-preview__status-icons">● ●</span>
        </div>
        <p className="phone-preview__title">今日任务</p>
        <div className="phone-preview__art">
          <span className="phone-preview__art-leaf">叶</span>
          <span>品牌审核素材</span>
        </div>
        <p className="phone-preview__task-name">宝肤语品牌内容发布</p>
        <div className="phone-preview__reward">
          <strong>¥3.00</strong>
          <span>审核通过可得 / 条</span>
        </div>
        <div className="phone-preview__meta">
          <Clock3 size={15} />
          <span>待提交</span>
        </div>
        <button className="button button--green phone-preview__button" type="button">
          领取任务
        </button>
        <div className="phone-preview__facts" aria-hidden="true">
          <span><Download size={13} />素材清楚</span>
          <span><ShieldCheck size={13} />规则公开</span>
          <span><CheckCircle2 size={13} />状态可查</span>
        </div>
      </div>
    </div>
  )
}
