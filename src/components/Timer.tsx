import { useEffect, useRef, useState } from 'react';
import { QUESTION_SECONDS, isUrgent } from '@/game/timer';

interface Props {
  active: boolean;
  onExpire: () => void;
  /** Bump this to force-restart the timer (e.g. new question id). */
  resetKey: string;
}

export default function Timer({ active, onExpire, resetKey }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const expiredRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(QUESTION_SECONDS);
    expiredRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (!active) return;
    if (secondsLeft <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, secondsLeft, onExpire]);

  const urgent = isUrgent(secondsLeft);
  const pct = Math.max(0, secondsLeft / QUESTION_SECONDS);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={[
          'relative flex items-center justify-center rounded-full w-20 h-20 sm:w-24 sm:h-24 border-4 font-display font-extrabold text-3xl sm:text-4xl transition-colors',
          urgent ? 'border-foozu-red text-foozu-red animate-pulseGlow' : 'border-foozu-teal text-white'
        ].join(' ')}
        role="timer"
        aria-live="assertive"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={urgent ? '#E8505B' : '#1FC8B4'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className={urgent ? 'animate-flashRed' : ''}>{Math.max(0, secondsLeft)}</span>
      </div>
      <span className="text-[11px] uppercase tracking-widest text-white/50">seconds</span>
    </div>
  );
}
