"use client"

import { cn } from "@/lib/utils"
import ProblemDescription from "../tabs/description/problem-description"
import ProblemEditorial from "../tabs/editorial/problem-editorial"
import ProblemSolutions from "../tabs/solutions/problem-solutions"
import ProblemSubmissions from "../tabs/submissions/problem-submissions"
import { leftTabEnum } from "../../data/data"

export default function LeftPanelContent({
  id,
  problemId,
  activeTab,
  setActiveTab,
  isCompact,
  description,
  setDescription,
  editorial,
  solutions,
  setSolutions,
  onchangeFilterSolutions,
  submissions,
  selectedSubmissionId,
  setSelectedSubmissionId,
  showSolution,
  setShowSolution,
  currentSolutionId,
  setCurrentSolutionId,
  setIsEditMode,
  setCurrentSolution,
  isLoadingDescription,
  isLoadingEditorial,
  isLoadingSolutions,
  isLoadingSubmission
}) {
  return (
    <div className={cn("p-4 overflow-auto no-scrollbar flex-1 max-h-[calc(100vh-104px)] ", isCompact ? "hidden" : "")}>
      <div className="prose dark:prose-invert min-w-[420px]">
        {activeTab === leftTabEnum.description &&
          <ProblemDescription
            description={description}
            setDescription={setDescription}
            id={id}
            problemId={problemId}
            isLoadingDescription={isLoadingDescription}
          />}
        {activeTab === leftTabEnum.editorial &&
          <ProblemEditorial
            editorial={editorial}
            isLoadingEditorial={isLoadingEditorial}
          />}
        {activeTab === leftTabEnum.solutions &&
          <ProblemSolutions
            solutions={solutions}
            setSolutions={setSolutions}
            showSolution={showSolution}
            setShowSolution={setShowSolution}
            currentSolutionId={currentSolutionId}
            setCurrentSolutionId={setCurrentSolutionId}
            onchangeFilter={onchangeFilterSolutions}
            setIsEditMode={setIsEditMode}
            setCurrentSolution={setCurrentSolution}
            isLoadingSolutions={isLoadingSolutions}
          />
        }
        {activeTab === leftTabEnum.submissions &&
          <ProblemSubmissions
            submissionsData={submissions}
            selectedSubmissionId={selectedSubmissionId}
            setSelectedSubmissionId={setSelectedSubmissionId}
            isLoadingSubmission={isLoadingSubmission}
          />}
      </div>
    </div>
  )
}

