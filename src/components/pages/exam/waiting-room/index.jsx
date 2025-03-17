"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Bell, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useSocketExam } from "@/providers/SocketExamProvider"
import LoadingScreen from "@/components/common/shared/other/loading"

export default function WaitingRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchToken, connectSocket, isConnected, error: socketError } = useSocketExam()

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [notifyMe, setNotifyMe] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [startTimeDate, setStartTimeDate] = useState(null)
  const [tokenData, setTokenData] = useState(null)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Use refs instead of state for values that shouldn't trigger re-renders
  const timerIntervalRef = useRef(null)
  const lastCheckTimeRef = useRef(0)
  const isMountedRef = useRef(true)

  // Parse exam time from string format "DD/MM/YYYY, HH:MM"
  const parseExamTime = useCallback((timeString) => {
    if (!timeString) return null

    try {
      const [datePart, timePart] = timeString.split(", ")
      const [day, month, year] = datePart.split("/")
      const [hours, minutes] = timePart.split(":")

      // Create date object (months are 0-indexed in JavaScript)
      return new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day),
        Number.parseInt(hours),
        Number.parseInt(minutes),
      )
    } catch (err) {
      console.error("Error parsing exam time:", err)
      return null
    }
  }, [])

  // Main function to check exam status
  const checkExamStatus = useCallback(async () => {
    if (!id || !isMountedRef.current) return

    // Prevent too frequent API calls (at least 5 seconds between calls)
    const now = Date.now()
    if (now - lastCheckTimeRef.current < 5000) return

    lastCheckTimeRef.current = now

    try {
      setLoading(true)
      const result = await fetchToken(id)

      if (!isMountedRef.current) return

      if (!result) {
        setErrorState("Failed to fetch token data")
        setLoading(false)
        return
      }

      if (result.success) {
        setTokenData(result)
        // Connect to socket with the token
        connectSocket(result.token, result.code)

        // Handle startTime if it exists in the successful result
        if (result.startTime) {
          const parsedStartTime = parseExamTime(result.startTime)

          if (parsedStartTime) {
            setStartTimeDate(parsedStartTime)
            updateTimeLeft(parsedStartTime)
          }
        }
      } else if (result.error) {
        const error = result.error

        if (error.type === "early") {
          const parsedStartTime = parseExamTime(error.startTime)

          if (parsedStartTime) {
            setStartTimeDate(parsedStartTime)
            updateTimeLeft(parsedStartTime)
          }
        } else if (error.type === "late") {
          toast.error("The exam has already started or ended")
          navigate("/exam")
        } else {
          toast.error(error.message || "An error occurred")
          setErrorState(error.message || "Unknown error")
        }
      }
    } catch (err) {
      console.error("Error in checkExamStatus:", err)
      if (isMountedRef.current) {
        setErrorState("An unexpected error occurred")
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [id, fetchToken, connectSocket, navigate, parseExamTime])

  // Helper function to update timeLeft state
  const updateTimeLeft = useCallback((startTime) => {
    if (!startTime || !isMountedRef.current) return

    const now = new Date()
    const timeDifference = startTime.getTime() - now.getTime() - 2000

    if (timeDifference > 0) {
      const hours = Math.floor(timeDifference / 1000 / 60 / 60)
      const minutes = Math.floor((timeDifference / 1000 / 60) % 60)
      const seconds = Math.floor((timeDifference / 1000) % 60)

      setTimeLeft({
        hours: hours,
        minutes: minutes,
        seconds: seconds,
      })

      // Clear any existing interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }

      // Set up new interval with ref instead of state
      timerIntervalRef.current = setInterval(updateTimer, 1000)
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
    }
  }, [])

  // Function to update the timer
  const updateTimer = useCallback(() => {
    if (!startTimeDate || !isMountedRef.current) return

    const now = new Date()
    const timeDifference = startTimeDate.getTime() - now.getTime()

    if (timeDifference <= 0) {
      // Clear interval when timer reaches zero
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }

      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })

      if (tokenData && tokenData.success) {
        setIsReady(true)
        setShouldRedirect(true)
      }
      return
    }

    const hours = Math.floor(timeDifference / 1000 / 60 / 60)
    const minutes = Math.floor((timeDifference / 1000 / 60) % 60)
    const seconds = Math.floor((timeDifference / 1000) % 60)

    setTimeLeft({
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    })

    // Static property to track last check time
    const checkStatusThreshold = 5000 // 5 seconds

    // Implement the logic flow described:
    // If time < 5 minutes and not connected, check exam status
    if (hours === 0 && minutes < 5 && !isConnected) {
      const now = Date.now()
      // Only check if enough time has passed since last check
      if (!updateTimer.lastCheckTime || now - updateTimer.lastCheckTime > checkStatusThreshold) {
        updateTimer.lastCheckTime = now
        checkExamStatus()
      }
    }

    // If time < 2 seconds, redirect to ExamProblems
    if (hours === 0 && minutes === 0 && seconds < 2) {
      setShouldRedirect(true)
    }
  }, [startTimeDate, tokenData, isConnected, checkExamStatus])

  // Initialize the static property
  updateTimer.lastCheckTime = 0

  // Initial check on component mount and cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    checkExamStatus()

    return () => {
      isMountedRef.current = false
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // Handle redirection separately to avoid infinite loops
  useEffect(() => {
    if (!shouldRedirect || !tokenData || !tokenData.success) return

    // Use a timeout to avoid immediate state changes
    const redirectTimer = setTimeout(() => {
      if (isMountedRef.current) {
        navigate(`/exam/${id}`)
      }
    }, 2000)

    return () => clearTimeout(redirectTimer)
  }, [shouldRedirect, tokenData, id, navigate])

  // Effect to handle socket errors
  useEffect(() => {
    if (socketError && socketError.message && isMountedRef.current) {
      setErrorState(socketError.message)
    }
  }, [socketError])

  // Set up timer when startTimeDate changes
  useEffect(() => {
    if (!startTimeDate) return

    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    // Update immediately
    updateTimer()

    // Set up new interval
    timerIntervalRef.current = setInterval(updateTimer, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [startTimeDate, updateTimer])

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifyMe(true)
        } else {
          toast.error("Notification permission denied")
          setNotifyMe(false)
        }
      })
    } else {
      toast.error("Notifications are not supported in this browser")
    }
  }

  // Effect to handle notifications when exam is ready
  useEffect(() => {
    if (
      !isReady ||
      !notifyMe ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !isMountedRef.current
    ) {
      return
    }

    try {
      new Notification("Take your exam!", {
        body: "It's time to take your examination.",
        icon: "/placeholder.svg?height=64&width=64",
      })
    } catch (err) {
      console.error("Error showing notification:", err)
    }
  }, [isReady, notifyMe])

  if (errorState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bg-card to-bg-card/90 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Error</CardTitle>
            <CardDescription>There was a problem loading the exam</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">{errorState}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <button
              onClick={() => navigate("/exam")}
              className="inline-flex h-10 items-center justify-center rounded-md bg-bg-card px-8 text-sm font-medium text-primary shadow"
            >
              Return to Exams
            </button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bg-card to-bg-card/90 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Waiting Room</CardTitle>
            <CardDescription>You have registered for the examination, please wait.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-muted-foreground text-sm font-medium">Estimated wait time left</div>
              <div className="flex items-center justify-center gap-4 text-5xl font-bold tabular-nums">
                <div className="flex flex-col items-center">
                  <span>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span className="text-xs text-muted-foreground">hour</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
                <span>:</span>
                <div className="flex flex-col items-center">
                  <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
                  <span className="text-xs text-muted-foreground">sec</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-bg-card p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary">Your examination will begin soon</p>
                  <p className="text-muted-foreground">
                    {timeLeft.hours === 0 && timeLeft.minutes < 5
                      ? "The test will start in a few minutes, don't reload or leave this page."
                      : "Don't close this tab and turn on notifications toggle to get notifications"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notify"
                checked={notifyMe}
                onCheckedChange={(checked) => {
                  if (checked) {
                    requestNotificationPermission()
                  } else {
                    setNotifyMe(false)
                  }
                }}
              />
              <Label htmlFor="notify" className="flex items-center gap-1.5">
                <Bell className="h-4 w-4" />
                Notify me when it&apos;s time
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            {timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0 ? (
              <div className="w-full p-2 rounded-md flex items-center text-muted-foreground justify-center gap-2 border">
                <span>Waiting...</span>
              </div>
            ) : (
              <div className="w-full p-2 rounded-md flex items-center text-primary-foreground justify-center gap-2 bg-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ready to Start</CardTitle>
          <CardDescription>Your exam is ready. Redirecting you to the exam page...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  )
}

