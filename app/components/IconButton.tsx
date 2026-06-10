'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

/* Arrow glyph shared by all three hidden copies inside the icon pill.
   Three copies sit in a row; on hover each translates 200% to the right,
   so the rightmost arrow slides out and the leftmost (previously clipped)
   takes its place — giving a continuous "slide" loop in one hover tween. */
const ARROW_PATH =
  'M4.45231 0.385986H6.02531L9.30131 3.99999L6.02531 7.61399H4.45231L7.40331 4.58499H0.695312V3.42799H7.41631L4.45231 0.385986Z'

const Arrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 8"
    fill="none"
    aria-hidden="true"
    data-button-anim-target=""
    className="btn-icon-icon__arrow"
  >
    <path d={ARROW_PATH} fill="currentColor" />
  </svg>
)

const IconBlock = () => (
  <span className="btn-icon-icon" aria-hidden="true">
    <span data-button-anim-target="" className="btn-icon-icon__bg" />
    <span className="btn-icon-icon__wrap">
      <span className="btn-icon-icon__list">
        <Arrow />
        <Arrow />
        <Arrow />
      </span>
    </span>
  </span>
)

type IconButtonProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  ariaLabel?: string
  /* 'submit' laat de knop het omliggende <form> submitten, zodat de
     native required-validatie draait vóór de submit-handler. */
  type?: 'button' | 'submit'
}

/* Full pill: text (with shadow-duplicate sliding on hover) + animated
   icon circle + diagonal wipe bg. Renders as next/link Link for internal
   hrefs (prefetch), <a> for external, else as <button>. */
export const IconButton = ({
  children,
  href,
  onClick,
  className = '',
  ariaLabel,
  type = 'button',
}: IconButtonProps) => {
  const classes = ['btn-icon-link', className].filter(Boolean).join(' ')
  const inner = (
    <span className="btn-icon-content">
      <span className="btn-icon-content__mask">
        <span data-button-anim-target="" className="btn-icon-content__text">
          {children}
        </span>
      </span>
      <IconBlock />
      <span data-button-anim-target="" className="btn-icon-content__bg" />
    </span>
  )

  if (href) {
    /* Interne routes via next/link (viewport-prefetch); PageTransition
       onderschept de click in de capture-fase, dus het cream-fade
       gedrag is identiek aan een kale <a>. */
    if (href.startsWith('/')) {
      return (
        <Link href={href} className={classes} aria-label={ariaLabel}>
          {inner}
        </Link>
      )
    }
    return (
      <a href={href} className={classes} aria-label={ariaLabel}>
        {inner}
      </a>
    )
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  )
}

type IconCircleProps = {
  onClick: () => void
  direction?: 'next' | 'prev'
  ariaLabel: string
  className?: string
}

/* Icon-only round button — reuses the same animation, no text or wipe bg.
   direction="prev" mirrors via scaleX so the arrow slides leftward. */
export const IconCircle = ({
  onClick,
  direction = 'next',
  ariaLabel,
  className = '',
}: IconCircleProps) => {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    onClick()
  }

  const classes = [
    'btn-icon-only',
    direction === 'prev' ? 'btn-icon-only--flip' : '',
    animating ? 'btn-icon-only--animating' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      onClick={handleClick}
      onAnimationEnd={() => setAnimating(false)}
      className={classes}
      aria-label={ariaLabel}
    >
      <IconBlock />
    </button>
  )
}
