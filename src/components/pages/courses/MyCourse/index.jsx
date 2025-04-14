"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpenCheck, BookText, Star } from "lucide-react"
import HeaderSection from "@/components/common/shared/header"
import FooterSection from "@/components/common/shared/footer"
import { useNavigate } from "react-router-dom"
import { ENDPOINTS } from "@/lib/constants"
import placeholder from "@/assets/images/placeholder_square.jpg"
import { useAuth } from "@/providers/AuthProvider"

export default function MyCourses() {
  const [courses, setCourses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState("enrolledAt")
  const [sortDir, setSortDir] = useState("desc")
  const [size, setSize] = useState(10)
  const navigate = useNavigate()
  const { apiCall } = useAuth()

  // Fetch courses with the modified filter parameters
  useEffect(() => {
    const fetchMyCourses = async () => {
      setIsLoading(true)
      try {
        // Call the real API with the filter parameters
        const response = await apiCall(
          `${ENDPOINTS.GET_MY_COURSES}?page=${currentPage - 1}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch courses")
        }

        const data = await response.json()

        // Update state with the API response data
        setCourses(data.content)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setCourses([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMyCourses()
  }, [currentPage, sortBy, sortDir, size])

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleClearFilters = () => {
    setCurrentPage(1)
    setSortBy("enrolledAt")
    setSortDir("desc")
  }

  const handleSortChange = (value) => {
    const [newSortBy, newSortDir] = value.split("-")
    setSortBy(newSortBy)
    setSortDir(newSortDir)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <HeaderSection />
      <div className="mx-36 py-8 text-text-primary">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Main content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold">
                  All My Courses
                </h2>
                <p className="text-muted-foreground">Continue learning where you left off</p>
              </div>
              <Select value={`${sortBy}-${sortDir}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrolledAt-desc">Enrollment Date (Newest)</SelectItem>
                  <SelectItem value="enrolledAt-asc">Enrollment Date (Oldest)</SelectItem>
                  <SelectItem value="progress-desc">Progress (High to Low)</SelectItem>
                  <SelectItem value="progress-asc">Progress (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  We couldn&apos;t find any courses matching your search criteria. Try adjusting your filters or search
                  term.
                </p>
                <Button className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="bg-bg-card border-none hover:scale-105 text-text-primary overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="relative">
                      <img loading="lazy"
                        src={course.image || placeholder}
                        alt={course.title}
                        className="w-full aspect-[5/3] object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-bg-primary text-primary font-semibold px-2 py-0.5 text-sm rounded">
                        {course.progress.toFixed(0)} %
                      </div>
                    </div>
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div className="flex gap-2">
                        <Avatar className="cursor-pointer size-6 border-2 border-primary hover:border-primary/80 transition-colors">
                          <AvatarImage src={course.createdBy?.avatar} alt={course.createdBy?.fullname || "User"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {course.createdBy?.username ? course.createdBy?.username
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()
                              .substring(0, 2) : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{course.createdBy?.username || "Instructor"}</span>
                      </div>
                      <h3 className="font-bold line-clamp-2">{course.title}</h3>
                      {course.topics && course.topics.length > 0 && (
                        <p className="text-sm line-clamp-2">
                          <span className="font-semibold">Topics: </span>
                          {course.topics.join(", ")}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <div className="flex gap-2 items-center">
                          <BookText className="size-4" />
                          {course.noChapter || 0} Chapters
                        </div>
                        <div className="flex gap-2 items-center">
                          <BookOpenCheck className="size-4" />
                          {course.noLesson || 0} Lessons
                        </div>
                      </div>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-amber-500">
                            <span className="mr-1 font-semibold">{course.rate || 0}</span>
                            <Star className="size-4 fill-amber-500" />
                          </div>
                          <span className="text-muted-foreground text-sm">Enroll: {course.enrolledAt}</span>
                        </div>
                      </div>
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
                  className="rounded-md px-4 hover:bg-bg-card/70 hover:text-text-primary"
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
                        className={`min-w-[40px] h-10 rounded-md ${currentPage === pageToShow ? "bg-bg-card text-primary hover:bg-bg-card hover:text-primary" : "bg-transparent text-text-primary hover:bg-bg-card/70"}`}
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
                        className="min-w-[40px] h-10 rounded-md"
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
                  className="rounded-md px-4"
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
        </div>
      </div>
      <FooterSection />
    </div>
  )
}
