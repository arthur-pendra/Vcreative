'use client'

import { useEffect, useRef, useState } from 'react'
import Logo3D from '@/app/components/Logo3D'
import styles from '@/app/components/Loader.module.css'

/* Keep in sync with the .loader opacity transition in Loader.module.css. */
const FADE_MS = 800
/* The logo already fully fades out at the end of its own timeline, so lift the
   cream immediately after — no extra beat, which read as a hang. */
const HOLD_MS = 0
/* Safety net: fade out even if the 3D model never loads (so the site is
   never permanently hidden behind the loader). Generous enough to outlast
   the full enter → spin → exit timeline plus model load time. */
const FALLBACK_MS = 9000

const Loader = () => {
  const [fading, setFading] = useState(false)
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)

  const unlockScroll = () => {
    document.body.style.removeProperty('overflow')
    document.documentElement.style.removeProperty('overflow')
  }

  const startFade = () => {
    if (startedRef.current) return
    startedRef.current = true
    /* Hold a beat after the logo wipes out, then lift the cream overlay. */
    window.setTimeout(() => {
      unlockScroll()
      setFading(true)
      window.setTimeout(() => setDone(true), FADE_MS)
    }, HOLD_MS)
  }

  useEffect(() => {
    /* Lock scroll while the loader covers the screen. */
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const fallback = window.setTimeout(startFade, FALLBACK_MS)
    return () => {
      window.clearTimeout(fallback)
      unlockScroll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  return (
    <div
      className={`${styles.loader}${fading ? ` ${styles.fading}` : ''}`}
      aria-hidden="true"
    >
      <Logo3D
        interaction="idle"
        hoverSpin={false}
        spinOnMount
        onSpinComplete={startFade}
        className={styles.logo}
      />
    </div>
  )
}

export default Loader
