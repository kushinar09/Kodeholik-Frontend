"use client"
import * as React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

export function FilterBarSubmission({ onFilterChange }) {
  const [open, setOpen] = useState(false)
  const calendarRef = useRef(null)

  const [date, setDate] = React.useState({
    from: new Date(2024, 0, 20),
    to: new Date(2026, 0, 20)
  })

  const [filters, setFilters] = useState({
    status: "all",
    date: date
  })

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      status: "all",
      date: {
        from: new Date(2024, 0, 20),
        to: new Date(2026, 0, 20)
      }
    }
    setDate({
      from: new Date(2024, 0, 20),
      to: new Date(2026, 0, 20)
    })
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  useEffect(() => {
    if (!open) {
      handleFilterChange("date", date)
    }
  }, [open])

  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center mb-2 sm:mb-4 mt-2 sm:mt-4 text-primary-text">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[225px] justify-start text-left font-normal bg-bg-card text-xs sm:text-sm h-8 sm:h-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start" ref={calendarRef}>
            <div className="calendar-wrapper">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="custom-calendar"
              />
            </div>
          </PopoverContent>
        </Popover>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-full md:w-40 text-xs sm:text-sm h-8 sm:h-10">
            <SelectValue className="text-primary-text" placeholder="Status" />
          </SelectTrigger>
          <SelectContent defaultValue="all">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="bg-primary text-black text-xs sm:text-sm h-8 sm:h-10" onClick={clearFilters}>
        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        Clear Filters
      </Button>
    </>
  )
}
