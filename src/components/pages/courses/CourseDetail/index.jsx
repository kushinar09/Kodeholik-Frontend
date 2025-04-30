"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, MessageSquare, Menu } from "lucide-react"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function CourseDetailPage() {
  const [open, setOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, apiCall } = useAuth() // Get authentication status
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
    isError: false,
  })
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true)

        // Fetch course data (always needed, even if not logged in)
        const courseData = await getCourse(apiCall, id)
        if (!courseData) {
          throw new Error("Course not found")
        }
        setCourse(courseData)
        setChapters(courseData.chapters || [])

        // Only check enrollment if authenticated
        if (isAuthenticated) {
          try {
            const enrolled = await checkEnrollCourse(apiCall, id)
            setIsEnrolled(enrolled)
          } catch (enrollError) {
            console.warn("Failed to check enrollment:", enrollError.message)
            setIsEnrolled(false) // Fallback to false if check fails
          }
        } else {
          setIsEnrolled(false) // Default to not enrolled if not logged in
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
      await enrollCourse(apiCall, id)
      const updatedCourse = await getCourse(apiCall, id)
      setCourse(updatedCourse)
      setChapters(updatedCourse.chapters || [])
      setIsEnrolled(true)
      setOpen(false)
      setMessageDialog({
        open: true,
        title: "Enrollment Successful",
        message: "You have successfully enrolled!",
        isError: false,
      })
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "Enrollment Failed",
        message: `Enrollment failed: ${error.message}`,
        isError: true,
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleUnenroll = async () => {
    setProcessing(true)
    try {
      await unEnrollCourse(apiCall, id)
      const updatedCourse = await getCourse(apiCall, id)
      setCourse(updatedCourse)
      setChapters(updatedCourse.chapters || [])
      setIsEnrolled(false)
      setOpen(false)
      setMessageDialog({
        open: true,
        title: "Unenrollment Successful",
        message: "You have successfully unenrolled!",
        isError: false,
      })
    } catch (error) {
      setMessageDialog({
        open: true,
        title: "Unenrollment Failed",
        message: `Unenrollment failed: ${error.message}`,
        isError: true,
      })
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
  const completedLessons = chapters.reduce(
    (acc, chapter) => acc + (chapter.lessons?.filter((lesson) => lesson.completed).length || 0),
    0,
  )
  const completionPercentage = course?.progress || 0

  return (
    <div className="min-h-screen bg-bg-primary from-gray-900 to-gray-800">
      <HeaderSection currentActive="courses" />
      <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24">
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

        {/* Mobile tabs with sheet menu */}
        <div className="md:hidden mb-6">
          <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between items-center">
                <span>{activeTab === "overview" ? "Rate & Comment" : "Course Modules"}</span>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[40vh] bg-gray-900 border-t border-gray-700">
              <div className="pt-6 pb-2">
                <div className="flex flex-col space-y-3">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className={activeTab === "overview" ? "bg-primary" : "text-text-primary"}
                    onClick={() => {
                      setActiveTab("overview")
                      setShowMobileMenu(false)
                    }}
                  >
                    <BookOpen className="h-5 w-5 mr-2" /> Rate & Comment
                  </Button>
                  <Button
                    variant={activeTab === "modules" ? "default" : "ghost"}
                    className={activeTab === "modules" ? "bg-primary" : "text-text-primary"}
                    onClick={() => {
                      setActiveTab("modules")
                      setShowMobileMenu(false)
                    }}
                  >
                    <FileText className="h-5 w-5 mr-2" /> Course Modules
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full hidden md:block">
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
        </Tabs>

        {/* Content for both mobile and desktop */}
        {activeTab === "overview" && (
          <RateCommentCourse
            courseId={id}
            setCourse={setCourse}
            isAuthenticated={isAuthenticated}
            isEnrolled={isEnrolled}
          />
        )}

        {activeTab === "modules" && (
          <CourseModule chapters={chapters} toggleChapter={toggleChapter} navigate={navigate} />
        )}
      </div>

      {/* Show chat button and discussion only if authenticated */}
      {isAuthenticated && isEnrolled && (
        <>
          <button
            onClick={() => setShowChat(!showChat)}
            className="fixed bottom-6 right-6 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-text-muted rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors z-50"
          >
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {showChat && (
            <div className="fixed bottom-24 right-6 w-full sm:w-[400px] md:w-[500px] max-w-[95vw] bg-bg-card rounded-lg shadow-lg z-50 flex flex-col">
              <CourseDiscussion onClose={() => setShowChat(false)} />
            </div>
          )}
        </>
      )}

      <Dialog open={messageDialog.open} onOpenChange={() => setMessageDialog({ ...messageDialog, open: false })}>
        <DialogContent
          className={`bg-gray-800 border-gray-700 text-white ${messageDialog.isError ? "border-red-500" : "border-green-500"}`}
        >
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
