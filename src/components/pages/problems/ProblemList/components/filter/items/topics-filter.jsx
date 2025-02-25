"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

export function TopicsFilter({ topics, selectedTopics, toggleTopic, removeAllTopic }) {
  const [showAllTopics, setShowAllTopics] = useState(false)
  const containerRef = useRef(null)

  return (
    <div className="space-y-4 relative">
      <h4 className="text-sm font-medium text-gray-400">Topics</h4>

      {/* Hiển thị danh sách đã chọn */}
      {/* {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedTopics.map((topic) => (
            <Badge key={topic} className="bg-primary hover:bg-primary text-black hover:text-black transition-colors">
              {topic}
              <button onClick={() => removeTopic(topic)} className="ml-2">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )} */}

      {/* Wrapper chứa danh sách topics */}
      <div className="relative w-full mb-2">
        <div className={`flex w-full items-start gap-2 pr-6 ${showAllTopics ? "flex-wrap" : "flex-nowrap overflow-hidden"}`} ref={containerRef}>
          <Button
            variant={selectedTopics.length > 0 ? "outline" : "default"}
            onClick={removeAllTopic}
            className={`border-none whitespace-nowrap transition-all ${selectedTopics.length > 0 ? "" : "bg-primary text-primary-foreground"}`}
          >
            All
          </Button>
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopics.includes(topic) ? "default" : "outline"}
              onClick={() => toggleTopic(topic)}
              className={`border-none whitespace-nowrap transition-all ${selectedTopics.includes(topic) ? "bg-primary text-primary-foreground" : ""}`}
            >
              {topic}
            </Button>
          ))}

          <div className="absolute right-0 top-0 flex items-start justify-end h-full
            w-[80px] bg-gradient-to-r from-transparent to-bg-card"
          >
            <div className="mt-[3px] cursor-pointer transition-transform text-primary" onClick={() => setShowAllTopics(!showAllTopics)}>
              <svg xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24" width="1em" height="1em"
                fill="currentColor"
                className={`inline-block h-4 w-4 shrink-0 fill-none stroke-current text-current transition-transform ${showAllTopics ? "rotate-180" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8l-8 8-8-8"></path>
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Hiệu ứng làm mờ nếu có nội dung bị ẩn */}
      {/* {!showAllTopics && isOverflowing && (
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white dark:from-black via-transparent pointer-events-none"></div>
      )} */}
    </div>
  )
}
