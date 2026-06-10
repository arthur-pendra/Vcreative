'use client'

import type { ReactNode } from 'react'
import { useWebGLEffects } from '@/app/lib/webgl/useWebGLEffects'
import { useGlobalParallax } from '@/app/lib/webgl/useGlobalParallax'

/* Lightweight client boundary that runs the shared scroll/WebGL hooks so
   any page — server- or client-component — gets the noise-mask text
   reveals and the [data-parallax] pan effect just by wrapping its JSX.

   Dit is de ENIGE plek waar de hooks aangeroepen worden: elke pagina
   wrapt zijn JSX in <PageFX> (server pages houden zo hun metadata). */
const PageFX = ({ children }: { children: ReactNode }) => {
  useGlobalParallax()
  useWebGLEffects()
  return <>{children}</>
}

export default PageFX
