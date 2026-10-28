import { useState, useEffect, useMemo } from 'react'
import PracticeCard from './components/PracticeCard'
import SelectionCard from './components/SelectionCard'
import { loadData, itemsForMode, displayItemForRange } from './utils/manifest'
import { DEFAULT_MODE } from './config'

const SWAMIJI_IMG = `${import.meta.env.BASE_URL}images/swamiji.png`

const firstEnabledFrom = (items, from = 0) => {
  for (let i = Math.max(0, from); i < items.length; i++) if (items[i].enabled) return i
  for (let i = 0; i < items.length; i++) if (items[i].enabled) return i
  return 0
}

function App() {
  const [sections, setSections] = useState([])
  const [mode, setMode] = useState(DEFAULT_MODE)
  const [language, setLanguage] = useState('english')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completed, setCompleted] = useState([])

  // Grid selection: selStart is the first tapped index; selEnd the second.
  // selStart === selEnd means a single verse is selected.
  const [selStart, setSelStart] = useState(0)
  const [selEnd, setSelEnd] = useState(0)

  // rangeMode drives the player's loop behaviour; autoPlay asks it to start.
  const [rangeMode, setRangeMode] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)

  const items = useMemo(() => itemsForMode(sections, mode), [sections, mode])

  useEffect(() => {
    loadData()
      .then((data) => setSections(data.sections))
      .catch((e) => console.error('Failed to load data:', e))
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('vsn.completed')
    if (saved) { try { setCompleted(JSON.parse(saved)) } catch (e) {} }
  }, [])
  useEffect(() => {
    localStorage.setItem('vsn.completed', JSON.stringify(completed))
  }, [completed])

  // On mode change / first load, reset selection to the first enabled verse.
  useEffect(() => {
    if (!items.length) return
    const start = firstEnabledFrom(items, 0)
    setCurrentIndex(start)
    setSelStart(start)
    setSelEnd(start)
    setRangeMode(false)
    setAutoPlay(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, items.length])

  const markComplete = (key) => {
    if (key && !completed.includes(key)) setCompleted((c) => [...c, key])
  }

  // Grid tap: the state machine for single vs range selection. Tapping only
  // SELECTS (it loads the verse + shows its text); playback starts from the
  // Play button, so browsing verses never auto-plays.
  //   - No range in progress (selStart === selEnd): this tap selects a single
  //     verse (and shows it in the player).
  //   - A single is already selected and a different verse is tapped: form a
  //     range (selStart..this).
  //   - A full range already exists: start fresh with a new single selection.
  const handleTapItem = (index) => {
    const rangeComplete = selStart !== selEnd
    if (rangeComplete || selStart === index) {
      // Fresh single selection (no auto-play).
      setSelStart(index)
      setSelEnd(index)
      setRangeMode(false)
      setCurrentIndex(index)
      return
    }
    // A single is selected; this second, different tap completes a range.
    setSelEnd(index)
    setRangeMode(false)
  }

  // Play the current single selection (from the Play button).
  const handlePlaySingle = () => {
    setRangeMode(false)
    setCurrentIndex(selStart)
    setAutoPlay(true)
  }

  const handlePlayRange = () => {
    const lo = Math.min(selStart, selEnd)
    const start = firstEnabledFrom(items, lo)
    setRangeMode(true)
    setCurrentIndex(start)
    setAutoPlay(true)
  }

  const currentItem = items[currentIndex] || null
  const rangeStart = Math.min(selStart, selEnd)
  const rangeEnd = Math.max(selStart, selEnd)

  // Text shown in the card: the whole selected range concatenated (same in both
  // modes). The player still walks items one at a time via currentItem.
  const displayItem = items.length
    ? displayItemForRange(items, rangeStart, rangeEnd)
    : null

  return (
    <div className="min-h-screen bg-paper-bg">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <header className="flex items-center gap-4 mb-8">
          <img src={SWAMIJI_IMG} alt="Swamiji blessing"
               className="w-14 h-14 rounded-full object-cover" loading="eager" />
          <div>
            <h1 className="font-serif font-medium text-2xl md:text-[26px] tracking-tight text-ink-900 leading-none">
              Vishnu Sahasranamam
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              Learning app for kids{items.length ? ` · ${items.filter(i => i.enabled).length} verses` : ''}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
          <div className="lg:col-span-3">
            <PracticeCard
              item={currentItem}
              displayItem={displayItem}
              items={items}
              currentIndex={currentIndex}
              mode={mode}
              language={language}
              onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(items.length - 1, i + 1))}
              onRangeRestart={() => setCurrentIndex(firstEnabledFrom(items, rangeStart))}
              onSlokaComplete={markComplete}
              rangeMode={rangeMode}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              autoPlay={autoPlay}
              setAutoPlay={setAutoPlay}
            />
          </div>

          <div className="lg:col-span-2">
            <SelectionCard
              mode={mode} onModeChange={setMode}
              language={language} onLanguageChange={setLanguage}
              items={items}
              currentIndex={currentIndex}
              completed={completed}
              selStart={selStart} selEnd={selEnd}
              onTapItem={handleTapItem}
              onPlayRange={handlePlayRange}
              onPlaySingle={handlePlaySingle}
            />
          </div>
        </div>

        <footer className="text-center text-xs text-ink-500 py-6">
          Practice daily · Made with devotion
        </footer>
      </div>
    </div>
  )
}

export default App
