"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, CheckCircle, XCircle, Clock, HardDrive, AlertCircle } from "lucide-react"
import hljs from "highlight.js"
import LoadingScreen from "@/components/common/shared/other/loading"
import { AnimatedTabs, AnimatedTabsContent } from "@/components/common/shared/other/animated-tabs"

export default function ExamResultsDialog({ isOpen, onClose, examResults }) {
  const [activeTab, setActiveTab] = useState("")
  const [activeSubTab, setActiveSubTab] = useState("code")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const highlightTimeoutRef = useRef(null)

  // Set the first problem as active tab when results load
  useEffect(() => {
    if (examResults?.problemResults?.length > 0) {
      setActiveTab(examResults.problemResults[0].id.toString())
    }
  }, [examResults])

  // Function to apply syntax highlighting
  const applyHighlighting = () => {
    // Clear any existing timeout to prevent race conditions
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }

    // Set a new timeout to apply highlighting after the DOM has updated
    highlightTimeoutRef.current = setTimeout(() => {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block)
      })
    }, 50) // Small delay to ensure DOM is updated
  }

  // Apply syntax highlighting when results load or tab changes
  useEffect(() => {
    if (isOpen && examResults) {
      applyHighlighting()
    }

    // Cleanup timeout on unmount
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [examResults, isOpen, activeTab, activeSubTab])

  // Handle tab changes with transition
  const handleTabChange = (value) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveTab(value)
      setIsTransitioning(false)
      // Apply highlighting after tab change is complete
      applyHighlighting()
    }, 300)
  }

  // Handle sub-tab changes
  const handleSubTabChange = (value) => {
    setActiveSubTab(value)
    // Apply highlighting after sub-tab change
    setTimeout(applyHighlighting, 50)
  }

  // Show loading state when dialog is open but results aren't loaded yet
  if (isOpen && !examResults) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Exam Results</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <LoadingScreen />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // If dialog is closed or we don't have results, don't render anything
  if (!isOpen || !examResults) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] min-h-[70vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Exam Results</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Overall Grade</h3>
                <div className="text-3xl font-bold">{examResults.grade.toFixed(1)}</div>
              </div>
            </CardHeader>
          </Card>

          <AnimatedTabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4 flex h-auto flex-wrap gap-2 bg-transparent p-0 justify-start">
              {examResults.problemResults.map((problem) => (
                <TabsTrigger
                  key={problem.id}
                  value={problem.id.toString()}
                  className="flex items-center gap-2 data-[state=active]:bg-bg-card/90 data-[state=active]:text-primary data-[state=active]:font-semibold"
                >
                  <span className="truncate max-w-[150px]">{problem.title}</span>
                  <Badge
                    variant={problem.submissionResponseDto && problem.submissionResponseDto.status === "SUCCESS" ? "default" : "destructive"}
                    className={`ml-1 ${problem.submissionResponseDto && problem.submissionResponseDto.status === "SUCCESS" ? "bg-green-500 text-white" : ""}`}
                  >
                    {problem.point.toFixed(1)}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="relative min-h-[400px]">
              {examResults.problemResults.map((problem) => (
                <AnimatedTabsContent
                  key={problem.id}
                  value={problem.id.toString()}
                  className={`border rounded-lg p-4 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{problem.title}</h3>
                      <a
                        href={`/problems/${problem.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      {problem.submissionResponseDto &&
                        <Badge
                          variant={problem.submissionResponseDto.status === "SUCCESS" ? "success" : "destructive"}
                          className={`${problem.submissionResponseDto.status === "SUCCESS" ? "bg-green-500 text-white" : ""}`}
                        >
                          {problem.submissionResponseDto.status}
                        </Badge>}
                      <div className="text-sm font-medium">{problem.point.toFixed(1)} points</div>
                    </div>
                  </div>

                  <AnimatedTabs defaultValue="code" className="w-full" onValueChange={handleSubTabChange}>
                    <TabsList className="w-full max-w-[400px] grid grid-cols-2">
                      <TabsTrigger value="code">Code Submission</TabsTrigger>
                      <TabsTrigger value="results">Test Results</TabsTrigger>
                    </TabsList>

                    <div className="relative min-h-[300px]">
                      <AnimatedTabsContent value="code" className="pt-4 absolute w-full">
                        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                          <div>
                            Language: <span className="font-medium">{problem.submissionResponseDto.languageName}</span>
                          </div>
                          <div>
                            Submitted: <span className="font-medium">{problem.submissionResponseDto.createdAt}</span>
                          </div>
                        </div>

                        {problem.submissionResponseDto.status === "FAILED" && problem.submissionResponseDto.message && (
                          <Alert variant="destructive" className="mb-3 flex items-center">
                            <span>
                              <AlertCircle className="h-4 w-4" />
                            </span>
                            <AlertDescription className="ml-2 text-xs">
                              {problem.submissionResponseDto.message}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="bg-muted rounded-md p-4 overflow-auto min-h-[200px] max-h-[300px]">
                          <pre className="text-sm font-mono">
                            <code className="language-java">{problem.submissionResponseDto.code}</code>
                          </pre>
                        </div>

                        {problem.submissionResponseDto.executionTime && (
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Execution time: {problem.submissionResponseDto.executionTime} ms</span>
                            </div>
                            {problem.submissionResponseDto.memoryUsage && (
                              <div className="flex items-center">
                                <HardDrive className="h-4 w-4 mr-1" />
                                <span>Memory usage: {problem.submissionResponseDto.memoryUsage} MB</span>
                              </div>
                            )}
                          </div>
                        )}
                      </AnimatedTabsContent>

                      <AnimatedTabsContent value="results" className="pt-4 absolute w-full">
                        <div className="space-y-4 min-h-[200px]">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                {problem.percentPassed === "100%" ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                                ) : problem.percentPassed === "0%" ? (
                                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-yellow-500 flex items-center justify-center mr-2">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                  </div>
                                )}
                                <span className="font-medium">Test Cases: {problem.noTestCasePassed} passed</span>
                                {problem.submissionResponseDto.noTestcase && (
                                  <span className="text-muted-foreground ml-1">
                                    of {problem.submissionResponseDto.noTestcase}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium">{problem.percentPassed}</span>
                            </div>
                            <Progress value={Number.parseInt(problem.percentPassed)} className="h-2 bg-gray-200" />
                          </div>

                          {problem.submissionResponseDto.inputWrong && (
                            <div className="mt-4">
                              <h5 className="font-medium mb-2">Failed Test Case</h5>
                              <div className="bg-muted rounded-md p-3 text-sm">
                                <div className="mb-2">
                                  <span className="font-medium">Input:</span>
                                  <div className="ml-2 mt-1">
                                    {problem.submissionResponseDto.inputWrong.inputs.map((input, i) => (
                                      <div key={i}>
                                        {input.name}: {input.value}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <span className="font-medium">Expected:</span>
                                    <div className="ml-2 mt-1 font-mono">
                                      {problem.submissionResponseDto.inputWrong.expectedOutput}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Actual:</span>
                                    <div className="ml-2 mt-1 font-mono">
                                      {problem.submissionResponseDto.inputWrong.actualOutput}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </AnimatedTabsContent>
                    </div>
                  </AnimatedTabs>
                </AnimatedTabsContent>
              ))}
            </div>
          </AnimatedTabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

