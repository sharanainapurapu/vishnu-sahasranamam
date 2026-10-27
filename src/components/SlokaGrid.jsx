import { Check } from 'lucide-react'

const SlokaGrid = ({ slokas, currentIndex, completedSlokas, onSlokaSelect }) => {
  const total = slokas.length || 1
  const completedCount = completedSlokas.length
  const percent = Math.round((completedCount / total) * 100)

  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-7">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif font-medium text-xl text-ink-900">All verses</h3>
        <span className="text-sm text-ink-500">
          {completedCount} / {total} · {percent}%
        </span>
      </div>

      <div className="grid-scroll max-h-[280px] overflow-y-auto pr-1">
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-2">
          {slokas.map((sloka, index) => {
            const isCompleted = completedSlokas.includes(sloka.id)
            const isCurrent = index === currentIndex
            return (
              <button
                key={sloka.id}
                onClick={() => onSlokaSelect(index)}
                aria-pressed={isCurrent}
                title={`Sloka ${sloka.number}`}
                className={`aspect-square rounded-lg text-[13px] font-semibold relative border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
                  isCurrent
                    ? 'bg-ink-900 text-white border-ink-900'
                    : isCompleted
                    ? 'bg-saff-100 text-saff-700 border-saff-200'
                    : 'bg-paper-bg text-ink-500 border-paper-line hover:text-ink-900'
                }`}
              >
                {isCompleted && !isCurrent && (
                  <Check className="w-2.5 h-2.5 absolute top-0.5 right-0.5" />
                )}
                {sloka.number}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-paper-line flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500">
        <span>Pūrvapīṭhikā (1–23)</span>
        <span>Dhyānam (1–6)</span>
        <span>Sahasranāmam (1–108)</span>
        <span>Uttarapīṭhikā (1–14)</span>
      </div>
    </div>
  )
}

export default SlokaGrid
