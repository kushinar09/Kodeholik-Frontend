"use client"

import { useState } from "react"
import { SearchBar } from "../search/search-bar"
import { FilterPanel } from "../filter/filter"
import { ProblemTable } from "./problem-table"


export function ProblemSection({
  problems,
  currentPage,
  totalPages,
  pageSize,
  sortConfig,
  search,
  setSearch,
  handleSort,
  handleProblemDetail,
  setCurrentPage,
  setSearchQuery,
  isFiltersOpen,
  setIsFiltersOpen,
  isLoading
}) {

  const handleSearchChange = (value) => {
    setSearchQuery((prev) => ({
      ...prev,
      title: value
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

      <ProblemTable
        problems={problems}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleProblemDetail={handleProblemDetail}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
      />
    </section>
  )
}

