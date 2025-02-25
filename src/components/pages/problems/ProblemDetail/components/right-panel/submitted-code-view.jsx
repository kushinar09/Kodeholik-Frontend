"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, Copy, RotateCcw } from "lucide-react"
import { formatValue, copyToClipboard } from "@/lib/utils/format-utils"
import hljs from "highlight.js"

/**
 * Component to display submitted code and results
 * @param {Object} props - Component props
 * @param {Object} props.submitted - Submission results
 * @param {string} props.code - Submitted code
 */
export default function SubmittedCodeView({ submitted, code }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      if (!(block.hasAttribute("data-highlighted") && block.getAttribute("data-highlighted") == "yes"))
        hljs.highlightBlock(block)
    })
  }, [])

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {submitted && submitted.status !== "Failed" && (
            <div>
              <span className="text-lg text-text-success">Accepted</span>
            </div>
          )}
          {submitted && submitted.status && submitted.status !== "Success" && (
            <div>
              <span className="text-lg text-text-error">{submitted.status}</span>
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

      {submitted.status !== "Failed" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {submitted.executionTime ? submitted.executionTime : "N/A"} ms
                  </div>
                  <div className="text-sm text-muted-foreground">Runtime</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold">{submitted.memoryUsage ? submitted.memoryUsage : "N/A"} mb</div>
                  <div className="text-sm text-muted-foreground">Memory</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
          <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "h-auto" : "max-h-[230px]")}>
            <pre className="text-sm">
              <code>{code}</code>
            </pre>
          </div>
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

