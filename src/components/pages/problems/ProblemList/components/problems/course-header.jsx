"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ENDPOINTS } from "@/lib/constants"
import { Calendar } from "./calendar"
import placeholder from "@/assets/images/placeholder_square.jpg"
import { Star } from "lucide-react"

export function CourseHeader() {
  const [date, setDate] = useState(new Date())
  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_TOP_COURSES)
        const data = await response.json()
        setCourses(data)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setLoading(false)
      }
    }

    fetchTopCourses()
  }, [])
  return (
    <section className="mb-4">
      <h2 className="text-xl font-semibold text-white mb-4">Study Plan</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading || !courses
              ? // Skeleton loading state
                [...Array(6)].map((_, i) => <Card key={i} className="h-32 bg-bg-card border-0 animate-pulse" />)
              : courses.slice(0, 6).map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        </div>
        <div className="space-y-4 lg:space-y-6">
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
      onClick={() => (window.location.href = "/courses/" + course.id)}
      className="h-32 bg-bg-card border-0 overflow-hidden flex flex-row cursor-pointer hover:scale-105 transition-all"
    >
      {/* Left side - Image */}
      <div className="relative h-full w-1/3 sm:w-2/5">
        <img
          loading="lazy"
          src={course.image || placeholder}
          alt={course.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full">
          {course.numberOfParticipant.toLocaleString()}
        </div>
      </div>

      {/* Right side - Details */}
      <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between text-text-primary">
        <div>
          <p className="font-medium text-xs sm:text-sm line-clamp-2 mb-1 sm:mb-2">{course.title}</p>

          <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
              const fullStars = Math.floor(course.rate)
              const hasHalfStar = course.rate - fullStars >= 0.5

              return (
                <Star
                  key={i}
                  size={12}
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
            <span className="text-[10px] sm:text-xs ml-1 text-gray-400">({course.rate.toFixed(1)})</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1">
            {course.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-xs bg-primary text-bg-card font-semibold px-1 sm:px-1.5 py-0.5 rounded"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
