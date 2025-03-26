"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, Clock, Copy, Cpu, Info, RotateCcw, Sparkles, TrendingUp } from "lucide-react"
import { formatValue, copyToClipboard } from "@/lib/utils/format-utils"
import hljs from "highlight.js"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom"
import { CodeHighlighter } from "@/components/common/editor-code/code-highlighter"

/**
 * Component to display submitted code and results
 * @param {Object} props - Component props
 * @param {Object} props.submitted - Submission results
 * @param {string} props.code - Submitted code
 */
export default function SubmittedCodeView({ submitted, code, setActiveTab, problemLink, selectedSubmissionId }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate();

  // useEffect(() => {
  //   document.querySelectorAll("pre code").forEach((block) => {
  //     if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
  //       hljs.highlightElement(block)
  //   })
  // }, [])

  useEffect(() => {
    setCopied(false)
  }, [])

  const handleCopyClipBoard = async () => {
    const success = await copyToClipboard(code)
    setCopied(success)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Status Bar */}
      <div className="flex justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {submitted && submitted.status && submitted.status.toLowerCase() === "success" && (
              <div>
                <span className="text-lg text-text-success font-bold">Accepted</span>
              </div>
            )}
            {submitted && submitted.status && submitted.status.toLowerCase() === "failed" && (
              <div>
                <span className="text-lg text-text-error font-bold">Failed</span>
              </div>
            )}
            {submitted.noTestcase != null && submitted.noSuccessTestcase != null && (
              <span className="text-sm text-gray-500">
                {submitted.noSuccessTestcase}/{submitted.noTestcase} testcases passed
              </span>
            )}
            {submitted.noTestcase != null && submitted.noSuccessTestcase == null && (
              <span className="text-sm text-gray-500">
                {submitted.noTestcase}/{submitted.noTestcase} testcases passed
              </span>
            )}
          </div>
        </div>
        <div className="flex">
          {submitted && submitted.status && submitted.status.toLowerCase() === "failed" && (
            <div>
              <Button
                onClick={() => setActiveTab("Editorial")}
                className="h-12 font-bold bg-gray-200 hover:bg-gray-300"
              >
                <svg
                  className="!h-6 !w-6 text-black mr-1"
                  focusable="false"
                  data-prefix="far"
                  data-icon="book-open"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                >
                  <path
                    fill="currentColor"
                    d="M156 32C100.6 32 48.8 46.6 27.1 53.6C10.3 59 0 74.5 0 91.1V403.5c0 26.1 24 44.2 48 40.2c19.8-3.3 54.8-7.7 100-7.7c54 0 97.5 25.5 112.5 35.6c7.5 5 16.8 8.4 27 8.4c11.5 0 21.6-4.2 29.3-9.9C330.2 460.3 369.1 436 428 436c47.7 0 80.5 4 99 7.2c23.9 4.1 49-13.8 49-40.6V91.1c0-16.5-10.3-32.1-27.1-37.5C527.2 46.6 475.4 32 420 32c-36.8 0-71.8 6.4-97.4 12.7c-12.8 3.2-23.5 6.3-30.9 8.7c-1.3 .4-2.6 .8-3.7 1.2c-1.1-.4-2.4-.8-3.7-1.2c-7.5-2.4-18.1-5.5-30.9-8.7C227.8 38.4 192.8 32 156 32zM264 97.3V417.9C238 404.2 196.8 388 148 388c-42.9 0-77.4 3.7-100 7.1V97.3C70.3 90.6 112.4 80 156 80c31.6 0 62.6 5.6 85.9 11.3c8.6 2.1 16.1 4.2 22.1 6zm48 319.2V97.3c6-1.8 13.5-3.9 22.1-6C357.4 85.6 388.4 80 420 80c43.6 0 85.7 10.6 108 17.3V394.7c-21.7-3.3-54.9-6.7-100-6.7c-51.4 0-90.8 15-116 28.6z"
                  >
                  </path>
                </svg>
                Editorial
              </Button>
            </div>
          )}
          {submitted && submitted.status && submitted.status.toLowerCase() === "success" && (
            <div>
              <Button onClick={() => navigate("/share-solution/" + problemLink + "/" + selectedSubmissionId)} className="h-12 font-bold ml-4 hover:bg-green-400">
                <svg
                  className="!h-6 !w-6 text-black mr-1"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />{" "}
                  <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />{" "}
                  <line x1="16" y1="5" x2="19" y2="8" />
                </svg>
                Solution
              </Button>
            </div>
          )}
        </div>
      </div>
      {submitted.status && submitted.status.toLowerCase() === "success" && (
        <TooltipProvider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="relative bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-700" />
                    <span className="font-medium text-gray-700">Runtime</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button>
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-80 p-4 text-sm bg-white text-black" side="bottom">
                      <p>
                        The time taken to execute the submitted code in milliseconds.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold">{submitted.executionTime}</span>
                  <span className="text-gray-500 text-sm">ms</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-gray-700" />
                    <span className="font-medium text-gray-700">Memory</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button>
                        <Info className="h-4 w-4 text-gray-400" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-100 p-4 text-sm bg-white text-black" side="bottom">
                      <p>The amount of memory consumed by the execution process in megabytes.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{submitted.memoryUsage}</span>
                  <span className="text-gray-500 text-sm">mb</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>
      )}

      {submitted.status !== "Success" && submitted.message && (
        <div className="rounded-lg border-t border-red-200 bg-red-50 p-4">
          <pre className="text-sm text-red-600 break-words whitespace-pre-wrap">{submitted.message}</pre>
        </div>
      )}

      {submitted.inputWrong && (
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
            <div
              className={`rounded bg-input-bg text-input-text p-2 ${submitted.inputWrong.status === "Failed" ? "text-text-error" : "text-text-success"}`}
            >
              {formatValue(submitted.inputWrong.actualOutput)}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-black">Expected Output =</Label>
            <div className="rounded bg-input-bg text-input-text p-2">
              {formatValue(submitted.inputWrong.expectedOutput)}
            </div>
          </div>
        </div>
      )}

      {/* Code Display */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border p-4 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Code</span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm">{submitted.languageName}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={handleCopyClipBoard}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {/* <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "h-auto" : "max-h-[230px]")}>
            <pre className="text-sm">
              <code>{code}</code>
            </pre>
          </div> */}
          <CodeHighlighter
            className={cn("overflow-hidden transition-all duration-300", isExpanded ? "h-auto" : "max-h-[230px]")}
            code={code}
            language={submitted.languageName}
          />
          {code && code.split("\n").length > 10 && (
            <div className="border-t border-border p-2 text-center">
              <Button
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "View less" : "View more"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

