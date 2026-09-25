import { useState } from 'react';
import { playerRegistryStore } from '@/utils/storage';
import type { PlayerRecord } from '@/types/player';
import BackButton from './BackButton';

interface Props {
  onStart: (name: string, phoneNumber: string, age: number) => void;
}

function timeAgo(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NameEntry({ onStart }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState<PlayerRecord | null>(null);

  const validate = (): string => {
    if (name.trim().length === 0) return 'Enter the contestant\'s name.';
    const digits = phone.trim().replace(/\D/g, '');
    if (digits.length < 8) return 'Enter a valid phone number.';
    const ageNum = Number(age);
    if (!age || !Number.isFinite(ageNum) || ageNum < 5 || ageNum > 100) return 'Enter a valid age.';
    return '';
  };

  const submit = () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    // Hard restriction: one play per phone number, no bypass. See src/utils/storage.ts.
    const existing = playerRegistryStore.find(phone);
    if (existing) {
      setDuplicate(existing);
      return;
    }
    onStart(name.trim(), phone.trim(), Number(age));
  };

  const useDifferentNumber = () => {
    setDuplicate(null);
    setPhone('');
  };

  if (duplicate) {
    return (
      <div className="min-h-[70vh] px-4">
        <div className="pt-2 pb-4">
          <BackButton onClick={useDifferentNumber} label="Back" />
        </div>
        <div className="flex flex-col items-center justify-center text-center animate-popIn">
          <div className="text-5xl mb-3">⚠️</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-foozu-yellow mb-2">Already Played</div>
          <p dir="rtl" className="font-arabic text-lg text-white/80 mb-4">الرقم ده لعب قبل كده — كل رقم يلعب مرة واحدة بس</p>

          <div className="w-full max-w-sm bg-white/8 border border-white/15 rounded-2xl p-4 text-left mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/50">Name on file</span>
              <span className="font-semibold">{duplicate.playerName}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/50">Played on</span>
              <span className="font-semibold">{timeAgo(duplicate.firstPlayedAt)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/50">Times played</span>
              <span className="font-semibold">{duplicate.timesPlayed}</span>
            </div>
            {duplicate.lastPrize !== undefined && (
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Last prize</span>
                <span className="font-semibold text-foozu-yellow">{duplicate.lastPrize} EGP</span>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm">
            <button
              onClick={useDifferentNumber}
              className="touch-target w-full rounded-2xl bg-foozu-pink font-display font-bold text-lg py-4 hover:brightness-110 active:scale-95 transition"
            >
              USE A DIFFERENT NUMBER
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="w-full max-w-sm space-y-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contestant name / اسم اللاعب"
          className="w-full rounded-2xl bg-white/10 border-2 border-white/20 focus:border-foozu-pink outline-none px-5 py-4 text-lg text-center placeholder:text-white/40 touch-target"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          placeholder="Phone number / رقم الموبايل"
          className="w-full rounded-2xl bg-white/10 border-2 border-white/20 focus:border-foozu-pink outline-none px-5 py-4 text-lg text-center placeholder:text-white/40 touch-target"
        />
        <input
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
          type="number"
          inputMode="numeric"
          min={5}
          max={100}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Age / السن"
          className="w-full rounded-2xl bg-white/10 border-2 border-white/20 focus:border-foozu-pink outline-none px-5 py-4 text-lg text-center placeholder:text-white/40 touch-target"
        />

        {error && <p className="text-foozu-red text-sm">{error}</p>}

        <button
          onClick={submit}
          className="touch-target w-full rounded-2xl bg-foozu-pink font-display font-bold text-xl py-4 hover:brightness-110 active:scale-95 transition"
        >
          START GAME
        </button>
      </div>
    </div>
  );
}
