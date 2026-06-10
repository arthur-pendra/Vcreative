import Link from 'next/link'
import { CASES, type CaseSlug } from '@/app/cases/caseData'
import styles from '@/app/components/CaseCard.module.css'

type Size = 'full' | 'small' | 'large'
type HeadingLevel = 'h2' | 'h3'

const SIZE_CLASS: Record<Size, string> = {
  full: styles.itemFull,
  small: styles.itemSmall,
  large: styles.itemLarge,
}

/* Eén projectkaart: beeld, titel, samenvatting en case-link, volledig
   gevoed uit caseData (heroImage/heroFocusY/heroImagePosition/card). */
const CaseCard = ({
  slug,
  size,
  headingLevel: Heading,
}: {
  slug: CaseSlug
  size: Size
  headingLevel: HeadingLevel
}) => {
  const data = CASES[slug]
  return (
    <article className={`${styles.item} ${SIZE_CLASS[size]}`}>
      <Link
        href={`/cases/${slug}`}
        className={styles.mediaLink}
        data-cursor-hover
        data-cursor-text="Bekijk case"
        aria-label={`Bekijk case ${data.name}`}
      >
        <figure
          className={styles.figure}
          data-parallax="trigger"
          data-parallax-disabled
        >
          <div className={styles.parallaxTarget} data-parallax="target">
            <img
              data-webgl-media
              data-webgl-effect="bend"
              data-webgl-y={data.heroFocusY}
              src={data.heroImage}
              alt={data.name}
              className={styles.image}
              style={
                data.heroImagePosition
                  ? { objectPosition: data.heroImagePosition }
                  : undefined
              }
              loading="lazy"
            />
          </div>
        </figure>
      </Link>
      <div className={styles.content}>
        <Heading className={styles.title}>{data.name}</Heading>
        <p className={styles.description}>{data.card.summary}</p>
        <Link href={`/cases/${slug}`} className={styles.link}>
          Bekijk case
        </Link>
      </div>
    </article>
  )
}

/* Grid-ritme: een blok van één slug rendert full-bleed, een blok van
   twee als small/large-rij. De pagina kiest volgorde en ritme:

     <ProjectsGrid layout={[['fgs'], ['hair-by-kim', 'hal-xiii'], …]} />

   headingLevel: op home zit het grid onder een h2-sectiekop (→ h3),
   op /cases zijn kaarttitels het eerste niveau na de h1 (→ h2). */
export type GridBlock = [CaseSlug] | [CaseSlug, CaseSlug]

const ProjectsGrid = ({
  layout,
  headingLevel = 'h2',
}: {
  layout: GridBlock[]
  headingLevel?: HeadingLevel
}) => (
  <>
    {layout.map((block) =>
      block.length === 1 ? (
        <CaseCard
          key={block[0]}
          slug={block[0]}
          size="full"
          headingLevel={headingLevel}
        />
      ) : (
        <div key={block.join('+')} className={styles.row}>
          <CaseCard slug={block[0]} size="small" headingLevel={headingLevel} />
          <CaseCard slug={block[1]} size="large" headingLevel={headingLevel} />
        </div>
      ),
    )}
  </>
)

export default ProjectsGrid
