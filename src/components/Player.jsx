import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Gauge } from 'lucide-react'
import { getSlokaLabel } from '../utils/slokaLabels'

// Full audio track (AAC extracted from the original MP4, same timeline)
const AUDIO_URL = `${import.meta.env.BASE_URL}audio/full_slokas.m4a`

// Playback speed choices (kept small and simple for kids)
const SPEED_OPTIONS = [0.5, 0.75, 1, 2]

const Player = ({
  sloka,
  slokas,
  currentIndex,
  onPrevious,
  onNext,
  onRangeRestart,
  onSlokaComplete,
  repeatCount,
  setRepeatCount,
  rangeMode,
  rangeStart,
  rangeEnd,
  autoPlay,
  setAutoPlay
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentRepeat, setCurrentRepeat] = useState(1)
  const [speed, setSpeed] = useState(1)

  const [audioElement, setAudioElement] = useState(null)

  // Refs read by the single long-lived timeupdate listener (avoids stale closures)
  const latestRef = useRef({})
  const iterationRef = useRef(1)         // current pass (iteration) through the range
  const endHandledRef = useRef(false)    // end-of-segment logic already ran for this segment
  const continueRef = useRef(false)      // next sloka change should keep playing (range mode)
  const advanceTimerRef = useRef(null)   // pending advance timeout
  const isPlayingRef = useRef(false)     // mirror of isPlaying (user intent)
  const speedRef = useRef(1)

  latestRef.current = {
    sloka,
    currentIndex,
    rangeMode,
    rangeStart,
    rangeEnd,
    repeatCount,
    slokasLength: slokas.length,
    onNext,
    onRangeRestart,
    onSlokaComplete
  }
  isPlayingRef.current = isPlaying
  speedRef.current = speed

  // Apply the chosen speed; browsers may reset playbackRate on load/seek
  const applySpeed = (audio) => {
    if (!audio) return
    audio.defaultPlaybackRate = speedRef.current
    audio.playbackRate = speedRef.current
    // Keep the voice natural at slow/fast speeds (ignored where unsupported)
    audio.preservesPitch = true
    audio.mozPreservesPitch = true
    audio.webkitPreservesPitch = true
  }

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }

  const seekToStart = (audio, s) => {
    if (!audio || !s?.audio) return
    audio.currentTime = s.audio.startTime
    endHandledRef.current = false
    setCurrentTime(0)
    applySpeed(audio)
  }

  const startPlayback = (audio) => {
    const s = latestRef.current.sloka
    if (!audio || !s?.audio) return
    const pos = audio.currentTime
    if (pos < s.audio.startTime || pos >= s.audio.endTime) {
      seekToStart(audio, s)
    }
    applySpeed(audio)
    isPlayingRef.current = true
    setIsPlaying(true)
    audio.play().catch(err => {
      console.error('Audio play failed:', err)
      isPlayingRef.current = false
      setIsPlaying(false)
    })
  }

  const stopPlayback = (audio) => {
    clearAdvanceTimer()
    continueRef.current = false
    if (audio) audio.pause()
    isPlayingRef.current = false
    setIsPlaying(false)
  }

  useEffect(() => {
    // Create ONE audio element for the self-hosted full audio file (same origin,
    // BASE_URL-aware so it works at '/' in dev and '/vsn/' on GitHub Pages).
    // Reusing it across slokas keeps the user's gesture authorizing playback.
    const audio = new Audio(AUDIO_URL)
    audio.preload = 'auto'
    applySpeed(audio)

    const handleError = () => {
      console.error('Audio failed to load', audio.error)
      isPlayingRef.current = false
      setIsPlaying(false)
    }
    const handleLoadedMetadata = () => applySpeed(audio)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    setAudioElement(audio)

    // Cleanup
    return () => {
      clearTimeout(advanceTimerRef.current)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [])

  // Sloka changed: reset and seek. Keep playing only if a range advance asked for it.
  // autoPlay is intentionally NOT a dependency (handled in its own effect below).
  useEffect(() => {
    if (!audioElement || !sloka?.audio) return
    clearAdvanceTimer()
    // Keep the iteration counter during a range loop-back (driven by continueRef);
    // only a fresh, non-continued selection resets the pass count to 1.
    if (!continueRef.current) {
      iterationRef.current = 1
      setCurrentRepeat(1)
    }
    seekToStart(audioElement, sloka)
    setDuration(sloka.audio.duration)

    if (continueRef.current) {
      continueRef.current = false
      startPlayback(audioElement)
    } else {
      audioElement.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    }
  }, [sloka?.id, audioElement])

  // "Start Practice" request from App. Declared after the sloka-change effect so it
  // runs after the seek to the range start and is not undone by it.
  useEffect(() => {
    if (!autoPlay || !audioElement) return
    setAutoPlay(false)
    clearAdvanceTimer()
    continueRef.current = false
    iterationRef.current = 1
    setCurrentRepeat(1)
    seekToStart(audioElement, latestRef.current.sloka)
    startPlayback(audioElement)
  }, [autoPlay, audioElement])

  // Single timeupdate listener for the lifetime of the audio element
  useEffect(() => {
    if (!audioElement) return

    const handleTimeUpdate = () => {
      const {
        sloka: s,
        currentIndex: idx,
        rangeMode: inRange,
        rangeStart: start,
        rangeEnd: end,
        repeatCount: repeats,
        slokasLength,
        onSlokaComplete: complete
      } = latestRef.current
      if (!s?.audio) return

      const pos = audioElement.currentTime
      setCurrentTime(pos - s.audio.startTime)

      if (pos < s.audio.endTime || endHandledRef.current || !isPlayingRef.current) return
      endHandledRef.current = true
      audioElement.pause()

      complete(s.id)

      if (!inRange) {
        // Single sloka (e.g. grid click): play exactly once, then stop.
        // Repeat count does not apply outside range mode.
        isPlayingRef.current = false
        setIsPlaying(false)
        if (idx < slokasLength - 1) {
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null
            latestRef.current.onNext()
          }, 500)
        }
        return
      }

      // Range mode: the repeat count repeats the WHOLE range as a block.
      if (idx < end - 1) {
        // More slokas left in this pass: advance and keep playing after a gap.
        advanceTimerRef.current = setTimeout(() => {
          advanceTimerRef.current = null
          continueRef.current = true
          latestRef.current.onNext()
        }, 500)
        return
      }

      // Reached the last sloka of the range.
      const totalPasses = repeats > 0 ? repeats : 1
      if (iterationRef.current < totalPasses) {
        // Another pass remains: loop back to the first sloka of the range.
        iterationRef.current += 1
        setCurrentRepeat(iterationRef.current)
        advanceTimerRef.current = setTimeout(() => {
          advanceTimerRef.current = null
          const targetIndex = start - 1
          if (targetIndex === idx) {
            // Single-sloka range: index won't change, so restart in place.
            seekToStart(audioElement, s)
            startPlayback(audioElement)
          } else {
            // Multi-sloka range: jump back to the range start and keep playing.
            continueRef.current = true
            latestRef.current.onRangeRestart()
          }
        }, 500)
      } else {
        // Final pass complete: stop on the last sloka of the range.
        seekToStart(audioElement, s)
        isPlayingRef.current = false
        setIsPlaying(false)
      }
    }

    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [audioElement])

  const togglePlay = () => {
    if (!audioElement) return
    if (isPlaying) {
      stopPlayback(audioElement)
    } else {
      startPlayback(audioElement)
    }
  }

  const handlePrevious = () => {
    if (rangeMode && currentIndex <= rangeStart - 1) {
      return
    }
    clearAdvanceTimer()
    if (rangeMode && isPlaying) {
      continueRef.current = true
    } else if (audioElement) {
      audioElement.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    }
    onPrevious()
  }

  const handleNext = () => {
    if (rangeMode && currentIndex >= rangeEnd - 1) {
      return
    }
    clearAdvanceTimer()
    if (rangeMode && isPlaying) {
      continueRef.current = true
    } else if (audioElement) {
      audioElement.pause()
      isPlayingRef.current = false
      setIsPlaying(false)
    }
    onNext()
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (e) => {
    if (!audioElement || !sloka) return
    const percentage = e.target.value / 100
    const newTimeInSloka = percentage * duration
    const absoluteTime = sloka.audio.startTime + newTimeInSloka
    audioElement.currentTime = absoluteTime
    endHandledRef.current = false
    applySpeed(audioElement)
    setCurrentTime(newTimeInSloka)
  }

  const handleSpeedChange = (rate) => {
    setSpeed(rate)
    speedRef.current = rate
    applySpeed(audioElement)
  }

  const progressPct = (currentTime / duration) * 100 || 0

  return (
    <div className="bg-paper-card border border-paper-line rounded-2xl p-7 md:p-8">
      {/* Title */}
      <div className="text-center mb-5">
        <div className="text-sm text-ink-500">
          {getSlokaLabel(sloka)}
          {rangeMode && (
            <span className="text-ink-400">
              {'  ·  '}Range {getSlokaLabel(slokas[rangeStart - 1])}–{getSlokaLabel(slokas[rangeEnd - 1])}
            </span>
          )}
        </div>
        {repeatCount > 1 && (
          <div className="mt-1 text-xs font-semibold text-saff-700">
            Round {currentRepeat} / {repeatCount}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max="100"
          value={progressPct}
          onChange={handleSeek}
          aria-label="Seek within sloka"
          className="scrubber w-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #d2691e 0%, #d2691e ${progressPct}%, #eceae5 ${progressPct}%, #eceae5 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-ink-500 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous sloka"
          disabled={currentIndex === 0 || (rangeMode && currentIndex <= rangeStart - 1)}
          className="w-10 h-10 grid place-items-center rounded-full bg-paper-card text-ink-900 border border-paper-line hover:bg-paper-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="w-[58px] h-[58px] grid place-items-center rounded-full bg-ink-900 text-white hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next sloka"
          disabled={currentIndex === slokas.length - 1 || (rangeMode && currentIndex >= rangeEnd - 1)}
          className="w-10 h-10 grid place-items-center rounded-full bg-paper-card text-ink-900 border border-paper-line hover:bg-paper-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed — segmented control */}
      <div className="flex justify-center">
        <div role="group" aria-label="Playback speed" className="inline-flex gap-1 bg-paper-bg border border-paper-line rounded-xl p-1">
          {SPEED_OPTIONS.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleSpeedChange(rate)}
              aria-pressed={speed === rate}
              aria-label={`${rate}x playback speed`}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saff-500 ${
                speed === rate ? 'bg-paper-card text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Player
