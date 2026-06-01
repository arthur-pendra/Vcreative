'use client'

import { useEffect } from 'react'
import type * as THREE from 'three'

/* ── Text Overlay Shader (bg-colored mask dissolves to reveal DOM text) ── */

const textVertShader = /* glsl */ `
precision highp float;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const textFragShader = /* glsl */ `
precision highp float;
uniform float uReveal;
uniform vec3 uColor;
uniform vec2 uAspect;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv * uAspect * 8.0;
  float n1 = fbm(uv);
  float n1b = fbm(uv + vec2(5.2, 1.3));
  vec2 warped = uv + vec2(n1, n1b) * 0.4;
  float n2 = fbm(warped + vec2(1.7, 9.2));
  float n2b = fbm(warped + vec2(8.3, 2.8));
  vec2 warped2 = warped + vec2(n2, n2b) * 0.4;
  float n3 = fbm(warped2);
  float fine = fbm(vUv * 28.0 + vec2(n2, n3) * 0.2);
  float n = n3 * 0.55 + fine * 0.45;

  float progress = uReveal * 1.5 - 0.25;
  float mask = smoothstep(progress - 0.15, progress + 0.15, n);
  if (mask < 0.01) discard;
  gl_FragColor = vec4(uColor, mask);
}
`

/* ── Image Shaders ── */

const imgVertShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 ssCoords;

uniform vec2 uTextureSize;
uniform vec2 uQuadSize;
uniform float u_progress;
uniform bool u_enableBend;

void main() {
  vec3 pos = position;
  mat4 MVPM = projectionMatrix * modelViewMatrix;
  vec4 originalPosition = MVPM * vec4(position, 1.0);
  ssCoords = vec2(originalPosition.xy / originalPosition.w);

  if (u_enableBend) {
    float startAt = uv.y - 0.5;
    float finishAt = uv.y;
    float bend = smoothstep(startAt, finishAt, 1.0 - u_progress);
    pos.x *= 1.0 + (bend * 0.04) * abs(ssCoords.x);
    pos.z += bend * 7.0;
  }

  vUv = uv;
  gl_Position = MVPM * vec4(pos, 1.0);
}
`

const imgFragShader = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform vec2 uQuadSize;
uniform float u_opacity;
uniform float u_innerScale;
uniform float u_innerY;
uniform float u_edgeFade;

varying vec2 vUv;
varying vec2 ssCoords;

