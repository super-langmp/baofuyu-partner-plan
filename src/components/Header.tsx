import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from './BrandMark'

const navItems = [
  { label: '计划说明', href: '#how' },
  { label: '任务中心', href: '#/task-center' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="site-header">
      <div className="site-header__inner page-shell">
        <BrandMark />
        <nav className={`site-nav${open ? ' site-nav--open' : ''}`} aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={close}>
              {item.label}
            </a>
          ))}
          <a className="button button--black site-nav__cta" href="#join" onClick={close}>
            立即报名
          </a>
        </nav>
        <button
          className="site-header__menu"
          type="button"
          aria-label={open ? '关闭导航' : '打开导航'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
