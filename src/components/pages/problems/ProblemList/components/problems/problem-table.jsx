import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProblemTable({
  problems,
  currentPage,
  totalPages,
  sortConfig,
  handleSort,
  handleProblemDetail,
  setCurrentPage
}) {
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null
    }
    return sortConfig.ascending === true ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" />
    )
  }

  return (
    <div className="bg-bg-card rounded-lg p-4">
      <table className="w-full">
        <thead>
          <tr className="text-primary-text text-sm">
            <th className="text-left py-2">#</th>
            <th
              className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSort("titleSearchAndSort")}
            >
              Title {getSortIcon("titleSearchAndSort")}
            </th>
            <th
              className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSort("acceptanceRate")}
            >
              Acceptance {getSortIcon("acceptanceRate")}
            </th>
            <th
              className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSort("difficulty")}
            >
              Difficulty {getSortIcon("difficulty")}
            </th>
            <th
              className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => handleSort("noSubmission")}
            >
              Participant {getSortIcon("noSubmission")}
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(problems) && problems.length > 0 ? (
            problems.map((problem) => (
              <tr
                key={problem.id}
                onClick={() => handleProblemDetail(problem.link)}
                className="text-white cursor-pointer hover:bg-gray-800 gap-10"
              >
                <td className="py-2" title="Solved">
                  {problem.solved && <Check className="w-5 h-5 text-green-500" />}
                </td>
                <td
                  className="py-2 pe-4 max-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={problem.title}
                >
                  {problem.title}
                </td>
                <td className="py-2">{problem.acceptanceRate}%</td>
                <td
                  className={`py-2 ${problem.difficulty === "EASY"
                    ? "text-text-difficultEasy"
                    : problem.difficulty === "MEDIUM"
                      ? "text-text-difficultMedium"
                      : "text-text-difficultHard"
                  }`}
                >
                  {problem.difficulty}
                </td>
                <td className="py-2">{problem.noSubmission}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-400">
                No problems found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {Array.isArray(problems) && problems.length > 0 && (
        <div className="flex items-center justify-between px-2 py-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

