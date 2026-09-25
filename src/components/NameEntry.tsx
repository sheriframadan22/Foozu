import { useState } from 'react';

interface Props {
  onStart: (name: string) => void;
}

export default function NameEntry({ onStart }: Props) {
  const [name, setName] = useState('');

  const submit = () => {
    if (name.trim().length === 0) return;
    onStart(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center animate-popIn">
      <div className="flex items-center justify-center gap-2 font-display font-extrabold text-5xl sm:text-7xl text-white mb-2">
        <span>FOO</span>
        <img src="./brand/foozu-z-mark.png" alt="Z" className="h-12 sm:h-16 w-auto" />
        <span>U</span>
      </div>
      <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-foozu-cyan font-semibold mb-3">
        Rewarding Every Moment
      </p>
      <p dir="rtl" className="font-arabic text-xl sm:text-2xl text-white/80 mb-8">
        اكسب مع FOOZU
      </p>

      <div className="w-full max-w-sm">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Contestant name / اسم اللاعب"
          className="w-full rounded-2xl bg-white/10 border-2 border-white/20 focus:border-foozu-pink outline-none px-5 py-4 text-lg text-center placeholder:text-white/40 touch-target"
        />
        <button
          onClick={submit}
          disabled={name.trim().length === 0}
          className="touch-target w-full mt-4 rounded-2xl bg-foozu-pink disabled:bg-white/10 disabled:text-white/30 font-display font-bold text-xl py-4 hover:brightness-110 active:scale-95 transition"
        >
          START GAME
        </button>
      </div>
    </div>
  );
}
