"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import "highlight.js/styles/default.css"

import "./styles.css"

// API imports
import { getProblemDescription, getProblemEditorial, getProblemInitCode, getProblemSolutions, getProblemSubmission } from "@/lib/api/problem_api"
import { runCode, submitCode } from "@/lib/api/code_api"

// Component imports
import ProblemHeader from "./components/problem-header-option"
import TabNavigation from "./components/left-panel/tab-navigation"
import LeftPanelContent from "./components/left-panel/left-panel-content"
import CodePanel from "./components/right-panel/code-panel"
import TestCasePanel from "./components/right-panel/test-case-panel"
import { useAuth } from "@/providers/AuthProvider"
import { mockEditorial, mockSolutions, mockSubmissions } from "./fake-data"
import { leftTabEnum } from "./data/data"
import { debounce } from "lodash"
import SubmissionDetail from "./components/right-panel/submission-detail"

export default function ProblemDetail() {
  const { id } = useParams()
  const { apiCall } = useAuth()

  const [problemId, setProblemId] = useState(0)

  const [openedTabEditorial, setOpenedTabEditorial] = useState(false)
  const [openedTabSolution, setOpenedTabSolution] = useState(false)

  // Panel state
  const [leftSize, setLeftSize] = useState(50)
  const [leftWidth, setLeftWidth] = useState(0)
  const leftPanelRef = useRef(null)
  const [isCompactRight, setIsCompactRight] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState(leftTabEnum.description)

  // Problem data state
  const [description, setDescription] = useState(null)
  const [editorial, setEditorial] = useState(null)
  const [solutions, setSolutions] = useState(null)
  const [submissions, setSubmissions] = useState(null)

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

  // Submission state
  const [submitted, setSubmitted] = useState()
  const [showSubmitted, setShowSubmitted] = useState(false)
  const [isSubmittedActive, setIsSubmittedActive] = useState(false)

  // Submission id
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    console.log(selectedSubmissionId);
  }, [selectedSubmissionId])

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
      const result = await getProblemDescription(apiCall, id)
      if (result.status && result.data) {
        setDescription(result.data)
        setProblemId(result.data.id)
      }
    }
  }

  const fetchProblemEditorial = async () => {
    if (!id) return
    if (!editorial) {
      const result = await getProblemEditorial(apiCall, id)
      if (result.status && result.data) {
        setEditorial(result.data)
      }
    }
    // const eds = mockEditorial.editorialDtos[0]
    // setEditorial(eds)
  }

  const fetchProblemSolutions = useCallback(
    debounce(async (
      page = 0,
      size = 10,
      title = null,
      languageName = null,
      sortBy = null,
      ascending = null,
      topics = []
    ) => {
      if (!id) return
      if (!solutions || page != null) {
        const result = await getProblemSolutions(apiCall, id, page, size, title, languageName, sortBy, ascending, topics)
        if (result.status) {
          setSolutions(result.data)
        }
      }
    }, 500), // Debounce 500ms
    []
  )

  // const fetchProblemSolutions = async (
  //   page = 0,
  //   size = 10,
  //   title = null,
  //   languageName = null,
  //   sortBy = null,
  //   ascending = null,
  //   topics = []
  // ) => {
  //   if (!id) return
  //   if (!solutions || page != null) {
  //     const result = await getProblemSolutions(apiCall, id, page, size, title, languageName, sortBy, ascending, topics)
  //     if (result.status && result.data) {
  //       setSolutions(result.data)
  //     }
  //   }
  //   // const sos = mockSolutions
  //   // setSolutions(sos)
  // }

  const fetchProblemSubmission = async () => {
    if (!id) return
    if (!submissions) {
      const result = await getProblemSubmission(apiCall, id)
      if (result.status && result.data) {
        setSubmissions(result.data)
        setSelectedSubmissionId(result.data[0].id);
      }
    }
    //   const sus = mockSubmissions
    //   setSubmissions(sus)
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

  const handleTabChange = (tabId, tabLabel) => {
    console.log(tabLabel);
    fetchData(tabLabel)
    setActiveTab(tabId)
  }

  async function handleRunCode() {
    const result = await runCode(apiCall, id, code, "Java")
    setResults(result)
    setShowResult(true)
    setIsResultActive(true)
    setActiveResult("0")
  }

  async function handleSubmitCode() {
    const result = await submitCode(apiCall, id, code, "Java")
    setSubmitted(result)
    setShowSubmitted(true)
    setIsSubmittedActive(true)
  }

  return (
    <div className="h-screen flex flex-col">
      <ProblemHeader onRun={handleRunCode} onSubmit={handleSubmitCode} />

      <div className="flex-1 p-2 bg-bg-primary/50">
        <PanelGroup direction="horizontal" onLayout={(sizes) => setLeftSize(sizes[0])}>
          {/* Left Panel */}
          <Panel className="min-w-[40px] overflow-auto bg-background rounded-md" defaultSize={50}>
            <div ref={leftPanelRef} className="h-full overflow-hidden">
              <div className={cn("h-full flex flex-col transition-all duration-200", isCompactLeft ? "w-[40px]" : "")}>
                <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} isCompact={isCompactLeft} />

                <LeftPanelContent
                  id={id}
                  problemId={problemId}
                  activeTab={activeTab}
                  isCompact={isCompactLeft}
                  description={description}
                  setDescription={setDescription}
                  editorial={editorial}
                  solutions={solutions}
                  submissions={submissions}
                  selectedSubmissionId={selectedSubmissionId}
                  setSelectedSubmissionId={setSelectedSubmissionId}
                  onchangeFilterSolutions={onchangeFilterSolutions}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="splitter splitter_vert relative w-1.5 transition-colors" />

          {/* Right Panel Group */}
          <Panel className="min-w-[40px] overflow-auto">
            <PanelGroup direction="vertical">
              {/* Right Top Panel - Code Editor */}
              {activeTab != 'Submissions' &&
                <Panel className="min-h-[40px] rounded-md overflow-hidden">
                  <CodePanel
                    isSubmittedActive={isSubmittedActive}
                    setIsSubmittedActive={setIsSubmittedActive}
                    isCompact={isCompactRight}
                    code={code}
                    onCodeChange={handleCodeChange}
                    submitted={submitted}
                    showSubmitted={showSubmitted}
                  />
                </Panel>}

              {activeTab == 'Submissions' &&
                <Panel className="min-h-[40px] rounded-md overflow-hidden">
                  <SubmissionDetail activeTab={activeTab} setActiveTab={setActiveTab} isCompact={isCompactRight} id={selectedSubmissionId} />
                </Panel>}

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
      </div >
    </div >
  )
}

