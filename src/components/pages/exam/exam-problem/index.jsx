"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle2, FileText, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import TakeExam from "../take-exam"
import { useSocketExam } from "@/providers/SocketExamProvider"
import { toast } from "sonner"

export default function ExamProblems() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { problems, examData, isConnected, token, connectSocket } = useSocketExam()

  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [timeLeft, setTimeLeft] = useState(3600)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user accessed directly (not through waiting room)
  useEffect(() => {
    // If we don't have a token or connection, redirect to waiting room
    if (!token && !isConnected) {
      navigate(`/exam/${id}/wait`)
    } else {
      setLoading(false)
    }
  }, [id, token, isConnected, navigate])

  // Reconnect socket if needed
  useEffect(() => {
    if (token && !isConnected) {
      connectSocket(token)
    }
  }, [token, isConnected, connectSocket])

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

  // Set exam duration from exam data
  useEffect(() => {
    if (examData && examData.duration) {
      setTimeLeft(examData.duration)
      setIsTimerRunning(true)
    } else if (examData) {
      // Default to 1 hour if no duration specified
      setTimeLeft(3600)
      setIsTimerRunning(true)
    }
  }, [examData])

  // Timer countdown effect
  useEffect(() => {
    let interval

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          if (newTime <= 0) {
            clearInterval(interval)
            // Auto-submit when time is up
            handleSubmitExam()
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [timeLeft, isTimerRunning])

  // Handle submit exam
  const handleSubmitExam = () => {
    // Here you would implement the actual submission logic
    // For example, send a request to submit all answers

    // For now, just navigate to a completion page or show a completion message
    toast.success("Exam submitted successfully!")
    setTimeout(() => navigate("/exam"), 2000)
  }

  // If loading, show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">Loading Exam...</h1>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // If a problem is selected, show the TakeExam component
  if (selectedProblem) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex justify-between items-center p-4 bg-background">
          <Button variant="ghost" onClick={handleBackToProblems} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Problems
          </Button>
          <div className="flex items-center gap-2 bg-bg-card px-4 py-2 rounded-md">
            <span className="font-medium">Time Left: {formatTime(timeLeft)}</span>
          </div>
        </div>

        <TakeExam
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

