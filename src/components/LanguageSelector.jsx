const LABELS = {
  sanskrit: 'Sanskrit', tamil: 'Tamil', telugu: 'Telugu', kannada: 'Kannada',
  malayalam: 'Malayalam', hindi: 'Hindi', english: 'English',
}

const LanguageSelector = ({ languages, currentLanguage, onLanguageChange }) => {
  return (
    <div
      role="group"
      aria-label="Select language"
      className="flex items-center gap-1 bg-paper-card border border-paper-line rounded-full p-1 overflow-x-auto no-scrollbar"
    >
      {languages.map((lang) => {
        const active = currentLanguage === lang
        return (
          <button
            key={lang}
            type="button"
            onClick={() => onLanguageChange(lang)}
            aria-pressed={active}
            className={`shrink-0 whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
              active ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {LABELS[lang] || lang}
          </button>
        )
      })}
    </div>
  )
}

export default LanguageSelector
