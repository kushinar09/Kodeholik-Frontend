"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, BookOpen, Clock, Award, FileText, Video, CheckCircle, AlertCircle } from "lucide-react"

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCourse, enrollCourse, unEnrollCourse, getImage } from "@/lib/api/course_api"

export default function CourseDetail() {
  const [open, setOpen] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)

  useEffect(() => {
    async function fetchCourse() {
      try {
        const data = await getCourse(id)
        setCourse(data)
        async function fetchImage() {
          try {
            const url = await getImage(data.image)
            setImageUrl(url)
          } catch (error) {
            console.error("Error fetching image:", error)
          }
        }
        fetchImage()
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  const handleEnroll = async () => {
    setProcessing(true)
    try {
      await enrollCourse(id)
      const updatedCourse = await getCourse(id)
      setCourse(updatedCourse)
      setOpen(false)
      // Use a toast notification instead of alert
      // toast.success("You have successfully enrolled!");
    } catch (error) {
      // toast.error(`Enrollment failed: ${error.message}`);
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
      // Use a toast notification instead of alert
      // toast.success("You have successfully unenrolled!");
    } catch (error) {
      // toast.error(`Unenrollment failed: ${error.message}`);
      alert(`Unenrollment failed: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8 mt-8">
            <div className="w-full md:w-2/3 space-y-4">
              <Skeleton className="h-8 w-3/4 bg-gray-700" />
              <Skeleton className="h-6 w-1/2 bg-gray-700" />
              <Skeleton className="h-6 w-1/3 bg-gray-700" />
              <Skeleton className="h-24 w-full bg-gray-700" />
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <Skeleton className="h-60 w-60 rounded-full bg-gray-700" />
            </div>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Course</h2>
            <p className="text-red-400 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-6">Course Not Found</h2>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
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
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <div className="container mx-auto p-6 max-w-6xl">
        <Button variant="ghost" className="mb-6 text-primary font-bold hover:bg-primary transition hover:text-black" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>

        <Card className="bg-gray-800/50 border-gray-700 shadow-lg mb-8">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center text-yellow-400">
                    <Star className="fill-yellow-400 h-4 w-4 mr-1" />
                    <span>{course.rate || "N/A"}</span>
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">{course.title}</h1>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" /> Description
                    </h3>
                    <p className="text-text-primary">{course.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {isEnrolled ? (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" disabled={processing} className="gap-2">
                          {processing ? "Processing..." : "Unenroll from Course"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 text-white">
                        <DialogTitle>Confirm Unenrollment</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Are you sure you want to unenroll from this course? You may lose your progress.
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2 mt-4">
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
                  ) : (
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={processing} className="gap-2">
                          {processing ? "Processing..." : "Enroll in Course"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700 text-white">
                        <DialogTitle>Confirm Enrollment</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Do you want to enroll in this course? You'll get immediate access to all available materials.
                        </DialogDescription>
                        <DialogFooter className="flex justify-end gap-2 mt-4">
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

                  {isEnrolled && (
                    <Button variant="outline" className="gap-2 border-gray-600 text-white hover:bg-gray-700">
                      <BookOpen className="h-4 w-4" /> Continue Learning
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/3 bg-gray-900/50 p-6 flex flex-col items-center justify-center">
                <div className="relative mb-4">
                  {imageUrl ? (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={course.title}
                      className="w-60 h-60 object-cover rounded-full border-4 border-primary/30 shadow-lg shadow-primary/20"
                    />
                  ) : (
                    <div className="w-60 h-60 rounded-full bg-gray-700 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-gray-600" />
                    </div>
                  )}
                  {isEnrolled && <Badge className="absolute bottom-2 right-2 bg-primary text-white">Enrolled</Badge>}
                </div>

                <div className="w-full space-y-3 mt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-800/80 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300">Duration</span>
                    </div>
                    <span className="text-white font-medium">4 weeks</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/80 rounded-lg">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300">Certificate</span>
                    </div>
                    <span className="text-white font-medium">Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" /> Course Modules
            </h2>

            <div className="rounded-lg border border-gray-700 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-300 w-16">ID</TableHead>
                    <TableHead className="text-gray-300">Lesson Title</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-text-primary">
                  {course.chapters && course.chapters.length > 0 ? (
                    course.chapters.map((chapter, index) => (
                      <TableRow key={index} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{chapter.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {chapter.type === "video" ? (
                              <>
                                <Video className="h-3 w-3 mr-1" /> Video
                              </>
                            ) : (
                              <>
                                <FileText className="h-3 w-3 mr-1" /> Reading
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {chapter.status === "completed" ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" /> Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        <div className="flex flex-col items-center">
                          <FileText className="h-10 w-10 mb-2 text-gray-600" />
                          <p>No modules available for this course yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  )
}

