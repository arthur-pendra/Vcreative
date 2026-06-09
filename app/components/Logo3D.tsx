'use client'

import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import styles from '@/app/components/Header.module.css'

type Props = {
  interaction?: 'idle' | 'mouseTilt' | 'auto'
  className?: string
  /* Override the default matcap (pearl tint) — used by the menu
     background logo to render the model in a darker tone against
     the navy ink. */
  matcap?: string
  /* mouseTilt only: trigger a 360° spin on pointer enter. Footer
     opts out so the logo only follows the cursor subtly. */
  hoverSpin?: boolean
  /* Play one eased 360° spin as soon as the model is ready (used by the
     intro loader), regardless of interaction mode. */
  spinOnMount?: boolean
  /* Fired once when the spinOnMount turn finishes — lets the loader
     fade out exactly when the spin lands. */
  onSpinComplete?: () => void
}

const Logo3D = ({
  interaction = 'idle',
  className,
  matcap: matcapSrc = '/icons/3D/project-model-matcap.png',
  hoverSpin = true,
  spinOnMount = false,
  onSpinComplete,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  /* Held in a ref so the animate loop (created once in the effect) always
     calls the latest callback without re-running the effect. */
  const onSpinCompleteRef = useRef(onSpinComplete)
  onSpinCompleteRef.current = onSpinComplete

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanup: (() => void) | undefined

    const init = async () => {
      const THREE = await import('three')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js')

      if (cancelled) return

      const isTouch =
        'ontouchstart' in document.documentElement ||
        navigator.maxTouchPoints > 0
      // touch devices: dial back the supersample so battery / heat stays sane
      const SUPERSAMPLE = isTouch ? 1.25 : 2
      const dpr = Math.min(window.devicePixelRatio * SUPERSAMPLE, isTouch ? 3 : 4)
      const rect = container.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      const maxAniso = renderer.capabilities.getMaxAnisotropy()
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()

      const aspect = width / height
      const frustum = 1
      const camera = new THREE.OrthographicCamera(
        (-frustum * aspect) / 2,
        (frustum * aspect) / 2,
        frustum / 2,
        -frustum / 2,
        0.1,
        10,
      )
      camera.position.set(0, 0, 3)
      camera.lookAt(0, 0, 0)

      const texLoader = new THREE.TextureLoader()
      const [matcap, iridescence] = await Promise.all([
        texLoader.loadAsync(matcapSrc),
        texLoader.loadAsync('/icons/3D/iri-32.png'),
      ])
      matcap.colorSpace = THREE.SRGBColorSpace
      matcap.anisotropy = maxAniso
      matcap.minFilter = THREE.LinearMipmapLinearFilter
      matcap.magFilter = THREE.LinearFilter
      matcap.generateMipmaps = true
      iridescence.colorSpace = THREE.SRGBColorSpace
      iridescence.wrapS = THREE.ClampToEdgeWrapping
      iridescence.wrapT = THREE.ClampToEdgeWrapping
      iridescence.minFilter = THREE.LinearFilter
      iridescence.magFilter = THREE.LinearFilter

      if (cancelled) {
        renderer.dispose()
        return
      }

      const pearlMaterial = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          uMatcap: { value: matcap },
          uIridescence: { value: iridescence },
          uTint: { value: new THREE.Color(1.0, 0.94, 0.86) },
          uIriStrength: { value: 1.4 },
          uRimBoost: { value: 1.1 },
          uSpecBoost: { value: 1.6 },
          uBaseLift: { value: 0.04 },
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
            // flip normal for back-faces so lighting matches the visible side
            if (!gl_FrontFacing) n = -n;
            vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
            vec3 y = cross(viewDir, x);
            vec2 uv = vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
            vec3 mat = texture2D(uMatcap, uv).rgb;

            float fres = 1.0 - clamp(dot(viewDir, n), 0.0, 1.0);

            // two iridescence samples at different bands → richer pearl colour shift
            vec3 iriA = texture2D(uIridescence, vec2(fres * 0.85 + 0.05, 0.5)).rgb;
            vec3 iriB = texture2D(uIridescence, vec2(fres * 0.55 + 0.40, 0.5)).rgb;
            vec3 iri = mix(iriA, iriB, 0.5);

            // base: dark matcap × warm tint, with tiny lift for depth
            vec3 base = mat * uTint + uBaseLift;

            // pearl sheen across most of the surface, biased to rim
            float sheenWeight = mix(0.35, 1.0, smoothstep(0.0, 1.0, fres));
            vec3 sheen = iri * sheenWeight * uIriStrength;

            // screen blend so we add light instead of darkening
            vec3 col = base + sheen - base * sheen;

            // glossy specular: re-use the matcap's own brightness and tint it iridescent
            float spec = smoothstep(0.55, 1.0, luma(mat));
            col += iri * spec * uSpecBoost;

            // sharp rim flash for that wet-pearl gloss
            col += iri * pow(fres, 5.0) * uRimBoost;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })

      const draco = new DRACOLoader()
      draco.setDecoderPath('/draco/')
      const loader = new GLTFLoader()
      loader.setDRACOLoader(draco)
      const gltf = await loader.loadAsync('/icons/3D/VIENNA_LOGO.glb')

      if (cancelled) {
        renderer.dispose()
        return
      }

      const model = gltf.scene
      const meshes: THREE.Mesh[] = []
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.material = pearlMaterial
          meshes.push(mesh)
        }
      })

      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      const center = new THREE.Vector3()
      box.getSize(size)
      box.getCenter(center)
      model.position.sub(center)

      const targetHeight = 0.92
      const fit = targetHeight / Math.max(size.x, size.y, 0.0001)
      model.scale.setScalar(fit)

      scene.add(model)

      let targetRotY = 0
      let targetRotX = 0
      let raf = 0
      let detachInteraction: (() => void) | undefined

      /* Hover spin: a single 360° turn on Y, eased in/out, that lands
         back at the resting orientation. spinStart < 0 means idle;
         set to performance.now() to kick off a turn. The animate loop
         layers the spin on top of the tilt lerp so the cursor follow
         keeps working underneath. */
      let spinStart = -1
      let mountSpinPending = false
      const SPIN_DURATION_MS = 1400
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

      let continuousMode = false
      let tiltY = 0
      let tiltX = 0
      const SCALE_DIP = 0.04

      const ensureLoop = () => {
        if (!raf) raf = requestAnimationFrame(animate)
      }

      const animate = () => {
        raf = 0

        if (continuousMode) {
          const t = (performance.now() - continuousStart) / 1000
          continuousUpdate(t)
        }

        tiltY += (targetRotY - tiltY) * 0.12
        tiltX += (targetRotX - tiltX) * 0.12

        let spin = 0
        let scaleMul = 1
        if (spinStart >= 0) {
          const t = Math.min(
            (performance.now() - spinStart) / SPIN_DURATION_MS,
            1,
          )
          spin = easeInOutCubic(t) * Math.PI * 2
          scaleMul = 1 - Math.sin(t * Math.PI) * SCALE_DIP
          if (t >= 1) {
            spinStart = -1
            if (mountSpinPending) {
              mountSpinPending = false
              onSpinCompleteRef.current?.()
            }
          }
        }

        model.rotation.y = tiltY + spin
        model.rotation.x = tiltX
        model.scale.setScalar(fit * scaleMul)
        renderer.render(scene, camera)

        if (continuousMode || spinStart >= 0
          || Math.abs(targetRotY - tiltY) > 0.0005
          || Math.abs(targetRotX - tiltX) > 0.0005) {
          raf = requestAnimationFrame(animate)
        }
      }

      let continuousStart = performance.now()
      let continuousUpdate = (_t: number) => {}

      if (interaction === 'idle') {
        continuousMode = true
        continuousUpdate = (t: number) => {
          targetRotY = Math.sin(t * 0.35) * 0.025
          targetRotX = Math.sin(t * 0.25 + 1.0) * 0.015
        }
      } else if (interaction === 'auto') {
        continuousMode = true
        continuousUpdate = (t: number) => {
          targetRotY = t * 0.95 + Math.sin(t * 0.43) * 0.5
          targetRotX = t * 1.35 + Math.sin(t * 0.61 + 1.7) * 0.55
        }
      } else if (isTouch) {
        continuousMode = true
        continuousUpdate = (t: number) => {
          targetRotY = Math.sin(t * 0.5) * 0.18
          targetRotX = Math.sin(t * 0.35 + 1.2) * 0.08
        }
      } else {
        const tiltZone =
          (container.closest('footer') as HTMLElement | null) ?? null
        const TILT = tiltZone ? 0.22 : 0.08
        const onMove = (e: MouseEvent) => {
          let cx: number, cy: number, halfW: number, halfH: number
          if (tiltZone) {
            /* Footer: tilt is local to the footer box, which scrolls,
               so we still need its live rect — but the mousemove only
               fires while the cursor is actually over the footer. */
            const rect = tiltZone.getBoundingClientRect()
            halfW = rect.width / 2
            halfH = rect.height / 2
            cx = rect.left + halfW
            cy = rect.top + halfH
          } else {
            /* Header: measure against the viewport centre. No layout
               read per move (the old documentElement.getBoundingClientRect
               forced a reflow on every event AND drifted the tilt centre
               as the page scrolled). innerWidth/Height is a cached value. */
            halfW = window.innerWidth / 2
            halfH = window.innerHeight / 2
            cx = halfW
            cy = halfH
          }
          const nx = (e.clientX - cx) / halfW
          const ny = (e.clientY - cy) / halfH
          targetRotY = Math.max(Math.min(nx, 1), -1) * TILT
          targetRotX = Math.max(Math.min(ny, 1), -1) * TILT * 0.6
          ensureLoop()
        }
        const onLeave = () => {
          targetRotY = 0
          targetRotX = 0
          ensureLoop()
        }
        const zone = tiltZone ?? window
        zone.addEventListener('mousemove', onMove as EventListener, { passive: true })
        zone.addEventListener('mouseleave', onLeave as EventListener)

        const onHoverEnter = () => {
          if (spinStart < 0) {
            spinStart = performance.now()
            ensureLoop()
          }
        }
        if (hoverSpin) container.addEventListener('pointerenter', onHoverEnter)

        detachInteraction = () => {
          zone.removeEventListener('mousemove', onMove as EventListener)
          zone.removeEventListener('mouseleave', onLeave as EventListener)
          if (hoverSpin) container.removeEventListener('pointerenter', onHoverEnter)
        }
      }

      /* Intro loader: one 360° turn the moment the model is ready. */
      if (spinOnMount) {
        spinStart = performance.now()
        mountSpinPending = true
      }

      ensureLoop()

      const handleResize = () => {
        const r = container.getBoundingClientRect()
        const w = Math.max(r.width, 1)
        const h = Math.max(r.height, 1)
        const a = w / h
        camera.left = (-frustum * a) / 2
        camera.right = (frustum * a) / 2
        camera.updateProjectionMatrix()
        renderer.setSize(w, h, false)
      }
      window.addEventListener('resize', handleResize)

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', handleResize)
        detachInteraction?.()
        meshes.forEach((m) => m.geometry?.dispose())
        pearlMaterial.dispose()
        matcap.dispose()
        iridescence.dispose()
        draco.dispose()
        renderer.dispose()
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
  }, [])

  return (
    <div
      ref={containerRef}
      className={className ?? styles.logoMark}
      aria-hidden="true"
    />
  )
}

export default Logo3D
