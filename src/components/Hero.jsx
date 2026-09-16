import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import NeuralNetBg from './NeuralNetBg';
import { supabase } from '../supabaseClient';
import styles from './Hero.module.css';
import resumePdf from '../assets/atharva_resume.pdf';
export default function Hero() {
  const [stats, setStats] = useState({
    projects_count: 3,
    dsa_count: 150,
    certifications_count: 3
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .limit(1)
          .single();
        if (!error && data) {
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className={styles.hero}>
      {/* Neural net background */}
      <div className={styles.bgCanvas}>
        <NeuralNetBg />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          className={styles.internBadge}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <span className={styles.pulseDot} />
          Open to internships
        </motion.div>

        <motion.h1
          className={styles.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
            Atharva
            <br/>
            Hule
        </motion.h1>

        <motion.p
          className={styles.tagline}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Computer Science undergrad. Building software, AI systems, and data-driven projects.
        </motion.p>

        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button className="btn-primary" onClick={scrollToProjects}>
            View Projects
          </button>
          <a
            href={resumePdf}
            className="btn-secondary"
           download="Atharva_Hule_Resume.pdf"
          >
            Download CV
          </a>
        </motion.div>

        <motion.div
          className={styles.meta}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <span className={styles.metaTag}>B.Tech Computer Science</span>
          <span className={styles.metaDot} />
          <span className={styles.metaTag}>Sardar Patel Institute of Technology</span>
          <span className={styles.metaDot} />
          <span className={styles.metaTag}>3rd Year</span>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <StatCounter end={stats.projects_count} label="Projects" />
          <StatCounter end={stats.dsa_count} label="DSA Problems" />
          <StatCounter end={stats.certifications_count} label="Certifications" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', letterSpacing: '2px', color: '#475569' }}>
            scroll ↓
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

function StatCounter({ end, label }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, end, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [end, count]);

  return (
    <div className={styles.statItem}>
      <motion.span className={styles.statNumber}>{rounded}</motion.span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
