"use client"

import { getMyProgress } from "@/lib/api/user_api";
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react"
import { FilterBarProgress } from "../components/filter-list-progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom";
import { ArrowDown, ArrowUp } from "lucide-react";

const requestData = {
    page: 0,
    size: 5,
    status: null,
    sortBy: "noSubmission",
    ascending: false
}

export default function MyProgress() {
    const [myProgress, setMyProgress] = useState(null);
    const { apiCall } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [noContent, setNoContent] = useState(false);
    const [filters, setFilters] = useState({
        status: ""
    });
    const [size, setSize] = useState("5");
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState("noSubmission");
    const [ascending, setAscending] = useState(false);

    const fetchMyProgress = async () => {
        try {
            const response = await getMyProgress(apiCall, requestData);
            console.log(response.content);
            if (response == null) {
                setNoContent(true)
                setTotalElements(0)
            }
            else {
                setMyProgress(response.content);
                setTotalPages(response.totalPages)
                setNoContent(false)
                setTotalElements(response.totalElements)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchMyProgress();
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
        requestData.page = 0
        setCurrentPage(1)
        fetchMyProgress()
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        requestData.page = page - 1
        fetchMyProgress()
    }

    const handleSizeChange = (size) => {
        requestData.page = 0
        setCurrentPage(1)
        setSize(size)
        requestData.size = Number(size);
        fetchMyProgress()
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
        fetchMyProgress()

    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex justify-between">
                <div className="flex items-center text-primary-text">
                    <div>
                        No Result: <span className="font-semibold">{totalElements}</span>
                    </div>
                    <div className="flex ml-8 items-center">
                        <div>
                            Size
                        </div>

                        <div className="ml-4">
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
                    <FilterBarProgress
                        onFilterChange={handleFilterChange}
                    />
                </div>
            </div>
            {!noContent &&
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-primary-text">Problem</TableHead>
                            <TableHead className="text-primary-text">Difficulty</TableHead>
                            <TableHead className="text-primary-text">Status</TableHead>
                            <TableHead onClick={() => { handleSort("noSubmission")}} className="text-primary-text">
                            <p className="cursor-pointer">No Submission
                                    {sortBy == "noSubmission" && ascending &&
                                        <ArrowUp className="ml-2 h-4 w-4 inline" />
                                    }
                                    {sortBy == "noSubmission" && !ascending &&
                                        <ArrowDown className=" ml-2 h-4 w-4 inline" />
                                    }
                                </p>
                            </TableHead>
                            <TableHead onClick={() => { handleSort("createdAt")}} className="text-primary-text">
                                <p className="cursor-pointer">Last Submitted
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
                        {myProgress != null && myProgress.map((progress) => (
                            <TableRow key={progress.problemLink}>
                                <TableCell onClick={() => navigate("/problem/" + progress.problemLink)} className="text-primary-text font-bold cursor-pointer">{progress.problemTitle}</TableCell>
                                <TableCell className="text-primary-text">
                                    {progress.difficulty == "EASY" && <Badge variant="outline" className="bg-green-500 py-1.5 text-black">Easy</Badge>}
                                    {progress.difficulty == "MEDIUM" && <Badge variant="outline" className="bg-yellow-500 py-1.5 text-black">Medium</Badge>}
                                    {progress.difficulty == "Hard" && <Badge variant="outline" className="bg-red-500 py-1.5 text-black">Hard</Badge>}
                                </TableCell>
                                <TableCell className="text-primary-text">
                                    {progress.progressType == "SOLVED" && <div className="flex items-center">
                                        <div>
                                            <svg class="h-8 w-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />  <polyline points="22 4 12 14.01 9 11.01" /></svg>                                        </div>
                                        <div className="text-green-500 ml-2">
                                            Solved
                                        </div>
                                    </div>}
                                    {progress.progressType == "ATTEMPTED" && <div className="flex items-center">
                                        <div>
                                            <svg class="h-8 w-8 text-yellow-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <circle cx="12" cy="12" r="1" />  <circle cx="12" cy="12" r="5" />  <circle cx="12" cy="12" r="9" /></svg>
                                        </div>
                                        <div className="text-yellow-500 ml-2">
                                            Attempted
                                        </div>
                                    </div>}
                                </TableCell>
                                <TableCell className="text-primary-text">{progress.noSubmission}</TableCell>
                                <TableCell className="text-primary-text">{progress.lastSubmitted}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
            {noContent &&
                <div className="flex justify-center mt-6 gap-2">
                    <p>No progress found.</p>
                </div>
            }

            {
                totalPages > 1 && !noContent && (
                    <div className="flex justify-between items-center mt-4 w-full">
                        <div className="flex-1 flex justify-center gap-2">
                            <Button
                                variant="ghost"
                                className="text-primary font-bold hover:bg-primary transition hover:text-white"
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
                                                    "text-primary font-bold hover:bg-primary transition hover:text-white",
                                                    currentPage === index + 1 && "bg-button-primary text-black bg-primary hover:bg-button-hover"
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
                                className="text-primary font-bold hover:bg-primary transition hover:text-white"
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