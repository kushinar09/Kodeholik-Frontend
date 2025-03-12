"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"

// Mock data for all exams
const allExams = [
  {
    code: "code4",
    title: "Test for C 2",
    startTime: "04/02/2026, 23:25",
    endTime: "05/02/2026, 01:25"
  },
  {
    code: "f10b5f86-ae42-40f1-b554-abc55a1e0078",
    title: "Exam for Java. Trial #6",
    startTime: "06/03/2026, 20:28",
    endTime: "07/03/2026, 18:25"
  },
  {
    code: "790ec861-8a7f-409a-a63d-7e5d6e2da7ef",
    title: "Exam for Java #1",
    startTime: "06/03/2026, 20:05",
    endTime: "07/03/2026, 18:25"
  },
  {
    code: "99157936-f00c-4d5e-a235-29551209e4f4",
    title: "Exam for Java #1",
    startTime: "07/03/2025, 02:54",
    endTime: "08/03/2025, 01:25"
  },
  {
    code: "10744e81-ae04-46e9-9836-00a83dc3598c",
    title: "Exam for Java #1",
    startTime: "07/03/2025, 02:54",
    endTime: "08/03/2025, 01:25"
  }
]

// Mock data for my exams (paginated)
const myExamsData = {
  content: [
    {
      code: "f10b5f86-ae42-40f1-b554-abc55a1e0078",
      title: "Exam for Java. Trial #6",
      startTime: "06/03/2026, 20:28",
      endTime: "07/03/2026, 18:25",
      status: "NOT_STARTED"
    }
  ],
  pageable: {
    pageNumber: 0,
    pageSize: 5,
    sort: {
      empty: true,
      unsorted: true,
      sorted: false
    },
    offset: 0,
    unpaged: false,
    paged: true
  },
  totalElements: 1,
  totalPages: 1,
  last: true,
  size: 5,
  number: 0,
  sort: {
    empty: true,
    unsorted: true,
    sorted: false
  },
  numberOfElements: 1,
  first: true,
  empty: false
}

