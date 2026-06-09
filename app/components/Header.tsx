'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from '@/app/components/Header.module.css'
import MenuOverlay from '@/app/components/MenuOverlay'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Projecten', href: '/cases' },
  { label: 'Over', href: '/over-mij' },
  { label: 'Start project', href: '/contact' },
] as const

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  /* WebGL ink overlay is desktop-only. On touch/mobile the menu is just
     the plain DOM dropdown (visible via CSS), so we skip mounting the
     overlay entirely. Set after mount to avoid a hydration mismatch. */
  const [showOverlay, setShowOverlay] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuVisible(false)
  }, [pathname])

  useEffect(() => {
    setShowOverlay(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    )
  }, [])

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
    <>
      <header className={styles.header} data-menu-open={menuVisible}>
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
                data-menu-text
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

      {showOverlay && <MenuOverlay hover={menuVisible} />}
    </>
  )
}

export default Header
