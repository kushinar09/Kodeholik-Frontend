"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { FileText, Edit, Lightbulb, CheckCircle, Play, Settings, Bell, MessageSquare, ListChecksIcon, Upload, Bug, Code, Code2, Dock } from "lucide-react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

import { Button } from "@/components/ui/button"
import { LOGO } from "@/lib/constants"

import "./styles.css"
import CodeEditor from "../../../common/editor-code/CodeEditor"
import { getProblemDescription, getProblemInitCode } from "@/lib/api/problem_api"
import { useParams } from "react-router-dom"
import { marked } from "marked"
import { runCode, submitCode } from "@/lib/api/code_api"


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

  useEffect(() => {
    if (leftPanelRef.current?.parentElement) {
      setIsCompactRight(leftPanelRef.current.parentElement.parentElement.offsetWidth - leftWidth <= 42)
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

  const isCompactLeft = leftWidth <= 36

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
      } else {
        // TODO: Redirect to 404 page
      }
    }
    fetchProblemDescription()
    fetchProblemInitCode()
  }, [id])

  async function RunCode() {
    const result = await runCode(id, code, "Java")
    console.log(result)
  }

  async function SubmitCode() {
    const result = await submitCode(id, code, "Java")
    console.log(result)
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
          <Panel className="min-w-[36px] overflow-auto bg-background rounded-md" defaultSize={50}>
            <div ref={leftPanelRef} className="h-full overflow-hidden">
              <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[36px]" : "")}>
                <div className={cn("h-[36px] w-full bg-bg-card flex relative overflow-auto no-scrollbar", isCompactLeft ? "flex-col h-full" : "flex-row")}>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 p-4 hover:bg-primary hover:text-primary-foreground transition-colors",
                        activeTab === tab.id && "bg-primary text-primary-foreground",
                        isCompactLeft ? "flex-col w-full py-4" : "flex-row justify-start h-[36px]"
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "w-5 h-5",
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
                          className="markdown prose prose-sm dark:prose-invert max-w-none p-4"
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
          <Panel className="min-w-[36px] overflow-auto">
            <PanelGroup direction="vertical">
              {/* Right Top Panel */}
              <Panel className="min-h-[36px] rounded-md overflow-hidden">
                <div className="h-full bg-background flex flex-col">
                  <div className={cn("bg-bg-card flex items-center relative h-[36px] overflow-x-hidden", isCompactRight ? "flex-col h-full" : "flex-row")}>
                    <div
                      className={cn(
                        "flex items-center gap-2 text-primary",
                        isCompactRight ? "flex-col w-full mt-4" : "ms-4 flex-row justify-start h-[36px]"
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
                  </div>
                  <div className={cn("overflow-auto flex-1", isCompactRight ? "flex justify-center hidden" : "")}>
                    <div className="font-mono min-w-[420px] h-full">
                      {initCode && <CodeEditor initialCode={initCode} onChange={handleCodeChange} />}
                    </div>
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="splitter splitter_horz relative h-1.5 transition-colors" />

              {/* Right Bottom Panel */}
              <Panel className="min-h-[36px] overflow-auto rounded-md">
                <div className="h-full bg-background flex flex-col">
                  <div className={cn("bg-bg-card flex items-center relative h-[36px] overflow-x-hidden", isCompactRight ? "flex-col h-full" : "flex-row")}>
                    <div
                      className={cn(
                        "flex items-center gap-2 text-primary",
                        isCompactRight ? "flex-col w-full mt-4" : "ms-4 flex-row justify-start h-[36px]"
                      )}
                    >
                      <svg className="h-5 w-5" width="24" height="24" viewBox="0 0 24 24"
                        strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"
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
                  </div>
                  <div className={cn("overflow-auto flex-1", isCompactRight ? "flex justify-center hidden" : "")}>
                    <div className="space-y-4 m-4 min-w-[420px]">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="font-mono text-sm">
                          Input: nums = [2,7,11,15], target = 9{"\n"}
                          Output: [0,1]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

