'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from '@/app/components/Header.module.css'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Projecten', href: '/cases' },
  { label: 'Over', href: '/over-mij' },
  { label: 'Start project', href: '/contact' },
] as const

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuVisible(false)
  }, [pathname])

  const canHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches

  const handleEnter = () => {
    if (!canHover()) return
    setMenuVisible(true)
  }

  const handleLeave = () => {
    if (!canHover()) return
    setMenuVisible(false)
  }

  const handleClick = () => {
    if (canHover()) return
    setMenuVisible((v) => !v)
  }

  return (
    <header className={styles.header}>
        <div
          className={styles.menuContainer}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <button
            type="button"
            className={styles.menuLink}
            onClick={handleClick}
            aria-expanded={menuVisible}
            aria-controls="main-menu"
            data-hover={menuVisible}
            data-chrome="tl"
          >
            <span className={styles.menuDot} />
            {menuVisible ? 'sluiten' : 'menu'}
          </button>

          <nav
            id="main-menu"
            className={styles.menuDropdown}
            data-visible={menuVisible}
            aria-label="Hoofdnavigatie"
          >
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.menuItem}
                tabIndex={menuVisible ? 0 : -1}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/contact" className={styles.contactLink} data-chrome="tr">
          contact
        </Link>
      </header>
  )
}

export default Header
