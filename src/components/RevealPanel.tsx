import type { PreparedQuestion } from '@/types/question';

interface Props {
  question: PreparedQuestion;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Shown once the usher has hit REVEAL ANSWER. The contestant answers verbally (this is
 * not a multiple-choice game), so this just shows the correct answer and lets the usher
 * judge what the contestant said against it.
 */
export default function RevealPanel({ question, onCorrect, onWrong }: Props) {
  const correctOpt = question.options[question.correctAnswer];
  return (
    <div className="animate-popIn mt-6 sm:mt-8 max-w-3xl mx-auto bg-black/30 border border-white/10 rounded-xl2 p-5 sm:p-6 text-center">
      <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Correct Answer</div>
      <div className="font-display font-extrabold text-xl sm:text-2xl text-green-400">{correctOpt.en}</div>
      <div dir="rtl" className="font-arabic text-white/70 mt-1">{correctOpt.ar}</div>

      {question.explanation_en && (
        <p className="text-sm text-white/60 mt-3 max-w-xl mx-auto">
          {question.explanation_en}
          {question.explanation_ar && <span dir="rtl" className="block font-arabic mt-1">{question.explanation_ar}</span>}
        </p>
      )}

      <p className="text-sm text-foozu-yellow mt-3">Usher: did the contestant say this?</p>

      <div className="flex gap-4 justify-center mt-5">
        <button
          onClick={onWrong}
          className="touch-target px-6 py-3 rounded-2xl bg-foozu-red font-display font-bold text-lg hover:brightness-110 active:scale-95 transition"
        >
          ✕ WRONG
        </button>
        <button
          onClick={onCorrect}
          className="touch-target px-6 py-3 rounded-2xl bg-green-500 font-display font-bold text-lg hover:brightness-110 active:scale-95 transition"
        >
          ✓ CORRECT
        </button>
      </div>
    </div>
  );
}
