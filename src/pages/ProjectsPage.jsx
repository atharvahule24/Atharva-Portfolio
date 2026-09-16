import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeuralNetBg from '../components/NeuralNetBg';
import { supabase } from '../supabaseClient';
import styles from './ProjectsPage.module.css';

const projects = [
  {
    num: '01',
    title: 'Solar Power Prediction System',
    subtitle: 'Full-Stack Solar Energy Forecasting Platform',
    description:
      'A full-stack platform for forecasting solar power output using weather and solar irradiance data, with an interactive dashboard, prediction history, authentication, and an AI assistant.',
    tech: [
      'React',
      'Node.js',
      'Express',
      'FastAPI',
      'Python',
      'MongoDB',
      'Scikit-learn',
      'Groq API',
    ],
    github: 'https://github.com/atharvahule24',
    inProgress: false,
    color: '#D97706',
    built: [
      'Built a Random Forest regression model for solar power output forecasting',
      'Integrated weather and solar irradiance data including temperature, wind speed, and irradiance',
      'Developed an interactive dashboard for current and future predictions',
      'Added prediction history, filtering, sorting, data visualisation, and CSV export',
      'Implemented JWT authentication and REST APIs across the application stack',
      'Integrated a Groq-powered AI assistant for natural-language interaction with prediction data',
    ],
  },
  {
    num: '02',
    title: 'Green-Finance',
    subtitle: 'Real-Time Carbon & Energy Observability for Financial Microservices',
    description:
      'A team-based observability framework designed to monitor real-time energy consumption and carbon footprint across financial microservices such as payment processing and authentication.',
    tech: [
      'FastAPI',
      'Docker',
      'Kepler',
      'eBPF',
      'Prometheus',
      'Grafana',
    ],
    github: 'https://github.com/atharvahule24',
    inProgress: true,
    color: '#4338CA',
    built: [
      'Designed modular banking microservice logic using FastAPI',
      'Containerized financial services with Docker',
      'Integrated Kepler for kernel-level eBPF-based energy telemetry',
      'Applied Data Structures and DBMS concepts for telemetry handling and historical carbon auditing',
      'Used Computer Networks and Operating Systems concepts for microservice communication and energy tracking',
      'Built Grafana dashboards using Prometheus-aggregated data to report Carbon-per-Transaction',
    ],
  },
];

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const cardVariants = {
  offscreen: { y: 60, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.3,
      duration: 0.7,
    },
  },
};

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

export default function ProjectsPage() {
  const [data, setData] = useState(projects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: dbProjects, error } = await supabase
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true });

        if (!error && dbProjects && dbProjects.length > 0) {
          setData(
            dbProjects.map((p, i) => ({
              num: `0${i + 1}`.slice(-2),
              title: p.title,
              subtitle: p.subtitle,
              description: p.description,
              tech: p.tech_stack || [],
              github: p.github_url,
              demo: p.demo_url,
              inProgress:
                p.status === 'in progress' || p.status === 'In Progress',
              color:
                i === 0 ? '#D97706' : i === 1 ? '#4338CA' : '#1C1917',
              built: p.bullets || [],
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <motion.div className={styles.page} {...fadeIn}>
      <div className={styles.bgWrap}>
        <NeuralNetBg speedMultiplier={0.6} />
      </div>

      <div className={styles.inner}>
        <Link to="/" className={styles.back}>
          ← Back to Home
        </Link>

        <motion.span
          className="section-label"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Projects
        </motion.span>

        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          End-to-end projects built to solve practical problems and strengthen
          my understanding of software, data, and AI.
        </motion.p>

        {loading ? (
          <div className={styles.cards}>
            <div
              className={styles.skeletonCard}
              style={{
                height: 400,
                background: 'var(--stone)',
                opacity: 0.1,
                borderRadius: '8px',
              }}
            />

            <div
              className={styles.skeletonCard}
              style={{
                height: 400,
                background: 'var(--stone)',
                opacity: 0.1,
                borderRadius: '8px',
                marginTop: 20,
              }}
            />
          </div>
        ) : (
          <div className={styles.cards}>
            {data.map((p, i) => (
              <ProjectCard key={p.title} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      className={`${styles.card} ${
        hovered ? styles.cardHovered : ''
      }`}
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ amount: 0.15 }}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (e.target.closest('a')) return;

        window.location.href = `/projects/${slugify(project.title)}`;
      }}
      role="button"
      tabIndex={0}
    >
      {hovered && <div className={styles.signalBorder} />}

      <div className={styles.cardHeader}>
        <span
          className={styles.cardNum}
          style={{ color: project.color }}
        >
          {project.num}
        </span>

        <div>
          <div className={styles.titleRow}>
            <h2 className={styles.cardTitle}>
              {project.title}
            </h2>

            {project.inProgress && (
              <span className={styles.inProgressBadge}>
                In Progress
              </span>
            )}
          </div>

          <p className={styles.cardSubtitle}>
            {project.subtitle}
          </p>
        </div>
      </div>

      <div className={styles.cardDivider} />

      <p className={styles.cardDesc}>
        {project.description}
      </p>

      <div className={styles.builtSection}>
        <p className={styles.builtLabel}>
          What I built
        </p>

        <ul className={styles.builtList}>
          {project.built.map((item, i) => (
            <motion.li
              key={i}
              className={styles.builtItem}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.07,
                duration: 0.3,
              }}
            >
              <span
                className={styles.bullet}
                style={{ color: project.color }}
              >
                →
              </span>

              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.techRow}>
          {project.tech.map((tech) => (
            <span
              key={tech}
              className={`tag ${styles.techTag}`}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className={styles.linksRow}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
            >
              &rarr; View Source
            </a>
          )}

          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.demoLink}
            >
              &rarr; Live Demo
            </a>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '30px',
          borderTop: '1px solid var(--stone)',
          paddingTop: '20px',
        }}
      >
        <Link
          to={`/projects/${slugify(project.title)}`}
          className={styles.detailsLink}
        >
          View Details &rarr;
        </Link>
      </div>
    </motion.article>
  );
}