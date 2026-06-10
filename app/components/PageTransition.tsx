'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import styles from '@/app/components/PageTransition.module.css'

/* Simple cream fade page-transition.
   - Intercept internal link clicks, fade the overlay in, push the
     route, then fade out once the new pathname lands.
   - While covered: stop Lenis, reset scroll to 0, kill leftover
     ScrollTriggers from the old page, then refresh once the new
     page has mounted — without this the next page either opens
     mid-scroll or shows triggers firing seconds later. */
type Phase = 'idle' | 'in' | 'out'

const PageTransition = () => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const firstPathRef = useRef(pathname)
  /* Three-phase state so we can distinguish "swallowing clicks to
     cover the outgoing page" (in) from "letting clicks through to
     the incoming page" (out). Without the split, the overlay kept
     pointer-events:auto for its full ~2.5s lifecycle and blocked
     the header's menu button for a second or so after every nav. */
  const [phase, setPhase] = useState<Phase>('idle')
  const navigatingRef = useRef(false)

  /* Fade OUT after pathname change — also does the scroll/trigger
     reset while the cream still covers the viewport. */
  useEffect(() => {
    if (firstPathRef.current === pathname) return
    firstPathRef.current = pathname

    let cancelled = false

    ;(async () => {
      const [gsapMod, stMod, lenisMod] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('@/app/lib/lenis'),
      ])
      if (cancelled) return

      const gsap = gsapMod.default
      const {ScrollTrigger} = stMod
      const lenis = lenisMod.getLenisInstance()

      /* Entire reset sequence happens while the overlay is at full
         opacity, BEFORE we start fading out. Anything visible during
         the fade-out is therefore the final, settled layout. */

      /* 1. Force scroll to the top. Both Lenis and the window need to
            agree — Lenis drives animated scroll, but ScrollTrigger
            reads window.scrollY as a fallback and Next's default
            scroll-restoration writes to it too. */
      lenis?.scrollTo(0, {immediate: true, force: true})
      window.scrollTo(0, 0)

      /* 2. Give the new page two frames to paint its initial layout
            so ScrollTrigger measures post-mount positions, not the
            old page's DOM. */
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
      await new Promise<void>((r) => requestAnimationFrame(() => r()))
      if (cancelled) return

      /* 3. Short stabilisation pause — useWebGLEffects init is async
            (awaits fonts + image textures) and registers its triggers
            slightly later. One refresh after the pause covers both
            sync triggers and useWebGLEffects' late ones; we used to
            refresh twice (before AND after the pause) which doubled
            the cost of every navigation. */
      await new Promise<void>((r) => setTimeout(r, 150))
      if (cancelled) return

      lenis?.resize()
      ScrollTrigger.refresh()
      lenis?.start()

      const overlay = overlayRef.current
      if (!overlay) {
        navigatingRef.current = false
        setPhase('idle')
        return
      }

      /* Enter the 'out' phase BEFORE the tween starts so the overlay
         drops pointer-events:auto immediately — the new page is
         already mounted, nothing on the outgoing side to shield. */
      setPhase('out')

      /* 5. Smooth reveal. Longer duration + gentler ease so it reads
            as a deliberate transition rather than a quick swap. */
      gsap.to(overlay, {
        autoAlpha: 0,
        duration: 0.95,
        ease: 'power2.inOut',
        onComplete: () => {
          setPhase('idle')
          /* Unlock clicks only once the full transition is done.
             Previously we unlocked at the start of fade-out so users
             could queue the next nav during the cream retreat — but
             that let them out-run useWebGLEffects' async dispose
             (renderer.dispose() + forceContextLoss happen on unmount
             of the outgoing page's effect, which only fires after
             React commits the new page). Rapid chained clicks piled
             up WebGL contexts faster than they could be released and
             eventually force-lost the persistent menu renderer. */
          navigatingRef.current = false
        },
      })
    })()

    return () => {
      cancelled = true
    }
  }, [pathname])

  /* Fade IN on internal link click, then push the route. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = (e.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#')
      ) return

      const url = new URL(anchor.href, window.location.origin)
      if (url.origin !== window.location.origin) return

      /* Same-path click is a no-op — let it through without firing the
         cream fade. */
      if (url.pathname === window.location.pathname) return

      const dest = url.pathname + url.search + url.hash

      /* preventDefault AND stopPropagation so Next.js Link's own click
         handler (delegated at the React root) doesn't also push the
         route — otherwise navigation happens immediately and our fade
         overlay is skipped. Needs capture phase (below) to beat Link. */
      e.preventDefault()
      e.stopPropagation()

      if (navigatingRef.current) return
      navigatingRef.current = true
      setPhase('in')

      ;(async () => {
        const [gsapMod, lenisMod] = await Promise.all([
          import('gsap'),
          import('@/app/lib/lenis'),
        ])
        const gsap = gsapMod.default
        const lenis = lenisMod.getLenisInstance()

        /* Freeze the current scroll so wheel/touch input during the
           fade can't scroll the outgoing page behind the overlay. */
        lenis?.stop()

        const overlay = overlayRef.current
        if (!overlay) {
          router.push(dest)
          return
        }
        gsap.to(overlay, {
          autoAlpha: 1,
          duration: 0.85,
          ease: 'power2.inOut',
          onComplete: () => {
            router.push(dest)
          },
        })
      })()
    }

    /* Capture phase — runs BEFORE any React-delegated onClick on the
       same <a>, including Next.js Link's navigation handler. Without
       this, Link intercepts the click first for things like the home
       logo, which means the transition never fires. */
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      data-phase={phase}
      aria-hidden="true"
    />
  )
}

export default PageTransition