export default function ExamList() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [currentPage, setCurrentPage] = useState(0)
  const [myExams, setMyExams] = useState(myExamsData)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Function to determine if an exam is happening now
  const isHappeningNow = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    return now >= start && now <= end
  }

  // Function to determine if an exam is pending
  const isPending = (startTime) => {
    const now = new Date()
    const start = new Date(startTime)
    return start > now
  }

  // Filter exams that are happening now
  const happeningExams = allExams.filter((exam) => isHappeningNow(exam.startTime, exam.endTime))

  // Filter exams that are pending
  const pendingExams = allExams.filter((exam) => isPending(exam.startTime))

  // Function to format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  // Function to format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // In a real app, you would fetch the data for the new page here
  }

  // Function to get status badge
  const getStatusBadge = (status) => {
    switch (status) {
    case "NOT_STARTED":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Not Started
        </span>
      )
    case "IN_PROGRESS":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
            In Progress
        </span>
      )
    case "COMPLETED":
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            Completed
        </span>
      )
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
          {status}
        </span>
      )
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Exam Dashboard</h1>

      {/* Happening Now Section - Special Highlight */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          {/* Background pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fillOpacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
            }}
          >
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className="relative">
                <div className="absolute -left-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <h2 className="text-2xl font-bold text-white ml-3">Happening Now</h2>
            </div>

            {happeningExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {happeningExams.map((exam) => (
                  <LiveExamCard key={exam.code} exam={exam} formatDate={formatDate} formatTime={formatTime} />
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 text-white/70" />
                <h3 className="text-xl font-medium text-white">No exams are currently in progress</h3>
                <p className="mt-2 text-white/70">Check the upcoming exams tab for scheduled exams</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Other Sections */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm sm:text-base ${
              activeTab === "pending" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Upcoming Exams
            {pendingExams.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500 text-white">
                {pendingExams.length}
              </span>
            )}
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm sm:text-base ${
              activeTab === "my-exams"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("my-exams")}
          >
            My Exams
            {myExams.totalElements > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-500 text-white">
                {myExams.totalElements}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Pending Exams */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingExams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingExams.map((exam) => (
                  <ExamCard
                    key={exam.code}
                    exam={exam}
                    status="NOT_STARTED"
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-medium text-gray-500">No upcoming exams</h3>
                <p className="mt-2 text-gray-400">Check back later for new exam schedules</p>
              </div>
            )}
          </div>
        )}

        {/* My Exams */}
        {activeTab === "my-exams" && (
          <div className="space-y-4">
            {myExams.content.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myExams.content.map((exam) => (
                    <ExamCard
                      key={exam.code}
                      exam={exam}
                      status={exam.status}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {myExams.totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (currentPage > 0) handlePageChange(currentPage - 1)
                        }}
                        disabled={currentPage === 0}
                        className={`p-2 rounded-md border ${
                          currentPage === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                        }`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>

                      {Array.from({ length: myExams.totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index)}
                          className={`px-3 py-2 rounded-md ${
                            currentPage === index
                              ? "bg-blue-50 text-blue-600 border border-blue-200 font-medium"
                              : "text-gray-600 hover:bg-gray-50 border"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => {
                          if (currentPage < myExams.totalPages - 1) handlePageChange(currentPage + 1)
                        }}
                        disabled={currentPage === myExams.totalPages - 1}
                        className={`p-2 rounded-md border ${
                          currentPage === myExams.totalPages - 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                        }`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-medium text-gray-500">You haven&apos;t enrolled in any exams</h3>
                <p className="mt-2 text-gray-400">Check the upcoming exams tab to find exams to participate in</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Live Exam Card Component (Special Highlighted Version)
function LiveExamCard({
  exam,
  formatDate,
  formatTime
}) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg overflow-hidden transition-all hover:shadow-lg border border-white/30">
      <div className="p-4 border-b border-white/20">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white">{exam.title}</h3>
          <div className="flex items-center">
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500 text-white">Live Now</span>
          </div>
        </div>
        <p className="text-xs text-white/70 truncate mt-1">Exam Code: {exam.code}</p>
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
        <button className="w-full py-2 px-4 rounded-md font-medium text-sm bg-white text-blue-600 hover:bg-white/90 transition-colors">
          Enter Exam Now
        </button>
      </div>
    </div>
  )
}

// Regular Exam Card Component
function ExamCard({
  exam,
  status,
  formatDate,
  formatTime,
  getStatusBadge
}) {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium">{exam.title}</h3>
          {getStatusBadge(status)}
        </div>
        <p className="text-xs text-gray-500 truncate mt-1">Exam Code: {exam.code}</p>
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
        <button
          className={`w-full py-2 px-4 rounded-md font-medium text-sm ${
            status === "IN_PROGRESS"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
          disabled={status === "NOT_STARTED"}
        >
          {status === "IN_PROGRESS" ? "Enter Exam" : status === "COMPLETED" ? "View Results" : "Not Available Yet"}
        </button>
      </div>
    </div>
  )
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="h-10 w-64 bg-gray-200 rounded-md mx-auto mb-8 animate-pulse"></div>

      {/* Happening Now Skeleton */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600/40 to-purple-600/40 shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-4">
            <div className="h-8 w-40 bg-white/30 rounded-md animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white/20 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-white/20">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-3/4 bg-white/30 rounded-md animate-pulse"></div>
                    <div className="h-6 w-20 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-1/2 bg-white/30 rounded-md mt-2 animate-pulse"></div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-4 w-full bg-white/30 rounded-md animate-pulse"></div>
                  <div className="h-4 w-full bg-white/30 rounded-md animate-pulse"></div>
                </div>
                <div className="p-4 pt-2 border-t border-white/20">
                  <div className="h-10 w-full bg-white/30 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex border-b">
          <div className="h-10 w-32 bg-gray-200 rounded-md mr-4 animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ExamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ExamCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="h-4 w-1/2 bg-gray-200 rounded-md mt-2 animate-pulse"></div>
      </div>
      <div className="p-4 space-y-4">
        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
      </div>
      <div className="p-4 pt-2 border-t">
        <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}

