import { Calendar, Clock } from "lucide-react"

export default function LiveExamCard({
  exam,
  formatDate,
  formatTime
}) {
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
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary text-bg-card">Live Now</span>
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
      {/* <div className="p-4 pt-2 border-t border-white/20">
        <button className="w-full py-2 px-4 rounded-md font-medium text-sm bg-white text-blue-600 hover:bg-white/90 transition-colors">
          Enter Exam Now
        </button>
      </div> */}
    </div>
  )
}
