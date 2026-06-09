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
  /* The WebGL ink overlay paints the menu text and is the visual menu on
     both desktop and mobile. Mounted after mount (client-only) to avoid a
     hydration mismatch; until then the plain DOM dropdown is the fallback. */
  const [showOverlay, setShowOverlay] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMenuVisible(false)
  }, [pathname])

  useEffect(() => {
    setShowOverlay(true)
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
      <header
        className={styles.header}
        data-menu-open={menuVisible}
        data-overlay={showOverlay}
      >
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
