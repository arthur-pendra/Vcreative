'use client'

import { useEffect, useRef } from 'react'
import type * as THREE from 'three'

/* WebGL-embossed logo lit through a baked normal map. The PNG stores a
   per-pixel surface normal encoded as RGB (XYZ in [0,1]), which we
   decode in the shader and light with a single directional light +
   Phong-ish specular. We output the DELTA from what a flat pixel
   would render, so unlit areas collapse to the exact paper colour
   (invisible against the card) and only the embossed relief produces
   highlights/shadows.

   The light direction is driven by cursor position: at rest it sits at
   the configured azimuth/elevation; while the cursor is over the logo,
   the vector tilts gently toward it. A small rAF loop lerps the
   smoothed mouse value so the shift feels natural rather than snappy. */

type Props = {
  src: string
  className?: string
  ariaHidden?: boolean
  paperColor?: string        // slightly darker cream by default
  strength?: number          // scales the normal map's XY (>1 = more relief, <1 = softer)
  azimuth?: number           // rest light horizontal angle in degrees (0 = right, 90 = top, 180 = left, 270 = bottom)
  elevation?: number         // rest light vertical angle in degrees (0 = grazing, 90 = top-down)
  mouseInfluence?: number    // how far the cursor pulls the light (0 = off, ~0.35 subtle, 1 = strong)
  specIntensity?: number     // specular brightness, default 0.8
  diffIntensity?: number     // diffuse contribution to the emboss delta, default 0.5
  shininess?: number         // Phong exponent, higher = tighter highlights
  framePadding?: number      // flat "paper plane" frame around the logo, ratio of the canvas (0..0.25)
  frameShadow?: number       // cast-shadow strength in the flat frame (0 = off)
  frameShadowDist?: number   // how far the cast shadow reaches into the frame (UV units)
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uNormalMap;
  uniform vec3 uPaperColor;
  uniform vec3 uLightDir;
  uniform float uStrength;
  uniform float uSpecIntensity;
  uniform float uDiffIntensity;
  uniform float uShininess;
  uniform float uFramePadding;
  uniform float uFrameShadow;
  uniform float uFrameShadowDist;

  varying vec2 vUv;

  void main() {
    /* Remap the canvas UV into the logo's inner UV: the central
       (1 - 2*padding) block of the canvas maps to [0,1]² on the normal
       map. Anything outside that block is the flat "paper plane" —
       same cream, no relief, catches the cast shadow. */
    float pad = clamp(uFramePadding, 0.0, 0.49);
    vec2 innerUV = (vUv - pad) / max(1.0 - 2.0 * pad, 0.0001);
    bool inside =
      innerUV.x >= 0.0 && innerUV.x <= 1.0 &&
      innerUV.y >= 0.0 && innerUV.y <= 1.0;

    vec3 L = normalize(uLightDir);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 H = normalize(L + V);

    float diffDelta = 0.0;
    float specDelta = 0.0;

    if (inside) {
      /* Decode normal: RGB [0,1] → XYZ [-1,1]. uStrength rescales the
         lateral components so the relief can be toned up/down without
         re-baking the map. Re-normalise to keep the vector unit length. */
      vec3 rawN = texture2D(uNormalMap, innerUV).xyz * 2.0 - 1.0;
      vec3 N = normalize(vec3(rawN.xy * uStrength, max(rawN.z, 0.001)));

      /* Reference: what a perfectly flat pixel (N = +Z) would return. */
      vec3 flatN = vec3(0.0, 0.0, 1.0);
      float flatDiff = max(dot(flatN, L), 0.0);
      float flatSpec = pow(max(dot(flatN, H), 0.0), uShininess);

      float curDiff = max(dot(N, L), 0.0);
      float curSpec = pow(max(dot(N, H), 0.0), uShininess);

      diffDelta = curDiff - flatDiff;
      specDelta = curSpec - flatSpec;
    } else if (uFrameShadow > 0.0 && uFrameShadowDist > 0.0) {
      /* Cast-shadow approximation on the flat frame: step once from
         the current pixel toward the light source and sample the
         normal map. If that sample has a sidewall pointing toward the
         light, it's an occluder — darken the current flat pixel in
         proportion to how much of its face catches the light, faded
         with distance from the logo edge so the shadow softens as it
         reaches into the frame. */
      vec2 shadowUV = innerUV + L.xy * uFrameShadowDist;
      if (
        shadowUV.x >= 0.0 && shadowUV.x <= 1.0 &&
        shadowUV.y >= 0.0 && shadowUV.y <= 1.0
      ) {
        vec3 rawN = texture2D(uNormalMap, shadowUV).xyz * 2.0 - 1.0;
        float wallFacingLight = max(dot(normalize(rawN), L), 0.0);
        vec2 edgeDelta = max(-innerUV, innerUV - vec2(1.0));
        float distToEdge = max(edgeDelta.x, edgeDelta.y);
        float falloff = 1.0 - smoothstep(0.0, uFrameShadowDist, distToEdge);
        diffDelta = -wallFacingLight * uFrameShadow * falloff;
      }
    }

    /* Modulate cream by how much more/less light this pixel catches.
       Both diffuse and specular are tinted with the paper colour so
       highlights read as a brighter cream instead of popping to pure
       white — embossed paper catches light in its own tone, not in a
       different hue. Zero-delta areas (flat paper) → color == cream. */
    vec3 color = uPaperColor
               + uPaperColor * diffDelta * uDiffIntensity
               + uPaperColor * specDelta * uSpecIntensity;

    color = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ]
}

