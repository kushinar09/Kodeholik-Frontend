"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"
import HeaderSection from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import LoadingSkeleton from "./components/LoadingSkeleton"
import ExamCard from "./components/ExamCard"
import LiveExamCard from "./components/LiveExamCard"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/providers/AuthProvider"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSocketExam } from "@/providers/SocketExamProvider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

// Debounce function implementation
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function ExamList() {
  const { isAuthenticated, apiCall } = useAuth()
  // State for data
  const [allExams, setAllExams] = useState([])
  const [myExams, setMyExams] = useState(null)
  const navigate = useNavigate()
  // NOT_STARTED: chua bat dau
  // END: da ket thuc
  // IN_PROGRESS: dang dien ra

  // State for loading and errors
  const [loading, setLoading] = useState(true)
  const [myExamsLoading, setMyExamsLoading] = useState(false)
  const [allExamsLoading, setAllExamsLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for active tab
  const [activeTab, setActiveTab] = useState("pending")

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0)

  // State for search filters
  const [searchTitle, setSearchTitle] = useState("")
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined
  })
  const [searchStatus, setSearchStatus] = useState("ALL")

  // Function to fetch all exams
  const fetchAllExams = useCallback(async () => {
    try {
      setAllExamsLoading(true)
      // Fetch data and wait at least 300ms before stopping loading
      const [response] = await Promise.all([
        apiCall(ENDPOINTS.GET_LIST_EXAM),
        new Promise((resolve) => setTimeout(resolve, 300))
      ])

      if (!response.ok) {
        throw new Error(`Error fetching exams: ${response.status}`)
      }

      try {
        const data = await response.json()
        setAllExams(data)
      } catch (err) {
        setAllExams([])
      }
    } catch (err) {
      window.location.href = "/"
      console.error("Error fetching exams:", err)
    } finally {
      setAllExamsLoading(false)
    }
  }, [])

  // Debounced function to fetch my exams with filters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchMyExams = useCallback(
    debounce(async (page, title, dateRange, status) => {
      try {
        setMyExamsLoading(true)

        // Build query parameters
        const params = new URLSearchParams()
        if (status && status !== "ALL") params.append("status", status)
        params.append("page", page.toString())

        if (title) {
          params.append("title", title)
        }

        if (dateRange?.from || dateRange?.to) {
          if (!dateRange?.from) dateRange.from = dateRange?.to
          if (!dateRange?.to) dateRange.to = dateRange?.from
          params.append("start", format(dateRange?.from, "yyyy-MM-dd"))
          params.append("end", format(dateRange?.to, "yyyy-MM-dd"))
        }

        // Fetch data and wait at least 500ms before stopping loading
        const [response] = await Promise.all([
          apiCall(`${ENDPOINTS.GET_MY_LIST_EXAM}?${params.toString()}`),
          new Promise((resolve) => setTimeout(resolve, 500))
        ])

        if (!response.ok) {
          throw new Error(`Error fetching my exams: ${response.status}`)
        }
        try {
          const data = await response.json()
          setMyExams(data)
        } catch (err) {
          setMyExams(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch my exams")
        console.error("Error fetching exams:", err)
      } finally {
        setMyExamsLoading(false)
      }
    }, 400), // Debounce
    []
  )

  // Function to fetch my exams (wrapper for the debounced function)
  const fetchMyExams = useCallback(async () => {
    await debouncedFetchMyExams(currentPage, searchTitle, dateRange, searchStatus)
  }, [currentPage, searchTitle, dateRange, searchStatus])

  // Initial data fetch
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning("You need login to view this page")
      navigate("/")
      return
    }
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        await Promise.all([
          fetchAllExams(),
          debouncedFetchMyExams(currentPage, searchTitle, dateRange, searchStatus),
          new Promise((resolve) => setTimeout(resolve, 500))
        ])
      } catch (err) {
        console.error("Error during initial data fetch:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Show grade after submit exam
  const [showDialog, setShowDialog] = useState(false)
  const [grade, setGrade] = useState(null)

  useEffect(() => {
    const storedGrade = localStorage.getItem("grade")
    if (storedGrade) {
      setGrade(storedGrade)
      setShowDialog(true)
    }
  }, [])

  const handleCloseDialog = () => {
    setShowDialog(false)
    localStorage.removeItem("grade")
  }
  // End of show grade after submit exam

  // Add debounce for search filters
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        fetchMyExams()
      }, 500) // 500ms debounce

      return () => clearTimeout(timer)
    }
  }, [searchTitle, dateRange, fetchMyExams, loading])

  // Separate effect for pagination to avoid debounce
  useEffect(() => {
    if (!loading) {
      fetchMyExams()
    }
  }, [currentPage, fetchMyExams, loading])

  // Function to format date for display
  const formatDate = (dateString) => {
    const [datePart, timePart] = dateString.split(", ")
    const [day, month, year] = datePart.split("/").map(Number)

    const date = new Date(year, month - 1, day) // Month is 0-based in JS Date

    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  // Function to format time for display
  const formatTime = (dateString) => {
    const [datePart, timePart] = dateString.split(", ")
    const [day, month, year] = datePart.split("/").map(Number)
    const [hour, minute] = timePart.split(":").map(Number)

    const date = new Date(year, month - 1, day, hour, minute)

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
  }

  const isComingSoon = (startTime, marginSeconds) => {
    const now = new Date()

    const parseDate = (dateString) => {
      const [datePart, timePart] = dateString.split(", ")
      if (!datePart || !timePart) return null

      const [day, month, year] = datePart.split("/").map(Number)
      const [hour, minute] = timePart.split(":").map(Number)

      return new Date(year, month - 1, day, hour, minute)
    }

    const start = parseDate(startTime)
    const diffInSeconds = (start - now) / 1000
    if (!start || isNaN(start)) return false
    return diffInSeconds <= marginSeconds && diffInSeconds >= 0
  }

  // Filter exams that are happening now
  const happeningExams = myExams ? myExams.content.filter((exam) => isComingSoon(exam.startTime, 300)) : []

  // Function to clear search filters
  const clearFilters = () => {
    setSearchTitle("")
    setSearchStatus("ALL")
    setDateRange({ from: undefined, to: undefined })
    setCurrentPage(0)
  }

  function fetchAllData() {
    fetchAllExams()
    fetchMyExams(currentPage, searchTitle, dateRange, searchStatus)
  }

  const handleEnrollSuccess = () => {
    fetchAllData()
  }

  const handleUnenrollSuccess = () => {
    fetchAllData()
  }

  const handleTimeUp = (examCode) => {
    setAllExams((prevExams) => prevExams.filter(exam => exam.code !== examCode))
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <HeaderSection currentActive="exams" />
        <div className="flex-grow px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Error Loading Data</h2>
            <p>{error}</p>
            <button
              onClick={() => {
                setLoading(true)
                setError(null)
                Promise.all([fetchAllExams(), fetchMyExams()]).finally(() => setLoading(false))
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <HeaderSection currentActive="exams" />
      {loading
        ? <LoadingSkeleton />
        :
        <div className="flex-grow px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36">
          {/* Happening Now Section - Special Highlight */}
          {happeningExams.length > 0 && (
            <div className="mb-10">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-bg-card to-[#1E282C] shadow-lg">
                {/* Background pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%2398ff99\" fillOpacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
                  }}
                >
                </div>

                <div className="relative p-6 md:p-8">
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      <div className="absolute -left-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white ml-3">Coming Soon</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {happeningExams.map((exam) => (
                      <LiveExamCard key={exam.code} exam={exam} formatDate={formatDate} formatTime={formatTime} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs for Other Sections */}
          <div className="mb-6">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium text-sm sm:text-base 
                ${activeTab === "pending"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("pending")}
              >
                Upcoming Exams
                {allExams.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500 text-white">
                    {allExams.length}
                  </span>
                )}
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm sm:text-base 
                ${activeTab === "my-exams"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("my-exams")}
              >
                My Exams
                {myExams && myExams.totalElements > 0 && (
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
                {allExamsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-bg-card rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-start">
                            <div className="h-6 w-3/4 bg-bg-primary/30 rounded-md animate-pulse"></div>
                            <div className="h-6 w-20 bg-bg-primary/30 rounded-full animate-pulse"></div>
                          </div>
                          <div className="h-4 w-1/2 bg-bg-primary/30 rounded-md mt-2 animate-pulse"></div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="h-4 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                          <div className="h-4 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                        </div>
                        <div className="p-4 pt-2 border-t">
                          <div className="h-10 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allExams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allExams.map((exam) => (
                      <ExamCard
                        key={exam.code}
                        exam={exam}
                        formatDate={formatDate}
                        formatTime={formatTime}
                        type="pending"
                        onEnrollSuccess={handleEnrollSuccess}
                        onTimeUp={handleTimeUp}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-bg-card rounded-lg shadow-sm">
                    <h3 className="text-xl font-medium text-text-primary">No upcoming exams</h3>
                    <p className="mt-2 text-text-primary/70">Check back later for new exam schedules</p>
                  </div>
                )}
              </div>
            )}

            {/* My Exams */}
            {activeTab === "my-exams" && (
              <div className="space-y-6">
                {/* Search Form */}
                <div className="bg-bg-card p-4 rounded-lg shadow-sm">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="relative">
                          <input
                            id="search-title"
                            type="text"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            placeholder="Search by title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md pl-12 focus:outline-none focus:ring-1 focus:ring-primary bg-bg-primary text-text-primary"
                          />
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-input-border w-5 h-5 transition-colors group-focus-within:text-primary" />
                        </div>
                      </div>

                      <div className="flex flex-col justify-end">
                        <Select value={searchStatus ? searchStatus : "ALL"} onValueChange={(value) => setSearchStatus(value)}>
                          <SelectTrigger className="w-full h-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-bg-primary text-text-primary">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="NOT_STARTED">NOT START</SelectItem>
                            <SelectItem value="END">END</SelectItem>
                            <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <div className="grid gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                  "w-full h-full justify-start text-left font-normal bg-bg-primary text-text-primary",
                                  !dateRange?.from && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                  dateRange?.to ? (
                                    <>
                                      {format(dateRange?.from, "LLL dd, y")} - {format(dateRange?.to, "LLL dd, y")}
                                    </>
                                  ) : (
                                    format(dateRange?.from, "LLL dd, y")
                                  )
                                ) : (
                                  <span>Select date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-text-primary bg-bg-primary border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {myExamsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-bg-card rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-start">
                            <div className="h-6 w-3/4 bg-bg-primary/30 rounded-md animate-pulse"></div>
                            <div className="h-6 w-20 bg-bg-primary/30 rounded-full animate-pulse"></div>
                          </div>
                          <div className="h-4 w-1/2 bg-bg-primary/30 rounded-md mt-2 animate-pulse"></div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="h-4 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                          <div className="h-4 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                        </div>
                        <div className="p-4 pt-2 border-t">
                          <div className="h-10 w-full bg-bg-primary/30 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myExams && myExams.content.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myExams.content.map((exam) => (
                        <ExamCard
                          key={exam.code}
                          exam={exam}
                          formatDate={formatDate}
                          formatTime={formatTime}
                          type={"mylist"}
                          onUnenrollSuccess={handleUnenrollSuccess}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {myExams.totalPages > 1 && (
                      <div className="flex items-center justify-center mt-8">
                        <div className="flex flex-wrap items-center gap-1">
                          <div className="flex items-center">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                              disabled={currentPage === 0}
                              className={`p-2 px-4 rounded-md text-text-primary flex items-center gap-2 bg-bg-card ${currentPage === 0 ? "opacity-70 cursor-not-allowed" : ""
                                }`}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">Previous</span>
                            </button>
                          </div>

                          {Array.from({ length: myExams.totalPages }).map((_, index) => (
                            <div key={index}>
                              <button
                                onClick={() => setCurrentPage(index)}
                                className={`w-10 h-10 rounded-md ${currentPage === index
                                  ? "bg-primary text-bg-card font-semibold"
                                  : "text-gray-600 hover:bg-gray-50 border"
                                  }`}
                              >
                                {index + 1}
                              </button>
                            </div>
                          ))}

                          <div>
                            <button
                              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, myExams.totalPages - 1))}
                              disabled={currentPage === myExams.totalPages - 1}
                              className={`p-2 px-4 rounded-md text-text-primary flex items-center gap-2 bg-bg-card ${currentPage === myExams.totalPages - 1
                                ? "opacity-70 cursor-not-allowed"
                                : "hover:bg-gray-50"
                                }`}
                            >
                              <span className="hidden sm:inline">Next</span>
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-bg-card rounded-lg shadow-sm">
                    <h3 className="text-xl font-medium text-text-primary">
                      {searchTitle !== "" || searchStatus !== "ALL" || dateRange?.from || dateRange?.to
                        ? "No exams found"
                        : "You haven't enrolled in any exams"}
                    </h3>
                    <p className="mt-2 text-text-primary/70">
                      {searchTitle !== "" || searchStatus !== "ALL" || dateRange?.from || dateRange?.to
                        ? "Try adjusting your search filters"
                        : "Check the upcoming exams tab to find exams to participate in"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      }
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Grade</DialogTitle>
            <DialogDescription className="space-y-2 text-gray-900 text-md">
              <p>You received a grade of: <span className="text-xl font-bold">{grade ? `${parseFloat(grade).toFixed(1)}` : "No grade available."}</span></p>
              <p>You can see more details when the exam ends.</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <FooterSection />
    </div>
  )
}

