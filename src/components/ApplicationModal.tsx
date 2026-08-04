import { ExternalLink } from 'lucide-react'
import { Modal } from './Modal'

interface ApplicationModalProps {
  open: boolean
  onClose: () => void
}

const qrCodeUrl = `${import.meta.env.BASE_URL}wecom-join-qr.jpg`

export function ApplicationModal({ open, onClose }: ApplicationModalProps) {
  return (
    <Modal open={open} title="扫码报名" onClose={onClose}>
      <div className="wecom-join">
        <p className="wecom-join__eyebrow">宝肤语 UGC 内容伙伴计划</p>
        <div className="wecom-join__qr">
          <img src={qrCodeUrl} alt="宝肤语企业微信报名二维码" />
        </div>
        <div className="wecom-join__copy">
          <strong>添加企业微信，立即报名</strong>
          <p>使用微信扫码添加后，请发送“报名”，我们会向你介绍参与方式。</p>
        </div>
        <a className="button button--white button--wide" href={qrCodeUrl} target="_blank" rel="noreferrer">
          打开二维码原图 <ExternalLink size={18} />
        </a>
        <p className="wecom-join__hint">手机端可长按二维码保存，或截图后打开微信扫一扫，从相册中识别。</p>
      </div>
    </Modal>
  )
}