const EmbossedLogo = ({
  src,
  className,
  ariaHidden = true,
  paperColor = '#F2EBD9',
  strength = 1,
  azimuth = 135,
  elevation = 45,
  mouseInfluence = 0.2,
  specIntensity = 0.4,
  diffIntensity = 0.25,
  shininess = 48,
  framePadding = 0,
  frameShadow = 0.25,
  frameShadowDist = 0.08,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    const init = async () => {
      const THREE = await import('three')
      if (cancelled) return

      const dpr = Math.min(window.devicePixelRatio, 2)
      /* offsetWidth/Height are unaffected by CSS transforms, so a
         parent-scaled container still renders at the natural resolution
         and stays crisp when the scale grows. */
      const naturalW = Math.max(container.offsetWidth, 1)
      const naturalH = Math.max(container.offsetHeight, 1)

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(dpr)
      renderer.setSize(naturalW, naturalH, false)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1, 1)

      const loader = new THREE.TextureLoader()
      const texture = await loader.loadAsync(src)
      if (cancelled) {
        renderer.dispose()
        return
      }
      /* 4K normal map downsampled to a ~500px render target looks like
         jagged noise without mipmaps — each fragment picks a single
         texel out of ~64 and misses every edge in between. Trilinear
         filtering (LinearMipmapLinear) averages across mip levels, and
         max anisotropy keeps glancing-angle regions crisp without the
         typical trilinear blur. */
      texture.generateMipmaps = true
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
      /* Normal maps are data, not colour — NoColorSpace keeps the
         stored XYZ from being gamma-decoded. */
      texture.colorSpace = THREE.NoColorSpace

      const azRad = (azimuth * Math.PI) / 180
      const elRad = (elevation * Math.PI) / 180
      const baseLight = new THREE.Vector3(
        Math.cos(azRad) * Math.cos(elRad),
        Math.sin(azRad) * Math.cos(elRad),
        Math.sin(elRad),
      )

      const [pr, pg, pb] = hexToRgb(paperColor)

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uNormalMap: { value: texture },
          uPaperColor: { value: new THREE.Color(pr, pg, pb) },
          uStrength: { value: strength },
          uLightDir: { value: baseLight.clone() },
          uSpecIntensity: { value: specIntensity },
          uDiffIntensity: { value: diffIntensity },
          uShininess: { value: shininess },
          uFramePadding: { value: framePadding },
          uFrameShadow: { value: frameShadow },
          uFrameShadowDist: { value: frameShadowDist },
        },
        vertexShader,
        fragmentShader,
      })

      const geometry = new THREE.PlaneGeometry(1, 1)
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const render = () => renderer.render(scene, camera)
      render()

      /* ── Mouse-driven light tilt ──
         target = latest cursor position, -1..1 relative to the logo
         center. current = smoothed value the shader actually reads.
         The rAF loop lerps current → target and stops itself once the
         delta is small enough to be invisible, so we're not burning a
         frame every 16ms when nothing is happening. */
      const mouseTarget = { x: 0, y: 0 }
      const mouseCurrent = { x: 0, y: 0 }
      const tiltVec = new THREE.Vector3()
      let rafId: number | null = null

      const tick = () => {
        const dx = mouseTarget.x - mouseCurrent.x
        const dy = mouseTarget.y - mouseCurrent.y
        mouseCurrent.x += dx * 0.08
        mouseCurrent.y += dy * 0.08

        tiltVec
          .set(
            baseLight.x + mouseCurrent.x * mouseInfluence,
            baseLight.y + mouseCurrent.y * mouseInfluence,
            baseLight.z,
          )
          .normalize()
        ;(material.uniforms.uLightDir.value as THREE.Vector3).copy(tiltVec)
        render()

        /* Below ~1/1000 the shift is visually nil; stop looping so the
           GPU can idle. Any mousemove restarts the loop instantly. */
        const settled = Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001
        rafId = settled ? null : requestAnimationFrame(tick)
      }

      const startTick = () => {
        if (rafId == null) rafId = requestAnimationFrame(tick)
      }

      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect()
        /* Clamp just in case the event fires on a child outside rect
           due to rapid motion. Y is inverted so cursor-up raises light. */
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
        mouseTarget.x = Math.max(-1, Math.min(1, nx))
        mouseTarget.y = Math.max(-1, Math.min(1, -ny))
        startTick()
      }

      const onPointerLeave = () => {
        mouseTarget.x = 0
        mouseTarget.y = 0
        startTick()
      }

      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerleave', onPointerLeave)

      let resizeTimeout: ReturnType<typeof setTimeout>
      const onResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          const w = Math.max(container.offsetWidth, 1)
          const h = Math.max(container.offsetHeight, 1)
          renderer.setSize(w, h, false)
          render()
        }, 120)
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        if (rafId != null) cancelAnimationFrame(rafId)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('resize', onResize)
        clearTimeout(resizeTimeout)
        geometry.dispose()
        material.dispose()
        texture.dispose()
        renderer.dispose()
        /* renderer.dispose() alone doesn't release the WebGL context —
           the context hangs around until GC. forceContextLoss drops it
           back to the browser's pool immediately so rapid navigation
           between pages that each mount an EmbossedLogo doesn't pile
           up contexts and trigger "Too many active WebGL contexts". */
        try { renderer.forceContextLoss() } catch {}
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    init()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [
    src,
    paperColor,
    strength,
    azimuth,
    elevation,
    mouseInfluence,
    specIntensity,
    diffIntensity,
    shininess,
    framePadding,
    frameShadow,
    frameShadowDist,
  ])

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden={ariaHidden}
    />
  )
}

export default EmbossedLogo
