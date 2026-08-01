interface BrandMarkProps {
  inverse?: boolean
}

export function BrandMark({ inverse = false }: BrandMarkProps) {
  return (
    <a className={`brand-mark${inverse ? ' brand-mark--inverse' : ''}`} href="#/" aria-label="宝肤语首页">
      <span className="brand-mark__name">宝肤语</span>
    </a>
  )
}