vec2 getCoverUv(vec2 uv, vec2 textureSize, vec2 quadSize) {
  vec2 ratio = vec2(
    min((quadSize.x / quadSize.y) / (textureSize.x / textureSize.y), 1.0),
    min((quadSize.y / quadSize.x) / (textureSize.y / textureSize.x), 1.0)
  );
  return vec2(
    uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    uv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main() {
  vec2 uv = getCoverUv(vUv, uTextureSize, uQuadSize);

  vec2 scaleOrigin = vec2(0.5);
  uv = (uv - scaleOrigin) / u_innerScale + scaleOrigin;
  uv.y += u_innerY;

  vec4 color = texture2D(uTexture, uv);

  float thresholdLeft = smoothstep(-0.85, -1.0, ssCoords.x) * u_edgeFade;
  float thresholdRight = smoothstep(0.85, 1.0, ssCoords.x) * u_edgeFade;
  float thresholdTop = smoothstep(0.85, 1.0, ssCoords.y) * u_edgeFade;
  float thresholdBottom = smoothstep(-0.85, -1.0, ssCoords.y) * u_edgeFade;
  float threshold = thresholdLeft + thresholdRight + thresholdBottom + thresholdTop;

  float colorShiftR = texture2D(uTexture, uv + vec2(0.0, 0.003)).r;
  float colorShiftG = texture2D(uTexture, uv - vec2(0.0, 0.003)).g;
  color.r = mix(color.r, colorShiftR, threshold);
  color.g = mix(color.g, colorShiftG, threshold);

  gl_FragColor = vec4(color.rgb, color.a * u_opacity);
}
`

interface TextEntry {
  mesh: THREE.Mesh
  element: HTMLElement
  material: THREE.ShaderMaterial
  bounds: DOMRect
  y: number
  isVisible: boolean
}

interface ImageEntry {
  mesh: THREE.Mesh
  element: HTMLElement
  imgElement: HTMLImageElement
  material: THREE.ShaderMaterial
  effect: string
  width: number
  height: number
  top: number
  left: number
  depth: number
}

/* Runs the shared WebGL pipeline:
   - [data-animation="webgl-text"] gets a noise-mask reveal
       mode="hero"          → auto-plays on load
       mode="time-trigger"  → plays once on scroll enter, cyclable via events
       default              → scrubbed with scroll
   - [data-webgl-media]      → three.js textured quad with bend + parallax pan
   - Desktop uses a full-screen overlay canvas; mobile uses per-element canvases
     for text only (images fall back to <img>). */
type GsapTween = {
  kill: () => void
  scrollTrigger?: { kill: () => void } | null
}
type GsapScrollTrigger = { kill: () => void }
type LenisLike = {
  on: (event: string, cb: (e?: unknown) => void) => void
  off: (event: string, cb: (e?: unknown) => void) => void
  animatedScroll: number
  actualScroll: number
}

export function useWebGLEffects() {
  useEffect(() => {
    document.body.classList.add('webgl-active')

    let animationId: number
    let resizeHandler: (() => void) | undefined
    let scrollHandler: (() => void) | undefined
    let refreshHandler: (() => void) | undefined
    let scrollTriggerRef:
      | typeof import('gsap/ScrollTrigger')['ScrollTrigger']
      | undefined
    let docResizeObserver: ResizeObserver | undefined
    const remeasureTimeouts: ReturnType<typeof setTimeout>[] = []
    let remeasureDebounce: ReturnType<typeof setTimeout> | undefined
    let canvas: HTMLCanvasElement | undefined
    let cancelled = false
    let needsRender = true

    /* Track everything this hook instance creates so unmount can tear it
       all down. Without this, tweens/triggers from the previous page stay
       in ScrollTrigger.getAll() pointing at detached DOM, which makes
       the next page's triggers misbehave. */
    const tweens: GsapTween[] = []
    const triggers: GsapScrollTrigger[] = []
    /* DOM event listeners registered on time-trigger text elements.
       Stored so we can removeEventListener them on unmount — otherwise
       inline handlers would stack across any re-mount (StrictMode in
       dev, fast navigation) and fire the reveal tween several times
       per click. */
    const domListeners: Array<{el: HTMLElement, type: string, fn: EventListener}> = []
    let lenisRef: LenisLike | null = null

    /* Every GPU-backed resource this hook creates goes in here. Without
       this, unmount only removed the canvas from the DOM — the WebGL
       renderer, materials, geometries, textures and post-processing
       composer all stayed alive. After ~15 client-side navigations the
       browser hits its WebGL context cap, force-loses the oldest
       context, and the menu's ink (which lives on a persistent canvas
       in the root layout) goes blank or throws "Context Lost". */
    const disposables: Array<{dispose?: () => void}> = []
    /* Composer needs special handling in cleanup: its passes don't get
       disposed by composer.dispose(), only its render targets do. */
    let composerRef: {dispose?: () => void; passes?: Array<{dispose?: () => void}>} | null = null
    /* Flipped by the cleanup fn. Any disposable registered AFTER the
       cleanup has already run (i.e. an in-flight async init that hasn't
       bailed on `cancelled` yet) gets disposed on the spot so it
       doesn't leak. This is the difference between "normal" and "rapid
       navigation" — normal unmount runs cleanup AFTER init finished,
       rapid nav cancels init mid-promise and the tail of init would
       otherwise keep pushing renderers/materials into a dead array. */
    let cleanupDone = false
    const registerDisposable = (d: {dispose?: () => void}) => {
      if (cleanupDone) {
        try { d.dispose?.() } catch {}
      } else {
        disposables.push(d)
      }
    }

    const restoreElements: Array<{el: HTMLElement, prop: string, val: string}> = []

    const init = async () => {
      await document.fonts.ready

      /* Mobile/touch: skip the entire WebGL text + image pipeline.
         The per-element renderers were heavy (5–10 contexts per case
         page) and visually didn't read well on small screens. Text
         elements stay as plain DOM, [data-webgl-media] images render
         as normal <img> (already the case below). useGlobalParallax
         is a separate hook and keeps running for the scroll-pan. */
      const isTouch = 'ontouchstart' in document.documentElement
      if (isTouch) return

      const THREE = await import('three')
      const {getLenisInstance} = await import('@/app/lib/lenis')
      const gsap = (await import('gsap')).default
      const {ScrollTrigger} = await import('gsap/ScrollTrigger')
      const {EffectComposer} = await import('three/examples/jsm/postprocessing/EffectComposer.js')
      const {RenderPass} = await import('three/examples/jsm/postprocessing/RenderPass.js')
      const {ShaderPass} = await import('three/examples/jsm/postprocessing/ShaderPass.js')

      gsap.registerPlugin(ScrollTrigger)

      if (cancelled) return

      let lenis = getLenisInstance()
      if (!lenis) {
        for (let i = 0; i < 40; i++) {
          await new Promise((r) => setTimeout(r, 50))
          if (cancelled) return
          lenis = getLenisInstance()
          if (lenis) break
        }
      }
      lenisRef = lenis as LenisLike | null

      const getScroll = () => lenis ? lenis.animatedScroll : window.scrollY
      const getScrollRaw = () => lenis ? lenis.actualScroll : window.scrollY

      scrollHandler = () => { needsRender = true }
      if (lenis) {
        lenis.on('scroll', scrollHandler)
      } else {
        window.addEventListener('scroll', scrollHandler, { passive: true })
      }

      const screen = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      const DIST = 500

      const fov =
        2 * Math.atan(screen.height / 2 / DIST) * (180 / Math.PI)

      const camera = new THREE.PerspectiveCamera(
        fov,
        screen.width / screen.height,
        10,
        1000,
      )
      camera.position.z = DIST

      const dpr = Math.min(window.devicePixelRatio, 2)

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        stencil: false,
        powerPreference: 'high-performance',
      })
      renderer.setSize(screen.width, screen.height)
      renderer.setPixelRatio(dpr)
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace
      registerDisposable(renderer)

      canvas = renderer.domElement
      canvas.style.cssText =
        'position:fixed;top:0;left:0;pointer-events:none;z-index:10;'
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      document.body.appendChild(canvas)

      const scene = new THREE.Scene()
      const textGeometry = new THREE.PlaneGeometry(1, 1)
      registerDisposable(textGeometry)

      /* Mask color = background it dissolves from. Defaults to cream; elements
         on dark sections can override via data-webgl-text-bg="#332f29". */
      const CREAM_RGB = new THREE.Vector3(0xf2 / 255, 0xeb / 255, 0xd9 / 255)
      const getMaskColor = (element: HTMLElement) => {
        const attr = element.dataset.webglTextBg
        if (!attr) return CREAM_RGB.clone()
        const hex = attr.replace('#', '')
        if (hex.length !== 6) return CREAM_RGB.clone()
        const r = parseInt(hex.slice(0, 2), 16) / 255
        const g = parseInt(hex.slice(2, 4), 16) / 255
        const b = parseInt(hex.slice(4, 6), 16) / 255
        return new THREE.Vector3(r, g, b)
      }

      const textElements = document.querySelectorAll<HTMLElement>(
        '[data-animation="webgl-text"]',
      )
      const texts: TextEntry[] = []

      {
        /* Desktop: single WebGL overlay canvas (smooth with Lenis) */
        const PAD_X = 0.12
        const PAD_Y = 0.25

        textElements.forEach((element) => {
          const bounds = element.getBoundingClientRect()
          const y = bounds.top + getScrollRaw()

          const paddedW = bounds.width * (1 + PAD_X * 2)
          const paddedH = bounds.height * (1 + PAD_Y * 2)
          const aspect = paddedW / paddedH
          const material = new THREE.ShaderMaterial({
            fragmentShader: textFragShader,
            vertexShader: textVertShader,
            transparent: true,
            uniforms: {
              uReveal: new THREE.Uniform(0),
              uColor: {value: getMaskColor(element)},
              uAspect: {value: new THREE.Vector2(aspect, 1.0)},
            },
          })
          registerDisposable(material)

          const mesh = new THREE.Mesh(textGeometry, material)
          mesh.scale.set(paddedW, paddedH, 1)
          scene.add(mesh)

          texts.push({mesh, element, material, bounds, y, isVisible: false})
        })

        texts.forEach((t) => {
          t.isVisible = true
          const mode = t.element.dataset.webglTextMode

          const remeasure = () => {
            const b = t.element.getBoundingClientRect()
            t.bounds = b
            t.y = b.top + getScrollRaw()
            const pW = b.width * (1 + PAD_X * 2)
            const pH = b.height * (1 + PAD_Y * 2)
            t.mesh.scale.set(pW, pH, 1)
            ;(t.material.uniforms.uAspect.value as THREE.Vector2).set(pW / pH, 1.0)
            needsRender = true
          }

          if (mode === 'hero') {
            tweens.push(gsap.to(t.material.uniforms.uReveal, {
              value: 1,
              duration: 3,
              delay: 0,
              ease: 'power2.inOut',
              onUpdate: () => { needsRender = true },
            }))
          } else if (mode === 'time-trigger' || mode === 'carousel') {
            /* carousel mode: skip the initial scroll reveal, start
               already revealed, but keep the replay/remeasured event
               listeners for carousel swap transitions. */
            if (mode === 'carousel') {
              t.material.uniforms.uReveal.value = 1
              needsRender = true
            } else {
              triggers.push(ScrollTrigger.create({
                trigger: t.element,
                start: 'top 95%',
                once: true,
                onEnter: () => {
                  remeasure()
                  tweens.push(gsap.to(t.material.uniforms.uReveal, {
                    value: 1,
                    duration: 1.4,
                    ease: 'power2.inOut',
                    onUpdate: () => { needsRender = true },
                  }))
                },
              }))
            }
            const onReplayT = () => {
              gsap.killTweensOf(t.material.uniforms.uReveal)
              tweens.push(gsap.to(t.material.uniforms.uReveal, {
                value: 0,
                duration: 0.3,
                ease: 'power2.in',
                onUpdate: () => { needsRender = true },
              }))
            }
            const onRemeasuredT = () => {
              remeasure()
              gsap.killTweensOf(t.material.uniforms.uReveal)
              tweens.push(gsap.to(t.material.uniforms.uReveal, {
                value: 1,
                duration: 0.6,
                ease: 'power2.out',
                onUpdate: () => { needsRender = true },
              }))
            }
            t.element.addEventListener('webgl-text-replay', onReplayT)
            t.element.addEventListener('webgl-text-remeasured', onRemeasuredT)
            domListeners.push(
              {el: t.element, type: 'webgl-text-replay', fn: onReplayT},
              {el: t.element, type: 'webgl-text-remeasured', fn: onRemeasuredT},
            )
          } else {
            tweens.push(gsap.to(t.material.uniforms.uReveal, {
              value: 1,
              ease: 'none',
              onUpdate: () => { needsRender = true },
              scrollTrigger: {
                trigger: t.element,
                start: 'top 95%',
                end: 'top 35%',
                scrub: 0.5,
              },
            }))
          }
        })
      }

      /* WebGL images — desktop only */

      const mediaElements = Array.from(
        document.querySelectorAll<HTMLImageElement>('[data-webgl-media]'),
      )
      const images: ImageEntry[] = []
      const imageGeometry = new THREE.PlaneGeometry(1, 1, 32, 32)
      registerDisposable(imageGeometry)

      /* TextureLoader sets crossOrigin='anonymous', so the decoded image
         is origin-clean and safe to upload to WebGL / draw to a canvas.
         (Reading the raw DOM <img> instead taints the canvas — it has no
         crossOrigin attribute — and texSubImage2D throws a SecurityError.) */
      const textureLoader = new THREE.TextureLoader()

      /* Cap texture resolution. A client photo can be 1920×2880 — that's
         ~22 MB of VRAM per texture (width × height × 4 bytes) regardless
         of how small the webp file is. The quads never render larger than
         ~display size, so anything past ~1600px on the long edge is wasted
         GPU memory + upload bandwidth. We downscale the loaded image into a
         2D canvas and swap it in as the texture's source. */
      const MAX_TEXTURE_SIZE = 1600
      const capTexture = (texture: THREE.Texture) => {
        const src = texture.image as
          | (CanvasImageSource & {naturalWidth?: number; naturalHeight?: number; width: number; height: number})
          | undefined
        if (!src) return
        const w = src.naturalWidth || src.width
        const h = src.naturalHeight || src.height
        const scale = Math.min(1, MAX_TEXTURE_SIZE / Math.max(w, h, 1))
        if (scale >= 1) return
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(w * scale))
        c.height = Math.max(1, Math.round(h * scale))
        c.getContext('2d')!.drawImage(src, 0, 0, c.width, c.height)
        texture.image = c
        texture.needsUpdate = true
      }

      /* Force lazy-loaded WebGL media to start downloading immediately.
         Without this, <img loading="lazy"> below the fold never completes
         until the user scrolls near it, which HANGS the Promise.all below
         and blocks the entire WebGL pipeline — no canvas appears, no text
         reveals fire, etc. The symptom was "WebGL only works after I
         scroll past the studio section" because that's roughly when the
         last lazy project image enters the viewport and completes. */
      mediaElements.forEach((img) => {
        if (img.loading === 'lazy') img.loading = 'eager'
      })

      await Promise.all(
        mediaElements.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve()
              } else {
                img.addEventListener('load', () => resolve(), {once: true})
                img.addEventListener('error', () => resolve(), {once: true})
              }
            }),
        ),
      )

      if (cancelled) return

      for (const img of mediaElements) {
        const texture = await textureLoader.loadAsync(img.src)
        /* Bail the loop if the user navigated away while this texture was
           in flight. registerDisposable still frees the texture — we just
           stop creating materials / meshes that would orphan. */
        if (cancelled) {
          registerDisposable(texture)
          return
        }
        capTexture(texture)
        registerDisposable(texture)
        const maskEl =
          (img.closest('[data-parallax="trigger"]') as HTMLElement | null) || img
        const bounds = maskEl.getBoundingClientRect()
        const effect = img.dataset.webglEffect || 'none'
        const depth = parseFloat(img.dataset.webglDepth || '0')

        const hasBend = effect === 'bend' || effect === 'distort'
        const hasDistort = effect === 'distort'

        const imgMaterial = new THREE.ShaderMaterial({
          vertexShader: imgVertShader,
          fragmentShader: imgFragShader,
          transparent: true,
          uniforms: {
            uTexture: {value: texture},
            /* Aspect ratio only (drives the cover-UV fit) — the source
               img and the downscaled texture share it, so the natural
               dimensions are correct regardless of the texture cap. */
            uTextureSize: {
              value: new THREE.Vector2(
                img.naturalWidth,
                img.naturalHeight,
              ),
            },
            uQuadSize: {
              value: new THREE.Vector2(bounds.width, bounds.height),
            },
            u_progress: {value: 0},
            u_enableBend: {value: hasBend},
            u_innerScale: {value: 1.2},
            u_innerY: {value: -0.1},
            u_opacity: {value: 1},
            u_edgeFade: {value: hasDistort ? 1.0 : 0.0},
          },
        })
        registerDisposable(imgMaterial)

        const imgMesh = new THREE.Mesh(imageGeometry, imgMaterial)
        imgMesh.scale.set(bounds.width, bounds.height, 1)
        scene.add(imgMesh)

        img.style.visibility = 'hidden'
        restoreElements.push({el: img, prop: 'visibility', val: ''})

        images.push({
          mesh: imgMesh,
          element: maskEl,
          imgElement: img,
          material: imgMaterial,
          effect,
          width: bounds.width,
          height: bounds.height,
          top: bounds.top + getScrollRaw(),
          left: bounds.left,
          depth,
        })
      }

      images.forEach((img) => {
        const {effect} = img

        /* Shader-internal parallax — pin u_innerY to neutral when the
           wrapper opts out, otherwise drift it from -0.1 → 0.1 on scroll. */
        const parallaxDisabled =
          img.element instanceof HTMLElement &&
          img.element.hasAttribute('data-parallax-disabled')

        if (parallaxDisabled) {
          img.material.uniforms.u_innerY.value = 0
        } else {
          tweens.push(gsap.fromTo(
            img.material.uniforms.u_innerY,
            {value: -0.1},
            {
              value: 0.1,
              ease: 'none',
              scrollTrigger: {
                trigger: img.element,
                scrub: true,
                start: 'top bottom',
                end: 'bottom top',
              },
            },
          ))
        }

        if (effect === 'bend' || effect === 'distort') {
          tweens.push(gsap.to(img.material.uniforms.u_progress, {
            value: 1.5,
            ease: 'sine.out',
            scrollTrigger: {
              trigger: img.element,
              scrub: true,
              start: 'top bottom',
              end: 'bottom 70%',
            },
          }))
        }
      })

      const barrelShader = {
        uniforms: {
          tDiffuse: {value: null},
          u_bendAmount: {value: -0.03},
          u_maxDistort: {value: 0.1},
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;
          uniform sampler2D tDiffuse;
          uniform float u_bendAmount;
          uniform float u_maxDistort;
          varying vec2 vUv;

          vec2 barrelDistort(vec2 coord, float amt) {
            vec2 cc = coord - 0.5;
            float dist = dot(cc, cc);
            return coord + cc * dist * amt;
          }

          void main() {
            vec2 uv = vUv;
            float rDist = u_maxDistort * u_bendAmount;
            float gDist = u_maxDistort * u_bendAmount * 0.7;
            float bDist = u_maxDistort * u_bendAmount * 0.4;

            float r = texture2D(tDiffuse, barrelDistort(uv, rDist)).r;
            float g = texture2D(tDiffuse, barrelDistort(uv, gDist)).g;
            float b = texture2D(tDiffuse, barrelDistort(uv, bDist)).b;
            float a = texture2D(tDiffuse, barrelDistort(uv, gDist)).a;

            gl_FragColor = vec4(r, g, b, a);
          }
        `,
      }

      /* The barrel post-process is a full-viewport extra pass (render
         target at dpr², then a chromatic-aberration shader pass). It's
         only meaningful when there's webgl-media on screen, so on
         text-only pages we skip the composer entirely and render the
         scene directly — no render target, no second pass. */
      let composer: InstanceType<typeof EffectComposer> | undefined
      if (images.length > 0) {
        composer = new EffectComposer(renderer)
        composer.addPass(new RenderPass(scene, camera))
        const barrelPass = new ShaderPass(barrelShader)
        barrelPass.renderToScreen = true
        composer.addPass(barrelPass)
        /* Stash so cleanup can dispose the composer's render targets +
           walk the passes (composer.dispose() doesn't cascade to them). */
        composerRef = composer as unknown as typeof composerRef
      }

      let fpsCheckCount = 0
      let fpsFrames = 0
      let fpsLastTime = performance.now()

      const checkFPS = () => {
        if (fpsCheckCount >= 10) return
        fpsFrames++
        const now = performance.now()
        if (now - fpsLastTime >= 600) {
          const fps = (fpsFrames / (now - fpsLastTime)) * 1000
          fpsFrames = 0
          fpsLastTime = now
          fpsCheckCount++

          if (fps < 30) {
            const currentDpr = renderer.getPixelRatio()
            if (currentDpr > 1.5) {
              renderer.setPixelRatio(1.5)
              if (composer) composer.setPixelRatio(1.5)
            } else if (currentDpr > 1) {
              renderer.setPixelRatio(1)
              if (composer) composer.setPixelRatio(1)
            }
          }
        }
      }

      const uploadTexture = (texture: THREE.Texture) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            texture.needsUpdate = true
            renderer.initTexture(texture)
          }, {timeout: 1000})
        }
      }

      images.forEach((img) => uploadTexture(img.material.uniforms.uTexture.value))

      const update = () => {
        checkFPS()

        if (needsRender) {
          const scrollY = getScroll()

          const vw = window.innerWidth
          const vh = window.innerHeight
          if (vh !== screen.height || vw !== screen.width) {
            screen.width = vw
            screen.height = vh
            camera.fov = 2 * Math.atan(vh / 2 / DIST) * (180 / Math.PI)
            camera.aspect = vw / vh
            camera.updateProjectionMatrix()
            renderer.setSize(vw, vh)
            canvas!.style.width = vw + 'px'
            canvas!.style.height = vh + 'px'
          }

          texts.forEach((t) => {
            if (t.isVisible) {
              t.mesh.position.x =
                t.bounds.left - vw / 2 + t.bounds.width / 2
              t.mesh.position.y =
                -t.y + scrollY + vh / 2 - t.bounds.height / 2
            }
          })

          /* Track whether any image quad is on screen this frame so we
             can skip the barrel composer when only text (or nothing) is
             visible — e.g. scrolling through long copy, hero or footer. */
          let anyImageInView = false
          const VIEW_MARGIN = 200

          images.forEach((img) => {
            img.mesh.position.x =
              img.left - screen.width / 2 + img.width / 2

            const parallaxFactor = 1 + img.depth * 0.0004
            img.mesh.position.y =
              -img.top +
              scrollY * parallaxFactor +
              screen.height / 2 -
              img.height / 2

            img.mesh.position.z = img.depth

            if (img.depth < 0) {
              const shrink = 1 - DIST / (DIST - img.depth)
              img.mesh.position.y += img.height * shrink * 8.0
            }

            const depthScale = DIST / (DIST - img.depth)
            img.mesh.scale.set(
              img.width * depthScale,
              img.height * depthScale,
              1,
            )

            if (
              img.top < scrollY + screen.height + VIEW_MARGIN &&
              img.top + img.height > scrollY - VIEW_MARGIN
            ) {
              anyImageInView = true
            }
          })

          if (composer && anyImageInView) {
            composer.render()
          } else {
            renderer.render(scene, camera)
          }
          needsRender = false
        }
        animationId = requestAnimationFrame(update)
      }

      update()

      let resizeTimeout: ReturnType<typeof setTimeout>
      resizeHandler = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          screen.width = window.innerWidth
          screen.height = window.innerHeight

          renderer.setSize(screen.width, screen.height)
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

          camera.fov =
            2 * Math.atan(screen.height / 2 / DIST) * (180 / Math.PI)
          camera.aspect = screen.width / screen.height
          camera.updateProjectionMatrix()

          texts.forEach((t) => {
            t.bounds = t.element.getBoundingClientRect()
            t.y = t.bounds.top + getScrollRaw()
            const paddedW = t.bounds.width * 1.24
            const paddedH = t.bounds.height * 1.5
            t.mesh.scale.set(paddedW, paddedH, 1)
            const mat = t.material.uniforms.uAspect.value as THREE.Vector2
            mat.set(paddedW / paddedH, 1.0)
          })

          images.forEach((img) => {
            const bounds = img.element.getBoundingClientRect()
            img.mesh.scale.set(bounds.width, bounds.height, 1)
            img.width = bounds.width
            img.height = bounds.height
            img.top = bounds.top + getScrollRaw()
            img.left = bounds.left
            img.material.uniforms.uQuadSize.value.set(
              bounds.width,
              bounds.height,
            )
          })

          if (composer) composer.setSize(screen.width, screen.height)
          needsRender = true
        }, 150)
      }

      window.addEventListener('resize', resizeHandler)

      /* ── Remeasure text + image entries against current DOM ──
         Layout can shift AFTER our initial measurements for two
         reasons:
           1. Pin spacers (e.g. the studio-card ScrollTrigger) are
              created in parallel and may land after our forEach loops.
           2. Images / textures loaded during `await Promise.all(...)`
              can reflow the document.
         Without this, text meshes below a late-added pin spacer sit
         at the wrong Y — the hero + projecten titles read fine but
         everything below the studio section only aligns once the
         user has scrolled past the pin (which is when GSAP's own
         recalc happens to run). */
      const PAD_X = 0.12
      const PAD_Y = 0.25
      const remeasurePositions = () => {
        texts.forEach((t) => {
          const b = t.element.getBoundingClientRect()
          t.bounds = b
          t.y = b.top + getScrollRaw()
          const pW = b.width * (1 + PAD_X * 2)
          const pH = b.height * (1 + PAD_Y * 2)
          t.mesh.scale.set(pW, pH, 1)
          ;(t.material.uniforms.uAspect.value as THREE.Vector2).set(pW / pH, 1.0)
        })
        images.forEach((img) => {
          const b = img.element.getBoundingClientRect()
          img.mesh.scale.set(b.width, b.height, 1)
          img.width = b.width
          img.height = b.height
          img.top = b.top + getScrollRaw()
          img.left = b.left
          img.material.uniforms.uQuadSize.value.set(b.width, b.height)
        })
        needsRender = true
      }

      /* Sync once at the end of init so the first paint is correct. */
      remeasurePositions()

      /* Subscribe to ScrollTrigger refreshes — GSAP fires these on
         window.load, resize, and on the explicit refresh() calls
         from the page-transition. We piggyback without triggering
         our own refresh (which would snap the studio-card pin). */
      refreshHandler = remeasurePositions
      scrollTriggerRef = ScrollTrigger
      ScrollTrigger.addEventListener('refresh', refreshHandler)

      /* ── Catch every layout shift after init ──
         ScrollTrigger.refresh alone isn't enough: lazy-loaded images,
         late font swaps, and pin spacers added by other effects all
         change document height WITHOUT firing a refresh until the
         user scrolls far enough to tickle GSAP. That's the "only
         works after passing studio section" bug — the refresh that
         eventually corrects everything only happens once natural
         layout churn settles down.
         A ResizeObserver on <body> catches every height change,
         debounced so rapid successive shifts collapse into one
         remeasure. */
      const scheduleRemeasure = () => {
        if (remeasureDebounce) clearTimeout(remeasureDebounce)
        remeasureDebounce = setTimeout(() => {
          if (cancelled) return
          remeasurePositions()
        }, 80)
      }
      docResizeObserver = new ResizeObserver(scheduleRemeasure)
      docResizeObserver.observe(document.body)

      /* Belt + braces: fixed remeasure beats for the first few
         seconds after mount — covers anything the ResizeObserver
         misses (e.g. children re-positioning without body-height
         change, or late WebGL canvases from sibling effects). */
      remeasureTimeouts.push(
        setTimeout(() => { if (!cancelled) remeasurePositions() }, 300),
        setTimeout(() => { if (!cancelled) remeasurePositions() }, 900),
        setTimeout(() => { if (!cancelled) remeasurePositions() }, 2000),
      )
    }

    init()

    return () => {
      cancelled = true
      if (animationId) cancelAnimationFrame(animationId)
      if (resizeHandler) window.removeEventListener('resize', resizeHandler)
      if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler)
        /* Lenis has its own listener registry — plain removeEventListener
           doesn't detach us. Without this, every navigation leaves a dead
           scrollHandler attached to Lenis. */
        if (lenisRef) lenisRef.off('scroll', scrollHandler)
      }
      if (refreshHandler && scrollTriggerRef) {
        scrollTriggerRef.removeEventListener('refresh', refreshHandler)
      }
      if (docResizeObserver) docResizeObserver.disconnect()
      if (remeasureDebounce) clearTimeout(remeasureDebounce)
      remeasureTimeouts.forEach((t) => clearTimeout(t))
      /* Remove the webgl-text-replay / remeasured listeners we added so
         they don't fire against stale closures after navigation. */
      domListeners.forEach(({el, type, fn}) => {
        el.removeEventListener(type, fn)
      })
      /* Kill every tween + ScrollTrigger this hook instance created so
         nothing stale survives the page change. */
      tweens.forEach((t) => {
        try { t.scrollTrigger?.kill() } catch {}
        try { t.kill() } catch {}
      })
      triggers.forEach((trg) => {
        try { trg.kill() } catch {}
      })
      if (canvas) canvas.remove()
      document.body.classList.remove('webgl-active')
      restoreElements.forEach(({el, prop, val}) => {
        if (prop === '__remove') {
          el.remove()
        } else {
          el.style.setProperty(prop, val)
        }
      })
      /* Release GPU memory + the WebGL contexts themselves. Without
         this step each client-side nav leaks a full renderer: after
         ~15 navs Chrome hits its context cap and force-loses the
         oldest (e.g. the header/footer Logo3D contexts in the root
         layout — those then render blank or throw "Context Lost").
         NOTE: renderer.dispose() alone does NOT release the WebGL
         context — it just frees the resources the renderer allocated.
         The context survives until GC reclaims the renderer instance,
         which under rapid navigation never catches up. forceContextLoss()
         explicitly drops the context back to the browser's pool so the
         next page's renderer can reuse it. */
      if (composerRef) {
        composerRef.passes?.forEach((pass) => {
          try { pass.dispose?.() } catch {}
        })
        try { composerRef.dispose?.() } catch {}
      }
      disposables.forEach((d) => {
        try { d.dispose?.() } catch {}
        /* forceContextLoss is only on WebGLRenderer — guard with
           duck-type check so we don't crash on materials / textures. */
        try {
          const maybeRenderer = d as {forceContextLoss?: () => void}
          maybeRenderer.forceContextLoss?.()
        } catch {}
      })
      /* Flip the flag AFTER draining so any in-flight init that
         resumes past this point disposes on push instead of leaking. */
      cleanupDone = true
    }
  }, [])
}

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

      ctx = gsap.context(() => {
        document
          .querySelectorAll<HTMLElement>('[data-parallax="trigger"]')
          .forEach((trigger) => {
            /* Opt-out: keep [data-parallax="trigger"] on the wrapper so the
               WebGL mask still uses it for bounds, but skip the scroll
               animation. Used on smaller in-flow images where the parallax
               drift looks busy next to text. */
            if (trigger.hasAttribute('data-parallax-disabled')) return

            const target =
              trigger.querySelector<HTMLElement>('[data-parallax="target"]') ||
              trigger

            const direction =
              trigger.getAttribute('data-parallax-direction') || 'vertical'
            const prop = direction === 'horizontal' ? 'xPercent' : 'yPercent'

            const scrubAttr = trigger.getAttribute('data-parallax-scrub')
            const scrub = scrubAttr ? parseFloat(scrubAttr) : true

            const startAttr = trigger.getAttribute('data-parallax-start')
            const startVal = startAttr !== null ? parseFloat(startAttr) : 3

            const endAttr = trigger.getAttribute('data-parallax-end')
            const endVal = endAttr !== null ? parseFloat(endAttr) : -3

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
          })
      })
    })()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
    }
  }, [])
}
