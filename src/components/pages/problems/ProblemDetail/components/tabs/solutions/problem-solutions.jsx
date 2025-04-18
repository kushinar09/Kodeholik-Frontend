"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { Search, Filter, Check } from "lucide-react"
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
import { ENDPOINTS } from "@/lib/constants"

const sortValue = {
  VOTE: {
    label: "Most Votes",
    value: "VOTE",
    ascending: false
  },
  DATA: {
    label: "Most Recent",
    value: "DATE",
    ascending: false
  },
  COMMENT: {
    label: "Hot",
    value: "COMMENT",
    ascending: false
  }
}

export default function ProblemSolutions({
  solutions,
  setSolutions,
  showSolution = false,
  setShowSolution,
  currentSolutionId = 0,
  setCurrentSolutionId,
  setIsEditMode,
  setCurrentSolution,
  onchangeFilter = null,
  isLoadingSolutions
}) {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState([])
  const [sortBy, setSortBy] = useState("")
  const [asc, setAsc] = useState(false)
  const [page, setPage] = useState(0)
  const [skills, setSkills] = useState([])
  const sizePage = 10
  const [showAllTopics, setShowAllTopics] = useState(false)
  const containerRef = useRef(null)

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

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_SKILLS_PROBLEM)
        const data = await response.json()
        setSkills(data)
      } catch (error) {
        console.error("Error fetching skills:", error)
      }
    }

    fetchSkills()
  }, [])

  useEffect(() => {
    setPage(0)
  }, [searchQuery, selectedTopics])

  // Apply filters and sorting to solutions
  useEffect(() => {
    const param = {
      page: page,
      size: sizePage,
      title: searchQuery,
      languageName: "",
      sortBy: sortBy,
      ascending: asc,
      topics: selectedTopics
    }
    onchangeFilter(param)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, selectedTopics, sortBy, asc])

  function handleClickSolution(id) {
    setCurrentSolutionId(id)
    setShowSolution(true)
  }

  function handleBackClick() {
    setCurrentSolutionId(0)
    setShowSolution(false)
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
        <Button className="mt-2 w-fit" variant="outline" onClick={() => (window.location.href = "/login")}>
          Sign In
        </Button>
      </div>
    )
  }

  return !showSolution ? (
    <div className="flex flex-col space-y-4">
      {/* Search and Filter Header - Always visible */}
      <div className="flex flex-col space-y-4">
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
              {Object.values(sortValue).map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setAsc(option.ascending)
                    setSortBy(option.value)
                  }}
                >
                  <div className="flex items-center w-full">
                    <span className={`flex-1 ${sortBy === option.value ? "font-medium" : ""}`}>{option.label}</span>
                    <div className="w-8 flex justify-end">
                      {sortBy === option.value && <Check className="h-4 w-4" />}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Topics - Always visible */}
        <div className="space-y-4 relative">
          {/* Wrapper for topics */}
          <div className="relative w-full mb-2">
            <div
              className={`flex w-full items-start gap-2 pr-6 ${showAllTopics ? "flex-wrap" : "flex-nowrap overflow-hidden"}`}
              ref={containerRef}
            >
              <Button
                onClick={selectedTopics.length !== 0 ? removeAllTopic : undefined}
                className={`border-2 border-solid whitespace-nowrap transition-all ${selectedTopics.length > 0 ? "bg-transparent" : "bg-primary text-primary-foreground"}`}
              >
                All
              </Button>
              {skills.map((topic) => (
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
      </div>

      {/* Solutions List - Show skeleton when loading */}
      {isLoadingSolutions ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
              <div className="flex gap-2">
                {[1, 2].map((j) => (
                  <div key={j} className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}

          {/* Pagination Skeleton */}
          <div className="flex justify-center mt-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 animate-pulse rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {solutions && solutions.content ? (
            <>
              {solutions.content.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {solutions.content.map((solution, index) => (
                    <SolutionCard
                      key={index}
                      infor={solution}
                      solutions={solutions}
                      setSolutions={setSolutions}
                      handleClickSolution={handleClickSolution}
                      setIsEditMode={setIsEditMode}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 p-8 text-center border border-gray-200 rounded-lg">
                  No solutions match your filters
                </div>
              )}

              {/* Pagination using shadcn/ui components */}
              {solutions.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                      />
                    </PaginationItem>
                    {Array.from({ length: solutions.totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink href="#" isActive={page === index} onClick={() => setPage(index)}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={() => setPage((prev) => Math.min(prev + 1, solutions.totalPages - 1))}
                        disabled={page === solutions.totalPages - 1}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-gray-500 p-8 text-center border border-gray-200 rounded-lg">Solutions not found</div>
          )}
        </>
      )}
    </div>
  ) : (
    <SolutionDetail
      solutionId={currentSolutionId}
      handleBack={handleBackClick}
      setIsEditMode={setIsEditMode}
      setCurrentSolution={setCurrentSolution}
    />
  )
}

