"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import YouTubePlayer from "./components/youtubePlayer"
import { getCourse } from "@/lib/api/course_api"
import { getLessonByChapterId, getVideo, downloadFileLesson } from "@/lib/api/lesson_api"

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
            const lessons = await getLessonByChapterId(chapter.id)
            return { ...chapter, lessons }
          }),
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
        const completedLessons = Math.floor(Math.random() * (totalLessons / 3)) // Mock data
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
    setVideoUrl(null) // Reset video URL
    setResourceError(null)

    try {
      if (lesson.type === "VIDEO" && lesson.videoUrl) {
        if (lesson.videoUrl.match(/^[a-zA-Z0-9_-]{11}$/)) {
          setVideoUrl(lesson.videoUrl) // Set YouTube ID
        } else {
          const video = await getVideo(lesson.videoUrl)
          setVideoUrl(video.url) // Set server-hosted URL
        }
      } else if (lesson.type === "DOCUMENT" && lesson.attachedFile) {
        // No video URL for documents, handled in rendering
      } else if (lesson.type === "VIDEO" && !lesson.videoUrl) {
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

  const getDisplayFileName = (attachedFile) => {
    return attachedFile ? attachedFile.replace("lessons/", "") : ""
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
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-950 text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                {course?.title || "Course"}
              </h1>
              {course?.description && <p className="text-gray-400 mt-2">{course.description}</p>}
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
              <div className="w-full md:w-64">
                <div className="flex justify-between text-xs mb-1">
                  <span>Course Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-gray-800"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {selectedLesson && (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="relative">
                  {selectedLesson.type === "VIDEO" && videoUrl ? (
                    <div className="bg-black">
                      {videoUrl.match(/^[a-zA-Z0-9_-]{11}$/) ? (
                        <YouTubePlayer key={selectedLesson.id} videoId={videoUrl} />
                      ) : (
                        <video width="100%" height="auto" controls className="aspect-video mx-auto">
                          <source src={videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  ) : selectedLesson.type === "VIDEO" && !videoUrl ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-900">
                      <AlertCircle className="h-12 w-12 text-red-400 mb-2" />
                      <p className="text-red-400">Video not available</p>
                    </div>
                  ) : null}

                  {selectedLesson.type === "DOCUMENT" && selectedLesson.attachedFile && (
                    <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 p-6">
                      <FileText className="h-16 w-16 text-blue-400 mb-4" />
                      <p className="text-gray-300 mb-4 text-center">{getDisplayFileName(selectedLesson.attachedFile)}</p>
                      <Button
                        onClick={handleDownload}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <Download className="h-4 w-4 mr-2" /> Download Document
                      </Button>
                    </div>
                  )}

                  {resourceError && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-3 text-center">
                      <p className="text-red-200 text-sm">{resourceError}</p>
                    </div>
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
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Complete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="bg-gray-800/30 border-gray-700/50 h-fit sticky top-6">
            <CardContent className="p-4">
              <h2 className="font-bold mb-4 text-lg text-white flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-blue-400" /> Course Outline
              </h2>

              <Accordion
                type="single"
                collapsible
                className="w-full space-y-2"
                value={activeAccordion}
                onValueChange={setActiveAccordion}
              >
                {chapters.map((chapter, index) => (
                  <AccordionItem
                    key={chapter.id}
                    value={`chapter-${chapter.id}`}
                    className="border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600"
                  >
                    <AccordionTrigger className="hover:bg-gray-700/30 px-4 py-4 text-white">
                      <div className="flex items-center">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">{chapter.title}</h3>
                          <p className="text-xs text-gray-400">{chapter.lessons.length} lessons</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-900/30 border-t border-gray-700/50 px-0 py-0">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-4 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                            selectedLesson?.id === lesson.id ? "bg-gray-800/80 border-l-2 border-blue-500" : ""
                          }`}
                          onClick={() => handleLessonSelect(lesson, chapter)}
                        >
                          <div className="flex items-center">
                            <div className="w-6 h-6 flex items-center justify-center mr-3 text-xs text-gray-400">
                              {lessonIndex + 1}
                            </div>
                            {lesson.type === "VIDEO" ? (
                              <Video className="h-4 w-4 mr-3 text-blue-400 flex-shrink-0" />
                            ) : (
                              <FileText className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm ${selectedLesson?.id === lesson.id ? "text-white font-medium" : "text-gray-300"}`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}