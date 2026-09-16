import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../supabaseClient';
import styles from './ProjectDetail.module.css';

const customComponents = {
  h1: ({ children }) => (
    <h1 style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '28px',
      fontWeight: 700,
      color: 'var(--readme-text-h)',
      marginTop: '32px',
      marginBottom: '12px'
    }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '22px',
      fontWeight: 700,
      color: 'var(--readme-text-h)',
      marginTop: '28px',
      marginBottom: '10px',
      borderBottom: '1px solid var(--readme-border)',
      paddingBottom: '8px'
    }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '13px',
      fontWeight: 500,
      color: '#78716C',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginTop: '24px',
      marginBottom: '8px'
    }}>{children}</h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontSize: '16px',
      lineHeight: '1.8',
      color: 'var(--readme-text-p)',
      marginBottom: '16px'
    }}>{children}</p>
  ),
  code: ({ inline, children }) => inline ? (
    <code style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '13px',
      background: 'var(--readme-surface-inline)',
      border: '1px solid var(--readme-border)',
      borderRadius: '4px',
      padding: '2px 6px',
      color: '#D97706'
    }}>{children}</code>
  ) : (
    <pre style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '13px',
      background: '#1C1917',
      color: '#FAF7F2',
      borderRadius: '8px',
      padding: '20px',
      overflowX: 'auto',
      marginBottom: '20px',
      lineHeight: '1.6'
    }}>
      <code>{children}</code>
    </pre>
  ),
  ul: ({ children }) => (
    <ul style={{
      paddingLeft: '20px',
      marginBottom: '16px',
      color: 'var(--readme-text-p)'
    }}>{children}</ul>
  ),
  li: ({ children }) => (
    <li style={{
      marginBottom: '6px',
      lineHeight: '1.7',
      fontSize: '16px'
    }}>{children}</li>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: '#D97706',
        textDecoration: 'none',
        borderBottom: '1px solid #D97706'
      }}
    >{children}</a>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '13px'
      }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      padding: '10px 14px',
      background: 'var(--readme-surface-inline)',
      border: '1px solid var(--readme-border-table)',
      color: 'var(--readme-text-h)',
      fontWeight: 500,
      textAlign: 'left'
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: '10px 14px',
      border: '1px solid var(--readme-border-table)',
      color: 'var(--readme-text-p)'
    }}>{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid #D97706',
      paddingLeft: '20px',
      margin: '20px 0',
      color: '#78716C',
      fontStyle: 'italic'
    }}>{children}</blockquote>
  ),
  img: ({ src, alt }) => {
    if (src?.includes('shields.io') || src?.includes('badge') || src?.includes('img.shields')) {
      return null;
    }
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          maxWidth: '100%',
          borderRadius: '8px',
          margin: '16px 0'
        }}
      />
    );
  },
  hr: () => (
    <hr style={{
      border: 'none',
      borderTop: '1px solid var(--readme-border)',
      margin: '32px 0'
    }} />
  )
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
};

