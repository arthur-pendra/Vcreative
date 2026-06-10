'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconCircle } from '@/app/components/IconButton'
import { CASES, type CaseSlug } from '@/app/cases/caseData'
import { hideImageOnError } from '@/app/lib/hideImageOnError'
import styles from '@/app/home.module.css'

/* Reviews komen rechtstreeks uit de case-quotes — geen aparte kopie.
   Quotes die nog als placeholder gemarkeerd staan (klant-copy in
   aantocht) worden overgeslagen. */
const REVIEWS = (Object.keys(CASES) as CaseSlug[])
  .map((slug) => ({ slug, ...CASES[slug].quote }))
  .filter((quote) => !quote.placeholder)

/* Carousel met WebGL mask-swap: cover → tekst wisselen → reveal. */
const ReviewsCarousel = () => {
  const [reviewIndex, setReviewIndex] = useState(0)
  const [displayedReviewIndex, setDisplayedReviewIndex] = useState(0)
  const reviewQuoteRef = useRef<HTMLQuoteElement | null>(null)
  const reviewInitialRef = useRef(true)
  const reviewPendingReplayRef = useRef(false)

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
      /* Geen quote-element gemount (edge) — swap zonder mask-cyclus.
         Via timeout-0 zodat de state-update niet synchroon in het
         effect valt. */
      const t = setTimeout(() => setDisplayedReviewIndex(reviewIndex), 0)
      return () => clearTimeout(t)
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

  return (
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
          onError={hideImageOnError}
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
            &ldquo;{currentReview.text}&rdquo;
          </blockquote>
          <IconCircle
            direction="next"
            onClick={nextReview}
            ariaLabel="Volgende review"
            className={styles.reviewArrow}
          />
        </div>
        <p className={styles.reviewAuthor}>
          {currentReview.author}
        </p>
        <p className={styles.reviewRole}>{currentReview.role}</p>
        <div className={styles.reviewStars} aria-label="5 sterren">
          {'★★★★★'}
        </div>
        <Link href={`/cases/${currentReview.slug}`} className={styles.reviewLink}>
          Bekijk case
        </Link>
      </div>
    </section>
  )
}

export default ReviewsCarousel
