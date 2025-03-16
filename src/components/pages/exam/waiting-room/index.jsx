"use client"

import { useState, useEffect, useCallback } from "react"
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

  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })
  const [notifyMe, setNotifyMe] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [startTimeDate, setStartTimeDate] = useState(null)
  const [timerInterval, setTimerInterval] = useState(null)
  const [tokenData, setTokenData] = useState(null)

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
        Number.parseInt(minutes)
      )
    } catch (err) {
      console.error("Error parsing exam time:", err)
      return null
    }
  }, [])

  // Main function to check exam status
  const checkExamStatus = useCallback(async () => {
    if (!id) {
      setErrorState("Missing exam ID")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("Checking exam status for ID:", id)
      const result = await fetchToken(id)
      console.log("Token fetch result:", result)

      if (!result) {
        setErrorState("Failed to fetch token data")
        setLoading(false)
        return
      }

      setTokenData(result)

      if (result.success) {
        // Connect to socket with the token
        connectSocket(result.Token)
        setIsReady(true)
        setTimeout(() => navigate(`/exam/${id}`), 2000)
      } else if (result.error) {
        const error = result.error

        if (error.type === "early") {
          console.log("Exam starts at:", error.startTime)

          const parsedStartTime = parseExamTime(error.startTime)
          console.log("Parsed start time:", parsedStartTime)

          if (!parsedStartTime) {
            setErrorState("Invalid exam start time format")
            setLoading(false)
            return
          }

          setStartTimeDate(parsedStartTime)
          console.log("Start time set to:", parsedStartTime.toString())

          // Clear any existing interval
          if (timerInterval) {
            clearInterval(timerInterval)
          }

          // Update immediately, then every second
          setTimeout(() => {
            console.log("Initial timer update")
            updateTimer()

            console.log("Setting up timer interval")
            const newInterval = setInterval(updateTimer, 1000)
            setTimerInterval(newInterval)
          }, 0)

          // Check if we're close to start time (less than 5 minutes)
          const timeDifference = parsedStartTime.getTime() - new Date().getTime()
          const minutesLeft = Math.floor(timeDifference / 1000 / 60)
          console.log("Minutes left until exam:", minutesLeft)

          if (minutesLeft <= 5) {
            // Pre-fetch token when we're close to start time
            setTimeout(async () => {
              console.log("Pre-fetching token before exam start")
              const tokenResult = await fetchToken(id)
              if (tokenResult && tokenResult.success) {
                connectSocket(tokenResult.Token)
              }
            }, timeDifference - 10000) // 10 seconds before start time
          }
        } else if (error.type === "late") {
          toast.error("The exam has already started or ended")
          setTimeout(() => navigate("/exam"), 2000)
        } else {
          toast.error(error.message || "An error occurred")
          setErrorState(error.message || "Unknown error")
        }
      }
    } catch (err) {
      console.error("Error in checkExamStatus:", err)
      setErrorState("An unexpected error occurred")
    }
    finally {
      setLoading(false)
    }
  }, [id, fetchToken, connectSocket, navigate, parseExamTime, updateTimer, timerInterval])

  // Function to update the timer
  const updateTimer = useCallback(() => {
    if (!startTimeDate) {
      console.log("No start time date available yet")
      return
    }

    const now = new Date()
    const timeDifference = startTimeDate.getTime() - now.getTime()
    console.log("Timer update - Start time:", startTimeDate.toString())
    console.log("Timer update - Current time:", now.toString())
    console.log("Timer update - Time difference (ms):", timeDifference)

    if (timeDifference <= 0) {
      // Clear interval when timer reaches zero
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
      }

      setTimeLeft({ minutes: 0, seconds: 0 })
      console.log("Timer reached zero, checking exam status")
      // Re-check exam status after timer reaches zero
      checkExamStatus()
      return
    }

    const minutes = Math.floor((timeDifference / 1000 / 60) % 60)
    const seconds = Math.floor((timeDifference / 1000) % 60)

    console.log("Setting time left - minutes:", minutes, "seconds:", seconds)

    setTimeLeft({
      minutes: minutes,
      seconds: seconds
    })
  }, [startTimeDate, timerInterval, checkExamStatus])

  // Initial check on component mount
  useEffect(() => {
    checkExamStatus()

    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }
    , [])

  // Initial check on component mount
  useEffect(() => {
    checkExamStatus()

    return () => {
      if (timerInterval) clearInterval(timerInterval)
    }
  }
    , [])

  // Effect to handle socket connection status changes
  useEffect(() => {
    if (isConnected && tokenData && tokenData.success) {
      setIsReady(true)
      setTimeout(() => navigate(`/exam/${id}`), 2000)
    }
  }
    , [isConnected, tokenData, id, navigate])

  // Effect to handle socket errors
  useEffect(() => {
    if (socketError && socketError.message) {
      setErrorState(socketError.message)
    }
  }
    , [socketError])

  // Add this new useEffect after the other useEffect blocks
  useEffect(() => {
    if (startTimeDate) {
      console.log("startTimeDate changed, initializing timer:", startTimeDate.toString())

      // Clear any existing interval
      if (timerInterval) {
        clearInterval(timerInterval)
      }

      // Update immediately
      updateTimer()

      // Set up new interval
      const newInterval = setInterval(updateTimer, 1000)
      setTimerInterval(newInterval)

      return () => {
        if (newInterval) clearInterval(newInterval)
      }
    }
  }
    , [startTimeDate, updateTimer])

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
    if (isReady && notifyMe && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Take your exam!", {
          body: "It's time to take your examination.",
          icon: "/placeholder.svg?height=64&width=64"
        })
      } catch (err) {
        console.error("Error showing notification:", err)
      }
    }
  }, [isReady, notifyMe])

  if (errorState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
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
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow"
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
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

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Your examination will begin soon</p>
                  <p className="text-muted-foreground">Please don&apos;t refresh or leave this page</p>
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
            {timeLeft.minutes > 0 || timeLeft.seconds > 0 ? (
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

