import ModeToggle from './ModeToggle'
import LanguageSelector from './LanguageSelector'
import SlokaGrid from './SlokaGrid'
import { getItemLabel } from '../utils/slokaLabels'
import { SHOW_LANGUAGES } from '../config'

// Card 2 — everything you choose from: mode, language, and the verse grid that
// doubles as the selector. A "Play range" button appears only once a two-verse
// range is set (a single tap plays immediately, so it needs no button).
const SelectionCard = ({
  mode, onModeChange,
  language, onLanguageChange,
  items, currentIndex, completed,
  selStart, selEnd, onTapItem, onPlayRange, onPlaySingle,
}) => {
  const hasSelection = selStart != null && selEnd != null
  const hasRange = hasSelection && selStart !== selEnd
  const lo = hasSelection ? Math.min(selStart, selEnd) : null
  const hi = hasSelection ? Math.max(selStart, selEnd) : null

  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-5 sm:p-7 space-y-6">
      <div className="flex flex-col gap-4">
        <ModeToggle mode={mode} onModeChange={onModeChange} />
        {SHOW_LANGUAGES && (
          <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
        )}
      </div>

      <div className="pt-2 border-t border-paper-line">
        <div className="mt-4">
          <SlokaGrid
            items={items}
            currentIndex={currentIndex}
            completed={completed}
            selStart={selStart}
            selEnd={selEnd}
            onTapItem={onTapItem}
          />
        </div>

        {hasSelection && (
          <button
            onClick={hasRange ? onPlayRange : onPlaySingle}
            className="mt-4 w-full py-3 rounded-lg bg-ink-900 text-white text-[15px] font-semibold hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500"
          >
            {hasRange
              ? `Play ${getItemLabel(items[lo])}–${getItemLabel(items[hi])} · repeat ∞`
              : `Play ${getItemLabel(items[lo])}`}
          </button>
        )}
      </div>
    </div>
  )
}

export default SelectionCard
