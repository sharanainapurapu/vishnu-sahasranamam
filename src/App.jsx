import { useState, useEffect } from 'react'
import Player from './components/Player'
import SlokaDisplay from './components/SlokaDisplay'
import RangeSelector from './components/RangeSelector'
import SlokaGrid from './components/SlokaGrid'
import LanguageSelector from './components/LanguageSelector'
import { BookOpen } from 'lucide-react'

function App() {
  const [slokas, setSlokas] = useState([])
  const [currentSlokaIndex, setCurrentSlokaIndex] = useState(0)
  const [language, setLanguage] = useState('english')
  const [rangeMode, setRangeMode] = useState(false)
  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(10)
  const [repeatCount, setRepeatCount] = useState(1)
  const [completedSlokas, setCompletedSlokas] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [autoPlay, setAutoPlay] = useState(false)

  // Load slokas from JSON
  useEffect(() => {
    // Use import.meta.env.BASE_URL to work in both dev and production
    const basePath = import.meta.env.BASE_URL || '/'
    fetch(`${basePath}data/slokas-complete.json`)
      .then(res => res.json())
      .then(data => {
        setSlokas(data.slokas)
        setMetadata(data.metadata)
      })
      .catch(error => {
        console.error('Error loading slokas:', error)
      })
  }, [])

  // Load completed slokas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedSlokas')
    if (saved) {
      setCompletedSlokas(JSON.parse(saved))
    }
  }, [])

  // Save completed slokas to localStorage
  useEffect(() => {
    localStorage.setItem('completedSlokas', JSON.stringify(completedSlokas))
  }, [completedSlokas])

  const handleSlokaComplete = (slokaId) => {
    if (!completedSlokas.includes(slokaId)) {
      setCompletedSlokas([...completedSlokas, slokaId])
    }
  }

  const handleSlokaSelect = (index) => {
    setCurrentSlokaIndex(index)
    setRangeMode(false)
  }

  const currentSloka = slokas[currentSlokaIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-yellow-300" />
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Vishnu Sahasranamam
            </h1>
          </div>
          <p className="text-xl text-yellow-200 font-semibold">Learning App for Kids 🕉️</p>
          {metadata && (
            <p className="text-sm text-white/80 mt-2">
              Total Slokas: {metadata.totalSlokas} | Source: {metadata.source}
            </p>
          )}
        </div>

        {/* Language Selector */}
        <LanguageSelector
          languages={metadata?.languages || []}
          currentLanguage={language}
          onLanguageChange={setLanguage}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Player Area - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sloka Display */}
            {currentSloka && (
              <SlokaDisplay
                sloka={currentSloka}
                language={language}
              />
            )}

            {/* Player Controls */}
            {currentSloka && (
              <Player
                sloka={currentSloka}
                slokas={slokas}
                currentIndex={currentSlokaIndex}
                onPrevious={() => setCurrentSlokaIndex(Math.max(0, currentSlokaIndex - 1))}
                onNext={() => setCurrentSlokaIndex(Math.min(slokas.length - 1, currentSlokaIndex + 1))}
                onSlokaComplete={handleSlokaComplete}
                repeatCount={repeatCount}
                setRepeatCount={setRepeatCount}
                rangeMode={rangeMode}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                autoPlay={autoPlay}
                setAutoPlay={setAutoPlay}
              />
            )}
          </div>

          {/* Sidebar - Range Selector */}
          <div className="lg:col-span-1">
            <RangeSelector
              totalSlokas={slokas.length}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onRangeStartChange={setRangeStart}
              onRangeEndChange={setRangeEnd}
              onStartPractice={() => {
                setRangeMode(true)
                setCurrentSlokaIndex(rangeStart - 1)
                setAutoPlay(true)  // Signal to auto-play
              }}
              repeatCount={repeatCount}
              onRepeatChange={setRepeatCount}
            />
          </div>
        </div>

        {/* Sloka Grid */}
        <SlokaGrid
          slokas={slokas}
          currentIndex={currentSlokaIndex}
          completedSlokas={completedSlokas}
          onSlokaSelect={handleSlokaSelect}
        />
      </div>
    </div>
  )
}

export default App
