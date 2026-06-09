'use client'

import { useState } from 'react'
import Footer from '@/app/components/Footer'
import { IconButton } from '@/app/components/IconButton'
import PageFX from '@/app/components/PageFX'
import styles from '@/app/contact/contact.module.css'

const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = () => {
    const body = `${message}\n\nGroet,\n${name}\n${email}`
    const subject = `Nieuw bericht van ${name || 'website'}`
    window.location.href = `mailto:info@vcreative.nl?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
  }

  return (
    <PageFX>
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.label}>
          Contact
        </p>
        <h1
          className={styles.title}
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
        >
          <em className="scriptCap">L</em>aat horen waar
          <br />
          jij mee bezig bent
        </h1>
        <p className={styles.subtitle}>
          Een idee, een lopend project of zin om eens te sparren? Laat een
          bericht achter en je hoort binnen één werkdag van mij terug.
        </p>
      </header>

      <section className={styles.body}>
        <form
          className={styles.formCol}
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="contact-name">
              Naam
            </label>
            <input
              id="contact-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Je naam"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="contact-email">
              E-mail
            </label>
            <input
              id="contact-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@bedrijf.nl"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="contact-message">
              Bericht
            </label>
            <textarea
              id="contact-message"
              className={styles.textarea}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vertel kort waar je aan denkt"
              required
            />
          </div>

          <div className={styles.submitRow}>
            <IconButton onClick={submit} ariaLabel="Bericht versturen">
              Verstuur
            </IconButton>
          </div>
        </form>

        <aside className={styles.infoCol}>
          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Direct
            </p>
            <p className={styles.infoText}>
              <a href="mailto:info@vcreative.nl">info@vcreative.nl</a>
            </p>
            <p className={styles.infoText}>
              <a href="tel:+31641493806">+31 6 41 49 38 06</a>
            </p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Werkgebied
            </p>
            <p className={styles.infoSecondary}>
              Heerlen &amp; omstreken, op locatie in heel Nederland.
            </p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Reactietijd
            </p>
            <p className={styles.infoSecondary}>
              Binnen één werkdag, vaak sneller. Voor lopende projecten ben ik
              direct bereikbaar via WhatsApp.
            </p>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
    </PageFX>
  )
}

export default Contact
