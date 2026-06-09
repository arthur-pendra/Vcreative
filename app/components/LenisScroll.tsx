'use client'

import { useEffect } from 'react'
import { setLenisInstance } from '@/app/lib/lenis'

/* Lenis smooth scroll, driven by the GSAP ticker.
   Integration pattern:
     - GSAP's ticker pumps Lenis's RAF so timing stays synced
     - Lenis forwards its scroll events to ScrollTrigger.update
     - Whenever ScrollTrigger refreshes (pin spacers, resize, route
       change), we call lenis.resize() so Lenis re-measures the
       document immediately — without this there's a one-frame window
       where Lenis's cached height is stale after a pin adds its spacer
       and the user's wheel input can "stick" against an outdated max.

   This component is rendered in the root layout, so it lives across
   client-side navigations — no teardown/setup on every route change. */
const LenisScroll = () => {
  useEffect(() => {
    let lenis: any
    let tickerFn: ((time: number) => void) | undefined
    let scrollTriggerUpdate: (() => void) | undefined
    let onStRefresh: (() => void) | undefined
    let gsapRef: typeof import('gsap')['default'] | undefined
    let scrollTriggerRef:
      | typeof import('gsap/ScrollTrigger')['ScrollTrigger']
      | undefined
    /* Flipped by cleanup. init() awaits its dynamic imports, so under
       React StrictMode (dev) the mount→unmount→mount cycle runs cleanup
       BEFORE the first init resolves — at which point lenis/tickerFn are
       still undefined, so cleanup can't tear them down. Without this
       guard the superseded init then goes on to create a SECOND Lenis +
       ticker fn that never gets cleaned up, leaving two instances both
       driving window.scrollTo + ScrollTrigger.update every frame (janky
       scroll). The guard makes the stale init bail before it builds
       anything. */
    let cancelled = false

    const init = async () => {
      if (
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      const [{ default: Lenis }, gsapMod, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return
      const gsap = gsapMod.default
      gsap.registerPlugin(ScrollTrigger)
      gsapRef = gsap
      scrollTriggerRef = ScrollTrigger

      lenis = new Lenis({
        /* Native touch scroll on mobile (no smoothing) so it feels like a
           normal/native website rather than the stiff lerped smooth-scroll.
           Desktop wheel stays smooth. The WebGL text overlay tracks the
           native scroll directly (window.scrollY, see useWebGLEffects). */
        syncTouch: false,
      })
      setLenisInstance(lenis)

      // Feed Lenis scroll events straight into ScrollTrigger
      scrollTriggerUpdate = () => ScrollTrigger.update()
      lenis.on('scroll', scrollTriggerUpdate)

      // Drive Lenis from the GSAP ticker (seconds → milliseconds)
      tickerFn = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tickerFn)
      gsap.ticker.lagSmoothing(0)

      /* Whenever ScrollTrigger refreshes — happens after pin spacers
         are added/removed, route changes, window resize, etc. — tell
         Lenis to re-measure the document so wheel input never sticks
         against a stale max-scroll value. */
      onStRefresh = () => {
        if (lenis && typeof lenis.resize === 'function') lenis.resize()
      }
      ScrollTrigger.addEventListener('refresh', onStRefresh)
    }

    init()

    return () => {
      cancelled = true
      if (tickerFn && gsapRef) gsapRef.ticker.remove(tickerFn)
      if (lenis && scrollTriggerUpdate) lenis.off('scroll', scrollTriggerUpdate)
      if (onStRefresh && scrollTriggerRef) {
        scrollTriggerRef.removeEventListener('refresh', onStRefresh)
      }
      if (lenis) {
        lenis.destroy()
        setLenisInstance(null)
      }
    }
  }, [])

  return null
}

export default LenisScroll
