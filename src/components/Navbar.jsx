import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

// Dedicated page links — click navigates to a route
const PAGE_LINKS = [
  { label: 'Skills',         path: '/skills'         },
  { label: 'Projects',       path: '/projects'       },
  { label: 'Writing',        path: '/writing'        },
  { label: 'Certifications', path: '/certifications' },
];

// Scroll links — only work on home (/), navigate home first if needed
const SCROLL_LINKS = [
  { label: 'About',   id: 'about'   },
  { label: 'Contact', id: 'contact' },
];

export default function Navbar({ darkMode, toggleDark }) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const onHome    = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth-scroll to a section — navigate home first if not already there
  const scrollTo = (id) => {
    setMenuOpen(false);
    if (onHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      // Wait for navigation + render, then scroll
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 450);
    }
  };

  const go = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.inner}>
        {/* Brand — always goes home */}
        <NavLink to="/" className={styles.brand}>
            <img src="/icon-192x192.png" alt="" className={styles.brandIcon} />
            <span>Atharva Hule</span>
        </NavLink>

        {/* Desktop links */}
        <ul className={styles.links}>
          {/* Scroll links (About, Contact) */}
          {SCROLL_LINKS.map(({ label, id }) => (
            <li key={id}>
              <button
                className={styles.link}
                onClick={() => scrollTo(id)}
              >
                {label}
              </button>
            </li>
          ))}

          {/* Separator dot */}
          

          {/* Page links (Skills, Projects, Certifications) */}
          {PAGE_LINKS.map(({ label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}

          <li>
            <button
              className={styles.darkToggle}
              onClick={toggleDark}
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '☀' : '◑'}
            </button>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className={styles.burger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span className={menuOpen ? styles.burgerX  : ''} />
          <span className={menuOpen ? styles.burgerX2 : ''} />
          <span className={menuOpen ? styles.burgerX3 : ''} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {SCROLL_LINKS.map(({ label, id }) => (
              <button key={id} className={styles.mobileLink} onClick={() => scrollTo(id)}>
                {label}
              </button>
            ))}
            {PAGE_LINKS.map(({ label, path }) => (
              <button key={path} className={styles.mobileLink} onClick={() => go(path)}>
                {label}
              </button>
            ))}
            <button className={styles.mobileLink} onClick={toggleDark}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
