'use client'

import { useEffect, useRef, useState } from 'react'

/* Video that only starts downloading + playing once it enters the
   viewport. The social-items section on case pages embeds 2–3
   autoPlay videos below the fold; without lazy loading the browser
   fetches all of them on page load (5–9 MB per case page) even though
   the user might not scroll there. IntersectionObserver pushes that
   work to when it actually matters. */
type Props = {
  src: string
  poster?: string
  className?: string
  loop?: boolean
  ariaLabel?: string
}

const LazyVideo = ({
  src,
  poster,
  className,
  loop = true,
  ariaLabel,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    /* Track whether the video is currently on screen so the
       visibilitychange handler below knows whether to resume it when
       the tab comes back to the foreground. */
    let isIntersecting = false

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isIntersecting = entry.isIntersecting
          if (entry.isIntersecting) {
            /* Eerste keer in beeld: trigger de download. Bij elke
               volgende keer in beeld: hervat het afspelen. */
            setShouldLoad(true)
            el.play().catch(() => {})
          } else {
            /* Buiten beeld: pauzeer zodat we geen video blijven decoden
               die niemand ziet — scheelt CPU/GPU en batterij. */
            el.pause()
          }
        }
      },
      /* rootMargin gives the video a head-start: start the download
         when it's ~one viewport away from being visible, so it's ready
         to play by the time the user actually scrolls to it. */
      { rootMargin: '200px 0px' },
    )

    io.observe(el)

    /* A backgrounded tab keeps decoding autoplay videos otherwise. Pause
       on hide; resume on show only if the video is still in view. With
       several reels in a grid this stops a pile of H.264 decoders from
       running while the user is on another tab. */
    const onVisibility = () => {
      if (document.hidden) {
        el.pause()
      } else if (isIntersecting) {
        el.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (!shouldLoad) return
    const el = videoRef.current
    if (!el) return
    /* Some browsers don't auto-start when src is set imperatively
       after mount; call play() explicitly. catch() swallows the
       NotAllowedError that fires if the tab is backgrounded — the
       video will resume on the next gesture/visibility change. */
    el.play().catch(() => {})
  }, [shouldLoad])

  return (
    <video
      ref={videoRef}
      className={className}
      src={shouldLoad ? src : undefined}
      poster={poster}
      autoPlay={shouldLoad}
      loop={loop}
      muted
      playsInline
      preload="none"
      aria-label={ariaLabel}
    />
  )
}

export default LazyVideo
