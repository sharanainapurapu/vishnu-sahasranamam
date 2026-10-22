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
  const repeatRef = useRef(1)            // current repeat number of this sloka
  const endHandledRef = useRef(false)    // end-of-segment logic already ran for this segment
  const continueRef = useRef(false)      // next sloka change should keep playing (range mode)
  const advanceTimerRef = useRef(null)   // pending advance timeout
  const isPlayingRef = useRef(false)     // mirror of isPlaying (user intent)
  const speedRef = useRef(1)

  latestRef.current = {
    sloka,
    currentIndex,
    rangeMode,
    rangeEnd,
    repeatCount,
    slokasLength: slokas.length,
    onNext,
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
    repeatRef.current = 1
    setCurrentRepeat(1)
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
    repeatRef.current = 1
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

      if (repeatRef.current < repeats) {
        // Repeat this sloka
        repeatRef.current += 1
        setCurrentRepeat(repeatRef.current)
        seekToStart(audioElement, s)
        startPlayback(audioElement)
        return
      }

      complete(s.id)

      if (inRange) {
        if (idx < end - 1) {
          // Advance and keep playing after a short gap
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null
            continueRef.current = true
            latestRef.current.onNext()
          }, 500)
        } else {
          // End of range: stop on the last sloka
          seekToStart(audioElement, s)
          isPlayingRef.current = false
          setIsPlaying(false)
        }
      } else {
        // Single sloka: stop, then show the next sloka (paused)
        isPlayingRef.current = false
        setIsPlaying(false)
        if (idx < slokasLength - 1) {
          advanceTimerRef.current = setTimeout(() => {
            advanceTimerRef.current = null
            latestRef.current.onNext()
          }, 500)
        }
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

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8">
      {/* Current Sloka Info */}
      <div className="text-center mb-6">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-lg font-bold mb-2">
          Sloka {sloka.number}
        </div>
        {rangeMode && (
          <div className="text-sm text-purple-600 font-semibold">
            Range Mode: {getSlokaLabel(slokas[rangeStart - 1])} - {getSlokaLabel(slokas[rangeEnd - 1])}
          </div>
        )}
        {repeatCount > 1 && (
          <div className="text-sm text-orange-600 font-semibold mt-1">
            Repeat: {currentRepeat} / {repeatCount}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max="100"
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          className="w-full h-3 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(currentTime / duration) * 100}%, #e9d5ff ${(currentTime / duration) * 100}%, #e9d5ff 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          type="button"
          onClick={handlePrevious}
          aria-label="Previous sloka"
          disabled={currentIndex === 0 || (rangeMode && currentIndex <= rangeStart - 1)}
          className="p-4 rounded-full bg-purple-100 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
        >
          <SkipBack className="w-6 h-6 text-purple-600" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-110 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next sloka"
          disabled={currentIndex === slokas.length - 1 || (rangeMode && currentIndex >= rangeEnd - 1)}
          className="p-4 rounded-full bg-purple-100 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
        >
          <SkipForward className="w-6 h-6 text-purple-600" />
        </button>
      </div>

      {/* Speed Control */}
      <div role="group" aria-label="Playback speed">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-5 h-5 text-purple-600" aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-700">Speed</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {SPEED_OPTIONS.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleSpeedChange(rate)}
              aria-pressed={speed === rate}
              aria-label={`Play at ${rate} times speed`}
              className={`py-3 min-h-[48px] text-lg font-bold rounded-xl transition-all transform focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 ${
                speed === rate
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Note about audio */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
        <strong>✓ Real Audio Loaded!</strong> Playing from full audio file with timestamp-based navigation.
      </div>
    </div>
  )
}

export default Player
