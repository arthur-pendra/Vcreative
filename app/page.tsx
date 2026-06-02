'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import styles from '@/app/styles/text-demo.module.css'
import Footer from '@/app/components/Footer'
import LogoMarquee from '@/app/components/LogoMarquee'
import { useWebGLEffects, useGlobalParallax } from '@/app/lib/useWebGLEffects'
import { IconButton, IconCircle } from '@/app/components/IconButton'
import LazyVideo from '@/app/components/LazyVideo'

const REVIEWS = [
  {
    logo: '/logos/hair-by-kim.webp',
    quote:
      'Wat Viënna voor ons heeft neergezet is zoveel meer dan foto\u2019s en reels. Ze heeft ons merk echt op de kaart gezet. Onze salon voelt nu ook online als onze salon.',
    author: 'Kim van Dijk',
    role: 'Eigenaar Hair by Kim',
    caseHref: '/cases/hair-by-kim',
  },
  /* TODO copy klant — placeholder quote tot definitieve copy van FGS */
  {
    logo: '/logos/fgs.webp',
    quote:
      'Viënna heeft de industriële kant van ons werk vertaald naar beeld dat klopt. Geen gepolijste plaatjes, maar de kracht en het vakmanschap die FGS écht zijn.',
    author: 'Team FGS',
    role: 'Klant sinds 2025',
    caseHref: '/cases/fgs',
  },
  {
    logo: '/logos/hal-xiii.svg',
    quote:
      'Viënna begrijpt wat een merk nodig heeft om écht zichtbaar te worden. Geen standaard content, maar beeld dat kracht uitstraalt en ons publiek raakt.',
    author: 'Rim Pinckers',
    role: 'Owner Hal XIII',
    caseHref: '/cases/hal-xiii',
  },
  /* TODO copy klant — placeholder quote tot definitieve copy van VVL */
  {
    logo: '/logos/vloerverwarming-limburg.webp',
    quote:
      'Eindelijk content die past bij ons vak. Eerlijk beeld van het werk op locatie, waarin klanten ons direct herkennen. Viënna snapte ons merk vanaf dag één.',
    author: 'Team Vloerverwarming Limburg',
    role: 'Klant sinds 2025',
    caseHref: '/cases/vloerverwarming-limburg',
  },
] as const

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

