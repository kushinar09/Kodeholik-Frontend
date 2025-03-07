"use client"

import { useEffect, useState } from "react"

export default function CountdownTimer({ initialMinutes = 30, onComplete }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60)

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return prevSeconds - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onComplete])

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return (
    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
      <span>
        {String(minutes).padStart(2, "0")}:{String(remainingSeconds).padStart(2, "0")}
      </span>
    </div>
  )
}

