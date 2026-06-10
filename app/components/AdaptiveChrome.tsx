'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/* Detects whether each of the four fixed chrome items (menu button,
   contact link, year stamp, scroll ring) is currently sitting over a
   dark-themed section — per-item, both top and bottom. Writes the
   result to body data attributes so the chrome's own CSS can flip to
   cream independently per corner.

   Dark sections opt in with `data-theme="dark"` on their root element.
   Chrome items opt in with `data-chrome="tl|tc|tr|bl|br"`.

   Implementation notes:
     - getBoundingClientRect for each side instead of elementFromPoint,
       because the chrome items live above the content in the stacking
       order and would otherwise hit themselves.
     - rAF-throttled: scroll/resize schedule a single re-check per frame.
     - Pathname change re-runs after a small delay so the new route's
       dark sections are in the DOM before we measure. */

type Corner = 'tl' | 'tr' | 'tc' | 'bl' | 'br'
const CORNERS: Corner[] = ['tl', 'tr', 'tc', 'bl', 'br']
const ATTR = {
  tl: 'chromeTl',
  tr: 'chromeTr',
  tc: 'chromeTc',
  bl: 'chromeBl',
  br: 'chromeBr',
} as const

const AdaptiveChrome = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let rafPending = false

    const check = () => {
      rafPending = false

      const darks = Array.from(
        document.querySelectorAll<HTMLElement>('[data-theme="dark"]'),
      ).map((el) => ({
        rect: el.getBoundingClientRect(),
        footer: el.tagName === 'FOOTER',
      }))

      const body = document.body

      for (const corner of CORNERS) {
        const el = document.querySelector<HTMLElement>(
          `[data-chrome="${corner}"]`,
        )
        if (!el) continue

        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2
        const cy = r.top + r.height / 2

        let theme: 'dark' | 'light' = 'light'
        let overFooter = false
        for (const d of darks) {
          const r = d.rect
          if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
            theme = 'dark'
            overFooter = d.footer
            break
          }
        }

        /* Only write if changed — avoids spamming attribute mutations
           that could force style recalculation on every frame. */
        if (body.dataset[ATTR[corner]] !== theme) {
          body.dataset[ATTR[corner]] = theme
        }
        /* Separate flag: is this corner over the FOOTER specifically? On
           mobile the menu chrome stays black over every dark section except
           the footer, so the CSS needs to tell them apart. */
        const footerKey = `${ATTR[corner]}Footer`
        const footerVal = overFooter ? 'true' : 'false'
        if (body.dataset[footerKey] !== footerVal) {
          body.dataset[footerKey] = footerVal
        }
      }
    }

    const schedule = () => {
      if (rafPending) return
      rafPending = true
      requestAnimationFrame(check)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    /* Layout can shift after fonts load / images lazy-load / ScrollTrigger
       installs pin spacers — re-check on a short delay so any late layout
       doesn't leave the chrome stranded in the wrong colour. */
    const settleTimer = window.setTimeout(schedule, 500)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.clearTimeout(settleTimer)
    }
  }, [pathname])

  return null
}

export default AdaptiveChrome
