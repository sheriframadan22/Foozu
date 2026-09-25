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
          className={`font-display font-extrabold tracking-tight ${compact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-foozu-pink">FOO</span>
          <span className="text-foozu-teal">ZU</span>
        </div>
        {!compact && <span className="hidden sm:inline text-xs text-white/50 font-arabic">اكسب مع فوزو</span>}
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
