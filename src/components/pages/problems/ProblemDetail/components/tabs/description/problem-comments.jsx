"use client"

import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useState, useEffect } from "react"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/context/AuthProvider"
import { postCommentProblem } from "@/lib/api/problem_api"

export default function DiscussionSection({ id, problemId }) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(1)
  const [sortBy, setSortBy] = useState("date")
  const [ascending, setAscending] = useState(false)
  const size = 5

  const { apiCall, isAuthenticated, user } = useAuth()

  useEffect(() => {
    fetchComments()
  }, [problemId, page, sortBy, ascending])

  async function fetchComments() {
    try {
      const response = await fetch(
        `${ENDPOINTS.GET_PROBLEM_COMMENTS.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`
      )
      if (!response.ok) throw new Error("Failed to fetch comments")
      const data = await response.json()
      setComments(data.content)
      setTotalPages(data.totalPages)
      setTotalComments(data.totalElements)
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  function toggleCollapsed() {
    setIsCollapsed(!isCollapsed)
  }

  async function UploadComment() {
    try {
      const response = await postCommentProblem(apiCall, problemId, comment)
      if (response.status) {
        setComment("")
        setComments((prev) => {
          const newComment = {
            id: 0,
            comment: comment,
            noUpvote: 0,
            createdBy: {
              id: 0,
              avatar: user.avatar,
              username: user.username
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


  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Discussion ({comments.length})
        </h2>
        <Button variant="ghost" size="sm" onClick={toggleCollapsed}>
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <Textarea
              placeholder="Type comment here"
              className="min-h-[100px] resize-none border-0 bg-background ring-1"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex flex-col items-end justify-center">
              {!isAuthenticated && (
                <p className="text-red-500 text-sm mt-2">Login to push comment</p>
              )}
              <Button onClick={UploadComment} className="bg-primary text-black font-semibold mt-4" disabled={!isAuthenticated || comment === ""} title={`${!isAuthenticated ? "Login to pust your comment" : "Comment"}`}>Comment</Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="upvotes">Upvotes</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={() => setAscending(!ascending)}>
              {ascending ? "Ascending" : "Descending"}
            </Button>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted">
                  <img src={comment.createdBy.avatar} alt={comment.createdBy.username} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(user && user.username === comment.createdBy.username)
                        ? <span className="font-bold">You</span>
                        : <span className="font-medium">{comment.createdBy.username}</span>
                      }
                      <span className="text-sm text-muted-foreground">{comment.createdAt}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p>{comment.comment}</p>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">{comment.noUpvote}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0} />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink href="#" isActive={page === index} onClick={() => setPage(index)}>
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
