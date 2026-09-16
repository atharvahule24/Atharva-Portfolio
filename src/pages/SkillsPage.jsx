import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NeuralNetBg from '../components/NeuralNetBg';
import { supabase } from '../supabaseClient';
import styles from './SkillsPage.module.css';

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
    icon: '{ }',
    color: '#D97706',
    skills: ['Python', 'C++', 'C', 'SQL'],
  },
  {
    label: 'AI & Machine Learning',
    icon: '⬡',
    color: '#4338CA',
    skills: ['PyTorch', 'LangGraph', 'RAG', 'Agentic AI', 'Prompt Engineering'],
  },
  {
    label: 'Vector & Databases',
    icon: '◈',
    color: '#9333EA',
    skills: ['FAISS', 'ChromaDB', 'Vector Databases', 'SQLite'],
  },
  {
    label: 'Frameworks & Tools',
    icon: '⚙',
    color: '#059669',
    skills: ['Flask', 'FastAPI', 'React', 'Git', 'WebSockets'],
  },
];

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit:    { opacity: 0, transition: { duration: 0.3 } },
};

export default function SkillsPage() {
  const [data, setData] = useState(skillGroups);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: dbSkills, error } = await supabase
          .from('skills')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (!error && dbSkills && dbSkills.length > 0) {
          const grouped = dbSkills.reduce((acc, skill) => {
            if (!acc[skill.category]) acc[skill.category] = [];
            acc[skill.category].push(skill.name);
            return acc;
          }, {});

          const updatedGroups = [
            {
              label: 'Languages',
              icon: '{ }',
              color: '#D97706',
              skills: grouped['Languages'] || [],
            },
            {
              label: 'AI & Machine Learning',
              icon: '⬡',
              color: '#4338CA',
              skills: grouped['AI/ML'] || [],
            },
            {
              label: 'Frameworks & Tools',
              icon: '⚙',
              color: '#059669',
              skills: grouped['Frameworks & Tools'] || [],
            },
            {
              label: 'CS Fundamentals',
              icon: '◈',
              color: '#9333EA',
              skills: grouped['CS Fundamentals'] || [],
            },
          ];
          setData(updatedGroups);
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
        <NeuralNetBg speedMultiplier={0.5} />
      </div>

      <div className={styles.inner}>
        <Link to="/" className={styles.back}>← Back to Home</Link>

        <motion.span
          className="section-label"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Skills
        </motion.span>



        <motion.p
          className={styles.subheading}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          What I work with
        </motion.p>

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ height: 200, background: 'var(--stone)', opacity: 0.1, borderRadius: '8px' }} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {data.map((group, gi) => (
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
                {/* Group header */}
                <div className={styles.groupHeader}>
                  <span className={styles.groupIcon} style={{ color: group.color }}>
                    {group.icon}
                  </span>
                  <h2 className={styles.groupLabel}>{group.label}</h2>
                  <div className={styles.groupLine} style={{ background: group.color }} />
                </div>

                {/* Skill chips */}
                <div className={styles.chips}>
                  {group.skills.map((skill, si) => (
                    <motion.span
                      key={skill}
                      className={styles.chip}
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
        )}
      </div>
    </motion.div>
  );
}
