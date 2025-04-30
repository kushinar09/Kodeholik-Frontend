"use client"

import { Button } from "@/components/ui/button"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function Calendar({ date, setDate }) {
  const currentDate = new Date()

  // Get the first day of the month
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeek = firstDayOfMonth.getDay() // Sunday = 0, Monday = 1, etc.

  // Adjust to start from Monday (if needed)
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  // Get the number of days in the month
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  // Month and year display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const monthName = monthNames[date.getMonth()]
  const year = date.getFullYear()

  // Navigation functions
  const prevMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  const nextMonth = () => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))

  // Create calendar grid
  const days = []
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] // Ensure correct order

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="h-6 sm:h-8 text-center text-sm"></div>)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const isCurrentDay =
      i === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()

    days.push(
      <div key={`day-${i}`} className="h-6 sm:h-8 flex items-center justify-center">
        <div
          className={cn(
            "h-6 w-6 sm:h-8 sm:w-8 text-center items-center justify-center text-xs sm:text-sm flex rounded-full",
            isCurrentDay
              ? "bg-primary text-primary-foreground font-semibold"
              : "hover:bg-muted/50 hover:text-gray-900 cursor-pointer text-text-primary"
          )}
        >
          {i}
        </div>
      </div>
    )
  }

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-6 w-6 sm:h-7 sm:w-7 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <h3 className="text-xs sm:text-sm font-medium text-white">
          {monthName} {year}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-6 w-6 sm:h-7 sm:w-7 text-white/70 hover:text-white hover:bg-white/10"
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1 sm:mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-white/60">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  )
}
