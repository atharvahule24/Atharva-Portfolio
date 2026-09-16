import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './Certifications.module.css';

export default function Certifications() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section
      id="certifications"
      className={styles.certs}
      ref={ref}
    >
      <div className="container">

        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Certifications
        </motion.span>

        <motion.div
          className={styles.list}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className={styles.certItem}>
            <div className={styles.certRow}>
              <div className={styles.certInfo}>
                <p className={styles.certIssuer}>
                  Currently building
                </p>

                <h3 className={styles.certName}>
                  Certifications coming soon
                </h3>
              </div>

              <div className={styles.certYear}>
                <span>2026</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}