"use client"

import { cn } from "@/lib/utils"
import ProblemDescription from "../tabs/description/problem-description"
import ProblemEditorial from "../tabs/editorial/problem-editorial"
import ProblemSolutions from "../tabs/solutions/problem-solutions"
import ProblemSubmissions from "../tabs/submissions/problem-submissions"


/**
 * Content container for the left panel
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {boolean} props.isCompact - Whether the panel is in compact mode
 * @param {Object} props.description - Problem description data
 * @param {Object} props.editorial - Editorial data
 * @param {Object} props.solutions - Solutions data
 * @param {Array} props.submissions - Submissions data
 */
export default function LeftPanelContent({ id, problemId, activeTab, isCompact, description, editorial, solutions, submissions }) {
  return (
    <div className={cn("p-4 overflow-auto no-scrollbar flex-1 max-h-[calc(100vh-104px)] ", isCompact ? "hidden" : "")}>
      <div className="prose dark:prose-invert min-w-[420px]">
        {activeTab === "description" && <ProblemDescription description={description} id={id} problemId={problemId} />}
        {activeTab === "editorial" && <ProblemEditorial editorial={editorial} />}
        {activeTab === "solutions" && <ProblemSolutions solutions={solutions} />}
        {activeTab === "submissions" && <ProblemSubmissions submissions={submissions} />}
      </div>
    </div>
  )
}

