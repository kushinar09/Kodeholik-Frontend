"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { formatValue } from "@/lib/utils/format-utils"

export default function TestCasePanel({
  isResultActive,
  setIsResultActive,
  isCompact,
  testCases,
  activeCase,
  setActiveCase,
  results,
  showResult,
  activeResult,
  setActiveResult
}) {
  return (
    <div className="h-full bg-background flex flex-col">
      <div
        className={cn(
          "bg-bg-card flex items-center p-1 relative h-[40px] overflow-auto no-scrollbar",
          isCompact ? "flex-col h-full space-y-4" : "flex-row space-x-4"
        )}
      >
        <div
          onClick={() => setIsResultActive(false)}
          className={cn(
            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
            isCompact ? "flex-col w-full" : "flex-row justify-start h-[32px]",
            !isResultActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
          )}
        >
          <svg
            className="h-5 w-5"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <path d="M3.5 5.5l1.5 1.5l2.5 -2.5" />
            <path d="M3.5 11.5l1.5 1.5l2.5 -2.5" />
            <path d="M3.5 17.5l1.5 1.5l2.5 -2.5" />
            <line x1="11" y1="6" x2="20" y2="6" />
            <line x1="11" y1="12" x2="20" y2="12" />
            <line x1="11" y1="18" x2="20" y2="18" />
          </svg>
          <span
            className={cn(
              "text-sm transition-all duration-200 subpixel-antialiased",
              isCompact ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
            )}
          >
            Test case
          </span>
        </div>
        {showResult && (
          <div
            onClick={() => setIsResultActive(true)}
            className={cn(
              "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
              isCompact ? "flex-col w-full" : "flex-row justify-start h-[32px]",
              isResultActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
            )}
          >
            <svg
              className="h-5 w-5"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <path stroke="none" d="M0 0h24v24H0z" /> <path d="M14 3v4a1 1 0 0 0 1 1h4" />{" "}
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />{" "}
              <path d="M9 15l2 2l4 -4" />
            </svg>
            <span
              className={cn(
                "text-sm transition-all duration-200 subpixel-antialiased",
                isCompact ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
              )}
            >
              Result
            </span>
          </div>
        )}
      </div>
      <div className={cn("overflow-auto flex-1", isCompact ? "flex justify-center hidden" : "")}>
        <div className="space-y-4 min-w-[420px]">
          {!isResultActive && (
            <div className="w-full space-y-4 p-4">
              {/* Test Case Tabs */}
              <div className="flex items-center gap-2">
                {Object.keys(testCases).map((caseKey) => (
                  <Button
                    key={caseKey}
                    variant={activeCase === caseKey ? "" : "ghost"}
                    className={`h-8 font-bold ${activeCase === caseKey ? "bg-button-primary hover:bg-button-hover " : "hover:bg-button-primary"}`}
                    onClick={() => setActiveCase(caseKey)}
                  >
                    Case {Number.parseInt(caseKey) + 1}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-button-primary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Test Case Content */}
              {testCases.length > 0 && (
                <div className="space-y-4">
                  {testCases[activeCase].input.map((param, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm text-black">{param.name} =</Label>
                      <div className="rounded bg-input-bg text-input-text p-2">{formatValue(param.value)}</div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label className="text-sm text-black">Expected Output =</Label>
                    <div className="rounded bg-input-bg text-input-text p-2">
                      {formatValue(testCases[activeCase].expectedOutput)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isResultActive && (
            <div className="w-full space-y-4 p-4">
              {results && results.status.toLowerCase() === "success" && (
                <div>
                  <span className="text-lg text-text-success">Accepted</span>
                </div>
              )}
              {results && results.status.toLowerCase() === "failed" && (
                <div>
                  <span className="text-lg text-text-error">Failed</span>
                </div>
              )}

              {results && results.status && results.status.toLowerCase() === "failed" && results.message && (
                <div className="rounded-lg border-t border-red-200 bg-red-50 p-4">
                  <pre className="text-sm text-red-600 break-words whitespace-pre-wrap">{results.message}</pre>
                </div>
              )}

              {results && results.results && results.results.length > 0 && (
                <div className="flex items-center gap-2">
                  {results.results.map((result, index) => (
                    <Button
                      key={index}
                      variant={activeResult === index.toString() ? "" : "ghost"}
                      className={`h-8 font-bold ${activeResult === index.toString() ? "bg-button-primary hover:bg-button-hover " : "hover:bg-button-primary"}`}
                      onClick={() => setActiveResult(index.toString())}
                    >
                      {result.status !== "Success" && <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>}
                      Case {Number.parseInt(index) + 1}
                    </Button>
                  ))}
                </div>
              )}

              {/* Test Case Content */}
              {results && results.results && results.results.length > 0 && activeResult && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-black">Input =</Label>

                    {results.results[activeResult].inputs.map((param, index) => (
                      <div key={index} className="rounded bg-input-bg text-input-text p-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-input-text">{param.name} =</Label>
                          <div className="text-md text-input-text font-bold">{formatValue(param.value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-black">Output =</Label>
                    <div
                      className={`rounded bg-input-bg text-input-text p-2 ${results.results[activeResult].status === "Failed" ? "text-text-error" : "text-text-success"}`}
                    >
                      {formatValue(results.results[activeResult].actualOutput)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-black">Expected Output =</Label>
                    <div className="rounded bg-input-bg text-input-text p-2">
                      {formatValue(results.results[activeResult].expectedOutput)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

