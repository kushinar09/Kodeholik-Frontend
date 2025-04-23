import { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Star, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { rateCommentCourse, getRateCommentCourse, getCourse, checkEnrollCourse } from "@/lib/api/course_api"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function RateCommentCourse({ courseId, setCourse, isAuthenticated, isEnrolled }) {
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [ratingError, setRatingError] = useState("")
  const [commentError, setCommentError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const { apiCall } = useAuth()

  const ITEMS_PER_PAGE = 3

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadingComments(true)
        if (!courseId || isNaN(courseId)) {
          throw new Error("Invalid courseId provided")
        }

        const fetchedComments = await getRateCommentCourse(apiCall, courseId)
        setComments(Array.isArray(fetchedComments) ? fetchedComments : [])
        setCurrentPage(1)
        if (isAuthenticated) {
          const enrolled = await checkEnrollCourse(apiCall, courseId)
        }
      } catch (error) {
        console.error("Failed to fetch data:", error.message)
        setComments([])
      } finally {
        setLoadingComments(false)
      }
    }
    fetchData()
  }, [courseId, isAuthenticated])

  const handleRating = (value) => {
    setRating(value)
    setSubmitError("")
    setSubmitSuccess("")
    if (!value || value < 1 || value > 5) {
      setRatingError("Please select a valid rating (1 to 5 stars).")
    } else {
      setRatingError("")
    }
  }

  const handleCommentChange = (e) => {
    const newComment = e.target.value
    setComment(newComment)
    setSubmitError("")
    setSubmitSuccess("")

    const commentLength = newComment.trim().length
    if (commentLength > 0 && commentLength < 10) {
      setCommentError("Your comment must be at least 10 characters long.")
    } else if (commentLength > 5000) {
      setCommentError("Your comment must not exceed 5000 characters.")
    } else {
      setCommentError("")
    }
  }

  const handleSubmitRatingComment = async () => {
    setSubmitError("")
    setSubmitSuccess("")

    if (!rating || rating < 1 || rating > 5) {
      setRatingError("Please select a rating by choosing 1 to 5 stars.")
      return
    }

    const commentLength = comment.trim().length
    if (commentLength < 10) {
      setCommentError("Your comment must be at least 10 characters long.")
      return
    }
    if (commentLength > 5000) {
      setCommentError("Your comment must not exceed 5000 characters.")
      return
    }

    if (!isAuthenticated) {
      setSubmitError("You must be logged in to submit a rating.")
      return
    }

    if (!isEnrolled) {
      setSubmitError("You must enroll in the course before rating.")
      return
    }

    setSubmitLoading(true)
    try {
      const data = {
        courseId: Number.parseInt(courseId),
        rating: rating,
        comment: comment.trim()
      }

      const submittedData = await rateCommentCourse(data, apiCall)
      if (submittedData.ok) {
        setSubmitSuccess("Rating and comment submitted successfully!")

        setComments((prev) => [submittedData, ...prev])
        setCurrentPage(1)

        const updatedCourse = await getCourse(apiCall, courseId)
        setCourse(updatedCourse)

        setRating(0)
        setComment("")
        setRatingError("")
        setCommentError("")

        const fetchedComments = await getRateCommentCourse(apiCall, courseId)
        setComments(Array.isArray(fetchedComments) ? fetchedComments : [submittedData])
      } else {
        const response = await submittedData.json()
        toast.error("Error when comment", {
          description: response.message
        })
      }
    } catch (error) {
      setSubmitError(error.message)
      toast.error("Error when comment", {
        description: error.message
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const totalPages = Math.ceil(comments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedComments = comments.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  return (
    <TabsContent value="overview" className="mt-0">
      <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8">
            {isAuthenticated ? (
              isEnrolled ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-mono text-white">Rate & Comment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 rounded-full hover:bg-transparent"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => handleRating(star)}
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6 transition-all",
                                  hoverRating >= star || rating >= star ? "text-yellow-400 scale-110" : "text-gray-500"
                                )}
                                fill={hoverRating >= star || rating >= star ? "currentColor" : "none"}
                              />
                              <span className="sr-only">Rate {star} stars</span>
                            </Button>
                          ))}
                          <span className="ml-2 text-sm text-gray-400">
                            {rating > 0 ? `${rating} star${rating !== 1 ? "s" : ""}` : "Select rating"}
                          </span>
                        </div>
                        {ratingError && <p className="text-red-400 text-sm">{ratingError}</p>}
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Share your experience with this course (10-5000 characters)..."
                          value={comment}
                          onChange={handleCommentChange}
                          className="min-h-[120px] bg-gray-800 border-gray-700 text-gray-200 focus:border-gray-500 resize-y"
                          disabled={submitLoading}
                        />
                        {commentError && <p className="text-red-400 text-sm">{commentError}</p>}
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={handleSubmitRatingComment}
                          disabled={submitLoading || !!ratingError || !!commentError}
                          className="w-full sm:w-auto bg-primary hover:bg-primary-button-hover text-bg-card"
                        >
                          {submitLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </Button>
                        {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
                        {submitSuccess && <p className="text-green-400 text-sm">{submitSuccess}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-300 mb-4">You must enroll in this course to rate and comment.</p>
                    <Button
                      onClick={() => navigate(`/courses/${courseId}`)}
                      className="bg-primary hover:bg-primary-button-hover text-bg-card"
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              )
            ) : (
              <p className="text-gray-300 text-center">Please log in to rate and comment on this course.</p>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Course Reviews</h3>

              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
              ) : comments.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {paginatedComments.map((item) => (
                      <Card key={item.id} className="bg-gray-900 border-gray-700 overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              {/* User Avatar */}
                              <img loading="lazy"
                                src={item.user?.avatar || "https://via.placeholder.com/40"} // Fallback to placeholder if no avatar
                                alt={`${item.user?.username || "Anonymous"}'s avatar`}
                                className="w-10 h-10 rounded-full object-cover border border-gray-600"
                              />
                              <div>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={cn("h-4 w-4", star <= item.rating ? "text-yellow-400" : "text-gray-600")}
                                      fill={star <= item.rating ? "currentColor" : "none"}
                                    />
                                  ))}
                                </div>
                                <span className="font-medium text-gray-200">{item.user?.username || "Anonymous"}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">
                              {item.createdAt} {item.updatedAt !== item.createdAt && `(Updated: ${item.updatedAt})`}
                            </p>
                          </div>
                          <p className="text-gray-300 whitespace-pre-line">{item.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 text-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-300">No reviews yet. Be the first to share your experience!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}