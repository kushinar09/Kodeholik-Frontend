"use client"

import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "./youtubePlayer"
import { AlertCircle } from "lucide-react"
import { completedLesson } from "@/lib/api/lesson_api"

export default function VideoLesson({ videoUrl, lessonId, resourceError, onLessonCompleted }) {
  const videoRef = useRef(null) // Reference to the video element
  const [hasReachedNinetyPercent, setHasReachedNinetyPercent] = useState(false) // Track if 90% was reached

  // Handle completion for regular videos
  const handleVideoProgress = async () => {
    if (!videoRef.current || hasReachedNinetyPercent) return

    const currentTime = videoRef.current.currentTime
    const duration = videoRef.current.duration
    const progress = (currentTime / duration) * 100

    if (progress >= 90 && !hasReachedNinetyPercent) {
      setHasReachedNinetyPercent(true)
      try {
        await completedLesson(lessonId, async (url, options) => {
          const response = await fetch(url, options)
          if (response.ok) {
            const data = response.json()
            if (data.completed) if (onLessonCompleted) onLessonCompleted(lessonId)
          }
        })
        // Notify parent
      } catch (err) {
        console.error("Failed to mark lesson as complete:", err)
      }
    }
  }

  // Handle YouTube completion (existing logic)
  const handleNinetyPercentWatched = async () => {
    try {
      await completedLesson(lessonId, async (url, options) => {
        const response = await fetch(url, options)
        if (response.ok) {
          const data = response.json()
          if (data.completed) if (onLessonCompleted) onLessonCompleted(lessonId)
        }
      })
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err)
    }
  }

  // Add event listener for regular video progress
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement && !videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
      videoElement.addEventListener("timeupdate", handleVideoProgress)
    }

    // Cleanup event listener
    return () => {
      if (videoElement && !videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
        videoElement.removeEventListener("timeupdate", handleVideoProgress)
      }
    }
  }, [videoUrl, lessonId, hasReachedNinetyPercent])

  return (
    <>
      {videoUrl ? (
        <div className="bg-black">
          {videoUrl.match(/^[a-zA-Z0-9_-]{11}$/) ? (
            <YouTubePlayer key={lessonId} videoId={videoUrl} onNinetyPercentWatched={handleNinetyPercentWatched} />
          ) : (
            <video ref={videoRef} width="100%" height="auto" controls className="aspect-video mx-auto">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-900">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mb-2" />
          <p className="text-red-400 text-sm sm:text-base">Video not available</p>
        </div>
      )}
      {resourceError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-2 sm:p-3 text-center">
          <p className="text-red-200 text-xs sm:text-sm">{resourceError}</p>
        </div>
      )}
    </>
  )
}
