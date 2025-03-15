"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, MessageSquare } from "lucide-react"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { getCourse, enrollCourse, unEnrollCourse, getImage, checkEnrollCourse, getCourseDiscussion } from "@/lib/api/course_api"
import { getChapterByCourseId } from "@/lib/api/chapter_api"
import { getLessonByChapterId } from "@/lib/api/lesson_api"
import CourseDetail from "./components/courseDetail"
import CourseModule from "./components/courseModule"
import RateCommentCourse from "./components/rateCommentCourse"
import CourseDiscussion from "./components/CourseDiscussion" // Import CourseDiscussion

export default function CourseDetailPage() {
  const [open, setOpen] = useState(false)
  const [showChat, setShowChat] = useState(false) // State for chat visibility
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [expandedChapters, setExpandedChapters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        const courseData = await getCourse(id)
        setCourse(courseData)
        const chaptersData = await getChapterByCourseId(id)
        const chaptersWithLessons = await Promise.all(
          chaptersData.map(async (chapter) => {
            const lessons = await getLessonByChapterId(chapter.id)
            return { ...chapter, lessons }
          })
        )
        setChapters(chaptersWithLessons)
        const url = await getImage(courseData.image)
        setImageUrl(url)
        const enrolled = await checkEnrollCourse(id)
        setIsEnrolled(enrolled)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [id])

  const handleEnroll = async () => {
    setProcessing(true)
    try {
      await enrollCourse(id)
      const updatedCourse = await getCourse(id)
      setCourse(updatedCourse)
      setIsEnrolled(true)
      setOpen(false)
      alert("You have successfully enrolled!")
    } catch (error) {
      alert(`Enrollment failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleUnenroll = async () => {
    setProcessing(true)
    try {
      await unEnrollCourse(id)
      const updatedCourse = await getCourse(id)
      setCourse(updatedCourse)
      setIsEnrolled(false)
      setOpen(false)
      alert("You have successfully unenrolled!")
    } catch (error) {
      alert(`Unenrollment failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }))
  }

  const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)
  const completedLessons = isEnrolled ? Math.floor(totalLessons * 0.3) : 0
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-800">
      <Header />
      <div className="container mx-auto p-6 max-w-6xl">
        <CourseDetail
          course={course}
          loading={loading}
          error={error}
          navigate={navigate}
          imageUrl={imageUrl}
          open={open}
          setOpen={setOpen}
          processing={processing}
          handleEnroll={handleEnroll}
          handleUnenroll={handleUnenroll}
          totalLessons={totalLessons}
          completedLessons={completedLessons}
          completionPercentage={completionPercentage}
          isEnrolled={isEnrolled}
        />
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-gray-900/50">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4 mr-2" /> Rate & Comment
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-4 w-4 mr-2" /> Course Modules
            </TabsTrigger>
          </TabsList>
          <RateCommentCourse courseId={id} setCourse={setCourse} />
          <CourseModule chapters={chapters} toggleChapter={toggleChapter} navigate={navigate} />
        </Tabs>
      </div>

      {/* Floating Chat Icon */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-100 h-150 bg-bg-card rounded-lg shadow-lg z-50 flex flex-col">
          <CourseDiscussion onClose={() => setShowChat(false)} />
        </div>
      )}

      <FooterSection />
    </div>
  )
}