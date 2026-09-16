import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
};

export default function NotFoundPage() {
  return (
    <motion.main className={styles.container} {...fadeIn}>
      <div className={styles.inner}>
        <div className={styles.svgWrapper}>
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 400 400">
            <g transform="translate(200, 200)">
              <path stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" fill="none" d="M-100,-50 L-50,0 M-100,50 L-50,0 M-50,0 L0,-50 M-50,0 L0,50 M0,-50 L50,0 M0,50 L50,0 M50,0 L100,-50 M50,0 L100,50"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="-100" cy="-50" r="8"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="-100" cy="50" r="8"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="-50" cy="0" r="12"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="0" cy="-50" r="12"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="0" cy="50" r="12"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="50" cy="0" r="12"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="100" cy="-50" r="8"/>
              <circle fill="currentColor" fillOpacity="0.1" cx="100" cy="50" r="8"/>
              <circle cx="50" cy="0" r="6" className={styles.pulseDot} />
            </g>
          </svg>
        </div>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>This page doesn't exist. Yet.</p>
        <div className={styles.buttons}>
          <Link to="/" className={styles.homeBtn}>&larr; Back to Home</Link>
          <Link to="/projects" className={styles.projectsBtn}>View Projects &rarr;</Link>
        </div>
      </div>
    </motion.main>
  );
}
