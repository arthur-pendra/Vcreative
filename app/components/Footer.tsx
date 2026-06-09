'use client'

import Link from 'next/link'
import { useState } from 'react'
import styles from '@/app/components/Footer.module.css'
import Logo3D from '@/app/components/Logo3D'
import { IconButton } from '@/app/components/IconButton'

const MENU = [
  { label: 'Projecten', href: '/cases' },
  { label: 'Over', href: '/over-mij' },
  { label: 'Start project', href: '/contact' },
]

const CONTACT = [
  { label: 'info@vcreative.nl', href: 'mailto:info@vcreative.nl' },
  { label: '+31 6 41 49 38 06', href: 'tel:+31641493806' },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/vienna.wachelder' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/viënna-wachelder-70276110b' },
  { label: 'Pinterest', href: 'https://pinterest.com/' },
]

const Footer = () => {
  const [email, setEmail] = useState('')

  const submit = () => {
    if (!email) return
    const subject = encodeURIComponent('Nieuwsbrief aanmelding')
    const body = encodeURIComponent(`Graag op de hoogte blijven: ${email}`)
    window.location.href = `mailto:info@vcreative.nl?subject=${subject}&body=${body}`
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

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
            <p className={styles.colHead}>Menu</p>
            <ul className={styles.colList}>
              {MENU.map((l) => (
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

      <div className={styles.brandRow}>
        <Link href="/" className={styles.brandLogo} aria-label="V-Creative">
          <Logo3D interaction="mouseTilt" hoverSpin={false} className={styles.logoMark} />
        </Link>
        <p
          className={styles.brand}
          aria-hidden="true"
          data-animation="webgl-text"
          data-webgl-text-mode="time-trigger"
          data-webgl-text-start="top 130%"
          data-webgl-text-bg="#641018"
        >
          <em>creative</em>
        </p>
      </div>

      <div className={styles.bottom}>
        <span>© 2026 Vienna Wachelder</span>
      </div>
    </footer>
  )
}

export default Footer
