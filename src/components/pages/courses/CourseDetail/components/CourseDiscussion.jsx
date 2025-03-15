"use client"

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourse, getCourseDiscussion, discussionCourse } from "@/lib/api/course_api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GLOBALS } from "@/lib/constants";
import { Send, X, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function CourseDiscussion({ onClose }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [posting, setPosting] = useState(false); // State for posting loading

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `Course Discussion - ${GLOBALS.APPLICATION_NAME}`;
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch course details
        const courseData = await getCourse(id);
        setCourse(courseData);

        // Fetch discussion data
        const discussionData = await getCourseDiscussion(id);
        
        // Transform discussion data into messages format
        const transformedMessages = transformDiscussionData(discussionData);
        setMessages(transformedMessages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Transform API discussion data into messages format
  const transformDiscussionData = (discussionData) => {
    const mainComments = discussionData.filter((item) => item.replyId === null);
    const replies = discussionData.filter((item) => item.replyId !== null);

    const messages = mainComments.map((comment) => ({
      id: comment.id,
      user: comment.createdBy.username,
      text: comment.comment,
      time: comment.createdAt,
      avatar: comment.createdBy.avatar || "/placeholder.svg?height=40&width=40",
      likes: comment.noUpvote,
      liked: comment.voted,
      replies: replies
        .filter((reply) => reply.replyId === comment.id)
        .map((reply) => ({
          id: reply.id,
          user: reply.createdBy.username,
          text: reply.comment,
          time: reply.createdAt,
          avatar: reply.createdBy.avatar || "/placeholder.svg?height=40&width=40",
          likes: reply.noUpvote,
          liked: reply.voted,
        })),
      showReplies: false, // Default to collapsed, can be changed to true if preferred
    }));

    return messages;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setPosting(true);
    try {
      const data = {
        comment: newMessage,
        courseId: parseInt(id), // Ensure courseId is an integer
        commentReply: replyingTo ? replyingTo.id : null, // Set replyId if replying
      };

      // Post the new comment or reply
      await discussionCourse(data, (url, options) => fetch(url, options));

      // Refetch discussion data to update the UI
      const discussionData = await getCourseDiscussion(id);
      const transformedMessages = transformDiscussionData(discussionData);
      setMessages(transformedMessages);

      setNewMessage("");
      setReplyingTo(null);
    } catch (error) {
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = (messageId, isReply = false, parentId = null) => {
    setMessages(
      messages.map((msg) => {
        if (isReply && msg.id === parentId) {
          return {
            ...msg,
            replies: msg.replies.map((reply) =>
              reply.id === messageId
                ? { ...reply, liked: !reply.liked, likes: reply.liked ? reply.likes - 1 : reply.likes + 1 }
                : reply
            ),
          };
        }
        if (!isReply && msg.id === messageId) {
          return { ...msg, liked: !msg.liked, likes: msg.liked ? msg.likes - 1 : msg.likes + 1 };
        }
        return msg;
      })
    );
  };

  const toggleReplies = (messageId) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, showReplies: !msg.showReplies } : msg)));
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading discussion...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="bg-destructive/10 p-3 rounded-lg">
          <p className="text-destructive text-sm">Error: {error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const MessageActions = ({ message, isReply = false, parentId = null }) => (
    <div className="flex items-center gap-3 mt-1">
      <span className="text-sm text-muted-foreground">{message.time}</span>
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 px-2 ${message.liked ? "text-primary" : "text-muted-foreground"}`}
        onClick={() => toggleLike(message.id, isReply, parentId)}
      >
        <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${message.liked ? "fill-current" : ""}`} />
        <span className="text-xs">Like{message.likes > 0 && ` · ${message.likes}`}</span>
      </Button>
      {!isReply && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-muted-foreground"
          onClick={() => setReplyingTo(message)}
        >
          <span className="text-xs">Reply</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl bg-background rounded-lg overflow-hidden border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-card border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{course?.title || "Course"} Discussion</h3>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Live
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-6">
            {/* Main message */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={message.avatar} alt={message.user} />
                <AvatarFallback>{message.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3">
                  <p className="font-medium text-sm">{message.user}</p>
                  <p className="text-sm mt-1">{message.text}</p>
                </div>
                <MessageActions message={message} />

                {/* Show reply toggle only if there are replies */}
                {message.replies && message.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 px-2 text-primary"
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

                {/* Render replies if showReplies is true and replies exist */}
                {message.showReplies && message.replies && message.replies.length > 0 && (
                  <div className="ml-6 mt-2 space-y-3">
                    {message.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={reply.avatar} alt={reply.user} />
                          <AvatarFallback>{reply.user[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-3">
                            <p className="font-medium text-sm">{reply.user}</p>
                            <p className="text-sm mt-1">{reply.text}</p>
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

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
          <AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4">
          <Input
            type="text"
            placeholder={replyingTo ? `Reply to ${replyingTo.user}...` : "Write a comment..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 h-10 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            disabled={posting}
          />
          <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={posting}>
            {posting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </form>
    </div>
  );
}