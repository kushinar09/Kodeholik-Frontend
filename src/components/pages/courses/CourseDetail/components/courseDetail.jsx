"use client"

import { useAuth } from "@/providers/AuthProvider"
import {
  ArrowLeft,
  Star,
  BookOpen,
  Clock,
  CheckCircle,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Users,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import { useState, useRef, useEffect } from "react"

export default function CourseDetail({
  course,
  loading,
  error,
  navigate,
  open,
  setOpen,
  processing,
  handleEnroll,
  handleUnenroll,
  totalLessons,
  completedLessons,
  completionPercentage,
  isEnrolled,
}) {
  const { isAuthenticated } = useAuth()

  const [showFullDescription, setShowFullDescription] = useState(false)
  const descriptionRef = useRef(null)
  const [descriptionOverflows, setDescriptionOverflows] = useState(false)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    const checkContentHeight = () => {
      if (descriptionRef.current) {
        const height = descriptionRef.current.scrollHeight
        setContentHeight(height)
        setDescriptionOverflows(height > 300) // Reduced from 500 for mobile
      }
    }

    // Initial check
    checkContentHeight()

    // Set up a resize observer to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      checkContentHeight()
    })

    if (descriptionRef.current) {
      resizeObserver.observe(descriptionRef.current)
    }

    // Add a small delay to check again after content might have rendered
    const timer = setTimeout(() => {
      checkContentHeight()
    }, 100)

    return () => {
      if (descriptionRef.current) {
        resizeObserver.unobserve(descriptionRef.current)
      }
      clearTimeout(timer)
    }
  }, [course?.description])

  if (loading) {
    return (
      <div className="py-4 sm:py-8">
        <div className="flex items-center mb-4 sm:mb-8">
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 bg-gray-700 rounded-md" />
        </div>
        <Card className="bg-gray-800/50 border-gray-700 shadow-xl mb-4 sm:mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 p-4 sm:p-8">
                <Skeleton className="h-6 sm:h-8 w-3/4 bg-gray-700 mb-4" />
                <div className="flex gap-2 sm:gap-3 mb-4">
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-700 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-700 rounded-full" />
                </div>
                <Skeleton className="h-24 sm:h-32 w-full bg-gray-700 mb-4 sm:mb-6 rounded-lg" />
                <div className="flex gap-2 sm:gap-3">
                  <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-700 rounded-md" />
                  <Skeleton className="h-8 sm:h-10 w-32 sm:w-40 bg-gray-700 rounded-md" />
                </div>
              </div>
              <div className="w-full md:w-1/3 bg-gray-900/50 p-4 sm:p-8 flex flex-col items-center justify-center">
                <Skeleton className="h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-gray-700 mb-4 sm:mb-6" />
                <Skeleton className="h-8 sm:h-10 w-full bg-gray-700 rounded-lg mb-3" />
                <Skeleton className="h-8 sm:h-10 w-full bg-gray-700 rounded-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 sm:py-8">
        <div className="flex flex-col items-center justify-center h-[40vh] sm:h-[60vh]">
          <div className="bg-red-500/10 p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 text-center">Error Loading Course</h2>
          <p className="text-red-400 mb-6 sm:mb-8 text-center max-w-md px-4">{error}</p>
          <Button onClick={() => navigate(-1)} size="lg" className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="py-4 sm:py-8">
        <div className="flex flex-col items-center justify-center h-[40vh] sm:h-[60vh]">
          <div className="bg-yellow-500/10 p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">Course Not Found</h2>
          <Button onClick={() => navigate(-1)} size="lg" className="gap-2">
            <ArrowLeft className="h-5 w-5" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  const handleLearn = () => {
    navigate(`/learn/${course.id}`)
  }

  const formatLastUpdated = (updatedAt) => {
    if (!updatedAt) return "Unknown"
    const [datePart, timePart] = updatedAt.split(", ")
    const [day, month, year] = datePart.split("/").map(Number)
    const [hours, minutes] = timePart.split(":").map(Number)
    const updatedDate = new Date(year, month - 1, day, hours, minutes)
    const currentDate = new Date()
    const diffMs = currentDate - updatedDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`
    if (diffDays < 30 && diffDays > 0) return `${Math.floor(diffDays / 7)} weeks ago`
    return updatedDate.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div className="py-4 sm:py-8 animate-in fade-in duration-500">
      <Card className="bg-gray-800/50 border-gray-700 shadow-xl mb-4 sm:mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/3 p-4 sm:p-8 pt-4">
              <Button
                variant="ghost"
                className="mb-4 text-primary hover:bg-primary hover:text-bg-card transition group flex items-center"
                onClick={() => navigate("/courses")}
              >
                <ChevronLeft className="mr-1 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium text-sm sm:text-base">Back to Courses</span>
              </Button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 leading-tight">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-2 sm:px-3 py-1 rounded-full">
                        <Star className="fill-yellow-400 h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="text-xs font-medium">{course.rate || "N/A"}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Course Rating</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 px-2 sm:px-3 py-1 text-xs">
                        <Users className="h-3 w-3 mr-1" /> {course.numberOfParticipant} Students
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enrolled Students</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Card className="bg-gray-900/50 border-gray-700/50 mb-4">
                <CardContent className="p-3 sm:p-4">
                  {course?.description ? (
                    <div className="relative">
                      <ScrollArea
                        ref={descriptionRef}
                        className={`pr-2 sm:pr-4 pt-2 sm:pt-4 ${!showFullDescription ? "max-h-[200px] sm:max-h-[300px] md:max-h-[500px] overflow-hidden" : ""}`}
                      >
                        <RenderMarkdown
                          className="text-text-primary leading-relaxed text-sm sm:text-base"
                          content={course.description}
                        />
                      </ScrollArea>
                      {descriptionOverflows && (
                        <div
                          className={`${
                            !showFullDescription
                              ? "absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-gray-900/90 to-transparent flex items-end justify-center pb-2"
                              : "mt-4 text-center"
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                          >
                            {showFullDescription ? "View Less" : "View More"}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-gray-400 italic text-center text-sm sm:text-base">
                      No description available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Show progress only if authenticated and enrolled */}
              {isAuthenticated && isEnrolled && (
                <Card className="bg-gray-900/50 border-gray-700/50 mt-2">
                  <CardHeader className="pb-2 p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" /> Your Progress
                    </h3>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs sm:text-sm text-gray-300">Course Completion</span>
                      <span className="text-xs sm:text-sm font-medium text-primary">
                        {completionPercentage.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={completionPercentage} className="h-1.5 sm:h-2" />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>
                        {completedLessons} of {totalLessons} lessons completed
                      </span>
                      {completionPercentage === 100 && (
                        <span className="text-green-400 font-medium">Course Completed!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="w-full md:w-1/3 bg-gray-900/80 p-4 sm:p-8">
              <div className="sticky top-8 w-full flex flex-col items-center">
                <div className="relative mb-4 sm:mb-6 group">
                  {course.image ? (
                    <div className="relative">
                      <div className="absolute inset-0 aspect-square bg-primary/20 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        loading="lazy"
                        src={course.image || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full max-w-64 h-auto aspect-square object-cover rounded-full border-4 border-primary/30 shadow-lg shadow-primary/20 relative transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-70"></div>
                      <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gray-800 flex items-center justify-center relative z-10 border-4 border-primary/30">
                        <BookOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-600" />
                      </div>
                    </div>
                  )}
                  {isEnrolled && (
                    <Badge className="absolute bottom-2 right-2 z-20 bg-primary text-black px-2 sm:px-3 py-0.5 text-xs sm:text-sm">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Enrolled
                    </Badge>
                  )}
                </div>

                <div className="w-full space-y-3 sm:space-y-4 mt-2">
                  <Card className="bg-gray-800/80 border-gray-700/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                          <span className="text-sm text-gray-300">Duration</span>
                        </div>
                        <span className="text-sm sm:text-base text-white font-medium">4 weeks</span>
                      </div>
                    </CardContent>
                  </Card>

                  {completionPercentage === 100 && (
                    <Card className="bg-gray-800/80 border-gray-700/50">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-400" />
                            <span className="text-sm text-gray-300">Status</span>
                          </div>
                          <span className="text-sm sm:text-base text-green-400 font-medium">Completed</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gray-800/80 border-gray-700/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                          <span className="text-sm text-gray-300">Last Updated</span>
                        </div>
                        <span className="text-sm sm:text-base text-white font-medium">
                          {formatLastUpdated(course.updatedAt)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Show buttons only if authenticated */}
                  {isAuthenticated && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                      {isEnrolled ? (
                        <>
                          <Button
                            size="lg"
                            className="w-full gap-2 bg-primary text-black hover:bg-primary/90 hover:text-black transition-all duration-300 shadow-md shadow-primary/20 text-sm sm:text-base py-2 sm:py-3"
                            onClick={handleLearn}
                          >
                            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" /> Continue Learning
                          </Button>
                          {completionPercentage !== 100 && (
                            <Dialog open={open} onOpenChange={setOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="lg"
                                  disabled={processing}
                                  className="w-full gap-2 bg-red-800 text-white hover:bg-red-900 transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
                                >
                                  {processing ? (
                                    "Processing..."
                                  ) : (
                                    <>
                                      <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" /> Unenroll
                                    </>
                                  )}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-[90vw] sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="text-lg sm:text-xl">Confirm Unenrollment</DialogTitle>
                                  <DialogDescription className="text-gray-300 mt-2 text-sm sm:text-base">
                                    Are you sure you want to unenroll from this course? You may lose your progress.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex justify-end gap-2 mt-4 sm:mt-6">
                                  <Button
                                    onClick={() => setOpen(false)}
                                    disabled={processing}
                                    className="bg-primary text-black hover:bg-primary/90 text-sm sm:text-base"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={handleUnenroll}
                                    disabled={processing}
                                    className="text-sm sm:text-base"
                                  >
                                    {processing ? "Unenrolling..." : "Yes, Unenroll"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      ) : (
                        <Dialog open={open} onOpenChange={setOpen}>
                          <DialogTrigger asChild>
                            <Button
                              disabled={processing}
                              size="lg"
                              className="w-full gap-2 bg-primary text-black hover:bg-primary/90 hover:text-black transition-all duration-300 shadow-md shadow-primary/20 text-sm sm:text-base py-2 sm:py-3"
                            >
                              {processing ? (
                                "Processing..."
                              ) : (
                                <>
                                  <BookmarkCheck className="h-4 w-4 sm:h-5 sm:w-5" /> Enroll in Course
                                </>
                              )}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-[90vw] sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-xl">Confirm Enrollment</DialogTitle>
                              <DialogDescription className="text-gray-300 mt-2 text-sm sm:text-base">
                                Do you want to enroll in this course? You&apos;ll get immediate access to all available
                                materials.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-2 mt-4 sm:mt-6">
                              <Button
                                onClick={() => setOpen(false)}
                                disabled={processing}
                                className="bg-primary text-black hover:bg-primary/90 text-sm sm:text-base"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleEnroll}
                                disabled={processing}
                                className="bg-primary text-black hover:bg-primary/90 text-sm sm:text-base"
                              >
                                {processing ? "Enrolling..." : "Yes, Enroll"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
