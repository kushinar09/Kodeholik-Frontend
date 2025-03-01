"use client"

import { useAuth } from "@/context/AuthProvider"
import SolutionCard from "../../items/solution-card"

/**
 * Component to display problem solutions
 * @param {Object} props - Component props
 * @param {Object} props.solutions - Solutions data
 */
export default function ProblemSolutions({ solutions }) {

  function handleClickSolution(id) {
    //TODO: handle show UI of the solution with id
    window.location.href = `/solutions/${id}`
  }

  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="text-gray-500 flex items-center gap-2 justify-center mt-10">
        <svg
          className="h-8 w-8"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <circle cx="12" cy="16" r="1" />
          <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
        </svg>
        Please login to view this content
      </div>
    )
  }

  return (

    <>
      {solutions
        ?
        <>
          <h2 className="text-xl font-bold mb-4">Solutions: {solutions.content.length}</h2>
          <div className="flex flex-col gap-4 overflow-y-auto whitespace-nowrap">
            {solutions.content.map((solution, index) => (
              <SolutionCard
                key={index}
                infor={solution}
                handleClickSolution={handleClickSolution}
              />
            ))}
          </div>
        </>
        : <div className="text-gray-500">Solution not found</div>
      }
    </>
  )
}

