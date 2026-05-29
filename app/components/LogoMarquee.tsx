'use client'

import {useEffect, useRef} from 'react'
import styles from '@/app/components/LogoMarquee.module.css'

const LOGOS = [
  {src: '/logos/hair-by-kim.webp', alt: 'Hair by Kim'},
  {src: '/logos/falcon-ink.webp', alt: 'Falcon Ink'},
  {src: '/logos/gymleco.webp', alt: 'Gymleco'},
  {src: '/logos/boutique-hotel-venlo.webp', alt: 'Boutique Hotel Venlo'},
  {src: '/logos/adventure-paradise.webp', alt: 'Adventure Paradise'},
  {src: '/logos/mocca.webp', alt: 'Mocca'},
  {src: '/logos/trento.webp', alt: 'Trento'},
  {src: '/logos/vloerverwarming-limburg.webp', alt: 'Vloerverwarming Limburg'},
]

type Props = {
  direction?: 'left' | 'right'
  speed?: number
  scrollSpeed?: number
  duplicate?: number
}

const LogoMarquee = ({
  direction = 'left',
  speed = 90,
  scrollSpeed = 2,
  duplicate = 2,
}: Props) => {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ctx: ReturnType<typeof import('gsap')['default']['context']> | undefined
    let cancelled = false

    ;(async () => {
      const gsap = (await import('gsap')).default
      const {ScrollTrigger} = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)
      if (cancelled) return

      const marquee = marqueeRef.current
      if (!marquee) return

      ctx = gsap.context(() => {
        const marqueeContent = marquee.querySelector<HTMLDivElement>(
          '[data-marquee-collection-target]',
        )
        const marqueeScroll = marquee.querySelector<HTMLDivElement>(
          '[data-marquee-scroll-target]',
        )
        if (!marqueeContent || !marqueeScroll) return

        const marqueeDirectionAttr = direction === 'right' ? 1 : -1
        const speedMultiplier =
          window.innerWidth < 479 ? 0.25 : window.innerWidth < 991 ? 0.5 : 1

        const marqueeSpeed =
          speed * (marqueeContent.offsetWidth / window.innerWidth) * speedMultiplier

        marqueeScroll.style.marginLeft = `${scrollSpeed * -1}%`
        marqueeScroll.style.width = `${scrollSpeed * 2 + 100}%`

        if (duplicate > 0) {
          const fragment = document.createDocumentFragment()
          for (let i = 0; i < duplicate; i++) {
            fragment.appendChild(marqueeContent.cloneNode(true))
          }
          marqueeScroll.appendChild(fragment)
        }

        const marqueeItems = marquee.querySelectorAll(
          '[data-marquee-collection-target]',
        )
        const animation = gsap
          .to(marqueeItems, {
            xPercent: -100,
            repeat: -1,
            duration: marqueeSpeed,
            ease: 'linear',
          })
          .totalProgress(0.5)

        gsap.set(marqueeItems, {xPercent: marqueeDirectionAttr === 1 ? 100 : -100})
        animation.timeScale(marqueeDirectionAttr)
        animation.play()

        marquee.setAttribute('data-marquee-status', 'normal')

        ScrollTrigger.create({
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          /* Pauzeer de oneindige loop zodra de marquee buiten beeld is —
             scheelt een continu draaiende tween + GPU-werk als je voorbij
             gescrold bent. */
          onToggle: (self) => {
            if (self.isActive) animation.resume()
            else animation.pause()
          },
          onUpdate: (self) => {
            const isInverted = self.direction === 1
            const currentDirection = isInverted
              ? -marqueeDirectionAttr
              : marqueeDirectionAttr
            animation.timeScale(currentDirection)
            marquee.setAttribute(
              'data-marquee-status',
              isInverted ? 'normal' : 'inverted',
            )
          },
        })

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: marquee,
            start: '0% 100%',
            end: '100% 0%',
            scrub: 1.5,
          },
        })

        const scrollStart = marqueeDirectionAttr === -1 ? scrollSpeed : -scrollSpeed
        const scrollEnd = -scrollStart

        tl.fromTo(
          marqueeScroll,
          {x: `${scrollStart}vw`},
          {x: `${scrollEnd}vw`, ease: 'none'},
        )
      }, marqueeRef)
    })()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
    }
  }, [direction, speed, scrollSpeed, duplicate])

  return (
    <section className={styles.section}>
      <div
        ref={marqueeRef}
        className={styles.marquee}
        data-marquee-direction={direction}
        data-marquee-status="normal"
      >
        <div data-marquee-scroll-target className={styles.scroll}>
          <div data-marquee-collection-target className={styles.collection}>
            {LOGOS.map((logo) => (
              <div key={logo.src} className={styles.item}>
                <img src={logo.src} alt={logo.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LogoMarquee
