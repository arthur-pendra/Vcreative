'use client'

import { useEffect } from 'react'
import { IconButton } from '@/app/components/IconButton'
import styles from '@/app/home.module.css'

/* "Over V-Creative" blok: een cream kaart die al scrollend opschaalt
   binnen een gepinde hero op de donkere sectie-achtergrond. */
const StudioSection = () => {
  /* ── Studio scale-in scroll animation (desktop only) ── */
  useEffect(() => {
    // skip the pin + scale choreography on mobile — card just stacks normally
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      return
    }

    let ctx: ReturnType<typeof import('gsap')['default']['context']> | undefined
    let cancelled = false

    ;(async () => {
      const gsap = (await import('gsap')).default
      const {ScrollTrigger} = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      ctx = gsap.context(() => {
        const hero = document.querySelector(`.${styles.studioHero}`) as HTMLElement | null
        const card = document.querySelector(`.${styles.studioCard}`) as HTMLElement | null
        if (!hero || !card) return

        gsap.set(card, {scale: 0.35, transformOrigin: 'center center'})

        /* Pin only — keeps the hero fixed through the scale animation.
           Start/end are constants (relative to the viewport), not to
           any layout metric that can shift, so invalidateOnRefresh is
           intentionally off — re-invalidating mid-scroll is what made
           the pin occasionally snap or lock up. */
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: '+=130%',
          pin: true,
          anticipatePin: 1,
        })

        /* Scale timeline — the cream card grows from small to full over the
           dark section background (no background image anymore).
           - Entry (0 → 0.435): linear warmup 0.35 → 0.5
           - Pin growth (0.435 → 0.785): power2.out settle to 1.0
           - Hold (0.785 → 1.0): stays at 1.0 until the pin releases. */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: 'top bottom',
            end: '+=230%',
            scrub: 1,
          },
        })
        tl.fromTo(card, {scale: 0.35}, {scale: 0.5, ease: 'none', duration: 0.435}, 0)
        tl.to(card, {scale: 1, ease: 'power2.out', duration: 0.35}, 0.435)
      })
    })()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
    }
  }, [])

  return (
    <section className={styles.studioSection} data-theme="dark">
      <div className={styles.studioHero}>
        <div className={styles.studioCard}>
          <p className={styles.studioLabel}>Over V-Creative</p>
          <img
            src="/icons/SVG/Big_Logo.svg"
            alt=""
            aria-hidden="true"
            className={styles.studioLogo}
            loading="lazy"
          />
          <div className={styles.studioBottomGroup}>
            <h2 className={styles.studioTagline}>
              <em className="scriptCap">M</em>ijn missie is om jouw merk écht zichtbaar te maken.
            </h2>
          </div>
        </div>
      </div>
      <div className={styles.studioContent}>
        <div className={styles.studioContentInner}>
          <p className={styles.studioBody}>
            Content is meer dan een mooie foto. Het bepaalt hoe jouw merk ervaren, herinnerd en vertrouwd wordt. Daarom werk ik met ondernemers die hun verhaal serieus nemen: geen losse posts, maar beeld dat past bij wie je bent. Van strategie tot fotografie, video en editing krijgt elke stap aandacht, want kleur, licht en timing bepalen samen hoe jouw merk voelt en blijft hangen.
          </p>
          <div className={styles.studioActions}>
            <IconButton href="/over-mij" className={styles.studioCta}>
              Ontmoet Vienna
            </IconButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StudioSection
