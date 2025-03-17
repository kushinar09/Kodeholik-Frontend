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
} from "lucide-react"
import { getCourse } from "@/lib/api/course_api"
import { getLessonById } from "@/lib/api/lesson_api"
import VideoLesson from "./components/videoLesson"
import DocumentLesson from "./components/documentLesson"
import CourseOutline from "./components/courseOutline"

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
  const navigate = useNavigate()

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
        setCourse(courseData)

        const chaptersWithLessons = await Promise.all(
          courseData.chapters.map(async (chapter) => {
            const lessons = await Promise.all(
              chapter.lessons.map(async (lesson) => {
                return await getLessonById(lesson.id)
              })
            )
            return { ...chapter, lessons }
          })
        )

        setChapters(chaptersWithLessons)

        if (chaptersWithLessons.length > 0) {
          const firstChapter = chaptersWithLessons[0]
          setSelectedChapter(firstChapter)
          setActiveAccordion(`chapter-${firstChapter.id}`)

          if (firstChapter.lessons && firstChapter.lessons.length > 0) {
            await handleLessonSelect(firstChapter.lessons[0], firstChapter)
          }
        }

        const totalLessons = chaptersWithLessons.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
        const completedLessons = Math.floor(Math.random() * (totalLessons / 3))
        setProgress(totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0)
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
      const lessonDetails = lesson.videoUrl ? lesson : await getLessonById(lesson.id)
      
      if (lessonDetails.type === "VIDEO" && lessonDetails.videoUrl) {
        if (lessonDetails.videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
          setVideoUrl(lessonDetails.videoUrl) // YouTube ID
        } else {
          setVideoUrl(lessonDetails.videoUrl) // Direct URL
        }
      } else if (lessonDetails.type === "DOCUMENT" && lessonDetails.attachedFile) {
        // Document handling
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
      const fileUrl = `${ENDPOINTS.GET_LESSON_DETAIL.replace(":id", selectedLesson.id)}/download`
      const link = document.createElement("a")
      link.href = fileUrl
      link.download = selectedLesson.attachedFile.replace("lessons/", "")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Failed to download file:", err)
      setResourceError(`Failed to download file: ${err.message}`)
    }
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white p-6">
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
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-950 text-white ">
      <div className="mx-36 relative">
        <div className="mb-8 sticky top-0 z-10 bg-bg-primary">
          <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-primary-bg to-transparent pointer-events-none" />
          <Button
            variant="ghost"
            className="mb-3 text-primary hover:bg-primary transition group"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Back to Courses</span>
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
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
                  {chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)} Lessons
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
                    <div className="prose prose-invert max-w-none mt-4 text-gray-300">{selectedLesson.description}</div>
                  )}

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-primary hover:bg-primary-button-hover text-bg-card">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Complete
                    </Button>
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
    </div>
  )
}