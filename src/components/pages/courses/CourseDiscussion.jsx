import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCourse, getTopicList } from "@/lib/api/course_api";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import Header from "@/components/common/shared/header";
import FooterSection from "@/components/common/shared/footer";
import { GLOBALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function CourseDiscussion() {
  // State management
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, user: "Alice", text: "Does anyone understand the latest Java lesson?", time: "2 min ago" },
    { id: 2, user: "Bob", text: "Yes I can help! What part are you struggling with?", time: "Just now" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Set document title
  useEffect(() => {
    document.title = `Course Discussion - ${GLOBALS.APPLICATION_NAME}`;
  }, []);

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const data = await getCourse(id);
        setCourse(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id]);

  // Handle sending a new message (simplified for demo)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, user: "You", text: newMessage, time: "Just now" },
      ]);
      setNewMessage("");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-primary">Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-text-error">Error: {error}</p>
      </div>
    );
  }

  // Render course discussion
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Header />
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl h-[600px] mx-auto bg-bg-card border-border-primary shadow-soft flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-text-primary">
              Course: {course?.title} Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {/* Discussion Messages */}
            <div className="space-y-4 mb-6 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm">
                    {message.user.charAt(0)}
                  </div>
                  <div className="bg-bg-card p-3 rounded-lg shadow-soft">
                    <p className="font-bold text-text-primary">{message.user}</p>
                    <p className="text-text-primary">{message.text}</p>
                    <p className="text-text-muted text-sm mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area (at the bottom) */}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
              <Input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-input-bg text-input-text border-input-border focus:border-input-borderFocus focus:ring-input-focusRing"
              />
              <Button
                type="submit"
                className="bg-primary text-black font-bold hover:bg-primary/90 transition-colors text-base mr-2"
              >
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  );
}

export default CourseDiscussion;