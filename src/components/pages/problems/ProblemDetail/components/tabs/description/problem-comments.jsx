"use client"

import { MessageCircle, ChevronDown, ChevronUp, ArrowUp, MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { useState, useEffect, useCallback } from "react"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/provider/AuthProvider"
import { postCommentProblem } from "@/lib/api/problem_api"
import { Separator } from "@/components/ui/separator"

export default function DiscussionSection({ id, problemId }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(0)
  const [sortBy, setSortBy] = useState("createdAt")
  const [ascending, setAscending] = useState(false)
  const size = 5

  // New state for managing replies and reply boxes
  const [visibleReplies, setVisibleReplies] = useState({})
  const [replyBoxes, setReplyBoxes] = useState({})
  const [replyTexts, setReplyTexts] = useState({})
  const [loadedReplies, setLoadedReplies] = useState({})

  const { apiCall, isAuthenticated, user } = useAuth()

  const fetchComments = useCallback(async () => {
    if (!id) return
    try {
      const response = await apiCall(
        `${ENDPOINTS.GET_PROBLEM_COMMENTS.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`
      )
      if (!response.ok) throw new Error("Failed to fetch comments")
      const data = await response.json()

      setComments(data.content.filter(c => c.replyId === null))
      setTotalPages(data.totalPages)
      setTotalComments(data.totalElements)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }, [id, page, sortBy, ascending])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  function toggleCollapsed() {
    setIsCollapsed(!isCollapsed)
  }

  async function UploadComment() {
    try {
      const response = await postCommentProblem(apiCall, problemId, comment)
      if (response.status) {
        setComment("")
        setTotalComments(totalComments + 1)
        setComments((prev) => {
          const newComment = {
            id: 0,
            comment: comment,
            noUpvote: 0,
            createdBy: {
              id: user?.id || 0,
              avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
              username: user?.username || "you"
            },
            noReply: 0,
            createdAt: new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }),
            updatedAt: null,
            replyId: null,
            voted: false
          }

          // Add new comment at the top and remove the last item if list is too long
          const updatedComments = [newComment, ...prev]

          if (updatedComments.length > size) {
            updatedComments.pop()
          }

          return updatedComments
        })
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    }
  }

  // Toggle showing replies for a comment
  const toggleReplies = async (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))

    // Load fake replies if not already loaded
    if (!loadedReplies[commentId]) {
      const comment = comments.find((c) => c.id === commentId)
      if (comment) {
        // const fakeReplies = generateFakeReplies(commentId, comment.noReply)
        const response = await apiCall(
          `${ENDPOINTS.GET_PROBLEM_COMMENTS_REPLY.replace(":id", commentId)}`
        )
        if (!response.ok) throw new Error("Failed to fetch comments")
        const data = await response.json()
        setLoadedReplies((prev) => ({
          ...prev,
          [commentId]: data
        }))
      }
    }
  }

  // Toggle reply box for a comment
  const toggleReplyBox = (commentId) => {
    setReplyBoxes((prev) => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))

    if (!replyTexts[commentId]) {
      setReplyTexts((prev) => ({
        ...prev,
        [commentId]: ""
      }))
    }
  }

  // Handle reply text change
  const handleReplyTextChange = (commentId, text) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: text
    }))
  }

  // Submit a reply to a comment
  const submitReply = async (commentId) => {
    const replyText = replyTexts[commentId]
    if (!replyText.trim()) return

    // Create new reply
    const newReply = {
      id: `reply-${commentId}-${Date.now()}`,
      comment: replyText,
      noUpvote: 0,
      createdBy: {
        id: user?.id || 0,
        avatar: user?.avatar || "/placeholder.svg?height=40&width=40",
        username: user?.username || "you"
      },
      noReply: 0,
      createdAt: new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }),
      updatedAt: null,
      replyId: commentId,
      voted: false
    }

    try {
      const response = await postCommentProblem(apiCall, problemId, replyText, commentId)
      if (response.status) {
        setTotalComments(totalComments + 1)
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    }


    // Add reply to loaded replies
    setLoadedReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), newReply]
    }))

    // Increment reply count on parent comment
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, noReply: (c.noReply || 0) + 1 } : c)))

    // Clear reply text and close reply box
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: ""
    }))
    setReplyBoxes((prev) => ({
      ...prev,
      [commentId]: false
    }))

    // Make sure replies are visible
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: true
    }))
  }


  if (isAuthenticated) {
    return (
      <div className="w-full mx-auto space-y-6">
        <div className="flex items-center justify-between cursor-pointer" onClick={toggleCollapsed}>
          <h2 className="text-md font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Discussion ({totalComments})
          </h2>
          <Button variant="ghost" size="sm">
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {!isCollapsed && (
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Type comment here"
                className="min-h-[50px] resize-none border-0 bg-background ring-1"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex flex-col items-end justify-center">
                {!isAuthenticated && <p className="text-red-500 text-sm mt-2">Login to push comment</p>}
                <Button
                  onClick={UploadComment}
                  className="bg-primary text-black font-semibold mt-4"
                  disabled={!isAuthenticated || comment === ""}
                  title={`${!isAuthenticated ? "Login to pust your comment" : "Comment"}`}
                >
                  Comment
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="noUpvote">Upvotes</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={() => setAscending(!ascending)}>
                {ascending ? "Ascending" : "Descending"}
              </Button>
            </div>

            <div className="space-y-4">
              {comments &&
                comments.map((comment) => (
                  <div key={comment.id} className="space-y-4">
                    {/* Main comment */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted">
                        <img
                          src={comment.createdBy.avatar || "/placeholder.svg?height=40&width=40"}
                          alt={comment.createdBy.username}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {user && user.username === comment.createdBy.username ? (
                              <span className="font-bold">You</span>
                            ) : (
                              <span className="font-medium">{comment.createdBy.username}</span>
                            )}
                            <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <p>{comment.comment}</p>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 429.658 429.658">
                                <g>
                                  <g>
                                    <path d="M235.252,13.406l-0.447-0.998c-3.417-7.622-11.603-12.854-19.677-12.375l-0.3,0.016l-0.302-0.016    C214.194,0.011,213.856,0,213.524,0c-7.706,0-15.386,5.104-18.674,12.413l-0.452,0.998L13.662,176.079    c-6.871,6.183-6.495,12.657-4.971,16.999c2.661,7.559,10.361,13.373,18.313,13.82l1.592,0.297c0.68,0.168,1.356,0.348,2.095,0.427    c23.036,2.381,45.519,2.876,64.472,3.042l5.154,0.048V407.93c0,11.023,7.221,15.152,11.522,16.635l0.967,0.33l0.77,0.671    c3.105,2.717,7.02,4.093,11.644,4.093h179.215c4.626,0,8.541-1.376,11.639-4.093l0.771-0.671l0.965-0.33    c4.307-1.482,11.532-5.611,11.532-16.635V210.706l5.149-0.048c18.961-0.17,41.446-0.666,64.475-3.042    c0.731-0.079,1.407-0.254,2.082-0.422l1.604-0.302c7.952-0.447,15.65-6.262,18.312-13.82c1.528-4.336,1.899-10.811-4.972-16.998    L235.252,13.406z M344.114,173.365c-11.105,0.18-22.216,0.254-33.337,0.254c-5.153,0-9.363,1.607-12.507,4.768    c-3.372,3.4-5.296,8.48-5.266,13.932l0.005,0.65l-0.157,0.629c-0.437,1.767-0.64,3.336-0.64,4.928v194.001H137.458V198.526    c0-1.597-0.201-3.161-0.638-4.928l-0.157-0.629l0.005-0.65c0.031-5.456-1.892-10.537-5.271-13.937    c-3.141-3.161-7.353-4.763-12.507-4.768c-11.124,0-22.224-0.074-33.337-0.254l-13.223-0.218L214.834,44.897l142.503,128.249    L344.114,173.365z" />
                                  </g>
                                </g>
                              </svg>
                            </Button>
                            <span className="text-sm">{comment.noUpvote}</span>
                          </div>
                          {isAuthenticated &&
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sm"
                              onClick={() => toggleReplyBox(comment.id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                          }
                          {comment.noReply > 0 && (
                            <>
                              <Separator orientation="vertical" />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm text-muted-foreground hover:text-foreground hover:bg-transparent relative"
                                onClick={() => {
                                  toggleReplies(comment.id)
                                }}
                              >
                                <div className="absolute -left-6 top-1/2 h-px w-6 bg-gray-200 dark:bg-gray-700" />
                                {visibleReplies[comment.id] ? "Hide" : "Show"} {comment.noReply}{" "}
                                {comment.noReply === 1 ? "reply" : "replies"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reply box */}
                    {replyBoxes[comment.id] && (
                      <div className="ml-14 mt-2">
                        <div className="flex gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted overflow-hidden">
                            <img
                              src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                              alt="Your avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <Textarea
                              placeholder={`Reply to ${comment.createdBy.username}...`}
                              className="min-h-[40px] resize-none text-sm p-2"
                              value={replyTexts[comment.id] || ""}
                              onChange={(e) => handleReplyTextChange(comment.id, e.target.value)}
                            />
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleReplyBox(comment.id)}
                                className="mr-2"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => submitReply(comment.id)}
                                disabled={!isAuthenticated || !replyTexts[comment.id]?.trim()}
                                className="bg-primary text-primary-foreground"
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {visibleReplies[comment.id] && loadedReplies[comment.id] && (
                      <div className="ml-10 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                        {loadedReplies[comment.id].map((reply) => (
                          <div key={reply.id} className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted overflow-hidden">
                              <img
                                src={reply.createdBy.avatar || "/placeholder.svg?height=32&width=32"}
                                alt={reply.createdBy.username}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                {user && user.username === reply.createdBy.username ? (
                                  <span className="font-bold text-sm">You</span>
                                ) : (
                                  <span className="font-medium text-sm">{reply.createdBy.username}</span>
                                )}
                                <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                              </div>
                              <div className="text-sm">
                                <p>{reply.comment}</p>
                              </div>
                              <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 429.658 429.658">
                                      <g>
                                        <g>
                                          <path d="M235.252,13.406l-0.447-0.998c-3.417-7.622-11.603-12.854-19.677-12.375l-0.3,0.016l-0.302-0.016    C214.194,0.011,213.856,0,213.524,0c-7.706,0-15.386,5.104-18.674,12.413l-0.452,0.998L13.662,176.079    c-6.871,6.183-6.495,12.657-4.971,16.999c2.661,7.559,10.361,13.373,18.313,13.82l1.592,0.297c0.68,0.168,1.356,0.348,2.095,0.427    c23.036,2.381,45.519,2.876,64.472,3.042l5.154,0.048V407.93c0,11.023,7.221,15.152,11.522,16.635l0.967,0.33l0.77,0.671    c3.105,2.717,7.02,4.093,11.644,4.093h179.215c4.626,0,8.541-1.376,11.639-4.093l0.771-0.671l0.965-0.33    c4.307-1.482,11.532-5.611,11.532-16.635V210.706l5.149-0.048c18.961-0.17,41.446-0.666,64.475-3.042    c0.731-0.079,1.407-0.254,2.082-0.422l1.604-0.302c7.952-0.447,15.65-6.262,18.312-13.82c1.528-4.336,1.899-10.811-4.972-16.998    L235.252,13.406z M344.114,173.365c-11.105,0.18-22.216,0.254-33.337,0.254c-5.153,0-9.363,1.607-12.507,4.768    c-3.372,3.4-5.296,8.48-5.266,13.932l0.005,0.65l-0.157,0.629c-0.437,1.767-0.64,3.336-0.64,4.928v194.001H137.458V198.526    c0-1.597-0.201-3.161-0.638-4.928l-0.157-0.629l0.005-0.65c0.031-5.456-1.892-10.537-5.271-13.937    c-3.141-3.161-7.353-4.763-12.507-4.768c-11.124,0-22.224-0.074-33.337-0.254l-13.223-0.218L214.834,44.897l142.503,128.249    L344.114,173.365z" />
                                        </g>
                                      </g>
                                    </svg>
                                  </Button>
                                  <span className="text-xs">{reply.noUpvote}</span>
                                </div>
                              </div>

                              {/* Nested reply box */}
                              {replyBoxes[reply.id] && (
                                <div className="mt-2">
                                  <div className="flex gap-2">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted overflow-hidden">
                                      <img
                                        src={user?.avatar || "/placeholder.svg?height=24&width=24"}
                                        alt="Your avatar"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <Textarea
                                        placeholder={`Reply to ${reply.createdBy.username}...`}
                                        className="min-h-[40px] resize-none text-sm p-2"
                                        value={replyTexts[reply.id] || ""}
                                        onChange={(e) => handleReplyTextChange(reply.id, e.target.value)}
                                      />
                                      <div className="flex justify-end mt-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => toggleReplyBox(reply.id)}
                                          className="mr-2 h-6 text-xs"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => submitReply(reply.id)}
                                          disabled={!replyTexts[reply.id]?.trim()}
                                          className="bg-primary text-primary-foreground h-6 text-xs"
                                        >
                                          <Send className="h-3 w-3 mr-1" />
                                          Reply
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink href="#" isActive={page === index} onClick={() => setPage(index)}>
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page === totalPages - 1}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    )
  } else return <div></div>

}

