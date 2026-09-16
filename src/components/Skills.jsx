import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './Skills.module.css';

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.95
  },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.25,
      ease: 'easeOut'
    }
  })
};

const skillGroups = [
  {
    label: 'Languages',
    skills: [
      'Python',
      'Java',
      'C',
      'SQL',
      'JavaScript',
      'HTML/CSS',
    ],
  },
  {
    label: 'Currently Exploring',
    skills: [
      'Machine Learning',
      'Scikit-learn',
      'PyTorch',
      'RAG',
      'LangGraph',
      'Agentic AI',
      'Prompt Engineering',
    ],
  },
  {
    label: 'Data & Databases',
    skills: [
      'Pandas',
      'NumPy',
      'MySQL',
      'MongoDB',
      'SQLite',
      'FAISS',
      'ChromaDB',
      'Vector Databases',
    ],
  },
  {
    label: 'Web & Backend',
    skills: [
      'React',
      'Node.js',
      'Express',
      'FastAPI',
      'Flask',
      'REST APIs',
      'WebSockets',
    ],
  },
  {
    label: 'Tools & Infrastructure',
    skills: [
      'Git',
      'Docker',
      'Supabase',
      'Prometheus',
      'Grafana',
      'Groq API',
    ],
  },
];

export default function Skills() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="skills" className={styles.skills} ref={ref}>
      <div className="container">
        <motion.span
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Skills
        </motion.span>



        <div className={styles.groups}>
          {skillGroups.map((group, gi) => (
            <motion.div
              key={group.label}
              className={styles.group}
              custom={gi}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{
                y: -6,
                boxShadow: '0 12px 40px var(--skill-card-glow)',
                borderColor: '#D97706',
                transition: { duration: 0.2, ease: 'easeOut' }
              }}
            >
              <div className={styles.groupLabel}>
                <span>{group.label}</span>
                <div className={styles.labelLine} />
              </div>
              <div className={styles.chips}>
                {group.skills.map((skill, si) => (
                  <motion.span
                    key={skill}
                    className={`tag ${styles.chip}`}
                    custom={si}
                    variants={tagVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{
                      scale: 1.08,
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      borderColor: '#D97706',
                      transition: { duration: 0.15 }
                    }}
                    style={{ cursor: 'default' }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
