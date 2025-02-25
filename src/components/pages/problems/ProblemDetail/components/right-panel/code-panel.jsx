"use client"

import { cn } from "@/lib/utils"
import CodeEditor from "@/components/common/editor-code/CodeEditor"
import SubmittedCodeView from "./submitted-code-view"

/**
 * Panel for code editing and submission view
 * @param {Object} props - Component props
 * @param {boolean} props.isSubmittedActive - Whether submission view is active
 * @param {Function} props.setIsSubmittedActive - Function to toggle submission view
 * @param {boolean} props.isCompact - Whether the panel is in compact mode
 * @param {string} props.code - Current code
 * @param {Function} props.onCodeChange - Code change handler
 * @param {Object} props.submitted - Submission results
 * @param {boolean} props.showSubmitted - Whether to show submission results
 */
export default function CodePanel({
  isSubmittedActive,
  setIsSubmittedActive,
  isCompact,
  code,
  onCodeChange,
  submitted,
  showSubmitted,
}) {
  return (
    <div className="h-full bg-background flex flex-col">
      <div
        className={cn(
          "bg-bg-card flex items-center p-1 relative h-[40px] overflow-auto no-scrollbar",
          isCompact ? "flex-col h-full space-y-4" : "flex-row space-x-4",
        )}
      >
        <div
          onClick={() => setIsSubmittedActive(false)}
          className={cn(
            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200",
            isCompact ? "flex-col w-full" : "flex-row justify-start h-[32px]",
            !isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10",
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
              isCompact ? "writing-mode-vertical" : "",
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
              isSubmittedActive ? "bg-primary text-black" : "text-primary/50 hover:text-primary hover:bg-primary/10",
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
                isCompact ? "writing-mode-vertical" : "whitespace-nowrap overflow-hidden",
              )}
            >
              Submitted
            </span>
          </div>
        )}
      </div>
      <div className={cn("overflow-auto flex-1", isCompact ? "flex justify-center hidden" : "")}>
        <div className="min-w-[420px] h-full">
          {!isSubmittedActive && code && <CodeEditor initialCode={code} onChange={onCodeChange} />}
          {isSubmittedActive && submitted && <SubmittedCodeView submitted={submitted} code={code} />}
        </div>
      </div>
    </div>
  )
}

