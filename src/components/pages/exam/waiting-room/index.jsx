"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Bell, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ENDPOINTS } from "@/lib/constants"
import { useParams } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

export default function EnhancedWaitingRoom() {
  const { id } = useParams()

  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 })
  const [notifyMe, setNotifyMe] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [examStartTime, setExamStartTime] = useState("")

  useEffect(() => {
    async function fetchExamStatus() {
      try {
        const response = await fetch(ENDPOINTS.GET_TOKEN_EXAM.replace(":id", id))
        const data = await response.json()

        if (!response.ok) {
          console.error("API Error:", data)
          const dateRegex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/
          if (dateRegex.test(data.detail)) {
            setExamStartTime(data.detail)
          } else {
            toast.error("Exam access denied. Redirecting...")
            // navigate("/exam")
          }
        }

        if (!data || !data.Code) {
          setErrorMessage("Exam data is empty or invalid")
          return
        }

        const now = new Date()
        const timeDifference = new Date(examStartTime.replace(" ", "T")).getTime() - now.getTime()

        if (timeDifference <= 0) {
          setIsReady(true)
          return
        }

        setTimeLeft({
          minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((timeDifference % (1000 * 60)) / 1000)
        })

        const interval = setInterval(() => {
          const now = new Date()
          const difference = examStartTime.getTime() - now.getTime()

          if (difference <= 0) {
            clearInterval(interval)
            setTimeLeft({ minutes: 0, seconds: 0 })
            setIsReady(true)
            if (notifyMe && "Notification" in window && Notification.permission === "granted") {
              new Notification("Take your exam!", { body: "It's time to take your examination.", icon: "/placeholder.svg?height=64&width=64" })
            }
            return
          }

          setTimeLeft({
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          })
        }, 1000)

        return () => clearInterval(interval)
      } catch (error) {
        setErrorMessage(error.message)
      }
    }

    fetchExamStatus()
  }, [notifyMe])

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifyMe(true)
        }
      })
    }
  }

  if (errorMessage) {
    return <div className="text-red-500 text-center">{errorMessage}</div>
  }

  return (
    !isReady ? (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bg-primary to-muted p-4">
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

            <div className="rounded-lg border bg-bg-card p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary">Your examination will begin soon</p>
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
            {(timeLeft.minutes > 0 || timeLeft.seconds > 0)
              ? (
                <div className="w-full p-2 rounded-md flex items-center text-gray-500 justify-center gap-2 border-2">
                  <span>Waiting...</span>
                </div>
              )
              : (
                <div className="w-full p-2 rounded-md flex items-center text-gray-500 justify-center gap-2 bg-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Redirecting...</span>
                </div>
              )
            }
          </CardFooter>
        </Card>
      </div>
    ) : <h2 className="text-2xl">Ready</h2>
  )
}
