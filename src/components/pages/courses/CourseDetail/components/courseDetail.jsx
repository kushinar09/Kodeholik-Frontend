import { ArrowLeft, Star, BookOpen, Clock, Award, Calendar, Bookmark, BookmarkCheck, CheckCircle, Users, FileText, AlertCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function CourseDetail({
  course,
  loading,
  error,
  navigate,
  imageUrl,
  open,
  setOpen,
  processing,
  handleEnroll,
  handleUnenroll,
  totalLessons,
  completedLessons,
  completionPercentage,
  isEnrolled, // New prop
}) {
  if (loading) {
    return (
      <div>
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
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-yellow-500/10 p-6 rounded-full mb-6">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-8">Course Not Found</h2>
        <Button onClick={() => navigate(-1)} size="lg" className="gap-2">
          <ArrowLeft className="h-5 w-5" /> Go Back
        </Button>
      </div>
    )
  }

  const handleLearn = () => {
    navigate(`/learn/${course.id}`)
  }

  return (
    <>
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
                  <Button
                    size="lg"
                    className="gap-2 bg-primary text-black hover:bg-bg-primary hover:text-primary"
                    onClick={handleLearn}
                  >
                    <BookOpen className="h-5 w-5" /> Continue Learning
                  </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="lg"
                          disabled={processing}
                          className="gap-2 bg-primary text-black hover:bg-gray-700 hover:text-primary"
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
                            className="border-gray-600 text-black hover:bg-gray-700 hover:text-primary"
                          >
                            Cancel
                          </Button>
                          <Button variant="destructive" className="border-gray-600 text-black hover:bg-gray-700 hover:text-primary" onClick={handleUnenroll} disabled={processing}>
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
                          className="border-gray-600 text-black hover:bg-gray-700 hover:text-primary"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEnroll} className="border-gray-600 text-black hover:bg-gray-700 hover:text-primary" disabled={processing}>
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
                  <Badge className="absolute bottom-2 right-2 z-20 bg-primary text-black px-3 py-1 text-sm">
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
    </>
  )
}