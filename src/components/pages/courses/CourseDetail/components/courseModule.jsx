"use client"

import { BookOpen, FileText, Video, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CourseModule({ chapters, toggleChapter, navigate }) {
  const handleToggle = (chapterId) => {
    if (toggleChapter) toggleChapter(chapterId) // Call external toggle if provided
  }

  return (
    <Tabs value="modules">
      <TabsContent value="modules" className="mt-0">
        <Card className="bg-gray-800/50 border-gray-700 shadow-xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-primary" /> Course Modules
            </h2>

            {chapters.length > 0 ? (
              <Accordion type="single" collapsible className="w-full border-none space-y-2 sm:space-y-3">
                {chapters.map((chapter, index) => (
                  <AccordionItem
                    key={chapter.id}
                    value={`chapter-${chapter.id}`}
                    className="border border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600"
                  >
                    <AccordionTrigger
                      className="hover:bg-gray-700/30 px-3 sm:px-4 py-3 sm:py-4 text-white flex justify-between items-center"
                      onClick={() => handleToggle(chapter.id)}
                    >
                      <div className="flex items-center">
                        <div className="bg-primary/20 text-primary w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">
                          {index + 1}
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-sm sm:text-base">{chapter.title}</h3>
                          <p className="text-xs sm:text-sm text-gray-400">{chapter.lessons?.length || 0} lessons</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-900/30 border-t border-gray-700/50 p-0">
                      {chapter.lessons?.length > 0 ? (
                        <ScrollArea className="h-[300px] sm:h-[400px] rounded-b-lg" scrollHideDelay={100}>
                          <div className="space-y-0.5 py-1">
                            {chapter.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border-l-2 border-transparent hover:border-gray-600"
                                onClick={() => navigate && navigate(lesson.id)}
                              >
                                <div className="flex items-center">
                                  {lesson.type === "VIDEO" ? (
                                    <div className="bg-blue-500/20 text-blue-400 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                      <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </div>
                                  ) : (
                                    <div className="bg-green-500/20 text-green-400 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="text-gray-200 text-xs sm:text-sm">{lesson.title}</h4>
                                    <p className="text-xs text-gray-400">
                                      {lesson.type === "VIDEO" ? "Video Lesson" : "Document Lesson"}
                                    </p>
                                  </div>
                                </div>
                                {lesson.completed && (
                                  <div className="text-green-500 flex items-center">
                                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="p-4 sm:p-6 text-center text-gray-400 text-sm">
                          <FileText className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 text-gray-600" />
                          <p>No lessons available for this chapter yet</p>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="bg-gray-900/30 rounded-xl border border-gray-700/50 p-6 sm:p-10 text-center">
                <FileText className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-gray-600" />
                <h3 className="text-lg sm:text-xl font-medium text-white mb-2">No Modules Available</h3>
                <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">
                  This course doesn&apos;t have any modules available yet. Check back later for updates.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
