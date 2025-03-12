"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Star,
  BookOpen,
  Clock,
  Award,
  FileText,
  Video,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"

import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCourse, enrollCourse, unEnrollCourse, getImage } from "@/lib/api/course_api"
import { getChapterByCourseId } from "@/lib/api/chapter_api"
import { getLessonByChapterId } from "@/lib/api/lesson_api"
import { cn } from "@/lib/utils"

export default function CourseDetail() {
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

  // Calculate total lessons and completion percentage (mock data for demo)
  const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0)
  const completedLessons = course?.isEnrolled ? Math.floor(totalLessons * 0.3) : 0
  const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex items-center mb-8">
            <Skeleton className="h-10 w-32 bg-gray-700 rounded-md" />
          </div>

          <Card className="bg-gray-800/50 border-gray-700 shadow-xl mb-8 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/3 p-8">
                  <Skeleton className="h-8 w-3/4 bg-gray-700 mb-4" />
                  <div className="flex gap-3 mb-4">
                    <Skeleton className="h-6 w-20 bg-gray-700 rounded-full" />
                    <Skeleton className="h-6 w-20 bg-gray-700 rounded-full" />
                  </div>
                  <Skeleton className="h-32 w-full bg-gray-700 mb-6 rounded-lg" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-40 bg-gray-700 rounded-md" />
                    <Skeleton className="h-10 w-40 bg-gray-700 rounded-md" />
                  </div>
                </div>
                <div className="w-full md:w-1/3 bg-gray-900/50 p-8 flex flex-col items-center justify-center">
                  <Skeleton className="h-64 w-64 rounded-full bg-gray-700 mb-6" />
                  <Skeleton className="h-10 w-full bg-gray-700 rounded-lg mb-3" />
                  <Skeleton className="h-10 w-full bg-gray-700 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
            <CardContent className="p-8">
              <Skeleton className="h-8 w-48 bg-gray-700 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-700 rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="bg-red-500/10 p-6 rounded-full mb-6">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Error Loading Course</h2>
            <p className="text-red-400 mb-8 text-center max-w-md">{error}</p>
            <Button onClick={() => navigate(-1)} size="lg" className="gap-2">
              <ArrowLeft className="h-5 w-5" /> Go Back
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="bg-yellow-500/10 p-6 rounded-full mb-6">
              <AlertCircle className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-8">Course Not Found</h2>
            <Button onClick={() => navigate(-1)} size="lg" className="gap-2">
              <ArrowLeft className="h-5 w-5" /> Go Back
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  const isEnrolled = course.isEnrolled
  const statusColor = course.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      <div className="container mx-auto p-6 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-8 text-primary hover:bg-primary/10 transition group"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Back to Courses</span>
        </Button>

        <Card className="bg-gray-800/50 border-gray-700 shadow-xl mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 p-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                    <Star className="fill-yellow-400 h-4 w-4 mr-1" />
                    <span className="font-medium">{course.rate || "N/A"}</span>
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
                    <Users className="h-3 w-3 mr-1" /> {course.numberOfParticipant} Students
                  </Badge>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{course.title}</h1>

                <div className="bg-gray-900/50 p-5 rounded-xl mb-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-primary" /> Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{course.description}</p>
                </div>

                {isEnrolled && (
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-300">Course Progress</span>
                      <span className="text-sm font-medium text-primary">{completionPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>
                        {completedLessons} of {totalLessons} lessons completed
                      </span>
                      {completionPercentage === 100 && <span className="text-green-400">Completed!</span>}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  {isEnrolled ? (
                    <>
                      <Button className="gap-2" size="lg">
                        <BookOpen className="h-5 w-5" /> Continue Learning
                      </Button>

                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="lg"
                            disabled={processing}
                            className="gap-2 border-gray-600 text-white hover:bg-gray-700 hover:text-white"
                          >
                            {processing ? (
                              "Processing..."
                            ) : (
                              <>
                                <Bookmark className="h-5 w-5" /> Unenroll
                              </>
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                          <DialogTitle className="text-xl">Confirm Unenrollment</DialogTitle>
                          <DialogDescription className="text-gray-300 mt-2">
                            Are you sure you want to unenroll from this course? You may lose your progress.
                          </DialogDescription>
                          <DialogFooter className="flex justify-end gap-2 mt-6">
                            <Button
                              variant="outline"
                              onClick={() => setOpen(false)}
                              disabled={processing}
                              className="border-gray-600 text-white hover:bg-gray-700"
                            >
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleUnenroll} disabled={processing}>
                              {processing ? "Unenrolling..." : "Yes, Unenroll"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={processing} size="lg" className="gap-2">
                          {processing ? (
                            "Processing..."
                          ) : (
                            <>
                              <BookmarkCheck className="h-5 w-5" /> Enroll in Course
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 text-white">
                        <DialogTitle className="text-xl">Confirm Enrollment</DialogTitle>
                        <DialogDescription className="text-gray-300 mt-2">
                          Do you want to enroll in this course? You'll get immediate access to all available materials.
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                            className="border-gray-600 text-white hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEnroll} disabled={processing}>
                            {processing ? "Enrolling..." : "Yes, Enroll"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/3 bg-gray-900/80 p-8 flex flex-col items-center justify-center">
                <div className="relative mb-6 group">
                  {imageUrl ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={course.title}
                        className="w-64 h-64 object-cover rounded-full border-4 border-primary/30 shadow-lg shadow-primary/20 relative transition-transform group-hover:scale-105 duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-70"></div>
                      <div className="w-64 h-64 rounded-full bg-gray-800 flex items-center justify-center relative z-10 border-4 border-primary/30">
                        <BookOpen className="h-24 w-24 text-gray-600" />
                      </div>
                    </div>
                  )}
                  {isEnrolled && (
                    <Badge className="absolute bottom-2 right-2 z-20 bg-primary text-white px-3 py-1 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" /> Enrolled
                    </Badge>
                  )}
                </div>

                <div className="w-full space-y-4 mt-2">
                  <div className="flex items-center justify-between p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-gray-300">Duration</span>
                    </div>
                    <span className="text-white font-medium">4 weeks</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-gray-300">Certificate</span>
                    </div>
                    <span className="text-white font-medium">Yes</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/80 rounded-xl border border-gray-700/50">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-gray-300">Last Updated</span>
                    </div>
                    <span className="text-white font-medium">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
          <CardContent className="p-8">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-8 bg-gray-900/50">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Course Overview
                </TabsTrigger>
                <TabsTrigger
                  value="modules"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <FileText className="h-4 w-4 mr-2" /> Course Modules
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0">
                <div className="space-y-6">
                  <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">What You'll Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        "Master the fundamentals of the subject",
                        "Apply concepts to real-world scenarios",
                        "Build practical projects for your portfolio",
                        "Understand advanced techniques and methodologies",
                        "Develop problem-solving skills",
                        "Prepare for industry certification",
                      ].map((item, i) => (
                        <div key={i} className="flex items-start">
                          <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Prerequisites</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Basic understanding of the subject matter</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Familiarity with related concepts</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Access to required software or tools</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Target Audience</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Students looking to expand their knowledge</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Professionals seeking to upskill</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                        <span className="text-gray-300">Enthusiasts interested in the subject matter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-0">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <BookOpen className="h-6 w-6 mr-2 text-primary" /> Course Modules
                </h2>

                {chapters.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {chapters.map((chapter) => (
                      <AccordionItem
                        key={chapter.id}
                        value={`chapter-${chapter.id}`}
                        className="border-gray-700 overflow-hidden"
                      >
                        <AccordionTrigger className="hover:bg-gray-700/30 px-4 py-4 text-white">
                          <div className="flex items-center">
                            <div className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center mr-3">
                              {chapter.id}
                            </div>
                            <div className="text-left">
                              <h3 className="font-medium">{chapter.title}</h3>
                              <p className="text-sm text-gray-400">{chapter.lessons?.length || 0} lessons</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-gray-900/30 border-t border-gray-700/50">
                          {chapter.lessons?.length > 0 ? (
                            <div className="divide-y divide-gray-700/50">
                              {chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                                >
                                  <div className="flex items-center">
                                    {lesson.type === "VIDEO" ? (
                                      <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                        <Video className="h-4 w-4" />
                                      </div>
                                    ) : (
                                      <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                        <FileText className="h-4 w-4" />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="text-gray-200">{lesson.title}</h4>
                                      <p className="text-xs text-gray-400">
                                        {lesson.type === "VIDEO" ? "Video Lesson" : "Document Lesson"}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => navigate(`#lesson-${lesson.id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-400">
                              <FileText className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                              <p>No lessons available for this chapter yet</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 p-10 text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-medium text-white mb-2">No Modules Available</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      This course doesn't have any modules available yet. Check back later for updates.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  )
}

