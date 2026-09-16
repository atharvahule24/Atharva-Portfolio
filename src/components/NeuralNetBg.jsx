import { useEffect, useRef } from 'react';

// Named neural network — 2 input, 3 hidden, 2 output
const NODES = {
  input: [
    { id: 'i1', x: 80,  y: 140, label: 'Knowledge',   align: 'right' },
    { id: 'i2', x: 80,  y: 280, label: 'Hard Work',   align: 'right' },
  ],
  hidden: [
    { id: 'h1', x: 320, y: 80,  label: 'Curiosity',   align: 'center' },
    { id: 'h2', x: 320, y: 210, label: 'Building',    align: 'center' },
    { id: 'h3', x: 320, y: 340, label: 'Consistency', align: 'center' },
  ],
  output: [
    { id: 'o1', x: 560, y: 150, label: 'Success', align: 'left' },
    { id: 'o2', x: 560, y: 270, label: 'Growth',  align: 'left' },
  ],
};

const ALL_NODES = [...NODES.input, ...NODES.hidden, ...NODES.output];

const CONNECTIONS = [];
// input → hidden
NODES.input.forEach(n => NODES.hidden.forEach(h => CONNECTIONS.push([n, h])));
// hidden → output
NODES.hidden.forEach(h => NODES.output.forEach(o => CONNECTIONS.push([h, o])));

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function NeuralNetBg({ speedMultiplier = 1, darkMode = false }) {
  const canvasRef = useRef(null);
  const animRef  = useRef(null);
  const particles = useRef([]);
  const time      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
      width  = canvas.width  = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Scale to fit virtual 680×420 space
    const scaleX = v => (v / 680) * width;
    const scaleY = v => (v / 420) * height;

    // Spawn particles
    const spawnParticle = (forward = true) => {
      const conn = CONNECTIONS[Math.floor(Math.random() * CONNECTIONS.length)];
      const [from, to] = forward ? conn : [conn[1], conn[0]];
      return {
        from,
        to,
        progress: 0,
        forward,
        speed: (0.003 + Math.random() * 0.002) * speedMultiplier,
        color: forward ? '#D97706' : '#4338CA',
      };
    };

    // Seed particles with random progress so they're already mid-flight
    for (let i = 0; i < 12; i++) {
      const p = spawnParticle(Math.random() > 0.4);
      p.progress = Math.random();
      particles.current.push(p);
    }

    let spawnTimer = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      time.current += 0.016;
      spawnTimer  += 0.016;

      if (spawnTimer > 0.5 && particles.current.length < 20) {
        particles.current.push(spawnParticle(Math.random() > 0.35));
        spawnTimer = 0;
      }

      // Colours adapt to dark/light — read from body class at draw time
      const isDark = document.body.classList.contains('dark-mode');
      const lineColor  = isDark ? 'rgba(200, 190, 175, 0.28)' : 'rgba(28, 25, 23, 0.28)';
      const nodeStroke = isDark ? 'rgba(200, 190, 175, 0.38)' : 'rgba(28, 25, 23, 0.38)';
      const nodeFill   = isDark ? 'rgba(15,  17,  22,  0.9)'  : 'rgba(245, 240, 232, 0.9)';
      const labelColor = isDark ? 'rgba(168, 162, 158, 0.65)' : 'rgba(120, 113, 108, 0.65)';

      // ── Connections ──────────────────────────────────────────────────────
      CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(scaleX(a.x), scaleY(a.y));
        const cx = scaleX((a.x + b.x) / 2);
        const cy = scaleY((a.y + b.y) / 2) + (Math.random() > 0.5 ? 6 : -6);
        ctx.quadraticCurveTo(cx, cy, scaleX(b.x), scaleY(b.y));
        ctx.strokeStyle = lineColor;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      });

      // ── Nodes + labels ───────────────────────────────────────────────────
      ALL_NODES.forEach(node => {
        const nx = scaleX(node.x);
        const ny = scaleY(node.y);

        // Circle
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.strokeStyle = nodeStroke;
        ctx.lineWidth   = 1.2;
        ctx.stroke();
        ctx.fillStyle = nodeFill;
        ctx.fill();

        // Label
        ctx.font         = '10px "IBM Plex Mono", monospace';
        ctx.fillStyle    = labelColor;
        ctx.textBaseline = 'middle';

        const pad = 14;
        if (node.align === 'right') {
          ctx.textAlign = 'right';
          ctx.fillText(node.label, nx - pad, ny);
        } else if (node.align === 'left') {
          ctx.textAlign = 'left';
          ctx.fillText(node.label, nx + pad, ny);
        } else {
          // center — draw below node
          ctx.textAlign    = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.label, nx, ny + 10);
        }
      });

      // ── Signal particles ─────────────────────────────────────────────────
      particles.current = particles.current.filter(p => {
        p.progress = Math.min(p.progress + p.speed * speedMultiplier, 1);
        const t = easeInOut(p.progress);
        const x = scaleX(p.from.x + (p.to.x - p.from.x) * t);
        const y = scaleY(p.from.y + (p.to.y - p.from.y) * t);

        // Glow halo
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 7.2);
        grad.addColorStop(0, p.color + 'E5');
        grad.addColorStop(1, p.color + '00');
        ctx.beginPath();
        ctx.arc(x, y, 7.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, 3.0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        return p.progress < 1;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.82,
        pointerEvents: 'none',
      }}
    />
  );
}
