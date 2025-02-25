import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "@/context/AuthProvider"

export function SearchBar({ search, setSearch, onSearchChange, isFiltersOpen, setIsFiltersOpen }) {
  const [suggestions, setSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const { apiCall } = useAuth()

  useEffect(() => {
    if (!search) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_SUGGEST_SEARCH.replace(":text", encodeURIComponent(search)))
        if (!response.ok) throw new Error("Failed to fetch suggestions")
        const data = await response.json()
        setSuggestions(data)
      } catch (error) {
        console.error(error)
      }
    }

    const debounceTimeout = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimeout)
  }, [search])

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      setSearch(suggestions[highlightedIndex])
      setSuggestions([])
    }
  }

  return (
    <div className="relative group mb-4 flex flex-row items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-input-border w-5 h-5 transition-colors group-focus-within:text-primary" />
        <Input
          className="pl-12 h-12 text-lg text-input-text bg-input-bg/50 border-input-border rounded-xl transition focus:border-input-borderFocus"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => {
            const newSearch = e.target.value
            setSearch(newSearch)
            onSearchChange(newSearch)
          }}
          onKeyDown={handleKeyDown}
        />
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded-md z-10">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${index === highlightedIndex ? "bg-gray-200" : ""}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => setSearch(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <span
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="text-end cursor-pointer text-sm mr-2 min-w-20 text-text-primary bg-unset hover:bg-unset hover:text-primary transition"
      >
        {isFiltersOpen ? "Hide" : "Filters"}
      </span>
    </div>
  )
}
