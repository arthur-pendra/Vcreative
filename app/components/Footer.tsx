'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import styles from '@/app/components/Footer.module.css'
import Logo3D from '@/app/components/Logo3D'
import { IconButton } from '@/app/components/IconButton'

const SERVICES = [
  { label: 'Strategie', href: '/over-mij#diensten' },
  { label: 'Content', href: '/over-mij#diensten' },
  { label: 'Maandelijks beheer', href: '/over-mij#diensten' },
]

const CONTACT = [
  { label: 'hallo@v-creative.nl', href: 'mailto:hallo@v-creative.nl' },
  { label: '+31 (0) 6 12 34 56 78', href: 'tel:+31612345678' },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/' },
  { label: 'Pinterest', href: 'https://pinterest.com/' },
]

const Footer = () => {
  const [email, setEmail] = useState('')
  const brandRowRef = useRef<HTMLDivElement>(null)
  const brandRef = useRef<HTMLParagraphElement>(null)

  const submit = () => {
    if (!email) return
    const subject = encodeURIComponent('Nieuwsbrief aanmelding')
    const body = encodeURIComponent(`Graag op de hoogte blijven: ${email}`)
    window.location.href = `mailto:hallo@v-creative.nl?subject=${subject}&body=${body}`
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  /* Auto-fit the huge "Vienna Creative" line to the container width.
     cqi / vw math relies on assumed character widths and keeps missing
     — instead we measure the rendered text at a 100px reference size
     and compute the exact font-size that makes the line span ~97% of
     the container. Re-fits on resize + after fonts load. */
  useEffect(() => {
    const row = brandRowRef.current
    const brand = brandRef.current
    if (!row || !brand) return

    const fit = () => {
      brand.style.fontSize = '100px'
      const naturalWidth = brand.scrollWidth
      if (!naturalWidth) return
      const target = row.clientWidth * 0.97
      const next = (target / naturalWidth) * 100
      brand.style.fontSize = `${Math.max(40, next)}px`
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(row)

    /* Fallback + re-fit after custom fonts swap in */
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(fit).catch(() => {})
    }

    return () => ro.disconnect()
  }, [])

  return (
    <footer className={styles.footer} data-theme="dark">
      <div className={styles.topRow}>
        <div className={styles.newsletter}>
          <p className={styles.colHead}>Nieuwsbrief</p>
          <p className={styles.newsletterBody}>
            Af en toe een korte update uit de studio. Nieuwe cases, werk in
            uitvoering, gedachten over content.
          </p>
          <form className={styles.subscribe} onSubmit={onSubmit}>
            <label className={styles.srOnly} htmlFor="footer-email">
              E-mailadres voor nieuwsbrief
            </label>
            <input
              id="footer-email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.subscribeInput}
            />
            <IconButton
              onClick={submit}
              ariaLabel="Aanmelden voor nieuwsbrief"
            >
              Aanmelden
            </IconButton>
          </form>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          <div className={styles.col}>
            <p className={styles.colHead}>Diensten</p>
            <ul className={styles.colList}>
              {SERVICES.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className={styles.link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <p className={styles.colHead}>Contact</p>
            <ul className={styles.colList}>
              {CONTACT.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={styles.link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.col} ${styles.colSocials}`}>
            <p className={styles.colHead}>Volg mij</p>
            <ul className={styles.colList}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.link}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.brandRow} ref={brandRowRef}>
        <Link href="/" className={styles.brandLogo} aria-label="V-Creative">
          <Logo3D interaction="mouseTilt" hoverSpin={false} className={styles.logoMark} />
        </Link>
        <p className={styles.brand} aria-hidden="true" ref={brandRef}>
          <em>V</em>ienna <em>C</em>reative
        </p>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Vienna Wachelder</span>
        <span className={styles.bottomSep} aria-hidden="true">
          ·
        </span>
        <span>Alle rechten voorbehouden</span>
      </div>
    </footer>
  )
}

export default Footer
