import type { Metadata } from 'next'
import Footer from '@/app/components/Footer'
import PageFX from '@/app/components/PageFX'
import ContactForm from '@/app/contact/ContactForm'
import styles from '@/app/contact/contact.module.css'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact opnemen met Vienna. Laat een bericht achter en je hoort binnen één werkdag terug.',
}

const Contact = () => (
  <PageFX>
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.label}>
          Contact
        </p>
        <h1
          className={styles.title}
          data-animation="webgl-text"
          data-webgl-text-mode="hero"
        >
          <em className="scriptCap">L</em>aat horen waar
          <br />
          jij mee bezig bent
        </h1>
        <p className={styles.subtitle}>
          Een idee, een lopend project of zin om eens te sparren? Laat een
          bericht achter en je hoort binnen één werkdag van mij terug.
        </p>
      </header>

      <section className={styles.body}>
        <ContactForm />

        <aside className={styles.infoCol}>
          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Direct
            </p>
            <p className={styles.infoText}>
              <a href="mailto:info@vcreative.nl">info@vcreative.nl</a>
            </p>
            <p className={styles.infoText}>
              <a href="tel:+31641493806">+31 6 41 49 38 06</a>
            </p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Werkgebied
            </p>
            <p className={styles.infoSecondary}>
              Heerlen &amp; omstreken, op locatie in heel Nederland.
            </p>
          </div>

          <div className={styles.infoBlock}>
            <p className={styles.infoLabel}>
              Reactietijd
            </p>
            <p className={styles.infoSecondary}>
              Binnen één werkdag, vaak sneller. Voor lopende projecten ben ik
              direct bereikbaar via WhatsApp.
            </p>
          </div>
        </aside>
      </section>

      <Footer />
    </div>
  </PageFX>
)

export default Contact