const TextDemo = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [displayedReviewIndex, setDisplayedReviewIndex] = useState(0)
  const reviewQuoteRef = useRef<HTMLQuoteElement | null>(null)
  const reviewInitialRef = useRef(true)
  const reviewPendingReplayRef = useRef(false)

  const toggleStep = (i: number) => {
    setActiveStep((cur) => (cur === i ? null : i))
  }

  /* Lock prev/next while a cover→swap→reveal cycle is running so rapid
     clicking can't stack overlapping tweens on the same material. */
  const reviewCyclingRef = useRef(false)
  const prevReview = () => {
    if (reviewCyclingRef.current) return
    reviewCyclingRef.current = true
    setReviewIndex((i) => (i - 1 + REVIEWS.length) % REVIEWS.length)
  }
  const nextReview = () => {
    if (reviewCyclingRef.current) return
    reviewCyclingRef.current = true
    setReviewIndex((i) => (i + 1) % REVIEWS.length)
  }
  const currentReview = REVIEWS[displayedReviewIndex]

  /* ── Review carousel: cover → swap text → reveal via WebGL mask ──
     reviewIndex is what the user picked; displayedReviewIndex is what's
     actually rendered. We delay the swap so the mask can cover first.
     If the user flips back to the current displayed index while a cover
     is in flight, we still need to uncover — hence the pending ref. */
  useEffect(() => {
    const el = reviewQuoteRef.current
    if (reviewIndex === displayedReviewIndex) {
      if (reviewPendingReplayRef.current && el) {
        reviewPendingReplayRef.current = false
        el.dispatchEvent(new CustomEvent('webgl-text-remeasured'))
      }
      return
    }
    if (!el) {
      setDisplayedReviewIndex(reviewIndex)
      return
    }
    el.dispatchEvent(new CustomEvent('webgl-text-replay'))
    reviewPendingReplayRef.current = true
    const t = setTimeout(() => setDisplayedReviewIndex(reviewIndex), 320)
    return () => clearTimeout(t)
  }, [reviewIndex, displayedReviewIndex])

  useLayoutEffect(() => {
    if (reviewInitialRef.current) {
      reviewInitialRef.current = false
      return
    }
    reviewPendingReplayRef.current = false
    const el = reviewQuoteRef.current
    if (!el) return
    el.dispatchEvent(new CustomEvent('webgl-text-remeasured'))
    /* Cycle finished — re-open the prev/next controls. Short enough
       to feel responsive but long enough that a rapid double-click
       can't stack overlapping tweens on the same material. */
    const t = setTimeout(() => {
      reviewCyclingRef.current = false
    }, 450)
    return () => clearTimeout(t)
  }, [displayedReviewIndex])

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
        const bg = document.querySelector(`.${styles.studioBg}`) as HTMLElement | null
        const bgInner = bg?.querySelector(`.${styles.parallaxTarget}`) as HTMLElement | null
        if (!hero || !card || !bg) return

        gsap.set(card, {scale: 0.35, transformOrigin: 'center center'})
        gsap.set(bg, {opacity: 1})

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

        /* Scale + fade timeline spans from viewport entry (top bottom)
           through the end of the pin (+=230% = 100vh entry + 130% pin).
           Split in two phases so the card fully settles before unpin:
           - Entry (0 → 0.435 of timeline): linear warmup 0.35 → 0.5
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
        tl.to(bg, {opacity: 0, ease: 'power2.out', duration: 0.2}, 0.5)

        /* Parallax drift on the studio bg — matches the scale timeline */
        if (bgInner) {
          gsap.fromTo(
            bgInner,
            {yPercent: -15},
            {
              yPercent: 15,
              ease: 'none',
              scrollTrigger: {
                trigger: hero,
                start: 'top bottom',
                end: '+=230%',
                scrub: true,
              },
            },
          )
        }
      })
    })()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
    }
  }, [])

  useGlobalParallax()
  useWebGLEffects()


  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
          className={styles.heroText}
        >
          <em className="scriptCap">J</em>ij runt je bedrijf
          <br />
          ik regel je socials
        </h1>
        <p className={styles.heroSubtitle}>
          <span className={styles.heroSubtitleMain}>Content en strategie</span>
          <span className={styles.heroSubtitleScript}>
            by <span className={styles.heroSubtitleV}>V</span>ienna
          </span>
        </p>
      </section>
      <figure className={styles.heroFigure} data-parallax="trigger">
        <div className={styles.parallaxTarget} data-parallax="target">
          <img
            src="/images/hero-pattern.webp"
            alt="V-Creative hero"
            className={styles.heroImage}
          />
        </div>
      </figure>

      <LogoMarquee />
      <section className={styles.imageGrid}>
        <section className={styles.projectenSection}>
          <header className={styles.projectenHeader}>
            <p className={styles.projectenLabel}>
              <span className={styles.projectenLabelDot} aria-hidden="true" />
              2008 / 2026
            </p>
            <h2 className={styles.projectenTitle} data-animation="webgl-text">
              <em className="scriptCap">C</em>reative projecten
            </h2>
            <ul className={styles.projectenCategories}>
              <li className={styles.projectenCategory}>Beauty</li>
              <li className={styles.projectenCategory}>Lifestyle</li>
              <li className={styles.projectenCategory}>Horeca</li>
              <li className={styles.projectenCategory}>Retail</li>
              <li className={styles.projectenCategory}>Wellness</li>
            </ul>
          </header>

          <article className={`${styles.projectItem} ${styles.projectFull}`}>
            <a
              href="/cases/fgs"
              className={styles.projectMediaLink}
              data-cursor-hover
              data-cursor-text="Bekijk case"
              aria-label="Bekijk case FGS"
            >
              <figure
                className={styles.projectFigure}
                data-parallax="trigger"
                data-parallax-disabled
              >
                <div className={styles.parallaxTarget} data-parallax="target">
                  <img
                    data-webgl-media
                    data-webgl-effect="bend"
                    src="/cases/fgs/hero.webp"
                    alt="FGS"
                    className={styles.projectImage}
                    loading="lazy"
                  />
                </div>
              </figure>
            </a>
            <div className={styles.projectContent}>
              <h3 className={styles.projectTitle}>FGS</h3>
              <p className={styles.projectDescription}>
                {/* TODO copy klant — korte beschrijving van de FGS case */}
                Content creatie voor FGS. Industrieel vakmanschap met 125 jaar geschiedenis vertaald naar beeld en video.
              </p>
              <a href="/cases/fgs" className={styles.projectLink}>Bekijk case</a>
            </div>
          </article>

          <div className={styles.projectenRow}>
            <article className={`${styles.projectItem} ${styles.projectSmall}`}>
              <a
                href="/cases/hair-by-kim"
                className={styles.projectMediaLink}
                data-cursor-hover
                data-cursor-text="Bekijk case"
                aria-label="Bekijk case Hair by Kim"
              >
                <figure
                  className={styles.projectFigure}
                  data-parallax="trigger"
                  data-parallax-disabled
                >
                  <div className={styles.parallaxTarget} data-parallax="target">
                    <img
                      data-webgl-media
                      data-webgl-effect="bend"
                      src="/cases/hair-by-kim/01.webp"
                      alt="Hair by Kim"
                      className={`${styles.projectImage} ${styles.projectImageTop}`}
                      loading="lazy"
                    />
                  </div>
                </figure>
              </a>
              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>Hair by Kim</h3>
                <p className={styles.projectDescription}>
                  Social media beheer voor Hair by Kim. Strategie, fotografie en contentcreatie die het merk laat groeien.
                </p>
                <a href="/cases/hair-by-kim" className={styles.projectLink}>Bekijk case</a>
              </div>
            </article>

            <article className={`${styles.projectItem} ${styles.projectLarge}`}>
              <a
                href="/cases/hal-xiii"
                className={styles.projectMediaLink}
                data-cursor-hover
                data-cursor-text="Bekijk case"
                aria-label="Bekijk case Hal XIII"
              >
                <figure
                  className={styles.projectFigure}
                  data-parallax="trigger"
                  data-parallax-disabled
                >
                  <div className={styles.parallaxTarget} data-parallax="target">
                    <img
                      data-webgl-media
                      data-webgl-effect="bend"
                      src="/cases/hal-xiii/03.webp"
                      alt="Hal XIII"
                      className={styles.projectImage}
                      loading="lazy"
                    />
                  </div>
                </figure>
              </a>
              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>Hal XIII</h3>
                <p className={styles.projectDescription}>
                  Maandelijks beheer voor Hal XIII. Energie en kracht vertaald naar beeld en video.
                </p>
                <a href="/cases/hal-xiii" className={styles.projectLink}>Bekijk case</a>
              </div>
            </article>
          </div>

          <article className={`${styles.projectItem} ${styles.projectFull}`}>
            <a
              href="/cases/vloerverwarming-limburg"
              className={styles.projectMediaLink}
              data-cursor-hover
              data-cursor-text="Bekijk case"
              aria-label="Bekijk case Vloerverwarming Limburg"
            >
              <figure
                className={styles.projectFigure}
                data-parallax="trigger"
                data-parallax-disabled
              >
                <div className={styles.parallaxTarget} data-parallax="target">
                  <img
                    data-webgl-media
                    data-webgl-effect="bend"
                    src="/cases/vloerverwarming-limburg/full.webp"
                    alt="Vloerverwarming Limburg"
                    className={styles.projectImage}
                    loading="lazy"
                  />
                </div>
              </figure>
            </a>
            <div className={styles.projectContent}>
              <h3 className={styles.projectTitle}>Vloerverwarming Limburg</h3>
              <p className={styles.projectDescription}>
                {/* TODO copy klant — korte beschrijving van de VVL case */}
                Content creatie voor Vloerverwarming Limburg. Vakmanschap op locatie vertaald naar foto en video.
              </p>
              <a href="/cases/vloerverwarming-limburg" className={styles.projectLink}>Bekijk case</a>
            </div>
          </article>

          <IconButton href="/contact" className={styles.projectenCta}>
            Word de volgende case
          </IconButton>
        </section>
      </section>

      <section className={styles.studioSection} data-theme="dark">
        <div className={styles.studioHero}>
          <div className={styles.studioBg}>
            <div className={styles.parallaxTarget}>
              <img src="/images/hero-pattern.webp" alt="" className={styles.studioBgImage} loading="lazy" />
            </div>
          </div>
          <div className={styles.studioCard}>
            <p className={styles.studioLabel}>Over V-Creative</p>
            <img
              src="/icons/SVG/vienna_bigloog-nomrla.webp"
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
              <a
                className={styles.studioDownload}
                href="/v-creative-brochure.pdf"
                download
              >
                <svg
                  className={styles.studioDownloadIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 2.5V11.5M8 11.5L4 7.5M8 11.5L12 7.5M2.5 13.5H13.5"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Alle diensten in de brochure
              </a>
            </div>
          </div>
        </div>
      </section>

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
            <LazyVideo
              src="/videos/vienna-introductie.mp4"
              className={styles.werkwijzeCtaImage}
              ariaLabel="Viënna introductie"
            />
          </figure>
          <p className={styles.werkwijzeCtaText}>
            <em className="scriptCap">Z</em>et mij aan het werk met jouw unieke merk.
          </p>
          <IconButton href="/contact" className={styles.werkwijzeCtaButton}>
            Start jouw project
          </IconButton>
        </div>
      </section>

      <section className={styles.reviewsSection} aria-roledescription="carousel">
        <div className={styles.reviewCard}>
          {/* key forceert remount per logo zodat een eerder onError verborgen
              img niet hidden blijft als de carousel naar een wel werkend
              bestand cyclet. */}
          <img
            key={currentReview.logo}
            src={currentReview.logo}
            alt=""
            aria-hidden="true"
            className={styles.reviewLogo}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
            }}
          />
          <div className={styles.reviewQuoteRow}>
            <IconCircle
              direction="prev"
              onClick={prevReview}
              ariaLabel="Vorige review"
              className={styles.reviewArrow}
            />
            <blockquote
              ref={reviewQuoteRef}
              className={styles.reviewQuote}
              data-animation="webgl-text"
              data-webgl-text-mode="carousel"
            >
              &ldquo;{currentReview.quote}&rdquo;
            </blockquote>
            <IconCircle
              direction="next"
              onClick={nextReview}
              ariaLabel="Volgende review"
              className={styles.reviewArrow}
            />
          </div>
          <p className={styles.reviewAuthor}>
            <span className={styles.reviewAuthorDot} aria-hidden="true" />
            {currentReview.author}
          </p>
          <p className={styles.reviewRole}>{currentReview.role}</p>
          <div className={styles.reviewStars} aria-label="5 sterren">
            {'★★★★★'}
          </div>
          <a href={currentReview.caseHref} className={styles.reviewLink}>Bekijk case</a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default TextDemo
