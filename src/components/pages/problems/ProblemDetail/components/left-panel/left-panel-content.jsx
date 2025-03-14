"use client"

import { cn } from "@/lib/utils"
import ProblemDescription from "../tabs/description/problem-description"
import ProblemEditorial from "../tabs/editorial/problem-editorial"
import ProblemSolutions from "../tabs/solutions/problem-solutions"
import ProblemSubmissions from "../tabs/submissions/problem-submissions"
import { leftTabEnum } from "../../data/data"
import { useState } from "react"


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
export default function LeftPanelContent({
  id,
  problemId,
  activeTab,
  isCompact,
  description,
  setDescription,
  editorial,
  solutions,
  onchangeFilterSolutions,
  submissions,
  selectedSubmissionId,
  setSelectedSubmissionId
}) {

  const [showSolution, setShowSolution] = useState(false)
  const [currentSolutionId, setCurrentSolutionId] = useState(0)

  return (
    <div className={cn("p-4 overflow-auto no-scrollbar flex-1 max-h-[calc(100vh-104px)] ", isCompact ? "hidden" : "")}>
      <div className="prose dark:prose-invert min-w-[420px]">
        {activeTab === leftTabEnum.description && <ProblemDescription description={description} setDescription={setDescription} id={id} problemId={problemId} />}
        {activeTab === leftTabEnum.editorial && <ProblemEditorial editorial={editorial} />}
        {activeTab === leftTabEnum.solutions &&
          <ProblemSolutions
            solutions={solutions}
            showSolution={showSolution}
            setShowSolution={setShowSolution}
            currentSolutionId={currentSolutionId}
            setCurrentSolutionId={setCurrentSolutionId}
            onchangeFilter={onchangeFilterSolutions}
          />
        }
        {activeTab === leftTabEnum.submissions && <ProblemSubmissions submissionsData={submissions} selectedSubmissionId={selectedSubmissionId} setSelectedSubmissionId={setSelectedSubmissionId}/>}
      </div>
    </div>
  )
}

