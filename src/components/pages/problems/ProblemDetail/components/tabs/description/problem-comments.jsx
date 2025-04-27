"use client"

import { MessageCircle, ChevronDown, ChevronUp, MessageSquare, Send, Edit, Save } from "lucide-react"
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
import { useState, useEffect } from "react"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/providers/AuthProvider"
import { Separator } from "@/components/ui/separator"
import { postComment } from "@/lib/api/problem_api"
import { motion } from "framer-motion"
import { editComment, unupvoteComment, upvoteComment } from "@/lib/api/comment_api"
import { toast } from "sonner"

export default function DiscussionSection({ id, locationId, type, activeTab }) {
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
  const [isEditOpen, setIsEditOpen] = useState([])
  const { apiCall, isAuthenticated, user } = useAuth()

  const fetchCommentsDescription = async () => {
    try {
      const url =
        type === "PROBLEM"
          ? `${ENDPOINTS.GET_PROBLEM_COMMENTS.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`
          : `${ENDPOINTS.GET_SOLUTION_COMMENTS.replace(":id", locationId)}?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`

      const response = await apiCall(url)

      if (!response || !response.ok) {
        throw new Error("Failed to fetch comments")
      }

      const text = await response.text()
      if (!text) {
        setComments([])
        setTotalPages(1)
        setTotalComments(0)
        return
      }

      const data = JSON.parse(text)

      const content = data?.content || []

      for (let i = 0; i < content.length; i++) {
        if (content[i]?.user) {
          setIsEditOpen((prev) => ({
            ...prev,
            [content[i].id]: false
          }))
        }
      }

      setComments(content)
      setTotalComments(data?.totalElements || 0)
      setTotalPages(data?.totalPages || 0)
    } catch (error) {
      toast.warning("Error fetching comments:", error)
    }
  }

  useEffect(() => {
    fetchCommentsDescription()
  }, [id, page, sortBy, ascending, activeTab])

  function toggleCollapsed() {
    setIsCollapsed(!isCollapsed)
  }

  async function UploadComment() {
    try {
      const response = await postComment(apiCall, locationId, comment, null, type)
      if (response.status) {
        setComment("")
        setTotalComments(totalComments + 1)
        setComments((prev) => {
          const newComment = response.data

          // Add new comment at the top and remove the last item if list is too long
          const updatedComments = [newComment, ...prev]

          if (updatedComments.length > size) {
            updatedComments.pop()
          }

          return updatedComments
        })
      } else {
        toast.error("Error", {
          description: response.message || "Failed to post comment"
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Failed to post comment"
      })
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
          `${ENDPOINTS.GET_COMMENTS_REPLY + commentId}`
        )
        if (!response.ok) throw new Error("Failed to fetch comments")
        const data = await response.json()
        setLoadedReplies((prev) => ({
          ...prev,
          [commentId]: data
        }))
        for (let i = 0; i < data.length; i++) {
          if (data[i].user) {
            setIsEditOpen((prev) => ({
              ...prev,
              [data[i].id]: false
            }))
          }
        }

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

  const handleUpvoteUnupvoteComment = (comment) => {
    if (comment.voted) {
      toggleUnupvoteComment(comment)
    }
    else {
      toggleUpvoteComment(comment)
    }
  }

  const toggleUpvoteComment = async (comment) => {
    try {
      upvoteComment(apiCall, comment.id)
      setComments((prevList) =>
        prevList.map((item) =>
          item.id === comment.id ? { ...item, voted: !item.voted, noUpvote: item.noUpvote + 1 } : item
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const toggleUnupvoteComment = async (comment) => {
    try {
      unupvoteComment(apiCall, comment.id)
      setComments((prevList) =>
        prevList.map((item) =>
          item.id === comment.id ? { ...item, voted: !item.voted, noUpvote: item.noUpvote - 1 > 0 ? item.noUpvote - 1 : 0 } : item
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const updateUpvoted = (loadedReplies, comment) => {
    const replyId = comment.replyId

    if (loadedReplies[replyId]) {
      loadedReplies[replyId] = loadedReplies[replyId].map(reply =>
        reply.id === comment.id ? { ...reply, voted: true, noUpvote: reply.noUpvote + 1 } : reply
      )
    }

    return { ...loadedReplies } // Trả về một object mới để React nhận diện thay đổi
  }

  const updateUnupvoted = (loadedReplies, comment) => {
    const replyId = comment.replyId
    if (loadedReplies[replyId]) {
      loadedReplies[replyId] = loadedReplies[replyId].map(reply =>
        reply.id === comment.id ? { ...reply, voted: false, noUpvote: reply.noUpvote - 1 > 0 ? reply.noUpvote - 1 : 0 } : reply
      )
    }

    return { ...loadedReplies } // Trả về một object mới để React nhận diện thay đổi
  }

  const handleUpvoteUnupvoteReply = (comment) => {
    if (comment.voted) {
      toggleUnupvoteReply(comment)
    }
    else {
      toggleUpvoteReply(comment)
    }
  }

  const toggleUpvoteReply = async (comment) => {
    try {
      upvoteComment(apiCall, comment.id)
      setLoadedReplies(updateUpvoted(loadedReplies, comment))
    } catch (error) {
      console.error(error)
    }
  }

  const toggleUnupvoteReply = async (comment) => {
    try {
      unupvoteComment(apiCall, comment.id)
      setLoadedReplies(updateUnupvoted(loadedReplies, comment))
    } catch (error) {
      console.error(error)
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
    try {
      const response = await postComment(apiCall, locationId, replyText, commentId, type)
      if (response.status) {
        setTotalComments(totalComments + 1)
      }
      const newReply = response.data
      // Add reply to loaded replies
      setLoadedReplies((prev) => ({
        ...prev,
        [commentId]: [...(prev[commentId] || []), newReply]
      }))
    } catch (error) {
      toast.error("Error posting comment", {
        description: error.message || "Failed to post comment"
      })
    }
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
  const toggleEditComment = (id, status, newComment) => {
    if (status == "SAVE") {
      if (newComment === "") {
        toast.error("Error", {
          description: "Please enter a comment"
        })
      }
      else {
        editNewComment(id, newComment)
        setIsEditOpen((prev) => ({
          ...prev,
          [id]: status == "EDIT" ? true : false
        }))
      }
    } else {
      setIsEditOpen((prev) => ({
        ...prev,
        [id]: status == "EDIT" ? true : false
      }))
    }
  }

  const editNewComment = async (id, comment) => {
    try {
      await editComment(apiCall, id, comment)
      toast.success("Edit Comment", {
        description: "Edit comment successful"
      })
      setComments((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, comment: comment } : item
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const setNewComment = (newComment, id) => {
    setComments((prevList) =>
      prevList.map((item) =>
        item.id === id ? { ...item, comment: newComment } : item
      )
    )
  }

  const setNewReply = (newComment, reply) => {
    setLoadedReplies(updateReply(loadedReplies, reply, newComment))
  }

  const updateReply = (loadedReplies, comment, newComment) => {
    const replyId = comment.replyId
    if (loadedReplies[replyId]) {
      loadedReplies[replyId] = loadedReplies[replyId].map(reply =>
        reply.id === comment.id ? { ...reply, comment: newComment } : reply
      )
    }

    return { ...loadedReplies } // Trả về một object mới để React nhận diện thay đổi
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

        {
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: !isCollapsed ? 1 : 0, height: !isCollapsed ? "auto" : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <div>
                <div className="pt-4 px-2">
                  <Textarea
                    placeholder="Type comment here"
                    className="min-h-[50px] resize-none border-0 bg-background ring-1"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-end justify-center">
                  {!isAuthenticated && <p className="text-red-500 text-sm mt-2">Login to push comment</p>}
                  <Button
                    onClick={UploadComment}
                    className="bg-primary text-black font-semibold mt-4"
                    disabled={!isAuthenticated || !comment.trim()}
                    title={`${!isAuthenticated ? "Login to pust your comment" : "Comment"}`}
                  >
                    Comment
                  </Button>
                </div>
              </div>

              {comments.length > 4 &&
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
              }

              <div className="space-y-4">
                {comments &&
                  comments.map((comment) => (
                    <div key={comment.id} className="space-y-4">
                      {/* Main comment */}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted">
                          <img loading="lazy"
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
                              {comment.updatedAt && comment.updatedAt !== comment.createdAt &&
                                <span className="text-sm text-muted-foreground">(edited)</span>
                              }
                            </div>
                          </div>
                          <div className="text-sm">
                            <p>
                              {isEditOpen[comment.id]
                                ? <Textarea required
                                  style={{ width: "95%" }}
                                  placeholder="Type comment here"
                                  className="min-h-[50px] resize-none border-0 bg-background ring-1"
                                  value={comment.comment}
                                  onChange={(e) => setNewComment(e.target.value, comment.id)}
                                />
                                : comment.comment}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-1">
                              <Button onClick={() => handleUpvoteUnupvoteComment(comment)} variant="ghost" size="icon" className="h-8 w-8">
                                {comment.voted ? <svg className="h-4 w-4 text-yellow-500" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>
                                  : <svg className="h-4 w-4 text-black" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>}
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
                            {comment.user && comment.canEdit && !isEditOpen[comment.id] &&
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm"
                                onClick={() => toggleEditComment(comment.id, "EDIT", comment.comment)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            }

                            {comment.user && comment.canEdit && isEditOpen[comment.id] &&
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm bg-green-500 text-white hover:bg-green-500 hover:text-white "
                                onClick={() => toggleEditComment(comment.id, "SAVE", comment.comment)}
                                disabled={!comment.comment.trim()}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Save
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
                              <img loading="lazy"
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
                                <img loading="lazy"
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
                                  <p>
                                    {isEditOpen[reply.id]
                                      ? <Textarea
                                        style={{ width: "95%" }}
                                        placeholder="Type comment here"
                                        className="min-h-[50px] resize-none border-0 bg-background ring-1"
                                        value={reply.comment}
                                        onChange={(e) => setNewReply(e.target.value, reply)}
                                      />
                                      : reply.comment}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4 pt-1">
                                  <div className="flex items-center gap-1">
                                    <Button onClick={() => handleUpvoteUnupvoteReply(reply)} variant="ghost" size="icon" className="h-6 w-6">
                                      {reply.voted ? <svg className="h-4 w-4 text-yellow-500" fill="currentColor" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>
                                        : <svg className="h-4 w-4 text-black" aria-hidden="true" focusable="false" data-prefix="far" data-icon="up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M192 82.4L334.7 232.3c.8 .8 1.3 2 1.3 3.2c0 2.5-2 4.6-4.6 4.6H248c-13.3 0-24 10.7-24 24V432H160V264c0-13.3-10.7-24-24-24H52.6c-2.5 0-4.6-2-4.6-4.6c0-1.2 .5-2.3 1.3-3.2L192 82.4zm192 153c0-13.5-5.2-26.5-14.5-36.3L222.9 45.2C214.8 36.8 203.7 32 192 32s-22.8 4.8-30.9 13.2L14.5 199.2C5.2 208.9 0 221.9 0 235.4c0 29 23.5 52.6 52.6 52.6H112V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V288h59.4c29 0 52.6-23.5 52.6-52.6z"></path></svg>}
                                    </Button>
                                    <span className="text-xs">{reply.noUpvote}</span>
                                  </div>
                                  {reply.user && reply.canEdit && !isEditOpen[reply.id] &&
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-sm"
                                      onClick={() => toggleEditComment(reply.id, "EDIT", reply.comment)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  }

                                  {reply.user && reply.canEdit && isEditOpen[reply.id] &&
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-sm bg-green-500 text-white font-bold hover:bg-green-500 hover:text-white "
                                      onClick={() => toggleEditComment(reply.id, "SAVE", reply.comment)}
                                      disabled={!reply.comment.trim()}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Save
                                    </Button>
                                  }
                                </div>


                                {/* Nested reply box */}
                                {replyBoxes[reply.id] && (
                                  <div className="mt-2">
                                    <div className="flex gap-2">
                                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted overflow-hidden">
                                        <img loading="lazy"
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

              {totalPages >= 2 &&
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
              }
            </div>
          </motion.div>
        }
      </div>
    )
  } else return <div></div>

}

