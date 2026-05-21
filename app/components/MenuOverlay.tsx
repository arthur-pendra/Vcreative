'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import styles from '@/app/components/MenuOverlay.module.css'

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Projecten', href: '/cases' },
  { label: 'Over', href: '/over-mij' },
  { label: 'Start project', href: '/contact' },
] as const

/* Same oil-spill noise-mask as the site's text reveals. Scaled coarser
   (uv * aspect * 3.0) so the blobs read as large spreading blobs across
   the full viewport instead of tight per-letter noise. */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uReveal;
  uniform float uTime;
  uniform vec3 uTextColor;
  uniform vec2 uAspect;
  uniform vec2 uMouse;
  uniform sampler2D uNoiseTex;
  uniform sampler2D uTextTex;
  uniform sampler2D uLogoTex;
  uniform sampler2D uBgMatcap;
  varying vec2 vUv;

  void main() {
    /* p = aspect-corrected vector from top-left corner. The corner
       sits at the origin and aspect is baked in, so the radial field
       reads as circular in screen space rather than stretched. */
    vec2 p = vec2(vUv.x, 1.0 - vUv.y) * vec2(uAspect.x, 1.0);
    float dist = length(p);

    /* reach = how far the ink has spread from the corner.
       Rest sits at -0.15 — just below the visibility threshold with
       a small safety margin for peak noise — so the tendrils don't
       have to travel a long invisible distance before they appear.
         uReveal = 1    -> reach = -0.15  (mask fully zero)
         uReveal = 0.9  -> reach ~ 0.12   (small corner blob)
         uReveal = 0    -> reach = 2.5    (covers the diagonal) */
    float reach = mix(-0.15, 2.5, 1.0 - uReveal);

    /* Early reject: pixels well outside the max possible reach skip
       the expensive noise chain entirely. Keeps the rAF loop cheap. */
    if (dist > reach + 0.85) discard;

    /* Slow time drift for organic self-animation. Tiny amplitude so
       the blob feels alive without anyone noticing it moves. */
    vec2 tDrift = vec2(sin(uTime * 0.18), cos(uTime * 0.14)) * 0.22;

    /* ── Domain-warped FBM ──
       Two warping passes + four octaves. Warping breaks the tile
       grid into curved, eddying flows (the trick fluid sims use).
       Time drift is mixed into the warps so the whole field slowly
       churns instead of any one octave visibly panning. */
    vec2 q = p * 1.0 + tDrift * 0.5;
    vec2 w1 = vec2(
      texture2D(uNoiseTex, q).r,
      texture2D(uNoiseTex, q + vec2(5.2, 1.3)).r
    ) - 0.5;

    vec2 r = p * 1.8 + w1 * 0.8 + tDrift;
    vec2 w2 = vec2(
      texture2D(uNoiseTex, r + vec2(1.7, 9.2)).r,
      texture2D(uNoiseTex, r + vec2(8.3, 2.8)).r
    ) - 0.5;

    /* Four octaves — extra high-frequency layer adds fine wispy
       grain at the tendril tips so it no longer reads as noise. */
    float n1 = texture2D(uNoiseTex, p * 1.5 + w2 * 0.7).r;
    float n2 = texture2D(uNoiseTex, p * 3.5 + w1 * 0.4 + tDrift * 0.5).r;
    float n3 = texture2D(uNoiseTex, p * 8.0 + w2 * 0.2).r;
    float n4 = texture2D(uNoiseTex, p * 18.0 + tDrift).r;
    float noise = n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1;

    /* Noise amplitude grows strongly with reach. Small blob stays
       tight; big blob gets long, reaching tendrils. Clamped so the
       hover state can't shoot fingers across the viewport. */
    float noiseAmp = clamp(0.1 + reach * 0.45, 0.12, 1.1);

    float distorted = dist - (noise - 0.5) * noiseAmp;

    /* Narrow feather for a crisp liquid edge. */
    float mask = smoothstep(reach + 0.05, reach - 0.05, distorted);
    if (mask < 0.01) discard;

    /* ── Matcap background ──
       Sample the SAME dark matcap the logo uses as the menu's
       background. Heavy gaussian-ish blur via LOD bias + a 9-tap
       cross+diagonal kernel so it reads as a painterly light-field,
       not a recognisable matcap image. uMouse (normalised -1..1,
       smoothed in JS) shifts the sampled centre so the whole light
       field parallaxes gently with the cursor — very subtle, just
       enough to feel like a physical volume behind the glass. */
    vec2 mouseShift = uMouse * 0.022;
    vec2 bgUv =
        (vUv - 0.5 - mouseShift)
      / vec2(min(uAspect.x / uAspect.y, 1.0) * 1.35, 1.35)
      + 0.5;

    float bgLod = 7.5;
    float o = 0.035;
    float d = o * 0.707;
    vec3 colorMix =
        texture2D(uBgMatcap, bgUv,                       bgLod).rgb * 0.22
      + texture2D(uBgMatcap, bgUv + vec2( o, 0.0),       bgLod).rgb * 0.13
      + texture2D(uBgMatcap, bgUv + vec2(-o, 0.0),       bgLod).rgb * 0.13
      + texture2D(uBgMatcap, bgUv + vec2(0.0,  o),       bgLod).rgb * 0.13
      + texture2D(uBgMatcap, bgUv + vec2(0.0, -o),       bgLod).rgb * 0.13
      + texture2D(uBgMatcap, bgUv + vec2( d,  d),        bgLod).rgb * 0.065
      + texture2D(uBgMatcap, bgUv + vec2(-d,  d),        bgLod).rgb * 0.065
      + texture2D(uBgMatcap, bgUv + vec2( d, -d),        bgLod).rgb * 0.065
      + texture2D(uBgMatcap, bgUv + vec2(-d, -d),        bgLod).rgb * 0.065;

    /* Rim highlight: soft brightening at the oil-spill's feathered
       edge so the boundary still pops against the matcap gradient. */
    float rim = 1.0 - smoothstep(0.25, 0.9, mask);
    colorMix += vec3(0.1, 0.11, 0.13) * rim;

    /* ── Background logo ──
       Low-res RT already gives the blur; shader does a tight 5-tap
       smooth to mask any remaining aliasing. Nothing fancy. */
    float ls = 0.0025;
    vec4 logoSample =
        texture2D(uLogoTex, vUv)                        * 0.44
      + texture2D(uLogoTex, vUv + vec2( ls, 0.0))       * 0.14
      + texture2D(uLogoTex, vUv + vec2(-ls, 0.0))       * 0.14
      + texture2D(uLogoTex, vUv + vec2(0.0,  ls))       * 0.14
      + texture2D(uLogoTex, vUv + vec2(0.0, -ls))       * 0.14;

    /* ── Clean bloom + subtle anamorphic lens flare ──
       One 5-tap box around each pixel for a soft round bloom,
       plus a wider horizontal sample for the anamorphic streak
       (the classic blue lens-flare stretch across the brights).
       Both go through the same high-pass threshold so only the
       matcap's brightest hotspots contribute — keeps the effect
       clean and quiet. */
    float br = 0.018;
    vec3 bloomBox =
      ( texture2D(uLogoTex, vUv + vec2( br, 0.0)).rgb
      + texture2D(uLogoTex, vUv + vec2(-br, 0.0)).rgb
      + texture2D(uLogoTex, vUv + vec2(0.0,  br)).rgb
      + texture2D(uLogoTex, vUv + vec2(0.0, -br)).rgb
      + texture2D(uLogoTex, vUv).rgb
      ) * 0.2;
    vec3 bloom = max(bloomBox - vec3(0.3), 0.0) * 1.2;

    float fr = 0.09;
    vec3 flareStrip =
      ( texture2D(uLogoTex, vUv + vec2( fr,       0.0)).rgb
      + texture2D(uLogoTex, vUv + vec2(-fr,       0.0)).rgb
      + texture2D(uLogoTex, vUv + vec2( fr * 0.5, 0.0)).rgb
      + texture2D(uLogoTex, vUv + vec2(-fr * 0.5, 0.0)).rgb
      ) * 0.25;
    /* Higher threshold so only the very brightest pixels spawn a
       flare, keeping it a rare accent rather than a constant
       horizontal wash. */
    vec3 flare = max(flareStrip - vec3(0.45), 0.0);
    flare *= vec3(0.85, 0.95, 1.15);

    vec3 withLogo = mix(colorMix, logoSample.rgb, logoSample.a);
    withLogo += bloom * 0.35;
    withLogo += flare * 0.18;

    /* ── Text ── crisp typography, no glow or halo. The bloom
       and flare layers only affect the logo world; text composites
       on top at pure cream so it stays neutral reading surface. */
    float textAlpha = texture2D(uTextTex, vUv).a;
    vec3 finalColor = mix(withLogo, uTextColor, textAlpha);

    gl_FragColor = vec4(finalColor, mask);
  }
