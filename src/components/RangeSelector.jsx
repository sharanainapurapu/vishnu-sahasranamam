import { getSlokaLabel, groupSlokasBySection } from '../utils/slokaLabels'
import { getSectionTheme } from '../utils/sectionTheme'

const RangeSelector = ({
  slokas, rangeStart, rangeEnd,
  onRangeStartChange, onRangeEndChange, onStartPractice,
  repeatCount, onRepeatChange,
}) => {
  const repeatOptions = [1, 3, 5, 10, Infinity]
  const groups = groupSlokasBySection(slokas)
  const startLabel = getSlokaLabel(slokas[rangeStart - 1])
  const endLabel = getSlokaLabel(slokas[rangeEnd - 1])
  const total = (rangeEnd - rangeStart + 1) * repeatCount

  const renderOptions = (minPosition) =>
    groups
      .map((g) => ({ ...g, items: g.items.filter((it) => it.position >= minPosition) }))
      .filter((g) => g.items.length > 0)
      .map((g) => {
        const t = getSectionTheme(g.section)
        return (
          <optgroup key={g.section} label={`● ${g.title}`} style={{ color: t.text }}>
            {g.items.map((it) => (
              <option key={it.position} value={it.position} style={{ color: '#1c1b19' }}>
                {it.label}
              </option>
            ))}
          </optgroup>
        )
      })

  const selectClass =
    'w-full p-2.5 border border-paper-line rounded-lg bg-paper-card text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-saff-500'

  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-7">
      <div className="w-7 h-0.5 bg-saff-500 mb-4" />
      <h3 className="font-serif font-medium text-xl text-ink-900 mb-5">Practice Range</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="range-from" className="block text-xs text-ink-500 mb-1.5">From</label>
          <select
            id="range-from"
            value={rangeStart}
            onChange={(e) => {
              const start = Number(e.target.value)
              onRangeStartChange(start)
              if (start > rangeEnd) onRangeEndChange(start)
            }}
            className={selectClass}
          >
            {renderOptions(1)}
          </select>
        </div>
        <div>
          <label htmlFor="range-to" className="block text-xs text-ink-500 mb-1.5">To</label>
          <select
            id="range-to"
            value={rangeEnd}
            onChange={(e) => onRangeEndChange(Number(e.target.value))}
            className={selectClass}
          >
            {renderOptions(rangeStart)}
          </select>
        </div>
      </div>

      <label className="block text-xs text-ink-500 mt-5 mb-2">Repeat whole range</label>
      <div className="grid grid-cols-5 gap-1.5">
        {repeatOptions.map((count) => {
          const isInf = !Number.isFinite(count)
          return (
            <button
              key={isInf ? 'inf' : count}
              type="button"
              onClick={() => onRepeatChange(count)}
              aria-pressed={repeatCount === count}
              aria-label={isInf ? 'Repeat the whole range forever' : `Repeat the whole range ${count} times`}
              title={isInf ? 'Repeat forever' : undefined}
              className={`py-2.5 min-h-[44px] rounded-lg text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
                repeatCount === count
                  ? 'bg-saff-500 text-white border-saff-500'
                  : 'bg-paper-card text-ink-500 border-paper-line hover:text-ink-900'
              }`}
            >
              {isInf ? '∞' : count}
            </button>
          )
        })}
      </div>

      <p className="text-sm text-ink-500 leading-relaxed mt-4">
        {startLabel} to {endLabel},{' '}
        {!Number.isFinite(repeatCount)
          ? 'repeating forever'
          : repeatCount === 1
          ? 'one full round'
          : `${repeatCount} rounds`}
        .{' '}
        {Number.isFinite(repeatCount) && (
          <span className="font-semibold text-ink-900">{total} verses total.</span>
        )}
      </p>

      <button
        onClick={onStartPractice}
        className="mt-4 w-full py-3 rounded-lg bg-ink-900 text-white text-[15px] font-semibold hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500"
      >
        Start practice
      </button>
    </div>
  )
}

export default RangeSelector
