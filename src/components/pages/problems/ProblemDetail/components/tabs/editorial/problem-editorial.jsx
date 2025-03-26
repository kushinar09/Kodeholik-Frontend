"use client"

import { useAuth } from "@/providers/AuthProvider"

import hljs from "highlight.js"
import "highlight.js/styles/default.css"
import { useEffect, useState } from "react"
import RenderMarkdown from "@/components/common/markdown/RenderMarkdown"
import { Button } from "@/components/ui/button"
import { CodeHighlighter } from "@/components/common/editor-code/code-highlighter"
/**
 * Component to display problem editorial
 * @param {Object} props - Component props
 * @param {Object} props.editorial - Editorial data
 */
export default function ProblemEditorial({ editorial }) {
  // useEffect(() => {
  //   document.querySelectorAll("pre code").forEach((block) => {
  //     if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
  //       hljs.highlightElement(block)
  //   })
  // }, [editorial])

  const { isAuthenticated } = useAuth()

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
        <Button className="mt-2 w-fit" variant="outline" onClick={() => window.location.href = "/login"}>
          Sign In
        </Button>
      </div>
    )
  }

  return (
    <>
      {editorial ? (
        <>
          <h2 className="text-xl font-bold mb-4">{editorial.editorialTitle}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="px-2 py-1 text-xs font-medium bg-bg-card text-primary rounded-full"
            >
              Editorial
            </span>
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
                <div className="flex border-b">
                  {editorial.solutionCodes.map((solution, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 text-sm font-medium text-gray-500 ${index == 0 ? "bg-gray-100 dark:bg-gray-800 font-semibold text-gray-800" : ""}`}
                      onClick={(e) => {
                        // Set all tabs to inactive
                        e.currentTarget.parentElement
                          .querySelectorAll("button")
                          .forEach((btn) => btn.classList.remove("bg-gray-100", "dark:bg-gray-800", "font-semibold", "text-gray-800"))
                        // Set clicked tab to active
                        e.currentTarget.classList.add("bg-gray-100", "dark:bg-gray-800", "font-semibold", "text-gray-800")

                        // Hide all code blocks
                        const codeBlocks = e.currentTarget.closest(".border").querySelectorAll(".code-block")
                        codeBlocks.forEach((block) => block.classList.add("hidden"))

                        // Show selected code block
                        codeBlocks[index].classList.remove("hidden")
                      }}
                    >
                      {solution.solutionLanguage}
                    </button>
                  ))}
                </div>
                {editorial.solutionCodes.map((solution, index) => (
                  <div
                    key={index}
                    className={`code-block dark:bg-gray-900 overflow-auto ${index === 0 ? "" : "hidden"}`}
                  >
                    {/* <pre className="text-sm">
                      <code className="font-code">{solution.solutionCode}</code>
                    </pre> */}
                    <CodeHighlighter code={solution.solutionCode} language={solution.solutionLanguage.toLowerCase()} />
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

