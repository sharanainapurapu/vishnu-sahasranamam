import { Target, Repeat } from 'lucide-react'
import { getSlokaLabel, groupSlokasBySection } from '../utils/slokaLabels'

const RangeSelector = ({
  slokas,
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  onStartPractice,
  repeatCount,
  onRepeatChange
}) => {
  const repeatOptions = [1, 3, 5, 10, 20]
  const groups = groupSlokasBySection(slokas)
  const startLabel = getSlokaLabel(slokas[rangeStart - 1])
  const endLabel = getSlokaLabel(slokas[rangeEnd - 1])

  // Option values are 1-based array positions (same entry the grid card selects);
  // labels come from the grid's own label. Grouped by section since numbers restart.
  const renderOptions = (minPosition) =>
    groups
      .map((group) => ({ ...group, items: group.items.filter((item) => item.position >= minPosition) }))
      .filter((group) => group.items.length > 0)
      .map((group) => (
        <optgroup key={group.section} label={group.title}>
          {group.items.map((item) => (
            <option key={item.position} value={item.position}>
              {item.label}
            </option>
          ))}
        </optgroup>
      ))

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-orange-600" />
        <h3 className="text-xl font-bold text-gray-800">Practice Range</h3>
      </div>

      {/* Range Selection: same entries, order and labels as the "All Slokas" grid */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="range-from" className="block text-sm font-semibold text-gray-700 mb-2">
            From Sloka:
          </label>
          <select
            id="range-from"
            value={rangeStart}
            onChange={(e) => {
              const start = Number(e.target.value)
              onRangeStartChange(start)
              if (start > rangeEnd) onRangeEndChange(start)
            }}
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none font-semibold text-lg"
          >
            {renderOptions(1)}
          </select>
        </div>

        <div>
          <label htmlFor="range-to" className="block text-sm font-semibold text-gray-700 mb-2">
            To Sloka:
          </label>
          <select
            id="range-to"
            value={rangeEnd}
            onChange={(e) => onRangeEndChange(Number(e.target.value))}
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none font-semibold text-lg"
          >
            {renderOptions(rangeStart)}
          </select>
        </div>
      </div>

      {/* Repeat Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Repeat className="w-5 h-5 text-purple-600" />
          <label className="block text-sm font-semibold text-gray-700">
            Repeat Each Sloka (times):
          </label>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {repeatOptions.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onRepeatChange(count)}
              aria-pressed={repeatCount === count}
              aria-label={`Repeat each sloka ${count} times`}
              className={`p-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                repeatCount === count
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Practice Info */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
        <div className="text-sm text-purple-800 space-y-1">
          <div className="font-semibold">📚 You will practice:</div>
          <div className="ml-4">
            • {startLabel} to {endLabel} ({rangeEnd - rangeStart + 1} slokas)
          </div>
          <div className="ml-4">
            • Each sloka {repeatCount} time{repeatCount > 1 ? 's' : ''}
          </div>
          <div className="ml-4 font-bold text-purple-900">
            • Total: {(rangeEnd - rangeStart + 1) * repeatCount} repetitions
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={onStartPractice}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
      >
        <span className="text-2xl">▶️</span>
        <span>Start Practice & Auto-Play</span>
      </button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="text-xs text-yellow-800">
          <strong>💡 Tip for Kids:</strong> Start with 1-5 slokas and repeat 3-5 times. 
          Practice daily for best results! 🌟
        </div>
      </div>
    </div>
  )
}

export default RangeSelector
