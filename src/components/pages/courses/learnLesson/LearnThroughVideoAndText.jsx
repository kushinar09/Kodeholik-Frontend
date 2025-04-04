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
  MessageSquare
} from "lucide-react"
import { getCourse, courseRegisterIn, courseRegisterOUT, completedAndSendMail } from "@/lib/api/course_api"
import { getLessonById, completedLesson, downloadFileLesson } from "@/lib/api/lesson_api"
import VideoLesson from "./components/videoLesson"
import DocumentLesson from "./components/documentLesson"
import CourseOutline from "./components/courseOutline"
import LessonProblemButton from "./components/lessonProblemButton"
import FooterSection from "@/components/common/shared/footer"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import CourseDiscussion from "@/components/pages/courses/CourseDetail/components/CourseDiscussion"
import HeaderSection from "@/components/common/shared/header"

export async function completedAndSendMail(id) {
  const url = ENDPOINTS.COMPLETED_COURSE.replace(":id", id)
  console.log(`[courseCompleted] Starting for course ID: ${id}, URL: ${url}`)

  try {
    console.log(`[courseCompleted] Sending POST request to ${url}`)
    const response = await fetch(url, {
      method: "POST",
      credentials: "include"
    })

    console.log(`[courseCompleted] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[courseCompleted] Failed with status: ${response.status}, Error: ${errorText}`)
      throw new Error(`Failed to register-out: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      console.log(`[courseCompleted] Success - No content (204) for course ID: ${id}`)
      return { success: true }
    }

    const responseData = await response.json()
    console.log("[courseCompleted] Success - Response data:", responseData)
    return responseData
  } catch (error) {
    console.error(`[courseCompleted] Error for course ID: ${id}:`, error.message)
    throw error
  }
}

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
  const navigate = useNavigate()

  // useEffect for course registration IN/OUT with debugging logs
  useEffect(() => {
    console.log(`[Registration] Component mounted for course ID: ${id}`)

    const registerIn = async () => {
      console.log(`[Registration] Triggering courseRegisterIn for course ID: ${id}`)
      try {
        const result = await courseRegisterIn(id)
        console.log("[Registration] courseRegisterIn completed successfully:", result)
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
      console.log(`[Registration] Triggering courseRegisterOUT for course ID: ${id}`)
      try {
        const result = await courseRegisterOUT(id)
        console.log("[Registration] courseRegisterOUT completed successfully:", result)
      } catch (err) {
        console.error("[Registration] courseRegisterOUT failed:", err)
      }
    }

    console.log("[Registration] Adding beforeunload event listener")
    window.addEventListener("beforeunload", () => {
      console.log("[Registration] beforeunload event triggered")
      registerOut()
    })

    return () => {
      console.log(`[Registration] Component unmounting or navigating away for course ID: ${id}`)
      registerOut()
      console.log("[Registration] Removing beforeunload event listener")
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
        const courseData = await getCourse(id)
        console.log("Course Data:", courseData)
        setCourse(courseData)
        setChapters(courseData.chapters || [])

        if (courseData.chapters && courseData.chapters.length > 0) {
          const firstChapter = courseData.chapters[0]
          setSelectedChapter(firstChapter)
          setActiveAccordion(`chapter-${firstChapter.id}`)

          if (firstChapter.lessons && firstChapter.lessons.length > 0) {
            console.log("First Lesson:", firstChapter.lessons[0])
            await handleLessonSelect(firstChapter.lessons[0], firstChapter)
          }
        }

        const apiProgress = courseData.progress
        if (apiProgress !== null && apiProgress !== undefined) {
          setProgress(apiProgress)
        } else {
          const totalLessons = courseData.chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
          const completedLessons = courseData.chapters.reduce(
            (sum, chapter) => sum + (chapter.lessons?.filter(l => l.completed).length || 0),
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

    try {
      console.log("Selected Lesson Before Fetch:", lesson)
      const lessonDetails = await getLessonById(lesson.id)
      console.log("Lesson Details After Fetch:", lessonDetails)
      console.log("Video URL:", lessonDetails.videoUrl)

      if (lessonDetails.type === "VIDEO" && lessonDetails.videoUrl) {
        if (lessonDetails.videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
          console.log("Setting YouTube ID:", lessonDetails.videoUrl)
          setVideoUrl(lessonDetails.videoUrl)
        } else if (lessonDetails.videoUrl.startsWith("http")) {
          console.log("Setting Direct URL:", lessonDetails.videoUrl)
          setVideoUrl(lessonDetails.videoUrl)
        } else {
          console.log("Invalid video URL (relative path):", lessonDetails.videoUrl)
          setResourceError("Invalid video URL provided for this lesson")
        }
      } else if (lessonDetails.type === "DOCUMENT" && lessonDetails.attachedFile) {
        console.log("Document Lesson Detected")
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
      const fileUrl = await downloadFileLesson(selectedLesson.attachedFile)
      console.log("Download URL:", fileUrl)
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = selectedLesson.attachedFile.replace("lessons/", "") || "document"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Failed to download file:", err)
      setResourceError(`Failed to download file: ${err.message}`)
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

      setChapters(prevChapters =>
        prevChapters.map(chapter => ({
          ...chapter,
          lessons: chapter.lessons.map(lesson =>
            lesson.id === selectedLesson.id ? updatedLesson : lesson
          )
        }))
      )

      const updatedCourse = await getCourse(id)
      const apiProgress = updatedCourse.progress
      let newProgress

      if (apiProgress !== null && apiProgress !== undefined) {
        newProgress = apiProgress
        setProgress(newProgress)
      } else {
        const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
        const completedLessons = chapters.reduce(
          (sum, chapter) => sum + (chapter.lessons?.filter(l => l.completed || l.id === selectedLesson.id).length || 0),
          0
        )
        newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
        setProgress(newProgress)
      }

      // Check if progress is 100% and call completedAndSendMail
      if (newProgress >= 100) {
        console.log(`[Course Completion] Progress reached 100% for course ID: ${id}, calling completedAndSendMail`)
        try {
          await completedAndSendMail(id)
          console.log(`[Course Completion] Successfully called completedAndSendMail for course ID: ${id}`)
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

    setChapters(prevChapters =>
      prevChapters.map(chapter => ({
        ...chapter,
        lessons: chapter.lessons.map(lesson =>
          lesson.id === lessonId ? updatedLesson : lesson
        )
      }))
    )

    const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)
    const completedLessons = chapters.reduce(
      (sum, chapter) => sum + (chapter.lessons?.filter(l => l.completed || l.id === lessonId).length || 0),
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-6">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-3/4 bg-gray-800 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Skeleton className="h-[422px] w-full bg-gray-800 mb-6" />
              <Skeleton className="h-8 w-1/2 bg-gray-800 mb-4" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-full bg-gray-800 mb-2" />
              <Skeleton className="h-4 w-3/4 bg-gray-800" />
            </div>
            <div>
              <Skeleton className="h-[600px] w-full bg-gray-800" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-red-500/50">
          <CardContent className="p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-center text-white mb-2">Error Loading Course</h2>
            <p className="text-red-400 text-center">{error}</p>
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

  return (
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-950 text-white">
      <HeaderSection currentActive="courses"/>
      <div className="mx-36">
        <div className="mb-8 top-0 z-10 bg-bg-primary">
          <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
          <Button
            variant="ghost"
            className="my-3 text-primary hover:bg-primary transition group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back</span>
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-bg-card/50">
                {course?.title || "Course"}
              </h1>
              <div className="w-full md:w-96 mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Course Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-3 bg-gray-800"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                  <Clock className="h-3 w-3 mr-1" />{" "}
                  {chapters.reduce((sum, chapter) => sum + (chapter.lessons?.length || 0), 0)} Lessons
                </Badge>
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                  <BookOpen className="h-3 w-3 mr-1" /> {chapters.length} Chapters
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
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
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <Badge className="mb-2 bg-gray-700 hover:bg-gray-700 text-gray-300">
                        {selectedChapter?.title} • Lesson{" "}
                        {selectedChapter?.lessons.findIndex((l) => l.id === selectedLesson.id) + 1}
                      </Badge>
                      <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-4"
                        onClick={handlePreviousLesson}
                        disabled={!prevLesson}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-4"
                        onClick={handleNextLesson}
                        disabled={!nextLesson}
                      >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {selectedLesson.description && (
                    <div className="prose prose-invert max-w-none mt-4 text-gray-300">
                      <RenderMarkdown content={selectedLesson.description} />
                    </div>
                  )}

                  {selectedLesson.problems && selectedLesson.problems.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Problems</h3>
                      <div className="space-y-2">
                        {selectedLesson.problems.map((problem) => (
                          <LessonProblemButton key={problem.id} problem={problem} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end">
                    {!selectedLesson.completed ? (
                      <Button
                        className="bg-primary hover:bg-primary-button-hover text-bg-card"
                        onClick={handleMarkComplete}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Complete
                      </Button>
                    ) : (
                      <div className="text-green-500 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <CourseOutline
            chapters={chapters}
            selectedLesson={selectedLesson}
            activeAccordion={activeAccordion}
            setActiveAccordion={setActiveAccordion}
            handleLessonSelect={handleLessonSelect}
          />
        </div>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="text-black fixed bottom-24 right-6 w-[400px] h-[600px] bg-bg-card rounded-lg shadow-lg z-50 flex flex-col">
          <CourseDiscussion courseId={id} title="Discussion" onClose={() => setShowChat(false)} />
        </div>
      )}

      <FooterSection />
    </div>
  )
}