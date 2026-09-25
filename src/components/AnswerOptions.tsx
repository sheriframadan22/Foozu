import type { QuestionOption } from '@/types/question';

interface Props {
  options: QuestionOption[];
  selectedIndex?: number;
  correctIndex?: number; // only passed once revealed
  revealed: boolean;
  disabled?: boolean;
  onSelect: (index: 0 | 1 | 2 | 3) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function AnswerOptions({ options, selectedIndex, correctIndex, revealed, disabled, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {options.map((opt, i) => {
        const isSelected = selectedIndex === i;
        const isCorrect = revealed && correctIndex === i;
        const isWrongSelected = revealed && isSelected && correctIndex !== i;

        let stateClasses = 'bg-white/8 border-white/15 hover:bg-white/14 hover:border-white/30';
        if (revealed) {
          if (isCorrect) stateClasses = 'bg-green-500/25 border-green-400 animate-popIn';
          else if (isWrongSelected) stateClasses = 'bg-foozu-red/25 border-foozu-red animate-shake';
          else stateClasses = 'bg-white/5 border-white/10 opacity-60';
        } else if (isSelected) {
          stateClasses = 'bg-foozu-pink/25 border-foozu-pink shadow-glow';
        }

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(i as 0 | 1 | 2 | 3)}
            className={`touch-target text-left rtl:text-right rounded-2xl border-2 px-4 py-3 sm:px-5 sm:py-4 transition-all duration-150 flex items-center gap-3 ${stateClasses} disabled:cursor-default`}
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-black/25 font-display font-bold text-sm shrink-0">
              {LETTERS[i]}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-base sm:text-lg leading-snug">{opt.en}</span>
              <span dir="rtl" className="block font-arabic text-sm sm:text-base text-white/70 leading-snug mt-0.5">
                {opt.ar}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
