"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BookOpen, FileText, MessageSquare } from "lucide-react"
import FooterSection from "@/components/common/shared/footer"
import { getCourse, enrollCourse, unEnrollCourse, checkEnrollCourse } from "@/lib/api/course_api"
import { useAuth } from "@/providers/AuthProvider"
import CourseDetail from "./components/courseDetail"
import CourseModule from "./components/courseModule"
import RateCommentCourse from "./components/rateCommentCourse"
import CourseDiscussion from "./components/CourseDiscussion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import HeaderSection from "@/components/common/shared/header"

export default function CourseDetailPage() {
  const [open, setOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth() // Get authentication status
  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [expandedChapters, setExpandedChapters] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    title: "",
    message: "",
    isError: false
  })

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)

        // Fetch course data (always needed, even if not logged in)
        const courseData = await getCourse(id)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
        setChapters(courseData.chapters || [])

        // Only check enrollment if authenticated
        if (isAuthenticated) {
          try {
            const enrolled = await checkEnrollCourse(id)
            setIsEnrolled(enrolled)
          } catch (enrollError) {
            console.warn("Failed to check enrollment:", enrollError.message)
            setIsEnrolled(false) // Fallback to false if check fails
          }
        } else {
          setIsEnrolled(false) // Default to not enrolled if not logged in
          console.log("User not authenticated, skipping enrollment check.")
        }
      } catch (error) {
        console.error("Error fetching course data:", error.message)
        setError(error.message) // Set error only for critical failures
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [id, isAuthenticated]) // Add isAuthenticated as dependency

  const handleEnroll = async () => {
    setProcessing(true)
    try {
      await enrollCourse(id)
      const updatedCourse = await getCourse(id)
      setCourse(updatedCourse)
      setChapters(updatedCourse.chapters || [])
      setIsEnrolled(true)
      setOpen(false)
      setMessageDialog({
        open: true,
        title: "Enrollment Successful",
        message: "You have successfully enrolled!",
        isError: false
      })
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "Enrollment Failed",
        message: `Enrollment failed: ${error.message}`,
        isError: true
      })
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
      setChapters(updatedCourse.chapters || [])
      setIsEnrolled(false)
      setOpen(false)
      setMessageDialog({
        open: true,
        title: "Unenrollment Successful",
        message: "You have successfully unenrolled!",
        isError: false
      })
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "Unenrollment Failed",
        message: `Unenrollment failed: ${error.message}`,
        isError: true
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }))
  }

  const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)
  const completedLessons = chapters.reduce(
    (acc, chapter) => acc + (chapter.lessons?.filter((lesson) => lesson.completed).length || 0),
    0
  )
  const completionPercentage = course?.progress || 0

  return (
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-800">
      <HeaderSection currentActive="courses"/>
      <div className="mx-36">
        <CourseDetail
          course={course}
          loading={loading}
          error={error}
          navigate={navigate}
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

          {/* Add TabsContent to control what shows for each tab */}
          <TabsContent value="overview">
            <RateCommentCourse courseId={id} setCourse={setCourse} isAuthenticated={isAuthenticated} isEnrolled={isEnrolled}/>
          </TabsContent>
          <TabsContent value="modules">
            <CourseModule chapters={chapters} toggleChapter={toggleChapter} navigate={navigate} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Show chat button and discussion only if authenticated */}
      {isAuthenticated && isEnrolled && (
        <>
          <button
            onClick={() => setShowChat(!showChat)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-text-muted rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {showChat && (
            <div className="fixed bottom-24 right-6 w-100 h-150 bg-bg-card rounded-lg shadow-lg z-50 flex flex-col">
              <CourseDiscussion onClose={() => setShowChat(false)} />
            </div>
          )}
        </>
      )}

      <Dialog open={messageDialog.open} onOpenChange={() => setMessageDialog({ ...messageDialog, open: false })}>
        <DialogContent className={`bg-gray-800 border-gray-700 text-white ${messageDialog.isError ? "border-red-500" : "border-green-500"}`}>
          <DialogTitle className="text-xl">{messageDialog.title}</DialogTitle>
          <DialogDescription className={`mt-2 ${messageDialog.isError ? "text-red-300" : "text-green-300"}`}>
            {messageDialog.message}
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button
              onClick={() => setMessageDialog({ ...messageDialog, open: false })}
              className={`${messageDialog.isError ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  )
}