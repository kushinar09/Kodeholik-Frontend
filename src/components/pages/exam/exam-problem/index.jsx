"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle2, FileText, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import TakeExam from "../take-exam"
import { useSocketExam } from "@/providers/SocketExamProvider"
import { toast } from "sonner"

export default function ExamProblems() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { problems, examData, isConnected, token, examCode, connectSocket } = useSocketExam()

  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [timeLeft, setTimeLeft] = useState(3600)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  // Use refs for values that shouldn't trigger re-renders
  const isMountedRef = useRef(true)
  const lastConnectionAttemptRef = useRef(0)
  const timerIntervalRef = useRef(null)

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
          await connectSocket(token, examCode)
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
  }, [id, token, isConnected, connectionAttempts, navigate, connectSocket, examCode])

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      remainingSeconds.toString().padStart(2, "0"),
    ].join(":")
  }

  // Handle problem click - show problem details
  const handleProblemClick = (problem) => {
    setSelectedProblem(problem)
  }

  // Handle back to problems list
  const handleBackToProblems = () => {
    setSelectedProblem(null)
  }

  // Set exam duration from exam data - only when examData changes
  useEffect(() => {
    if (!examData || !isMountedRef.current) return

    // Only update if the value would actually change
    const newDuration = examData.duration || 3600

    if (newDuration !== timeLeft) {
      setTimeLeft(newDuration)
      setIsTimerRunning(true)
    }
  }, [examData, timeLeft])

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
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current)
          // Auto-submit when time is up
          handleSubmitExam()
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
  }, [isTimerRunning])

  // Handle submit exam
  const handleSubmitExam = () => {
    if (!isMountedRef.current) return

    // Here you would implement the actual submission logic
    toast.success("Exam submitted successfully!")

    // Use a ref to track if we've already navigated
    if (!handleSubmitExam.hasNavigated) {
      handleSubmitExam.hasNavigated = true
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate("/exam")
        }
      }, 2000)
    }
  }

  // Initialize the static property
  handleSubmitExam.hasNavigated = false

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
          timeLeft={formatTime(timeLeft)}
          handleBackToProblems={handleBackToProblems}
          problemTitle={selectedProblem.title}
          problemDescription={selectedProblem.description}
          compileInformation={selectedProblem.compileInfo}
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
    <div className="flex items-center justify-center min-h-screen bg-bg-primary p-4">
      <Card className="w-full max-w-md shadow-lg bg-bg-card text-text-primary border-none">
        <CardHeader className="text-center border-b pb-4">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              <h1 className="text-2xl font-bold">Exam Problems</h1>
            </div>
            <div className="font-semibold text-lg">
              Time Left: <span className="font-bold text-xl">{formatTime(timeLeft)}</span>
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
                    <div className="flex items-center gap-2">
                      {problem.status === "unsolved" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      <span>{problem.score}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 pt-0 mt-4 flex justify-center">
            <Button className="px-8 text-bg-card" onClick={handleSubmitExam}>
              Submit Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

