"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import { useAuth } from "@/providers/AuthProvider"
import "highlight.js/styles/default.css"

import "./styles.css"

// API imports
import { getProblemDescription, getProblemInitCode } from "@/lib/api/problem_api"
import { runCode } from "@/lib/api/code_api"

// Component imports
import TabNavigation from "./components/left-panel/tab-navigation"
import LeftPanelContent from "./components/left-panel/left-panel-content"
import CodePanel from "./components/right-panel/code-panel"
import TestCasePanel from "./components/right-panel/test-case-panel"
import HeaderOption from "./components/header-option"

export default function TakeExam() {
  const { id } = useParams()
  const { apiCall } = useAuth()

  const [problemId, setProblemId] = useState(0)

  // Panel state
  const [leftSize, setLeftSize] = useState(50)
  const [leftWidth, setLeftWidth] = useState(0)
  const leftPanelRef = useRef(null)
  const [isCompactRight, setIsCompactRight] = useState(false)

  // Problem data state
  const [description, setDescription] = useState(null)

  // Code state
  const [code, setCode] = useState("")
  const [testCases, setTestCases] = useState([])

  // Test case state
  const [activeCase, setActiveCase] = useState("0")
  const [activeResult, setActiveResult] = useState("0")

  // Results state
  const [results, setResults] = useState()
  const [showResult, setShowResult] = useState(false)
  const [isResultActive, setIsResultActive] = useState(false)

  // Panel resize detection
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

  const fetchProblemDescription = async () => {
    if (!id) return
    if (!description) {
      const result = await getProblemDescription(id)
      if (result.status && result.data) {
        setDescription(result.data)
        setProblemId(result.data.id)
      }
    }
  }
  // const [alertCount, setAlertCount] = useState(0)
  // const maxAlerts = 3

  // const handleVisibilityChange = () => {
  //   if (document.hidden) {
  //     if (alertCount < maxAlerts) {
  //       alert(`Stay on this tab! Changed ${alertCount + 1} times. Over ${maxAlerts} times = 0 points!`)
  //       setAlertCount(prev => prev + 1)
  //     } else {
  //       console.warn("Too many tab changes! Consider logging this event or taking action.")
  //     }
  //   }
  // }

  // const handleFullScreen = () => {
  //   if (!document.fullscreenElement) {
  //     document.documentElement.requestFullscreen().catch(err => {
  //       console.error("Fullscreen request failed:", err)
  //     })
  //   }
  // }

  // useEffect(() => {
  //   document.addEventListener("visibilitychange", handleVisibilityChange)
  //   window.addEventListener("blur", () => window.focus())
  //   document.addEventListener("fullscreenchange", () => {
  //     if (!document.fullscreenElement) {
  //       alert("Full-screen mode is required for this test.")
  //       handleFullScreen()
  //     }
  //   })

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange)
  //     window.removeEventListener("blur", () => window.focus())
  //     document.removeEventListener("fullscreenchange", handleFullScreen)
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [alertCount])

  const [isVisible, setIsVisible] = useState(true)
  const [warningCount, setWarningCount] = useState(0)
  const maxWarnings = 4
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && warningCount < maxWarnings) {
        setWarningCount((prev) => prev + 1)
        alert(`Warning: Do not switch tabs! Warnings left: ${maxWarnings - (warningCount + 1)}`)
      } else if (!document.hidden) {
        setIsVisible(true)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [warningCount, maxWarnings]) // Add `warningCount` as dependency to keep track of the latest value

  useEffect(() => {
    if (warningCount >= maxWarnings) {
      // onPenalty()
    }
  }, [warningCount, maxWarnings])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Block Ctrl+C, Ctrl+V, and F12
      if ((event.ctrlKey && (event.key === "c" || event.key === "v")) || event.key === "F12") {
        event.preventDefault()
        alert("Shortcuts are disabled during the test.")
      }
    }

    const handleRightClick = (event) => {
      // Prevent right-click context menu
      event.preventDefault()
      alert("Right-click is disabled during the test.")
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("contextmenu", handleRightClick)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("contextmenu", handleRightClick)
    }
  }, [])

  // Initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return

      // Fetch problem description
      fetchProblemDescription()

      // Fetch initial code template
      const result = await getProblemInitCode(id, "Java")
      if (result.status && result.data) {
        setCode(result.data.template)
        setTestCases(result.data.testCases)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Code execution handlers
  const handleCodeChange = (newCode) => {
    setCode(newCode)
  }

  async function handleRunCode() {
    const result = await runCode(apiCall, id, code, "Java")
    setResults(result)
    setShowResult(true)
    setIsResultActive(true)
    setActiveResult("0")
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderOption onRun={handleRunCode} />

      <div className="flex-1 p-2 bg-bg-primary/50">
        <PanelGroup direction="horizontal" onLayout={(sizes) => setLeftSize(sizes[0])}>
          {/* Left Panel */}
          <Panel className="min-w-[40px] overflow-auto bg-background rounded-md" defaultSize={50}>
            <div ref={leftPanelRef} className="h-full overflow-hidden">
              <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[40px]" : "")}>
                <TabNavigation isCompact={isCompactLeft} />

                <LeftPanelContent
                  id={id}
                  problemId={problemId}
                  isCompact={isCompactLeft}
                  description={description}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="splitter splitter_vert relative w-1.5 transition-colors" />

          {/* Right Panel Group */}
          <Panel className="min-w-[40px] overflow-auto">
            <PanelGroup direction="vertical">
              {/* Right Top Panel - Code Editor */}
              <Panel className="min-h-[40px] rounded-md overflow-hidden">
                <CodePanel
                  isCompact={isCompactRight}
                  code={code}
                  onCodeChange={handleCodeChange}
                />
              </Panel>

              <PanelResizeHandle className="splitter splitter_horz relative h-1.5 transition-colors" />

              {/* Right Bottom Panel - Test Cases */}
              <Panel className="min-h-[40px] overflow-auto rounded-md">
                <TestCasePanel
                  isResultActive={isResultActive}
                  setIsResultActive={setIsResultActive}
                  isCompact={isCompactRight}
                  testCases={testCases}
                  activeCase={activeCase}
                  setActiveCase={setActiveCase}
                  results={results}
                  showResult={showResult}
                  activeResult={activeResult}
                  setActiveResult={setActiveResult}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

