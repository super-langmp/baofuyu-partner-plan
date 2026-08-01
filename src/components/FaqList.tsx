import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: '谁可以参加？',
    answer: '年满 18 周岁，拥有正常使用中的公开自媒体账号，并同意遵守相应平台规则即可报名。',
  },
  {
    question: '每个工作日都能发吗？',
    answer: '计划开放期间，审核通过的伙伴可在每个工作日领取一条任务；具体以任务中心当天展示为准。',
  },
  {
    question: '怎样算审核通过？',
    answer: '使用指定素材、按要求开启商业内容声明、提交可访问的公开作品链接，并按规则保留作品。',
  },
  {
    question: '推荐奖励什么时候到账？',
    answer: '好友通过你的邀请码报名，并完成首条审核通过的有效任务后，¥1 推荐奖励进入待结算。',
  },
]

export function FaqList() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="faq-list">
      {faqs.map((faq, index) => {
        const open = openIndex === index
        return (
          <div className={`faq-item${open ? ' faq-item--open' : ''}`} key={faq.question}>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? -1 : index)}
            >
              <span>{faq.question}</span>
              <ChevronDown size={21} aria-hidden="true" />
            </button>
            <div className="faq-item__answer" hidden={!open}>
              <p>{faq.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
