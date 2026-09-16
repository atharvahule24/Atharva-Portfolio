import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SplashScreen.module.css';

const NAME = 'ATHARVA HULE';

// Build words with letters so they remain together on small screens
let globalCounter = 0;
const structuredWords = NAME.split(' ').map((word, wordIdx) => {
  return {
    id: wordIdx,
    letters: word.split('').map((char) => ({
      char,
      globalIdx: globalCounter++,
      scramble: {
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 200,
        rotate: (Math.random() - 0.5) * 180,
        opacity: 0,
      },
    })),
  };
});

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('fly-in'); // fly-in | settled | exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('settled'), 800);
    const t2 = setTimeout(() => setPhase('exit'), 1300);
    const t3 = setTimeout(() => onComplete(), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className={styles.splash}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className={styles.nameContainer}>
            {structuredWords.map((wordObj) => (
              <div key={wordObj.id} className={styles.word}>
                {wordObj.letters.map((letter) => {
                  const delay = letter.globalIdx * 0.025;
                  const flyInTarget = { x: 0, y: 0, rotate: 0, opacity: 1 };
                  const settledTarget = { x: 0, y: 0, rotate: 0, opacity: 1 };
                  const exitTarget = { y: -60, opacity: 0 };

                  let animate;
                  if (phase === 'fly-in') animate = flyInTarget;
                  else if (phase === 'settled') animate = settledTarget;
                  else animate = exitTarget;

                  return (
                    <motion.span
                      key={letter.globalIdx}
                      className={styles.letter}
                      initial={letter.scramble}
                      animate={animate}
                      transition={
                        phase === 'exit'
                          ? { duration: 0.35, ease: [0.4, 0, 1, 1], delay: letter.globalIdx * 0.01 }
                          : {
                              type: 'spring',
                              stiffness: 160,
                              damping: 22,
                              delay,
                            }
                      }
                    >
                      {letter.char}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>

          <motion.div
            className={styles.sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'fly-in' ? 0 : phase === 'settled' ? 0.5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', letterSpacing: '3px' }}>
              PORTFOLIO 2025
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
