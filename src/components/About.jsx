import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './About.module.css';
import profilePic from '../assets/profile.png';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const tags = [
  'Software Development',
  'AI / ML',
  'Data Science',
  'Python',
  'SQL',
];

export default function About() {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const photoRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ['start end', 'end start'],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5],
    ['inset(40% 20% 40% 20%)', 'inset(0% 0% 0% 0%)']
  );

  return (
    <section id="about" className={styles.about} ref={ref}>
      <div className="container">

        <motion.span
          className="section-label"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          transition={{ duration: 0.5 }}
        >
          ABOUT
        </motion.span>

        <div className={styles.grid}>

          {/* Photo side */}
          <div className={styles.photoWrap}>
            <motion.div
              ref={photoRef}
              style={{ clipPath }}
              className={styles.clipReveal}
            >
              <div className={styles.photoFrame}>
                <img
                  src={profilePic}
                  alt="Atharva Hule"
                  loading="eager"
                  fetchPriority="high"
                  width="800"
                  height="800"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                    position: 'relative',
                    zIndex: 1,
                  }}
                />

                <div className={styles.cornerTL} />
                <div className={styles.cornerBR} />
              </div>
            </motion.div>
          </div>

          {/* Text side */}
          <div className={styles.textSide}>

            <motion.p
              className={styles.bio}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: 0.22 }}
            >
              I'm a Computer Science undergraduate at Sardar Patel Institute
              of Technology, interested in building practical software and
              exploring the intersection of technology, data, and AI.
            </motion.p>

            <motion.p
              className={styles.bio}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              I enjoy working with Python, SQL, web technologies, and data
              tools while continuously strengthening my foundations in
              programming, algorithms, and software development.
            </motion.p>

            <motion.p
              className={`${styles.bio} ${styles.philosophy}`}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: 0.34 }}
            >
              "Learn the fundamentals. Build real things. Keep improving."
            </motion.p>

            <motion.div
              className={styles.tagRow}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  color: '#475569',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  display: 'block',
                }}
              >
                WHAT I'M INTO
              </span>

              <div className={styles.tags}>
                {tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="tag"
                    initial={{ opacity: 0, y: 10 }}
                    animate={
                      inView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 10 }
                    }
                    transition={{
                      delay: 0.45 + i * 0.05,
                      duration: 0.3,
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}