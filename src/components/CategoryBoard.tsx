import { CATEGORIES } from '@/data/categoriesConfig';
import type { UsedSlot } from '@/types/game';
import { isSlotUsed } from '@/game/questionSelector';

interface Props {
  currentValue: number;
  usedSlots: UsedSlot[];
  onSelect: (categoryName: string) => void;
}

export default function CategoryBoard({ currentValue, usedSlots, onSelect }: Props) {
  return (
    <div>
      <div className="text-center mb-5 sm:mb-6">
        <div className="text-xs uppercase tracking-widest text-white/50">Current Level</div>
        <div className="font-display font-extrabold text-3xl sm:text-4xl text-foozu-yellow">{currentValue} EGP</div>
        <div dir="rtl" className="font-arabic text-white/60 mt-1">اختار الفئة</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const used = isSlotUsed(usedSlots, cat.name_en, currentValue);
          return (
            <button
              key={cat.key}
              type="button"
              disabled={used}
              onClick={() => onSelect(cat.name_en)}
              className={[
                'touch-target aspect-square sm:aspect-auto sm:h-32 rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1 transition-all duration-150',
                used
                  ? 'bg-white/5 border-white/10 opacity-35 cursor-not-allowed'
                  : 'border-white/15 hover:scale-[1.04] active:scale-95 shadow-card'
              ].join(' ')}
              style={!used ? { backgroundColor: `${cat.color}26`, borderColor: `${cat.color}80` } : undefined}
            >
              <span className="text-2xl sm:text-3xl">{cat.icon}</span>
              <span className="font-semibold text-xs sm:text-sm text-center leading-tight">{cat.name_en}</span>
              <span dir="rtl" className="font-arabic text-[11px] sm:text-xs text-white/70 text-center leading-tight">
                {cat.name_ar}
              </span>
              {used && <span className="text-[10px] text-white/40 mt-0.5">used</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
