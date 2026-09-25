interface Props {
  onClick: () => void;
  label?: string;
}

/** Consistent back-navigation control used across every screen. */
export default function BackButton({ onClick, label = 'Back' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="touch-target flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition px-3 py-2 sm:px-4 text-sm font-semibold text-white/80 hover:text-white shrink-0"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ←
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
