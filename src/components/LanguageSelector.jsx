import { ALL_LANGUAGES, isLanguageEnabled } from '../config'

const LABELS = {
  english: 'English', telugu: 'Telugu', tamil: 'Tamil', kannada: 'Kannada',
  malayalam: 'Malayalam', hindi: 'Hindi', gujarati: 'Gujarati',
  bengali: 'Bengali', oriya: 'Oriya', punjabi: 'Punjabi',
}

// Language switcher. English (transliteration) is enabled first; the rest are
// shown but disabled until their scripts are ready.
const LanguageSelector = ({ currentLanguage, onLanguageChange }) => (
  <div className="flex flex-col gap-1 min-w-0 w-full">
    <label className="text-xs text-ink-500">Language</label>
    <div
      role="group" aria-label="Select language"
      className="flex items-center gap-1 bg-paper-bg border border-paper-line rounded-full p-1 overflow-x-auto no-scrollbar max-w-full"
    >
      {ALL_LANGUAGES.map((lang) => {
        const enabled = isLanguageEnabled(lang)
        const active = currentLanguage === lang
        return (
          <button
            key={lang} type="button"
            onClick={() => enabled && onLanguageChange(lang)}
            disabled={!enabled}
            aria-pressed={active}
            aria-label={enabled ? LABELS[lang] : `${LABELS[lang] || lang}, coming soon`}
            title={enabled ? undefined : 'Coming soon'}
            className={`shrink-0 whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
              !enabled ? 'text-ink-400 opacity-40 cursor-not-allowed'
              : active ? 'bg-ink-900 text-white'
              : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {LABELS[lang] || lang}
          </button>
        )
      })}
    </div>
    {ALL_LANGUAGES.some((l) => !isLanguageEnabled(l)) && (
      <p className="text-xs text-ink-500">Other languages coming soon.</p>
    )}
  </div>
)

export default LanguageSelector
