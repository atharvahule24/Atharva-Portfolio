import { motion } from 'framer-motion';
import NeuralNetBg from '../components/NeuralNetBg';
import styles from './WritingPage.module.css';

export default function WritingPage() {
  return (
    <motion.main
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0 }}
    >
      <NeuralNetBg opacity={0.25} />

      <div className={styles.inner}>
        <div className={styles.header}>
          <h1 className={styles.title}>Writing</h1>

          <p className={styles.subtitle}>
            Notes, experiments, and lessons from my journey in software,
            AI, and data.
          </p>
        </div>

        <motion.div
          className={styles.emptyState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className={styles.errorIcon}>📝</div>

          <p className={styles.errorTitle}>
            Writing coming soon
          </p>

          <p className={styles.errorMessage}>
            I'm currently focusing on building projects and documenting
            what I learn along the way. Articles and technical notes will
            be added here soon.
          </p>
        </motion.div>
      </div>
    </motion.main>
  );
}