`

type Props = {
  open: boolean
  hover?: boolean
  onClose: () => void
}

const MenuOverlay = ({ open, hover = false, onClose }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  /* Refs into the WebGL pipeline we create async — the open/close
     effect needs to be able to tween the material's uReveal uniform
     and re-render the scene without re-creating it. */
  const materialRef = useRef<{ uniforms: { uReveal: { value: number } } } | null>(null)
  const renderRef = useRef<(() => void) | null>(null)
  const firstItemRef = useRef<HTMLAnchorElement | null>(null)
  /* Tracks whether the previous state was fully open, so the close
     tween can be slow (open → close) without also slowing down the
     quick retreat that happens when the hover teaser is abandoned. */
  const wasOpenRef = useRef(false)
  const router = useRouter()

  const handleNav = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (e.button !== 0) return
    /* preventDefault so Next Link's own navigation doesn't fire. We
       drive router.push ourselves so the ink stays covering while the
       new page mounts, then trigger the close with a small delay. */
    e.preventDefault()
    if (href === window.location.pathname) {
      onClose()
      return
    }
    router.push(href)
    /* Hold the ink at full cover briefly so the incoming page has
       time to mount + PageTransition's scroll/trigger reset runs
       before the dissolve starts. */
    window.setTimeout(() => onClose(), 180)
  }

  /* ── Three.js setup (once on mount) ── */
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    const init = async () => {
      const THREE = await import('three')
      if (cancelled) return

      const width = window.innerWidth
      const height = window.innerHeight

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height, false)
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace

      const canvas = renderer.domElement
      canvas.className = styles.canvas
      container.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
      camera.position.z = 1

      /* Load the pre-baked noise texture (same family Immersive-G uses
         for their oil-spill reveals). Repeat wrapping so we can tile it
         freely in the shader. */
      const texLoader = new THREE.TextureLoader()
      const noiseTex = await texLoader.loadAsync('/noises/mask-noise.png')
      if (cancelled) {
        noiseTex.dispose()
        renderer.dispose()
        return
      }
      noiseTex.wrapS = THREE.RepeatWrapping
      noiseTex.wrapT = THREE.RepeatWrapping
      noiseTex.minFilter = THREE.LinearFilter
      noiseTex.magFilter = THREE.LinearFilter

      /* ── Text canvas + texture ──
         We paint the menu text into a 2D offscreen canvas at viewport
         resolution, then upload it as a texture the ink shader samples.
         Positions come from the real HTML elements (which stay in the
         DOM as invisible click targets), so layout matches exactly
         without us having to reimplement flexbox in canvas code. */
      const textCanvas = document.createElement('canvas')
      const textCtx = textCanvas.getContext('2d')
      if (!textCtx) {
        noiseTex.dispose()
        renderer.dispose()
        return
      }
      const textTex = new THREE.CanvasTexture(textCanvas)
      textTex.minFilter = THREE.LinearFilter
      textTex.magFilter = THREE.LinearFilter
      textTex.generateMipmaps = false

      const paintText = () => {
        const dpr = Math.min(window.devicePixelRatio, 2)
        const w = window.innerWidth
        const h = window.innerHeight
        if (textCanvas.width !== w * dpr || textCanvas.height !== h * dpr) {
          textCanvas.width = w * dpr
          textCanvas.height = h * dpr
        }
        textCtx.setTransform(1, 0, 0, 1, 0, 0)
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height)
        textCtx.scale(dpr, dpr)

        textCtx.textAlign = 'center'
        textCtx.textBaseline = 'middle'
        textCtx.fillStyle = '#ffffff'

        /* Walk every live text element inside the overlay and paint
           it with its computed font. getComputedStyle resolves the em
           values the CSS uses back into concrete pixels, so the
           canvas glyphs line up with the DOM layout at every
           breakpoint. */
        const nodes = container.querySelectorAll<HTMLElement>(
          '[data-menu-text]',
        )
        nodes.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const style = getComputedStyle(el)
          const size = style.fontSize
          const weight = style.fontWeight
          const fStyle = style.fontStyle
          const family = style.fontFamily
          textCtx.font = `${fStyle} ${weight} ${size} ${family}`
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const text = el.textContent ?? ''
          if (text.toUpperCase() === text) {
            /* Uppercase labels (the "Neem contact op" link) use
               letter-spacing in CSS — canvas fillText doesn't honour
               that, so spread letters manually via `letterSpacing`
               when supported, or fall back to plain fillText. */
            ;(textCtx as CanvasRenderingContext2D & {letterSpacing?: string})
              .letterSpacing = style.letterSpacing
          } else {
            ;(textCtx as CanvasRenderingContext2D & {letterSpacing?: string})
              .letterSpacing = '0px'
          }
          textCtx.fillText(text, cx, cy)
        })

        textTex.needsUpdate = true
      }

      /* ── Background logo: GLTF + pearl shader into a render target ──
         We load the same VIENNA_LOGO.glb the header/footer use, build
         a pearl-style matcap material (dark matcap variant so it reads
         as a tinted mass on the navy ink rather than competing with
         the text), and render it into a WebGLRenderTarget every frame.
         The ink shader samples that render target as uLogoTex, so the
         oil-spill mask literally clips the rotating model. No CSS
         opacity, no separate DOM layer. */
      const {GLTFLoader} = await import(
        'three/examples/jsm/loaders/GLTFLoader.js'
      )
      const {DRACOLoader} = await import(
        'three/examples/jsm/loaders/DRACOLoader.js'
      )

      const [logoMatcap, logoIri] = await Promise.all([
        texLoader.loadAsync('/icons/3D/project-model-matcap.png'),
        texLoader.loadAsync('/icons/3D/iri-32.png'),
      ])
      if (cancelled) {
        noiseTex.dispose()
        logoMatcap.dispose()
        logoIri.dispose()
        renderer.dispose()
        return
      }
      logoMatcap.colorSpace = THREE.SRGBColorSpace
      logoMatcap.minFilter = THREE.LinearMipmapLinearFilter
      logoMatcap.magFilter = THREE.LinearFilter
      logoMatcap.generateMipmaps = true
      logoIri.colorSpace = THREE.SRGBColorSpace
      logoIri.minFilter = THREE.LinearFilter
      logoIri.magFilter = THREE.LinearFilter

      /* Neutral pearl — same shader as header/footer, no tint or
         scanline overrides. The dark matcap already carries all the
         colour information (near-black body with pale iridescent
         highlights), so anything we'd layer on top would fight it.
         We just keep the rim/fresnel contribution gentle so the
         model stays an ambient background element. */
      const pearlMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMatcap: {value: logoMatcap},
          uIridescence: {value: logoIri},
          uTint: {value: new THREE.Color(1.0, 1.0, 1.0)},
          uIriStrength: {value: 1.0},
          uRimBoost: {value: 0.8},
          uSpecBoost: {value: 1.2},
          uBaseLift: {value: 0.02},
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vViewPosition = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMatcap;
          uniform sampler2D uIridescence;
          uniform vec3 uTint;
          uniform float uIriStrength;
          uniform float uRimBoost;
          uniform float uSpecBoost;
          uniform float uBaseLift;
          varying vec3 vNormal;
          varying vec3 vViewPosition;

          float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

          void main() {
            vec3 viewDir = normalize(vViewPosition);
            vec3 n = normalize(vNormal);
            if (!gl_FrontFacing) n = -n;
            vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
            vec3 y = cross(viewDir, x);
            vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
            vec3 mat = texture2D(uMatcap, uv).rgb;
            float fres = 1.0 - clamp(dot(viewDir, n), 0.0, 1.0);
            vec3 iriA = texture2D(uIridescence, vec2(fres * 0.85 + 0.05, 0.5)).rgb;
            vec3 iriB = texture2D(uIridescence, vec2(fres * 0.55 + 0.40, 0.5)).rgb;
            vec3 iri = mix(iriA, iriB, 0.5);
            vec3 base = mat * uTint + uBaseLift;
            float sheenWeight = mix(0.35, 1.0, smoothstep(0.0, 1.0, fres));
            vec3 sheen = iri * sheenWeight * uIriStrength;
            vec3 col = base + sheen - base * sheen;
            float spec = smoothstep(0.55, 1.0, luma(mat));
            col += iri * spec * uSpecBoost;
            col += iri * pow(fres, 5.0) * uRimBoost;

            /* Rim-only: the centre is fully invisible, only the
               fresnel-edge has any alpha at all. Reads as light
               catching a glass surface more than as a model. */
            float alpha = pow(fres, 1.4) * 0.18;
            gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
          }
        `,
      })

      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/')
      const gltfLoader = new GLTFLoader()
      gltfLoader.setDRACOLoader(draco)
      const gltf = await gltfLoader.loadAsync('/icons/3D/VIENNA_LOGO.glb')
      if (cancelled) {
        noiseTex.dispose()
        logoMatcap.dispose()
        logoIri.dispose()
        pearlMaterial.dispose()
        draco.dispose()
        renderer.dispose()
        return
      }

      const logoScene = new THREE.Scene()
      const logoModel = gltf.scene
      const logoMeshes: THREE.Mesh[] = []
      logoModel.traverse((child) => {
        const m = child as THREE.Mesh
        if (m.isMesh) {
          m.material = pearlMaterial
          logoMeshes.push(m)
        }
      })

      /* Fit model to ~90% of the frustum height op desktop; iets
         compacter (0.8) op mobile zodat de logo niet de hele
         viewport vult naast de menu-tekst. */
      const box = new THREE.Box3().setFromObject(logoModel)
      const modelSize = new THREE.Vector3()
      const modelCenter = new THREE.Vector3()
      box.getSize(modelSize)
      box.getCenter(modelCenter)
      logoModel.position.sub(modelCenter)
      const targetHeight = width < 768 ? 0.8 : 0.9
      const fit = targetHeight / Math.max(modelSize.x, modelSize.y, 0.0001)
      logoModel.scale.setScalar(fit)
      logoScene.add(logoModel)

      const logoAspect = width / height
      const logoFrustum = 1
      const logoCamera = new THREE.OrthographicCamera(
        (-logoFrustum * logoAspect) / 2,
        (logoFrustum * logoAspect) / 2,
        logoFrustum / 2,
        -logoFrustum / 2,
        0.1,
        10,
      )
      logoCamera.position.set(0, 0, 3)
      logoCamera.lookAt(0, 0, 0)

      const dpr = Math.min(window.devicePixelRatio, 2)
      /* Logo RT scale. The shader blur kernel is now tight enough
         (5-tap @ 0.0025 offset) that a near-full resolution RT
         won't produce the ghost-streaks we saw before — the edges
         stay crisp at the source and the small shader smooth just
         masks any aliasing from the downsampled matcap sheen. */
      const LOGO_RT_SCALE = 1.0
      const logoRT = new THREE.WebGLRenderTarget(
        Math.max(Math.floor(width * dpr * LOGO_RT_SCALE), 1),
        Math.max(Math.floor(height * dpr * LOGO_RT_SCALE), 1),
      )
      logoRT.texture.minFilter = THREE.LinearFilter
      logoRT.texture.magFilter = THREE.LinearFilter
      logoRT.texture.generateMipmaps = false

      const material = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader,
        fragmentShader,
        uniforms: {
          /* In this shader uReveal=1 means "mask fully dissolved /
             screen clear", uReveal=0 means "mask fully covering /
             screen fully ink" — same semantics as the site's text
             reveals. At rest the menu is closed, so we start dissolved. */
          uReveal: { value: 1 },
          /* Elapsed seconds — drives the slow domain-warp drift that
             keeps the ink feeling alive even between tweens. */
          uTime: { value: 0 },
          /* Cream (#faf8f2) — baked-in text colour. Composited over
             the ink inside the fragment shader; never leaks outside
             the mask. */
          uTextColor: {
            value: new THREE.Vector3(0xfa / 255, 0xf8 / 255, 0xf2 / 255),
          },
          uAspect: { value: new THREE.Vector2(width / height, 1) },
          /* Cursor position, normalised -1..1, smoothed in the rAF
             loop. Drives the background parallax. */
          uMouse: { value: new THREE.Vector2(0, 0) },
          uNoiseTex: { value: noiseTex },
          uTextTex: { value: textTex },
          uLogoTex: { value: logoRT.texture },
          /* Shared with the hologram logo material — the ink shader
             uses it as its ambient background so both layers live in
             the same lighting world. */
          uBgMatcap: { value: logoMatcap },
        },
      })

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
      scene.add(mesh)

      const render = () => renderer.render(scene, camera)

      /* Paint text once fonts are ready so glyphs match the CSS
         typography. Without awaiting fonts the first paint would fall
         back to system fonts and a second paint after swap would
         cause a subtle glyph pop. */
      await document.fonts.ready
      if (cancelled) {
        noiseTex.dispose()
        textTex.dispose()
        renderer.dispose()
        return
      }
      paintText()
      render()

      materialRef.current = material as unknown as {
        uniforms: { uReveal: { value: number } }
      }
      renderRef.current = render

      /* Continuous rAF loop:
           - Always advance the logo rotation + re-render the logo
             into its render target so the motion stays smooth even
             when the ink is mostly dissolved (tiny hover reveal).
           - Only render the main scene to the screen when the ink
             mask has anything visible, to keep the GPU idle when
             the menu is closed. */
      const startT = performance.now()
      let logoRotY = 0
      let logoRotX = 0

      /* Mouse parallax target + smoothed value. The listener writes
         raw normalised coords; the rAF loop lerps toward them with a
         low-pass filter so sharp pointer moves turn into a gentle
         drift rather than a snap. */
      const mouseTarget = {x: 0, y: 0}
      const mouseSmooth = {x: 0, y: 0}
      const onMouseMove = (e: MouseEvent) => {
        mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseTarget.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener('mousemove', onMouseMove, {passive: true})

      renderer.setAnimationLoop(() => {
        const now = performance.now()
        const t = (now - startT) * 0.001
        material.uniforms.uTime.value = t

        mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.03
        mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.03
        ;(material.uniforms.uMouse.value as THREE.Vector2).set(
          mouseSmooth.x,
          mouseSmooth.y,
        )

        /* Logo tilts toward the cursor instead of tumbling. Upright
           at rest (rotation 0); amplitude chosen so the tilt reads
           clearly through the background blur — otherwise the
           rotation disappears into the out-of-focus softness. */
        const targetRotY = mouseSmooth.x * 0.55
        const targetRotX = mouseSmooth.y * 0.4
        logoRotY += (targetRotY - logoRotY) * 0.1
        logoRotX += (targetRotX - logoRotX) * 0.1
        logoModel.rotation.y = logoRotY
        logoModel.rotation.x = logoRotX

        renderer.setRenderTarget(logoRT)
        renderer.setClearColor(0x000000, 0)
        renderer.clear()
        renderer.render(logoScene, logoCamera)
        renderer.setRenderTarget(null)

        if ((material.uniforms.uReveal.value as number) < 0.999) {
          renderer.render(scene, camera)
        }
      })

      const onResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        const newDpr = Math.min(window.devicePixelRatio, 2)
        renderer.setSize(w, h, false)
        ;(material.uniforms.uAspect.value as THREE.Vector2).set(w / h, 1)
        /* Keep the logo camera + RT aligned with the viewport so the
           model stays centred and crisp across breakpoints. */
        const a = w / h
        logoCamera.left = (-logoFrustum * a) / 2
        logoCamera.right = (logoFrustum * a) / 2
        logoCamera.updateProjectionMatrix()
        logoRT.setSize(
          Math.max(Math.floor(w * newDpr * LOGO_RT_SCALE), 1),
          Math.max(Math.floor(h * newDpr * LOGO_RT_SCALE), 1),
        )
        paintText()
        render()
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
        renderer.setAnimationLoop(null)
        material.dispose()
        mesh.geometry.dispose()
        noiseTex.dispose()
        textTex.dispose()
        pearlMaterial.dispose()
        logoMatcap.dispose()
        logoIri.dispose()
        logoMeshes.forEach((m) => m.geometry?.dispose())
        logoRT.dispose()
        draco.dispose()
        renderer.dispose()
        try { renderer.forceContextLoss() } catch {}
        if (canvas.parentNode === container) container.removeChild(canvas)
        materialRef.current = null
        renderRef.current = null
      }
    }

    init()

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  /* ── Tween uReveal when `open` flips ── */
  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const gsap = (await import('gsap')).default
      if (cancelled) return

      const material = materialRef.current
      const render = renderRef.current
      if (!material || !render) return

      gsap.killTweensOf(material.uniforms.uReveal)

      /* Three resting states for the mask:
           1    = fully dissolved (screen clear — menu is closed)
           0.9  = small ink blob in the top-left corner (hover teaser)
           0    = fully covered (menu open)
         Durations match the visual weight of each transition. */
      if (open) {
        /* power2.out so the ink keeps spreading the moment the click
           lands — picks up where the hover teaser settled instead of
           re-easing-in from rest, which used to read as a tiny pause
           between hover and open. Decelerates into full cover. */
        gsap.to(material.uniforms.uReveal, {
          value: 0,
          duration: 2.6,
          ease: 'power2.out',
          onUpdate: render,
        })
      } else if (hover) {
        gsap.to(material.uniforms.uReveal, {
          /* Tiny corner teaser — only a sliver of ink tendrils in the
             very top-left corner. Lower = more spread, higher = smaller
             / tighter to the corner. */
          value: 0.9,
          /* power2.out + short duration so the trails appear quickly
             as the cursor enters the hover zone instead of creeping
             up over a long invisible run. */
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: render,
        })
      } else {
        /* Close/retreat. Two flavours:
             - open → closed: slow dissolve (~open tempo) so the reveal
               of the new page feels deliberate, not snapped away.
             - hover teaser → rest: keep it snappy so the corner ink
               retreats fast when the cursor leaves the button. */
        const closingFromOpen = wasOpenRef.current
        gsap.to(material.uniforms.uReveal, {
          value: 1,
          duration: closingFromOpen ? 2.4 : 0.7,
          ease: closingFromOpen ? 'power2.inOut' : 'power2.inOut',
          onUpdate: render,
        })
      }
      wasOpenRef.current = open
    }

    run()

    return () => {
      cancelled = true
    }
  }, [open, hover])

  /* ── Pause page scroll while the menu is open ── */
  useEffect(() => {
    if (!open) return
    type LenisLike = { stop?: () => void; start?: () => void }
    let lenis: LenisLike | null = null
    let active = true

    ;(async () => {
      const { getLenisInstance } = await import('@/app/lib/lenis')
      if (!active) return
      lenis = getLenisInstance() as LenisLike | null
      lenis?.stop?.()
    })()

    document.body.style.overflow = 'hidden'

    return () => {
      active = false
      document.body.style.overflow = ''
      lenis?.start?.()
    }
  }, [open])

  /* ── ESC to close + focus first item on open ── */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    /* small delay so the focus ring lands after the oil-spill has
       mostly covered the viewport, matching the item fade-in. */
    const t = setTimeout(() => firstItemRef.current?.focus(), 1300)
    return () => {
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, onClose])

  return (
    /* `inert` instead of `aria-hidden` so Chrome doesn't warn when the
       close tween leaves a focused menu anchor inside the (now-hidden)
       root for a beat. `inert` simultaneously hides from assistive
       tech AND removes everything inside from the focus order, which
       is what we actually want. */
    <div
      ref={containerRef}
      className={styles.root}
      data-open={open}
      inert={!open}
    >
      <nav id="main-menu" className={styles.menu} aria-label="Hoofdnavigatie">
        <ul className={styles.list}>
          {ITEMS.map((item, i) => (
            <li key={item.href} className={styles.itemWrap}>
              <Link
                href={item.href}
                className={styles.item}
                onClick={(e) => handleNav(e, item.href)}
                data-menu-link="true"
                data-menu-text=""
                ref={i === 0 ? firstItemRef : undefined}
                tabIndex={open ? 0 : -1}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export default MenuOverlay
