import { Globe } from 'lucide-react'

const LanguageSelector = ({ languages, currentLanguage, onLanguageChange }) => {
  const languageEmojis = {
    sanskrit: '🕉️',
    tamil: '🇮🇳',
    telugu: '🇮🇳',
    kannada: '🇮🇳',
    malayalam: '🇮🇳',
    hindi: '🇮🇳',
    english: '🔤'
  }

  const languageLabels = {
    sanskrit: 'Sanskrit',
    tamil: 'Tamil',
    telugu: 'Telugu',
    kannada: 'Kannada',
    malayalam: 'Malayalam',
    hindi: 'Hindi',
    english: 'English'
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-800">Select Language</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`p-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              currentLanguage === lang
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">{languageEmojis[lang]}</div>
            <div className="text-xs">{languageLabels[lang]}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector
