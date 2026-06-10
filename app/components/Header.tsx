'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '@/app/components/Header.module.css'
import MenuOverlay from '@/app/components/MenuOverlay'
import { NAV_ITEMS } from '@/app/lib/navigation'

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false)
  /* The WebGL ink overlay paints the menu text and is the visual menu on
     both desktop and mobile. Mounted after mount (client-only) to avoid a
     hydration mismatch; until then the plain DOM dropdown is the fallback.
     Faalt de WebGL-init (geen context beschikbaar), dan zet onOverlayError
     dit terug — anders blijft de menutekst onzichtbaar (de CSS maakt
     .menuItem transparant zodra data-overlay='true'). */
  const [showOverlay, setShowOverlay] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  /* State-updates via timeout-0 zodat ze niet synchroon in het effect
     vallen (react-hooks/set-state-in-effect — voorkomt cascading
     renders). Gedrag is identiek: menu dicht na navigatie, overlay
     mount pas client-side (geen hydration mismatch). */
  useEffect(() => {
    const t = setTimeout(() => setMenuVisible(false), 0)
    return () => clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const t = setTimeout(() => setShowOverlay(true), 0)
    return () => clearTimeout(t)
  }, [])

  /* Escape sluit het menu en geeft focus terug aan de knop —
     toetsenbordgebruikers kunnen er anders niet meer uit. */
  useEffect(() => {
    if (!menuVisible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuVisible(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuVisible])

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

  /* Klik/Enter togglet het menu op élk apparaat. Op hover-apparaten
     opent het menu meestal al via mouseenter, maar zonder deze toggle
     was de knop voor toetsenbordgebruikers een no-op en bleven de
     nav-links (tabIndex -1) volledig onbereikbaar. */
  const handleClick = () => {
    setMenuVisible((v) => !v)
  }

  const handleOverlayError = useCallback(() => setShowOverlay(false), [])

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
            ref={menuButtonRef}
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
            {NAV_ITEMS.map((item) => (
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

        <Link
          href="/"
          className={styles.homeLogo}
          aria-label="Home — V-Creative"
          data-chrome="tc"
        >
          <img src="/icons/SVG/V_Logo.svg" alt="V-Creative" />
        </Link>

        <Link href="/contact" className={styles.contactLink} data-chrome="tr">
          contact
        </Link>
      </header>

      {showOverlay && (
        <MenuOverlay hover={menuVisible} onError={handleOverlayError} />
      )}
    </>
  )
}

export default Header
