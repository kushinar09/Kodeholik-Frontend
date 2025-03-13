"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText } from "lucide-react"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { getCourse, enrollCourse, unEnrollCourse, getImage } from "@/lib/api/course_api"
import { getChapterByCourseId } from "@/lib/api/chapter_api"
import { getLessonByChapterId } from "@/lib/api/lesson_api"
import CourseDetail from "./components/courseDetail"
import CourseModule from "./components/courseModule"
import RateCommentCourse from "./components/rateCommentCourse"

export default function CourseDetailPage() {
  const [open, setOpen] = useState(false)
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
          }),
        )
        setChapters(chaptersWithLessons)

        const url = await getImage(courseData.image)
        setImageUrl(url)
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
  const completedLessons = course?.isEnrolled ? Math.floor(totalLessons * 0.3) : 0
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
      <FooterSection />
    </div>
  )
}