import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import { IconButton } from '@/app/components/IconButton'
import PageFX from '@/app/components/PageFX'
import styles from '@/app/over-mij/over-mij.module.css'

export const metadata: Metadata = {
  title: 'Over mij',
  description:
    'Vienna Wachelder. Ik maak beeld dat laat zien wie je bent. Vanuit Heerlen, voor ondernemers door heel Nederland.',
}

const HERO_TAGS = ['Sinds 2019', 'Vanuit Heerlen', 'Voor heel Nederland']

const DELIVERABLES = [
  'Fotografie',
  'Videografie',
  'Editing',
  'Copywriting',
  'Account vormgeving',
  'Planning',
  'Analyse',
]

const WORKFLOW = [
  {
    name: 'Intake',
    copy: 'We beginnen met een gesprek over wie je bent en wat je wilt bereiken. Zo bepalen we samen de richting.',
  },
  {
    name: 'Content',
    copy: 'Vervolgens maak ik de content: fotografie, video, montage en teksten. Altijd afgestemd op jouw merk.',
  },
  {
    name: 'Plaatsen',
    copy: 'Ik plan alles in en zet het voor je live, zodat jij je geen zorgen hoeft te maken over de planning.',
  },
  {
    name: 'Bijsturen',
    copy: 'Elke maand kijken we samen wat werkt en wat beter kan, en sturen we waar nodig bij.',
  },
]

const DownloadIcon = () => (
  <svg
    className={styles.ctaDownloadIcon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 2.5V11.5M8 11.5L4 7.5M8 11.5L12 7.5M2.5 13.5H13.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const OverMij = () => (
  <PageFX>
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
          className={styles.heroTitle}
        >
          <em className="scriptCap">B</em>eeld dat laat zien
          <br />
          wie je bent
        </h1>
        <ul className={styles.heroTags}>
          {HERO_TAGS.map((tag) => (
            <li key={tag} className={styles.heroTag}>
              {tag}
            </li>
          ))}
        </ul>
      </section>

      <figure className={styles.heroFigure} data-parallax="trigger">
        <div className={styles.parallaxTarget} data-parallax="target">
          <img
            src="/images/hero_overmij.webp"
            alt="Vienna aan het werk"
            className={styles.heroImage}
            style={{ objectPosition: 'center 28%' }}
          />
        </div>
      </figure>

      <div className={styles.sections}>
        {/* Section A — text left, portrait image right */}
        <section className={`${styles.section} ${styles.sectionA}`}>
          <div className={styles.sectionText}>
            <p className={styles.sectionLabel}>
              <span className={styles.sectionLabelNumber}>01</span>
              Mijn verhaal
            </p>
            <h2 data-animation="webgl-text" className={styles.sectionTitle}>
              Persoonlijk en betrokken,
              <br />
              van begin af aan
            </h2>
            <p className={styles.sectionBody}>
              Ik ben Vienna, contentmaker vanuit Heerlen. Ik help ondernemers
              en merken om hun verhaal te vertalen naar sterk beeld.
            </p>
            <p className={styles.sectionBody}>
              Van fotografie tot video en social media: ik werk persoonlijk en
              betrokken, zodat je merk online laat zien wie het is.
            </p>
          </div>
          <figure
            className={styles.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={styles.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.18"
                src="/images/overmij2.webp"
                alt="Vienna met de camera in de studio"
                className={styles.sectionImage}
                style={{ objectPosition: 'center 22%' }}
                loading="lazy"
              />
            </div>
          </figure>
        </section>

        {/* Section B — landscape image left, text right */}
        <section className={`${styles.section} ${styles.sectionB}`}>
          <figure
            className={styles.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={styles.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.12"
                src="/images/overmij3.webp"
                alt="Vienna aan het werk met laptop en camera"
                className={styles.sectionImage}
                style={{ objectPosition: 'center 28%' }}
                loading="lazy"
              />
            </div>
          </figure>
          <div className={styles.sectionText}>
            <p className={styles.sectionLabel}>
              <span className={styles.sectionLabelNumber}>02</span>
              Wat ik doe
            </p>
            <h2 data-animation="webgl-text" className={styles.sectionTitle}>
              Alles voor je content,
              <br />
              van begin tot eind
            </h2>
            <p className={styles.sectionBody}>
              Fotografie, video, montage, teksten en planning &mdash; ik
              verzorg het hele creatieve traject. Op locatie of in de studio,
              altijd afgestemd op jouw merk.
            </p>
            <ul className={styles.chips}>
              {DELIVERABLES.map((d) => (
                <li key={d} className={styles.chip}>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Section C — full-width image + 2-col caption below */}
        <section className={`${styles.section} ${styles.sectionC}`}>
          <figure
            className={styles.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={styles.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.18"
                src="/images/overmij2.webp"
                alt="Vienna in de studio"
                className={styles.sectionImage}
                style={{ objectPosition: 'center 22%' }}
                loading="lazy"
              />
            </div>
          </figure>
          <div className={styles.sectionCText}>
            <div className={styles.sectionCTextLead}>
              <p className={styles.sectionLabel}>
                <span className={styles.sectionLabelNumber}>03</span>
                Hoe ik werk
              </p>
              <h2 data-animation="webgl-text" className={styles.sectionTitle}>
                Vier stappen,
                <br />
                één ritme
              </h2>
            </div>
            <div className={styles.sectionCTextBody}>
              <ol className={styles.workflowList}>
                {WORKFLOW.map((step, i) => (
                  <li key={step.name} className={styles.workflowItem}>
                    <span className={styles.workflowNumber}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className={styles.workflowName}>{step.name}</h3>
                    <p className={styles.workflowCopy}>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.cta} data-theme="dark">
        <p className={styles.ctaLabel}>
          Samenwerken
        </p>
        <h2
          data-animation="webgl-text"
          data-webgl-text-bg="#000000"
          className={styles.ctaTitle}
        >
          <em className="scriptCap">K</em>laar om jouw merk
          <br />
          te laten zien?
        </h2>
        <div className={styles.ctaActions}>
          <IconButton href="/contact" ariaLabel="Naar contactpagina">
            Start jouw project
          </IconButton>
          <a
            className={styles.ctaDownload}
            href="/v-creative-brochure.pdf"
            download
          >
            <DownloadIcon />
            Download de brochure
          </a>
        </div>
      </section>

      <Footer />
    </div>
  </PageFX>
)

export default OverMij
