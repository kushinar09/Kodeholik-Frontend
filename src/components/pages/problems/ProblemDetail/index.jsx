"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Link, useLocation, useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import "highlight.js/styles/default.css"

import "./styles.css"

// API imports
import {
  getProblemAvailableLanguages,
  getProblemDescription,
  getProblemEditorial,
  getProblemInitCode,
  getProblemSolutions,
  getProblemSubmission
} from "@/lib/api/problem_api"
import { runCode, submitCode } from "@/lib/api/code_api"

// Component imports
import ProblemHeader from "./components/problem-header-option"
import TabNavigation from "./components/left-panel/tab-navigation"
import LeftPanelContent from "./components/left-panel/left-panel-content"
import CodePanel from "./components/right-panel/code-panel"
import TestCasePanel from "./components/right-panel/test-case-panel"
import { useAuth } from "@/providers/AuthProvider"
import { leftTabEnum } from "./data/data"
import { debounce } from "lodash"
import ShareSolution from "../ShareSolution"
import { toast } from "sonner"
import { GLOBALS } from "@/lib/constants"

export default function ProblemDetail() {
  const { id } = useParams()
  const { submission } = useParams()
  const { solution } = useParams()
  const { apiCall, isAuthenticated } = useAuth()
  const [problemId, setProblemId] = useState(0)
  const location = useLocation()

  const [openedTabEditorial, setOpenedTabEditorial] = useState(false)
  const [openedTabSolution, setOpenedTabSolution] = useState(false)

  // Loading
  const [isLoadingDescription, setIsLoadingDescription] = useState(true)
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(true)
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(true)
  const [isLoadingSubmission, setIsLoadingSubmission] = useState(true)
  const [isLoadingInitCode, setIsLoadingInitCode] = useState(true)

  const [isRunning, setIsRunning] = useState("")

  // Panel state
  const [leftSize, setLeftSize] = useState(50)
  const [leftWidth, setLeftWidth] = useState(0)
  const leftPanelRef = useRef(null)
  const [isCompactRight, setIsCompactRight] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState(submission == null ? (solution == null ? leftTabEnum.description : leftTabEnum.solutions) : leftTabEnum.submissions)

  // Problem data state
  const [description, setDescription] = useState(null)
  const [editorial, setEditorial] = useState(null)
  const [solutions, setSolutions] = useState(null)
  const [submissions, setSubmissions] = useState(null)

  // Code state
  const [importLib, setImportLib] = useState("")
  const [code, setCode] = useState("")
  const [currentCode, setCurrentCode] = useState("")
  const [testCases, setTestCases] = useState([])

  // Test case state
  const [activeCase, setActiveCase] = useState("0")
  const [activeResult, setActiveResult] = useState("0")
  const [customTestCase, setCustomTestCase] = useState([])

  // Results state
  const [results, setResults] = useState()
  const [showResult, setShowResult] = useState(false)
  const [isResultActive, setIsResultActive] = useState(false)

  // Submission state
  const [submitted, setSubmitted] = useState()
  const [showSubmitted, setShowSubmitted] = useState(false)
  const [isSubmittedActive, setIsSubmittedActive] = useState(false)
  const [showSolution, setShowSolution] = useState(solution == null ? false : true)
  // Submission id
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(submission)
  const [currentSolutionId, setCurrentSolutionId] = useState(solution != null ? solution : 0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentSolution, setCurrentSolution] = useState(null)

  useEffect(() => {
    fetchProblemSubmission()
  }, [selectedSubmissionId])
  // Language
  const [availableLanguages, setAvailableLanguages] = useState([])
  const [language, setLanguage] = useState("")

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

  // Data fetching
  const fetchData = (typeData) => {
    if (typeData === leftTabEnum.description) {
      fetchProblemDescription()
    } else if (typeData === leftTabEnum.editorial) {
      if (!openedTabEditorial) {
        fetchProblemEditorial()
        setOpenedTabEditorial(true)
      }
    } else if (typeData === leftTabEnum.solutions) {
      if (!openedTabSolution) {
        fetchProblemSolutions()
        setOpenedTabSolution(true)
      }
    } else if (typeData === leftTabEnum.submissions) {
      fetchProblemSubmission()
    }
  }

  const fetchProblemDescription = async () => {
    if (!id) return
    if (!description) {
      setIsLoadingDescription(true)
      try {
        const result = await getProblemDescription(apiCall, id)
        if (result.status && result.data) {
          setDescription(result.data)
          setProblemId(result.data.id)
        }
      } finally {
        setTimeout(() => setIsLoadingDescription(false), 200)
      }
    }
  }

  const fetchProblemInitCode = async () => {
    if (!id || !language) return
    setIsLoadingInitCode(true)
    try {
      const codeResult = await getProblemInitCode(id, language)
      if (codeResult.status && codeResult.data) {
        setImportLib(codeResult.data.importCommands.join("\n"))
        setCode(codeResult.data.template)
        setCurrentCode(codeResult.data.template)
        setTestCases(codeResult.data.testCases)
      }
    } finally {
      setIsLoadingInitCode(false)
    }
  }

  const fetchProblemAvailableLanguages = async () => {
    if (!id) return
    setIsLoadingInitCode(true)
    try {
      const codeResult = await getProblemAvailableLanguages(id)
      if (codeResult.status && codeResult.data) {
        setAvailableLanguages(codeResult.data)
        setLanguage(codeResult.data[0])
      }
    } finally {
      setIsLoadingInitCode(false)
    }
  }

  const fetchProblemEditorial = async () => {
    if (!id) return
    if (!editorial) {
      setIsLoadingEditorial(true)
      try {
        const result = await getProblemEditorial(apiCall, id)
        if (result.status && result.data) {
          setEditorial(result.data)
        }
      } finally {
        setTimeout(() => setIsLoadingEditorial(false), 200)
      }
    }
  }

  const fetchProblemSolutions = useCallback(
    debounce(
      async (page = 0, size = 10, title = null, languageName = null, sortBy = null, ascending = null, topics = []) => {
        if (!id) return
        if (!solutions || page != null) {
          setIsLoadingSolutions(true)
          try {
            const result = await getProblemSolutions(
              apiCall,
              id,
              page,
              size,
              title,
              languageName,
              sortBy,
              ascending,
              topics
            )
            if (result.status) {
              setSolutions(result.data)
            }
          } finally {
            setTimeout(() => setIsLoadingSolutions(false), 200)
          }
        }
      },
      500
    ),
    []
  )

  const fetchProblemSubmission = async (force = false) => {
    if (!id) return
    if (!submissions || force) {
      setIsLoadingSubmission(true)
      try {
        const result = await getProblemSubmission(apiCall, id)
        if (result.status && result.data) {
          setSubmissions(result.data)
        }
      } finally {
        setTimeout(() => setIsLoadingSubmission(false), 200)
      }
    }
  }

  function onchangeFilterSolutions(param) {
    fetchProblemSolutions(
      param.page,
      param.size,
      param.title,
      param.languageName,
      param.sortBy,
      param.ascending,
      param.topics
    )
  }

  async function onLanguageChange(language) {
    setIsLoadingInitCode(true)
    try {
      const result = await getProblemInitCode(id, language)
      if (result.status && result.data) {
        setImportLib(result.data.importCommands.join("\n"))
        setCode(result.data.template)
        setTestCases(result.data.testCases)
        setLanguage(language)
      } else {
        console.error("Failed to fetch initial code template:", result.message)
      }
    } finally {
      setIsLoadingInitCode(false)
    }
  }

  useEffect(() => {
    document.title = `${description?.title} - ${GLOBALS.APPLICATION_NAME}`
  }, [description])

  // Initial data loading
  useEffect(() => {
    fetchProblemDescription()

    // First fetch available languages, then fetch init code only after language is set
    const initializeCode = async () => {
      await fetchProblemAvailableLanguages()
      // Now that language is set, fetch the initial code
      if (language) {
        fetchProblemInitCode()
      }
    }

    initializeCode()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Add a separate effect to fetch init code when language changes
  useEffect(() => {
    if (language && id) {
      fetchProblemInitCode()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, id])

  // Code execution handlers
  const handleCodeChange = (newCode) => {
    setCurrentCode(newCode)
  }

  const handleTabChange = (tabId, tabLabel) => {
    fetchData(tabLabel)
    setActiveTab(tabId)
  }

  async function handleRunCode() {
    setIsRunning("run")
    try {
      const result = await runCode(apiCall, id, currentCode, language, customTestCase)
      if (result.status) {
        setResults(result.data)
        setShowResult(true)
        setIsResultActive(true)
        setActiveResult("0")
      } else {
        setShowResult(true)
        setIsResultActive(true)
        setResults({
          details	: result?.data?.details,
          error: true,
          message: result?.data?.message,
          testCaseValue: result?.data?.testCaseValue
        })
        toast.error("Run code error", {
          description: result.data.message
        })
      }
    } finally {
      setIsRunning("")
    }
  }

  async function handleSubmitCode() {
    setIsRunning("submit")
    try {
      const result = await submitCode(apiCall, id, currentCode, language)
      if (result.status) {
        setSubmitted(result.data)
        setShowSubmitted(true)
        setIsSubmittedActive(true)
        fetchProblemSubmission(true)
      } else {
        toast.error("Submit code error", {
          description: result.data.message
        })
      }
    } finally {
      setIsRunning("")
    }
  }

  return (
    <div>
      {isEditMode && <ShareSolution solution={currentSolution} setIsEditMode={setIsEditMode} />}

      {!isEditMode &&
        <div className="h-screen flex flex-col">
          <ProblemHeader
            onRun={handleRunCode}
            onSubmit={handleSubmitCode}
            isRunning={isRunning}
          />

          <div className="flex-1 p-2 bg-bg-primary/50">
            <PanelGroup direction="horizontal" onLayout={(sizes) => setLeftSize(sizes[0])}>
              {/* Left Panel */}
              <Panel className="min-w-[40px] overflow-auto bg-background rounded-md" defaultSize={50}>
                <div ref={leftPanelRef} className="h-full overflow-hidden">
                  <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[40px]" : "")}>
                    <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} isCompact={isCompactLeft} />
                    {!isAuthenticated &&
                      <div className="bg-blue-100/10 p-3 rounded border border-blue-100/20 flex items-center justify-center">
                        <div className="flex items-center justify-center h-full text-sm font-medium text-gray-500">
                          Please{" "}
                          <Link to="/login" className="text-blue-500 hover:text-blue-600 mx-1" state={{ redirectPath: location.pathname }}>
                            login
                          </Link>{" "}
                          to run or submit code
                        </div>
                      </div>
                    }
                    <LeftPanelContent
                      id={id}
                      problemId={problemId}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      isCompact={isCompactLeft}
                      description={description}
                      setDescription={setDescription}
                      editorial={editorial}
                      solutions={solutions}
                      setSolutions={setSolutions}
                      submissions={submissions}
                      selectedSubmissionId={selectedSubmissionId}
                      setSelectedSubmissionId={setSelectedSubmissionId}
                      onchangeFilterSolutions={onchangeFilterSolutions}
                      showSolution={showSolution}
                      setShowSolution={setShowSolution}
                      currentSolutionId={currentSolutionId}
                      setCurrentSolutionId={setCurrentSolutionId}
                      setIsEditMode={setIsEditMode}
                      setCurrentSolution={setCurrentSolution}
                      isLoadingDescription={isLoadingDescription}
                      isLoadingEditorial={isLoadingEditorial}
                      isLoadingSolutions={isLoadingSolutions}
                      isLoadingSubmission={isLoadingSubmission}
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
                      isSubmittedActive={isSubmittedActive}
                      setIsSubmittedActive={setIsSubmittedActive}
                      isCompact={isCompactRight}
                      code={code}
                      currentCode={currentCode}
                      staticCode={importLib}
                      onCodeChange={handleCodeChange}
                      submitted={submitted}
                      setSubmitted={setSubmitted}
                      showSubmitted={showSubmitted}
                      setShowSubmitted={setShowSubmitted}
                      onLanguageChange={onLanguageChange}
                      language={language}
                      availableLanguages={availableLanguages}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      selectedSubmissionId={selectedSubmissionId}
                      problemLink={id}
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
                      customTestCases={customTestCase}
                      setCustomTestCases={setCustomTestCase}
                    />
                  </Panel>
                </PanelGroup>
              </Panel>

            </PanelGroup>
          </div>
        </div >
      }
    </div>
  )
}