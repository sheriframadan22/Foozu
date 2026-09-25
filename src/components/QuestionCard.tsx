import type { PreparedQuestion } from '@/types/question';
import Timer from './Timer';

interface Props {
  question: PreparedQuestion;
  onTimeExpire: () => void;
  timerActive: boolean;
}

/**
 * The contestant answers verbally — no options are ever shown on screen. The usher
 * listens, then taps REVEAL ANSWER (see RevealPanel) to check the answer and call it.
 */
export default function QuestionCard({ question, onTimeExpire, timerActive }: Props) {
  return (
    <div className="animate-slideUp bg-white/6 backdrop-blur border border-white/10 rounded-xl2 shadow-card p-5 sm:p-8 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">{question.category}</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-foozu-yellow">{question.value} EGP</div>
        </div>
        <Timer active={timerActive} onExpire={onTimeExpire} resetKey={question.id} />
      </div>

      <div>
        <p className="text-xl sm:text-3xl font-semibold leading-snug">{question.question_en}</p>
        <p dir="rtl" className="font-arabic text-lg sm:text-2xl text-white/80 leading-snug mt-3">
          {question.question_ar}
        </p>
      </div>
    </div>
  );
}
