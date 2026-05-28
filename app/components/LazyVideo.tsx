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

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            io.disconnect()
            break
          }
        }
      },
      /* rootMargin gives the video a head-start: start the download
         when it's ~one viewport away from being visible, so it's ready
         to play by the time the user actually scrolls to it. */
      { rootMargin: '200px 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
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
