"use client"

import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/common/shared/header"
import { RadialChart } from "@/components/common/radial-chart"
import { Check, Search, X, ChevronUp, ChevronDown } from "lucide-react"
import FooterSection from "@/components/common/shared/footer"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { getProblemList } from "@/lib/api/problem_api"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Checkbox } from "@/components/ui/checkbox"

export default function ProblemPage() {
  const [problems, setProblems] = useState([])

  const [searchQuery, setSearchQuery] = useState({
    title: "",
    difficulty: [],
    topics: [],
    skills: []
  })

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(10)

  const [sortConfig, setSortConfig] = useState({
    key: null,
    ascending: true
  })

  useEffect(() => {
    const fetchProblems = async () => {
      const data = await getProblemList(currentPage, pageSize, sortConfig.key, sortConfig.ascending, searchQuery)
      setProblems(data?.content || [])
      setTotalPages(data?.totalPages || 0)
    }
    fetchProblems()
  }, [searchQuery, currentPage, pageSize, sortConfig])

  const stats = {
    mainLabel: "Solve",
    mainCount: 140,
    mainTotal: 3406,
    mainColor: "#98ff99",
    sideStats: [
      {
        label: "Easy",
        count: 40,
        total: 846,
        color: "rgb(74, 222, 128)"
      },
      {
        label: "Medium",
        count: 40,
        total: 1775,
        color: "rgb(234, 179, 8)"
      },
      {
        label: "Hard",
        count: 20,
        total: 785,
        color: "rgb(239, 68, 68)"
      }
    ],
    className: ""
  }

  const topics = [
    "Arrays",
    "Strings",
    "Hash Table",
    "Dynamic Programming",
    "Math",
    "Sorting",
    "Greedy",
    "Depth-First Search",
    "Binary Search",
    "Database",
    "Binary Tree",
    "Stack"
  ]

  const skills = [
    "Problem Solving",
    "Data Structures",
    "Algorithms",
    "Time Complexity",
    "Space Complexity",
    "System Design"
  ]

  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [difficulty, setDifficulty] = useState([])
  const [search, setSearch] = useState("")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const toggleTopic = (topic) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter((t) => t !== topic)
      : [...selectedTopics, topic]
    setSelectedTopics(newTopics)
    setSearchQuery((prev) => ({
      ...prev,
      topics: newTopics
    }))
  }

  const removeTopic = (topic) => {
    setSelectedTopics((prev) => prev.filter((t) => t !== topic))
  }

  function handleProblemDetail(id) {
    window.location.href = `/problem/${id}`
  }

  function clearAllFilter() {
    setSearch("")
    setDifficulty([])
    setSelectedTopics([])
    setSelectedSkills([])
    setCurrentPage(0)
    setSortConfig({ key: null, ascending: "asc" })
    setSearchQuery({
      title: "",
      difficulty: [],
      topics: [],
      skills: []
    })
  }

  const handleSort = (key) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // If clicking the same column, toggle ascending
        return {
          key,
          ascending: current.ascending === true ? false : true
        }
      }
      // If clicking a new column, default to ascending
      return {
        key,
        ascending: true
      }
    })
  }

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null
    }
    return sortConfig.ascending === true ? (
      <ChevronUp className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline-block ml-1" />
    )
  }

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        <Header />
        {/* Main Content */}
        <main className="p-4 px-24">
          {/* Study Plan Section */}
          <section className="mb-4">
            <h2 className="text-xl font-semibold text-white mb-4">Study Plan</h2>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-32 bg-bg-card border-0" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Card className="p-4 bg-bg-card border-0 aspect-video rounded-xl">
                  <RadialChart {...stats} />
                </Card>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="col-span-2 space-y-6">
              {/* Problem Section */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Let&apos;s Solve a Problem</h2>
                <div className="relative group mb-4 flex flex-row items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-input-border w-5 h-5 transition-colors group-focus-within:text-primary transition" />
                    <Input
                      className="pl-12 h-12 text-lg text-input-text bg-input-bg/50 border-input-border rounded-xl transition focus:border-input-borderFocus"
                      placeholder="Search problems..."
                      value={search}
                      onChange={(e) => {
                        const newSearch = e.target.value
                        setSearch(newSearch)
                        setSearchQuery((prev) => ({
                          ...prev,
                          title: newSearch
                        }))
                      }}
                    />
                  </div>
                  <span
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="text-end cursor-pointer text-sm mr-2 min-w-20 text-gray-400 bg-unset hover:bg-unset hover:text-primary transition"
                  >
                    {isFiltersOpen ? "Hide" : "Filters"}
                  </span>
                </div>

                {/* Filters Card */}
                <Card className={`border-primary bg-bg-card backdrop-blur-sm mb-4 ${isFiltersOpen ? "" : "hidden"}`}>
                  <CardContent className="p-6 space-y-6">
                    <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                      <CollapsibleContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white">Filters</h3>
                          <span
                            onClick={() => clearAllFilter()}
                            className="cursor-pointer text-sm text-gray-400 bg-unset hover:bg-unset hover:underline transition"
                          >
                            Clear All
                          </span>
                        </div>
                        {/* Difficulty Filter */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-400">Difficulty</h4>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
                              <Checkbox
                                id="easy"
                                checked={difficulty.includes("easy")}
                                onCheckedChange={(checked) => {
                                  const newDifficulty = checked
                                    ? [...difficulty, "easy"]
                                    : difficulty.filter((d) => d !== "easy")
                                  setDifficulty(newDifficulty)
                                  // Cập nhật searchQuery trực tiếp với giá trị mới
                                  setSearchQuery((prev) => ({
                                    ...prev,
                                    difficulty: newDifficulty
                                  }))
                                }}
                              />
                              <Label htmlFor="easy" className="text-text-difficultEasy cursor-pointer">
                                Easy
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
                              <Checkbox
                                id="medium"
                                checked={difficulty.includes("medium")}
                                onCheckedChange={(checked) => {
                                  const newDifficulty = checked
                                    ? [...difficulty, "medium"]
                                    : difficulty.filter((d) => d !== "medium")
                                  setDifficulty(newDifficulty)
                                  setSearchQuery((prev) => ({
                                    ...prev,
                                    difficulty: newDifficulty
                                  }))
                                }}
                              />
                              <Label htmlFor="medium" className="text-text-difficultMedium cursor-pointer">
                                Medium
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50">
                              <Checkbox
                                id="hard"
                                checked={difficulty.includes("hard")}
                                onCheckedChange={(checked) => {
                                  const newDifficulty = checked
                                    ? [...difficulty, "hard"]
                                    : difficulty.filter((d) => d !== "hard")
                                  setDifficulty(newDifficulty)
                                  setSearchQuery((prev) => ({
                                    ...prev,
                                    difficulty: newDifficulty
                                  }))
                                }}
                              />
                              <Label htmlFor="hard" className="text-text-difficultHard cursor-pointer">
                                Hard
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Topics Filter */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-400">Topics</h4>
                          {selectedTopics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {selectedTopics.map((topic) => (
                                <Badge
                                  key={topic}
                                  className="bg-primary hover:bg-primary text-black hover:text-black transition-colors"
                                >
                                  {topic}
                                  <button onClick={() => removeTopic(topic)} className="ml-2">
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Carousel className="w-full max-w-full">
                            <CarouselContent className="-ml-2 md:-ml-4">
                              {topics.map((topic, index) => (
                                <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                                  <Button
                                    variant={selectedTopics.includes(topic) ? "default" : "outline"}
                                    onClick={() => toggleTopic(topic)}
                                    className={`whitespace-nowrap transition-all ${
                                      selectedTopics.includes(topic) ? "bg-primary text-primary-foreground" : ""
                                    }`}
                                  >
                                    {topic}
                                  </Button>
                                </CarouselItem>
                              ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-0" />
                            <CarouselNext className="right-0" />
                          </Carousel>
                        </div>

                        {/* Skills Filter */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-400">Skills</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {skills.map((skill) => (
                              <div
                                key={skill}
                                className="flex items-center space-x-2 rounded-lg p-2 transition-colors hover:bg-gray-800/50"
                              >
                                <Checkbox
                                  id={skill}
                                  checked={selectedSkills.includes(skill)}
                                  onCheckedChange={(checked) => {
                                    const newSkills = checked
                                      ? [...selectedSkills, skill]
                                      : selectedSkills.filter((s) => s !== skill)
                                    setSelectedSkills(newSkills)
                                    setSearchQuery((prev) => ({
                                      ...prev,
                                      skills: newSkills
                                    }))
                                  }}
                                />
                                <Label htmlFor={skill} className="text-gray-300 cursor-pointer">
                                  {skill}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                <div className="bg-bg-card rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-primary-text text-sm">
                        <th className="text-left py-2">#</th>
                        <th
                          className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort("title")}
                        >
                          Title {getSortIcon("title")}
                        </th>
                        <th
                          className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort("acceptanceRate")}
                        >
                          Acceptance {getSortIcon("acceptanceRate")}
                        </th>
                        <th
                          className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort("difficulty")}
                        >
                          Difficulty {getSortIcon("difficulty")}
                        </th>
                        <th
                          className="text-left py-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort("participants")}
                        >
                          Participant {getSortIcon("participants")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(problems) && problems.length > 0 ? (
                        problems.map((problem) => (
                          <tr
                            key={problem.id}
                            onClick={() => handleProblemDetail(problem.link)}
                            className="text-white cursor-pointer hover:bg-gray-800 gap-10"
                          >
                            <td className="py-2" title="Solved">
                              {problem.solved && <Check className="w-5 h-5 text-green-500" />}
                            </td>
                            <td
                              className="py-2 pe-4 max-w-32 overflow-hidden text-ellipsis whitespace-nowrap"
                              title={problem.title}
                            >
                              {problem.title}
                            </td>
                            <td className="py-2">{problem.acceptanceRate}%</td>
                            <td
                              className={`py-2 ${problem.difficulty === "EASY" ? "text-text-difficultEasy" : problem.difficulty === "MEDIUM" ? "text-text-difficultMedium" : "text-text-difficultHard"}`}
                            >
                              {problem.difficulty}
                            </td>
                            <td className="py-2">{problem.participants}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-gray-400">
                            No problems found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {Array.isArray(problems) && problems.length > 0 && (
                    <div className="flex items-center justify-between px-2 py-4 border-t border-gray-800">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(0)}
                          disabled={currentPage === 0}
                        >
                          First
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                          disabled={currentPage === 0}
                        >
                          Previous
                        </Button>
                      </div>
                      <div className="text-sm text-gray-400">
                        Page {currentPage + 1} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                          disabled={currentPage === totalPages - 1}
                        >
                          Next
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages - 1)}
                          disabled={currentPage === totalPages - 1}
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Calendar */}
              {/* <Card className="p-4 bg-primary-card border-0">
                <Calendar mode="single" className="text-white" />
              </Card> */}

              {/* Progress Chart */}
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    </>
  )
}

