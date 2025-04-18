"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getCourse, getCourseDiscussion, discussionCourse, getDiscussionReply, upvoteDiscussion, unUpvoteDiscussion } from "@/lib/api/course_api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GLOBALS } from "@/lib/constants"
import { Send, X, ArrowBigUp, ChevronDown, ChevronUp, MessageSquare, Clock, GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/providers/AuthProvider"

export default function CourseDiscussion({ courseId, title = "Course Discussion", onClose }) {
  const params = useParams()
  const id = courseId || params.id
  const [course, setCourse] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [posting, setPosting] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("noUpvote")
  const [sortDirection, setSortDirection] = useState("desc")

  const { user, apiCall } = useAuth()

  useEffect(() => {
    document.title = `${title} - ${GLOBALS.APPLICATION_NAME}`
  }, [title])

  useEffect(() => {
    fetchData()
  }, [id, page, sortBy, sortDirection])

  const fetchData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const courseData = await getCourse(apiCall, id)
      setCourse(courseData)
      const discussionData = await getCourseDiscussion(apiCall, id, { page, size: 5, sortBy, sortDirection })
      const replyPromises = discussionData.content.map(comment =>
        getDiscussionReply(apiCall, comment.id).catch(() => [])
      )
      const repliesData = await Promise.all(replyPromises)
      const allReplies = repliesData.flat()
      const transformedMessages = await transformDiscussionData(discussionData.content, allReplies)
      setMessages(transformedMessages)
      setTotalPages(discussionData.totalPages)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const transformDiscussionData = async (discussionData, replyData) => {
    const messagesWithAvatars = discussionData.map((comment) => {
      const commentReplies = replyData.filter((reply) => reply.replyId === comment.id)

      const avatarUrl = comment.createdBy.avatar || "/placeholder.svg?height=40&width=40"

      const repliesWithAvatars = commentReplies.map((reply) => ({
        id: reply.id,
        user: reply.createdBy.username,
        role: reply.createdBy.role || "STUDENT", // Add role, default to "STUDENT" if not provided
        text: reply.comment,
        time: reply.createdAt,
        avatar: reply.createdBy.avatar || "/placeholder.svg?height=40&width=40",
        likes: reply.noUpvote,
        liked: reply.voted,
      }))

      return {
        id: comment.id,
        user: comment.createdBy.username,
        role: comment.createdBy.role || "STUDENT", // Add role, default to "STUDENT" if not provided
        text: comment.comment,
        time: comment.createdAt,
        avatar: avatarUrl,
        likes: comment.noUpvote,
        liked: comment.voted,
        replies: repliesWithAvatars,
        showReplies: false,
      }
    })

    return messagesWithAvatars
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setPosting(true)
    try {
      const data = {
        comment: newMessage,
        courseId: parseInt(id),
        commentReply: replyingTo ? parseInt(replyingTo.id) : null,
      }
      const response = await discussionCourse(data, (url, options) => fetch(url, options))
      await fetchData()
      setNewMessage("")
      setReplyingTo(null)
    } catch (error) {
      setError(`Failed to send message: ${error.message}`)
    } finally {
      setPosting(false)
    }
  }

  const toggleLike = async (messageId, isReply = false, parentId = null) => {
    try {
      const message = isReply
        ? messages.find(m => m.id === parentId).replies.find(r => r.id === messageId)
        : messages.find(m => m.id === messageId)

      setMessages(prevMessages =>
        prevMessages.map((msg) => {
          if (isReply && msg.id === parentId) {
            return {
              ...msg,
              replies: msg.replies.map((reply) =>
                reply.id === messageId
                  ? {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                  }
                  : reply
              ),
            }
          }
          if (!isReply && msg.id === messageId) {
            return {
              ...msg,
              liked: !msg.liked,
              likes: msg.liked ? msg.likes - 1 : msg.likes + 1,
            }
          }
          return msg
        })
      )

      if (!message.liked) {
        await upvoteDiscussion(apiCall, messageId)
      } else {
        await unUpvoteDiscussion(apiCall, messageId)
      }
    } catch (error) {
      setMessages(prevMessages =>
        prevMessages.map((msg) => {
          if (isReply && msg.id === parentId) {
            return {
              ...msg,
              replies: msg.replies.map((reply) =>
                reply.id === messageId
                  ? {
                    ...reply,
                    liked: !reply.liked,
                    likes: reply.liked ? reply.likes - 1 : reply.likes + 1,
                  }
                  : reply
              ),
            }
          }
          if (!isReply && msg.id === messageId) {
            return {
              ...msg,
              liked: !msg.liked,
              likes: msg.liked ? msg.likes - 1 : msg.likes + 1,
            }
          }
          return msg
        })
      )
      setError(`Failed to toggle like: ${error.message}`)
    }
  }

  const toggleReplies = (messageId) => {
    setMessages(prevMessages =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, showReplies: !msg.showReplies } : msg
      )
    )
  }

  const handleReplyClick = (message) => {
    setReplyingTo(message)
  }

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (e) {
      return timeString
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  if (loading) {
    return (
      <Card className="flex flex-col h-full items-center justify-center p-8 border-border shadow-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-button"></div>
        <p className="text-sm text-text-muted mt-4">Loading discussion...</p>
      </Card>
    )
  }

  const MessageActions = ({ message, isReply = false, parentId = null }) => (
    <div className="flex items-center gap-3 mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-text-muted">
              <Clock className="h-3 w-3 mr-1" />
              <span>{formatTime(message.time)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{new Date(message.time).toLocaleString()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 rounded-full ${message.liked ? "text-primary bg-primary/10 hover:bg-primary/30 hover:text-primary" : "text-text-muted hover:bg-bg-muted hover:text-primary"}`}
        onClick={() => toggleLike(message.id, isReply, parentId)}
      >
        <ArrowBigUp className={`size-3 ${message.liked ? "fill-primary-button" : ""}`} />
        {message.likes > 0 &&
          <span className="text-xs ml-1">{message.likes}</span>
        }
      </Button>

      {!isReply && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full text-text-muted hover:bg-bg-muted hover:text-text-primary"
          onClick={() => handleReplyClick(message)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Reply</span>
        </Button>
      )}
    </div>
  )

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-3xl bg-bg-primary rounded-lg overflow-hidden border border-border-muted shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-bg-card border-b border-border-muted space-y-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-text-primary">{course?.title ? `${course.title} ${title}` : title}</h3>
          <Badge variant="outline" className="bg-primary-button/10 text-primary-button border-primary-button/20">
            Live
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary rounded-full hover:bg-primary" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>

      <div className="p-4 bg-bg-secondary border-b border-border-muted">
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-1 text-sm text-text-muted">
            <span>Sort by:</span>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-8 text-sm bg-bg-muted text-primary border-border-muted">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="noUpvote">Upvotes</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortDirection} onValueChange={setSortDirection}>
            <SelectTrigger className="w-[140px] h-8 text-sm bg-bg-muted text-primary border-border-muted">
              <SelectValue placeholder="Sort direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {error && (
          <div className="mb-4 p-3 bg-bg-error rounded-lg text-text-error text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-40 text-text-muted">
            <MessageSquare className="h-10 w-10 mb-2 opacity-30" />
            <p>No discussions yet. Be the first to comment!</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="mb-6">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 flex-shrink-0 border border-border-muted">
                <AvatarImage src={message.avatar} alt={message.user} className="object-cover" />
                <AvatarFallback className="bg-bg-muted text-text-primary">{message.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-bg-muted rounded-lg p-3 border border-border-muted shadow-sm">
                  <p className="font-medium text-sm text-text-primary flex items-center">
                    {message.user}
                    {message.role === "TEACHER" && (
                      <GraduationCap className="ml-1 h-3.5 w-3.5 text-primary-button" />
                    )}
                  </p>
                  <p className="text-sm mt-1 text-text-secondary whitespace-pre-wrap">{message.text}</p>
                </div>
                <MessageActions message={message} />

                {message.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 px-3 text-primary-button hover:bg-primary-button/10 hover:text-primary rounded-full"
                    onClick={() => toggleReplies(message.id)}
                  >
                    {message.showReplies ? (
                      <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    )}
                    <span className="text-xs">
                      {message.showReplies ? "Hide" : "View"} {message.replies.length}{" "}
                      {message.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </Button>
                )}

                {message.showReplies && message.replies.length > 0 && (
                  <div className="ml-6 mt-3 space-y-4 pl-3 border-l-2 border-border-muted">
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0 border border-border-muted">
                          <AvatarImage src={reply.avatar} alt={reply.user} className="object-cover" />
                          <AvatarFallback className="bg-bg-muted text-text-primary">{reply.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-bg-muted rounded-lg p-3 border border-border-muted shadow-sm">
                            <p
                              className={`${reply.user === user?.username ? "font-semibold" : "font-medium"} text-sm text-text-primary flex items-center`}
                            >
                              {reply.user === user?.username ? "You" : reply.user}
                              {reply.role === "TEACHER" && (
                                <GraduationCap className="ml-1 h-3.5 w-3.5 text-primary-button" />
                              )}
                            </p>
                            <p className="text-sm mt-1 text-text-secondary whitespace-pre-wrap">{reply.text}</p>
                          </div>
                          <MessageActions message={reply} isReply={true} parentId={message.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>

      <CardFooter className="flex flex-col p-4 border-t border-border-muted bg-bg-secondary">
        {totalPages > 1 && (
          <div className="flex justify-between items-center w-full mb-3">
            <Button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              variant="ghost"
              size="sm"
              className="text-xs h-8 bg-bg-muted text-primary border-border-muted hover:bg-primary-button"
            >
              Previous
            </Button>
            <span className="text-sm text-text-muted">Page {page + 1} of {totalPages}</span>
            <Button
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
              variant="ghost"
              size="sm"
              className="text-xs h-8 bg-bg-muted text-primary border-border-muted hover:bg-primary-button"
            >
              Next
            </Button>
          </div>
        )}

        {replyingTo && (
          <div className="mb-3 p-2 bg-bg-muted rounded-lg border border-border-muted w-full">
            <div className="flex justify-between items-center">
              <p className="text-xs text-text-muted">
                Replying to <span className="font-medium text-primary-button">{replyingTo.user}</span>
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={cancelReply}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-1 truncate">{replyingTo.text}</p>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
          <Avatar className="h-9 w-9 flex-shrink-0 border border-border-muted">
            <AvatarImage src={user && user.avatar || "/placeholder.svg?height=40&width=40"} alt="You" className="object-cover" />
            <AvatarFallback className="bg-bg-muted text-text-primary">Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex items-center gap-2 bg-bg-muted rounded-full px-4 border border-border-muted focus-within:border-primary-button transition-colors">
            <Input
              type="text"
              placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Write a comment..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 h-10 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-text-primary placeholder:text-text-placeholder"
              disabled={posting}
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 rounded-full ${newMessage.trim() ? "text-primary-button hover:bg-primary-button/10" : "text-text-muted"}`}
              disabled={posting || !newMessage.trim()}
            >
              {posting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-button"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}