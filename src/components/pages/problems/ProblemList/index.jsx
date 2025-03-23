"use client"

import { useCallback, useEffect, useState } from "react"
import { debounce } from "lodash"
import { getProblemList } from "@/lib/api/problem_api"
import { ProblemSection } from "./components/problems/problem-section"
import FooterSection from "@/components/common/shared/footer"
import HeaderSection from "@/components/common/shared/header"
import { ENDPOINTS } from "@/lib/constants"
import { Card } from "@/components/ui/card"
import { RadialChart } from "@/components/common/shared/other/radial-chart"
import { CourseHeader } from "./components/problems/course-header"
import { FilterPanel } from "./components/filter/filter"
import { useAuth } from "@/providers/AuthProvider"

export default function ProblemPage() {
  const { apiCall, isAuthenticated } = useAuth()
  const [problems, setProblems] = useState([])

  const [searchQuery, setSearchQuery] = useState({
    title: "",
    difficulty: [],
    topics: [],
    skills: []
  })

  const [topics, setTopics] = useState([])
  const [skills, setKkills] = useState([])
  const [stats, setStats] = useState(
    {
      mainLabel: "Solve",
      mainCount: 0,
      mainTotal: 0,
      mainColor: "#98ff99",
      sideStats: [
        {
          label: "Easy",
          count: 0,
          total: 0,
          color: "rgb(74, 222, 128)"
        },
        {
          label: "Medium",
          count: 0,
          total: 0,
          color: "rgb(234, 179, 8)"
        },
        {
          label: "Hard",
          count: 0,
          total: 0,
          color: "rgb(239, 68, 68)"
        }
      ],
      className: ""
    }
  )

  const [isLoadingDataProblem, setIsLoadingDataProblem] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [difficulty, setDifficulty] = useState([])
  const [search, setSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(12)

  const [sortConfig, setSortConfig] = useState({
    key: null,
    ascending: null
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchProblems = useCallback(
    debounce(async (currentPage, pageSize, sortKey, sortAscending, searchQuery) => {
      setIsLoadingDataProblem(true)

      // Fetch data and wait at least 200ms before stopping loading
      const [data] = await Promise.all([
        getProblemList(currentPage, pageSize, sortKey, sortAscending, searchQuery),
        new Promise((resolve) => setTimeout(resolve, 500))
      ])

      setProblems(data?.content || [])
      setTotalPages(data?.totalPages || 0)
      setIsLoadingDataProblem(false)
    }, 500), // Debounce 500ms
    []
  )


  useEffect(() => {
    const getColorForLabel = (label) => {
      switch (label) {
        case "EASY":
          return "rgb(74, 222, 128)"
        case "MEDIUM":
          return "rgb(234, 179, 8)"
        case "HARD":
          return "rgb(239, 68, 68)"
        default:
          return "#ccc"
      }
    }

    const fetchTopics = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_TOPICS_PROBLEM)
        const data = await response.json()
        setTopics(data)
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }

    const fetchSkills = async () => {
      try {
        const response = await fetch(ENDPOINTS.GET_SKILLS_PROBLEM)
        const data = await response.json()
        setKkills(data)
      } catch (error) {
        console.error("Error fetching skills:", error)
      }
    }

    const fetchStats = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_STATS_PROBLEM)
        const data = await response.json()
        const transformedStats = {
          mainLabel: "Solve",
          mainCount: data.find(item => item.name === "ALL")?.noAchived || 0,
          mainTotal: data.find(item => item.name === "ALL")?.noTotal || 0,
          mainColor: "#98ff99",
          sideStats: data
            .filter(item => item.name !== "ALL")
            .map(item => ({
              label: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
              count: item.noAchived,
              total: item.noTotal,
              color: getColorForLabel(item.name)
            })),
          className: ""
        }

        setStats(transformedStats)
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
    fetchTopics()
    fetchSkills()
  }, [])

  useEffect(() => {
    setCurrentPage(0)
  }, [searchQuery])

  useEffect(() => {
    setSearchQuery((prev) => ({
      ...prev,
      title: search
    }))
  }, [search])

  useEffect(() => {
    fetchProblems(currentPage, pageSize, sortConfig.key, sortConfig.ascending, searchQuery)
  }, [searchQuery, currentPage, pageSize, sortConfig, fetchProblems])

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

  const removeAllTopic = useCallback(() => {
    setSelectedTopics([])
    setSearchQuery((prev) => ({
      ...prev,
      topics: []
    }))
  }, [])


  function handleProblemDetail(id) {
    window.location.href = `/problem/${id}`
  }

  function clearAllFilter() {
    setSearch("")
    setDifficulty([])
    setSelectedTopics([])
    setSelectedSkills([])
    setCurrentPage(0)
    setSortConfig({ key: null, ascending: null })
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
        return {
          key,
          ascending: current.ascending === true ? false : true
        }
      }
      return {
        key,
        ascending: true
      }
    })
  }

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)


  const handleDifficultyChange = (newDifficulty) => {
    setSearchQuery((prev) => ({
      ...prev,
      difficulty: newDifficulty
    }))
  }

  const handleSkillsChange = (newSkills) => {
    setSearchQuery((prev) => ({
      ...prev,
      skills: newSkills
    }))
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-primary/90">
        <HeaderSection currentActive="problems"/>
        {/* Main Content */}
        <main className="p-4 px-36">
          {/* Study Plan Section */}
          <CourseHeader stats={stats} />

          <div className="grid grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="col-span-2 space-y-6">
              {/* Problem Section */}
              <ProblemSection
                problems={problems}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                sortConfig={sortConfig}
                search={search}
                setSearch={setSearch}
                handleSort={handleSort}
                handleProblemDetail={handleProblemDetail}
                setCurrentPage={setCurrentPage}
                setSearchQuery={setSearchQuery}
                isFiltersOpen={isFiltersOpen}
                setIsFiltersOpen={setIsFiltersOpen}
                isLoading={isLoadingDataProblem}
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <FilterPanel
                isFiltersOpen={isFiltersOpen}
                setIsFiltersOpen={setIsFiltersOpen}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                topics={topics}
                selectedTopics={selectedTopics}
                toggleTopic={toggleTopic}
                removeAllTopic={removeAllTopic}
                skills={skills}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                clearAllFilter={clearAllFilter}
                onDifficultyChange={handleDifficultyChange}
                onSkillsChange={handleSkillsChange}
              />
              {isAuthenticated &&
                <Card className="p-4 bg-bg-card border-0 aspect-video rounded-xl">
                  <RadialChart {...stats} />
                </Card>
              }
            </div>
          </div>
        </main>
        <FooterSection />
      </div>
    </>
  )
}

