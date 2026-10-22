const SlokaDisplay = ({ sloka, language }) => {
  const getLanguageClass = (lang) => {
    return `sloka-text-${lang}`
  }

  const slokaText = sloka?.text?.[language] || sloka?.text?.sanskrit || ''

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10">
      {/* Section Badge */}
      <div className="flex justify-center mb-6">
        <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
          {sloka.section}
        </span>
      </div>

      {/* Sloka Text */}
      <div className={`text-center text-2xl md:text-3xl lg:text-4xl leading-relaxed ${getLanguageClass(language)}`}>
        <pre className="font-inherit whitespace-pre-wrap break-words">
          {slokaText}
        </pre>
      </div>

      {/* Language Label */}
      <div className="mt-6 text-center">
        <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold capitalize">
          {language}
        </span>
      </div>
    </div>
  )
}

export default SlokaDisplay
