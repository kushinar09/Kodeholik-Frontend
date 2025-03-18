"use client"

import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"

export default function ProblemDescription({ title, description }) {
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
        {title}
      </h2>
      <div>
        <RenderMarkdown content={description} />
      </div>
    </>
  )
}

