import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import NeuronCursor from './components/NeuronCursor';
import Navbar from './components/Navbar';

const HomePage = lazy(() => import('./pages/HomePage'));
const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const WritingPage = lazy(() => import('./pages/WritingPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Inner layout — has access to router context
function Layout({ darkMode, toggleDark }) {
  const location = useLocation();

  return (
    <>
      <Navbar darkMode={darkMode} toggleDark={toggleDark} />
      <AnimatePresence mode="wait">
        <Suspense fallback={<div style={{ background: 'var(--bg)', height: '100vh' }} />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/"               element={<HomePage />} />
            <Route path="/skills"         element={<SkillsPage />} />
            <Route path="/projects"       element={<ProjectsPage />} />
            <Route path="/writing"        element={<WritingPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/admin/*"        element={<AdminPage />} />
            <Route path="*"               element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [darkMode, setDarkMode]     = useState(false);

  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle('dark-mode', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = splashDone ? '' : 'hidden';
  }, [splashDone]);

  return (
    <BrowserRouter>
      <NeuronCursor />

      <AnimatePresence>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {splashDone && <Layout darkMode={darkMode} toggleDark={toggleDark} />}
    </BrowserRouter>
  );
}
