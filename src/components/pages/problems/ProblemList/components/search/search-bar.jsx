"use client"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/providers/AuthProvider"
import { Search } from "lucide-react"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

export function SearchBar({ search, setSearch, onSearchChange, isFiltersOpen, setIsFiltersOpen }) {
  const [suggestions, setSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [tempSearch, setTempSearch] = useState("")
  const containerRef = useRef(null)

  const { apiCall } = useAuth()

  useEffect(() => {
    setTempSearch(search)
  }, [search])

  useEffect(() => {
    if (!tempSearch) {
      setSuggestions([])
      return
    }

    const fetchSuggestionSearchs = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_SUGGEST_SEARCH.replace(":text", encodeURIComponent(tempSearch)))
        if (!response.ok) throw new Error("Failed to fetch suggestions")
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error(error)
      }
    }

    const debounceTimeout = setTimeout(fetchSuggestionSearchs, 300)
    return () => clearTimeout(debounceTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempSearch])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      const selectedSuggestion = suggestions[highlightedIndex]
      setTempSearch(selectedSuggestion)
      setSearch(selectedSuggestion)
      onSearchChange(selectedSuggestion)
      setSuggestions([])
    }
  }

  return (
    <div ref={containerRef} className="relative group mb-4 flex flex-col sm:flex-row items-center gap-2">
      <div className="flex-1 relative w-full">
        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-input-border w-4 sm:w-5 h-4 sm:h-5 transition-colors group-focus-within:text-primary" />
        <Input
          className="pl-10 sm:pl-12 h-10 sm:h-12 text-base sm:text-lg text-input-text bg-input-bg/50 border-input-border rounded-xl transition focus:border-input-borderFocus"
          placeholder="Search problems..."
          value={tempSearch}
          onChange={(e) => {
            const newSearch = e.target.value
            setTempSearch(newSearch)
            setHighlightedIndex(-1) // Reset index when typing
          }}
          onKeyDown={handleKeyDown}
        />
        {/* Search Button */}
        <div className="absolute right-0 top-0 p-1 sm:p-2 h-full">
          <Button
            className="h-full"
            size="sm"
            onClick={() => {
              setSearch(tempSearch)
              onSearchChange(tempSearch)
              setSuggestions([])
            }}
          >
            Search
          </Button>
        </div>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded-md z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer ${index === highlightedIndex ? "bg-gray-200" : "hover:bg-gray-100"}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={() => {
                  setTempSearch(suggestion)
                  setSearch(suggestion)
                  onSearchChange(suggestion)
                  setSuggestions([])
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filters Toggle */}
      <span
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="text-center sm:text-end cursor-pointer text-sm mr-0 sm:mr-2 min-w-16 sm:min-w-20 text-text-primary bg-unset hover:bg-unset hover:text-primary transition"
      >
        {isFiltersOpen ? "Hide" : "Filters"}
      </span>
    </div>
  )
}
