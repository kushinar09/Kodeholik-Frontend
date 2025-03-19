import CountdownTimer from "@/components/common/shared/other/countdown-timer"
import { Calendar, Clock } from "lucide-react"

export default function LiveExamCard({
  exam,
  formatDate,
  formatTime
}) {
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

  return (
    <div className="bg-bg-card backdrop-blur-sm rounded-lg overflow-hidden transition-all hover:shadow-lg border border-primary">
      <div className="p-4 border-b border-white/20">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white">{exam.title}</h3>
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <CountdownTimer initialSeconds={getSecondsUntilStart(exam.startTime)} />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-white/70" />
          <span className="text-white/90">
            {formatDate(exam.startTime)} - {formatDate(exam.endTime)}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2 text-white/70" />
          <span className="text-white/90">
            {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
          </span>
        </div>
      </div>
      <div className="p-4 pt-2 border-t border-white/20">
        <button
          onClick={() => window.location.href = `/exam/${exam.code}/wait`}
          className="w-full py-2 px-4 rounded-md font-medium text-sm bg-primary text-bg-card hover:bg-primary-button-hover"
        >
          Join
        </button>
      </div>
    </div>
  )
}
