"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Bell, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function EnhancedWaitingRoom() {
  const timeCountDownMinute = 1
  const [targetTime] = useState(() => {
    const time = new Date()
    time.setMinutes(time.getMinutes() + timeCountDownMinute)
    return time
  })

  const [timeLeft, setTimeLeft] = useState({
    minutes: timeCountDownMinute,
    seconds: 0
  })

  const [notifyMe, setNotifyMe] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const difference = targetTime.getTime() - now.getTime()

      if (difference <= 0) {
        clearInterval(interval)
        setTimeLeft({ minutes: 0, seconds: 0 })
        setIsReady(true)

        // Notification when time is up
        if (notifyMe && "Notification" in window) {
          if (Notification.permission === "granted") {
            new Notification("Take your exam!", {
              body: "It's time to take your examination. Click to enter.",
              icon: "/placeholder.svg?height=64&width=64"
            })
          }
        }

        return
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [targetTime, notifyMe])

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotifyMe(true)
        }
      })
    }
  }

  return (
    !isReady
      ?
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bg-primary to-muted p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Waiting Room</CardTitle>
            <CardDescription>You have registered for the examination, please wait for the time.</CardDescription>
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

            {/* <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">People ahead of you</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <span>{usersWaiting}</span>
                <RefreshCw className="h-3 w-3 animate-spin" />
              </Badge>
            </div>
          </div> */}

            <div className="rounded-lg border bg-bg-card p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-text-primary">Your exammination will begin soon</p>
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
                  <span className="text-pretty">
                    Waiting...
                  </span>
                </div>
              )
              : (
                <div className="w-full p-2 rounded-md flex items-center text-gray-500 justify-center gap-2 bg-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Redirecting...
                  </span>
                </div>
              )
            }
          </CardFooter>
        </Card>
      </div>
      : <h2 className="text-2xl">Ready</h2>
  )
}

