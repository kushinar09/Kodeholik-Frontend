/* eslint-disable indent */
"use client"

import { getMySubmission } from "@/lib/api/user_api"
import { useAuth } from "@/providers/AuthProvider"
import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { ArrowDown, ArrowUp, Clock, Cpu } from "lucide-react"
import { FilterBarSubmission } from "../components/filter-list-submission"

const requestData = {
    page: 0,
    size: 5,
    start: "",
    end: "",
    status: null,
    sortBy: "createdAt",
    ascending: false
}

export default function MySubmission() {
    const [mySubmission, setMySubmission] = useState(null)
    const { apiCall } = useAuth()
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [noContent, setNoContent] = useState(false)
    const [filters, setFilters] = useState({
        status: ""
    })
    const [size, setSize] = useState("5")
    const navigate = useNavigate()
    const [sortBy, setSortBy] = useState("createdAt")
    const [ascending, setAscending] = useState(false)

    const fetchMySubmission = async () => {
        try {
            const response = await getMySubmission(apiCall, requestData)
            if (response == null) {
                setNoContent(true)
                setTotalElements(0)
            }
            else {
                setMySubmission(response.content)
                setTotalPages(response.totalPages)
                setNoContent(false)
                setTotalElements(response.totalElements)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchMySubmission()
    }, [])

    const handleFilterChange = (newFilters) => {
        console.log(newFilters)
        setFilters(newFilters)
        if (newFilters.status === "all") {
            requestData.status = null
        }
        else {
            requestData.status = newFilters.status
        }
        requestData.start = newFilters.date.from.toISOString().slice(0, 16)
        requestData.end = newFilters.date.to.toISOString().slice(0, 16)
        requestData.page = 0
        setCurrentPage(1)
        fetchMySubmission()
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        requestData.page = page - 1
        fetchMySubmission()
    }

    const handleSizeChange = (size) => {
        requestData.page = 0
        setCurrentPage(1)
        setSize(size)
        requestData.size = Number(size)
        fetchMySubmission()
    }

    const handleSort = (sort) => {
        if (sortBy == sort) {
            setAscending(!ascending)
            requestData.ascending = !ascending
        }
        else {
            setSortBy(sort)
            setAscending(true)
            requestData.ascending = true
        }
        requestData.sortBy = sort
        requestData.page = 0
        setCurrentPage(1)
        fetchMySubmission()

    }

    return (
        <div className="space-y-4 p-4">

            <div className="flex flex-col justify-between">
                <div className="flex items-center text-primary-text">
                    <div>
                        No Result: <span className="font-semibold">{totalElements}</span>
                    </div>
                    <div className="flex ml-4 items-center">
                        <div>
                            Size
                        </div>

                        <div className="ml-2">
                            <Select value={size} onValueChange={(value) => handleSizeChange(value)}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent defaultValue="all">
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>
                <div className="flex justify-between items-center">
                    <FilterBarSubmission
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </div>
            {!noContent &&
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-primary-text">Problem</TableHead>
                            <TableHead className="text-primary-text">Language</TableHead>
                            <TableHead onClick={() => { handleSort("executionTime") }} className="text-primary-text">
                                <p className="cursor-pointer">Execution Time
                                    {sortBy == "executionTime" && ascending &&
                                        <ArrowUp className="ml-2 h-4 w-4 inline" />
                                    }
                                    {sortBy == "executionTime" && !ascending &&
                                        <ArrowDown className=" ml-2 h-4 w-4 inline" />
                                    }
                                </p>
                            </TableHead>
                            <TableHead onClick={() => { handleSort("memoryUsage") }} className="text-primary-text">
                                <p className="cursor-pointer">Memory Usage
                                    {sortBy == "memoryUsage" && ascending &&
                                        <ArrowUp className="ml-2 h-4 w-4 inline" />
                                    }
                                    {sortBy == "memoryUsage" && !ascending &&
                                        <ArrowDown className=" ml-2 h-4 w-4 inline" />
                                    }
                                </p>
                            </TableHead>
                            <TableHead className="text-primary-text">Status</TableHead>
                            <TableHead onClick={() => { handleSort("createdAt") }} className="text-primary-text">
                                <p className="cursor-pointer">Created At
                                    {sortBy == "createdAt" && ascending &&
                                        <ArrowUp className="ml-2 h-4 w-4 inline" />
                                    }
                                    {sortBy == "createdAt" && !ascending &&
                                        <ArrowDown className=" ml-2 h-4 w-4 inline" />
                                    }
                                </p>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mySubmission != null && mySubmission.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell onClick={() => navigate("/problem-submission/" + submission.problemLink + "/" + submission.id)} className="text-primary-text font-bold cursor-pointer">{submission.problemTitle}</TableCell>
                                <TableCell className="text-primary-text">{submission.languageName}</TableCell>
                                <TableCell className="text-primary-text">
                                    <div className="flex items-center">
                                        <div>
                                            <Clock className="h-4 w-4 text-primary-text" />
                                        </div>
                                        <div className="ml-2">
                                            {submission.executionTime + " ms"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-primary-text">
                                    <div className="flex items-center">
                                        <div>
                                            <Cpu className="h-4 w-4 text-primary-text" />
                                        </div>
                                        <div className="ml-2">
                                            {submission.memoryUsage + " MB"}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-primary-text">
                                    {submission.status == "SUCCESS" &&
                                        <div className="flex items-center">
                                            <div>
                                                <svg className="size-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />  <polyline points="22 4 12 14.01 9 11.01" /></svg>
                                            </div>
                                            <div className="text-green-500 ml-2">
                                                Success
                                            </div>
                                        </div>}
                                    {submission.status == "FAILED" &&
                                        <div className="flex items-center">
                                            <div>
                                                <svg className="size-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-red-500 ml-2">
                                                Failed
                                            </div>
                                        </div>}
                                </TableCell>
                                <TableCell className="text-primary-text">{submission.createdAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
            {noContent &&
                <div className="flex justify-center mt-6 gap-2 text-primary-text">
                    <p>No submission found.</p>
                </div>
            }

            {
                totalPages > 1 && !noContent && (
                    <div className="flex justify-between items-center mt-4 w-full">
                        <div className="flex-1 flex justify-center gap-2">
                            <Button
                                variant="ghost"
                                className="font-semibold text-text-primary hover:bg-primary hover:text-bg-card"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, index) => {
                                    // Show limited page numbers with ellipsis for better UX
                                    if (
                                        totalPages <= 5 ||
                                        index === 0 ||
                                        index === totalPages - 1 ||
                                        (index >= currentPage - 1 && index <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                variant="ghost"
                                                key={index}
                                                onClick={() => handlePageChange(index + 1)}
                                                className={cn(
                                                    "text-text-primary font-bold transition",
                                                    currentPage === index + 1 ? "text-bg-card bg-primary" : "hover:text-bg-card/70 hover:bg-primary"
                                                )}
                                            >
                                                {index + 1}
                                            </Button>
                                        )
                                    } else if (
                                        (index === 1 && currentPage > 3) ||
                                        (index === totalPages - 2 && currentPage < totalPages - 2)
                                    ) {
                                        return (
                                            <Button key={index} variant="ghost" disabled className="text-primary font-bold">
                                                ...
                                            </Button>
                                        )
                                    }
                                    return null
                                })}
                            </div>
                            <Button
                                variant="ghost"
                                className="font-semibold text-text-primary hover:bg-primary hover:text-bg-card"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )
            }

        </div >
    )
}