"use client"

import { Card } from "@/components/ui/card"
import Header from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getCourseSearch, getTopicList, getImage } from "@/lib/api/course_api"
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { GLOBALS } from "@/lib/constants"
import debounce from "lodash/debounce" // Add lodash for debouncing

// Sync with desired page size
const ITEMS_PER_PAGE = 8

export default function CoursePage() {
  useEffect(() => {
    document.title = `CoursesPage - ${GLOBALS.APPLICATION_NAME}`
  }, [])

  const [courses, setCourses] = useState([])
  const [topics, setTopics] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("") // Debounced search query
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [courseImages, setCourseImages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Debounce the search query updates
  const updateDebouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value)
      setCurrentPage(1) // Reset to first page when search query changes
    }, 300),
    []
  )

  // Update debounced search whenever searchQuery changes
  useEffect(() => {
    updateDebouncedSearch(searchQuery)
    return () => updateDebouncedSearch.cancel() // Cleanup on unmount
  }, [searchQuery, updateDebouncedSearch])

  // Fetch courses based on currentPage, debouncedSearchQuery, and selectedTopic
  useEffect(() => {
    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const data = await getCourseSearch({
                page: currentPage - 1,
                size: ITEMS_PER_PAGE,
                sortBy: "numberOfParticipant",
                ascending: true,
                query: debouncedSearchQuery || undefined,
                topic: selectedTopic === "All" ? undefined : selectedTopic,
            });
            // Filter by title manually if backend doesn't support it
            const filteredCourses = debouncedSearchQuery
                ? (data.content || []).filter(course =>
                      course.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                  )
                : data.content || [];
            setCourses(filteredCourses);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching courses:", error);
            setCourses([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    };
    fetchCourses();
}, [currentPage, debouncedSearchQuery, selectedTopic]);

  // Fetch course images whenever courses change
  useEffect(() => {
    const fetchImages = async () => {
      const imagesMap = {}
      for (const course of courses) {
        try {
          const imageUrl = await getImage(course.image)
          imagesMap[course.id] = imageUrl
        } catch (error) {
          console.error(`Error fetching image for course ${course.id}:`, error)
          imagesMap[course.id] = "/default-image.jpg" // Fallback image
        }
      }
      setCourseImages(imagesMap)
    }

    if (courses.length > 0) fetchImages()
  }, [courses])

  // Fetch topics on mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicList()
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
    }
  }

  const handleFilterClick = () => {
    setIsFilterExpanded(!isFilterExpanded)
  }

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic === "All" ? "All" : topic)
    setCurrentPage(1) // Reset to first page when filter changes
    setIsFilterExpanded(false)
  }

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchQuery("")
    setDebouncedSearchQuery("")
    setSelectedTopic("All")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Explore Courses</h1>
          <p className="text-text-secondary">Discover and enroll in our wide range of courses</p>
        </div>

        <div className="mb-8 bg-bg-card rounded-lg p-4 shadow-md border border-border-muted">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder="Search courses..."
                className="p-2 pl-10 w-full bg-input-bg text-input-text placeholder-input-placeholder border-input-border focus:border-input-borderFocus focus:ring-input-focusRing rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-input-placeholder"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button
              variant="ghost"
              onClick={handleFilterClick}
              className={cn(
                "text-primary font-medium hover:bg-primary transition hover:text-black px-4 min-w-[120px]",
                isFilterExpanded && "bg-button-primary text-bg-primary hover:bg-button-hover",
              )}
            >
              Filter by Topic
              <span className="ml-2 text-sm">{isFilterExpanded ? "▲" : "▼"}</span>
            </Button>
            {(searchQuery || selectedTopic !== "All") && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="text-primary border border-primary hover:bg-primary hover:text-black px-4"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {isFilterExpanded && (
            <div className="mt-4 flex gap-2 flex-wrap bg-bg-card border border-border-muted rounded-lg p-4 shadow-sm">
              <Button
                variant="ghost"
                onClick={() => handleTopicClick("All")}
                className={cn(
                  "text-primary font-medium hover:bg-primary transition hover:text-black rounded-full px-4 py-2 text-sm",
                  selectedTopic === "All" && "bg-button-primary text-bg-primary hover:bg-button-hover",
                )}
              >
                All Topics
              </Button>
              {topics.map((topic) => (
                <Button
                  key={topic.id || topic}
                  variant="ghost"
                  onClick={() => handleTopicClick(topic.name || topic)}
                  className={cn(
                    "text-primary font-medium hover:bg-primary transition hover:text-black rounded-full px-4 py-2 text-sm",
                    selectedTopic === (topic.name || topic) &&
                      "bg-button-primary text-bg-primary hover:bg-button-hover",
                  )}
                >
                  {topic.name || topic}
                </Button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {!isLoading && courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-text-secondary mb-4"
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
            <h3 className="text-xl font-semibold text-text-primary mb-2">No courses found</h3>
            <p className="text-text-secondary max-w-md">
              We couldn't find any courses matching your search criteria. Try adjusting your filters or search term.
            </p>
            <Button
              className="mt-4 bg-button-primary text-bg-primary hover:bg-button-hover"
              onClick={handleClearFilters}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="p-4 bg-bg-card rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 border border-border-muted overflow-hidden flex flex-col"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="relative h-48 overflow-hidden rounded-md mb-3">
                  <img
                    src={courseImages[course.id] || "/default-image.jpg"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3
                  className="mt-2 text-lg text-text-primary font-semibold overflow-hidden text-ellipsis"
                  style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                >
                  {course.title}
                </h3>
                <div className="mt-auto pt-2">
                  <p className="text-sm text-yellow-400 flex items-center">
                    {course.rate ? (
                      <>
                        <span className="mr-1">{course.rate}</span>
                        <span className="text-yellow-400">★</span>
                      </>
                    ) : (
                      "No rating yet"
                    )}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-10 mb-6 gap-2">
            <Button
              variant="ghost"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="text-primary border border-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-4"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                let pageToShow
                if (totalPages <= 5) {
                  pageToShow = index + 1
                } else {
                  if (currentPage <= 3) {
                    pageToShow = index + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + index
                  } else {
                    pageToShow = currentPage - 2 + index
                  }
                }

                return (
                  <Button
                    key={pageToShow}
                    variant={currentPage === pageToShow ? "default" : "ghost"}
                    onClick={() => handlePageChange(pageToShow)}
                    className={cn(
                      "min-w-[40px] h-10 rounded-md",
                      currentPage === pageToShow
                        ? "bg-button-primary text-bg-primary hover:bg-button-hover"
                        : "text-primary border border-primary hover:bg-primary hover:text-black",
                    )}
                  >
                    {pageToShow}
                  </Button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="flex items-center px-2">...</span>
                  <Button
                    variant="ghost"
                    onClick={() => handlePageChange(totalPages)}
                    className="min-w-[40px] h-10 rounded-md text-primary border border-primary hover:bg-primary hover:text-black"
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
              className="text-primary border border-primary hover:bg-primary hover:text-black disabled:opacity-50 rounded-md px-4"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
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
      <FooterSection />
    </div>
  )
}