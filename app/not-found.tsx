import { IconButton } from '@/app/components/IconButton'
import styles from '@/app/not-found.module.css'

const NotFound = () => (
  <main className={styles.page}>
    <div className={styles.shell}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>
        <em className="scriptCap">D</em>eze pagina is er niet
      </h1>
      <p className={styles.subtitle}>
        Misschien is hij verhuisd, weggehaald, of nooit bestaan. Geen zorgen,
        we gaan terug naar de basis.
      </p>
      <IconButton href="/" ariaLabel="Terug naar de homepage">
        Terug naar home
      </IconButton>
    </div>
  </main>
)

export default NotFound
