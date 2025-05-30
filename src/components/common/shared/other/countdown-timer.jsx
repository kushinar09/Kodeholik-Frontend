"use client"

import { useEffect, useState } from "react"

export default function CountdownTimer({ initialSeconds = 1800, onComplete = null }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  // run countdown
  useEffect(() => {
    if (seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval)
          return 0
        }
        return prevSeconds - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // handle onComplete after reaching 0
  useEffect(() => {
    if (seconds === 0 && onComplete) {
      onComplete()
    }
  }, [seconds, onComplete])

  const days = Math.floor(seconds / (60 * 60 * 24))
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  const remainingSeconds = seconds % 60

  return (
    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
      <span>
        {days && days > 0 ? days + "d " : ""}
        {String(hours).padStart(2, "0")}:
        {String(minutes).padStart(2, "0")}:
        {String(remainingSeconds).padStart(2, "0")}
      </span>
    </div>
  )
}
