'use client'

import { useEffect } from 'react'
import { isTouchDevice } from '@/app/lib/device'

/* Global parallax: every [data-parallax="trigger"] pans its target
   ([data-parallax="target"]) from startVal → endVal on scroll. */
export function useGlobalParallax() {
  useEffect(() => {
    let ctx: ReturnType<typeof import('gsap')['default']['context']> | undefined
    let cancelled = false

    ;(async () => {
      const gsap = (await import('gsap')).default
      const {ScrollTrigger} = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      const isTouch = isTouchDevice()

      ctx = gsap.context(() => {
        document
          .querySelectorAll<HTMLElement>('[data-parallax="trigger"]')
          .forEach((trigger) => {
            /* Opt-out wrapper: keeps [data-parallax="trigger"] so the WebGL
               mask still uses it for bounds. On DESKTOP these in-flow images
               get their parallax from the WebGL shader, so skip the CSS drift
               here. On TOUCH there's no WebGL image, so give them a subtle CSS
               parallax instead of leaving them static. */
            const disabled = trigger.hasAttribute('data-parallax-disabled')
            if (disabled && !isTouch) return

            const target =
              trigger.querySelector<HTMLElement>('[data-parallax="target"]') ||
              trigger

            const direction =
              trigger.getAttribute('data-parallax-direction') || 'vertical'
            const prop = direction === 'horizontal' ? 'xPercent' : 'yPercent'

            const scrubAttr = trigger.getAttribute('data-parallax-scrub')
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true

            /* In-flow (formerly disabled) images get a touch more drift on
               touch so the parallax reads clearly; full-bleed keep 3. */
            const range = disabled ? 3.5 : 3
            const startAttr = trigger.getAttribute('data-parallax-start')
            const startVal = startAttr !== null ? parseFloat(startAttr) : range

            const endAttr = trigger.getAttribute('data-parallax-end')
            const endVal = endAttr !== null ? parseFloat(endAttr) : -range

            const scrollStartRaw =
              trigger.getAttribute('data-parallax-scroll-start') || 'top bottom'
            const scrollEndRaw =
              trigger.getAttribute('data-parallax-scroll-end') || 'bottom top'

            gsap.fromTo(
              target,
              {[prop]: startVal},
              {
                [prop]: endVal,
                ease: 'none',
                scrollTrigger: {
                  trigger,
                  start: `clamp(${scrollStartRaw})`,
                  end: `clamp(${scrollEndRaw})`,
                  scrub,
                },
              },
            )

            /* Touch only: a calm fade-in from the cream page background as the
               image scrolls into view (mobile has no WebGL mask reveal).
               Only on the in-flow / padded images (data-parallax-disabled) —
               NOT the full-bleed ones. Videos get the same fade separately. */
            if (isTouch && disabled) {
              gsap.set(target, {opacity: 0})
              gsap.to(target, {
                opacity: 1,
                duration: 1.1,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger,
                  start: 'top 88%',
                  once: true,
                },
              })
            }
          })

        /* Touch only: same calm fade-in for any element opted in with
           [data-fade-in] — used for videos and other in-flow media that
           aren't part of the parallax-trigger system. */
        if (isTouch) {
          document
            .querySelectorAll<HTMLElement>('[data-fade-in]')
            .forEach((el) => {
              gsap.set(el, {opacity: 0})
              gsap.to(el, {
                opacity: 1,
                duration: 1.1,
                ease: 'power2.out',
                scrollTrigger: {trigger: el, start: 'top 88%', once: true},
              })
            })
        }
      })
    })()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
    }
  }, [])
}
