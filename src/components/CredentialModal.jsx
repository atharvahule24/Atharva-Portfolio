import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CredentialModal.module.css';

const DEVICON_MAP = {
  'IBM': 'ibm',
  'Google': 'google',
  'Meta': 'facebook',
  'Microsoft': 'microsoft',
  'DeepLearning.AI': 'python',
  'Coursera': 'devicon'
};

export default function CredentialModal({ cert, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!cert) return null;

  const getIconUrl = (issuer) => {
    // Attempt exact match or lowercase
    const found = Object.keys(DEVICON_MAP).find(k => k.toLowerCase() === issuer.toLowerCase()) || 'devicon';
    const slug = DEVICON_MAP[found] || 'devicon';
    return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
          
          <div className={styles.imageContainer}>
            {cert.image_url ? (
              <img src={cert.image_url} alt={cert.name} className={styles.image} loading="lazy" width="800" height="600" />
            ) : (
              <div className={styles.iconFallback}>
                <img src={getIconUrl(cert.issuer)} alt={cert.issuer} />
              </div>
            )}
          </div>

          <div className={styles.content}>
            <h2 className={styles.title}>{cert.name}</h2>
            <div className={styles.meta}>
              <span className={styles.issuer}>{cert.issuer}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.date}>{cert.year}</span>
            </div>
            
            {cert.credential_id && (
              <div className={styles.credId}>
                ID: {cert.credential_id}
              </div>
            )}

            {cert.verify_url && (
              <a href={cert.verify_url} target="_blank" rel="noopener noreferrer" className={styles.verifyBtn}>
                Verify Credential &rarr;
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
