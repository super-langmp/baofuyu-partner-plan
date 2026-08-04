import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { BrandMark } from './BrandMark'

const navItems = [
  { label: '计划说明', href: '#how' },
]

interface HeaderProps {
  onJoin: () => void
}

export function Header({ onJoin }: HeaderProps) {
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
          <button className="button button--black site-nav__cta" type="button" onClick={() => { close(); onJoin() }}>
            立即报名
          </button>
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
