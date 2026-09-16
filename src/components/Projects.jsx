import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './Projects.module.css';

const cardVariants = {
  offscreen: { x: 100, opacity: 0 },
  onscreen: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.4, duration: 0.8 },
  },
};

const PROJECT_COLORS = ['#D97706', '#4338CA', '#1C1917', '#9333EA', '#059669'];

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);
  const color = PROJECT_COLORS[index % PROJECT_COLORS.length];
  const num = (index + 1).toString().padStart(2, '0');

  return (
    <motion.div
      className={`${styles.card} ${hovered ? styles.cardHovered : ''}`}
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.2 }}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Prevent navigation if clicking on a link inside the card
        if (e.target.closest('a')) return;
        window.location.href = `/projects/${slugify(project.title)}`;
      }}
      role="button"
      tabIndex={0}
    >
      {/* Signal border animation */}
      {hovered && <div className={styles.signalBorder} />}

      <div className={styles.cardNum} style={{ color }}>
        {num}
      </div>
      
      {project.status === 'In Progress' && (
        <span className={styles.inProgressBadge}>In Progress</span>
      )}

      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardSubtitle}>{project.subtitle}</p>

      <div className={styles.cardDivider} />

      <p className={styles.cardDesc}>{project.description}</p>

      <div className={styles.cardTech}>
        {project.tech_stack?.map(t => (
          <span key={t} className={`tag ${styles.techTag}`}>
            {t}
          </span>
        ))}
      </div>

      <div className={styles.linksRow}>
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
          >
            <span>→ View on GitHub</span>
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.demoLink}
          >
            <span>→ Live Demo</span>
          </a>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <Link to={`/projects/${slugify(project.title)}`} className={styles.detailsLink}>
          View Details &rarr;
        </Link>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [projects, setProjects] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });
      if (!error && data) {
        setProjects(data);
      }
    }
    fetchProjects();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -364, behavior: 'smooth' }); // 340 width + 24 gap
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 364, behavior: 'smooth' });
    }
  };

  return (
    <section id="projects" className={styles.projects} ref={ref}>
      <div className="container">
        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Projects
        </motion.span>

        <motion.div
          className={styles.headingWrap}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div />
          <div className={styles.navButtons}>
            <button className={styles.navBtn} onClick={scrollLeft} aria-label="Scroll left">←</button>
            <button className={styles.navBtn} onClick={scrollRight} aria-label="Scroll right">→</button>
          </div>
        </motion.div>

        <div className={styles.scrollContainer} ref={scrollRef}>
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
