"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Calendar } from "./calendar"
import { Star } from "lucide-react"
import { ENDPOINTS } from "@/lib/constants"
import placeholder from "@/assets/images/placeholder_square.jpg"

export function CourseHeader() {
  const [date, setDate] = useState(new Date())
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(ENDPOINTS.GET_TOP_COURSES)
        const data = await response.json()
        setCourses(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])
  return (
    <section className="mb-4">
      <h2 className="text-xl font-semibold text-white mb-4">Study Plan</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? // Skeleton loading state
              [...Array(6)].map((_, i) => <Card key={i} className="h-48 bg-bg-card border-0 animate-pulse" />)
              : // Actual course cards
              courses
                .slice(0, 6)
                .map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </div>
        <div className="space-y-6">
          <Card className="p-4 bg-primary-card border-0">
            <Calendar date={date} setDate={setDate} />
          </Card>
        </div>
      </div>
    </section>
  )
}

export function CourseCard({ course }) {
  return (
    <Card
      onClick={() => (window.location.href = "/course/" + course.id)}
      className="h-32 bg-bg-card border-0 overflow-hidden flex flex-row cursor-pointer hover:scale-105 transition-all"
    >
      {/* Left side - Image */}
      <div className="relative h-full w-2/5">
        <img src={course.image || placeholder} alt={course.title} className="h-full w-full object-cover" />
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
          {course.numberOfParticipant.toLocaleString()} members
        </div>
      </div>

      {/* Right side - Details */}
      <div className="p-3 flex flex-col flex-1 justify-between text-text-primary">
        <div>
          {/* Option 1: For multi-line truncation (2 lines) */}
          <p className="font-medium text-sm line-clamp-2 mb-2">{course.title}</p>

          {/* Option 2: For single-line truncation (uncomment if preferred)
          <p className="font-medium text-sm truncate mb-2">{course.title}</p>
          */}

          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const fullStars = Math.floor(course.rate)
              const hasHalfStar = course.rate - fullStars >= 0.5

              return (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < fullStars
                      ? "fill-yellow-400 text-yellow-400"
                      : i === fullStars && hasHalfStar
                        ? "fill-yellow-200 text-yellow-200"
                        : "text-gray-400"
                  }
                />
              )
            })}
            <span className="text-xs ml-1 text-gray-400">({course.rate.toFixed(1)})</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1">
            {course.topics.map((topic, i) => (
              <span key={i} className="text-xs bg-primary text-bg-card font-semibold px-1.5 py-0.5 rounded">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}