import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, ChevronLeft, ChevronRight, Star } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import YouTubePlayer from "./youtubePlayer"

export default function LearnThroughVideoAndText() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* YouTube Video Player */}
            <YouTubePlayer videoId="qPTfXwPf_HM" />

            {/* Rest of the component remains the same */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-mono">Lesson 1: Introduction to Java</h1>
              <div className="flex gap-2">
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary transition hover:text-black">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Rating Section */}
            <Card className="p-6 bg-bg-card border-border-muted">
              <h2 className="font-mono mb-4 text-text-primary">Rate & Comment</h2>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button key={star} variant="ghost" size="icon" className="hover:bg-button-ghostHover">
                    <Star className="h-5 w-5 text-text-warning" fill="currentColor" />
                  </Button>
                ))}
              </div>
              <Textarea
                placeholder="Leave a comment..."
                className="bg-input-bg border-input-border focus:border-input-borderFocus mb-4"
              />
              <Button className="bg-button-primary hover:bg-button-hover text-bg-primary">Submit</Button>

              {/* Example Comments */}
              <div className="mt-6 space-y-4">
                <div className="border-t border-border-muted pt-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-text-warning" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-text-muted">Great lesson! Very clear</p>
                </div>
                <div className="border-t border-border-muted pt-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-text-warning" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-text-muted">I love how this was explained</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Course Outline Sidebar */}
          <Card className="bg-bg-card border-border-muted p-4">
            <h2 className="font-mono mb-4 text-lg text-text-primary">Course Outline</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-bg-success bg-opacity-10 rounded-md">
                <span className="text-text-primary">Lesson 1: Introduction to Java</span>
                <CheckCircle className="h-5 w-5 text-text-success" />
              </div>
              {["Variables & Data Types", "Control Structures", "OOP Concepts", "Exception Handling"].map(
                (lesson, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-bg-muted rounded-md cursor-pointer"
                  >
                    <span className="text-text-primary">
                      Lesson {index + 2}: {lesson}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

