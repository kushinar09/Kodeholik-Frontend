"use client"

import { Separator } from "@/components/ui/separator"
import DiscussionSection from "./problem-comments"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"

export default function ProblemDescription({ description, id, problemId }) {
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
        <RenderMarkdown content={description.description} />
      </div>
      <Separator className="my-4" />
      <DiscussionSection id={id} problemId={problemId} />
    </>
  )
}