const DEVICON_MAP = {
  'Python': 'python', 'Flask': 'flask', 'React': 'react', 'FastAPI': 'fastapi',
  'MongoDB': 'mongodb', 'OpenCV': 'opencv', 'SQLite': 'sqlite', 'Node.js': 'nodejs',
  'Express.js': 'express', 'TypeScript': 'typescript', 'Git': 'git', 'NumPy': 'numpy',
  'Matplotlib': 'matplotlib', 'Jupyter': 'jupyter', 'Vite': 'vitejs'
};

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // README State Hooks
  const [readmeOpen, setReadmeOpen] = useState(false);
  const [readmeContent, setReadmeContent] = useState(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [hasReadmeFailed, setHasReadmeFailed] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase.from('projects').select('*').order('order_index', { ascending: true });
      if (!error && data) {
        const projectIndex = data.findIndex(p => slugify(p.title) === slug);
        const found = data[projectIndex];
        if (found) {
          setProject({ ...found, displayRank: projectIndex + 1 });
          if (found.github_url) fetchGitHubStats(found.github_url);
        } else {
          navigate('/404', { replace: true });
        }
      } else {
        navigate('/404', { replace: true });
      }
      setLoading(false);
    }
    fetchProject();
  }, [slug, navigate]);

  const fetchGitHubStats = async (url) => {
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const [, owner, repo] = match;
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (res.ok) {
          const json = await res.json();
          setStats({
            stars: json.stargazers_count,
            forks: json.forks_count,
            updatedAt: json.updated_at
          });
        }
      }
    } catch (e) {}
  };

  const fetchReadme = async (owner, repo) => {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          headers: {
            Accept: 'application/vnd.github.v3.raw'
          }
        }
      );
      if (!res.ok) return null;
      const text = await res.text();
      return text;
    } catch {
      return null;
    }
  };

  const handleLoadReadme = async () => {
    if (readmeContent) {
      setReadmeOpen(prev => !prev);
      return;
    }

    if (!project?.github_url) return;
    const match = project.github_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, repo] = match;

    setReadmeLoading(true);
    const content = await fetchReadme(owner, repo);
    
    if (!content) {
      setHasReadmeFailed(true);
    } else {
      setReadmeContent(content);
      setReadmeOpen(true);
    }
    setReadmeLoading(false);
  };

  const getRelativeTime = (dateStr) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = new Date(dateStr) - new Date();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    return `Updated ${rtf.format(diffDays, 'day').replace('this day', 'today')}`;
  };

  if (loading) return null;
  if (!project) return null;

  return (
    <motion.main className={styles.container} {...fadeIn}>
      <div className={styles.inner}>
        {/* Header */}
        <Link to="/projects" className={styles.backBtn}>&larr; Projects</Link>
        <div className={styles.sectionLabel}>PROJECT DETAIL</div>
        
        <h1 className={styles.title}>
          <span className={styles.num}>{(project.displayRank || 1).toString().padStart(2, '0')}</span> {project.title}
        </h1>
        <p className={styles.subtitle}>{project.subtitle}</p>
        
        <div className={styles.statusBadgeWrapper}>
          <span className={`${styles.badge} ${project.status === 'In Progress' ? styles.badgeProgress : styles.badgeLive}`}>
            {project.status}
          </span>
        </div>

        <div className={styles.actions}>
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
              View on GitHub &rarr;
            </a>
          )}
          {project.demo_url && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className={styles.btnFilled}>
              Live Demo &rarr;
            </a>
          )}
        </div>

        <div className={styles.divider} />

        {/* Description */}
        <p className={styles.description}>{project.description}</p>

        {/* What I Built */}
        {project.bullets && project.bullets.length > 0 && (
          <div className={styles.section}>
            <div className={styles.label}>WHAT I BUILT</div>
            <div className={styles.bullets}>
              {project.bullets.map((bullet, i) => (
                <div key={i} className={styles.bulletItem}>
                  <span className={styles.bulletArrow}>&rarr;</span>
                  <span className={styles.bulletText}>{bullet}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className={styles.section}>
            <div className={styles.label}>TECH STACK</div>
            <div className={styles.techList}>
              {project.tech_stack.map(tech => {
                const iconSlug = DEVICON_MAP[tech];
                return (
                  <span key={tech} className={styles.techPill}>
                    {iconSlug && (
                      <img 
                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconSlug}/${iconSlug}-original.svg`} 
                        alt={tech} 
                        className={styles.techIcon}
                        loading="lazy"
                        width="16"
                        height="16"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    {tech}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Timeline */}
        {project.status === 'In Progress' && project.milestones && project.milestones.length > 0 && (
          <div className={styles.section}>
            <div className={styles.label}>BUILD PROGRESS</div>
            <div className={styles.timeline}>
              {project.milestones.map((ms, i) => (
                <div key={i} className={styles.milestone}>
                  {ms.status === 'done' && <span className={styles.msDone}>●</span>}
                  {ms.status === 'in_progress' && <span className={styles.msProgress}>●</span>}
                  {ms.status === 'planned' && <span className={styles.msPlanned}>○</span>}
                  <span className={`${styles.msLabel} ${styles[`msLabel_${ms.status}`]}`}>
                    {ms.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What I Learned */}
        {project.lessons && (
          <div className={styles.section}>
            <div className={styles.label}>WHAT I LEARNED</div>
            <p className={styles.lessons}>{project.lessons}</p>
          </div>
        )}

        {/* GitHub Live Stats */}
        {stats && (
          <div className={styles.section}>
            <div className={styles.label}>REPOSITORY</div>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>⭐</span> {stats.stars}
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>🍴</span> {stats.forks}
              </div>
              <div className={styles.statBox}>
                <span className={styles.statIcon}>🕐</span> {getRelativeTime(stats.updatedAt)}
              </div>
            </div>
          </div>
        )}

        {/* Technical Documentation Section */}
        {project.github_url && !hasReadmeFailed && (
          <div className={styles.section} style={{ marginTop: '40px' }}>
            <div style={{ 
              fontFamily: "'IBM Plex Mono', monospace", 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              color: '#64748b', 
              letterSpacing: '2px',
              marginBottom: '16px'
            }}>
              TECHNICAL DOCUMENTATION
            </div>
            
            <button
              onClick={handleLoadReadme}
              disabled={readmeLoading}
              style={{
                background: 'none',
                border: 'none',
                padding: '0',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: readmeLoading ? '#64748b' : '#D97706',
                cursor: readmeLoading ? 'default' : 'pointer',
                textDecoration: 'none',
                transition: 'border-bottom 0.2s ease',
                borderBottom: '1px solid transparent'
              }}
              onMouseEnter={(e) => !readmeLoading && (e.target.style.borderBottom = '1px solid #D97706')}
              onMouseLeave={(e) => (e.target.style.borderBottom = '1px solid transparent')}
            >
              {readmeLoading ? 'Fetching documentation...' : 
               (!readmeContent ? 'Load Full README ↓' : 
               (readmeOpen ? 'Collapse ↑' : 'Expand README ↓'))}
            </button>

            <AnimatePresence>
              {readmeOpen && readmeContent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: '24px',
                    padding: '32px',
                    background: 'var(--readme-bg)',
                    border: '1px solid var(--readme-border)',
                    borderRadius: '12px',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D97706 var(--readme-surface-inline)'
                  }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={customComponents}
                    >
                      {readmeContent}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.main>
  );
}
