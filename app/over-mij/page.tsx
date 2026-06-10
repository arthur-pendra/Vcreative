import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import { IconButton } from '@/app/components/IconButton'
import PageFX from '@/app/components/PageFX'
import ed from '@/app/styles/editorial.module.css'
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

const OverMij = () => (
  <PageFX>
    <div className={ed.page}>
      <section className={ed.hero}>
        <h1
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
          className={ed.heroTitle}
        >
          <em className="scriptCap">B</em>eeld dat laat zien
          <br />
          wie je bent
        </h1>
        <ul className={ed.heroTags}>
          {HERO_TAGS.map((tag) => (
            <li key={tag} className={ed.heroTag}>
              {tag}
            </li>
          ))}
        </ul>
      </section>

      <figure className={ed.heroFigure} data-parallax="trigger">
        <div className={ed.parallaxTarget} data-parallax="target">
          <img
            src="/images/hero_overmij.webp"
            alt="Vienna aan het werk"
            className={ed.heroImage}
            style={{ objectPosition: 'center 28%' }}
          />
        </div>
      </figure>

      <div className={ed.sections}>
        {/* Section A — text left, portrait image right */}
        <section className={`${ed.section} ${ed.sectionA}`}>
          <div className={ed.sectionText}>
            <p className={ed.sectionLabel}>
              <span className={ed.sectionLabelNumber}>01</span>
              Mijn verhaal
            </p>
            <h2 data-animation="webgl-text" className={ed.sectionTitle}>
              Persoonlijk en betrokken,
              <br />
              van begin af aan
            </h2>
            <p className={ed.sectionBody}>
              Ik ben Vienna, contentmaker vanuit Heerlen. Ik help ondernemers
              en merken om hun verhaal te vertalen naar sterk beeld.
            </p>
            <p className={ed.sectionBody}>
              Van fotografie tot video en social media: ik werk persoonlijk en
              betrokken, zodat je merk online laat zien wie het is.
            </p>
          </div>
          <figure
            className={ed.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={ed.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.18"
                src="/images/overmij2.webp"
                alt="Vienna met de camera in de studio"
                className={ed.sectionImage}
                style={{ objectPosition: 'center 22%' }}
                loading="lazy"
              />
            </div>
          </figure>
        </section>

        {/* Section B — landscape image left, text right */}
        <section className={`${ed.section} ${ed.sectionB}`}>
          <figure
            className={ed.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={ed.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.12"
                src="/images/overmij3.webp"
                alt="Vienna aan het werk met laptop en camera"
                className={ed.sectionImage}
                style={{ objectPosition: 'center 28%' }}
                loading="lazy"
              />
            </div>
          </figure>
          <div className={ed.sectionText}>
            <p className={ed.sectionLabel}>
              <span className={ed.sectionLabelNumber}>02</span>
              Wat ik doe
            </p>
            <h2 data-animation="webgl-text" className={ed.sectionTitle}>
              Alles voor je content,
              <br />
              van begin tot eind
            </h2>
            <p className={ed.sectionBody}>
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
        <section className={`${ed.section} ${ed.sectionC}`}>
          <figure
            className={ed.sectionFigure}
            data-parallax="trigger"
            data-parallax-disabled
          >
            <div className={ed.parallaxTarget} data-parallax="target">
              <img
                data-webgl-media
                data-webgl-effect="bend"
                data-webgl-y="0.18"
                src="/images/overmij2.webp"
                alt="Vienna in de studio"
                className={ed.sectionImage}
                style={{ objectPosition: 'center 22%' }}
                loading="lazy"
              />
            </div>
          </figure>
          <div className={ed.sectionCText}>
            <div className={ed.sectionCTextLead}>
              <p className={ed.sectionLabel}>
                <span className={ed.sectionLabelNumber}>03</span>
                Hoe ik werk
              </p>
              <h2 data-animation="webgl-text" className={ed.sectionTitle}>
                Vier stappen,
                <br />
                één ritme
              </h2>
            </div>
            <div className={ed.sectionCTextBody}>
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
        </div>
      </section>

      <Footer />
    </div>
  </PageFX>
)

export default OverMij
