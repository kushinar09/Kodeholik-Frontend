"use client"

import { useAuth } from "@/provider/AuthProvider"

/**
 * Component to display user submissions
 * @param {Object} props - Component props
 * @param {Array} props.submissions - User submissions data
 */
export default function ProblemSubmissions({ submissions }) {

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
      {submissions
        ?
        <>
          <h2 className="text-xl font-bold mb-4">Your Submissions</h2>
          {submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              <p>Submissions content</p>
            </div>
          ) : (
            <div className="text-muted-foreground">No submissions yet</div>
          )}
        </>
        : <div className="text-gray-500">No submissions yet</div>
      }
    </>
  )
}

