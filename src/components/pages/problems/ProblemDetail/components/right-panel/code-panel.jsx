"use client"

import { cn } from "@/lib/utils"
import CodeEditor from "@/components/common/editor-code/CodeEditor"
import SubmittedCodeView from "./submitted-code-view"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { getSubmissionDetail } from "@/lib/api/problem_api"
import { useAuth } from "@/providers/AuthProvider"

export default function CodePanel({
  isSubmittedActive,
  setIsSubmittedActive,
  isCompact,
  code,
  currentCode,
  staticCode,
  onCodeChange,
  submitted,
  setSubmitted,
  showSubmitted,
  setShowSubmitted,
  activeTab,
  setActiveTab,
  selectedSubmissionId,
  problemLink,
  language = "",
  onLanguageChange,
  availableLanguages = []
}) {
  const [selectedLanguage, setSelectedLanguage] = useState(language)

  const { apiCall } = useAuth()

  useEffect(() => {
    setSelectedLanguage(language)
  }, [language])

  const fetchSubmissionDetail = async (submissionId) => {
    try {
      const response = await getSubmissionDetail(apiCall, submissionId)
      setSubmitted(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (activeTab == "Submissions") {
      if (selectedSubmissionId != null) {
        fetchSubmissionDetail(selectedSubmissionId)
        setIsSubmittedActive(true)
        setShowSubmitted(true)
      }
    }
    else {
      setIsSubmittedActive(false)
      setShowSubmitted(false)
    }
  }, [selectedSubmissionId, activeTab])

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value)
    if (onLanguageChange) {
      onLanguageChange(value)
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <div
        className={cn(
          "bg-bg-card flex items-center p-1 relative overflow-auto no-scrollbar",
          isCompact ? "flex-col h-full space-y-4" : "flex-row space-x-4 h-[40px]"
        )}
      >
        <div
          onClick={() => setIsSubmittedActive(false)}
          className={cn(
            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
            isCompact ? "flex-col w-full" : "flex-row justify-start h-[32px]",
            !isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
          )}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <span
            className={cn(
              "text-sm transition-all duration-200 subpixel-antialiased",
              isCompact ? "writing-mode-vertical" : ""
            )}
          >
            Code
          </span>
        </div>
        {showSubmitted && (
          <div
            onClick={() => setIsSubmittedActive(true)}
            className={cn(
              "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
              isCompact ? "flex-col w-full mt-4" : "ms-4 flex-row justify-start h-[32px]",
              isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10"
            )}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {" "}
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /> <rect x="7" y="7" width="3" height="9" />{" "}
              <rect x="14" y="7" width="3" height="5" />
            </svg>
            <span
              className={cn(
                "text-sm transition-all duration-200 subpixel-antialiased",
                isCompact ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden"
              )}
            >
              Submitted
            </span>
          </div>
        )}
      </div>
      <div className={cn("overflow-hidden flex-1", isCompact ? "justify-center hidden" : "")}>
        <div className="min-w-[420px] h-full flex flex-col">
          {!isSubmittedActive && code && (
            <>
              <div className={cn("m-1", isCompact ? "w-full mt-4" : "flex-shrink-0")}>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger
                    className={cn("h-8 w-full border-bg-card focus:ring-none", isCompact ? "w-full" : "w-[100px]")}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CodeEditor className="flex-1" staticCode={staticCode} initialCode={currentCode || code || ""} onChange={onCodeChange} language={selectedLanguage} />
            </>
          )}
          {isSubmittedActive && submitted && activeTab != "Submissions" && <SubmittedCodeView submitted={submitted} code={code} setActiveTab={setActiveTab} problemLink={problemLink} selectedSubmissionId={selectedSubmissionId}/>}
          {isSubmittedActive && activeTab == "Submissions" && submitted && <SubmittedCodeView submitted={submitted} code={submitted.code} setActiveTab={setActiveTab} problemLink={problemLink} selectedSubmissionId={selectedSubmissionId}/>}
        </div>
      </div>
    </div>
  )
}


