import LoadingScreen from "@/components/common/shared/other/loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import hljs from "highlight.js"
import { ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function ExamResultsDialog({ isOpen, onClose, examResults }) {
  const [activeTab, setActiveTab] = useState("code")

  // Apply syntax highlighting when results load or tab changes
  useEffect(() => {
    if (isOpen && examResults) {
      setTimeout(() => {
        document.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block)
        })
      }, 0)
    }
  }, [examResults, isOpen, activeTab])

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  // Show loading state when dialog is open but results aren't loaded yet
  if (isOpen && examResults) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-bg-card text-text-primary">
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

  const { grade, problemResults } = examResults

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-bg-card text-text-primary">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Exam Results</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Overall Grade</h3>
            <div className="text-3xl font-bold">{grade.toFixed(1)}</div>
          </div>

          <h3 className="text-lg font-medium mb-4">Problem Results</h3>

          <ScrollArea className="h-[60vh]">
            <div className="space-y-6">
              {problemResults.map((problem, index) => (
                <div key={problem.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-primary text-bg-card">
                    <div className="flex items-center">
                      <h4 className="font-medium">{problem.title}</h4>
                      <a
                        href={`/problems/${problem.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        Language: <span className="font-medium">{problem.languageName}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-sm mr-2">
                          Points: <span className="font-medium">{problem.point.toFixed(1)}</span>
                        </div>
                        {problem.percentPassed === "100%" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-1">{problem.percentPassed}</span>
                            {problem.percentPassed === "0%" ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-yellow-500 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Tabs
                    defaultValue="code"
                    className="w-full"
                    onValueChange={handleTabChange}
                  >
                    <div className="px-4 pt-2">
                      <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                        <TabsTrigger value="code">Code Submission</TabsTrigger>
                        <TabsTrigger value="results">Test Results</TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="code" className="p-4 pt-2">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 overflow-auto max-h-[300px]">
                        <pre className="text-sm font-code">
                          <code className="language-java">{problem.code}</code>
                        </pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="results" className="p-4 pt-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Test Cases Passed:</span>
                          <span className="text-sm">{problem.noTestCasePassed}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Percentage Passed:</span>
                          <span className="text-sm">{problem.percentPassed}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{
                              width: problem.percentPassed === "0%" ? "0%" :
                                problem.percentPassed === "100%" ? "100%" :
                                  problem.percentPassed
                            }}
                          >
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
