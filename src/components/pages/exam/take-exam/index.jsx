"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import "highlight.js/styles/default.css"

import "./styles.css"

// Component imports
import TabNavigation from "./components/left-panel/tab-navigation"
import LeftPanelContent from "./components/left-panel/left-panel-content"
import CodePanel from "./components/right-panel/code-panel"
import TestCasePanel from "./components/right-panel/test-case-panel"
import HeaderOption from "./components/header-option"
import { toast } from "sonner"

export default function TakeExam({
  idExam,
  timeLeft,
  handleBackToProblems,
  problemLink,
  problemTitle,
  problemDescription,
  compileInformation,
  codeStore,
  languageStore,
  onPenalty = null,
  onRun,
  onCodeChange,
  handleChangeProblem,
}) {
  // Panel state
  const [leftSize, setLeftSize] = useState(50)
  const [leftWidth, setLeftWidth] = useState(50)
  const leftPanelRef = useRef(null)
  const [isCompactRight, setIsCompactRight] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  // Code state
  const [code, setCode] = useState(codeStore || compileInformation[0]?.template || "")
  const [language, setLanguage] = useState(languageStore || compileInformation[0]?.language || "")
  const [availableLanguages, setAvailableLanguages] = useState([])
  const [testCases, setTestCases] = useState(compileInformation[0]?.testCases || [])

  // Test case state
  const [activeCase, setActiveCase] = useState("0")
  const [activeResult, setActiveResult] = useState("0")

  // Results state
  const [results, setResults] = useState()
  const [showResult, setShowResult] = useState(false)
  const [isResultActive, setIsResultActive] = useState(false)

  // const [isVisible, setIsVisible] = useState(true)
  // const [warningCount, setWarningCount] = useState(0)
  // const maxWarnings = 0
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden && warningCount < maxWarnings) {
  //       setWarningCount((prev) => prev + 1)
  //       alert(`Warning: Do not switch tabs! Warnings left: ${maxWarnings - (warningCount + 1)}`)
  //     } else if (!document.hidden) {
  //       setIsVisible(true)
  //     }
  //   }

  //   document.addEventListener("visibilitychange", handleVisibilityChange)

  //   return () => {
  //     document.removeEventListener("visibilitychange", handleVisibilityChange)
  //   }
  // }, [warningCount, maxWarnings])

  // useEffect(() => {
  //   if (warningCount >= maxWarnings) {
  //     onPenalty()
  //   }
  // }, [warningCount, maxWarnings])

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if ((event.ctrlKey && (event.key === "c" || event.key === "v")) || event.key === "F12") {
  //       event.preventDefault()
  //       alert("Shortcuts are disabled during the test.")
  //     }
  //   }

  //   const handleRightClick = (event) => {
  //     event.preventDefault()
  //     alert("Right-click is disabled during the test.")
  //   }

  //   window.addEventListener("keydown", handleKeyDown)
  //   window.addEventListener("contextmenu", handleRightClick)

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown)
  //     window.removeEventListener("contextmenu", handleRightClick)
  //   }
  // }, [])

  // Panel resize detection
  useEffect(() => {
    if (leftPanelRef.current?.parentElement) {
      setIsCompactRight(leftPanelRef.current.parentElement.parentElement.offsetWidth - leftWidth <= 46)
    }
  }, [leftWidth])

  useEffect(() => {
    const languages = [...new Set(compileInformation.map((item) => item.language))]
    setCode(codeStore || compileInformation[0]?.template || "")
    setLanguage(languageStore || compileInformation[0]?.language || "")
    setAvailableLanguages(languages)
    setTestCases(compileInformation[0]?.testCases || [])
    setActiveCase("0")
    setActiveResult("0")
    setShowResult(false)
    setIsResultActive(false)
  }, [compileInformation])

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

  // Code execution handlers
  const handleCodeChange = (newCode) => {
    onCodeChange(newCode, language, problemLink)
    setCode(newCode)
  }

  const handleLanguageChange = (newLanguage) => {
    const template = compileInformation.find((lang) => lang.language === newLanguage)
    setLanguage(newLanguage)
    setCode(template?.template || "")
    setTestCases(template?.testCases || [])
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      const result = await onRun(code, language, problemLink)
      setResults(result)
      setShowResult(true)
      setIsResultActive(true)
      setActiveResult("0")
    } catch (e) {
      toast.error("Compile error: " + e.message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <HeaderOption
        handleBack={handleBackToProblems}
        onRun={handleRunCode}
        timeLeft={timeLeft}
        isRunning={isRunning}
        handleChangeProblem={handleChangeProblem}
      />

      <div className="flex-1 p-2 bg-bg-primary/50">
        <PanelGroup direction="horizontal" onLayout={(sizes) => setLeftSize(sizes[0])}>
          {/* Left Panel */}
          <Panel className="min-w-[40px] overflow-auto bg-background rounded-md" defaultSize={50}>
            <div ref={leftPanelRef} className="h-full overflow-hidden">
              <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[40px]" : "")}>
                <TabNavigation isCompact={isCompactLeft} />

                <LeftPanelContent isCompact={isCompactLeft} title={problemTitle} description={problemDescription} />
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
                  language={language || ""}
                  onLanguageChange={handleLanguageChange}
                  availableLanguages={availableLanguages}
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

