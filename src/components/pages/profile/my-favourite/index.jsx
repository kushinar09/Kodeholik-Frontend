"use client"

import { getMyFavourite, getMyProgress, untagFavourite } from "@/lib/api/user_api";
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
import { toast } from "@/hooks/use-toast";


export default function MyFavourite() {
    const [myFavourite, setMyFavourite] = useState(null);
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

    const fetchMyFavourite = async () => {
        try {
            const response = await getMyFavourite(apiCall, currentPage - 1, size);
            if (response == null) {
                setNoContent(true)
                setTotalElements(0)
            }
            else {
                setMyFavourite(response.content);
                setTotalPages(response.totalPages)
                setNoContent(false)
                setTotalElements(response.totalElements)
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchMyFavourite();
    }, [])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        requestData.page = page - 1
        fetchMyFavourite()
    }

    const handleSizeChange = (size) => {
        requestData.page = 0
        setCurrentPage(1)
        setSize(size)
        requestData.size = Number(size);
        fetchMyFavourite()
    }

    const handleUntagProblem = (link) => {
        untagFavouriteProblem(link);
    }

    const untagFavouriteProblem = async (link) => {
        try {
            await untagFavourite(apiCall, link);
            toast({
                title: "Untag Problem",
                description: "Untag problem successful",
                variant: "default" // destructive
            })
            fetchMyFavourite();
        } catch (error) {
            console.log(error);
        }
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
            </div>
            {!noContent &&
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-primary-text">ID</TableHead>
                            <TableHead className="text-primary-text">Title</TableHead>
                            <TableHead className="text-primary-text">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myFavourite != null && myFavourite.map((favourite) => (
                            <TableRow className="text-primary-text" key={favourite.link}>
                                <TableCell>{favourite.id}</TableCell>
                                <TableCell onClick={() => navigate("/problem/" + favourite.link)} className="text-primary-text font-bold cursor-pointer">{favourite.title}</TableCell>
                                <TableCell className="text-black">
                                   <Button onClick={() => handleUntagProblem(favourite.link)}>Untag</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            }
            {noContent &&
                <div className="flex justify-center mt-6 gap-2 text-primary-text">
                    <p>No favourite found.</p>
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