"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Menu
} from "lucide-react"
import { getCourse, courseRegisterIn, courseRegisterOUT, completedAndSendMail } from "@/lib/api/course_api"
import { getLessonById, completedLesson, downloadFileLesson } from "@/lib/api/lesson_api"
import VideoLesson from "./components/videoLesson"
import DocumentLesson from "./components/documentLesson"
import CourseOutline from "./components/courseOutline"
import FooterSection from "@/components/common/shared/footer"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import CourseDiscussion from "@/components/pages/courses/CourseDetail/components/CourseDiscussion"
import HeaderSection from "@/components/common/shared/header"
import { useAuth } from "@/providers/AuthProvider"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function LearnThroughVideoAndText() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [resourceError, setResourceError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [activeAccordion, setActiveAccordion] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, apiCall } = useAuth()

  // useEffect for course registration IN/OUT with debugging logs
  useEffect(() => {
    const registerIn = async () => {
      try {
        await courseRegisterIn(apiCall, id)
      } catch (err) {
        console.error("[Registration] courseRegisterIn failed:", err)
      }
    }

    if (id) {
      registerIn()
    } else {
      console.warn("[Registration] No course ID provided, skipping registerIn")
    }

    const registerOut = async () => {
      try {
        await courseRegisterOUT(apiCall, id)
      } catch (err) {
        console.error("[Registration] courseRegisterOUT failed:", err)
      }
    }

    window.addEventListener("beforeunload", () => {
      registerOut()
    })

    return () => {
      registerOut()
      window.removeEventListener("beforeunload", registerOut)
    }
  }, [id])

  // useEffect for fetching course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) {
        setError("Course ID is missing")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const courseData = await getCourse(apiCall, id)
        setCourse(courseData)
        setChapters(courseData.chapters || [])

        if (courseData.chapters && courseData.chapters.length > 0) {
          // Try to find a chapter with lessons
          let chapterWithLessons = null

          chapterWithLessons = courseData.chapters.find((chapter) => chapter.lessons && chapter.lessons.length > 0)
          if (chapterWithLessons) {
            // Found a chapter with lessons
            setSelectedChapter(chapterWithLessons)
            setActiveAccordion(`chapter-${chapterWithLessons.id}`)
            await handleLessonSelect(chapterWithLessons.lessons[0], chapterWithLessons)
          } else {
            // No chapter has lessons
            const firstChapter = courseData.chapters[0]
            setSelectedChapter(firstChapter)
            setActiveAccordion(`chapter-${firstChapter.id}`)
            setSelectedLesson({ id: "empty", title: "No Content", type: "EMPTY" })
            setResourceError("This course doesn't have any lesson content yet.")
          }
        } else setSelectedLesson({ id: "empty", title: "No Content", type: "EMPTY" })

        const apiProgress = courseData.progress
        if (apiProgress !== null && apiProgress !== undefined) {
          setProgress(apiProgress)
        } else {
          const totalLessons = courseData.chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
          const completedLessons = courseData.chapters.reduce(
            (sum, chapter) => sum + (chapter.lessons?.filter((l) => l.completed).length || 0),
            0
          )
          setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0)
        }
      } catch (err) {
        setError(`Failed to load course data: ${err.message}`)
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [id])

  const handleLessonSelect = async (lesson, chapter = null) => {
    setSelectedLesson(lesson)
    if (chapter) setSelectedChapter(chapter)
    setVideoUrl(null)
    setResourceError(null)
    setShowMobileMenu(false) // Close mobile menu when selecting a lesson

    try {
      const lessonDetails = await getLessonById(apiCall, lesson.id)
      setSelectedLesson((prevLesson) => ({
        ...prevLesson,
        ...lessonDetails
      }))

      if (lessonDetails.type === "VIDEO" && lessonDetails.videoUrl) {
        if (lessonDetails.videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
          setVideoUrl(lessonDetails.videoUrl)
        } else if (lessonDetails.videoUrl.startsWith("http")) {
          setVideoUrl(lessonDetails.videoUrl)
        } else {
          setResourceError("Invalid video URL provided for this lesson")
        }
      } else if (lessonDetails.type === "VIDEO" && !lessonDetails.videoUrl) {
        setResourceError("No video URL provided for this lesson")
      }
    } catch (err) {
      console.error("Failed to fetch lesson resource:", err)
      setResourceError(`Failed to load resource: ${err.message}`)
      if (lesson.type === "VIDEO") setVideoUrl(null)
    }
  }

  const handleDownload = async () => {
    if (!selectedLesson || !selectedLesson.attachedFile) return

    try {
      const fileUrl = await downloadFileLesson(apiCall, selectedLesson.attachedFile)
      if (!fileUrl.status) {
        throw new Error(fileUrl.data || "Unknown error")
      } else {
        const link = document.createElement("a")
        link.href = fileUrl.data
        link.download = selectedLesson.attachedFile.includes("lessons/")
          ? selectedLesson.attachedFile.replace("lessons/", "").split("-").pop()
          : selectedLesson.attachedFile
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      toast.error("Failed to download file", {
        description: err.message
      })
    }
  }

  const handleMarkComplete = async () => {
    try {
      await completedLesson(selectedLesson.id, async (url, options) => {
        const response = await fetch(url, options)
        return response
      })

      const updatedLesson = { ...selectedLesson, completed: true }
      setSelectedLesson(updatedLesson)

      setChapters((prevChapters) =>
        prevChapters.map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons.map((lesson) => (lesson.id === selectedLesson.id ? updatedLesson : lesson))
        }))
      )

      const updatedCourse = await getCourse(apiCall, id)
      const apiProgress = updatedCourse.progress
      let newProgress

      if (apiProgress !== null && apiProgress !== undefined) {
        newProgress = apiProgress
        setProgress(newProgress)
      } else {
        const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
        const completedLessons = chapters.reduce(
          (sum, chapter) =>
            sum + (chapter.lessons?.filter((l) => l.completed || l.id === selectedLesson.id).length || 0),
          0
        )
        newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
        setProgress(newProgress)
      }

      // Check if progress is 100% and call completedAndSendMail
      if (newProgress >= 100) {
        try {
          await completedAndSendMail(id)
        } catch (error) {
          console.error(`[Course Completion] Failed to call completedAndSendMail for course ID: ${id}:`, error)
        }
      }
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err)
      setResourceError(`Failed to mark as complete: ${err.message}`)
    }
  }

  const handleLessonCompleted = (lessonId) => {
    const updatedLesson = { ...selectedLesson, completed: true }
    setSelectedLesson(updatedLesson)

    setChapters((prevChapters) =>
      prevChapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) => (lesson.id === lessonId ? updatedLesson : lesson))
      }))
    )

    const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
    const completedLessons = chapters.reduce(
      (sum, chapter) => sum + (chapter.lessons?.filter((l) => l.completed || l.id === lessonId).length || 0),
      0
    )
    setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0)
  }

  const findNextLesson = () => {
    if (!selectedLesson || !selectedChapter) return null
    const currentChapterIndex = chapters.findIndex((c) => c.id === selectedChapter.id)
    const currentLessonIndex = selectedChapter.lessons.findIndex((l) => l.id === selectedLesson.id)

    if (currentLessonIndex < selectedChapter.lessons.length - 1) {
      return { lesson: selectedChapter.lessons[currentLessonIndex + 1], chapter: selectedChapter }
    }
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1]
      if (nextChapter.lessons && nextChapter.lessons.length > 0) {
        return { lesson: nextChapter.lessons[0], chapter: nextChapter }
      }
    }
    return null
  }

  const findPreviousLesson = () => {
    if (!selectedLesson || !selectedChapter) return null
    const currentChapterIndex = chapters.findIndex((c) => c.id === selectedChapter.id)
    const currentLessonIndex = selectedChapter.lessons.findIndex((l) => l.id === selectedLesson.id)

    if (currentLessonIndex > 0) {
      return { lesson: selectedChapter.lessons[currentLessonIndex - 1], chapter: selectedChapter }
    }
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1]
      if (prevChapter.lessons && prevChapter.lessons.length > 0) {
        return { lesson: prevChapter.lessons[prevChapter.lessons.length - 1], chapter: prevChapter }
      }
    }
    return null
  }

  const handleNextLesson = () => {
    const next = findNextLesson()
    if (next) {
      handleLessonSelect(next.lesson, next.chapter)
      setActiveAccordion(`chapter-${next.chapter.id}`)
    }
  }

  const handlePreviousLesson = () => {
    const prev = findPreviousLesson()
    if (prev) {
      handleLessonSelect(prev.lesson, prev.chapter)
      setActiveAccordion(`chapter-${prev.chapter.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-4 sm:p-6">
        <div className="container mx-auto max-w-7xl">
          <Skeleton className="h-8 sm:h-12 w-3/4 bg-gray-800 mb-4 sm:mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-[250px] sm:h-[350px] md:h-[422px] w-full bg-gray-800 mb-4 sm:mb-6" />
              <Skeleton className="h-6 sm:h-8 w-1/2 bg-gray-800 mb-3 sm:mb-4" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-[400px] sm:h-[500px] md:h-[600px] w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-red-500/50">
          <CardContent className="p-4 sm:p-6">
            <AlertCircle className="h-8 sm:h-12 w-8 sm:w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-center text-white mb-2">Error Loading Course</h2>
            <p className="text-red-400 text-center text-sm sm:text-base">{error}</p>
            <Button className="w-full mt-4 bg-red-500 hover:bg-red-600" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const nextLesson = findNextLesson()
  const prevLesson = findPreviousLesson()

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toUpperCase()) {
    case "EASY":
      return "bg-green-500 hover:bg-green-600"
    case "MEDIUM":
      return "bg-yellow-500 hover:bg-yellow-600"
    case "HARD":
      return "bg-red-500 hover:bg-red-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-white">
      <HeaderSection currentActive="courses" />
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 py-4 sm:py-6">
        <div className="mb-4 sm:mb-8 top-0 z-10 bg-bg-primary">
          <Button
            variant="ghost"
            className="my-2 sm:my-3 text-primary hover:bg-primary transition group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-clip-text text-text-primary to-bg-card/50">
                {course?.title || "Course"}
              </h1>
              <div className="w-full md:w-96 mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Course Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 sm:h-3 bg-gray-800"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs sm:text-sm">
                  <Clock className="h-3 w-3 mr-1" />{" "}
                  {chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)} Lessons
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs sm:text-sm"
                >
                  <BookOpen className="h-3 w-3 mr-1" /> {chapters.length} Chapters
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Course Outline Button */}
        <div className="lg:hidden mb-4">
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between items-center text-bg-card">
                <span>Course Outline</span>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 bg-gray-900 border-gray-700">
              <div className="h-full overflow-auto">
                <CourseOutline
                  chapters={chapters}
                  selectedLesson={selectedLesson}
                  activeAccordion={activeAccordion}
                  setActiveAccordion={setActiveAccordion}
                  handleLessonSelect={handleLessonSelect}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {selectedLesson && (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="relative">
                  {selectedLesson.type === "VIDEO" && (
                    <VideoLesson
                      videoUrl={videoUrl}
                      lessonId={selectedLesson.id}
                      resourceError={resourceError}
                      onLessonCompleted={handleLessonCompleted}
                    />
                  )}
                  {selectedLesson.type === "DOCUMENT" && selectedLesson.attachedFile && (
                    <DocumentLesson
                      attachedFile={selectedLesson.attachedFile}
                      onDownload={handleDownload}
                      resourceError={resourceError}
                    />
                  )}
                  {selectedLesson.type === "EMPTY" && (
                    <div className="aspect-[5/2] bg-gray-900 flex items-center justify-center p-4">
                      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                        <CardContent className="p-4 sm:p-6 text-center">
                          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-3 sm:mb-4" />
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No Content Available</h3>
                          <p className="text-gray-400 text-sm sm:text-base">
                            {resourceError || "This course doesn't have any lesson content yet."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div>
                      <Badge className="mb-2 bg-gray-700 hover:bg-gray-700 text-gray-300 text-xs sm:text-sm">
                        {selectedChapter?.title} • Lesson{" "}
                        {selectedLesson.type !== "EMPTY"
                          ? selectedChapter?.lessons.findIndex((l) => l.id === selectedLesson.id) + 1
                          : "N/A"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-2 sm:px-4 text-xs sm:text-sm"
                        onClick={handlePreviousLesson}
                        disabled={!prevLesson || selectedLesson.type === "EMPTY"}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-2 sm:px-4 text-xs sm:text-sm"
                        onClick={handleNextLesson}
                        disabled={!nextLesson || selectedLesson.type === "EMPTY"}
                      >
                        Next <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">{selectedLesson.title}</h2>
                    </div>
                    {selectedLesson.attachedFile && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-xs sm:text-sm text-blue-500 dark:text-blue-500 hover:underline"
                          onClick={handleDownload}
                        >
                          Download materials
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedLesson.problems && selectedLesson.problems.length > 0 && (
                    <div className="flex gap-2 items-center text-primary mb-3">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      <p className="text-xs sm:text-sm">Learn and Solve all problems to complete the lesson.</p>
                    </div>
                  )}
                  {selectedLesson.problems && selectedLesson.problems.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {selectedLesson.problems.map((problem) => (
                          <a
                            href={`/problem/${problem.problemLink}`}
                            target="_blank"
                            key={problem.problemLink}
                            className="block"
                            rel="noreferrer"
                          >
                            <Button
                              variant="outline"
                              className="w-full justify-between h-auto p-1.5 sm:p-2 text-left text-bg-card text-xs sm:text-sm"
                            >
                              <span className="font-medium truncate line-clamp-1 text-wrap" title={problem.title}>
                                {problem.title}
                              </span>
                              {problem.completed ? (
                                <CheckCircle className="text-green-600 size-4 sm:size-5" />
                              ) : (
                                <Badge className={`${getDifficultyColor(problem.difficulty)} text-xs`}>
                                  {problem.difficulty}
                                </Badge>
                              )}
                            </Button>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLesson.description && selectedLesson.type !== "EMPTY" && (
                    <div className="prose prose-invert max-w-none mt-3 sm:mt-4 text-gray-300 text-sm sm:text-base">
                      <RenderMarkdown content={selectedLesson.description} />
                    </div>
                  )}

                  {selectedLesson.type !== "EMPTY" && (
                    <div className="mt-4 sm:mt-6 flex justify-end">
                      {(!selectedLesson.problems || !selectedLesson.problems.length > 0) &&
                      !selectedLesson.completed ? (
                          <Button
                            className="bg-primary hover:bg-primary-button-hover text-bg-card text-xs sm:text-sm"
                            onClick={handleMarkComplete}
                          >
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Mark as Complete
                          </Button>
                        ) : !selectedLesson.problems || !selectedLesson.problems.length > 0 ? (
                          <div className="text-green-500 flex items-center text-xs sm:text-sm">
                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Completed
                          </div>
                        ) : null}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Course Outline - Hidden on mobile */}
          <div className="hidden lg:block">
            <CourseOutline
              chapters={chapters}
              selectedLesson={selectedLesson}
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
              handleLessonSelect={handleLessonSelect}
            />
          </div>
        </div>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-10 h-10 sm:w-14 sm:h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="text-black fixed bottom-16 sm:bottom-24 right-4 sm:right-6 w-[90vw] sm:w-[400px] h-[70vh] sm:h-[600px] bg-bg-card rounded-lg shadow-lg z-50 flex flex-col">
          <CourseDiscussion courseId={id} title="Discussion" onClose={() => setShowChat(false)} />
        </div>
      )}

      <FooterSection />
    </div>
  )
}
