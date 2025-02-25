"use client"

import { useState } from "react"
import { SearchBar } from "../search/search-bar"
import { FilterPanel } from "../filter/filter"
import { ProblemTable } from "./problem-table"


export function ProblemSection({
  problems,
  currentPage,
  totalPages,
  sortConfig,
  search,
  setSearch,
  difficulty,
  setDifficulty,
  topics,
  selectedTopics,
  toggleTopic,
  removeAllTopic,
  skills,
  selectedSkills,
  setSelectedSkills,
  handleSort,
  handleProblemDetail,
  setCurrentPage,
  clearAllFilter,
  setSearchQuery
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleSearchChange = (value) => {
    setSearchQuery((prev) => ({
      ...prev,
      title: value
    }))
  }

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
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Let&apos;s Solve a Problem</h2>

      <SearchBar
        search={search}
        setSearch={setSearch}
        onSearchChange={handleSearchChange}
        isFiltersOpen={isFiltersOpen}
        setIsFiltersOpen={setIsFiltersOpen}
      />

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

      <ProblemTable
        problems={problems}
        currentPage={currentPage}
        totalPages={totalPages}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleProblemDetail={handleProblemDetail}
        setCurrentPage={setCurrentPage}
      />
    </section>
  )
}

