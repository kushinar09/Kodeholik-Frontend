import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react"

export default function YouTubePlayer({ videoId, onNinetyPercentWatched }) {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const progressBarRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [hasReachedNinetyPercent, setHasReachedNinetyPercent] = useState(false) // Track if 90% was reached
  let hideControlsTimeout = null

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    }

    const initializePlayer = () => {
      if (!window.YT || !window.YT.Player) return

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      })
    }

    window.onYouTubeIframeAPIReady = initializePlayer
    if (window.YT && window.YT.Player) initializePlayer()

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout)
    }
  }, [videoId])

  const onPlayerReady = (event) => {
    setIsReady(true)
    setDuration(event.target.getDuration())
    setVolume(event.target.getVolume())
  }

  const onPlayerStateChange = (event) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
  }

  useEffect(() => {
    if (!isReady) return

    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        const currentTime = playerRef.current.getCurrentTime()
        setCurrentTime(currentTime)
        const newProgress = (currentTime / duration) * 100
        setProgress(newProgress)

        if (newProgress >= 90 && !hasReachedNinetyPercent) {
          setHasReachedNinetyPercent(true)
          onNinetyPercentWatched() // Notify parent component
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isReady, isPlaying, duration, hasReachedNinetyPercent, onNinetyPercentWatched])

  const togglePlay = () => {
    if (!isReady || !playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressChange = (e) => {
    if (!isReady || !playerRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newProgress = (x / rect.width) * 100
    const newTime = (newProgress / 100) * duration
    playerRef.current.seekTo(newTime, true)
    setProgress(newProgress)

    if (newProgress >= 90 && !hasReachedNinetyPercent) {
      setHasReachedNinetyPercent(true)
      onNinetyPercentWatched()
    }
  }

  const handleVolumeChange = (e) => {
    if (!isReady || !playerRef.current) return
    const newVolume = Number.parseFloat(e.target.value)
    playerRef.current.setVolume(newVolume)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!isReady || !playerRef.current) return
    const newMuted = !isMuted
    playerRef.current.setVolume(newMuted ? 0 : volume)
    setIsMuted(newMuted)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleMouseMove = () => {
    setIsControlsVisible(true)
    if (hideControlsTimeout) clearTimeout(hideControlsTimeout)
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) setIsControlsVisible(false)
    }, 3000)
  }

  const handleMouseLeave = () => {
    if (isPlaying) {
      hideControlsTimeout = setTimeout(() => setIsControlsVisible(false), 3000)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-bg-card rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div id="youtube-player" className="w-full h-full" />

      <button
        onClick={togglePlay}
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-opacity duration-300",
          isPlaying && !isControlsVisible ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="bg-bg-primary bg-opacity-50 rounded-full p-4">
          {isPlaying ? <Pause className="h-8 w-8 text-text-primary" /> : <Play className="h-8 w-8 text-text-primary" />}
        </div>
      </button>

      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-primary to-transparent px-4 py-3",
          "transition-opacity duration-300",
          isPlaying && !isControlsVisible ? "opacity-0" : "opacity-100",
        )}
      >
        <div
          ref={progressBarRef}
          className="w-full h-1 bg-text-muted rounded-full mb-4 cursor-pointer relative"
          onClick={handleProgressChange}
        >
          <div
            className="absolute top-0 left-0 h-full bg-button-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-text-primary hover:bg-button-secondary"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <span className="text-sm text-text-primary">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-text-primary hover:bg-button-secondary"
              >
                {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 appearance-none bg-text-muted h-1 rounded-full outline-none"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => playerRef.current?.getIframe().requestFullscreen()}
            className="text-text-primary hover:bg-button-ghostHover"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}