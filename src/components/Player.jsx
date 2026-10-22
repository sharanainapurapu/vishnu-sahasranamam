import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

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
  const [volume, setVolume] = useState(1)
  const [currentRepeat, setCurrentRepeat] = useState(1)

  const audioRef = useRef(null)
  const hasCompletedRef = useRef(false)

  const [audioElement, setAudioElement] = useState(null)

  useEffect(() => {
    // Create audio element for full audio file
    const audio = new Audio('/audio/full_slokas.mp4')
    setAudioElement(audio)
    
    // Cleanup
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    // Reset when sloka changes
    setCurrentTime(0)
    setCurrentRepeat(1)
    hasCompletedRef.current = false
    
    if (audioElement && sloka?.audio) {
      // Set audio to start of this sloka
      audioElement.currentTime = sloka.audio.startTime
      setDuration(sloka.audio.duration)
      
      // Auto-play if autoPlay is true (from "Start Practice" button)
      if (autoPlay) {
        setIsPlaying(true)
        setAutoPlay(false)  // Reset autoPlay flag
      } else {
        setIsPlaying(false)
      }
    }
  }, [sloka, audioElement, autoPlay, setAutoPlay])

  useEffect(() => {
    if (!audioElement || !sloka) return

    const handleTimeUpdate = () => {
      if (!audioElement) return
      
      const currentPos = audioElement.currentTime
      const slokaStart = sloka.audio.startTime
      const slokaEnd = sloka.audio.endTime
      
      // Calculate time within this sloka
      const timeInSloka = currentPos - slokaStart
      setCurrentTime(timeInSloka)
      
      // Check if we've reached the end of this sloka
      if (currentPos >= slokaEnd) {
        // Pause the audio
        audioElement.pause()
        
        // Handle repeat
        if (currentRepeat < repeatCount) {
          // Repeat this sloka
          setCurrentRepeat(prev => prev + 1)
          audioElement.currentTime = slokaStart
          if (isPlaying) {
            audioElement.play()
          }
        } else {
          // Mark as complete
          if (!hasCompletedRef.current) {
            onSlokaComplete(sloka.id)
            hasCompletedRef.current = true
          }
          
          // Auto-advance to next sloka
          if (rangeMode) {
            if (currentIndex < rangeEnd - 1) {
              setTimeout(() => {
                onNext()
                setCurrentRepeat(1)
                setAutoPlay(true)  // Keep playing in range mode
              }, 500)
            } else {
              setIsPlaying(false)
            }
          } else {
            if (currentIndex < slokas.length - 1) {
              setTimeout(() => {
                onNext()
                setCurrentRepeat(1)
              }, 500)
            } else {
              setIsPlaying(false)
            }
          }
        }
      }
    }

    if (isPlaying) {
      audioElement.addEventListener('timeupdate', handleTimeUpdate)
      audioElement.play()
    } else {
      audioElement.pause()
    }

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [isPlaying, audioElement, sloka, currentRepeat, repeatCount, currentIndex, slokas.length, rangeMode, rangeEnd, onNext, onSlokaComplete])

  const togglePlay = () => {
    if (!audioElement) return
    setIsPlaying(!isPlaying)
  }

  const handlePrevious = () => {
    if (rangeMode && currentIndex <= rangeStart - 1) {
      return
    }
    if (audioElement) {
      audioElement.pause()
    }
    onPrevious()
    setCurrentRepeat(1)
  }

  const handleNext = () => {
    if (rangeMode && currentIndex >= rangeEnd - 1) {
      return
    }
    if (audioElement) {
      audioElement.pause()
    }
    onNext()
    setCurrentRepeat(1)
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
    setCurrentTime(newTimeInSloka)
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100
    setVolume(newVolume)
    if (audioElement) {
      audioElement.volume = newVolume
    }
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
            Range Mode: {rangeStart} - {rangeEnd}
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
          onClick={handlePrevious}
          disabled={currentIndex === 0 || (rangeMode && currentIndex <= rangeStart - 1)}
          className="p-4 rounded-full bg-purple-100 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
        >
          <SkipBack className="w-6 h-6 text-purple-600" />
        </button>

        <button
          onClick={togglePlay}
          className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-110 shadow-lg"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white" />
          )}
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === slokas.length - 1 || (rangeMode && currentIndex >= rangeEnd - 1)}
          className="p-4 rounded-full bg-purple-100 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all transform hover:scale-110"
        >
          <SkipForward className="w-6 h-6 text-purple-600" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-purple-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-purple-200 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Note about audio */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
        <strong>✓ Real Audio Loaded!</strong> Playing from full audio file with timestamp-based navigation.
      </div>
    </div>
  )
}

export default Player
