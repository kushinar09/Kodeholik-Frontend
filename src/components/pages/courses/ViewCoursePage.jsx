"use client"

import { Card } from "@/components/ui/card"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { getCourseSearch, getTopicList } from "@/lib/api/course_api"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { GLOBALS } from "@/lib/constants"
import HeaderSection from "@/components/common/shared/header"
import placeholder from "@/assets/images/placeholder_square.jpg"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpenCheck, BookText, Filter, Search, X } from "lucide-react"
import { StarFilledIcon } from "@radix-ui/react-icons"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/providers/AuthProvider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const ITEMS_PER_PAGE = 9

export default function CoursePage() {
  useEffect(() => {
    document.title = `CoursesPage - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [courses, setCourses] = useState([])
  const [topics, setTopics] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopics, setSelectedTopics] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [sortBy, setSortBy] = useState("title")
  const [ascending, setAscending] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const navigate = useNavigate()

  const { apiCall } = useAuth()
  const debounceTimeout = useRef(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedTopics])

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const data = await getCourseSearch({
          apiCall,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
          sortBy,
          ascending,
          query: searchQuery || undefined,
          topic: selectedTopics.length > 0 ? selectedTopics.join(",") : undefined
        })
        setCourses(data.content || [])
        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setCourses([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    // Clear previous debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    // Set new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      fetchCourses()
    }, 200)

    // Cleanup on unmount or dependencies change
    return () => clearTimeout(debounceTimeout.current)
  }, [currentPage, searchQuery, selectedTopics, sortBy, ascending])

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicList(apiCall)
        setTopics(data || [])
      } catch (error) {
        console.error("Error fetching topics:", error)
        setTopics([])
      }
    }
    fetchTopics()
  }, [])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleTopicChange = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
    setCurrentPage(1)
  }

  const toggleShowAllTopics = () => {
    setShowAllTopics(!showAllTopics)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedTopics([])
    setCurrentPage(1)
    setAscending(true)
  }

  const handleSortChange = (value) => {
    if (value.endsWith("-desc")) {
      setSortBy(value.replace("-desc", ""))
      setAscending(false)
    } else {
      setSortBy(value)
      setAscending(true)
    }
    setCurrentPage(1)
  }

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 5)

  // Filter component for both desktop and mobile
  const FiltersComponent = () => (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Filter by</h2>
        {(selectedTopics.length > 0 || searchQuery) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="text-sm bg-bg-card text-text-primary hover:text-text-primary border-none hover:bg-bg-card/90"
          >
            Clear all
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-3">Topics</h3>
        <div className="space-y-2">
          {displayedTopics.map((topic) => {
            const topicName = typeof topic === "string" ? topic : topic.name || ""
            const topicId = typeof topic === "string" ? topic : topic.id || topicName
            return (
              <div key={topicId} className="flex items-center">
                <Checkbox
                  id={`topic-${topicId}`}
                  checked={selectedTopics.includes(topicName)}
                  onCheckedChange={() => handleTopicChange(topicName)}
                  className="mr-2 text-bg-card"
                />
                <label
                  htmlFor={`topic-${topicId}`}
                  className="text-sm flex justify-between w-full cursor-pointer"
                >
                  <span>{topicName}</span>
                </label>
              </div>
            )
          })}
        </div>
        {topics.length > 5 && (
          <button
            onClick={toggleShowAllTopics}
            className="text-sm text-primary mt-2 hover:underline"
          >
            {showAllTopics ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <HeaderSection currentActive="courses" />
      <div className="flex-grow px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 py-8 text-text-primary">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar for desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <FiltersComponent />
          </div>

          {/* Mobile filter button */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Courses</h2>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-bg-card text-primary hover:text-primary border-none hover:bg-bg-card/90">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-bg-primary border-r-gray-700">
                <div className="py-6 text-text-primary">
                  <FiltersComponent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold">
                {searchQuery ? `Results for "${searchQuery}"` : "All Courses"}
              </h2>
              <Select
                onValueChange={handleSortChange}
                defaultValue="title"
              >
                <SelectTrigger className="w-full sm:w-[220px] bg-white text-black border-none">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border-none">
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="numberOfParticipant">Participants (Low to High)</SelectItem>
                  <SelectItem value="numberOfParticipant-desc">Participants (High to Low)</SelectItem>
                  <SelectItem value="createdAt">Date (Old to New)</SelectItem>
                  <SelectItem value="createdAt-desc">Date (New to Old)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  className="p-2 pl-10 w-full focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTopics.map((topic) => (
                  <div key={topic} className="bg-bg-card text-primary px-3 py-1 rounded-md text-sm flex items-center text-center">
                    {topic}
                    <button
                      onClick={() => handleTopicChange(topic)}
                      className="ml-2 text-muted-foreground hover:text-primary"
                      aria-label={`Remove ${topic} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-muted-foreground mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn&apos;t find any courses matching your search criteria. Try adjusting your filters or search term.
                </p>
                <Button className="mt-4 text-bg-card" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden text-text-primary flex flex-col cursor-pointer hover:shadow-lg hover:scale-105 transition-all bg-bg-card border-none"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <div className="relative">
                      <img loading="lazy"
                        src={course.image || placeholder}
                        alt={course.title}
                        className="w-full aspect-[5/3] object-cover"
                      />
                      {course.numberOfParticipant > 0 && (
                        <div className="absolute top-2 right-2 bg-bg-primary text-primary font-semibold px-2 py-0.5 text-xs sm:text-sm rounded">
                          {course.numberOfParticipant} Students
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 gap-2 sm:gap-3">
                      <div className="flex gap-2">
                        <Avatar className="cursor-pointer size-6 border-2 border-primary hover:border-primary/80 transition-colors">
                          <AvatarImage src={course.createdBy?.avatar || "/placeholder.svg"} alt={course.createdBy?.fullname || "User"} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-bg-card font-semibold">
                            {course.createdBy?.username ? course.createdBy?.username
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs sm:text-sm">{course.createdBy?.username}</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base line-clamp-2">{course.title}</h3>
                      {course.topics && course.topics.length > 0 && (
                        <p className="text-xs sm:text-sm line-clamp-2">
                          <span className="font-semibold">Topics: </span>
                          {course.topics.join(", ")}
                        </p>
                      )}
                      <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex gap-1 sm:gap-2 items-center">
                          <BookText className="size-3 sm:size-4" />
                          {course.noChapter} Chapters
                        </div>
                        <div className="flex gap-1 sm:gap-2 items-center">
                          <BookOpenCheck className="size-3 sm:size-4" />
                          {course.noLesson} Lessons
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center text-xs sm:text-sm gap-2">
                          <div className="flex items-center text-amber-500">
                            <span className="mr-1 font-semibold">{course.rate}</span>
                            <StarFilledIcon className="size-3 sm:size-4" />
                          </div>
                          -
                          <span>{course.noVote} Reviews</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center mt-10 mb-6 gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-md px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm hover:bg-bg-card/70 hover:text-text-primary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Prev</span>
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                    let pageToShow
                    if (totalPages <= 5) {
                      pageToShow = index + 1
                    } else if (currentPage <= 3) {
                      pageToShow = index + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + index
                    } else {
                      pageToShow = currentPage - 2 + index
                    }

                    return (
                      <Button
                        key={pageToShow}
                        onClick={() => handlePageChange(pageToShow)}
                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-md text-xs sm:text-sm ${currentPage === pageToShow ? "bg-bg-card text-primary hover:bg-bg-card hover:text-primary" : "bg-transparent text-text-primary hover:bg-bg-card/70"}`}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="flex items-center px-2">...</span>
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(totalPages)}
                        className="min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-md text-xs sm:text-sm"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-md px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm hover:bg-bg-card/70 hover:text-text-primary"
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  )
}
