import { motion } from 'framer-motion';
import NeuralNetBg from '../components/NeuralNetBg';
import styles from './CertificationsPage.module.css';

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export default function CertificationsPage() {
  return (
    <motion.main className={styles.page} {...fadeIn}>
      <div className={styles.bgWrap}>
        <NeuralNetBg speedMultiplier={0.4} />
      </div>

      <div className={styles.inner}>
        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Certifications
        </motion.span>

        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          Certifications and credentials will be added as I earn them.
        </motion.p>

        <motion.div
          className={styles.cards}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className={styles.card}>
            <div className={styles.accentBar} />

            <div className={styles.cardTop}>
              <div className={styles.badgeWrap}>
                <span className={styles.badgeIcon}>✦</span>
              </div>

              <div className={styles.certMeta}>
                <p className={styles.certIssuer}>Currently building</p>

                <h2 className={styles.certName}>
                  Certifications coming soon
                </h2>
              </div>
            </div>

            <div className={styles.divider} />

            <p className={styles.certDesc}>
              I'm currently focusing on building projects and strengthening
              my technical skills. Relevant certifications will be added here
              as I complete them.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}