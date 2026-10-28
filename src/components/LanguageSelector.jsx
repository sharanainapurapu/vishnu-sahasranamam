const LABELS = {
  sanskrit: 'Sanskrit', tamil: 'Tamil', telugu: 'Telugu', kannada: 'Kannada',
  malayalam: 'Malayalam', hindi: 'Hindi', english: 'English',
}

// Only English is enabled for now; other scripts are shown but disabled.
// Add codes here to re-enable them later.
const ENABLED_LANGUAGES = ['english']

const LanguageSelector = ({ languages, currentLanguage, onLanguageChange }) => {
  // Pin English first, keep the rest in their given order.
  const ordered = [
    ...languages.filter((l) => l === 'english'),
    ...languages.filter((l) => l !== 'english'),
  ]

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <div
        role="group"
        aria-label="Select language"
        className="flex items-center gap-1 bg-paper-card border border-paper-line rounded-full p-1 overflow-x-auto no-scrollbar"
      >
        {ordered.map((lang) => {
          const enabled = ENABLED_LANGUAGES.includes(lang)
          const active = currentLanguage === lang
          return (
            <button
              key={lang}
              type="button"
              onClick={() => enabled && onLanguageChange(lang)}
              disabled={!enabled}
              aria-pressed={active}
              aria-label={enabled ? LABELS[lang] : `${LABELS[lang] || lang}, coming soon`}
              title={enabled ? undefined : 'Coming soon'}
              className={`shrink-0 whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
                !enabled
                  ? 'text-ink-400 opacity-40 cursor-not-allowed'
                  : active
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {LABELS[lang] || lang}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-ink-500 pr-1">Other languages coming soon.</p>
    </div>
  )
}

export default LanguageSelector
