"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Video, FileText, BookOpen, CheckCircle2 } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CourseOutline({
  chapters,
  selectedLesson,
  activeAccordion,
  setActiveAccordion,
  handleLessonSelect,
}) {
  return (
    <Card className="bg-gray-800/30 border-gray-700/50 h-fit sticky top-6">
      <CardContent className="p-4">
        <h2 className="font-bold mb-4 text-lg text-white flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-blue-400" /> Course Outline
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full border-none space-y-2"
          value={activeAccordion}
          onValueChange={setActiveAccordion}
        >
          {chapters.map((chapter, index) => (
            <AccordionItem
              key={chapter.id}
              value={`chapter-${chapter.id}`}
              className="border border-gray-700/50 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-600"
            >
              <AccordionTrigger value={`chapter-${chapter.id}`} className="hover:bg-gray-700/30 px-4 py-4 text-white">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-medium shrink-0">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <p className="text-xs text-gray-400">{chapter.lessons.length} lessons</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent
                value={`chapter-${chapter.id}`}
                className="bg-gray-900/30 border-t border-gray-700/50 p-0"
              >
                <ScrollArea className="h-[400px] rounded-b-lg" scrollHideDelay={100}>
                  <div className="space-y-0.5 py-1">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 hover:bg-gray-800/50 cursor-pointer transition-all duration-200 ${
                          selectedLesson?.id === lesson.id
                            ? "bg-gray-800/80 border-l-2 border-blue-500"
                            : "border-l-2 border-transparent"
                        }`}
                        onClick={() => handleLessonSelect(lesson, chapter)}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 flex items-center justify-center mr-3 text-xs text-gray-400">
                            {lessonIndex + 1}
                          </div>
                          {lesson.type === "VIDEO" ? (
                            <Video className="h-4 w-4 mr-3 text-blue-400 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 mr-3 text-green-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              selectedLesson?.id === lesson.id ? "text-white font-medium" : "text-gray-300"
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>
                        {lesson.completed && <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

