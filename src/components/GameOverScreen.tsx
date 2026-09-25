import { formatRaffleNumber } from '@/utils/storage';

interface Props {
  playerName: string;
  prize: number;
  raffleNumber?: number;
  onPlayAgain: () => void;
}

export default function GameOverScreen({ playerName, prize, raffleNumber, onPlayAgain }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-popIn">
      <div className="font-display font-extrabold text-3xl sm:text-5xl text-white/80 mb-2 tracking-wide">GAME OVER</div>
      <div className="text-lg sm:text-xl text-white/70 mb-4">{playerName}</div>
      <p className="text-white/60 mb-1">You won</p>
      <div className="font-display font-black text-6xl sm:text-7xl text-foozu-teal drop-shadow-lg">{prize}</div>
      <div className="text-xl font-bold text-white/70 -mt-1 mb-4">EGP</div>
      <p dir="rtl" className="font-arabic text-xl sm:text-2xl font-bold text-white/80">
        هتخرج بـ {prize} جنيه
      </p>

      {!!raffleNumber && (
        <div className="mt-6 inline-block bg-foozu-cyan/15 border-2 border-foozu-cyan rounded-2xl px-6 py-4">
          <div className="text-xs uppercase tracking-widest text-foozu-cyan">Your Raffle Number</div>
          <div className="font-display font-black text-4xl sm:text-5xl text-white mt-1">
            {formatRaffleNumber(raffleNumber)}
          </div>
          <p className="text-xs text-white/60 mt-2">Keep this number — the JBL speaker raffle draw is at the end of the day!</p>
          <p dir="rtl" className="font-arabic text-xs text-white/60 mt-0.5">احتفظ بالرقم ده، السحب على السماعة آخر اليوم!</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 font-display font-extrabold text-2xl text-white mt-8">
        <span>FOO</span>
        <img src="./brand/foozu-z-mark.png" alt="Z" className="h-6 w-auto" />
        <span>U</span>
      </div>
      <button
        onClick={onPlayAgain}
        className="touch-target mt-8 rounded-2xl bg-foozu-pink px-8 py-4 font-display font-bold text-lg active:scale-95 hover:brightness-110 transition"
      >
        NEW GAME
      </button>
    </div>
  );
}
