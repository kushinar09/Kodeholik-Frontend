"use client"

/**
 * Component to display user submissions
 * @param {Object} props - Component props
 * @param {Array} props.submissions - User submissions data
 */
export default function ProblemSubmissions({ submissions }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Submissions</h2>
      {submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {/* Submissions list would go here */}
          <p>Submissions content</p>
        </div>
      ) : (
        <div className="text-muted-foreground">No submissions yet</div>
      )}
    </div>
  )
}

