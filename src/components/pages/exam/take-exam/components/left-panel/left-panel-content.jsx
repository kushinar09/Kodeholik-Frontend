"use client"

import { cn } from "@/lib/utils"
import ProblemDescription from "../tabs/description/problem-description"

export default function LeftPanelContent({ isCompact, title, description }) {
  return (
    <div className={cn("p-4 overflow-auto no-scrollbar flex-1 max-h-[calc(100vh-104px)] ", isCompact ? "hidden" : "")}>
      <div className="prose dark:prose-invert min-w-[420px]">
        <ProblemDescription title={title} description={description} />
      </div>
    </div>
  )
}

