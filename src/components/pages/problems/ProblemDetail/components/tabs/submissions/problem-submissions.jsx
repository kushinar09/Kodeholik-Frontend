"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/providers/AuthProvider"
import { format } from "date-fns"
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import { useState } from "react"

const SubmissionStatus = {
  ACCEPTED: "ACCEPTED",
  WRONG_ANSWER: "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED: "MEMORY_LIMIT_EXCEEDED",
  RUNTIME_ERROR: "RUNTIME_ERROR",
  COMPILATION_ERROR: "COMPILATION_ERROR",
  PENDING: "PENDING"
}

export default function ProblemSubmissions({ submissionsData, selectedSubmissionId, setSelectedSubmissionId}) {

  const { isAuthenticated } = useAuth()

  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")
  const [submissions, setSubmissions] = useState(submissionsData)

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"

    setSortField(field)
    setSortDirection(newDirection)

    const sortedSubmissions = [...submissions].sort((a, b) => {
      if (newDirection === "asc") {
        return a[field] > b[field] ? 1 : -1
      } else {
        return a[field] < b[field] ? 1 : -1
      }
    })

    setSubmissions(sortedSubmissions)
  }

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null

    return sortDirection === "asc" ? (
      <ArrowDownAZ className="ml-1 h-4 w-4 inline" />
    ) : (
      <ArrowUpAZ className="ml-1 h-4 w-4 inline" />
    )
  }

  const getTextColorClass = (status) => {
    return status === "SUCCESS" ? "text-green-600" : "text-red-600"
  }

  // Helper function to format status for display
  const formatStatus = (status) => {
    return status.replace(/_/g, " ")
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center">
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
        <Button className="mt-2 w-fit" variant="outline" onClick={() => window.location.href = "/login"}>
          Sign In
        </Button>
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
            <Card className="w-full">
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                          Status {renderSortIndicator("status")}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("languageName")}>
                          Language {renderSortIndicator("languageName")}
                        </TableHead>
                        <TableHead>Runtime</TableHead>
                        <TableHead>Memory</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                          Submitted {renderSortIndicator("createdAt")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission, index) => (
                        <TableRow className={`cursor-pointer ${selectedSubmissionId == submission.id ? 'bg-gray-300 hover:bg-gray-300': ''}`} onClick={() => setSelectedSubmissionId(submission.id)} key={submission.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className={getTextColorClass(submission.status)}>
                            {formatStatus(submission.status)}
                          </TableCell>
                          <TableCell>{submission.languageName}</TableCell>
                          <TableCell>
                            {submission.executionTime > 0 ? `${submission.executionTime.toFixed(1)} ms` : "-"}
                          </TableCell>
                          <TableCell>{submission.memoryUsage > 0 ? `${submission.memoryUsage.toFixed(1)} MB` : "-"}</TableCell>
                          <TableCell>
                            {submission.createdAt && !isNaN(new Date(submission.createdAt).getTime())
                              ? format(new Date(submission.createdAt), "MMM d, yyyy HH:mm")
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-muted-foreground">No submissions yet</div>
          )}
        </>
        : <div className="text-gray-500">No submissions yet</div>
      }
    </>
  )
}

