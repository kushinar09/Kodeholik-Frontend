"use client"
import * as React from "react"

import { useState, useEffect, useRef} from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"


export function FilterBarProgress({ onFilterChange }) {

    const [filters, setFilters] = useState({
        status: "all",
    })

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

  

    const clearFilters = () => {
        const clearedFilters = {
            status: "all"
        }
        setFilters(clearedFilters)
        onFilterChange(clearedFilters)
    }


    return (
        <div className="flex flex-wrap gap-4 items-center mb-4 mt-4 text-primary-text" >
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-full md:w-40">
                    <SelectValue className="text-primary-text" placeholder="Status" />
                </SelectTrigger>
                <SelectContent defaultValue="all">
                    <SelectItem  value="all">All Statuses</SelectItem>
                    <SelectItem  value="SUCCESS">Solved</SelectItem>
                    <SelectItem value="FAILED">Attempted</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" className="bg-primary text-black" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
            </Button>
        </div>
    )
}

