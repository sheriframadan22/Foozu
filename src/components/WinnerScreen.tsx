import Confetti from './Confetti';
import { MAX_PRIZE } from '@/game/scoring';

interface Props {
  playerName: string;
  onPlayAgain: () => void;
}

export default function WinnerScreen({ playerName, onPlayAgain }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <Confetti />
      <div className="animate-popIn">
        <div className="font-display font-extrabold text-4xl sm:text-6xl text-foozu-yellow mb-2">YOU DID IT!</div>
        <div className="text-lg sm:text-xl text-white/80 mb-4">{playerName}</div>
        <div className="font-display font-black text-6xl sm:text-8xl text-foozu-pink drop-shadow-lg">{MAX_PRIZE}</div>
        <div className="text-xl sm:text-2xl font-bold text-white/80 -mt-1">EGP</div>
        <p dir="rtl" className="font-arabic text-2xl sm:text-3xl font-bold text-foozu-teal mt-4">
          كسبت الـ {MAX_PRIZE} جنيه!
        </p>
        <div className="flex items-center justify-center gap-1 font-display font-extrabold text-2xl text-white mt-8">
          <span>FOO</span>
          <img src="./brand/foozu-z-mark.png" alt="Z" className="h-6 w-auto" />
          <span>U</span>
        </div>
        <button
          onClick={onPlayAgain}
          className="touch-target mt-8 rounded-2xl bg-white/15 hover:bg-white/25 px-8 py-4 font-display font-bold text-lg active:scale-95 transition"
        >
          NEW GAME
        </button>
      </div>
    </div>
  );
}
