interface Props {
  playerName?: string;
  securedAmount?: number;
  compact?: boolean;
}

export default function BrandHeader({ playerName, securedAmount, compact }: Props) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center font-display font-extrabold tracking-tight text-white ${compact ? 'text-2xl gap-0.5' : 'text-3xl sm:text-4xl gap-1'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          <span>FOO</span>
          <img
            src="./brand/foozu-z-mark.png"
            alt="Z"
            className={compact ? 'h-6 sm:h-7 w-auto' : 'h-8 sm:h-10 w-auto'}
          />
          <span>U</span>
        </div>
        {!compact && (
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-widest text-foozu-cyan font-semibold">Rewarding Every Moment</span>
            <span className="text-xs text-white/50 font-arabic mt-0.5">اكسب مع فوزو</span>
          </span>
        )}
      </div>
      {playerName ? (
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-white/50">Player</div>
            <div className="font-bold text-sm sm:text-base truncate max-w-[140px]">{playerName}</div>
          </div>
          {securedAmount !== undefined && (
            <div className="text-right bg-white/10 rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2">
              <div className="text-[10px] uppercase tracking-widest text-white/50">Secured</div>
              <div className="font-display font-extrabold text-lg sm:text-xl text-foozu-yellow">{securedAmount} EGP</div>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}
