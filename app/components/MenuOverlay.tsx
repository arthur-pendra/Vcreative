'use client'

import { useEffect, useRef } from 'react'
import type * as THREE from 'three'
import styles from '@/app/components/MenuOverlay.module.css'

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
  uniform vec2 uAspect;
  uniform sampler2D uNoiseTex;
  varying vec2 vUv;

  void main() {
    vec2 p = vec2(vUv.x, 1.0 - vUv.y) * vec2(uAspect.x, 1.0);
    float dist = length(p);
    float reach = mix(-0.15, 2.5, 1.0 - uReveal);
    if (dist > reach + 0.85) discard;

    vec2 tDrift = vec2(sin(uTime * 0.18), cos(uTime * 0.14)) * 0.22;

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

    float n1 = texture2D(uNoiseTex, p * 1.5 + w2 * 0.7).r;
    float n2 = texture2D(uNoiseTex, p * 3.5 + w1 * 0.4 + tDrift * 0.5).r;
    float n3 = texture2D(uNoiseTex, p * 8.0 + w2 * 0.2).r;
    float n4 = texture2D(uNoiseTex, p * 18.0 + tDrift).r;
    float noise = n1 * 0.4 + n2 * 0.3 + n3 * 0.2 + n4 * 0.1;

    float noiseAmp = clamp(0.1 + reach * 0.45, 0.12, 1.1);
    float distorted = dist - (noise - 0.5) * noiseAmp;
    float mask = smoothstep(reach + 0.05, reach - 0.05, distorted);
    if (mask < 0.01) discard;

    vec3 color = vec3(0.2, 0.184, 0.161);
    gl_FragColor = vec4(color, mask);
  }
`

type Props = {
  hover: boolean
}

const MenuOverlay = ({ hover }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const materialRef = useRef<{ uniforms: { uReveal: { value: number } } } | null>(null)
  const renderRef = useRef<(() => void) | null>(null)

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

      const canvas = renderer.domElement
      canvas.className = styles.canvas
      container.appendChild(canvas)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10)
      camera.position.z = 1

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

      const material = new THREE.ShaderMaterial({
        transparent: true,
        vertexShader,
        fragmentShader,
        uniforms: {
          uReveal: { value: 1 },
          uTime: { value: 0 },
          uAspect: { value: new THREE.Vector2(width / height, 1) },
          uNoiseTex: { value: noiseTex },
        },
      })

      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
      scene.add(mesh)

      const render = () => renderer.render(scene, camera)
      render()

      materialRef.current = material as unknown as {
        uniforms: { uReveal: { value: number } }
      }
      renderRef.current = render

      const startT = performance.now()
      renderer.setAnimationLoop(() => {
        const t = (performance.now() - startT) * 0.001
        material.uniforms.uTime.value = t
        if ((material.uniforms.uReveal.value as number) < 0.999) {
          renderer.render(scene, camera)
        }
      })

      const onResize = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        renderer.setSize(w, h, false)
        ;(material.uniforms.uAspect.value as THREE.Vector2).set(w / h, 1)
        render()
      }
      window.addEventListener('resize', onResize)

      cleanup = () => {
        window.removeEventListener('resize', onResize)
        renderer.setAnimationLoop(null)
        material.dispose()
        mesh.geometry.dispose()
        noiseTex.dispose()
        renderer.dispose()
        try { renderer.forceContextLoss() } catch { /* swallow */ }
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

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const gsap = (await import('gsap')).default
      if (cancelled) return

      const material = materialRef.current
      const render = renderRef.current
      if (!material || !render) return

      gsap.killTweensOf(material.uniforms.uReveal)

      if (hover) {
        gsap.to(material.uniforms.uReveal, {
          value: 0.78,
          duration: 0.9,
          ease: 'power2.out',
          onUpdate: render,
        })
      } else {
        gsap.to(material.uniforms.uReveal, {
          value: 1,
          duration: 0.7,
          ease: 'power2.inOut',
          onUpdate: render,
        })
      }
    }

    run()
    return () => { cancelled = true }
  }, [hover])

  return <div ref={containerRef} className={styles.root} />
}

export default MenuOverlay
