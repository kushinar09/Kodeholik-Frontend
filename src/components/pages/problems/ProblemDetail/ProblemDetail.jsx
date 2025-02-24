"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { FileText, Edit, Lightbulb, CheckCircle, Play, ListChecksIcon, Upload, Bug, Plus, RotateCcw, Copy, Check } from "lucide-react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { Button } from "@/components/ui/button"
import { LOGO } from "@/lib/constants"

import "./styles.css"
import CodeEditor from "../../../common/editor-code/CodeEditor"
import { getProblemDescription, getProblemInitCode } from "@/lib/api/problem_api"
import { useParams } from "react-router-dom"
import { marked } from "marked"
import { runCode, submitCode } from "@/lib/api/code_api"
import { useAuth } from "@/context/AuthProvider"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

//highlight.js
import hljs from "highlight.js"
import "highlight.js/styles/default.css"

export default function ProblemDetail() {
  const { id } = useParams()
  const [leftSize, setLeftSize] = useState(50)
  const [activeTab, setActiveTab] = useState("description")
  const [leftWidth, setLeftWidth] = useState(0)
  const leftPanelRef = useRef(null)
  const [isCompactRight, setIsCompactRight] = useState(false)
  const [description, setDescription] = useState("")
  const [initCode, setInitCode] = useState("")
  const [code, setCode] = useState(initCode || "")

  const { apiCall } = useAuth()

  const [activeCase, setActiveCase] = useState("0")
  const [activeResult, setActiveResult] = useState("0")
  const [testCases, setTestCases] = useState([])

  const [results, setResults] = useState()
  const [showResult, setShowResult] = useState(false)

  const [showSubmited, setShowSubmitted] = useState(false)
  const [submitted, setSubmitted] = useState()

  const [isSubmittedActive, setIsSubmittedActive] = useState(false)
  const [isResultActive, setIsResultActive] = useState(false)

  const [isExpanded, setIsExpanded] = useState(false)

  const [copied, setCopied] = useState(false)

  function formatValue(value) {
    if (typeof value === "number") {
      return value.toString()
    }

    if (typeof value === "string") {
      return `"${value}"`
    }

    if (Array.isArray(value)) {
      return `[${value.map(item => formatValue(item)).join(", ")}]`
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false"
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2)
    }

    if (typeof value === "symbol" || typeof value === "undefined") {
      return String(value)
    }

    return value
  }

  const handleCopyClipBoard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy!", err)
    }
  }

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
        hljs.highlightBlock(block)
    })
  }, [submitted])

  useEffect(() => {
    setCopied(false)
  }, [isSubmittedActive])

  useEffect(() => {
    if (leftPanelRef.current?.parentElement) {
      setIsCompactRight(leftPanelRef.current.parentElement.parentElement.offsetWidth - leftWidth <= 46)
    }
  }, [leftWidth])

  useEffect(() => {
    if (!leftPanelRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setLeftWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(leftPanelRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const isCompactLeft = leftWidth <= 40

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "editorial", label: "Editorial", icon: Edit },
    { id: "solutions", label: "Solutions", icon: Lightbulb },
    { id: "submissions", label: "Submissions", icon: CheckCircle }
  ]

  const handleCodeChange = (newCode) => {
    setCode(newCode)
    // console.log("Updated Code:", newCode)
  }

  useEffect(() => {
    const fetchProblemDescription = async () => {
      if (!id) {
        // TODO: Redirect to 404 page
      }
      const result = await getProblemDescription(id)
      if (result.status && result.data) {
        setDescription(result.data.description)
      } else {
        // TODO: Redirect to 404 page
      }
    }

    const fetchProblemInitCode = async () => {
      if (!id) {
        // TODO: Redirect to 404 page
      }
      const result = await getProblemInitCode(id, "Java")
      if (result.status && result.data) {
        setInitCode(result.data.template)
        setCode(result.data.template)
        setTestCases(result.data.testCases)
      } else {
        // TODO: Redirect to 404 page
      }
    }
    fetchProblemDescription()
    fetchProblemInitCode()

  }, [id])

  async function RunCode() {
    const result = await runCode(apiCall, id, code, "Java")
    // console.log(result)
    setResults(result)
    setShowResult(true)
    setIsResultActive(true)
  }

  async function SubmitCode() {
    setCopied(false)
    const result = await submitCode(apiCall, id, code, "Java")
    // console.log(result)
    setSubmitted(result)
    setShowSubmitted(true)
    setIsSubmittedActive(true)
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="relative h-12 w-full bg-bg-primary/50">
        <nav className="h-full w-full bg-bg-card flex items-center px-4">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 font-medium text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-md">
                <LOGO className="size-8" />
              </div>
            </a>
            <Button variant="ghost" className="w-fit p-2 px-3 bg-bg-primary/80 text-input-text">
              <ListChecksIcon className="w-6 h-6" />
              <span className="text-sm font-bold pl-2">Problem List</span>
            </Button>
          </div>
        </nav>

        {/* Centered Button List */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
          <Button variant="ghost" title="Debug" size="icon" className="h-8 w-8 bg-button-primary hover:bg-button-hover text-black transition">
            <Bug className="h-4 w-4" />
          </Button>
          <Button onClick={RunCode} variant="ghost" title="Run" className="h-8 bg-button-primary hover:bg-button-hover text-black transition">
            <Play className="h-4 w-4" />
            Run
          </Button>
          <Button onClick={SubmitCode} title="Submit" className="h-8 bg-button-primary hover:bg-button-hover text-black text-sm transition">
            <Upload className="size-4" />
            Submit
          </Button>
        </div>
      </div>

      <div className="flex-1 p-2 bg-bg-primary/50">
        <PanelGroup direction="horizontal" onLayout={(sizes) => setLeftSize(sizes[0])}>
          {/* Left Panel */}
          <Panel className="min-w-[40px] overflow-auto bg-background rounded-md" defaultSize={50}>
            <div ref={leftPanelRef} className="h-full overflow-hidden">
              <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[40px]" : "")}>
                <div className={cn("p-1 h-[40px] w-full bg-bg-card flex relative overflow-auto no-scrollbar", isCompactLeft ? "flex-col h-full space-y-4" : "flex-row space-x-4")}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "rounded p-2 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors",
                        activeTab === tab.id && "bg-primary text-primary-foreground",
                        isCompactLeft ? "flex-col w-[32px]" : "flex-row justify-start h-[32px]"
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "w-4 h-5",
                          activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm transition-all duration-200 subpixel-antialiased",
                          activeTab === tab.id ? "font-bold" : "text-muted-foreground",
                          isCompactLeft ? "writing-mode-vertical" : ""
                        )}
                      >
                        {tab.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className={cn("p-4 overflow-auto flex-1", isCompactLeft ? "hidden" : "")}>
                  {activeTab === "description" && (
                    <div className="prose dark:prose-invert min-w-[420px]">
                      <h2 className="text-xl font-bold mb-4">Problem Description</h2>
                      <div>
                        <div
                          className="markdown prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: marked(description) }}
                        />
                      </div>
                    </div>
                  )}
                  {activeTab === "editorial" && <div>Editorial content</div>}
                  {activeTab === "solutions" && <div>Solutions content</div>}
                  {activeTab === "submissions" && <div>Submissions content</div>}
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="splitter splitter_vert relative w-1.5 transition-colors" />

          {/* Right Panel Group */}
          <Panel className="min-w-[40px] overflow-auto">
            <PanelGroup direction="vertical">
              {/* Right Top Panel */}
              <Panel className="min-h-[40px] rounded-md overflow-hidden">
                <div className="h-full bg-background flex flex-col">
                  <div className={cn("bg-bg-card flex items-center p-1 relative h-[40px] overflow-auto no-scrollbar", isCompactRight ? "flex-col h-full space-y-4" : "flex-row space-x-4")}>
                    <div onClick={() => setIsSubmittedActive(false)}
                      className={cn(
                        "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
                        isCompactRight ? "flex-col w-full" : "flex-row justify-start h-[32px]",
                        !isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
                      )}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>

                      <span
                        className={cn(
                          "text-sm transition-all duration-200 subpixel-antialiased",
                          isCompactRight ? "writing-mode-vertical" : ""
                        )}
                      >
                        Code
                      </span>
                    </div>
                    {showSubmited && (
                      <>
                        <div onClick={() => setIsSubmittedActive(true)}
                          className={cn(
                            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
                            isCompactRight ? "flex-col w-full mt-4" : "ms-4 flex-row justify-start h-[32px]",
                            isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
                          )}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />  <rect x="7" y="7" width="3" height="9" />  <rect x="14" y="7" width="3" height="5" /></svg>
                          <span
                            className={cn(
                              "text-sm transition-all duration-200 subpixel-antialiased",
                              isCompactRight ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
                            )}
                          >
                            Submitted
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={cn("overflow-auto flex-1", isCompactRight ? "flex justify-center hidden" : "")}>
                    <div className="min-w-[420px] h-full">
                      {!isSubmittedActive && initCode &&
                        <CodeEditor initialCode={code} onChange={handleCodeChange} />
                      }
                      {isSubmittedActive &&
                        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
                          {/* Status Bar */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {submitted && submitted.status !== "Failed" &&
                                <div>
                                  <span className="text-lg text-text-success">Accepted</span>
                                </div>
                              }
                              {submitted && submitted.status && submitted.status !== "Success" &&
                                <div>
                                  <span className="text-lg text-text-error">{submitted.status}</span>
                                </div>
                              }
                              {submitted.noTestcase != null && submitted.noSuccessTestcase != null &&
                                <span className="text-sm text-gray-500">{submitted.noSuccessTestcase}/{submitted.noTestcase} testcases passed</span>
                              }
                              {submitted.noTestcase != null && submitted.noSuccessTestcase == null &&
                                <span className="text-sm text-gray-500">{submitted.noTestcase}/{submitted.noTestcase} testcases passed</span>
                              }
                            </div>
                          </div>

                          {submitted.status && submitted.status !== "Failed" &&
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex items-baseline justify-between">
                                    <div>
                                      <div className="text-2xl font-bold">{submitted.executionTime ? submitted.executionTime : "N/A"} ms</div>
                                      <div className="text-sm text-muted-foreground">Runtime</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardContent className="pt-6">
                                  <div className="flex items-baseline justify-between">
                                    <div>
                                      <div className="text-2xl font-bold">{submitted.memoryUsage ? submitted.memoryUsage : "N/A"} mb</div>
                                      <div className="text-sm text-muted-foreground">Memory</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          }

                          {submitted.status !== "Success" && submitted.message &&
                            <div className="rounded-lg border-t border-red-200 bg-red-50 p-4">
                              <pre className="text-sm text-red-600 font-mono">{submitted.message}</pre>
                            </div>
                          }

                          {submitted.inputWrong &&
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label className="text-sm text-black">Input =</Label>

                                {submitted.inputWrong.inputs.map((param, index) => (
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
                                <div className={`rounded bg-input-bg text-input-text p-2 ${submitted.inputWrong.status === "Failed" ? "text-text-error" : "text-text-success"}`}>{formatValue(submitted.inputWrong.actualOutput)}</div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-black">Expected Output =</Label>
                                <div className="rounded bg-input-bg text-input-text p-2">{formatValue(submitted.inputWrong.expectedOutput)}</div>
                              </div>
                            </div>
                          }

                          {/* Code Display */}
                          <Card>
                            <CardContent className="p-0">
                              <div className="border-b border-border p-4 py-1 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Code</span>
                                  <span className="text-sm text-muted-foreground">|</span>
                                  <span className="text-sm">Java</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => handleCopyClipBoard(code)}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                  </Button>
                                  {/* TODO: Copy to code editor */}
                                  <Button variant="ghost" size="icon">
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div
                                className={cn(
                                  "overflow-hidden transition-all duration-300",
                                  isExpanded ? "h-auto" : "max-h-[200px]"
                                )}
                              >
                                <pre className="text-sm font-mono">
                                  <code>
                                    {submitted.code}
                                  </code>
                                </pre>
                              </div>
                              <div className="border-t border-border p-2 text-center">
                                <Button variant="ghost" className="text-sm text-muted-foreground" onClick={() => setIsExpanded(!isExpanded)}>
                                  {isExpanded ? "View less" : "View more"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="splitter splitter_horz relative h-1.5 transition-colors" />

              {/* Right Bottom Panel */}
              <Panel className="min-h-[40px] overflow-auto rounded-md">
                <div className="h-full bg-background flex flex-col">
                  <div
                    className={cn(
                      "bg-bg-card flex items-center p-1 relative h-[40px] overflow-auto no-scrollbar",
                      isCompactRight ? "flex-col h-full space-y-4" : "flex-row space-x-4"
                    )}
                  >
                    <div onClick={() => setIsResultActive(false)}
                      className={cn(
                        "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
                        isCompactRight ? "flex-col w-full" : "flex-row justify-start h-[32px]",
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
                          isCompactRight ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
                        )}
                      >
                        Test case
                      </span>
                    </div>
                    {showResult && (
                      <>
                        <div onClick={() => setIsResultActive(true)}
                          className={cn(
                            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
                            isCompactRight ? "flex-col w-full" : "flex-row justify-start h-[32px]",
                            isResultActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
                          )}
                        >
                          <svg className="h-5 w-5" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M14 3v4a1 1 0 0 0 1 1h4" />  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />  <path d="M9 15l2 2l4 -4" /></svg>
                          <span
                            className={cn(
                              "text-sm transition-all duration-200 subpixel-antialiased",
                              isCompactRight ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
                            )}
                          >
                            Result
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={cn("overflow-auto flex-1", isCompactRight ? "flex justify-center hidden" : "")}>
                    <div className="space-y-4 min-w-[420px]">
                      {!isResultActive &&
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
                          {testCases.length > 0 &&
                            <div className="space-y-4">
                              {testCases[activeCase].input.map((param, index) => (
                                <div key={index} className="space-y-2">
                                  <Label className="text-sm text-black">{param.name} =</Label>
                                  <div className="rounded bg-input-bg text-input-text p-2">{formatValue(param.value)}</div>
                                </div>
                              ))}
                              <div className="space-y-2">
                                <Label className="text-sm text-black">Expected Output =</Label>
                                <div className="rounded bg-input-bg text-input-text p-2">{formatValue(testCases[activeCase].expectedOutput)}</div>
                              </div>
                            </div>
                          }
                        </div>
                      }

                      {isResultActive &&
                        <div className="w-full space-y-4 p-4">
                          {results && results.accepted &&
                            <div>
                              <span className="text-lg text-text-success">Accepted</span>
                            </div>
                          }
                          {results && !results.accepted &&
                            <div>
                              <span className="text-lg text-text-error">Failed</span>
                            </div>
                          }

                          {results && results.results && results.results.length > 0 &&
                            <div className="flex items-center gap-2">
                              {results.results.map((param, index) => (
                                <Button
                                  key={index}
                                  variant={activeResult === index ? "" : "ghost"}
                                  className={`h-8 font-bold ${activeResult === index ? "bg-button-primary hover:bg-button-hover " : "hover:bg-button-primary"}`}
                                  onClick={() => setActiveResult(index)}
                                >
                                  {param.status !== "Success" &&
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                  }
                                  Case {Number.parseInt(index) + 1}
                                </Button>
                              ))}
                            </div>
                          }

                          {/* Test Case Content */}
                          {results && results.results && results.results.length > 0 &&
                            <>
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
                                  <div className={`rounded bg-input-bg text-input-text p-2 ${results.results[activeResult].status === "Failed" ? "text-text-error" : "text-text-success"}`}>{formatValue(results.results[activeResult].actualOutput)}</div>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-black">Expected Output =</Label>
                                  <div className="rounded bg-input-bg text-input-text p-2">{formatValue(results.results[activeResult].expectedOutput)}</div>
                                </div>
                              </div>
                            </>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div >
    </div >
  )
}

