"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import TakeExam from "../take-exam"
import { useSocketExam } from "@/providers/SocketExamProvider"
import { toast } from "sonner"
import { useAuth } from "@/providers/AuthProvider"
import { ENDPOINTS } from "@/lib/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"

export default function ExamProblems() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { problems, examData, isConnected, token, examCode, username, duration, connectSocket, submitExamAnswers } =
    useSocketExam()
  const { apiCall } = useAuth()

  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [storeCode, setStoreCode] = useState([])

  // Add state for confirmation dialogs
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use refs for values that shouldn't trigger re-renders
  const isMountedRef = useRef(true)
  const lastConnectionAttemptRef = useRef(0)
  const timerIntervalRef = useRef(null)
  const examStartTimeRef = useRef(null)

  // Load stored code from localStorage
  useEffect(() => {
    try {
      const storedCode = localStorage.getItem("tempCode")
      if (storedCode) {
        const parsedCode = JSON.parse(storedCode)
        setStoreCode(Array.isArray(parsedCode) ? parsedCode : [])
      }
    } catch (err) {
      console.error("Error loading stored code:", err)
      setStoreCode([])
    }
  }, [])

  // Replace the existing beforeunload event handler with this improved version
  useEffect(() => {
    // Handle beforeunload (tab close, refresh, etc.)
    const handleBeforeUnload = (e) => {
      if (isTimerRunning) {
        e.preventDefault()
        // Standard way to show a confirmation dialog before unloading
        e.returnValue = "You have an exam in progress. Are you sure you want to leave? Your progress may be lost."
        return e.returnValue
      }
    }

    // Handle browser back button with the History API
    const handlePopState = (e) => {
      if (isTimerRunning) {
        // Show a custom confirmation dialog
        const confirmLeave = window.confirm(
          "You have an exam in progress. Are you sure you want to leave? Your progress may be lost."
        )

        if (confirmLeave) {
          // User confirmed leaving - clean up localStorage
          localStorage.removeItem("tempData")
          localStorage.removeItem("tempCode")
        } else {
          // User canceled - prevent navigation by pushing the current state again
          // This effectively cancels the back button action
          window.history.pushState(null, "", window.location.pathname)
        }
      }
    }

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("popstate", handlePopState)

    // Push an initial state to enable popstate handling
    window.history.pushState(null, "", window.location.pathname)

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isTimerRunning])

  // Check if user accessed directly (not through waiting room)
  useEffect(() => {
    isMountedRef.current = true

    const checkAccess = async () => {
      if (!isMountedRef.current) return

      // Rate limit connection attempts
      const now = Date.now()
      if (now - lastConnectionAttemptRef.current < 3000) return
      lastConnectionAttemptRef.current = now

      // If we don't have a token or connection after multiple attempts, redirect to waiting room
      if (!token && !isConnected && connectionAttempts > 2) {
        toast.error("Session not found. Redirecting to waiting room...")
        navigate(`/exam/${id}/wait`)
        return
      }

      // If we have token but not connected, try to connect
      if (token && !isConnected && connectionAttempts < 3) {
        if (isMountedRef.current) {
          setConnectionAttempts((prev) => prev + 1)
        }
        try {
          await connectSocket(token, examCode, username)
        } catch (error) {
          console.error("Connection error:", error)
        }
      } else if (isConnected) {
        // We're connected, stop loading
        if (isMountedRef.current) {
          setLoading(false)
        }
      } else if (!token && connectionAttempts < 3) {
        // No token yet, but we'll try a few times
        if (isMountedRef.current) {
          setConnectionAttempts((prev) => prev + 1)
        }
      }
    }

    // Call once immediately
    checkAccess()

    // Set up interval to check connection status - with a longer delay
    const interval = setInterval(checkAccess, 5000) // Increased to 5 seconds

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [id, token, isConnected, connectionAttempts, navigate, connectSocket, examCode, username])

  // Calculate remaining time based on stored data or exam data
  useEffect(() => {
    if (!isMountedRef.current) return

    try {
      const storedData = localStorage.getItem("tempData")

      if (storedData) {
        const parsedData = JSON.parse(storedData)

        if (parsedData.duration && parsedData.lastActiveTime) {
          // Calculate elapsed time since last activity
          const now = new Date().getTime()
          const lastActive = parsedData.lastActiveTime
          const elapsedSeconds = Math.floor((now - lastActive) / 1000)

          // Calculate remaining time
          const remainingTime = Math.max(0, parsedData.duration - elapsedSeconds)

          // Set the time left
          setTimeLeft(remainingTime)
          examStartTimeRef.current = new Date(now - elapsedSeconds * 1000)
          console.log(`Restored exam timer: ${remainingTime}s remaining`)
        } else if (duration) {
          // If we have duration from the provider but no lastActiveTime
          setTimeLeft(duration)
          examStartTimeRef.current = new Date()
        }
      } else if (duration) {
        // Fresh exam start
        setTimeLeft(duration)
        examStartTimeRef.current = new Date()

        // Initialize tempData with current time
        if (token && examCode && username) {
          localStorage.setItem(
            "tempData",
            JSON.stringify({
              token,
              code: examCode,
              username,
              problems,
              duration,
              lastActiveTime: new Date().getTime()
            })
          )
        }
      }

      setIsTimerRunning(true)
    } catch (err) {
      console.error("Error calculating remaining time:", err)
      if (duration) {
        setTimeLeft(duration)
      }
    }
  }, [duration, problems, token, examCode, username])

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      remainingSeconds.toString().padStart(2, "0")
    ].join(":")
  }

  // Handle problem click - show problem details
  const handleProblemClick = (problem) => {
    setSelectedProblem(problem)
  }

  const handleChangeProblem = (direction) => {
    if (direction === -1) {
      const index = problems.findIndex((problem) => problem.id === selectedProblem.id)
      setSelectedProblem(problems[index - 1] || problems[problems.length - 1] || null)
    }
    if (direction === 1) {
      const index = problems.findIndex((problem) => problem.id === selectedProblem.id)
      setSelectedProblem(problems[index + 1] || problems[0] || null)
    }
  }

  // Handle back to problems list
  const handleBackToProblems = () => {
    setSelectedProblem(null)
  }

  const handleRunCode = async (code, language, problemLink) => {
    try {
      const response = await apiCall(ENDPOINTS.POST_RUN_EXAM.replace(":idProblem", problemLink).replace(":id", id), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          languageName: language
        })
      })
      return response.json()
    } catch (e) {
      toast.error("Compile error: " + e.message)
      return { status: false, message: e }
    }
  }

  const handleCodeChange = (code, language, problemLink) => {
    setStoreCode((prevStoreCode) => {
      const existingIndex = prevStoreCode.findIndex((item) => item.problemLink === problemLink)

      if (existingIndex !== -1) {
        const updatedCode = prevStoreCode.map((item) =>
          item.problemLink === problemLink
            ? {
              ...item,
              code: code,
              languageName: language
            }
            : item
        )

        // Save to localStorage immediately
        localStorage.setItem("tempCode", JSON.stringify(updatedCode))
        return updatedCode
      } else {
        const newCode = [
          ...prevStoreCode,
          {
            problemLink: problemLink,
            code: code,
            languageName: language
          }
        ]

        // Save to localStorage immediately
        localStorage.setItem("tempCode", JSON.stringify(newCode))
        return newCode
      }
    })
  }

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return

    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    timerIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1

        // Update lastActiveTime in localStorage
        try {
          const storedData = localStorage.getItem("tempData")
          if (storedData) {
            const parsedData = JSON.parse(storedData)
            parsedData.lastActiveTime = new Date().getTime()
            localStorage.setItem("tempData", JSON.stringify(parsedData))
          }
        } catch (err) {
          console.error("Error updating lastActiveTime in timer:", err)
        }

        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current)
          // Auto-submit when time is up
          performSubmitExam()
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [isTimerRunning, timeLeft])

  // Show confirmation dialog before submitting
  const handleSubmitExam = () => {
    if (!isMountedRef.current) return
    setShowSubmitDialog(true)
  }

  // Actual submission logic
  const performSubmitExam = () => {
    if (!isMountedRef.current || isSubmitting) return

    setIsSubmitting(true)

    // Submit exam answers
    if (submitExamAnswers(id, storeCode)) {
      toast.success("Exam submitted successfully!")

      // Stop the timer
      setIsTimerRunning(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }

      // Clear localStorage
      localStorage.removeItem("tempData")
      localStorage.removeItem("tempCode")

      // Navigate after a short delay
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate("/exam")
        }
      }, 2000)
    } else {
      toast.error("Error submitting exam!")
      setIsSubmitting(false)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Loading Exam...</h1>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {connectionAttempts > 0 ? "Attempting to connect..." : "Initializing exam..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If a problem is selected, show the TakeExam component
  if (selectedProblem) {
    return (
      <div className="flex flex-col h-screen">
        <TakeExam
          key={selectedProblem.id}
          idExam={id}
          timeLeft={timeLeft}
          handleBackToProblems={handleBackToProblems}
          problemLink={selectedProblem.link || ""}
          problemTitle={selectedProblem.title}
          problemDescription={selectedProblem.description}
          compileInformation={selectedProblem.compileInfo}
          codeStore={storeCode.find((i) => i.problemLink === selectedProblem.link)?.code || ""}
          languageStore={storeCode.find((i) => i.problemLink === selectedProblem.link)?.languageName || ""}
          onRun={handleRunCode}
          onCodeChange={handleCodeChange}
          handleChangeProblem={handleChangeProblem}
        />
      </div>
    )
  }

  if (!problems || problems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Loading Exam Problems...</h1>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-bg-primary to-bg-primary/80 p-4">
      <Card className="w-full max-w-md shadow-lg bg-bg-card text-text-primary border-none">
        <CardHeader className="text-center border-b pb-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Exam Problems</h1>
            </div>
            <div className="font-semibold text-lg">
              Time Left: <span className="font-bold text-xl text-primary">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="space-y-3 px-2 py-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center cursor-pointer hover:bg-gray-500 hover:text-bg-card transition-colors rounded-md p-1 px-4"
                  onClick={() => handleProblemClick(problem)}
                >
                  <div className="w-1 h-12 bg-blue-500 rounded-full mr-3"></div>
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-medium text-primary">{problem.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 pt-0 mt-4 flex justify-center">
            <Button className="px-8 text-bg-card" onClick={handleSubmitExam} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Exam"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to submit your exam?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performSubmitExam}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

