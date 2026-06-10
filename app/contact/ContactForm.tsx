'use client'

import { useState } from 'react'
import { IconButton } from '@/app/components/IconButton'
import styles from '@/app/contact/contact.module.css'

/* Mailto-formulier: er is bewust geen backend — versturen opent de
   mailclient met naam/e-mail/bericht voorgevuld. De knop is een echte
   submit, zodat de native required-validatie draait vóór submit(). */
const ContactForm = () => {
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
        <IconButton type="submit" ariaLabel="Bericht versturen">
          Verstuur
        </IconButton>
      </div>
    </form>
  )
}

export default ContactForm
