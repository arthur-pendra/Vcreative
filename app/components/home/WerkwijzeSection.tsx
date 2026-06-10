'use client'

import { useState } from 'react'
import { IconButton } from '@/app/components/IconButton'
import styles from '@/app/home.module.css'

const WERKWIJZE_STEPS = [
  {
    title: 'Je neemt contact op, ik leer jouw merk kennen.',
    description:
      'We gaan in gesprek, telefonisch, via video of bij je op locatie. Ik wil jouw merk, doelgroep en ambities echt begrijpen voordat we beginnen.',
  },
  {
    title: 'Jij beoordeelt de offerte op mijn plan van aanpak.',
    description:
      'Je ontvangt binnen een week een heldere offerte met concrete deliverables, tijdlijn en investering. Geen verrassingen onderweg.',
  },
  {
    title: 'Zijn we een match? We gaan aan de slag!',
    description:
      'Zodra we beide tekenen plannen we de eerste contentdag in. Ik zorg voor de voorbereiding, jij hoeft alleen zelf op te komen dagen.',
  },
  {
    title: 'Ik vertaal jouw merk in content die bij je past.',
    description:
      'Van conceptuele creatie tot strategische timing. Ik maak content die jouw merk versterkt en jouw publiek raakt.',
  },
  {
    title: 'We brengen het live en blijven evalueren.',
    description:
      'Na publicatie kijken we regelmatig terug: wat werkt, wat kan beter, waar groeien we door? Zo blijft jouw content scherp.',
  },
] as const

/* Werkwijze-accordion + afsluitende CTA met portretfoto. */
const WerkwijzeSection = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const toggleStep = (i: number) => {
    setActiveStep((cur) => (cur === i ? null : i))
  }

  return (
    <section className={styles.werkwijzeSection}>
      <p className={styles.werkwijzeLabel}>Werkwijze</p>
      <h2 className={styles.werkwijzeTitle} data-animation="webgl-text">
        <em className="scriptCap">I</em>n{' '}
        <span className={styles.werkwijzeCount}>
          ({String(WERKWIJZE_STEPS.length).padStart(2, '0')})
        </span>{' '}
        stappen van jouw merk naar content die raakt.
      </h2>

      <ul className={styles.werkwijzeList}>
        {WERKWIJZE_STEPS.map((step, i) => {
          const isActive = activeStep === i
          return (
            <li
              key={i}
              className={styles.werkwijzeItem}
              data-accordion-status={isActive ? 'active' : 'not-active'}
            >
              <button
                type="button"
                className={styles.werkwijzeTop}
                onClick={() => toggleStep(i)}
                aria-expanded={isActive}
              >
                <span className={styles.werkwijzeNumber}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.werkwijzeH3}>{step.title}</h3>
                <span className={styles.werkwijzeIcon} aria-hidden="true">
                  <span className={styles.werkwijzeIconH} />
                  <span className={styles.werkwijzeIconV} />
                </span>
              </button>
              <div className={styles.werkwijzeBottom}>
                <div className={styles.werkwijzeBottomWrap}>
                  <div className={styles.werkwijzeBottomContent}>
                    <p className={styles.werkwijzeP}>{step.description}</p>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className={styles.werkwijzeCta}>
        <figure className={styles.werkwijzeCtaFigure}>
          <img
            src="/images/werkwijze-cta.webp"
            alt="Vienna met de camera"
            className={styles.werkwijzeCtaImage}
            style={{ objectPosition: 'center 20%' }}
            loading="lazy"
            data-fade-in
          />
        </figure>
        <p className={styles.werkwijzeCtaText} data-animation="webgl-text">
          <em className="scriptCap">T</em>ijd om jouw merk in beeld te brengen.
        </p>
        <IconButton href="/contact">Start jouw project</IconButton>
      </div>
    </section>
  )
}

export default WerkwijzeSection
