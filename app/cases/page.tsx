import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import PageFX from '@/app/components/PageFX'
import styles from '@/app/cases/cases-index.module.css'

export const metadata: Metadata = {
  title: 'Cases',
  description:
    'Werk dat ik met trots deel. Een selectie van merken die ik mocht helpen met content en social media.',
}

/* Mirrors the home's "Creative projecten" block: one full-bleed card,
   a small/large row, and another full-bleed. Keeps the visual rhythm
   consistent between home and /cases rather than switching to a plain
   grid when you click through. */
const CasesIndex = () => (
  <PageFX>
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.label}>
          Cases
        </p>
        <h1
          className={styles.title}
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
        >
          <em className="scriptCap">C</em>reative projecten
        </h1>
      </header>

      <section className={styles.cases}>
        <article className={`${styles.projectItem} ${styles.projectFull}`}>
          <a
            href="/cases/hair-by-kim"
            className={styles.projectMediaLink}
            data-cursor-hover
            data-cursor-text="Bekijk case"
            aria-label="Bekijk case Hair by Kim"
          >
            <figure
              className={styles.projectFigure}
              data-parallax="trigger"
              data-parallax-disabled
            >
              <div className={styles.parallaxTarget} data-parallax="target">
                <img
                  data-webgl-media
                  data-webgl-effect="bend"
                  data-webgl-y="0.13"
                  src="/cases/hair-by-kim/01.webp"
                  alt="Hair by Kim"
                  className={styles.projectImage}
                  loading="lazy"
                />
              </div>
            </figure>
          </a>
          <div className={styles.projectContent}>
            <h2 className={styles.projectTitle}>Hair by Kim</h2>
            <p className={styles.projectDescription}>
              Social media beheer voor Hair by Kim. Strategie, fotografie en
              contentcreatie die het merk laat groeien.
            </p>
            <a href="/cases/hair-by-kim" className={styles.projectLink}>
              Bekijk case
            </a>
          </div>
        </article>

        <div className={styles.projectenRow}>
          <article className={`${styles.projectItem} ${styles.projectSmall}`}>
            <a
              href="/cases/fgs"
              className={styles.projectMediaLink}
              data-cursor-hover
              data-cursor-text="Bekijk case"
              aria-label="Bekijk case FGS"
            >
              <figure
                className={styles.projectFigure}
                data-parallax="trigger"
                data-parallax-disabled
              >
                <div className={styles.parallaxTarget} data-parallax="target">
                  <img
                    data-webgl-media
                    data-webgl-effect="bend"
                    src="/cases/fgs/hero.webp"
                    alt="FGS"
                    className={styles.projectImage}
                    loading="lazy"
                  />
                </div>
              </figure>
            </a>
            <div className={styles.projectContent}>
              <h2 className={styles.projectTitle}>FGS</h2>
              <p className={styles.projectDescription}>
                {/* TODO copy klant — korte beschrijving van de FGS case */}
                Content creatie voor FGS. Industrieel vakmanschap met 125 jaar
                geschiedenis vertaald naar beeld en video.
              </p>
              <a href="/cases/fgs" className={styles.projectLink}>
                Bekijk case
              </a>
            </div>
          </article>

          <article className={`${styles.projectItem} ${styles.projectLarge}`}>
            <a
              href="/cases/hal-xiii"
              className={styles.projectMediaLink}
              data-cursor-hover
              data-cursor-text="Bekijk case"
              aria-label="Bekijk case Hal XIII"
            >
              <figure
                className={styles.projectFigure}
                data-parallax="trigger"
                data-parallax-disabled
              >
                <div className={styles.parallaxTarget} data-parallax="target">
                  <img
                    data-webgl-media
                    data-webgl-effect="bend"
                    src="/cases/hal-xiii/03.webp"
                    alt="Hal XIII"
                    className={styles.projectImage}
                    loading="lazy"
                  />
                </div>
              </figure>
            </a>
            <div className={styles.projectContent}>
              <h2 className={styles.projectTitle}>Hal XIII</h2>
              <p className={styles.projectDescription}>
                Maandelijks beheer voor Hal XIII. Energie en kracht vertaald
                naar beeld en video.
              </p>
              <a href="/cases/hal-xiii" className={styles.projectLink}>
                Bekijk case
              </a>
            </div>
          </article>
        </div>

        <article className={`${styles.projectItem} ${styles.projectFull}`}>
          <a
            href="/cases/vloerverwarming-limburg"
            className={styles.projectMediaLink}
            data-cursor-hover
            data-cursor-text="Bekijk case"
            aria-label="Bekijk case Vloerverwarming Limburg"
          >
            <figure
              className={styles.projectFigure}
              data-parallax="trigger"
              data-parallax-disabled
            >
              <div className={styles.parallaxTarget} data-parallax="target">
                <img
                  data-webgl-media
                  data-webgl-effect="bend"
                  src="/cases/vloerverwarming-limburg/full.webp"
                  alt="Vloerverwarming Limburg"
                  className={styles.projectImage}
                  loading="lazy"
                />
              </div>
            </figure>
          </a>
          <div className={styles.projectContent}>
            <h2 className={styles.projectTitle}>Vloerverwarming Limburg</h2>
            <p className={styles.projectDescription}>
              {/* TODO copy klant — korte beschrijving van de VVL case */}
              Content creatie voor Vloerverwarming Limburg. Vakmanschap op
              locatie vertaald naar foto en video.
            </p>
            <a href="/cases/vloerverwarming-limburg" className={styles.projectLink}>
              Bekijk case
            </a>
          </div>
        </article>
      </section>

      <Footer />
    </div>
  </PageFX>
)

export default CasesIndex
