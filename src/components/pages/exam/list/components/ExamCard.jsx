"use client"

import CountdownTimer from "@/components/common/shared/other/countdown-timer"
import { toast } from "@/hooks/use-toast"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/providers/AuthProvider"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"
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
import ExamResultsDialog from "./ExamResult"

export default function ExamCard({
  exam,
  formatDate,
  formatTime,
  type,
  onEnrollSuccess, // New prop to handle enrollment success
  onUnenrollSuccess // New prop to handle unenrollment success
}) {
  const { apiCall } = useAuth()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState({ id: null, type: null })
  const [isLoading, setIsLoading] = useState(false)
  const [isResultsOpen, setIsResultsOpen] = useState(false)
  const [examResults, setExamResults] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(type === "mylist")

  const marginSeconds = 40000000

  // Update isEnrolled if type changes
  useEffect(() => {
    setIsEnrolled(type === "mylist")
  }, [type])

  const getSecondsUntilStart = (dateTimeString) => {
    if (!dateTimeString) return 0

    try {
      const [datePart, timePart] = dateTimeString.split(", ")
      if (!datePart || !timePart) return 0

      const [day, month, year] = datePart.split("/").map(Number)
      const [hour, minute] = timePart.split(":").map(Number)

      const startDate = new Date(year, month - 1, day, hour, minute)
      const now = new Date()

      return Math.floor((startDate - now) / 1000) // Difference in seconds
    } catch (error) {
      console.error("Error calculating seconds until start:", error)
      return 0
    }
  }

  const inFuture = (dateTimeString) => {
    if (!dateTimeString) return false

    try {
      const [datePart, timePart] = dateTimeString.split(", ")
      if (!datePart || !timePart) return false

      const [day, month, year] = datePart.split("/").map(Number)
      const [hour, minute] = timePart.split(":").map(Number)

      const inputDate = new Date(year, month - 1, day, hour, minute)
      return inputDate > new Date() // Checks if inputDate is in the future
    } catch (error) {
      console.error("Error checking if date is in future:", error)
      return false
    }
  }

  const isWithinMargin = (dateTime, marginSeconds) => {
    const givenTime = new Date(dateTime)
    const now = new Date()

    if (isNaN(givenTime)) return false

    const diffInSeconds = Math.abs((now - givenTime) / 1000)

    return diffInSeconds <= marginSeconds
  }


  const handleClickExam = async (id, actionType, canEnroll = true) => {
    if (!id) {
      console.error("Missing exam ID")
      return
    }

    // For view results, fetch and show results
    if (actionType.toLowerCase() === "view-results") {
      // Open the dialog immediately with loading state
      setExamResults(null)
      setIsResultsOpen(true)
      await fetchExamResults(id)
      return
    }

    // Store the pending action and show confirmation for unenroll
    if (actionType.toLowerCase() === "unenroll") {
      setPendingAction({ id, type: actionType.toLowerCase() })
      setIsConfirmOpen(true)
      return
    }

    // For other actions, proceed directly
    await executeAction(id, actionType, canEnroll)
  }

  const fetchExamResults = async (id) => {
    if (!id) {
      console.error("Missing exam ID")
      return
    }

    setIsLoading(true)
    try {
      const response = await apiCall(ENDPOINTS.GET_EXAM_RESULTS.replace(":id", id))

      if (response.ok) {
        const results = await response.json()
        setExamResults(results)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch exam results. Please try again.",
          variant: "destructive",
          duration: 3000
        })
        // Close the dialog if there's an error
        setIsResultsOpen(false)
      }
    } catch (error) {
      console.error("Error fetching exam results:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
        duration: 3000
      })
      // Close the dialog if there's an error
      setIsResultsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async (id, actionType, canEnroll = true) => {
    if (!id) {
      console.error("Missing exam ID")
      return
    }

    setIsLoading(true)
    try {
      if (actionType.toLowerCase() === "enroll") {
        if (!canEnroll) {
          toast({
            title: "Alert",
            description: "You have taken another exam during this time, please check your list.",
            variant: "default",
            duration: 3000
          })
          return
        }
        const response = await apiCall(ENDPOINTS.POST_ENROLL_EXAM.replace(":id", id), {
          method: "POST"
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: "You have successfully enrolled in this exam.",
            variant: "default",
            duration: 3000
          })

          // Update local state to show enrolled status
          setIsEnrolled(true)

          // Notify parent component about successful enrollment
          if (typeof onEnrollSuccess === "function") {
            onEnrollSuccess(exam)
          }
        }
      }

      if (actionType.toLowerCase() === "unenroll") {
        const response = await apiCall(ENDPOINTS.POST_UNENROLL_EXAM.replace(":id", id), {
          method: "DELETE"
        })

        if (response.ok) {
          toast({
            title: "Success",
            description: "You have been unenrolled from this exam.",
            variant: "default",
            duration: 3000
          })

          // Update local state
          setIsEnrolled(false)

          // Notify parent component about successful unenrollment
          if (typeof onUnenrollSuccess === "function") {
            onUnenrollSuccess(exam)
          }
        }
      }

      if (actionType.toLowerCase() === "join-waiting") {
        window.location.href = `/exam/${id}/wait`
      }
    } catch (error) {
      console.error("Error executing action:", error)
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
        duration: 3000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async () => {
    if (pendingAction.id && pendingAction.type) {
      await executeAction(pendingAction.id, pendingAction.type)
    }
    setIsConfirmOpen(false)
  }

  const handleCancel = () => {
    setPendingAction({ id: null, type: null })
    setIsConfirmOpen(false)
  }

  const handleCloseResultsDialog = () => {
    setIsResultsOpen(false)
    // Clear results when dialog is closed to ensure fresh data next time
    setTimeout(() => {
      setExamResults(null)
    }, 300) // Small delay to avoid UI flicker
  }

  // Ensure exam object exists
  if (!exam || !exam.code) {
    return null
  }

  return (
    <>
      <div
        className={`bg-bg-card text-text-primary rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-md ${isEnrolled && type === "pending" ? "border-2 border-primary" : ""}`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">{exam.title || "Untitled Exam"}</h3>
            {inFuture(exam.startTime) ? (
              <CountdownTimer initialSeconds={getSecondsUntilStart(exam.startTime)} />
            ) : (
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-bg-card">Live Now</span>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">
              {formatDate(exam.startTime)} - {formatDate(exam.endTime)}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-gray-600">
              {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
            </span>
          </div>
        </div>
        <div className="p-4 pt-2 border-t">
          {type === "pending" && !isEnrolled && (
            <button
              onClick={() => handleClickExam(exam.code, "enroll", exam.canEnroll)}
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm bg-primary text-bg-card hover:bg-primary-button-hover ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Processing..." : "Enroll"}
            </button>
          )}

          {type === "pending" && isEnrolled && (
            <div className="flex items-center justify-center py-2 text-primary">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Enrolled</span>
            </div>
          )}

          {type === "mylist" && (
            <button
              onClick={() =>
                handleClickExam(
                  exam.code,
                  isWithinMargin(exam.startTime, marginSeconds) ? "join-waiting" : exam.status === "NOT_STARTED" ? "unenroll" : exam.status === "STARTED" ? "view-results" : ""
                )
              }
              disabled={isLoading || (exam.status !== "NOT_STARTED" && exam.status !== "STARTED")}
              className={`w-full py-2 px-4 rounded-md font-medium text-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""} ${exam.status !== "NOT_STARTED" && exam.status !== "STARTED"
                ? "cursor-default bg-primary/70"
                : "cursor-pointer bg-primary text-bg-card hover:bg-primary-button-hover"
              }`}
            >
              {isLoading
                ? "Processing..."
                : isWithinMargin(exam.startTime, marginSeconds)
                  ? "Join"
                  : exam.status === "NOT_STARTED"
                    ? "Unenroll"
                    : exam.status === "STARTED"
                      ? "View Results"
                      : "Do not participate"}
            </button>
          )}
        </div>
      </div>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unenrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll from this exam? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-primary text-bg-card hover:bg-primary-button-hover"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exam Results Dialog */}
      <ExamResultsDialog isOpen={isResultsOpen} onClose={handleCloseResultsDialog} examResults={examResults} />
    </>
  )
}

