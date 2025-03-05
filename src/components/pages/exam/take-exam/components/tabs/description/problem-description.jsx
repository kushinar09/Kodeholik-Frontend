"use client"

import { Separator } from "@/components/ui/separator"
import { marked } from "marked"

/**
 * Component to display problem description
 * @param {Object} props - Component props
 * @param {Object} props.description - Problem description data
 */
export default function ProblemDescription({ description }) {
  if (!description) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading problem description...</div>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-xl font-bold mb-4">
        {description.id}. {description.title}
      </h2>
      <div>
        <div
          className="markdown prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: marked(description.description) }}
        />
      </div>
    </>
  )
}

