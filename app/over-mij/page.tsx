import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import { IconButton } from '@/app/components/IconButton'
import PageFX from '@/app/components/PageFX'
import styles from '@/app/over-mij/over-mij.module.css'

export const metadata: Metadata = {
  title: 'Over mij',
  description:
    'Vienna Wachelder. Verhalen vertalen naar beeld dat blijft. Vanuit Heerlen, voor ondernemers door heel Nederland.',
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
    copy: 'We starten met een gesprek over wie je bent en wie je wilt bereiken. Niet om een template in te vullen, maar om een toon te vinden.',
  },
  {
    name: 'Content',
    copy: 'Ik fotografeer, film, monteer en schrijf. Op locatie als het kan, in de studio als het moet. Persoonlijk, nooit standaard.',
  },
  {
    name: 'Plaatsen',
    copy: 'Alles wordt gepland en geplaatst. Jij hoeft geen captions meer te bedenken om 22:00.',
  },
  {
    name: 'Bijsturen',
    copy: 'Maandelijks kijken we wat werkt en wat beter kan. Geen rapportage-theater, wel scherpe keuzes.',
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
          <em className="scriptCap">V</em>erhalen vertalen
          <br />
          naar beeld dat blijft
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
            src="https://picsum.photos/seed/vienna-portrait/1920/823"
            alt="Vienna aan het werk"
            className={styles.heroImage}
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
              Trage groei,
              <br />
              content die blijft hangen
            </h2>
            <p className={styles.sectionBody}>
              Wat ooit begon met een camera in mijn hand op familiefeesten,
              groeide uit tot een studio voor merken die iets te vertellen
              hebben.
            </p>
            <p className={styles.sectionBody}>
              Vanuit Heerlen werk ik met ondernemers door heel Nederland, van
              beauty tot horeca tot tattoo studio&rsquo;s. Wat ze gemeen
              hebben: ze willen hun verhaal serieus nemen, niet alleen vaker
              posten.
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
                src="https://picsum.photos/seed/vienna-studio/900/1125"
                alt="Vienna in de studio"
                className={styles.sectionImage}
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
                src="https://picsum.photos/seed/vienna-work/1200/900"
                alt="Content voorbeelden"
                className={styles.sectionImage}
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
              Van eerste concept
              <br />
              tot maandelijks ritme
            </h2>
            <p className={styles.sectionBody}>
              Ik neem het hele creatieve traject over, van fotografie en video
              tot editing, captions, planning en analyse. Op locatie als het
              kan, in de studio als het moet.
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
                src="https://picsum.photos/seed/vienna-process/1920/840"
                alt="Werkwijze"
                className={styles.sectionImage}
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
          <span className={styles.ctaLabelDot} aria-hidden="true" />
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
