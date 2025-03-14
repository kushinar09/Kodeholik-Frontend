import { BookOpen, FileText, Video } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function CourseModule({ chapters, toggleChapter, navigate }) {
  const handleToggle = (chapterId) => {
    console.log(`Toggling chapter ${chapterId}`) // Debug toggle action
    if (toggleChapter) toggleChapter(chapterId) // Call external toggle if provided
  }

  return (
    <TabsContent value="modules" className="mt-0">
      <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-primary" /> Course Modules
          </h2>

          {chapters.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {chapters.map((chapter) => (
                <AccordionItem
                  key={chapter.id}
                  value={`chapter-${chapter.id}`}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger
                    className="hover:bg-gray-700/30 px-4 py-4 text-white flex justify-between items-center"
                    onClick={() => handleToggle(chapter.id)} // Debug and toggle
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center mr-3">
                        {chapter.id}
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{chapter.title}</h3>
                        <p className="text-sm text-gray-400">{chapter.lessons?.length || 0} lessons</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="bg-gray-900/30 border-t border-gray-700/50">
                    {chapter.lessons?.length > 0 ? (
                      <div className="divide-y divide-gray-700/50">
                        {chapter.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors"
                          >
                            <div className="flex items-center">
                              {lesson.type === "VIDEO" ? (
                                <div className="bg-blue-500/20 text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                  <Video className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="bg-green-500/20 text-green-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                  <FileText className="h-4 w-4" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-gray-200">{lesson.title}</h4>
                                <p className="text-xs text-gray-400">
                                  {lesson.type === "VIDEO" ? "Video Lesson" : "Document Lesson"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent accordion toggle on button click
                                navigate(`#lesson-${lesson.id}`)
                              }}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        <FileText className="h-10 w-10 mx-auto mb-2 text-gray-600" />
                        <p>No lessons available for this chapter yet</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 p-10 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-medium text-white mb-2">No Modules Available</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                This course doesn't have any modules available yet. Check back later for updates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
}