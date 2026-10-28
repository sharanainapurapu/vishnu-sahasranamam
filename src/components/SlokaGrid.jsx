import { getSectionTheme, SECTION_THEME } from '../utils/sectionTheme'
import { groupItemsBySection } from '../utils/slokaLabels'

// The single selection surface. Verses (tutorial) or bundles (non-tutorial) are
// shown as buttons, grouped by section.
//
// Interaction:
//   - Tap a verse → it plays immediately (single selection).
//   - Tap a second verse → the two define a range; everything between highlights,
//     and a "Play range" button (rendered by the parent) starts it.
//   - Tap again after a range is set → starts a fresh single selection.
// Ranges may cross sections (the grid is one ordered list). Disabled items
// (no audio yet) are shown greyed out and are not selectable.
const SlokaGrid = ({
  items, currentIndex, completed,
  selStart, selEnd,          // selection range as flat indices (selEnd may equal selStart)
  onTapItem,                 // (index) => void  — single tap handler
}) => {
  const groups = groupItemsBySection(items)
  const enabledCount = items.filter((it) => it.enabled).length
  const doneCount = completed.length
  const percent = enabledCount ? Math.round((doneCount / enabledCount) * 100) : 0

  const lo = selStart != null && selEnd != null ? Math.min(selStart, selEnd) : null
  const hi = selStart != null && selEnd != null ? Math.max(selStart, selEnd) : null
  const inRange = (i) => lo != null && i >= lo && i <= hi
  const isEndpoint = (i) => i === selStart || i === selEnd

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-serif font-medium text-lg text-ink-900">Verses</h3>
        <span className="text-sm text-ink-500">{doneCount} / {enabledCount} · {percent}%</span>
      </div>
      <p className="text-xs text-ink-500 mb-4">
        Tap a verse to select it, then press Play. Tap a second to set a range.
      </p>

      <div className="grid-scroll max-h-[300px] overflow-y-auto pr-1 space-y-4">
        {groups.map((g) => {
          const t = getSectionTheme(g.section)
          return (
            <div key={g.section}>
              <div className="text-xs font-semibold tracking-wide mb-2" style={{ color: t.text }}>
                {g.title}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {g.items.map(({ index, item }) => {
                  const isCurrent = index === currentIndex
                  const isDone = completed.includes(item.audioKey)
                  const endpoint = isEndpoint(index)
                  const within = inRange(index)
                  const label = item.start === item.end ? item.start : `${item.start}–${item.end}`

                  let cls
                  if (!item.enabled) {
                    cls = 'bg-paper-bg text-ink-400 opacity-40 border-paper-line cursor-not-allowed'
                  } else if (endpoint) {
                    cls = 'bg-ink-900 text-white border-ink-900'
                  } else if (within) {
                    cls = 'bg-saff-200 text-saff-700 border-saff-300'
                  } else if (isCurrent) {
                    cls = 'bg-ink-900 text-white border-ink-900'
                  } else if (isDone) {
                    cls = 'bg-saff-100 text-saff-700 border-saff-200'
                  } else {
                    cls = 'bg-paper-bg text-ink-500 border-paper-line hover:text-ink-900'
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => item.enabled && onTapItem(index)}
                      disabled={!item.enabled}
                      aria-pressed={endpoint || within || isCurrent}
                      title={item.enabled ? `Sloka ${label}` : 'Coming soon'}
                      className={`min-h-[40px] px-1 rounded-lg text-[13px] font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${cls}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-paper-line flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
        {Object.entries(SECTION_THEME).map(([sec, t]) => (
          <span key={sec} className="inline-flex items-center gap-1.5" style={{ color: t.text }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dot }} />
            {t.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default SlokaGrid
