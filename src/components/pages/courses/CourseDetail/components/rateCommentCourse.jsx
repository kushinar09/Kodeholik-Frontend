import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getCourse, rateCommentCourse, getRateCommentCourse } from "@/lib/api/course_api"

export default function RateCommentCourse({ courseId, setCourse }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitLoading, setSubmitLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [ratingError, setRatingError] = useState("")
  const [commentError, setCommentError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoadingComments(true)
        console.log("Fetching comments for courseId:", courseId)
        if (!courseId || isNaN(courseId)) {
          throw new Error("Invalid courseId provided to fetchComments")
        }
        const fetchedComments = await getRateCommentCourse(courseId)
        console.log("Successfully fetched comments:", fetchedComments)
        setComments(Array.isArray(fetchedComments) ? fetchedComments : [])
      } catch (error) {
        console.error("Failed to fetch comments:", error.message)
        setComments([])
      } finally {
        setLoadingComments(false)
      }
    }
    fetchComments()
  }, [courseId])

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

    setSubmitLoading(true)
    try {
      const data = {
        courseId: parseInt(courseId),
        rating: rating,
        comment: comment.trim(),
      }
      console.log("Submitting payload:", JSON.stringify(data))

      const apiCall = async (url, options) => {
        console.log("Request URL:", url)
        console.log("Request Options:", options)
        const response = await fetch(url, options)
        console.log("Raw Response Status:", response.status)
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Server error response:", errorText)
          throw new Error(`Failed to submit rating and comment: ${response.status} - ${errorText}`)
        }
        const responseData = await response.json().catch(() => ({}))
        console.log("Server success response:", responseData)
        return responseData
      }

      const submittedData = await rateCommentCourse(data, apiCall)
      setSubmitSuccess("Rating and comment submitted successfully!")

      // Add comment locally using server response if available
      const newComment = submittedData && submittedData.id
        ? submittedData
        : {
            id: Date.now(), // Fallback ID
            courseId: parseInt(courseId),
            rating,
            comment: comment.trim(),
            createdAt: new Date().toLocaleString(),
          }
      setComments((prev) => [newComment, ...prev])

      setRating(0)
      setComment("")
      setRatingError("")
      setCommentError("")

      // Refetch comments for server sync
      const fetchedComments = await getRateCommentCourse(courseId)
      console.log("Refetched comments after submission:", fetchedComments)
      setComments(Array.isArray(fetchedComments) ? fetchedComments : [newComment])
    } catch (error) {
      setSubmitError(error.message)
      console.error("Submission error:", error)
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <TabsContent value="overview" className="mt-0">
      <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
        <CardContent className="p-8">
          <div>
            <Card className="p-6 bg-bg-card border-border-muted">
              <h2 className="font-mono mb-4 text-text-primary">Rate & Comment</h2>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRating(star)}
                    className={`hover:bg-button-ghostHover ${rating >= star ? "text-yellow-400" : "text-gray-500"}`}
                  >
                    <Star
                      className="h-5 w-5"
                      fill={rating >= star ? "currentColor" : "none"}
                    />
                  </Button>
                ))}
              </div>
              {ratingError && (
                <p className="text-red-500 text-sm mb-2">{ratingError}</p>
              )}
              <Textarea
                placeholder="Leave a comment (10-5000 characters)..."
                value={comment}
                onChange={handleCommentChange}
                className="bg-input-bg border-input-border text-gray-300 focus:border-input-borderFocus mb-2"
                disabled={submitLoading}
              />
              {commentError && (
                <p className="text-red-500 text-sm mb-2">{commentError}</p>
              )}
              <Button
                onClick={handleSubmitRatingComment}
                disabled={submitLoading || ratingError || commentError}
                className="bg-button-primary hover:bg-button-hover text-bg-primary mb-2"
              >
                {submitLoading ? "Submitting..." : "Submit"}
              </Button>
              {submitError && (
                <p className="text-red-500 text-sm mb-2">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-green-500 text-sm mb-2">{submitSuccess}</p>
              )}

              <div className="mt-6 space-y-4">
                {loadingComments ? (
                  <p className="text-gray-300">Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((item) => (
                    <div key={item.id} className="border-t border-border-muted pt-4">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 text-text-warning"
                            fill={star <= item.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <p className="text-text-muted">{item.comment}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Posted on: {item.createdAt} {item.updatedAt !== item.createdAt && `(Updated: ${item.updatedAt})`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-300">No comments yet. Be the first to leave a review!</p>
                )}
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}