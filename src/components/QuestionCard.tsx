import type { PreparedQuestion } from '@/types/question';
import AnswerOptions from './AnswerOptions';
import Timer from './Timer';

interface Props {
  question: PreparedQuestion;
  selectedIndex?: number;
  revealed: boolean;
  onSelect: (index: 0 | 1 | 2 | 3) => void;
  onTimeExpire: () => void;
  timerActive: boolean;
}

export default function QuestionCard({ question, selectedIndex, revealed, onSelect, onTimeExpire, timerActive }: Props) {
  return (
    <div className="animate-slideUp bg-white/6 backdrop-blur border border-white/10 rounded-xl2 shadow-card p-5 sm:p-8 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">{question.category}</div>
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-foozu-yellow">{question.value} EGP</div>
        </div>
        <Timer active={timerActive} onExpire={onTimeExpire} resetKey={question.id} />
      </div>

      <div className="mb-6 sm:mb-8">
        <p className="text-lg sm:text-2xl font-semibold leading-snug">{question.question_en}</p>
        <p dir="rtl" className="font-arabic text-base sm:text-xl text-white/80 leading-snug mt-2">
          {question.question_ar}
        </p>
      </div>

      <AnswerOptions
        options={question.options}
        selectedIndex={selectedIndex}
        correctIndex={revealed ? question.correctAnswer : undefined}
        revealed={revealed}
        disabled={revealed}
        onSelect={onSelect}
      />
    </div>
  );
}
