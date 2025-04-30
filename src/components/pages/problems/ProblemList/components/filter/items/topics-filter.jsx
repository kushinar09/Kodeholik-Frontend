"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function TopicsFilter({ topics, selectedTopics, toggleTopic, removeAllTopic }) {
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const containerRef = useRef(null)

  // Check if the topics container is overflowing
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        setIsOverflowing(containerRef.current.scrollWidth > containerRef.current.clientWidth)
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    return () => window.removeEventListener("resize", checkOverflow)
  }, [topics])

  return (
    <div className="space-y-4 relative">
      <h4 className="text-sm font-medium text-gray-400">Topics</h4>

      {/* Wrapper for topics */}
      <div className="relative w-full mb-2">
        <div
          className={`flex w-full items-start gap-2 ${showAllTopics ? "flex-wrap" : "flex-nowrap overflow-x-auto pb-2"}`}
          ref={containerRef}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none"
          }}
        >

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
              size="sm"
            >
              {topic}
            </Button>
          ))}
        </div>

        {/* Gradient overlay and expand button - only show if content is overflowing and not expanded */}
        {!showAllTopics && isOverflowing && (
          <div
            className="absolute right-0 top-0 flex items-center justify-end h-full
            bg-gradient-to-r from-transparent to-bg-card pl-12 pr-2"
          >
            <div
              className="cursor-pointer transition-transform text-primary"
              onClick={() => setShowAllTopics(!showAllTopics)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="currentColor"
                className="inline-block h-4 w-4 shrink-0 fill-none stroke-current text-current transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8l-8 8-8-8"></path>
              </svg>
            </div>
          </div>
        )}

        {/* Show collapse button when expanded */}
        {showAllTopics && (
          <div className="mt-2 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAllTopics(false)} className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
                fill="currentColor"
                className="inline-block h-4 w-4 shrink-0 fill-none stroke-current text-current transition-transform rotate-180 mr-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8l-8 8-8-8"></path>
              </svg>
              Collapse
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
