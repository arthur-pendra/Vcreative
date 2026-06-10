import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import PageFX from '@/app/components/PageFX'
import ProjectsGrid from '@/app/components/ProjectsGrid'
import styles from '@/app/cases/cases-index.module.css'

export const metadata: Metadata = {
  title: 'Cases',
  description:
    'Werk dat ik met trots deel. Een selectie van merken die ik mocht helpen met content en social media.',
}

/* Mirrors the home's "Creative projecten" block via het gedeelde
   ProjectsGrid: one full-bleed card, a small/large row, and another
   full-bleed. Keeps the visual rhythm consistent between home and
   /cases rather than switching to a plain grid when you click through. */
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
        <ProjectsGrid
          headingLevel="h2"
          layout={[
            ['hair-by-kim'],
            ['fgs', 'hal-xiii'],
            ['vloerverwarming-limburg'],
          ]}
        />
      </section>

      <Footer />
    </div>
  </PageFX>
)

export default CasesIndex
