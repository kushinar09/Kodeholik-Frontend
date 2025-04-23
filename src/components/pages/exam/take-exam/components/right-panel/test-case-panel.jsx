"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { formatValue } from "@/lib/utils/format-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

// Function to create a deep copy of an object
const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

// Function to format array values on a single line
const formatArrayInline = (value) => {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`
  } else if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsedArray = JSON.parse(value)
      if (Array.isArray(parsedArray)) {
        return `[${parsedArray.join(", ")}]`
      }
    } catch (e) {
      // If parsing fails, return the original string
    }
    return value
  }
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)
}

// Auto-growing input component
const AutoGrowInput = ({ value, onChange, className }) => {
  const inputRef = useRef(null)

  const updateHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.max(40, inputRef.current.scrollHeight)}px`
    }
  }

  useEffect(() => {
    if (!inputRef.current) return

    try {
      const selection = window.getSelection()
      const hasRange = selection && selection.rangeCount > 0
      let startOffset = null
      let startNode = null

      if (hasRange) {
        const range = selection.getRangeAt(0)
        startOffset = range.startOffset
        startNode = range.startContainer
      }

      // Only update content if needed
      if (inputRef.current.textContent !== value) {
        inputRef.current.textContent = value

        if (hasRange && startNode && inputRef.current.contains(startNode)) {
          const newRange = document.createRange()
          newRange.setStart(startNode, Math.min(startOffset, startNode.length))
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
    } catch (error) {
      toast.warning("Caret restore skipped:", error.message)
      inputRef.current.textContent = value // fallback
    }

    updateHeight()
  }, [value])

  const handleInput = (e) => {
    const newValue = e.currentTarget.textContent
    onChange(newValue)
  }

  return (
    <pre
      ref={inputRef}
      contentEditable
      className={cn(
        "w-full rounded bg-input-bg text-input-text p-2 min-h-[40px] overflow-hidden outline-none",
        className
      )}
      onInput={handleInput}
      suppressContentEditableWarning={true}
    />
  )
}

export default function TestCasePanel({
  isResultActive,
  setIsResultActive,
  isCompact,
  testCases,
  activeCase,
  customTestCases,
  setCustomTestCases,
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
      <div className={cn("overflow-auto flex-1", isCompact ? "justify-center hidden" : "")}>
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
                <TooltipProvider>
                  {customTestCases.map((_, index) => (
                    <Tooltip key={`custom-${index}`} >
                      <TooltipTrigger asChild>
                        <div className="group">
                          <Button
                            variant={activeCase === `custom-${index}` ? "" : "ghost"}
                            className={`relative h-8 font-bold ${activeCase === `custom-${index}` ? "bg-blue-300 hover:bg-blue-400" : "hover:bg-blue-400"}`}
                            onClick={() => setActiveCase(`custom-${index}`)}
                          >
                            Case {testCases.length + index + 1}
                            <button
                              className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full size-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                const newCustomTestCases = [...customTestCases]
                                newCustomTestCases.splice(index, 1)
                                setCustomTestCases(newCustomTestCases)

                                if (index === 0 && activeCase === `custom-${index}`) {
                                  setActiveCase((testCases.length - 1).toString())
                                } else if (activeCase === `custom-${index}`) {
                                  setActiveCase(`custom-${index - 1}`)
                                } else if (activeCase.startsWith("custom-") && activeCase.split("-")[1] > index) {
                                  setActiveCase(`custom-${Number.parseInt(activeCase.split("-")[1]) - 1}`)
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="mb-2 bg-white text-black rounded-md shadow-md">
                        <p>This is a custom test case. When executed, it returns only the output.</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
                {customTestCases.length < 5 &&
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-blue-400"
                    onClick={() => {
                      if (testCases.length > 0) {
                        // Get a random test case from the fixed test cases as a template
                        const randomIndex = Math.floor(Math.random() * testCases.length)
                        // Create a deep copy to ensure it's completely independent
                        const randomTestCase = deepCopy(testCases[randomIndex])

                        // Format arrays for display
                        randomTestCase.input.forEach((param) => {
                          if (Array.isArray(param.value)) {
                            // Keep the original array structure but it will be formatted inline when displayed
                            param.value = [...param.value]
                          }
                        })

                        // Add it to custom test cases
                        setCustomTestCases([...customTestCases, randomTestCase])

                        // Set it as active
                        setActiveCase(`custom-${customTestCases.length}`)
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              </div>

              {/* Test Case Content */}
              {/* Test Case Content */}
              {activeCase && (
                <div className="space-y-4">
                  {activeCase.startsWith("custom-") ? (
                    // Custom test case (editable values only, not names)
                    <>
                      {customTestCases[Number.parseInt(activeCase.split("-")[1])].input.map((param, paramIndex) => (
                        <div key={paramIndex} className="space-y-2">
                          <Label className="text-sm text-black">{param.name} =</Label>
                          <AutoGrowInput
                            value={formatArrayInline(param.value)}
                            onChange={(newValue) => {
                              // Create a deep copy of the entire customTestCases array
                              const newCustomTestCases = deepCopy(customTestCases)

                              // Update only the specific test case and parameter
                              const caseIndex = Number.parseInt(activeCase.split("-")[1])
                              newCustomTestCases[caseIndex].input[paramIndex].value = newValue

                              // Update state with the new array
                              setCustomTestCases(newCustomTestCases)
                            }}
                          />
                        </div>
                      ))}
                      {/* No expectedOutput section for custom test cases */}
                    </>
                  ) : (
                    // Fixed test case (read-only)
                    <>
                      {testCases.length > 0 &&
                        testCases[activeCase]?.input.map((param, index) => (
                          <div key={index} className="space-y-2">
                            <Label className="text-sm text-black">{param.name} =</Label>
                            <div className="rounded bg-input-bg text-input-text p-2">{formatValue(param.value)}</div>
                          </div>
                        ))}
                      {testCases.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-black">Expected Output =</Label>
                          <div className="rounded bg-input-bg text-input-text p-2">
                            {formatValue(testCases[activeCase]?.expectedOutput)}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {isResultActive && !results?.error && (
            <div className="w-full space-y-4 p-4">
              {results.status && results.status.toLowerCase() === "success" && (
                <div>
                  <span className="text-lg font-semibold text-text-success">Accepted</span>
                </div>
              )}
              {results.status && results.status.toLowerCase() === "failed" && (
                <div>
                  <span className="text-lg font-semibold text-text-error">Failed</span>
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
                      className={`h-8 font-bold 
                        ${activeResult === index.toString()
                          ? (result.status ? "bg-button-primary hover:bg-button-hover "
                            : "bg-blue-300 hover:bg-blue-400 ")
                          : ((result.status ? "hover:bg-button-primary" : "hover:bg-blue-300"))
                        }`}
                      onClick={() => setActiveResult(index.toString())}
                    >
                      {result.status && result.status.toLowerCase() === "success" && <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span>}
                      {result.status && result.status.toLowerCase() === "failed" && <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>}
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
                  {results.results[activeResult].expectedOutput &&
                    <div className="space-y-2">
                      <Label className="text-sm text-black">Expected Output =</Label>
                      <div className="rounded bg-input-bg text-input-text p-2">
                        {formatValue(results.results[activeResult].expectedOutput)}
                      </div>
                    </div>
                  }
                </div>
              )}
            </div>
          )}

          {isResultActive && results?.error && (
            <div className="w-full space-y-4 p-4">
              <div>
                <span className="text-lg font-semibold text-text-error">Failed</span>
              </div>

              <div className="rounded-lg border-t border-red-200 bg-red-50 p-4">
                <pre className="text-sm text-red-600 break-words whitespace-pre-wrap">{results?.testCaseValue ? results.testCaseValue + " - " : ""}{results?.message}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

