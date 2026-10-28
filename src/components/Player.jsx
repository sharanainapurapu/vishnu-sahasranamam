import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { getItemLabel } from '../utils/slokaLabels'
import { getAudioUrl, prefetchAudio } from '../utils/audioLoader'
import { SPEED_OPTIONS, isSpeedEnabled } from '../config'

const MEDIA_ARTWORK = `${import.meta.env.BASE_URL}images/swamiji.png`
const MEDIA_ALBUM = 'Vishnu Sahasranamam'

// Player for the per-file audio model.
//   - Each item (sloka or bundle) is its own clip loaded on demand as a blob URL.
//   - No timestamp seeking: a clip plays from 0 to its natural end.
//   - Range play walks items start..end; at the end of the range it loops back
//     to the start forever (repeat is always infinite now).
//   - The next clip is prefetched while the current one plays for gapless feel.
const Player = ({
  items,          // flat item list for the active mode
  currentIndex,
  mode,
  onPrevious,
  onNext,
  onRangeRestart,
  onSlokaComplete,
  rangeMode,
  rangeStart,     // index (0-based) of the first item in the range
  rangeEnd,       // index (0-based) of the last item in the range
  autoPlay,
  setAutoPlay,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const audioRef = useRef(null)
  const speedRef = useRef(1)
  const continueRef = useRef(false)   // next load should auto-play (range walk)
  const controlsRef = useRef({})
  const latestRef = useRef({})

  const item = items[currentIndex] || null

  latestRef.current = {
    item, currentIndex, rangeMode, rangeStart, rangeEnd,
    itemsLength: items.length, mode, items,
    onNext, onRangeRestart, onSlokaComplete,
  }
  speedRef.current = speed

  const applySpeed = (audio) => {
    if (!audio) return
    audio.defaultPlaybackRate = speedRef.current
    audio.playbackRate = speedRef.current
    audio.preservesPitch = true
    audio.mozPreservesPitch = true
    audio.webkitPreservesPitch = true
  }

  // Create one reusable <audio> element for the player's lifetime.
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'auto'
    applySpeed(audio)
    audioRef.current = audio

    const onLoaded = () => { setDuration(audio.duration || 0); applySpeed(audio) }
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onErr = () => { setError('Could not play this clip.'); setIsPlaying(false) }
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('error', onErr)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('error', onErr)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [])

  // Load the current item's clip whenever it changes. Auto-play if a range walk
  // (continueRef) or a Start-practice request asked for it.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !item) return
    let cancelled = false
    const shouldPlay = continueRef.current
    continueRef.current = false

    setError('')
    if (!item.audioKey) {
      setError('No audio for this selection yet.')
      setIsPlaying(false)
      return
    }

    setLoading(true)
    getAudioUrl(mode, item.audioKey)
      .then((url) => {
        if (cancelled) return
        audio.src = url
        audio.currentTime = 0
        applySpeed(audio)
        setCurrentTime(0)
        setLoading(false)
        // Warm the next clip in a range walk.
        const { rangeMode: rm, currentIndex: idx, rangeEnd: end, items: its, mode: m } = latestRef.current
        if (rm && idx < end) prefetchAudio(m, its[idx + 1]?.audioKey)
        if (shouldPlay || autoPlayConsumedRef.current) doPlay(audio)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
        setError('Could not load this clip.')
        setIsPlaying(false)
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.audioKey, mode])

  // Start-practice request from the parent: play from the current (range start)
  // item. Handled via a ref flag so the load effect above picks it up.
  const autoPlayConsumedRef = useRef(false)
  useEffect(() => {
    if (!autoPlay) return
    setAutoPlay(false)
    const audio = audioRef.current
    if (!audio || !item?.audioKey) return
    autoPlayConsumedRef.current = true
    getAudioUrl(mode, item.audioKey).then((url) => {
      audio.src = url
      audio.currentTime = 0
      applySpeed(audio)
      doPlay(audio)
      autoPlayConsumedRef.current = false
    }).catch(() => { autoPlayConsumedRef.current = false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay])

  const doPlay = (audio) => {
    if (!audio?.src) return
    applySpeed(audio)
    setIsPlaying(true)
    audio.play().catch(() => setIsPlaying(false))
  }

  const doPause = (audio) => {
    continueRef.current = false
    if (audio) audio.pause()
    setIsPlaying(false)
  }

  // Clip reached its natural end.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onEnded = () => {
      const { item: it, rangeMode: rm, currentIndex: idx, rangeStart: start, rangeEnd: end,
              itemsLength, onNext: next, onRangeRestart: restart,
              onSlokaComplete: complete } = latestRef.current

      if (it?.audioKey) complete?.(it.audioKey)

      if (!rm) {
        // Single item: play once, then stop (optionally step to the next item).
        setIsPlaying(false)
        if (idx < itemsLength - 1) {
          continueRef.current = false
        }
        return
      }

      if (idx < end) {
        // More items left in this pass: advance and keep playing.
        continueRef.current = true
        next()
        return
      }

      // End of range → loop forever back to the range start.
      if (start === end) {
        // Single-item range: just replay in place.
        audio.currentTime = 0
        doPlay(audio)
      } else {
        continueRef.current = true
        restart()
      }
    }
    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [])

  // --- Media Session (lock screen) ---
  controlsRef.current = {
    play: () => doPlay(audioRef.current),
    pause: () => doPause(audioRef.current),
    next: () => handleNext(),
    prev: () => handlePrevious(),
  }

  useEffect(() => {
    if (!('mediaSession' in navigator) || !item) return
    try {
      const title = rangeMode ? `${getItemLabel(item)} · Range` : getItemLabel(item)
      // eslint-disable-next-line no-undef
      navigator.mediaSession.metadata = new MediaMetadata({
        title, artist: MEDIA_ALBUM, album: MEDIA_ALBUM,
        artwork: [
          { src: MEDIA_ARTWORK, sizes: '512x512', type: 'image/png' },
          { src: MEDIA_ARTWORK, sizes: '256x256', type: 'image/png' },
        ],
      })
    } catch (e) { /* unsupported */ }
  }, [item?.audioKey, rangeMode])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const set = (a, fn) => { try { ms.setActionHandler(a, fn) } catch (e) {} }
    set('play', () => controlsRef.current.play?.())
    set('pause', () => controlsRef.current.pause?.())
    set('nexttrack', () => controlsRef.current.next?.())
    set('previoustrack', () => controlsRef.current.prev?.())
    return () => ['play', 'pause', 'nexttrack', 'previoustrack'].forEach((a) => set(a, null))
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    try { navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused' } catch (e) {}
  }, [isPlaying])

  // --- Controls ---
  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) doPause(audio)
    else doPlay(audio)
  }

  const handlePrevious = () => {
    if (rangeMode && currentIndex <= rangeStart) return
    if (currentIndex <= 0) return
    if (rangeMode && isPlaying) continueRef.current = true
    else doPause(audioRef.current)
    onPrevious()
  }

  const handleNext = () => {
    if (rangeMode && currentIndex >= rangeEnd) return
    if (currentIndex >= items.length - 1) return
    if (rangeMode && isPlaying) continueRef.current = true
    else doPause(audioRef.current)
    onNext()
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const t = (e.target.value / 100) * duration
    audio.currentTime = t
    setCurrentTime(t)
  }

  const handleSpeedChange = (rate) => {
    setSpeed(rate)
    speedRef.current = rate
    applySpeed(audioRef.current)
  }

  const formatTime = (t) => {
    const m = Math.floor(t / 60)
    const s = Math.floor(t % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const prevDisabled = currentIndex <= 0 || (rangeMode && currentIndex <= rangeStart)
  const nextDisabled = currentIndex >= items.length - 1 || (rangeMode && currentIndex >= rangeEnd)

  return (
    <div className="border-t border-paper-line pt-6 mt-6">
      {/* Title / range / status */}
      <div className="text-center mb-4">
        <div className="text-sm text-ink-500">
          {getItemLabel(item)}
          {rangeMode && items[rangeStart] && items[rangeEnd] && (
            <span className="text-ink-400">
              {'  ·  '}Range {getItemLabel(items[rangeStart])}–{getItemLabel(items[rangeEnd])}
            </span>
          )}
        </div>
        {rangeMode && (
          <div className="mt-1 text-xs font-semibold text-saff-700">Repeating ∞</div>
        )}
        {error && <div className="mt-1 text-xs font-semibold text-red-600">{error}</div>}
      </div>

      {/* Progress */}
      <div className="mb-5">
        <input
          type="range" min="0" max="100" value={progressPct}
          onChange={handleSeek}
          aria-label="Seek within clip"
          className="scrubber w-full cursor-pointer"
          style={{ background: `linear-gradient(to right, #d2691e 0%, #d2691e ${progressPct}%, #eceae5 ${progressPct}%, #eceae5 100%)` }}
        />
        <div className="flex justify-between text-xs text-ink-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{loading ? 'Loading…' : formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-5">
        <button
          type="button" onClick={handlePrevious} aria-label="Previous"
          disabled={prevDisabled}
          className="w-10 h-10 grid place-items-center rounded-full bg-paper-card text-ink-900 border border-paper-line hover:bg-paper-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          type="button" onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!item?.audioKey}
          className="w-[58px] h-[58px] grid place-items-center rounded-full bg-ink-900 text-white hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 disabled:opacity-40"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
        </button>
        <button
          type="button" onClick={handleNext} aria-label="Next"
          disabled={nextDisabled}
          className="w-10 h-10 grid place-items-center rounded-full bg-paper-card text-ink-900 border border-paper-line hover:bg-paper-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed */}
      <div className="flex flex-col items-center gap-2">
        <div role="group" aria-label="Playback speed" className="inline-flex gap-1 bg-paper-bg border border-paper-line rounded-xl p-1">
          {SPEED_OPTIONS.map((rate) => {
            const enabled = isSpeedEnabled(rate)
            const active = speed === rate
            return (
              <button
                key={rate} type="button"
                onClick={() => enabled && handleSpeedChange(rate)}
                disabled={!enabled}
                aria-pressed={active}
                aria-label={enabled ? `${rate}x speed` : `${rate}x speed, coming soon`}
                title={enabled ? undefined : 'Coming soon'}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
                  !enabled ? 'text-ink-400 opacity-40 cursor-not-allowed'
                  : active ? 'bg-paper-card text-ink-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-900'
                }`}
              >
                {rate}x
              </button>
            )
          })}
        </div>
        {SPEED_OPTIONS.some((r) => !isSpeedEnabled(r)) && (
          <p className="text-xs text-ink-500">Other speeds coming soon.</p>
        )}
      </div>
    </div>
  )
}

export default Player
