import { useEffect, useRef, useState } from 'react';
import styles from './NeuronCursor.module.css';

export default function NeuronCursor() {
  const cursorRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isDark, setIsDark]   = useState(() => document.body.classList.contains('dark-mode'));
  const rafRef = useRef(null);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.body.classList.contains('dark-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onEnter = (e) => {
      if (
        e.target.tagName === 'A' || 
        e.target.tagName === 'BUTTON' || 
        e.target.closest('a') || 
        e.target.closest('button') || 
        e.target.closest('[class*="certItem"]')
      ) {
        setHovered(true);
      }
    };

    const onLeave = () => setHovered(false);

    const onClick = () => {
      setClicked(true);
      setTimeout(() => setClicked(false), 400);
    };

    const animate = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnter);
    document.addEventListener('mouseout', onLeave);
    document.addEventListener('click', onClick);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('mouseout', onLeave);
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const color = isDark ? '#FAF7F2' : '#1C1917';
  const accent = '#D97706';

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursor} ${clicked ? styles.clicked : ''}`}
      style={{ '--cur-color': color }}
    >
      <svg
        width="48"
        height="48"
        viewBox="-24 -24 48 48"
        style={{ overflow: 'visible' }}
      >
        <g 
          className={styles.neuronGroup} 
          style={{
            transform: hovered ? 'scale(1.15) rotate(10deg)' : 'scale(1) rotate(0deg)',
            transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Axon (Longest, trailing behind) */}
          <path 
            d="M 0,0 Q -8,-12 -18,-14 T -28,-18" 
            fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" 
            opacity={hovered ? 0.9 : 0.6}
            style={{ transition: 'opacity 0.3s ease' }}
          />
          
          {/* Dendrite 1 */}
          <path 
            d="M 0,0 Q 10,-8 14,-4" 
            fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" 
            opacity={hovered ? 0.9 : 0.5}
            style={{ transition: 'opacity 0.3s ease' }}
          />
          
          {/* Dendrite 2 */}
          <path 
            d="M 0,0 Q 12,8 8,14" 
            fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" 
            opacity={hovered ? 0.9 : 0.5}
            style={{ transition: 'opacity 0.3s ease' }}
          />
          
          {/* Dendrite 3 */}
          <path 
            d="M 0,0 Q -6,10 -12,8" 
            fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" 
            opacity={hovered ? 0.9 : 0.5}
            style={{ transition: 'opacity 0.3s ease' }}
          />

          {/* Cell Body (Soma) */}
          <circle 
            cx="0" cy="0" 
            r={hovered ? 5 : 4} 
            fill={isDark ? '#0D1117' : '#F5F0E8'} 
            stroke={color} 
            strokeWidth="2" 
            style={{ transition: 'all 0.3s ease' }} 
          />
          
          {/* Nucleus */}
          <circle 
            cx="0" cy="0" 
            r="1.5" 
            fill={hovered ? accent : color} 
            style={{ transition: 'fill 0.3s ease' }} 
          />
          
        </g>
        
        {/* Synaptic flash on click */}
        {clicked && (
          <circle
            cx="0" cy="0"
            r="16"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            className={styles.flash}
          />
        )}
      </svg>
    </div>
  );
}
