"use client"

import { useAuth } from "@/providers/AuthProvider"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import { Button } from "@/components/ui/button"
import { CodeHighlighter } from "@/components/common/editor-code/code-highlighter"
import { copyToClipboard } from "@/lib/utils/format-utils"
import { useEffect, useState } from "react"
import { Check, Copy, RotateCcw } from "lucide-react"

export default function ProblemEditorial({ editorial, isLoadingEditorial }) {
  const { isAuthenticated } = useAuth()
  const [copied, setCopied] = useState(false)
  const [currentCode, setCurrentCode] = useState("")

  useEffect(() => {
    setCurrentCode(editorial?.solutionCodes[0]?.solutionCode)
  }, [editorial])

  const handleCopyClipBoard = async () => {
    const success = await copyToClipboard(currentCode)
    setCopied(success)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-gray-500 flex items-center gap-2 justify-center mt-10">
          <svg
            className="h-8 w-8"
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
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M8 11v-4a4 4 0 0 1 8 0v4" />
          </svg>
          Please login to view this content
        </div>
        <Button className="mt-2 w-fit" variant="outline" onClick={() => (window.location.href = "/login")}>
          Sign In
        </Button>
      </div>
    )
  }

  return isLoadingEditorial ? (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>

      {/* Skills/tags skeleton */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
      </div>

      {/* Editorial content skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Solution code skeleton */}
      <div className="mt-6">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-3"></div>
        <div className="border rounded-lg overflow-hidden">
          {/* Language tabs skeleton */}
          <div className="flex border-b p-2 gap-2">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>

          {/* Code block skeleton */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <>
      {editorial ? (
        <>
          <h2 className="text-xl font-bold mb-4">{editorial.editorialTitle}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 text-xs font-medium bg-bg-card text-primary rounded-full">Editorial</span>
            {editorial.editorialSkills?.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-100"
              >
                {skill}
              </span>
            ))}
          </div>
          <div>
            <RenderMarkdown content={editorial.editorialTextSolution} />
          </div>
          {editorial.solutionCodes && editorial.solutionCodes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Solution Code</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="flex border-b justify-between">
                  <div>
                    {editorial.solutionCodes.map((solution, index) => (
                      <button
                        key={index}
                        className={`px-4 py-2 text-sm font-medium text-gray-500 ${index == 0 ? "bg-gray-100 dark:bg-gray-800 font-semibold text-gray-800" : ""}`}
                        onClick={(e) => {
                          // Set all tabs to inactive
                          e.currentTarget.parentElement
                            .querySelectorAll("button")
                            .forEach((btn) =>
                              btn.classList.remove("bg-gray-100", "dark:bg-gray-800", "font-semibold", "text-gray-800")
                            )
                          // Set clicked tab to active
                          e.currentTarget.classList.add(
                            "bg-gray-100",
                            "dark:bg-gray-800",
                            "font-semibold",
                            "text-gray-800"
                          )

                          // Hide all code blocks
                          const codeBlocks = e.currentTarget.closest(".border").querySelectorAll(".code-block")
                          codeBlocks.forEach((block) => block.classList.add("hidden"))

                          // Show selected code block
                          codeBlocks[index].classList.remove("hidden")

                          setCurrentCode(solution.solutionCode)
                        }}
                      >
                        {solution.solutionLanguage}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleCopyClipBoard}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {editorial.solutionCodes.map((solution, index) => (
                  <div
                    key={index}
                    className={`code-block dark:bg-gray-900 overflow-auto ${index === 0 ? "" : "hidden"}`}
                  >
                    <CodeHighlighter code={solution.solutionCode} language={solution.solutionLanguage} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-gray-500">Editorial not found</div>
      )}
    </>
  )
}

