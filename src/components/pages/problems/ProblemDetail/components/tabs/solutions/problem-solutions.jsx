"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Search, Filter, ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Import the Pagination components
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import SolutionCard from "./items/solution-card"
import SolutionDetail from "./items/solution-detail"

export default function ProblemSolutions({
  solutions,
  showSolution = false,
  setShowSolution,
  currentSolutionId = 0,
  setCurrentSolutionId,
  onchangeFilter = null,
  currentPage = 1,
  totalPages = 5,
  topic = []
}) {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState([])
  const [sortBy, setSortBy] = useState("MOST VOTE")
  const [page, setPage] = useState(currentPage)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const containerRef = useRef(null)

  const topics = [
    "My Solution",
    "Java",
    "C++",
    "Python3",
    "Array",
    "Hash Table",
    "Two Pointers",
    "Math",
    "Sorting",
    "Ordered Map",
    "Binary Search",
    "Hash Function",
    "Iterator",
    "Recursion"
  ]

  const sortList = [
    {
      label: "Most Votes",
      value: "VOTE"
    },
    {
      label: "Most Recent",
      value: "DATA"
    },
    {
      label: "Hot",
      value: "COMMENT"
    }
  ]

  // Toggle topic selection
  function toggleTopic(topic) {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic)
      } else {
        return [...prev, topic]
      }
    })
  }

  // Remove all selected topics
  function removeAllTopic() {
    setSelectedTopics([])
  }

  // Apply filters and sorting to solutions
  // useEffect(() => {
  //   onchangeFilter(solutions, searchQuery, selectedTopics, sortBy)
  //   setPage(0)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [solutions, searchQuery, selectedTopics, sortBy])

  function handleClickSolution(id) {
    setCurrentSolutionId(id)
    setShowSolution(true)
  }

  function handleBackClick() {
    setCurrentSolutionId(0)
    setShowSolution(false)
  }

  if (isAuthenticated) {
    return (
      <div className="text-gray-500 flex flex-col items-center gap-2 justify-center mt-10 p-8 border border-gray-200 rounded-lg shadow-sm">
        <svg
          className="h-12 w-12 text-gray-400"
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
        <p className="text-lg font-medium">Please login to view this content</p>
        <Button className="mt-2" variant="outline">
          Sign In
        </Button>
      </div>
    )
  }

  return (
    !showSolution
      ?
      <div className="flex flex-col space-y-4">
        {/* Search and Filter Header */}
        < div className="flex flex-col space-y-4" >
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortList.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                    <div className="flex items-center w-full">
                      {/* Ensure text has a fixed width so check icon stays aligned */}
                      <span className={`flex-1 ${sortBy === option.value ? "font-medium" : ""}`}>
                        {option.label}
                      </span>
                      {/* Always keep the check icon aligned to the right */}
                      <div className="w-8 flex justify-end">
                        {sortBy === option.value && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Topics */}
          <div className="space-y-4 relative">
            {/* Wrapper for topics */}
            <div className="relative w-full mb-2">
              <div
                className={`flex w-full items-start gap-2 pr-6 ${showAllTopics ? "flex-wrap" : "flex-nowrap overflow-hidden"}`}
                ref={containerRef}
              >
                <Button
                  onClick={removeAllTopic}
                  className={`border-2 border-solid whitespace-nowrap transition-all ${selectedTopics.length > 0 ? "bg-transparent" : "bg-primary text-primary-foreground"}`}
                >
                  All
                </Button>
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`border-2 border-solid whitespace-nowrap transition-all ${selectedTopics.includes(topic) ? "bg-primary text-primary-foreground" : "bg-transparent"}`}
                  >
                    {topic}
                  </Button>
                ))}

                <div
                  className="absolute right-0 top-0 flex items-start justify-end h-full
                w-[80px] bg-gradient-to-r from-transparent to-white"
                >
                  <div
                    className="mt-[3px] cursor-pointer transition-transform text-gray-800"
                    onClick={() => setShowAllTopics(!showAllTopics)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      className={`inline-block h-4 w-4 shrink-0 fill-none stroke-current text-current transition-transform ${showAllTopics ? "rotate-180" : ""}`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8l-8 8-8-8"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >

        {/* Solutions List */}
        {
          solutions && solutions.content ? (
            <>
              {solutions.content.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {solutions.content.map((solution, index) => (
                    <SolutionCard key={index} infor={solution} handleClickSolution={handleClickSolution} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-8 text-center border border-gray-200 rounded-lg">
                  No solutions match your filters
                </div>
              )}

              {/* Pagination using shadcn/ui components */}
              {totalPages > 2 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink href="#" isActive={page === index} onClick={() => setPage(index)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                        disabled={page === totalPages - 1}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-gray-500 p-8 text-center border border-gray-200 rounded-lg">
              Solutions not found
            </div>
          )
        }
      </div >
      : <SolutionDetail solutionId={currentSolutionId} handleBack={handleBackClick} />
  )
}

