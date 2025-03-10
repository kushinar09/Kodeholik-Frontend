"use client"

import { useCallback, useEffect, useState } from "react"
import { debounce } from "lodash"
import { getProblemList } from "@/lib/api/problem_api"
import { ProblemHeader } from "./components/problems/problem-header"
import { ProblemSection } from "./components/problems/problem-section"
import FooterSection from "@/components/common/shared/footer"
import HeaderSection from "@/components/common/shared/header"
import { ENDPOINTS } from "@/lib/constants"

export default function ProblemPage() {
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

  const [selectedTopics, setSelectedTopics] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [difficulty, setDifficulty] = useState([])
  const [search, setSearch] = useState("")

  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [pageSize] = useState(10)

  const [sortConfig, setSortConfig] = useState({
    key: null,
    ascending: null
  })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchProblems = useCallback(
    debounce(async (currentPage, pageSize, sortKey, sortAscending, searchQuery) => {
      // setIsLoadingDataProblem(true)
      const data = await getProblemList(currentPage, pageSize, sortKey, sortAscending, searchQuery)
      setProblems(data?.content || [])
      setTotalPages(data?.totalPages || 0)
      // setIsLoadingDataProblem(false)
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
        const response = await fetch(ENDPOINTS.GET_STATS_PROBLEM)
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

  return (
    <>
      <div className="min-h-screen bg-bg-primary">
        <HeaderSection />
        {/* Main Content */}
        <main className="p-4 px-24">
          {/* Study Plan Section */}
          <ProblemHeader stats={stats} />

          <div className="grid grid-cols-3 gap-6">
            {/* Left Content */}
            <div className="col-span-2 space-y-6">
              {/* Problem Section */}
              <ProblemSection
                problems={problems}
                currentPage={currentPage}
                totalPages={totalPages}
                sortConfig={sortConfig}
                search={search}
                setSearch={setSearch}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                topics={topics}
                selectedTopics={selectedTopics}
                toggleTopic={toggleTopic}
                removeAllTopic={removeAllTopic}
                skills={skills}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                handleSort={handleSort}
                handleProblemDetail={handleProblemDetail}
                setCurrentPage={setCurrentPage}
                clearAllFilter={clearAllFilter}
                setSearchQuery={setSearchQuery}
              />
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

