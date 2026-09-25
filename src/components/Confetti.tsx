import { useMemo } from 'react';

const COLORS = ['#FF4F8B', '#FF8A3D', '#1FC8B4', '#FFC23D', '#7B6CFF', '#E8505B'];

export default function Confetti({ pieces = 80 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360
      })),
    [pieces]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden="true">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 rounded-sm animate-confettiFall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`
          }}
        />
      ))}
    </div>
  );
}
