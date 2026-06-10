import Image from 'next/image'
import Footer from '@/app/components/Footer'
import LogoMarquee from '@/app/components/LogoMarquee'
import PageFX from '@/app/components/PageFX'
import ProjectsGrid from '@/app/components/ProjectsGrid'
import StudioSection from '@/app/components/home/StudioSection'
import WerkwijzeSection from '@/app/components/home/WerkwijzeSection'
import ReviewsCarousel from '@/app/components/home/ReviewsCarousel'
import { IconButton } from '@/app/components/IconButton'
import styles from '@/app/home.module.css'

const HomePage = () => (
  <PageFX>
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
          className={styles.heroText}
        >
          <em className="scriptCap">J</em>ij runt je bedrijf
          <br />
          ik regel je socials
        </h1>
        <p className={styles.heroSubtitle}>
          <span className={styles.heroSubtitleMain}>Content en strategie</span>
          <span className={styles.heroSubtitleScript}>
            by <span className={styles.heroSubtitleV}>V</span>ienna
          </span>
        </p>
      </section>
      <figure className={styles.heroFigure} data-parallax="trigger">
        <div className={styles.parallaxTarget} data-parallax="target">
          {/* Overscan-wrapper draagt de 150%/-25% pan-ruimte; Image fill
              vult deze div 100% (fill verbiedt style.height). */}
          <div className={styles.heroImage}>
            <Image
              src="/images/vienna-hero.webp"
              alt="Vienna met de camera"
              fill
              priority
              quality={90}
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            />
          </div>
        </div>
      </figure>

      <LogoMarquee />

      <section className={styles.imageGrid}>
        <section className={styles.projectenSection}>
          <header className={styles.projectenHeader}>
            <p className={styles.projectenLabel}>
              2008 / 2026
            </p>
            <h2 className={styles.projectenTitle} data-animation="webgl-text">
              <em className="scriptCap">C</em>reative projecten
            </h2>
          </header>

          <ProjectsGrid
            headingLevel="h3"
            layout={[
              ['fgs'],
              ['hair-by-kim', 'hal-xiii'],
              ['vloerverwarming-limburg'],
            ]}
          />

          <IconButton href="/contact" className={styles.projectenCta}>
            Word de volgende case
          </IconButton>
        </section>
      </section>

      <StudioSection />
      <WerkwijzeSection />
      <ReviewsCarousel />

      <Footer />
    </div>
  </PageFX>
)

export default HomePage
