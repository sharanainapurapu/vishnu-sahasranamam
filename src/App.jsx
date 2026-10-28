import { useState, useEffect } from 'react'
import Player from './components/Player'
import SlokaDisplay from './components/SlokaDisplay'
import RangeSelector from './components/RangeSelector'
import SlokaGrid from './components/SlokaGrid'
import LanguageSelector from './components/LanguageSelector'
import { SHOW_LANGUAGES, isSlokaEnabled } from './config'

const SWAMIJI_IMG = `${import.meta.env.BASE_URL}images/swamiji.png`

function App() {
  const [slokas, setSlokas] = useState([])
  const [currentSlokaIndex, setCurrentSlokaIndex] = useState(0)
  const [language, setLanguage] = useState('english')
  const [rangeMode, setRangeMode] = useState(false)
  const [rangeStart, setRangeStart] = useState(1)
  const [rangeEnd, setRangeEnd] = useState(10)
  const [repeatCount, setRepeatCount] = useState(Infinity)
  const [completedSlokas, setCompletedSlokas] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || '/'
    fetch(`${basePath}data/slokas-complete.json`)
      .then(res => res.json())
      .then(data => {
        const enabled = (data.slokas || []).filter(isSlokaEnabled)
        setSlokas(enabled)
        setMetadata({ ...data.metadata, totalSlokas: enabled.length })
      })
      .catch(error => console.error('Error loading slokas:', error))
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('completedSlokas')
    if (saved) setCompletedSlokas(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('completedSlokas', JSON.stringify(completedSlokas))
  }, [completedSlokas])

  // Keep range + current selection within the enabled sloka count.
  useEffect(() => {
    const n = slokas.length
    if (!n) return
    setRangeEnd((e) => Math.min(e, n))
    setRangeStart((st) => Math.min(st, n))
    setCurrentSlokaIndex((i) => Math.min(i, n - 1))
  }, [slokas.length])

  const handleSlokaComplete = (slokaId) => {
    if (!completedSlokas.includes(slokaId)) setCompletedSlokas([...completedSlokas, slokaId])
  }

  const handleSlokaSelect = (index) => {
    setCurrentSlokaIndex(index)
    setRangeMode(false)
  }

  const currentSloka = slokas[currentSlokaIndex]

  return (
    <div className="min-h-screen bg-paper-bg">
      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={SWAMIJI_IMG}
              alt="Swamiji blessing"
              className="w-14 h-14 rounded-full object-cover"
              loading="eager"
            />
            <div>
              <h1 className="font-serif font-medium text-2xl md:text-[26px] tracking-tight text-ink-900 leading-none">
                Vishnu Sahasranamam
              </h1>
              <p className="text-sm text-ink-500 mt-1">
                Learning app for kids{metadata ? ` · ${metadata.totalSlokas} verses` : ''}
              </p>
            </div>
          </div>

          {SHOW_LANGUAGES && (
            <LanguageSelector
              languages={metadata?.languages || []}
              currentLanguage={language}
              onLanguageChange={setLanguage}
            />
          )}
        </header>

        {/* Main two-column area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="lg:col-span-2 space-y-5">
            {SHOW_LANGUAGES && currentSloka && (
              <SlokaDisplay sloka={currentSloka} language={language} />
            )}

            {currentSloka && (
              <Player
                sloka={currentSloka}
                slokas={slokas}
                currentIndex={currentSlokaIndex}
                onPrevious={() => setCurrentSlokaIndex(Math.max(0, currentSlokaIndex - 1))}
                onNext={() => setCurrentSlokaIndex(Math.min(slokas.length - 1, currentSlokaIndex + 1))}
                onRangeRestart={() => setCurrentSlokaIndex(rangeStart - 1)}
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

          <div className="lg:col-span-1">
            <RangeSelector
              slokas={slokas}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              onRangeStartChange={setRangeStart}
              onRangeEndChange={setRangeEnd}
              onStartPractice={() => {
                setRangeMode(true)
                setCurrentSlokaIndex(rangeStart - 1)
                setAutoPlay(true)
              }}
              repeatCount={repeatCount}
              onRepeatChange={setRepeatCount}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-5">
          <SlokaGrid
            slokas={slokas}
            currentIndex={currentSlokaIndex}
            completedSlokas={completedSlokas}
            onSlokaSelect={handleSlokaSelect}
          />
        </div>

        <footer className="text-center text-xs text-ink-500 py-6">
          Practice daily · Made with devotion
        </footer>
      </div>
    </div>
  )
}

export default App
