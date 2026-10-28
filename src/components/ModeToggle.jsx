// Switch between the two audio modes.
//   - Tutorial     : per-sloka teaching clips; pick any From/To range.
//   - Non-tutorial : clips bundle ~6-7 slokas; you pick whole bundles only.
const MODES = [
  { key: 'tutorial', label: 'Tutorial', hint: 'Learn one verse at a time' },
  { key: 'nonTutorial', label: 'Non-tutorial', hint: 'Chant in grouped sets' },
]

const ModeToggle = ({ mode, onModeChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-ink-500">Mode</label>
    <div role="group" aria-label="Select mode" className="inline-flex gap-1 bg-paper-bg border border-paper-line rounded-xl p-1">
      {MODES.map((m) => {
        const active = mode === m.key
        return (
          <button
            key={m.key} type="button"
            onClick={() => onModeChange(m.key)}
            aria-pressed={active}
            title={m.hint}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
              active ? 'bg-paper-card text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  </div>
)

export default ModeToggle
