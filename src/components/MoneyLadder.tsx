import { LEVELS } from '@/types/game';

interface Props {
  currentLevelIndex: number;
  securedAmount: number;
}

export default function MoneyLadder({ currentLevelIndex, securedAmount }: Props) {
  const rows = LEVELS.map((value, index) => ({ value, index })).reverse();

  return (
    <div className="w-full">
      <div className="flex flex-row lg:flex-col gap-2 lg:gap-1.5">
        {rows.map(({ value, index }) => {
          const isCleared = index < currentLevelIndex;
          const isCurrent = index === currentLevelIndex;
          return (
            <div
              key={value}
              className={[
                'flex-1 lg:flex-none rounded-xl lg:rounded-2xl px-3 py-2 lg:py-2.5 text-center font-display font-bold transition-all',
                isCurrent
                  ? 'bg-foozu-pink text-white shadow-glow scale-[1.03]'
                  : isCleared
                  ? 'bg-foozu-teal/25 text-foozu-teal border border-foozu-teal/40'
                  : 'bg-white/5 text-white/40 border border-white/10'
              ].join(' ')}
            >
              <div className="text-[10px] lg:text-xs uppercase tracking-widest opacity-70">Lvl {index + 1}</div>
              <div className="text-sm lg:text-base">{value} EGP</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 lg:mt-4 bg-white/10 rounded-xl lg:rounded-2xl px-3 py-2 text-center">
        <div className="text-[10px] uppercase tracking-widest text-white/50">Total Secured</div>
        <div className="font-display font-extrabold text-xl text-foozu-yellow">{securedAmount} EGP</div>
      </div>
    </div>
  );
}
